import { CheckCircle, X, Mail, Clock, Shield, Key, ExternalLink } from 'lucide-react';

interface IncidentConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  ticketNumber: string;
  severity: 'critical' | 'moderate' | 'low';
  immediateActions: string[];
  userEmail: string;
  onChangePassword?: () => void;
}

const severityConfig = {
  critical: {
    responseTime: 'within 1 hour',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  moderate: {
    responseTime: 'within 24 hours',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
  },
  low: {
    responseTime: 'within 48 hours',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
};

const actionLabels: Record<string, string> = {
  lock_account: 'Account locked',
  revoke_shares: 'All shares revoked',
  end_sessions: 'All sessions ended',
  change_password: 'Password change required',
};

export default function IncidentConfirmation({
  isOpen,
  onClose,
  ticketNumber,
  severity,
  immediateActions,
  userEmail,
  onChangePassword,
}: IncidentConfirmationProps) {
  if (!isOpen) return null;

  const config = severityConfig[severity];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="bg-green-50 border-b border-green-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Submitted</h2>
              <p className="text-sm text-green-700">Your security report has been received</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className={`p-6 ${config.bgColor} border-2 ${config.borderColor} rounded-xl`}>
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">Your Ticket Number</p>
              <div className="inline-block px-6 py-3 bg-white rounded-lg border-2 border-gray-300">
                <span className="text-2xl font-bold text-gray-900 font-mono tracking-wider">
                  {ticketNumber}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock size={16} className={config.color} />
              <span className={`font-semibold ${config.color}`}>
                Expected response: {config.responseTime}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <Mail className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-blue-900 mb-1">Confirmation Email Sent</p>
                <p className="text-sm text-blue-700">
                  We've sent a confirmation email to <strong>{userEmail}</strong> with your ticket details and next steps.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <Shield className="text-gray-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-semibold text-gray-900 mb-2">What Happens Next?</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Our security team will review your report</li>
                  <li>• You'll receive updates via email</li>
                  <li>• We may contact you for additional information</li>
                  <li>• You can track your report status in your profile</li>
                </ul>
              </div>
            </div>

            {immediateActions.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="font-semibold text-green-900 mb-3">
                  ✓ Immediate Actions Taken
                </p>
                <div className="space-y-2">
                  {immediateActions.map((action) => (
                    <div key={action} className="flex items-center space-x-2 text-sm text-green-800">
                      <CheckCircle size={16} className="text-green-600" />
                      <span>{actionLabels[action] || action}</span>
                    </div>
                  ))}
                </div>
                {immediateActions.includes('change_password') && onChangePassword && (
                  <button
                    onClick={onChangePassword}
                    className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Key size={20} />
                    <span>Change Password Now</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-3">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="font-semibold text-gray-900 mb-2">Need Urgent Help?</p>
              <p className="text-sm text-gray-700 mb-3">
                If this is an emergency or you need immediate assistance, contact our security team directly:
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <a
                  href="mailto:security@myhealthstatus.org"
                  className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-center flex items-center justify-center space-x-2"
                >
                  <Mail size={18} />
                  <span>security@myhealthstatus.org</span>
                </a>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Return to Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
