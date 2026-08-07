import { useState } from 'react';
import { Shield, Lock, Key, Smartphone } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import MFASetupModal from './MFASetupModal';
import ActiveSessions from './ActiveSessions';

interface SecuritySectionProps {
  user: any;
}

export default function SecuritySection({ user }: SecuritySectionProps) {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isMFAModalOpen, setIsMFAModalOpen] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  const getPasswordLastChanged = () => {
    return '30 days ago';
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Security</h2>
          <p className="text-gray-600">Manage your account security and authentication</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Lock className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Password</h3>
                <p className="text-sm text-gray-500">Last changed: {getPasswordLastChanged()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">Password:</span>
              <span className="text-gray-900 font-mono">••••••••••</span>
            </div>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Smartphone className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">
                  {mfaEnabled ? 'Your account is secured with MFA' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setMfaEnabled(!mfaEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  mfaEnabled ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    mfaEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {mfaEnabled ? (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                <Shield size={18} />
                <span className="text-sm font-medium">Your account is secured with MFA</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsMFAModalOpen(true)}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                >
                  Manage MFA
                </button>
                <button
                  onClick={() => setMfaEnabled(false)}
                  className="px-4 py-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Disable MFA
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 text-amber-700 bg-amber-50 px-4 py-3 rounded-lg">
                <Shield size={18} />
                <span className="text-sm font-medium">Your account is less secure without MFA</span>
              </div>
              <button
                onClick={() => setIsMFAModalOpen(true)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Enable Two-Factor Authentication
              </button>
            </div>
          )}
        </div>

        <ActiveSessions user={user} />
      </div>

      {isPasswordModalOpen && (
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          user={user}
        />
      )}

      {isMFAModalOpen && (
        <MFASetupModal
          isOpen={isMFAModalOpen}
          onClose={() => setIsMFAModalOpen(false)}
          mfaEnabled={mfaEnabled}
          onMFAEnabled={() => setMfaEnabled(true)}
        />
      )}
    </>
  );
}
