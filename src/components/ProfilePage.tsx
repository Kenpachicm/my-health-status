import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Bell, Database, Trash2, Settings, Lock } from 'lucide-react';
import AccountSection from './profile/AccountSection';
import SecuritySection from './profile/SecuritySection';
import SecurityPrivacy from './profile/SecurityPrivacy';
import NotificationPreferences from './profile/NotificationPreferences';
import StorageData from './profile/StorageData';

interface ProfilePageProps {
  user: any;
  onLogout: () => void;
}

export default function ProfilePage({ user, onLogout }: ProfilePageProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/my_health.png" alt="MyHealthStatus" className="w-8 h-8" />
            <span className="text-xl font-bold text-gray-900">MyHealthStatus</span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Settings</h1>
          <p className="text-gray-600">Manage your account and security preferences</p>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <nav className="sticky top-24 space-y-1">
              <button
                onClick={() => scrollToSection('account')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'account'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User size={20} />
                <span>Account</span>
              </button>
              <button
                onClick={() => scrollToSection('security')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'security'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield size={20} />
                <span>Security</span>
              </button>
              <button
                onClick={() => scrollToSection('security-privacy')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'security-privacy'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Lock size={20} />
                <span>Security & Privacy</span>
              </button>
              <button
                onClick={() => scrollToSection('notifications')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'notifications'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Bell size={20} />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => scrollToSection('storage')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'storage'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Database size={20} />
                <span>Storage & Data</span>
              </button>
              <button
                onClick={() => scrollToSection('delete')}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeSection === 'delete'
                    ? 'bg-red-50 text-red-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Trash2 size={20} />
                <span>Delete Account</span>
              </button>
            </nav>
          </aside>

          <div className="lg:col-span-3">
            <div className="lg:hidden mb-6">
              <select
                value={activeSection}
                onChange={(e) => scrollToSection(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="account">Account</option>
                <option value="security">Security</option>
                <option value="security-privacy">Security & Privacy</option>
                <option value="notifications">Notifications</option>
                <option value="storage">Storage & Data</option>
                <option value="delete">Delete Account</option>
              </select>
            </div>

            <div className="space-y-8">
              <section id="account">
                <AccountSection user={user} />
              </section>

              <section id="security">
                <SecuritySection user={user} />
              </section>

              <section id="security-privacy">
                <SecurityPrivacy />
              </section>

              <section id="notifications">
                <NotificationPreferences user={user} />
              </section>

              <section id="storage">
                <StorageData user={user} />
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
