import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowLeft, Building2, User, Mail, Phone, MapPin, Users, MessageSquare, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react';

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming','Washington D.C.','Other',
];

const PATIENT_RANGES = [
  'Under 100',
  '100 – 500',
  '500 – 1,000',
  '1,000 – 5,000',
  '5,000 – 10,000',
  'Over 10,000',
];

interface FormData {
  orgName: string;
  contactName: string;
  email: string;
  phone: string;
  state: string;
  patientVolume: string;
  message: string;
}

const EMPTY: FormData = {
  orgName: '',
  contactName: '',
  email: '',
  phone: '',
  state: '',
  patientVolume: '',
  message: '',
};

type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function PartnershipPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('https://formsubmit.co/ajax/n.wilson@myhealthstatus.org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `Partnership Inquiry — ${form.orgName}`,
          _captcha: 'false',
          'Organization Name': form.orgName,
          'Contact Name': form.contactName,
          Email: form.email,
          Phone: form.phone || '(not provided)',
          'State / Location': form.state,
          'Monthly Patients': form.patientVolume,
          'Message': form.message || '(none)',
        }),
      });

      if (!res.ok) throw new Error('Submission failed');
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg('Something went wrong. Please email n.wilson@myhealthstatus.org directly.');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">MyHealthStatus</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </nav>

      {/* Hero strip */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-18">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-3.5 py-1.5 text-sm font-medium mb-5">
              <Building2 size={13} />
              Healthcare Providers
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight mb-4">
              Partner with MyHealthStatus
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Join our network of clinics and healthcare providers delivering seamless,
              secure STI test results to patients. HIPAA-compliant, easy to integrate,
              and built to improve patient satisfaction.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: CheckCircle, label: 'HIPAA-compliant platform', color: 'text-blue-600' },
              { icon: CheckCircle, label: 'Easy API integration',      color: 'text-blue-600' },
              { icon: CheckCircle, label: 'Dedicated onboarding support', color: 'text-blue-600' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-gray-700">
                <Icon size={16} className={color} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-5 gap-10 items-start">

          {/* Sidebar info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">What happens next?</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Submit the form and our partnerships team will reach out within 24 hours to discuss your needs.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: '1', title: 'We review your inquiry', body: 'Nikita Wilson, our partnerships lead, personally reviews every submission.' },
                { step: '2', title: 'Discovery call',         body: 'A 20-minute call to understand your clinic\'s workflow and volume.' },
                { step: '3', title: 'Technical onboarding',   body: 'Our team handles the integration — typically live within 5 business days.' },
              ].map(({ step, title, body }) => (
                <div key={step} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{title}</div>
                    <div className="text-sm text-gray-500 mt-0.5 leading-relaxed">{body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
              <div className="font-semibold mb-1">Partnerships Contact</div>
              <div className="text-blue-700">Nikita Wilson</div>
              <a
                href="mailto:n.wilson@myhealthstatus.org"
                className="text-blue-600 hover:underline font-medium"
              >
                n.wilson@myhealthstatus.org
              </a>
            </div>
          </div>

          {/* Form card */}
          <div className="lg:col-span-3">
            {status === 'success' ? (
              <SuccessState />
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">Partnership Inquiry</h2>
                  <p className="text-sm text-gray-500 mt-0.5">All fields marked * are required.</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
                  {/* Org name */}
                  <Field
                    label="Clinic / Organization Name"
                    required
                    icon={<Building2 size={15} className="text-gray-400" />}
                  >
                    <input
                      type="text"
                      placeholder="City Health Clinic"
                      value={form.orgName}
                      onChange={e => set('orgName', e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>

                  {/* Contact name */}
                  <Field
                    label="Contact Name"
                    required
                    icon={<User size={15} className="text-gray-400" />}
                  >
                    <input
                      type="text"
                      placeholder="Dr. Jane Smith"
                      value={form.contactName}
                      onChange={e => set('contactName', e.target.value)}
                      required
                      className={inputCls}
                    />
                  </Field>

                  {/* Email + Phone row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="Email Address"
                      required
                      icon={<Mail size={15} className="text-gray-400" />}
                    >
                      <input
                        type="email"
                        placeholder="contact@clinic.org"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        required
                        className={inputCls}
                      />
                    </Field>

                    <Field
                      label="Phone Number"
                      icon={<Phone size={15} className="text-gray-400" />}
                    >
                      <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        value={form.phone}
                        onChange={e => set('phone', e.target.value)}
                        className={inputCls}
                      />
                    </Field>
                  </div>

                  {/* State + Volume row */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field
                      label="State / Location"
                      required
                      icon={<MapPin size={15} className="text-gray-400" />}
                    >
                      <div className="relative">
                        <select
                          value={form.state}
                          onChange={e => set('state', e.target.value)}
                          required
                          className={selectCls}
                        >
                          <option value="">Select state…</option>
                          {US_STATES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </Field>

                    <Field
                      label="Monthly Patient Volume"
                      required
                      icon={<Users size={15} className="text-gray-400" />}
                    >
                      <div className="relative">
                        <select
                          value={form.patientVolume}
                          onChange={e => set('patientVolume', e.target.value)}
                          required
                          className={selectCls}
                        >
                          <option value="">Select range…</option>
                          {PATIENT_RANGES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </Field>
                  </div>

                  {/* Message */}
                  <Field
                    label="Message / Questions"
                    icon={<MessageSquare size={15} className="text-gray-400" />}
                  >
                    <textarea
                      rows={4}
                      placeholder="Tell us about your integration needs, timeline, or any questions you have…"
                      value={form.message}
                      onChange={e => set('message', e.target.value)}
                      className={`${inputCls} resize-none leading-relaxed`}
                    />
                  </Field>

                  {/* Error */}
                  {status === 'error' && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl p-3.5 text-sm text-red-700">
                      <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                      {errorMsg}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    {status === 'submitting' ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Sending…
                      </>
                    ) : (
                      'Send Partnership Request'
                    )}
                  </button>

                  <p className="text-xs text-gray-400 text-center">
                    By submitting you agree to our{' '}
                    <a href="/security" className="underline hover:text-gray-600">privacy policy</a>.
                    We'll respond within 24 hours.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {icon && <span className="inline-flex align-middle mr-1.5">{icon}</span>}
        {label}
        {required && <span className="text-blue-600 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessState() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle size={30} className="text-green-600" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Thank you! We'll contact you within 24 hours.
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto mb-8">
        Your partnership inquiry has been sent to Nikita Wilson. Keep an eye on your inbox —
        we'll be in touch shortly to schedule a discovery call.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          Back to Home
        </Link>
        <a
          href="mailto:n.wilson@myhealthstatus.org"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          Email directly
        </a>
      </div>
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white';

const selectCls =
  'w-full appearance-none border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white pr-8';
