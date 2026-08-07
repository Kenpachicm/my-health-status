import { useState, useEffect, useRef } from 'react';
import { X, Lock, AlertCircle } from 'lucide-react';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  attemptsRemaining: number;
}

export default function AccessCodeModal({ isOpen, onClose, onSubmit, attemptsRemaining }: AccessCodeModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (code.every(digit => digit !== '')) {
      const fullCode = code.join('');
      handleSubmit(fullCode);
    }
  }, [code]);

  useEffect(() => {
    if (attemptsRemaining < 3 && attemptsRemaining > 0) {
      setError(`Incorrect code. ${attemptsRemaining} attempts remaining.`);
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  }, [attemptsRemaining]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    setError('');

    if (value.length > 1) {
      const chars = value.split('');
      const newCode = [...code];
      chars.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);

      const nextIndex = Math.min(index + chars.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    if (value && !/^[0-9]$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setCode(newCode);

    if (pastedData.length === 6) {
      inputRefs.current[5]?.focus();
    } else {
      inputRefs.current[pastedData.length]?.focus();
    }
  };

  const handleSubmit = (fullCode: string) => {
    onSubmit(fullCode);
  };

  const handleManualSubmit = () => {
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      handleSubmit(fullCode);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Access Code Required</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-gray-600 text-center">
            This share requires an access code for additional security
          </p>

          <div className="flex justify-center space-x-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  error ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {attemptsRemaining === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 text-center font-medium">
                Too many incorrect attempts. Please contact the result owner for a new share.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleManualSubmit}
              disabled={code.some(d => !d) || attemptsRemaining === 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Verify Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
