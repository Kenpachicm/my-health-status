import { useState } from 'react';
import { X, Check, Smartphone, MessageSquare, Download, Printer, AlertCircle } from 'lucide-react';

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  mfaEnabled: boolean;
  onMFAEnabled: () => void;
}

export default function MFASetupModal({ isOpen, onClose, mfaEnabled, onMFAEnabled }: MFASetupModalProps) {
  const [step, setStep] = useState<'method' | 'setup' | 'verify' | 'backup' | 'success'>('method');
  const [method, setMethod] = useState<'app' | 'sms'>('app');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [backupCodes] = useState([
    '123456', '789012', '345678', '901234', '567890',
    '234567', '890123', '456789', '012345', '678901'
  ]);
  const [codesSaved, setCodesSaved] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerificationInput = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setStep('backup');
  };

  const handleDownloadCodes = () => {
    const content = `MyHealthStatus Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes (use each code only once):\n\n${backupCodes.join('\n')}\n\nKeep these codes in a safe place.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'healthlink-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintCodes = () => {
    window.print();
  };

  const handleFinish = () => {
    if (!codesSaved) {
      setError('Please confirm you have saved your backup codes');
      return;
    }
    onMFAEnabled();
    setStep('success');
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  const renderMethodSelection = () => (
    <div className="p-6 space-y-4">
      <p className="text-gray-600 mb-4">Choose your preferred two-factor authentication method:</p>

      <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
        method === 'app' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <input
          type="radio"
          name="mfa-method"
          value="app"
          checked={method === 'app'}
          onChange={() => setMethod('app')}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Smartphone size={20} className="text-blue-600" />
            <span className="font-semibold text-gray-900">Authenticator App</span>
            <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
              Recommended
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Use Google Authenticator, Authy, or Microsoft Authenticator
          </p>
        </div>
      </label>

      <label className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
        method === 'sms' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <input
          type="radio"
          name="mfa-method"
          value="sms"
          checked={method === 'sms'}
          onChange={() => setMethod('sms')}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <MessageSquare size={20} className="text-gray-600" />
            <span className="font-semibold text-gray-900">SMS Text Message</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Receive codes via text message
          </p>
          <div className="flex items-start space-x-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>Less secure than authenticator apps</span>
          </div>
        </div>
      </label>

      <button
        onClick={() => setStep('setup')}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );

  const renderSetup = () => (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <div className="w-64 h-64 bg-gray-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
          <div className="text-center">
            <div className="w-48 h-48 bg-white border-2 border-gray-300 rounded-lg mb-2"></div>
            <p className="text-xs text-gray-500">QR Code Placeholder</p>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">1</span>
            <p className="text-sm text-gray-700">Download an authenticator app if you don't have one</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">2</span>
            <p className="text-sm text-gray-700">Scan this QR code with your authenticator app</p>
          </div>
          <div className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">3</span>
            <div>
              <p className="text-sm text-gray-700 mb-1">Or manually enter this code:</p>
              <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">JBSWY3DPEHPK3PXP</code>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setStep('verify')}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
      >
        Next: Verify Code
      </button>
    </div>
  );

  const renderVerify = () => (
    <div className="p-6 space-y-4">
      <p className="text-gray-600 text-center mb-4">
        Enter the 6-digit code from your authenticator app to confirm
      </p>

      <div className="flex justify-center space-x-2">
        {verificationCode.map((digit, index) => (
          <input
            key={index}
            id={`mfa-code-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleVerificationInput(index, e.target.value)}
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="text-red-600" size={18} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleVerify}
        disabled={verificationCode.some(d => !d)}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Verify & Enable
      </button>
    </div>
  );

  const renderBackupCodes = () => (
    <div className="p-6 space-y-4">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p className="text-sm font-semibold text-amber-900 mb-1">Save Your Backup Codes</p>
        <p className="text-xs text-amber-800">
          Store these codes securely. Each can only be used once if you lose access to your authenticator.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-3">
          {backupCodes.map((code, index) => (
            <div key={index} className="bg-white px-4 py-2 rounded border border-gray-200 text-center font-mono text-sm">
              {code}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleDownloadCodes}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Download size={18} />
          <span>Download</span>
        </button>
        <button
          onClick={handlePrintCodes}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Printer size={18} />
          <span>Print</span>
        </button>
      </div>

      <label className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer">
        <input
          type="checkbox"
          checked={codesSaved}
          onChange={(e) => setCodesSaved(e.target.checked)}
          className="w-5 h-5"
        />
        <span className="text-sm font-medium text-blue-900">I've saved my backup codes in a secure location</span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="text-red-600" size={18} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleFinish}
        disabled={!codesSaved}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  );

  const renderSuccess = () => (
    <div className="p-6 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-[scale-up_0.3s_ease-out]">
        <Check className="text-green-600" size={40} />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">MFA Enabled!</h3>
      <p className="text-gray-600">Your account is now more secure with two-factor authentication.</p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'method' && 'Enable Two-Factor Authentication'}
            {step === 'setup' && 'Scan QR Code'}
            {step === 'verify' && 'Verify Code'}
            {step === 'backup' && 'Backup Codes'}
            {step === 'success' && 'Success!'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {step === 'method' && renderMethodSelection()}
        {step === 'setup' && renderSetup()}
        {step === 'verify' && renderVerify()}
        {step === 'backup' && renderBackupCodes()}
        {step === 'success' && renderSuccess()}
      </div>
    </div>
  );
}
