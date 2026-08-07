import { useState } from 'react';
import { FileText, Copy, Check, ExternalLink, MapPin } from 'lucide-react';

interface EmptyResultsProps {
  memberId: string;
}

export default function EmptyResults({ memberId }: EmptyResultsProps) {
  const [copiedId, setCopiedId] = useState(false);

  const copyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="text-gray-400" size={64} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">No test results available</h2>
          <p className="text-lg text-gray-600">
            Your test results from partnered healthcare providers will appear here automatically
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">When you get tested at a partnered clinic or lab:</h3>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-2">Provide your Member ID:</p>
                <div className="flex items-center space-x-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                  <span className="font-mono font-bold text-gray-900 text-lg">{memberId}</span>
                  <button
                    onClick={copyMemberId}
                    className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    aria-label="Copy Member ID"
                  >
                    {copiedId ? (
                      <Check size={20} className="text-green-600" />
                    ) : (
                      <Copy size={20} className="text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-2">Results will appear here within 24-48 hours</p>
                <p className="text-sm text-gray-600">
                  Partnered providers automatically upload your results to your secure account
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-2">You'll receive an email notification when results arrive</p>
                <p className="text-sm text-gray-600">
                  We'll notify you immediately when new results are available
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={copyMemberId}
            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-md inline-flex items-center justify-center space-x-2"
          >
            {copiedId ? (
              <>
                <Check size={24} />
                <span>Member ID Copied!</span>
              </>
            ) : (
              <>
                <Copy size={24} />
                <span>Copy Member ID</span>
              </>
            )}
          </button>
          <a
            href="#partnered-clinics"
            className="flex-1 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border-2 border-blue-600 inline-flex items-center justify-center space-x-2"
          >
            <MapPin size={24} />
            <span>View Partnered Clinics</span>
          </a>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help?</p>
          <a href="#" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center space-x-1">
            <span>Visit our Help Center</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}
