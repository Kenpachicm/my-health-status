import { useState } from 'react';
import { Monitor, Smartphone, Tablet, MapPin, Clock, X } from 'lucide-react';

interface ActiveSessionsProps {
  user: any;
}

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  location: string;
  ip: string;
  lastActivity: string;
  isCurrent: boolean;
}

export default function ActiveSessions({ user }: ActiveSessionsProps) {
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'current',
      device: 'MacBook Pro',
      deviceType: 'desktop',
      browser: 'Chrome 118',
      location: 'San Francisco, CA',
      ip: '192.168.***.123',
      lastActivity: 'Active now',
      isCurrent: true,
    },
    {
      id: '2',
      device: 'iPhone 14',
      deviceType: 'mobile',
      browser: 'Safari 16',
      location: 'New York, NY',
      ip: '192.168.***.234',
      lastActivity: '2 hours ago',
      isCurrent: false,
    },
    {
      id: '3',
      device: 'iPad Pro',
      deviceType: 'tablet',
      browser: 'Safari 16',
      location: 'Los Angeles, CA',
      ip: '192.168.***.345',
      lastActivity: '1 day ago',
      isCurrent: false,
    },
  ]);
  const [showConfirmSignOutAll, setShowConfirmSignOutAll] = useState(false);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone size={20} />;
      case 'tablet':
        return <Tablet size={20} />;
      default:
        return <Monitor size={20} />;
    }
  };

  const handleEndSession = (sessionId: string) => {
    setSessions(sessions.filter(s => s.id !== sessionId));
  };

  const handleSignOutAll = () => {
    setSessions(sessions.filter(s => s.isCurrent));
    setShowConfirmSignOutAll(false);
  };

  const otherSessions = sessions.filter(s => !s.isCurrent);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Active Sessions</h3>
            <p className="text-sm text-gray-500 mt-1">Manage devices where you're currently logged in</p>
          </div>
          {otherSessions.length > 0 && (
            <button
              onClick={() => setShowConfirmSignOutAll(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium text-sm transition-colors"
            >
              Sign Out All
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                session.isCurrent
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`p-2 rounded-lg ${
                    session.isCurrent ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {getDeviceIcon(session.deviceType)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {session.device}, {session.browser}
                      </h4>
                      {session.isCurrent && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1.5 animate-pulse"></span>
                          Current Session
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <MapPin size={14} />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs">IP: {session.ip}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>{session.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {!session.isCurrent && (
                  <button
                    onClick={() => handleEndSession(session.id)}
                    className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="End session"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {otherSessions.length === 0 && (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <Monitor size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">No other active sessions</p>
              <p className="text-sm text-gray-500 mt-1">You're only logged in on this device</p>
            </div>
          )}
        </div>
      </div>

      {showConfirmSignOutAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Sign Out All Other Sessions?</h3>
            <p className="text-gray-600 mb-6">
              This will sign you out of all devices except this one. You'll need to log in again on those devices.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 flex items-start space-x-2">
              <div className="text-amber-600 flex-shrink-0 mt-0.5">⚠️</div>
              <p className="text-sm text-amber-800">
                This action cannot be undone. Active sessions will be terminated immediately.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmSignOutAll(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOutAll}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Sign Out All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
