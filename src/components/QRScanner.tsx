import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Camera, X } from 'lucide-react';

interface QRScannerProps {
  onTokenDetected: (token: string) => void;
  isVerifying: boolean;
}

export default function QRScanner({ onTokenDetected, isVerifying }: QRScannerProps) {
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [error, setError] = useState('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      const scanner = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          const token = extractToken(decodedText);
          if (token) {
            scanner.stop().then(() => {
              setIsScannerActive(false);
              onTokenDetected(token);
            });
          }
        },
        () => {}
      );

      setIsScannerActive(true);
    } catch (err: any) {
      console.error('Scanner error:', err);
      setError('Camera not available. Please use manual entry below.');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().then(() => {
        setIsScannerActive(false);
        scannerRef.current = null;
      });
    }
  };

  const extractToken = (text: string): string | null => {
    if (text.includes('/verify/')) {
      const parts = text.split('/verify/');
      return parts[1] || null;
    }
    return text.length > 10 ? text : null;
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualToken.trim()) {
      onTokenDetected(manualToken.trim());
    }
  };

  if (manualEntry) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Enter Share Token</h2>
          <button
            onClick={() => {
              setManualEntry(false);
              setManualToken('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to Scanner
          </button>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Enter share token"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              disabled={isVerifying}
            />
            <p className="mt-2 text-sm text-gray-500">
              e.g., abc123xyz789...
            </p>
          </div>

          <button
            type="submit"
            disabled={!manualToken.trim() || isVerifying}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <QrCode className="text-blue-600" size={32} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Scan QR Code</h2>
        <p className="text-gray-600">
          Use your device camera to scan the QR code shared with you
        </p>
      </div>

      {!isScannerActive ? (
        <>
          {error && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              {error}
            </div>
          )}

          <button
            onClick={startScanner}
            disabled={isVerifying}
            className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Camera size={24} />
            <span>Start Camera Scanner</span>
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div
            id={qrCodeRegionId}
            className="border-4 border-blue-500 rounded-lg overflow-hidden"
          />

          <button
            onClick={stopScanner}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <X size={20} />
            <span>Stop Scanner</span>
          </button>
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">OR</span>
        </div>
      </div>

      <button
        onClick={() => setManualEntry(true)}
        className="w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
      >
        Enter Share Token Manually
      </button>
    </div>
  );
}
