import { useState } from 'react';
import { X, Check, AlertCircle, Clock, Star } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface WaitlistFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistForm({ isOpen, onClose }: WaitlistFormProps) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [waitlistData, setWaitlistData] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notifyByEmail: true,
    notifyBySms: false,
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState<any>({});

  if (!isOpen) return null;

  const validateField = (name: string, value: any) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'fullName':
        if (!value.trim()) {
          newErrors.fullName = 'Full name is required';
        } else {
          delete newErrors.fullName;
        }
        break;

      case 'email':
        if (!value.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email address';
        } else {
          delete newErrors.email;
        }
        break;

      case 'phone':
        if (formData.notifyBySms && !value.trim()) {
          newErrors.phone = 'Phone number is required for SMS notifications';
        } else if (value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
          newErrors.phone = 'Please enter a valid phone number';
        } else {
          delete newErrors.phone;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    validateField('fullName', formData.fullName);
    validateField('email', formData.email);
    validateField('phone', formData.phone);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (!formData.notifyByEmail && !formData.notifyBySms) {
      setErrors({ submit: 'Please select at least one notification method' });
      return;
    }

    if (!formData.agreedToTerms) {
      setErrors({ submit: 'You must agree to the Terms of Service and Privacy Policy' });
      return;
    }

    setSubmitting(true);

    try {
      const docRef = await addDoc(collection(db, 'waitlist'), {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone || null,
        notify_by_email: formData.notifyByEmail,
        notify_by_sms: formData.notifyBySms,
        created_at: serverTimestamp(),
      });

      const data = { id: docRef.id, position: null };

      await addDoc(collection(db, 'signup_analytics'), {
        event_type: 'waitlist_signup',
        user_agent: navigator.userAgent,
        created_at: serverTimestamp(),
      });

      setWaitlistData(data);
      setStep('success');
    } catch (error: any) {
      console.error('Error joining waitlist:', error);
      if (error?.code === '23505' || /already/i.test(error?.message || '')) {
        setErrors({ submit: 'This email is already on the waitlist.' });
      } else {
        setErrors({ submit: error.message || 'An error occurred. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('form');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        notifyByEmail: true,
        notifyBySms: false,
        agreedToTerms: false,
      });
      setErrors({});
      setWaitlistData(null);
    }, 300);
  };

  if (step === 'success' && waitlistData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 animate-[scale-up_0.5s_ease-out]">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">You're on the List!</h2>
            <p className="text-green-100">We'll notify you as soon as spots open up</p>
          </div>

          <div className="p-6">
            <div className="bg-green-50 rounded-lg p-6 mb-6 text-center">
              <p className="text-sm text-green-600 font-medium mb-2">Your Waitlist Position</p>
              <p className="text-5xl font-bold text-green-900 mb-1">
                #{waitlistData.position}
              </p>
              <p className="text-xs text-green-700">We'll email you within 4-6 weeks</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start space-x-3">
                <Star className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Priority Access</p>
                  <p className="text-sm text-gray-600">First in line when we expand capacity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Exclusive Launch Benefits</p>
                  <p className="text-sm text-gray-600">Special perks for early supporters</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Star className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-medium text-gray-900">Early Feature Previews</p>
                  <p className="text-sm text-gray-600">See what we're building before anyone else</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Confirmation sent!</span> Check {formData.email} for your waitlist confirmation and position details.
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full my-8">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900">Pilot Program Full - Join Waitlist</h2>
            <p className="text-sm text-gray-600 mt-1">100/100 Founding Member spots claimed</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 bg-amber-50 border-b border-amber-200">
          <div className="flex items-start space-x-3">
            <Clock className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <p className="font-semibold text-amber-900 mb-1">All Founding Member spots are taken!</p>
              <p className="text-sm text-amber-800">
                Join our waitlist to be notified when we expand access. Waitlist members receive priority onboarding and special launch benefits.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
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
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
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
              Phone Number {formData.notifyBySms && <span className="text-red-500">*</span>}
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle size={14} className="mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Notify me by:
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyByEmail"
                  checked={formData.notifyByEmail}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">Email</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="notifyBySms"
                  checked={formData.notifyBySms}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">SMS (text message)</span>
              </label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Waitlist Benefits:</p>
            <ul className="space-y-1 text-sm text-blue-800">
              <li className="flex items-center space-x-2">
                <Check size={16} className="flex-shrink-0" />
                <span>Priority access when we expand</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={16} className="flex-shrink-0" />
                <span>Exclusive launch discount</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={16} className="flex-shrink-0" />
                <span>Early feature previews</span>
              </li>
              <li className="flex items-center space-x-2">
                <Check size={16} className="flex-shrink-0" />
                <span>Updates on pilot progress</span>
              </li>
            </ul>
          </div>

          <div className="pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
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
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !formData.agreedToTerms}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Joining Waitlist...
              </span>
            ) : (
              'Join Waitlist'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
