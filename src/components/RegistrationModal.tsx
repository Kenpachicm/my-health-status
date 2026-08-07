import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import PasswordStrength from './PasswordStrength';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, generateVerificationCode, sendVerificationCode, generateMemberId } from '../lib/firebase';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'account' | 'verification' | 'success';

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [step, setStep] = useState<Step>('account');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [memberId, setMemberId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (!isOpen) {
      setStep('account');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setAgreedToTerms(false);
      setVerificationCode('');
      setGeneratedCode('');
      setMemberId('');
      setErrors({});
      setResendTimer(0);
      setUserId(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (pwd: string): boolean => {
    if (pwd.length < 12) return false;
    if (!/[a-z]/.test(pwd) || !/[A-Z]/.test(pwd)) return false;
    if (!/\d/.test(pwd)) return false;
    if (!/[^a-zA-Z0-9]/.test(pwd)) return false;
    return true;
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.agreedToTerms = 'You must agree to the Terms of Service and Privacy Policy';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      if (cred.user) {
        setUserId(cred.user.uid);
        const memberId = generateMemberId();
        await setDoc(doc(db, 'users', cred.user.uid), {
          email: email,
          member_id: memberId,
          email_verified: false,
          mfa_enabled: false,
          role: 'patient',
          hospital_id: null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });

        const code = await generateVerificationCode();
        setGeneratedCode(code);
        await sendVerificationCode(email, code);

        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        setResendTimer(60);
        setStep('verification');
      }
    } catch (error: any) {
      const msg = error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : error.message;
      setErrors({ general: msg || 'Failed to create account' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      setErrors({ code: 'Please enter the verification code' });
      return;
    }

    if (verificationCode.length !== 6) {
      setErrors({ code: 'Code must be 6 digits' });
      return;
    }

    if (verificationCode !== generatedCode) {
      setErrors({ code: 'Invalid verification code' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const newMemberId = generateMemberId();
      setMemberId(newMemberId);

      if (userId) {
        await setDoc(doc(db, 'users', userId), {
          email,
          member_id: newMemberId,
          email_verified: true,
        }, { merge: true });
      }

      setStep('success');
    } catch (error: any) {
      setErrors({ general: error.message || 'Verification failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    try {
      const code = await generateVerificationCode();
      setGeneratedCode(code);
      await sendVerificationCode(email, code);
      setResendTimer(60);
      setVerificationCode('');
      setErrors({});
    } catch (error: any) {
      setErrors({ general: 'Failed to resend code' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else {
      if (confirm('Are you sure you want to cancel registration?')) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {step === 'account' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600 mb-6">Join MyHealthStatus to secure your health data</p>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleAccountSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {password && <PasswordStrength password={password} />}

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => {
                        setAgreedToTerms(e.target.checked);
                        if (errors.agreedToTerms) setErrors({ ...errors, agreedToTerms: undefined });
                      }}
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
                    <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !agreedToTerms}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'verification' && (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="text-blue-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                <p className="text-gray-600">
                  We've sent a verification code to
                </p>
                <p className="font-medium text-gray-900 mt-1">{email}</p>
              </div>

              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleVerificationSubmit} className="space-y-5">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1 text-center">
                    Enter 6-Digit Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setVerificationCode(value);
                      if (errors.code) setErrors({ ...errors, code: undefined });
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl font-mono tracking-widest ${
                      errors.code ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="000000"
                    autoFocus
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600 text-center">{errors.code}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendTimer > 0 || isLoading}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
                  </button>
                </div>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>For demo purposes:</strong> Your verification code is{' '}
                  <span className="font-mono font-bold">{generatedCode}</span>
                </p>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle2 className="text-green-600" size={40} />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to MyHealthStatus!</h2>
              <p className="text-gray-600 mb-6">Your account has been successfully created</p>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-gray-600 mb-2">Your secure member ID has been created</p>
                <div className="text-3xl font-bold text-blue-600 font-mono tracking-wider">
                  {memberId}
                </div>
                <p className="text-xs text-gray-500 mt-2">Keep this ID safe for verification purposes</p>
              </div>

              <button
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
