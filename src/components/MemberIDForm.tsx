import { useState } from 'react';
import { CreditCard, Info } from 'lucide-react';

interface MemberIDFormProps {
  onSubmit: (memberId: string) => void;
  isVerifying: boolean;
}

export default function MemberIDForm({ onSubmit, isVerifying }: MemberIDFormProps) {
  const [memberId, setMemberId] = useState('');
  const [error, setError] = useState('');

  const formatMemberId = (value: string) => {
    let cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (!cleaned.startsWith('MH')) {
      cleaned = 'MH' + cleaned.replace(/^MH/, '');
    }

    if (cleaned.length > 2 && !cleaned.includes('-')) {
      cleaned = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
    }

    if (cleaned.length > 9) {
      cleaned = cleaned.slice(0, 9);
    }

    return cleaned;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatMemberId(e.target.value);
    setMemberId(formatted);
    setError('');
  };

  const validateMemberId = (id: string): boolean => {
    const pattern = /^MH-[A-Z0-9]{6}$/;
    return pattern.test(id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMemberId(memberId)) {
      setError('Invalid Member ID format. Must be: MH-XXXXXX');
      return;
    }

    onSubmit(memberId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="text-purple-600" size={32} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify by Member ID</h2>
        <p className="text-gray-600">
          Enter the Member ID provided by the result owner
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            value={memberId}
            onChange={handleChange}
            placeholder="MH-XXXXXX"
            className={`w-full px-4 py-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-center font-mono tracking-wider ${
              error ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isVerifying}
          />
          <p className="mt-2 text-sm text-gray-500 text-center">
            Member ID format: MH- followed by 6 characters
          </p>
          {error && (
            <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!memberId || isVerifying}
          className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify Member ID'}
        </button>
      </form>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex space-x-3">
        <Info className="text-blue-600 flex-shrink-0" size={20} />
        <p className="text-sm text-blue-900">
          Member ID verification shows general information only. For full test details, use QR code or secure link.
        </p>
      </div>
    </div>
  );
}
