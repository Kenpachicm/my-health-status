import { useState, useEffect } from 'react';
import { X, Check, AlertCircle, Sparkles, Users, Crown, Shield, Zap } from 'lucide-react';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import WaitlistForm from './WaitlistForm';

interface PilotSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MembershipOption = 'pilot' | 'founding' | 'both' | null;
type Step = 'selection' | 'pilot-form' | 'founding-form' | 'payment' | 'success';

export default function PilotSignupModal({ isOpen, onClose }: PilotSignupModalProps) {
  const [step, setStep] = useState<Step>('selection');
  const [selectedOption, setSelectedOption] = useState<MembershipOption>(null);
  const [pilotCount, setPilotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pilotData, setPilotData] = useState<any>(null);
  const [foundingData, setFoundingData] = useState<any>(null);

  const [pilotFormData, setPilotFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    referralSource: '',
    agreedToFeedback: false,
    agreedToTerms: false,
  });

  const [foundingFormData, setFoundingFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ageRange: '',
    gender: '',
    locationState: '',
    locationCity: '',
    relationshipStatus: '',
    referralSource: '',
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<any>({});

  const PILOT_CAP = 100;
  const spotsRemaining = PILOT_CAP - pilotCount;
  const isFull = pilotCount >= PILOT_CAP;

  useEffect(() => {
    if (isOpen) {
      loadPilotCount();
      trackAnalytics('form_view');
    }
  }, [isOpen]);

  const loadPilotCount = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'pilot_signups'));
      setPilotCount(snapshot.size);
    } catch (error) {
      console.error('Error loading pilot count:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackAnalytics = async (eventType: string) => {
    try {
      await addDoc(collection(db, 'signup_analytics'), {
        event_type: eventType,
        referral_source: pilotFormData.referralSource || foundingFormData.referralSource || null,
        user_agent: navigator.userAgent,
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validateName = (name: string) => {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().split(' ').length < 2) return 'Please enter both first and last name';
    return null;
  };

  const handleOptionSelect = (option: MembershipOption) => {
    setSelectedOption(option);
    if (option === 'pilot') {
      setStep('pilot-form');
    } else if (option === 'founding') {
      setStep('founding-form');
    } else if (option === 'both') {
      setStep('pilot-form');
    }
  };

  const handlePilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(pilotFormData.fullName);
    const emailError = validateEmail(pilotFormData.email);

    if (nameError || emailError || !pilotFormData.agreedToTerms) {
      setErrors({
        fullName: nameError,
        email: emailError,
        agreedToTerms: !pilotFormData.agreedToTerms ? 'You must agree to the terms' : null,
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      await loadPilotCount();

      if (pilotCount >= PILOT_CAP) {
        setErrors({ submit: 'Pilot program is now full.' });
        setSubmitting(false);
        return;
      }

      const docRef = await addDoc(collection(db, 'pilot_signups'), {
        full_name: pilotFormData.fullName,
        email: pilotFormData.email,
        phone: pilotFormData.phone || null,
        referral_source: pilotFormData.referralSource || null,
        agreed_to_feedback: pilotFormData.agreedToFeedback,
        signup_ip: null,
        created_at: serverTimestamp(),
      });

      const data = { id: docRef.id };

      setPilotData(data);
      await trackAnalytics('pilot_signup');

      if (selectedOption === 'both') {
        setFoundingFormData({
          ...foundingFormData,
          fullName: pilotFormData.fullName,
          email: pilotFormData.email,
          phone: pilotFormData.phone,
          referralSource: pilotFormData.referralSource,
        });
        setStep('founding-form');
      } else {
        setStep('success');
      }
    } catch (error: any) {
      console.error('Error submitting pilot signup:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFoundingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(foundingFormData.fullName);
    const emailError = validateEmail(foundingFormData.email);

    if (nameError || emailError || !foundingFormData.agreedToTerms) {
      setErrors({
        fullName: nameError,
        email: emailError,
        agreedToTerms: !foundingFormData.agreedToTerms ? 'You must agree to the terms' : null,
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      const membershipType = selectedOption === 'both' ? 'both' : 'founding_only';

      const docRef = await addDoc(collection(db, 'founding_members'), {
        full_name: foundingFormData.fullName,
        email: foundingFormData.email,
        phone: foundingFormData.phone || null,
        age_range: foundingFormData.ageRange || null,
        gender: foundingFormData.gender || null,
        location_state: foundingFormData.locationState || null,
        location_city: foundingFormData.locationCity || null,
        relationship_status: foundingFormData.relationshipStatus || null,
        referral_source: foundingFormData.referralSource || null,
        membership_type: membershipType,
        pilot_signup_id: pilotData?.id || null,
        payment_status: 'pending',
        created_at: serverTimestamp(),
      });

      const data = { id: docRef.id };

      setFoundingData(data);
      setStep('payment');
    } catch (error: any) {
      console.error('Error submitting founding member signup:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (step === 'selection' && !submitting) {
      trackAnalytics('form_abandon');
    }
    onClose();
    setTimeout(() => {
      setStep('selection');
      setSelectedOption(null);
      setPilotFormData({
        fullName: '',
        email: '',
        phone: '',
        referralSource: '',
        agreedToFeedback: false,
        agreedToTerms: false,
      });
      setFoundingFormData({
        fullName: '',
        email: '',
        phone: '',
        ageRange: '',
        gender: '',
        locationState: '',
        locationCity: '',
        relationshipStatus: '',
        referralSource: '',
        agreedToTerms: false,
      });
      setErrors({});
      setPilotData(null);
      setFoundingData(null);
    }, 300);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isFull && selectedOption !== 'founding') {
    return <WaitlistForm isOpen={isOpen} onClose={handleClose} />;
  }

  if (step === 'selection') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full my-8">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Join the Pilot Program, secure Founding Member status, or claim both. Spots are limited.</h2>
              <p className="text-sm text-gray-600 mt-1">Choose the option that's right for you</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div
              onClick={() => !isFull && handleOptionSelect('pilot')}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${
                isFull
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-blue-200 hover:border-blue-500 hover:shadow-lg'
              }`}
            >
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Pilot Program</h3>
              <p className="text-3xl font-bold text-blue-600 text-center mb-4">FREE</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Provider network access</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Early platform testing</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Feature feedback input</span>
                </li>
              </ul>
              {isFull ? (
                <button
                  disabled
                  className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                >
                  Pilot Full
                </button>
              ) : (
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Join Pilot
                </button>
              )}
            </div>

            <div
              onClick={() => handleOptionSelect('founding')}
              className="border-2 border-yellow-400 rounded-xl p-6 cursor-pointer hover:border-yellow-500 hover:shadow-lg transition-all relative"
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                  PREMIUM
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Crown className="text-yellow-600" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Founding Member</h3>
              <p className="text-3xl font-bold text-yellow-600 text-center mb-4">$299</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Lifetime premium access</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Exclusive founding badge</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Direct product input</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Early access to events</span>
                </li>
              </ul>
              <button className="w-full px-4 py-3 bg-yellow-500 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">
                Become Founding Member
              </button>
            </div>

            <div
              onClick={() => !isFull && handleOptionSelect('both')}
              className={`border-2 rounded-xl p-6 cursor-pointer transition-all relative ${
                isFull
                  ? 'border-gray-200 opacity-50 cursor-not-allowed'
                  : 'border-green-400 hover:border-green-500 hover:shadow-lg'
              }`}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  BEST VALUE
                </div>
              </div>
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="text-green-600" size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Both</h3>
              <p className="text-3xl font-bold text-green-600 text-center mb-4">$299</p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700 font-semibold">All Pilot benefits</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700 font-semibold">All Founding benefits</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Maximum impact</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
                  <span className="text-sm text-gray-700">Ultimate recognition</span>
                </li>
              </ul>
              {isFull ? (
                <button
                  disabled
                  className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-lg font-semibold cursor-not-allowed"
                >
                  Pilot Full
                </button>
              ) : (
                <button className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  Claim Both
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'pilot-form') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full my-8">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Pilot Program Signup</h2>
              <p className="text-sm text-gray-600 mt-1">Join as one of our first 100 members</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <form onSubmit={handlePilotSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={pilotFormData.fullName}
                onChange={(e) => setPilotFormData({ ...pilotFormData, fullName: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fullName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="John Smith"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={pilotFormData.email}
                onChange={(e) => setPilotFormData({ ...pilotFormData, email: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={pilotFormData.phone}
                onChange={(e) => setPilotFormData({ ...pilotFormData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <select
                value={pilotFormData.referralSource}
                onChange={(e) => setPilotFormData({ ...pilotFormData, referralSource: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select one</option>
                <option value="social_media">Social media</option>
                <option value="friend">Friend or partner</option>
                <option value="healthcare_provider">Healthcare provider</option>
                <option value="online_search">Online search</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pilotFormData.agreedToFeedback}
                  onChange={(e) => setPilotFormData({ ...pilotFormData, agreedToFeedback: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  I agree to participate in pilot feedback sessions
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pilotFormData.agreedToTerms}
                  onChange={(e) => setPilotFormData({ ...pilotFormData, agreedToTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a
                    href="https://docs.google.com/document/d/1SXFv5c7XC2YIJyKXTJHxrUaRzKFp_IK6ZZ3EhWSEIuQ/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service and Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.agreedToTerms}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !pilotFormData.agreedToTerms}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : selectedOption === 'both' ? (
                'Continue to Founding Member'
              ) : (
                'Join Pilot Program'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'founding-form') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">Founding Member Registration</h2>
              <p className="text-sm text-gray-600 mt-1">Help us understand our community</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <form onSubmit={handleFoundingSubmit} className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={foundingFormData.fullName}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, fullName: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.fullName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="John Smith"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={foundingFormData.email}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, email: e.target.value })}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle size={14} className="mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={foundingFormData.phone}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Range
                </label>
                <select
                  value={foundingFormData.ageRange}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, ageRange: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select age range</option>
                  <option value="18-24">18-24</option>
                  <option value="25-34">25-34</option>
                  <option value="35-44">35-44</option>
                  <option value="45-54">45-54</option>
                  <option value="55-64">55-64</option>
                  <option value="65+">65+</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender (Optional)
                </label>
                <select
                  value={foundingFormData.gender}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non_binary">Non-binary</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Relationship Status (Optional)
                </label>
                <select
                  value={foundingFormData.relationshipStatus}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, relationshipStatus: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  <option value="single">Single</option>
                  <option value="dating">Dating</option>
                  <option value="relationship">In a relationship</option>
                  <option value="married">Married</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State (Optional)
                </label>
                <input
                  type="text"
                  value={foundingFormData.locationState}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, locationState: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="California"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City (Optional)
                </label>
                <input
                  type="text"
                  value={foundingFormData.locationCity}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, locationCity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Los Angeles"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How did you hear about us?
              </label>
              <select
                value={foundingFormData.referralSource}
                onChange={(e) => setFoundingFormData({ ...foundingFormData, referralSource: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select one</option>
                <option value="social_media">Social media</option>
                <option value="friend">Friend or partner</option>
                <option value="healthcare_provider">Healthcare provider</option>
                <option value="online_search">Online search</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="pt-2">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={foundingFormData.agreedToTerms}
                  onChange={(e) => setFoundingFormData({ ...foundingFormData, agreedToTerms: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-yellow-600"
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a
                    href="https://docs.google.com/document/d/1SXFv5c7XC2YIJyKXTJHxrUaRzKFp_IK6ZZ3EhWSEIuQ/edit?usp=sharing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms of Service and Privacy Policy
                  </a>
                  <span className="text-red-500 ml-1">*</span>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="text-sm text-red-600 flex items-center mt-1">
                  <AlertCircle size={14} className="mr-1" />
                  {errors.agreedToTerms}
                </p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !foundingFormData.agreedToTerms}
              className="w-full px-6 py-4 bg-yellow-500 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-yellow-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </span>
              ) : (
                'Continue to Payment'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900">Payment Required</h2>
            <p className="text-sm text-gray-600 mt-1">Secure Founding Member membership</p>
          </div>

          <div className="p-6 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="text-yellow-600" size={40} />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">Founding Member</h3>
            <p className="text-5xl font-bold text-yellow-600 mb-6">$299</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-2">
                <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="text-left">
                  <p className="text-sm font-semibold text-blue-900 mb-1">Stripe Integration Required</p>
                  <p className="text-sm text-blue-800">
                    To accept payments, you'll need to configure Stripe. Visit the link below to set up your Stripe account and add your API keys.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => window.open('https://bolt.new/setup/stripe', '_blank')}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Configure Stripe Integration
              </button>

              <button
                onClick={handleClose}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Complete Later
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              Your registration has been saved. Payment can be completed once Stripe is configured.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-[scale-up_0.5s_ease-out]">
              <Sparkles className="text-blue-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {selectedOption === 'both' ? 'Welcome, Founding Pilot Member!' : 'Welcome, Member!'}
            </h2>
            <p className="text-blue-100">
              {selectedOption === 'both'
                ? 'You have both Pilot and Founding Member status'
                : selectedOption === 'founding'
                ? 'You are now a Founding Member'
                : "You're one of our first 100 pilot members"}
            </p>
          </div>

          <div className="p-6">
            {pilotData && (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
                <p className="text-sm text-blue-600 font-medium mb-2">Your Member ID</p>
                <p className="text-3xl font-bold text-blue-900 font-mono tracking-wider mb-1">
                  {pilotData.member_id}
                </p>
                <p className="text-xs text-blue-700">Pilot Member #{pilotData.signup_number}</p>
              </div>
            )}

            {foundingData && (
              <div className="bg-yellow-50 rounded-lg p-6 mb-6 text-center">
                <p className="text-sm text-yellow-700 font-medium mb-2">Founding Member</p>
                <p className="text-2xl font-bold text-yellow-900">
                  #{foundingData.founding_member_number}
                </p>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Confirmation Email Sent</p>
                  <p className="text-sm text-gray-600">Check your email for details</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Member Benefits Activated</p>
                  <p className="text-sm text-gray-600">Access all your exclusive features</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Check className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Priority Support</p>
                  <p className="text-sm text-gray-600">Direct line to our team</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.location.href = '/dashboard'}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
