import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Share {
  id: string;
  share_token: string;
  created_at: string;
  view_count: number;
}

interface RevokeShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  share: Share;
  onConfirm: () => Promise<void>;
}

export default function RevokeShareModal({ isOpen, onClose, share, onConfirm }: RevokeShareModalProps) {
  const [notifyMe, setNotifyMe] = useState(true);
  const [revoking, setRevoking] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setRevoking(true);
    try {
      await onConfirm();
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Revoke Share Access?</h2>
              <p className="text-gray-600 text-sm">
                This will immediately invalidate the QR code and link. The recipient will no longer be able to view your results.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Share ID:</span>
              <span className="text-sm font-mono font-medium text-gray-900">
                #{share.share_token.slice(0, 8)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created:</span>
              <span className="text-sm font-medium text-gray-900">{formatDate(share.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Viewed:</span>
              <span className="text-sm font-medium text-gray-900">{share.view_count} times</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Will be revoked:</span>
              <span className="text-sm font-semibold text-red-600">Immediately</span>
            </div>
          </div>

          <label className="flex items-start space-x-3 mb-6 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyMe}
              onChange={(e) => setNotifyMe(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Send notification to me when revoked
            </span>
          </label>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={revoking}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={revoking}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {revoking ? 'Revoking...' : 'Yes, Revoke Access'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
