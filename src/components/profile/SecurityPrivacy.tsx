import { useState, useEffect } from 'react';
import {
  Shield, Lock, Bell, CheckCircle, AlertTriangle, Monitor,
  Smartphone, Tablet, Globe, Clock, Download, Trash2,
  Key, Mail, ChevronDown, ChevronUp, ExternalLink,
  AlertCircle, Award, FileText, HelpCircle, X
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getDoc, addDoc, updateDoc, doc, serverTimestamp, limit, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import SecurityIncidentModal from './SecurityIncidentModal';
import IncidentConfirmation from './IncidentConfirmation';

interface Session {
  id: string;
  device_type: string;
  device_name: string;
  browser: string;
  ip_address: string;
  location: string;
  login_time: string;
  last_activity: string;
  is_current: boolean;
}

interface ActivityLog {
  id: string;
  event_type: string;
  event_description: string;
  device_name: string;
  browser: string;
  location: string;
  status: string;
  created_at: string;
}

interface SecurityPreferences {
  auto_logout_enabled: boolean;
  auto_logout_minutes: number;
  notify_new_device: boolean;
  notify_new_location: boolean;
  notify_failed_login: boolean;
  allow_anonymous_stats: boolean;
}

const eventTypeIcons: Record<string, { icon: any; color: string }> = {
  login_success: { icon: CheckCircle, color: 'text-green-600' },
  login_failed: { icon: X, color: 'text-red-600' },
  logout: { icon: Lock, color: 'text-gray-600' },
  password_changed: { icon: Key, color: 'text-blue-600' },
  email_changed: { icon: Mail, color: 'text-orange-600' },
  mfa_enabled: { icon: Shield, color: 'text-green-600' },
  mfa_disabled: { icon: AlertTriangle, color: 'text-yellow-600' },
  session_ended: { icon: X, color: 'text-gray-600' },
  suspicious_activity: { icon: AlertTriangle, color: 'text-red-600' },
};

export default function SecurityPrivacy() {
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [preferences, setPreferences] = useState<SecurityPreferences>({
    auto_logout_enabled: false,
    auto_logout_minutes: 60,
    notify_new_device: true,
    notify_new_location: true,
    notify_failed_login: true,
    allow_anonymous_stats: false,
  });
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    encryption: false,
    bestPractices: true,
  });
  const [loading, setLoading] = useState(true);
  const [securityScore, setSecurityScore] = useState<'strong' | 'good' | 'needs-attention'>('good');
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState({
    ticketNumber: '',
    severity: 'moderate' as 'critical' | 'moderate' | 'low',
    immediateActions: [] as string[],
    email: '',
  });

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch sessions
      const sessionsSnapshot = await getDocs(
        query(
          collection(db, 'user_sessions'),
          where('user_id', '==', user.uid),
          where('ended_at', '==', null),
          orderBy('last_activity', 'desc')
        )
      );
      const sessionsData = sessionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Session[];
      setSessions(sessionsData);

      // Fetch activity logs
      const logsSnapshot = await getDocs(
        query(
          collection(db, 'security_activity_log'),
          where('user_id', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(20)
        )
      );
      setActivityLogs(logsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as ActivityLog[]);

      // Fetch preferences
      const prefsDoc = await getDoc(doc(db, 'security_preferences', user.uid));
      if (prefsDoc.exists()) {
        setPreferences({ ...prefsDoc.data() } as SecurityPreferences);
      } else {
        // Create default preferences
        await setDoc(doc(db, 'security_preferences', user.uid), {
          user_id: user.uid,
          ...preferences,
          created_at: serverTimestamp(),
        });
      }

      // Calculate security score
      calculateSecurityScore(sessionsData.length);
    } catch (error) {
      console.error('Error fetching security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSecurityScore = (sessionCount: number) => {
    // Simple scoring logic - can be enhanced
    if (sessionCount > 5) {
      setSecurityScore('needs-attention');
    } else if (sessionCount > 2) {
      setSecurityScore('good');
    } else {
      setSecurityScore('strong');
    }
  };

  const endSession = async (sessionId: string) => {
    try {
      await updateDoc(doc(db, 'user_sessions', sessionId), {
        ended_at: new Date().toISOString(),
      });

      setSessions(sessions.filter(s => s.id !== sessionId));

      // Log activity
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, 'security_activity_log'), {
          user_id: user.uid,
          event_type: 'session_ended',
          event_description: 'Session ended by user',
          status: 'success',
          created_at: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const endAllOtherSessions = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const otherSessionsSnapshot = await getDocs(
        query(
          collection(db, 'user_sessions'),
          where('user_id', '==', user.uid),
          where('is_current', '==', false)
        )
      );
      await Promise.all(
        otherSessionsSnapshot.docs.map((d) =>
          updateDoc(d.ref, { ended_at: new Date().toISOString() })
        )
      );

      setSessions(sessions.filter(s => s.is_current));

      await addDoc(collection(db, 'security_activity_log'), {
        user_id: user.uid,
        event_type: 'session_ended',
        event_description: 'All other sessions ended by user',
        status: 'success',
        created_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error ending sessions:', error);
    }
  };

  const updatePreference = async (key: keyof SecurityPreferences, value: any) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);

      await updateDoc(doc(db, 'security_preferences', user.uid), {
        [key]: value,
      });
    } catch (error) {
      console.error('Error updating preference:', error);
    }
  };

  const handleIncidentSubmitted = async (ticketNumber: string) => {
    const user = auth.currentUser;
    const incidentSnapshot = await getDocs(
      query(
        collection(db, 'security_incidents'),
        where('ticket_number', '==', ticketNumber),
        limit(1)
      )
    );
    const incidentDoc = incidentSnapshot.docs[0];
    const incident = incidentDoc ? incidentDoc.data() : null;

    setSubmittedTicket({
      ticketNumber,
      severity: (incident?.severity as 'critical' | 'moderate' | 'low') || 'moderate',
      immediateActions: incident?.immediate_actions || [],
      email: user?.email || '',
    });
    setShowIncidentModal(false);
    setShowConfirmation(true);
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return Smartphone;
      case 'tablet': return Tablet;
      default: return Monitor;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Active now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const securityScoreConfig = {
    strong: {
      color: 'bg-green-100 text-green-800 border-green-300',
      icon: 'text-green-600',
      label: 'Strong',
      message: 'Your account security is excellent',
    },
    good: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: 'text-yellow-600',
      label: 'Good',
      message: 'Your account is secure, but could be improved',
    },
    'needs-attention': {
      color: 'bg-red-100 text-red-800 border-red-300',
      icon: 'text-red-600',
      label: 'Needs Attention',
      message: 'Please review your security settings',
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security & Privacy</h1>
          <p className="text-gray-600">Manage your account security and privacy settings</p>
        </div>

        {/* Security Status Card */}
        <div className={`mb-8 p-6 rounded-xl border-2 ${securityScoreConfig[securityScore].color}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-xl bg-white/50`}>
                <Shield className={securityScoreConfig[securityScore].icon} size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Your Account Security</h2>
                <p className="text-lg font-semibold mb-2">
                  Status: {securityScoreConfig[securityScore].label}
                </p>
                <p className="text-sm opacity-90">{securityScoreConfig[securityScore].message}</p>
              </div>
            </div>
          </div>

          {/* Security Checklist */}
          <div className="mt-6 grid md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
              <span>Email Verified</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
              <span>Strong Password</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
              <span>No Suspicious Activity</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <AlertCircle size={18} className="text-gray-400 flex-shrink-0" />
              <span className="opacity-60">Multi-Factor Authentication (Coming Soon)</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: Shield },
                  { id: 'sessions', label: 'Active Sessions', icon: Monitor },
                  { id: 'activity', label: 'Security Activity', icon: FileText },
                  { id: 'encryption', label: 'Data Protection', icon: Lock },
                  { id: 'privacy', label: 'Privacy Settings', icon: Globe },
                  { id: 'notifications', label: 'Notifications', icon: Bell },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Sessions Section */}
            {activeSection === 'sessions' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Active Sessions & Devices</h3>
                    <p className="text-sm text-gray-600 mt-1">Manage where you're logged in</p>
                  </div>
                  {sessions.filter(s => !s.is_current).length > 0 && (
                    <button
                      onClick={endAllOtherSessions}
                      className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-colors text-sm"
                    >
                      End All Other Sessions
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {sessions.map((session) => {
                    const DeviceIcon = getDeviceIcon(session.device_type);
                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border-2 ${
                          session.is_current
                            ? 'border-green-300 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <DeviceIcon className="text-gray-600 mt-1" size={24} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {session.device_name} • {session.browser}
                                </span>
                                {session.is_current && (
                                  <span className="px-2 py-0.5 bg-green-600 text-white text-xs font-semibold rounded-full">
                                    Current Session
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Globe size={14} />
                                  <span>{session.location}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span>IP: {session.ip_address || '192.168.***.***'}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock size={14} />
                                  <span>
                                    Logged in {new Date(session.login_time).toLocaleDateString()} at{' '}
                                    {new Date(session.login_time).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium">
                                    Last activity: {formatTimeAgo(session.last_activity)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          {!session.is_current && (
                            <button
                              onClick={() => endSession(session.id)}
                              className="px-4 py-2 text-red-600 border border-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors text-sm"
                            >
                              End Session
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {sessions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Monitor size={48} className="mx-auto mb-3 text-gray-400" />
                      <p>No active sessions found</p>
                    </div>
                  )}
                </div>

                {/* Auto-Logout Settings */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Auto Sign-Out Settings</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span className="text-gray-700">Auto sign-out after inactivity</span>
                      <input
                        type="checkbox"
                        checked={preferences.auto_logout_enabled}
                        onChange={(e) => updatePreference('auto_logout_enabled', e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </label>
                    {preferences.auto_logout_enabled && (
                      <div>
                        <label className="block text-sm text-gray-700 mb-2">Inactivity timeout</label>
                        <select
                          value={preferences.auto_logout_minutes}
                          onChange={(e) => updatePreference('auto_logout_minutes', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value={15}>15 minutes</option>
                          <option value={30}>30 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={240}>4 hours</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Security Activity Log */}
            {activeSection === 'activity' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Security Activity</h3>
                  <p className="text-sm text-gray-600 mt-1">Monitor actions on your account</p>
                </div>

                <div className="space-y-3">
                  {activityLogs.map((log) => {
                    const eventConfig = eventTypeIcons[log.event_type] || {
                      icon: AlertCircle,
                      color: 'text-gray-600'
                    };
                    const Icon = eventConfig.icon;

                    return (
                      <div key={log.id} className="flex items-start space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <Icon className={`${eventConfig.color} mt-1 flex-shrink-0`} size={20} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-gray-900">{log.event_description}</span>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                              log.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status === 'success' ? '✓ Success' : '⚠ Failed'}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                            <span>{new Date(log.created_at).toLocaleString()}</span>
                            <span>•</span>
                            <span>{log.device_name}, {log.browser}</span>
                            <span>•</span>
                            <span>{log.location}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {activityLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                      <p>No security activity recorded yet</p>
                    </div>
                  )}
                </div>

                <button className="mt-6 w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                  <Download size={20} />
                  <span>Export Activity Log (CSV)</span>
                </button>
              </div>
            )}

            {/* Data Protection & Encryption */}
            {activeSection === 'encryption' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Data Protection & Encryption</h3>
                  <p className="text-sm text-gray-600 mt-1">Your data security and compliance status</p>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Lock className="text-green-600" size={32} />
                    <div>
                      <h4 className="text-xl font-bold text-green-900">All Your Data is Encrypted</h4>
                      <p className="text-sm text-green-700">Bank-level security for your health information</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedSections({ ...expandedSections, encryption: !expandedSections.encryption })}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
                >
                  <span className="font-semibold text-gray-900">Encryption Details</span>
                  {expandedSections.encryption ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.encryption && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">At Rest:</h5>
                      <div className="space-y-2">
                        {[
                          'Test results encrypted with AES-256',
                          'Personal information encrypted',
                          'Share tokens encrypted',
                          'Access logs encrypted'
                        ].map((item, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">In Transit:</h5>
                      <div className="space-y-2">
                        {[
                          'TLS 1.3 encryption for all connections',
                          'Secure API communications',
                          'Encrypted file uploads'
                        ].map((item, i) => (
                          <div key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                            <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'HIPAA Compliant', icon: Award },
                    { label: 'SOC 2 Type I', icon: Shield },
                    { label: '256-bit Encryption', icon: Lock },
                    { label: 'Zero-Knowledge', icon: Key },
                  ].map((badge, i) => {
                    const Icon = badge.icon;
                    return (
                      <div key={i} className="p-4 bg-blue-50 rounded-lg text-center border border-blue-200">
                        <Icon className="text-blue-600 mx-auto mb-2" size={24} />
                        <p className="text-xs font-semibold text-blue-900">{badge.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Data Retention & Privacy</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage your data and privacy preferences</p>
                </div>

                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-3">Your Data Retention</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p><strong>Test Results:</strong> Stored indefinitely until you delete</p>
                    <p><strong>Deleted Results:</strong> Recoverable for 30 days, then permanently deleted</p>
                    <p><strong>Access Logs:</strong> Retained for 7 years (HIPAA requirement)</p>
                    <p><strong>Account Data:</strong> Deleted 30 days after account deletion request</p>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                    <Download size={20} />
                    <span>Download My Data (HIPAA Request)</span>
                  </button>
                  <button className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-center space-x-2">
                    <Trash2 size={20} />
                    <span>Request Account Deletion</span>
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">Privacy Preferences</h4>
                  <label className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={preferences.allow_anonymous_stats}
                      onChange={(e) => updatePreference('allow_anonymous_stats', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-0.5 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900 block mb-1">
                        Allow anonymous data for public health statistics
                      </span>
                      <p className="text-sm text-gray-600">
                        Your data helps improve sexual health awareness. Data is fully anonymized and aggregated. No personal information is shared.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Security Notifications */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Security Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">Configure how you receive security alerts</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800 font-semibold mb-2">Critical security notifications cannot be disabled</p>
                    <p className="text-xs text-red-700">Password changes, email changes, and MFA changes will always notify you</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      { key: 'notify_failed_login', label: 'Failed login attempts', critical: true },
                      { key: 'notify_new_device', label: 'New device login', critical: false },
                      { key: 'notify_new_location', label: 'Login from new location', critical: false },
                    ].map((notification) => (
                      <label
                        key={notification.key}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          notification.critical ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200 hover:bg-gray-50 cursor-pointer'
                        } transition-colors`}
                      >
                        <div className="flex items-center space-x-3">
                          <Bell size={20} className="text-gray-600" />
                          <span className="font-medium text-gray-900">{notification.label}</span>
                          {notification.critical && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                              Always On
                            </span>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences[notification.key as keyof SecurityPreferences] as boolean}
                          onChange={(e) => !notification.critical && updatePreference(notification.key as keyof SecurityPreferences, e.target.checked)}
                          disabled={notification.critical}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Overview / Best Practices */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveSection('sessions')}
                      className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <Monitor className="text-blue-600 mb-2" size={24} />
                      <h4 className="font-semibold text-gray-900 mb-1">Review Active Sessions</h4>
                      <p className="text-sm text-gray-600">Manage devices and sign out remotely</p>
                    </button>
                    <button
                      onClick={() => setActiveSection('activity')}
                      className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100 transition-colors border border-green-200"
                    >
                      <FileText className="text-green-600 mb-2" size={24} />
                      <h4 className="font-semibold text-gray-900 mb-1">View Security Activity</h4>
                      <p className="text-sm text-gray-600">Check recent account events</p>
                    </button>
                    <button
                      onClick={() => setShowIncidentModal(true)}
                      className="p-4 bg-red-50 rounded-lg text-left hover:bg-red-100 transition-colors border border-red-200"
                    >
                      <AlertTriangle className="text-red-600 mb-2" size={24} />
                      <h4 className="font-semibold text-gray-900 mb-1">Report Security Issue</h4>
                      <p className="text-sm text-gray-600">Report suspicious activity</p>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <button
                    onClick={() => setExpandedSections({ ...expandedSections, bestPractices: !expandedSections.bestPractices })}
                    className="w-full flex items-center justify-between mb-4"
                  >
                    <h3 className="text-xl font-bold text-gray-900">Security Best Practices</h3>
                    {expandedSections.bestPractices ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  {expandedSections.bestPractices && (
                    <div className="space-y-3">
                      {[
                        'Use a unique password for MyHealthStatus',
                        'Enable Two-Factor Authentication when available',
                        "Don't share your Member ID carelessly",
                        'Review active sessions regularly',
                        'Sign out of public/shared devices',
                        'Keep your email secure',
                        "Don't click suspicious links",
                        'Contact support if you see unusual activity',
                      ].map((tip, i) => (
                        <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{tip}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <a
                      href="#"
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <HelpCircle className="text-blue-600" size={20} />
                        <span className="font-semibold text-blue-900">Security Best Practices Guide</span>
                      </div>
                      <ExternalLink size={16} className="text-blue-600" />
                    </a>
                    <button
                      onClick={() => setShowIncidentModal(true)}
                      className="w-full flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-700 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                    >
                      <AlertTriangle size={20} />
                      <span>Report Suspicious Activity</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SecurityIncidentModal
        isOpen={showIncidentModal}
        onClose={() => setShowIncidentModal(false)}
        onSubmitted={handleIncidentSubmitted}
      />

      <IncidentConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        ticketNumber={submittedTicket.ticketNumber}
        severity={submittedTicket.severity}
        immediateActions={submittedTicket.immediateActions}
        userEmail={submittedTicket.email}
      />
    </div>
  );
}
