import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Shield, Lock, CheckCircle, Building2, QrCode, CreditCard } from 'lucide-react';
import QRScanner from './QRScanner';
import MemberIDForm from './MemberIDForm';
import AccessCodeModal from './AccessCodeModal';
import WatermarkedViewer from './WatermarkedViewer';
import VerificationError from './VerificationError';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { validateShareAccess } from '../lib/firebase';

type VerificationMethod = 'qr' | 'member_id';
type VerificationState = 'idle' | 'verifying' | 'access_code_required' | 'success' | 'error';

interface VerificationData {
  share?: any;
  member?: any;
  error?: string;
  errorType?: 'invalid' | 'expired' | 'not_found' | 'rate_limit' | 'access_denied';
}

export default function VerifyPage() {
  const { token } = useParams<{ token?: string }>();
  const [activeTab, setActiveTab] = useState<VerificationMethod>('qr');
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verificationData, setVerificationData] = useState<VerificationData>({});
  const [, setPendingToken] = useState('');
  const [accessCodeAttempts, setAccessCodeAttempts] = useState(0);

  useEffect(() => {
    if (token) {
      handleTokenSubmit(token);
    }
  }, [token]);

  const handleTokenSubmit = async (token: string) => {
    setVerificationState('verifying');
    setPendingToken(token);

    try {
      const result = await validateShareAccess({
        share_token: token,
        user_agent: navigator.userAgent,
      });

      if (!result.valid) {
        const errorType: VerificationData['errorType'] =
          result.requires_access_code ? 'access_denied' : 'invalid';
        setVerificationData({
          error: result.error || 'Invalid or revoked share link',
          errorType,
        });
        setVerificationState('error');
        return;
      }

      const share: any = {
        ...result.share,
        share_results: (result.test_results || []).map((tr: any) => ({ test_results: tr })),
      };

      setVerificationData({ share, member: result.member });
      setVerificationState('success');
    } catch (error) {
      console.error('Verification error:', error);
      setVerificationData({
        error: 'An error occurred during verification',
        errorType: 'invalid',
      });
      setVerificationState('error');
    }
  };

  const handleMemberIDSubmit = async (memberId: string) => {
    setVerificationState('verifying');

    try {
      const profileQuery = query(
        collection(db, 'user_profiles'),
        where('member_id', '==', memberId),
        limit(1)
      );
      const profileSnapshot = await getDocs(profileQuery);

      if (profileSnapshot.empty) {
        setVerificationData({
          error: `No member found with ID: ${memberId}`,
          errorType: 'not_found',
        });
        setVerificationState('error');
        return;
      }

      const profileDoc = profileSnapshot.docs[0];
      const profile = { id: profileDoc.id, ...profileDoc.data() };

      setVerificationData({ member: profile });
      setVerificationState('success');
    } catch (error) {
      console.error('Member ID verification error:', error);
      setVerificationData({
        error: 'An error occurred during verification',
        errorType: 'invalid',
      });
      setVerificationState('error');
    }
  };

  const handleAccessCodeSubmit = async (code: string) => {
    const token = verificationData.share?.share_token;
    if (!token) return;

    if (accessCodeAttempts >= 3) {
      setVerificationData({
        error: 'Too many incorrect attempts. Please contact the result owner.',
        errorType: 'access_denied',
      });
      setVerificationState('error');
      return;
    }

    try {
      const result = await validateShareAccess({
        share_token: token,
        access_code: code,
        user_agent: navigator.userAgent,
      });

      if (!result.valid) {
        const newAttempts = accessCodeAttempts + 1;
        setAccessCodeAttempts(newAttempts);

        if (newAttempts >= 3) {
          setVerificationData({
            error: 'Too many incorrect attempts. Please contact the result owner.',
            errorType: 'access_denied',
          });
          setVerificationState('error');
        }
        return;
      }

      const share: any = {
        ...result.share,
        share_results: (result.test_results || []).map((tr: any) => ({ test_results: tr })),
      };

      setVerificationData({ share, member: result.member });
      setVerificationState('success');
      setAccessCodeAttempts(0);
    } catch (error) {
      console.error('Access code verification error:', error);
      setVerificationData({
        error: 'An error occurred during verification',
        errorType: 'invalid',
      });
      setVerificationState('error');
    }
  };

  const handleReset = () => {
    setVerificationState('idle');
    setVerificationData({});
    setPendingToken('');
    setAccessCodeAttempts(0);
  };

  if (verificationState === 'success') {
    return (
      <WatermarkedViewer
        data={verificationData}
        onReset={handleReset}
      />
    );
  }

  if (verificationState === 'error') {
    return (
      <VerificationError
        error={verificationData.error || 'Unknown error'}
        errorType={verificationData.errorType || 'invalid'}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/my_health.png" alt="MyHealthStatus" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">MyHealthStatus</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">Verify Test Results</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Verify Test Results
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Authenticate shared health information securely
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 rounded-lg">
              <Lock className="text-green-600" size={20} />
              <span className="text-sm font-medium text-green-900">Encrypted & Secure</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-lg">
              <CheckCircle className="text-blue-600" size={20} />
              <span className="text-sm font-medium text-blue-900">HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-purple-50 rounded-lg">
              <Building2 className="text-purple-600" size={20} />
              <span className="text-sm font-medium text-purple-900">Verified Sources Only</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('qr')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'qr'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <QrCode className="inline-block mr-2" size={20} />
                Via QR Code
              </button>
              <button
                onClick={() => setActiveTab('member_id')}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  activeTab === 'member_id'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <CreditCard className="inline-block mr-2" size={20} />
                Via Member ID
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'qr' ? (
              <QRScanner
                onTokenDetected={handleTokenSubmit}
                isVerifying={verificationState === 'verifying'}
              />
            ) : (
              <MemberIDForm
                onSubmit={handleMemberIDSubmit}
                isVerifying={verificationState === 'verifying'}
              />
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Lock className="text-blue-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Encrypted & Secure</h3>
            <p className="text-sm text-gray-600">All data is encrypted and transmitted securely</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Shield className="text-green-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Source Verified</h3>
            <p className="text-sm text-gray-600">Results uploaded directly by licensed providers</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Building2 className="text-purple-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Tracked & Logged</h3>
            <p className="text-sm text-gray-600">All access is logged for authenticity and security</p>
          </div>
        </div>
      </main>

      {verificationState === 'access_code_required' && (
        <AccessCodeModal
          isOpen={true}
          onClose={handleReset}
          onSubmit={handleAccessCodeSubmit}
          attemptsRemaining={3 - accessCodeAttempts}
        />
      )}
    </div>
  );
}
