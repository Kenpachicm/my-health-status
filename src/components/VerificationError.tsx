import { XCircle, AlertCircle, Clock } from 'lucide-react';

interface VerificationErrorProps {
  error: string;
  errorType: 'invalid' | 'expired' | 'not_found' | 'rate_limit' | 'access_denied';
  onReset: () => void;
}

export default function VerificationError({ error, errorType, onReset }: VerificationErrorProps) {
  const getIcon = () => {
    switch (errorType) {
      case 'expired':
        return <AlertCircle className="text-orange-600" size={48} />;
      case 'rate_limit':
        return <Clock className="text-yellow-600" size={48} />;
      default:
        return <XCircle className="text-red-600" size={48} />;
    }
  };

  const getHeading = () => {
    switch (errorType) {
      case 'expired':
        return 'Share Has Expired';
      case 'not_found':
        return 'Member ID Not Found';
      case 'rate_limit':
        return 'Too Many Attempts';
      case 'access_denied':
        return 'Access Denied';
      default:
        return 'Verification Failed';
    }
  };

  const getReasons = () => {
    switch (errorType) {
      case 'invalid':
        return [
          'Link has expired',
          'Share was revoked by owner',
          'Invalid token format',
          'Link has been used (if one-time)',
        ];
      case 'not_found':
        return [
          'Member ID was entered incorrectly',
          'Member ID does not exist in the system',
          'Member account has been deactivated',
        ];
      case 'rate_limit':
        return [
          'Too many verification attempts from your device',
          'This helps prevent unauthorized access attempts',
        ];
      default:
        return [];
    }
  };

  const getSuggestions = () => {
    switch (errorType) {
      case 'invalid':
        return [
          'Check the link for typos',
          'Ask the result owner to create a new share',
          'Try verifying using their Member ID instead',
        ];
      case 'expired':
        return [
          'Ask the result owner to create a new share',
          'Shares have limited validity for security',
        ];
      case 'not_found':
        return [
          'Check that you entered the Member ID correctly',
          'Member IDs are in format: MH-XXXXXX',
          'Contact the member to confirm their ID',
        ];
      case 'rate_limit':
        return [
          'Please wait 15 minutes before trying again',
          'This security measure protects member privacy',
        ];
      case 'access_denied':
        return [
          'Contact the result owner for assistance',
          'They may need to create a new share for you',
        ];
      default:
        return ['Please try again or contact support'];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="flex items-center space-x-2">
            <img src="/my_health.png" alt="MyHealthStatus" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">MyHealthStatus</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {getIcon()}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {getHeading()}
            </h1>
            <p className="text-lg text-gray-600">{error}</p>
          </div>

          {getReasons().length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Possible reasons:</h3>
              <ul className="space-y-2">
                {getReasons().map((reason, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-gray-400 mt-0.5">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {getSuggestions().length > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-blue-900 mb-3">What you can do:</h3>
              <ul className="space-y-2">
                {getSuggestions().map((suggestion, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-blue-800">
                    <span className="text-blue-600 mt-0.5">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={onReset}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              {errorType === 'rate_limit' ? 'Go to Homepage' : 'Try Again'}
            </button>

            {errorType === 'invalid' && (
              <button
                onClick={onReset}
                className="w-full px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Try Member ID Verification
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Learn more about MyHealthStatus verification
          </a>
        </div>
      </main>
    </div>
  );
}
