import { useState, useEffect } from 'react';
import { QrCode, Link as LinkIcon, Eye, MoreVertical, Copy, Download, Mail, Ban, Trash2, FileText, Bell, Lock, Shield } from 'lucide-react';

interface Share {
  id: string;
  share_token: string;
  share_type: 'qr_code' | 'secure_link';
  expires_at: string;
  created_at: string;
  is_active: boolean;
  view_count: number;
  last_viewed_at: string | null;
  require_access_code: boolean;
  access_code: string | null;
  notify_on_access: boolean;
  single_view_only: boolean;
  personal_message: string | null;
  share_results: Array<{
    test_result_id: string;
  }>;
}

interface ShareCardProps {
  share: Share;
  onView: (share: Share) => void;
  onViewLogs: (share: Share) => void;
  onRevoke: (share: Share) => void;
}

export default function ShareCard({ share, onView, onViewLogs, onRevoke }: ShareCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expiresAt = new Date(share.expires_at);
      const diff = expiresAt.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours < 1) {
        setTimeRemaining(`${minutes}m remaining`);
      } else if (hours < 24) {
        setTimeRemaining(`${hours}h remaining`);
      } else {
        const days = Math.floor(hours / 24);
        setTimeRemaining(`${days}d remaining`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [share.expires_at]);

  const now = new Date();
  const expiresAt = new Date(share.expires_at);
  const isExpired = expiresAt < now;
  const isRevoked = !share.is_active && !isExpired;
  const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isExpiringSoon = hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;

  const getStatusBadge = () => {
    if (isRevoked) {
      return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Revoked</span>;
    }
    if (isExpired) {
      return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Expired</span>;
    }
    return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>;
  };

  const getShareTypeBadge = () => {
    if (share.share_type === 'qr_code') {
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
          <QrCode size={12} />
          <span>QR Code</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
        <LinkIcon size={12} />
        <span>Secure Link</span>
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatLastViewed = () => {
    if (!share.last_viewed_at) return 'Never';

    const now = new Date();
    const viewed = new Date(share.last_viewed_at);
    const diff = now.getTime() - viewed.getTime();

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    }
  };

  const copyShareUrl = () => {
    const url = `${window.location.origin}/verify/${share.share_token}`;
    navigator.clipboard.writeText(url);
    setMenuOpen(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          {getShareTypeBadge()}
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreVertical size={18} className="text-gray-600" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                    <button
                      onClick={() => {
                        onView(share);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      {share.share_type === 'qr_code' ? <QrCode size={16} /> : <LinkIcon size={16} />}
                      <span className="text-sm">View {share.share_type === 'qr_code' ? 'QR' : 'Link'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onViewLogs(share);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <FileText size={16} />
                      <span className="text-sm">View Access Logs</span>
                    </button>
                    <button
                      onClick={copyShareUrl}
                      className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <Copy size={16} />
                      <span className="text-sm">Copy Link</span>
                    </button>
                    {share.share_type === 'qr_code' && (
                      <button
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Download size={16} />
                        <span className="text-sm">Download QR</span>
                      </button>
                    )}
                    {!isExpired && !isRevoked && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => {
                            onRevoke(share);
                            setMenuOpen(false);
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 transition-colors text-left text-red-600"
                        >
                          <Ban size={16} />
                          <span className="text-sm">Revoke Share</span>
                        </button>
                      </>
                    )}
                    {(isExpired || isRevoked) && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => setMenuOpen(false)}
                          className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-red-50 transition-colors text-left text-red-600"
                        >
                          <Trash2 size={16} />
                          <span className="text-sm">Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 mb-1">Results Included</p>
            <div className="flex flex-wrap gap-1">
              {share.share_results.length <= 2 ? (
                <>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">HIV</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Chlamydia</span>
                </>
              ) : (
                <>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">HIV</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Chlamydia</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                    +{share.share_results.length - 2} more
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Created:</span>
              <span className="text-gray-900">{formatDate(share.created_at)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">
                {isExpired ? 'Expired:' : 'Expires:'}
              </span>
              <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                {isExpired ? formatDate(share.expires_at) : timeRemaining}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <Eye size={14} />
            <span>Viewed {share.view_count} times</span>
            {share.last_viewed_at && (
              <span className="text-gray-400">· Last: {formatLastViewed()}</span>
            )}
          </div>

          {(share.require_access_code || share.single_view_only || share.notify_on_access) && (
            <div className="flex flex-wrap gap-1 pt-2">
              {share.require_access_code && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded">
                  <Lock size={10} />
                  <span>Access Code</span>
                </span>
              )}
              {share.single_view_only && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                  <Shield size={10} />
                  <span>One-time</span>
                </span>
              )}
              {share.notify_on_access && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  <Bell size={10} />
                  <span>Alerts</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 flex gap-2">
        {!isExpired && !isRevoked ? (
          <>
            <button
              onClick={() => onView(share)}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View {share.share_type === 'qr_code' ? 'QR' : 'Link'}
            </button>
            <button
              onClick={() => onViewLogs(share)}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Logs
            </button>
            <button
              onClick={() => onRevoke(share)}
              className="px-3 py-2 bg-white border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
            >
              <Ban size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onViewLogs(share)}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Logs
            </button>
            <button
              disabled
              className="flex-1 px-3 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
            >
              {isExpired ? 'Expired' : 'Revoked'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
