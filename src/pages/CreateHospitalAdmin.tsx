import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, AlertTriangle, Building2, Hash, Mail, Lock,
  User, CheckCircle, AlertCircle, Loader2, ArrowLeft, Copy, Check,
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../lib/firebase';

interface FormState {
  hospitalName: string;
  hospitalCode: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

interface SuccessData {
  hospitalId: string;
  userId: string;
  memberId: string;
  hospitalName: string;
  hospitalCode: string;
  adminEmail: string;
}

const EMPTY: FormState = {
  hospitalName: '',
  hospitalCode: '',
  adminEmail: '',
  adminPassword: '',
  adminName: '',
};

export default function CreateHospitalAdmin() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.adminPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const createHospitalAdmin = httpsCallable(functions, 'createHospitalAdmin');
      const result = await createHospitalAdmin({
        hospitalName: form.hospitalName.trim(),
        hospitalCode: form.hospitalCode.trim(),
        adminEmail:   form.adminEmail.trim(),
        adminPassword: form.adminPassword,
        adminName:    form.adminName.trim(),
      });

      const data = result.data as {
        hospitalId: string;
        userId: string;
        memberId: string;
      };

      setSuccess({
        hospitalId:   data.hospitalId,
        userId:       data.userId,
        memberId:     data.memberId,
        hospitalName: form.hospitalName.trim(),
        hospitalCode: form.hospitalCode.trim().toUpperCase(),
        adminEmail:   form.adminEmail.trim(),
      });
      setForm(EMPTY);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(value: string, key: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">MyHealthStatus</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Warning banner */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl px-4 py-3.5 mb-8">
          <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">TESTING ONLY</p>
            <p className="text-sm text-amber-700 mt-0.5">
              This page creates hospital admin accounts for development and testing purposes.
              It should be removed or access-restricted before production launch.
            </p>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Hospital Admin Account</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Sets up a new hospital record and a linked <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">hospital_admin</code> user account in one step.
          </p>
        </div>

        {success ? (
          <SuccessCard
            data={success}
            copied={copied}
            onCopy={copyToClipboard}
            onCreateAnother={() => setSuccess(null)}
          />
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Account Details</h2>
              <p className="text-xs text-gray-400 mt-0.5">All fields are required.</p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
              {/* Hospital section */}
              <div className="space-y-1 mb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hospital</p>
              </div>

              <Field label="Hospital Name" icon={<Building2 size={14} className="text-gray-400" />}>
                <input
                  type="text"
                  placeholder="Test Clinic Downtown"
                  value={form.hospitalName}
                  onChange={e => set('hospitalName', e.target.value)}
                  required
                  autoFocus
                  className={inputCls}
                />
              </Field>

              <Field
                label="Hospital Code"
                icon={<Hash size={14} className="text-gray-400" />}
                hint="Unique identifier, e.g. CLINIC-001"
              >
                <input
                  type="text"
                  placeholder="CLINIC-TEST-001"
                  value={form.hospitalCode}
                  onChange={e => set('hospitalCode', e.target.value.toUpperCase())}
                  required
                  className={`${inputCls} font-mono uppercase tracking-wide`}
                />
              </Field>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin User</p>
              </div>

              <Field label="Admin Name" icon={<User size={14} className="text-gray-400" />}>
                <input
                  type="text"
                  placeholder="Test Administrator"
                  value={form.adminName}
                  onChange={e => set('adminName', e.target.value)}
                  required
                  className={inputCls}
                />
              </Field>

              <Field label="Admin Email" icon={<Mail size={14} className="text-gray-400" />}>
                <input
                  type="email"
                  placeholder="admin@testclinic.com"
                  value={form.adminEmail}
                  onChange={e => set('adminEmail', e.target.value)}
                  required
                  className={inputCls}
                />
              </Field>

              <Field
                label="Password"
                icon={<Lock size={14} className="text-gray-400" />}
                hint="Minimum 8 characters"
              >
                <input
                  type="password"
                  placeholder="••••••••"
                  value={form.adminPassword}
                  onChange={e => set('adminPassword', e.target.value)}
                  minLength={8}
                  required
                  className={inputCls}
                />
                {form.adminPassword.length > 0 && form.adminPassword.length < 8 && (
                  <p className="text-xs text-red-500 mt-1">
                    {8 - form.adminPassword.length} more character{8 - form.adminPassword.length !== 1 ? 's' : ''} needed
                  </p>
                )}
              </Field>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 text-sm text-red-700">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5 text-red-500" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Create Hospital Admin Account'
                )}
              </button>
            </form>
          </div>
        )}

        {/* Quick test data */}
        {!success && (
          <div className="mt-6 bg-gray-800 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick-fill test data</p>
            <div className="space-y-1 font-mono text-xs text-gray-300">
              <div><span className="text-gray-500">Hospital Name:</span>  Test Clinic Downtown</div>
              <div><span className="text-gray-500">Hospital Code:</span>  CLINIC-TEST-001</div>
              <div><span className="text-gray-500">Admin Email:</span>    admin@testclinic.com</div>
              <div><span className="text-gray-500">Password:</span>       TestPass123!</div>
              <div><span className="text-gray-500">Admin Name:</span>     Test Administrator</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  hint,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SuccessCard({
  data,
  copied,
  onCopy,
  onCreateAnother,
}: {
  data: SuccessData;
  copied: string | null;
  onCopy: (v: string, k: string) => void;
  onCreateAnother: () => void;
}) {
  const rows: { label: string; value: string; key: string }[] = [
    { label: 'Hospital Name',  value: data.hospitalName, key: 'name' },
    { label: 'Hospital Code',  value: data.hospitalCode, key: 'code' },
    { label: 'Hospital ID',    value: data.hospitalId,   key: 'hid' },
    { label: 'Admin Email',    value: data.adminEmail,   key: 'email' },
    { label: 'Member ID',      value: data.memberId,     key: 'mid' },
    { label: 'User ID',        value: data.userId,       key: 'uid' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 bg-green-50">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <CheckCircle size={20} className="text-green-600" />
        </div>
        <div>
          <p className="text-base font-bold text-gray-900">Hospital admin created successfully!</p>
          <p className="text-sm text-gray-500 mt-0.5">
            Login at{' '}
            <Link to="/hospital-dashboard" className="text-blue-600 underline font-medium">
              /hospital-dashboard
            </Link>{' '}
            with the credentials below.
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {rows.map(({ label, value, key }) => (
          <div key={key} className="flex items-center justify-between px-6 py-3.5 gap-4">
            <span className="text-sm text-gray-500 flex-shrink-0 w-32">{label}</span>
            <span className="text-sm font-mono text-gray-800 truncate flex-1">{value}</span>
            <button
              onClick={() => onCopy(value, key)}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              title="Copy"
            >
              {copied === key
                ? <Check size={13} className="text-green-600" />
                : <Copy size={13} />}
            </button>
          </div>
        ))}
      </div>

      <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
        <Link
          to="/hospital-dashboard"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm text-center"
        >
          Go to Hospital Dashboard
        </Link>
        <button
          onClick={onCreateAnother}
          className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 font-medium py-2.5 px-5 rounded-xl transition-colors text-sm"
        >
          Create Another
        </button>
      </div>
    </div>
  );
}

const inputCls =
  'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white';
