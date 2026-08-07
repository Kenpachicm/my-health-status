import { useState } from 'react';
import { X, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function DeleteAccountModal({ isOpen, onClose, user }: DeleteAccountModalProps) {
  const [confirmations, setConfirmations] = useState({
    resultsDeleted: false,
    sharesRevoked: false,
    cannotUndo: false,
    dataDownloaded: false,
  });
  const [confirmText, setConfirmText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const allConfirmed = Object.values(confirmations).every(v => v);
  const canDelete = allConfirmed && confirmText === 'DELETE' && password.length > 0;

  const handleToggleConfirmation = (key: keyof typeof confirmations) => {
    setConfirmations({ ...confirmations, [key]: !confirmations[key] });
  };

  const handleDelete = async () => {
    if (!canDelete) return;

    setDeleting(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, user.email, password);

      const currentUser = auth.currentUser;
      if (currentUser) {
        await deleteDoc(doc(db, 'users', currentUser.uid));
        await deleteUser(currentUser);
      }

      window.location.href = '/';
    } catch (error: any) {
      console.error('Error deleting account:', error);
      const code = error?.code || '';
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/wrong-password' ||
        code === 'auth/invalid-login-credentials'
      ) {
        setError('Incorrect password. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-red-900">Delete Account</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-lg font-bold text-red-900 mb-2">Are you absolutely sure?</p>
            <p className="text-red-800">
              This will delete your account and all associated data. This action cannot be undone after 30 days.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-900 mb-3">You must acknowledge the following:</p>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmations.resultsDeleted}
                  onChange={() => handleToggleConfirmation('resultsDeleted')}
                  className="mt-0.5 w-5 h-5"
                />
                <span className="text-sm text-gray-900">
                  I understand my test results will be permanently deleted
                </span>
              </label>

              <label className="flex items-start space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmations.sharesRevoked}
                  onChange={() => handleToggleConfirmation('sharesRevoked')}
                  className="mt-0.5 w-5 h-5"
                />
                <span className="text-sm text-gray-900">
                  I understand all shares will be immediately revoked
                </span>
              </label>

              <label className="flex items-start space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmations.cannotUndo}
                  onChange={() => handleToggleConfirmation('cannotUndo')}
                  className="mt-0.5 w-5 h-5"
                />
                <span className="text-sm text-gray-900">
                  I understand this cannot be undone after 30 days
                </span>
              </label>

              <label className="flex items-start space-x-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmations.dataDownloaded}
                  onChange={() => handleToggleConfirmation('dataDownloaded')}
                  className="mt-0.5 w-5 h-5"
                />
                <span className="text-sm text-gray-900">
                  I have downloaded any data I want to keep
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Type "DELETE" to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="DELETE"
              className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono ${
                confirmText && confirmText !== 'DELETE' ? 'border-red-300' : 'border-gray-300'
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Enter your password to confirm
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Why are you leaving? (Optional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Select a reason</option>
              <option value="privacy">Privacy concerns</option>
              <option value="no-longer-needed">No longer needed</option>
              <option value="switching">Switching to another service</option>
              <option value="issues">App issues</option>
              <option value="other">Other</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <span className="font-semibold">Grace Period:</span> After deletion, you'll have 30 days to reactivate your account. After this period, all data will be permanently deleted and cannot be recovered.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={!canDelete || deleting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting Account...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
