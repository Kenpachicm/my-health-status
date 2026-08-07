import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Bell, Lock, Check, Smartphone } from 'lucide-react';
import {
  registerForPushNotifications,
  unregisterForPushNotifications,
  saveNotificationPreferences,
  loadNotificationPreferences,
} from '../../lib/firebase';

interface NotificationPreferencesProps {
  user: any;
}

interface PushPrefs {
  push_new_results: boolean;
  push_share_created: boolean;
  push_share_expiring: boolean;
  push_share_revoked: boolean;
}

const DEFAULT_PUSH_PREFS: PushPrefs = {
  push_new_results: true,
  push_share_created: true,
  push_share_expiring: true,
  push_share_revoked: true,
};

export default function NotificationPreferences({ user }: NotificationPreferencesProps) {
  const [emailPrefs, setEmailPrefs] = useState({
    share_access: true,
    share_expiration: true,
    new_results: true,
    security_alerts: true,
    account_updates: false,
    marketing: false,
  });

  const [smsPrefs, setSmsPrefs] = useState({
    mfa_codes: true,
    security_alerts: false,
  });

  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushPrefs, setPushPrefs] = useState<PushPrefs>(DEFAULT_PUSH_PREFS);
  const [phoneNumber] = useState('+1 (555) 123-4567');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setPushSupported(true);
      setPushEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadNotificationPreferences(user.id).then((prefs) => {
        if (prefs) setPushPrefs(prefs);
      });
    }
  }, [user?.id]);

  const handleEmailToggle = async (key: string) => {
    const newPrefs = { ...emailPrefs, [key]: !emailPrefs[key as keyof typeof emailPrefs] };
    setEmailPrefs(newPrefs);
    await fakeSave();
  };

  const handleSmsToggle = async (key: string) => {
    const newPrefs = { ...smsPrefs, [key]: !smsPrefs[key as keyof typeof smsPrefs] };
    setSmsPrefs(newPrefs);
    await fakeSave();
  };

  const fakeSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date().toISOString());
      setTimeout(() => setLastSaved(null), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEnablePush = async () => {
    if (!user?.id) return;
    try {
      const token = await registerForPushNotifications(user.id);
      setPushEnabled(!!token);
    } catch (error) {
      console.error('Error enabling push notifications:', error);
    }
  };

  const handleDisablePush = async () => {
    if (!user?.id) return;
    try {
      await unregisterForPushNotifications(user.id);
      setPushEnabled(false);
    } catch (error) {
      console.error('Error disabling push notifications:', error);
    }
  };

  const handlePushPrefToggle = async (key: keyof PushPrefs) => {
    const newPrefs = { ...pushPrefs, [key]: !pushPrefs[key] };
    setPushPrefs(newPrefs);

    setSaving(true);
    try {
      await saveNotificationPreferences(user.id, newPrefs);
      setLastSaved(new Date().toISOString());
      setTimeout(() => setLastSaved(null), 2000);
    } catch (error) {
      console.error('Error saving push preferences:', error);
      setPushPrefs(pushPrefs);
    } finally {
      setSaving(false);
    }
  };

  const toggleClass = (on: boolean) =>
    `relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 ${
      on ? 'bg-blue-600' : 'bg-gray-300'
    }`;

  const toggleKnob = (on: boolean) =>
    `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      on ? 'translate-x-6' : 'translate-x-1'
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Preferences</h2>
        <p className="text-gray-600">Choose what updates you receive</p>
      </div>

      {lastSaved && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
          <Check className="text-green-600" size={18} />
          <span className="text-sm text-green-800 font-medium">All changes saved</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="text-blue-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Email Notifications</h3>
            <p className="text-sm text-gray-500">Choose what updates you receive via email</p>
          </div>
        </div>

        <div className="space-y-4">
          {([
            ['share_access', 'Share Access Alerts', 'Get notified immediately when a partner views your results'],
            ['share_expiration', 'Share Expiration', 'Receive alerts 24 hours before a share expires'],
            ['new_results', 'New Results Available', 'Get notified when a clinic uploads new results to your account'],
            ['account_updates', 'Product Updates', 'Learn about new MyHealthStatus features and improvements'],
            ['marketing', 'Tips & Educational Content', 'Receive sexual health tips and MyHealthStatus news'],
          ] as const).map(([key, title, desc]) => (
            <div key={key} className="flex items-start justify-between py-3 border-b border-gray-200">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{title}</p>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
              <button
                onClick={() => handleEmailToggle(key)}
                className={toggleClass(emailPrefs[key as keyof typeof emailPrefs])}
                disabled={saving}
              >
                <span className={toggleKnob(emailPrefs[key as keyof typeof emailPrefs])} />
              </button>
            </div>
          ))}

          <div className="flex items-start justify-between py-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900">Security Alerts</p>
                <Lock size={16} className="text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Critical security notifications (cannot be disabled)
              </p>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 opacity-50 cursor-not-allowed ml-4"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <MessageSquare className="text-green-600" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">SMS Notifications</h3>
            <p className="text-sm text-gray-500">Text message alerts (standard rates apply)</p>
          </div>
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Phone Number:</p>
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{phoneNumber}</span>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Update
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between py-3">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Critical Security Alerts</p>
              <p className="text-sm text-gray-500 mt-1">
                Password changes, suspicious login attempts
              </p>
            </div>
            <button
              onClick={() => handleSmsToggle('security_alerts')}
              className={toggleClass(smsPrefs.security_alerts)}
              disabled={saving}
            >
              <span className={toggleKnob(smsPrefs.security_alerts)} />
            </button>
          </div>
        </div>
      </div>

      {pushSupported && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Bell className="text-purple-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Push Notifications</h3>
              <p className="text-sm text-gray-500">Real-time alerts on your device</p>
            </div>
          </div>

          {!pushEnabled ? (
            <button
              onClick={handleEnablePush}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Enable Push Notifications
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-green-700 bg-green-50 px-4 py-3 rounded-lg flex-1 mr-4">
                  <Check size={18} />
                  <span className="text-sm font-medium">Push notifications are enabled</span>
                </div>
                <button
                  onClick={handleDisablePush}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Disable
                </button>
              </div>

              <div className="space-y-1 mt-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  <Smartphone size={16} className="inline mr-1" />
                  Choose which alerts you receive via push:
                </p>

                {([
                  ['push_new_results', 'New Lab Results', 'When a clinic uploads new results to your account'],
                  ['push_share_created', 'Share Created', 'Confirmation when you create a new share link'],
                  ['push_share_expiring', 'Share Expiring Soon', '24 hours before a share is set to expire'],
                  ['push_share_revoked', 'Share Revoked', 'When you or the system revokes a share'],
                ] as const).map(([key, title, desc]) => (
                  <div key={key} className="flex items-start justify-between py-3 border-b border-gray-200 last:border-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500 mt-1">{desc}</p>
                    </div>
                    <button
                      onClick={() => handlePushPrefToggle(key as keyof PushPrefs)}
                      className={toggleClass(pushPrefs[key as keyof PushPrefs])}
                      disabled={saving}
                    >
                      <span className={toggleKnob(pushPrefs[key as keyof PushPrefs])} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
