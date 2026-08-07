import { X, Copy, Check, Building2 } from 'lucide-react';
import { useState } from 'react';

interface RequestResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
}

export default function RequestResultsModal({ isOpen, onClose, memberId }: RequestResultsModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const partneredClinics = [
    'City Medical Center',
    'St. Mary\'s Hospital',
    'HealthFirst Laboratory',
    'Metro Diagnostic Center',
    'Wellness Clinic Network',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">Request Results from Clinic</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="text-blue-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              Didn't receive your results yet?
            </h3>
            <p className="text-gray-600 text-center text-sm">
              Provide this Member ID to your clinic or lab and they'll upload your results directly to your account
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6 border border-blue-200">
            <p className="text-xs font-medium text-blue-700 mb-2 text-center">Your Member ID</p>
            <div className="flex items-center justify-center space-x-3">
              <span className="text-2xl font-bold text-blue-900 font-mono tracking-wider">
                {memberId}
              </span>
              <button
                onClick={handleCopyMemberId}
                className={`p-2.5 rounded-lg transition-all ${
                  copied
                    ? 'bg-green-500 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
                title={copied ? 'Copied!' : 'Copy Member ID'}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-700 text-center mt-2 font-medium">
                Copied to clipboard!
              </p>
            )}
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">How it works:</h4>
            <ol className="space-y-3">
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <p className="text-sm text-gray-600 pt-0.5">
                  Visit your clinic or lab for your test
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p className="text-sm text-gray-600 pt-0.5">
                  Provide your Member ID <span className="font-mono font-semibold text-blue-900">{memberId}</span> to the clinic staff
                </p>
              </li>
              <li className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <p className="text-sm text-gray-600 pt-0.5">
                  Your results will automatically appear in your dashboard
                </p>
              </li>
            </ol>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Partnered Clinics & Labs</h4>
            <div className="space-y-2">
              {partneredClinics.map((clinic, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Building2 size={18} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{clinic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              onClick={handleCopyMemberId}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Copy size={18} />
              <span>Copy Member ID</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
