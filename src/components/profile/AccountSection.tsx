import { useState, useEffect } from 'react';
import { Copy, Check, CreditCard as Edit, Settings } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import EditProfileModal from './EditProfileModal';

interface AccountSectionProps {
  user: any;
}

export default function AccountSection({ user }: AccountSectionProps) {
  const [profile, setProfile] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const profileDoc = await getDoc(doc(db, 'users', user.id));

      if (profileDoc.exists()) {
        setProfile({ id: profileDoc.id, ...profileDoc.data() });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    if (!profile?.full_name) return 'U';
    const names = profile.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return profile.full_name[0].toUpperCase();
  };

  const copyMemberId = () => {
    if (profile?.member_id) {
      navigator.clipboard.writeText(profile.member_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getLastLogin = () => {
    const now = new Date();
    const lastLogin = new Date(user.last_sign_in_at || user.created_at);
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {getInitials()}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {profile?.full_name || 'User'}
              </h2>
              <div className="flex items-center justify-center sm:justify-start space-x-2 text-gray-600 mb-4">
                <span>{user.email}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  <Check size={12} className="mr-1" />
                  Verified
                </span>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-blue-600 font-medium mb-2">Your Member ID</p>
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <span className="text-2xl font-bold text-blue-900 font-mono tracking-wider">
                    {profile?.member_id || 'Loading...'}
                  </span>
                  <button
                    onClick={copyMemberId}
                    className="p-2 hover:bg-blue-100 rounded transition-colors"
                    title="Copy Member ID"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-600" />
                    ) : (
                      <Copy size={18} className="text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-blue-700 mt-2">
                  Provide this to clinics when getting tested
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                <div>
                  <span className="text-gray-500">Member since:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {formatDate(user.created_at)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last login:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {getLastLogin()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Edit size={18} />
                  <span>Edit Profile</span>
                </button>
                <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                  <Settings size={18} />
                  <span>Account Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          profile={profile}
          onUpdate={loadProfile}
        />
      )}
    </>
  );
}
