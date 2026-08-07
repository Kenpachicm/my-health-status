import { useState, useEffect } from 'react';
import { X, Copy, Download, Mail, MessageSquare, Check, Clock, Eye, Shield, Lock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
}

interface ViewShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  share: Share;
  memberId: string;
}

export default function ViewShareModal({ isOpen, onClose, share, memberId }: ViewShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [accessCodeVisible, setAccessCodeVisible] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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

      setTimeRemaining(`${hours}h ${minutes}m`);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [isOpen, share.expires_at]);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/verify/${share.share_token}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById('qr-code-svg') as any;
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx!.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `healthlink-share-${share.share_token}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const shareViaEmail = () => {
    const subject = 'MyHealthStatus Test Results';
    const body = `I'm sharing my test results with you via MyHealthStatus.\n\nView them here: ${shareUrl}${
      share.require_access_code ? `\n\nAccess Code: ${share.access_code}` : ''
    }\n\nThis link expires in ${timeRemaining}.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareViaSMS = () => {
    const message = `View my MyHealthStatus test results: ${shareUrl}${
      share.require_access_code ? ` (Code: ${share.access_code})` : ''
    }`;
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
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

  const now = new Date();
  const expiresAt = new Date(share.expires_at);
  const isExpired = expiresAt < now;
  const isRevoked = !share.is_active && !isExpired;

  const getStatusBadge = () => {
    if (isRevoked) {
      return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">Revoked</span>;
    }
    if (isExpired) {
      return <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">Expired</span>;
    }
    return <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">Active</span>;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">
              {share.share_type === 'qr_code' ? 'QR Code Share' : 'Secure Link Share'}
            </h2>
            {getStatusBadge()}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {share.share_type === 'qr_code' ? (
            <div className="flex flex-col items-center">
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-4">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={shareUrl}
                  size={300}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600 text-center mb-4">
                Scan this QR code to view the shared test results
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Share URL:</p>
              <div className="bg-white p-3 rounded border border-gray-300 font-mono text-sm break-all">
                {shareUrl}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {copied ? <Check size={20} /> : <Copy size={20} />}
              <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            </button>
            {share.share_type === 'qr_code' && (
              <button
                onClick={downloadQRCode}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                <Download size={20} />
                <span>Download QR</span>
              </button>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Share via:</p>
            <div className="flex gap-2">
              <button
                onClick={shareViaEmail}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Mail size={18} />
                <span>Email</span>
              </button>
              <button
                onClick={shareViaSMS}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <MessageSquare size={18} />
                <span>SMS</span>
              </button>
            </div>
          </div>

          {share.require_access_code && share.access_code && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Lock className="text-amber-600" size={20} />
                  <p className="text-sm font-medium text-amber-900">Access Code Required</p>
                </div>
                <button
                  onClick={() => setAccessCodeVisible(!accessCodeVisible)}
                  className="text-sm text-amber-700 hover:text-amber-800 font-medium"
                >
                  {accessCodeVisible ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="text-2xl font-bold text-amber-900 font-mono tracking-wider">
                {accessCodeVisible ? share.access_code : '••••••'}
              </div>
              <p className="text-xs text-amber-700 mt-2">
                The recipient will need this code to view the results
              </p>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Share Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(share.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <div>{getStatusBadge()}</div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Clock className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">
                    {isExpired ? 'Expired' : 'Expires in'}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                  {isExpired ? formatDate(share.expires_at) : timeRemaining}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Eye className="text-gray-400" size={16} />
                  <span className="text-sm text-gray-600">View count</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{share.view_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Last viewed</span>
                <span className="text-xs font-medium text-gray-700">{formatLastViewed()}</span>
              </div>
            </div>

            {(share.single_view_only || share.notify_on_access) && (
              <div className="pt-3 border-t border-gray-200 space-y-2">
                {share.single_view_only && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Shield className="text-purple-600" size={16} />
                    <span className="text-gray-700">One-time use only</span>
                  </div>
                )}
                {share.notify_on_access && (
                  <div className="flex items-center space-x-2 text-sm">
                    <MessageSquare className="text-blue-600" size={16} />
                    <span className="text-gray-700">Notifications enabled</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isExpired && !isRevoked && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
              >
                Revoke This Share
              </button>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
