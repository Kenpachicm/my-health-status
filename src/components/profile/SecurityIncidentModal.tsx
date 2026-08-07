import { useState } from 'react';
import { X, AlertTriangle, Upload, Shield, Check } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface SecurityIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: (ticketNumber: string) => void;
}

const issueTypes = [
  'Suspicious login activity',
  'Unauthorized access to my account',
  'Suspicious share access',
  'Phishing attempt',
  'Data breach concern',
  'Lost/stolen device with active session',
  'Suspicious email from MyHealthStatus',
  'Other security concern',
];

const severityLevels = [
  { value: 'critical', label: 'Critical', icon: '🔴', description: 'Immediate attention needed' },
  { value: 'moderate', label: 'Moderate', icon: '🟡', description: 'Needs investigation' },
  { value: 'low', label: 'Low', icon: '🟢', description: 'General concern' },
];

const affectedResources = [
  'My account',
  'Shared results',
  'Specific test results',
  'Payment information',
  'Other',
];

export default function SecurityIncidentModal({ isOpen, onClose, onSubmitted }: SecurityIncidentModalProps) {
  const [formData, setFormData] = useState({
    issueType: '',
    severity: 'moderate',
    description: '',
    occurredAt: new Date().toISOString().slice(0, 16),
    affectedResources: [] as string[],
    contactPhone: '',
    preferredResponseTime: 'within_24_hours',
    lockAccount: false,
    revokeShares: false,
    endSessions: false,
    changePassword: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    if (!formData.description || formData.description.length < 50) {
      newErrors.description = 'Please provide at least 50 characters describing the issue';
    }

    if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      const immediateActions = [];
      if (formData.lockAccount) immediateActions.push('lock_account');
      if (formData.revokeShares) immediateActions.push('revoke_shares');
      if (formData.endSessions) immediateActions.push('end_sessions');
      if (formData.changePassword) immediateActions.push('change_password');

      const incidentRef = await addDoc(collection(db, 'security_incidents'), {
        user_id: user.uid,
        ticket_number: '',
        issue_type: formData.issueType,
        severity: formData.severity,
        description: formData.description,
        occurred_at: formData.occurredAt,
        affected_resources: formData.affectedResources,
        contact_email: user.email,
        contact_phone: formData.contactPhone || null,
        preferred_response_time: formData.preferredResponseTime,
        immediate_actions: immediateActions,
        ip_address: 'Captured at submission',
        device_info: navigator.userAgent,
        status: 'new',
        created_at: serverTimestamp(),
      });

      const ticketNumber = `SEC-${incidentRef.id.slice(-6).toUpperCase()}`;
      await updateDoc(incidentRef, { ticket_number: ticketNumber });

      // Log the security incident report
      await addDoc(collection(db, 'security_activity_log'), {
        user_id: user.uid,
        event_type: 'security_incident_reported',
        event_description: `Security incident reported: ${formData.issueType}`,
        status: 'success',
        metadata: { ticket_number: ticketNumber, severity: formData.severity },
        created_at: serverTimestamp(),
      });

      // Execute immediate actions
      if (formData.endSessions) {
        const sessionsSnapshot = await getDocs(
          query(collection(db, 'user_sessions'), where('user_id', '==', user.uid))
        );
        await Promise.all(
          sessionsSnapshot.docs.map((d) =>
            updateDoc(d.ref, { ended_at: new Date().toISOString() })
          )
        );
      }

      if (formData.revokeShares) {
        const sharesSnapshot = await getDocs(
          query(
            collection(db, 'shares'),
            where('user_id', '==', user.uid),
            where('revoked_at', '==', null)
          )
        );
        await Promise.all(
          sharesSnapshot.docs.map((d) =>
            updateDoc(d.ref, { revoked_at: new Date().toISOString() })
          )
        );
      }

      onSubmitted(ticketNumber);
      onClose();
    } catch (error) {
      console.error('Error submitting security incident:', error);
      setErrors({ submit: 'Failed to submit security report. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report a Security Issue</h2>
              <p className="text-sm text-gray-600">Your security is our priority</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Report any suspicious activity or security concerns immediately. Our security team will investigate and respond based on the severity level.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Issue Type <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.issueType}
              onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.issueType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an issue type...</option>
              {issueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {errors.issueType && (
              <p className="mt-1 text-sm text-red-600">{errors.issueType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Severity <span className="text-red-600">*</span>
            </label>
            <div className="space-y-3">
              {severityLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.severity === level.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="severity"
                    value={level.value}
                    checked={formData.severity === level.value}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{level.icon}</span>
                      <span className="font-semibold text-gray-900">{level.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description <span className="text-red-600">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Please describe what happened in detail..."
              rows={6}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-500">
                {formData.description.length} / 1000 characters
                {formData.description.length < 50 && ` (minimum 50)`}
              </p>
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              When did this occur?
            </label>
            <input
              type="datetime-local"
              value={formData.occurredAt}
              onChange={(e) => setFormData({ ...formData, occurredAt: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Affected Resources (optional)
            </label>
            <div className="space-y-2">
              {affectedResources.map((resource) => (
                <label key={resource} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.affectedResources.includes(resource)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          affectedResources: [...formData.affectedResources, resource],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          affectedResources: formData.affectedResources.filter((r) => r !== resource),
                        });
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{resource}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone Number (optional)
            </label>
            <input
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Preferred Response Time
            </label>
            <select
              value={formData.preferredResponseTime}
              onChange={(e) => setFormData({ ...formData, preferredResponseTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="immediate">Immediate</option>
              <option value="within_24_hours">Within 24 hours</option>
              <option value="within_48_hours">Within 48 hours</option>
            </select>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Immediate Security Actions
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              We can take these actions immediately to secure your account
            </p>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.lockAccount}
                  onChange={(e) => setFormData({ ...formData, lockAccount: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Lock my account</span>
                  <p className="text-sm text-gray-600">Temporarily disable access (can be unlocked by support)</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.revokeShares}
                  onChange={(e) => setFormData({ ...formData, revokeShares: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Revoke all active shares</span>
                  <p className="text-sm text-gray-600">Immediately cancel all shared result links</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.endSessions}
                  onChange={(e) => setFormData({ ...formData, endSessions: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">End all active sessions</span>
                  <p className="text-sm text-gray-600">Sign out from all devices except this one</p>
                </div>
              </label>
              <label className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.changePassword}
                  onChange={(e) => setFormData({ ...formData, changePassword: e.target.checked })}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Prompt password change</span>
                  <p className="text-sm text-gray-600">Require password change after submission</p>
                </div>
              </label>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Shield size={20} />
                  <span>Submit Security Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
