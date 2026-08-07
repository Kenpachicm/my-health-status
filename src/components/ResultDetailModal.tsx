import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Printer, Share2, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import './WatermarkedViewer.css';

interface ResultDetailModalProps {
  result: {
    id: string;
    file_name: string;
    file_type: string;
    file_size: number;
    file_url: string;
    test_date: string;
    test_types: string[];
    facility_name: string;
    notes: string;
    status: string;
    uploaded_at: string;
  };
  onClose: () => void;
  onNavigate: (direction: 'next' | 'prev') => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function ResultDetailModal({ result, onClose, onNavigate, hasNext, hasPrev }: ResultDetailModalProps) {
  const [fileError, setFileError] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate('prev');
      if (e.key === 'ArrowRight' && hasNext) onNavigate('next');
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, onNavigate, hasNext, hasPrev]);

  useEffect(() => {
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      alert('Copying is disabled for security. This is a verified result.');
    };

    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      alert('Copying is disabled for security. This is a verified result.');
    };

    document.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('copy', preventCopy);

    return () => {
      document.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('copy', preventCopy);
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden relative">
        {/* Watermark Background Layer */}
        {!fileError && (
          <div className="watermark-layers" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            pointerEvents: 'none'
          }}>
            <div className="watermark-diagonal">
              <div className="watermark-text">
                VERIFIED BY<br/>
                MYHEALTHSTATUS<br/>
                <span className="watermark-time">{new Date().toLocaleString()}</span><br/>
                <span className="watermark-id">Result ID: {result.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Content Layer */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 relative z-10 bg-white/80 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-gray-900">Test Result Details</h2>
          <div className="flex items-center space-x-2">
            {hasPrev && (
              <button
                onClick={() => onNavigate('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous result"
              >
                <ChevronLeft size={24} />
              </button>
            )}
            {hasNext && (
              <button
                onClick={() => onNavigate('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next result"
              >
                <ChevronRight size={24} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Result Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">File Name:</span>
                <p className="font-semibold text-gray-900 break-words">{result.file_name}</p>
              </div>
              <div>
                <span className="text-gray-600">Test Date:</span>
                <p className="font-semibold text-gray-900">{formatDate(result.test_date)}</p>
              </div>
              <div>
                <span className="text-gray-600">Uploaded:</span>
                <p className="font-semibold text-gray-900">{formatDateTime(result.uploaded_at)}</p>
              </div>
              {result.facility_name && (
                <div>
                  <span className="text-gray-600">Facility:</span>
                  <p className="font-semibold text-gray-900">{result.facility_name}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">File Size:</span>
                <p className="font-semibold text-gray-900">{(result.file_size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {result.test_types && result.test_types.length > 0 && (
                <div>
                  <span className="text-gray-600 block mb-2">Test Types:</span>
                  <div className="flex flex-wrap gap-2">
                    {result.test_types.map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {result.notes && (
                <div>
                  <span className="text-gray-600 block mb-1">Notes:</span>
                  <p className="text-gray-900 text-sm">{result.notes}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Status:</span>
                <p className="flex items-center space-x-1 font-semibold text-green-600 mt-1">
                  <CheckCircle size={16} />
                  <span className="capitalize">{result.status}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Sharing Information</h3>
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <Share2 className="text-gray-400" size={20} />
              </div>
              <p className="text-sm text-gray-600 mb-4">Not shared yet</p>
              <button className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Share This Result
              </button>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-2">
              <a
                href={result.file_url}
                download={result.file_name}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Download size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">Download Original File</span>
              </a>
              <button
                onClick={() => window.print()}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left"
              >
                <Printer size={20} className="text-gray-600" />
                <span className="font-medium text-gray-900">Print Result</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-100 rounded-lg transition-colors text-left">
                <Share2 size={20} className="text-blue-600" />
                <span className="font-medium text-blue-600">Share Result</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 rounded-lg transition-colors text-left">
                <AlertCircle size={20} className="text-red-600" />
                <span className="font-medium text-red-600">Report an Issue</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50/60 backdrop-blur-sm border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-2">
              <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
              <div>
                <p className="text-xs text-blue-900">
                  This result was securely uploaded{result.facility_name ? ` by ${result.facility_name}` : ''} on {formatDateTime(result.uploaded_at)}
                </p>
                <div className="inline-flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold mt-2">
                  <CheckCircle size={12} />
                  <span>Secure Storage</span>
                </div>
              </div>
            </div>
          </div>

          {!fileError && (
            <div className="bg-yellow-50/60 backdrop-blur-sm border-l-4 border-yellow-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-semibold text-yellow-900 text-sm mb-1">Security Notice</p>
                  <p className="text-xs text-yellow-800">
                    This is a verified result with security watermarks. Screenshots and copies are not verified.
                    Right-click and copying are disabled for security purposes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
