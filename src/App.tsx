import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, registerForPushNotifications, unregisterForPushNotifications, onPushNotification } from './lib/firebase';
import LoginModal from './components/LoginModal';
import RegistrationModal from './components/RegistrationModal';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import VerifyPage from './components/VerifyPage';
import ProfilePage from './components/ProfilePage';
import StatisticsDashboard from './components/StatisticsDashboard';
import SurveyTaker from './components/survey/SurveyTaker';
import SurveyManagement from './components/admin/SurveyManagement';
import SurveyResults from './components/admin/SurveyResults';
import SecurityCompliancePage from './components/SecurityCompliancePage';
import HospitalDashboard from './components/HospitalDashboard';
import HospitalAdminRoute from './components/HospitalAdminRoute';
import PartnershipPage from './components/PartnershipPage';
import CreateHospitalAdmin from './pages/CreateHospitalAdmin';
import Documentation from './pages/Documentation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Changelog from './pages/Changelog';

interface User {
  id: string;
  email: string;
  memberId: string;
  role: string;
  hospitalId: string | null;
}

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Set a default user immediately from the auth credential so the
        // dashboard renders without waiting on Firestore (which may be
        // unreachable).  Enhance with the stored profile in the background.
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          memberId: 'MH-XXXXXX',
          role: 'patient',
          hospitalId: null,
        });
        setLoading(false);

        loadUserProfile(firebaseUser.uid, firebaseUser.email || '');
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Register for push notifications when user is signed in
  useEffect(() => {
    if (!user) return;

    registerForPushNotifications(user.id).catch((err) => {
      console.error('Push registration failed:', err);
    });

    // Listen for foreground notifications
    let unsubPush: (() => void) | undefined;
    onPushNotification((payload) => {
      console.log('Foreground push notification:', payload);
    }).then((unsub) => {
      unsubPush = unsub;
    });

    return () => {
      if (unsubPush) unsubPush();
    };
  }, [user?.id]);

  async function loadUserProfile(userId: string, email: string) {
    try {
      const snap = await Promise.race([
        getDoc(doc(db, 'users', userId)),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Profile load timed out')), 8000),
        ),
      ]);

      if (snap.exists()) {
        const profile = snap.data();
        setUser({
          id: userId,
          email,
          memberId: profile.member_id || 'MH-XXXXXX',
          role: profile.role ?? 'patient',
          hospitalId: profile.hospital_id ?? null,
        });
      }
    } catch (error) {
      // Firestore unreachable or timed out — the default user object set
      // in onAuthStateChanged is already in place, so the dashboard still
      // renders.  No action needed.
    }
  }

  async function handleLogout() {
    try {
      if (user) {
        await unregisterForPushNotifications(user.id);
      }
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/verify/:token?" element={<VerifyPage />} />
      <Route path="/statistics" element={<StatisticsDashboard />} />
      <Route path="/security" element={<SecurityCompliancePage />} />
      <Route path="/compliance" element={<SecurityCompliancePage />} />
      <Route path="/partnership" element={<PartnershipPage />} />
      <Route path="/create-hospital-admin" element={<CreateHospitalAdmin />} />
      <Route path="/docs" element={<Documentation />} />
      <Route path="/documentation" element={<Documentation />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/releases" element={<Changelog />} />

      {user ? (
        <>
          <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
          <Route path="/dashboard" element={<Dashboard user={user} onLogout={handleLogout} />} />
          <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} />} />
          <Route path="/survey/:surveyId" element={<SurveyTaker />} />
          <Route path="/admin/surveys" element={<SurveyManagement />} />
          <Route path="/admin/surveys/:surveyId/results" element={<SurveyResults />} />
          <Route
            path="/hospital-dashboard"
            element={
              <HospitalAdminRoute user={user}>
                <HospitalDashboard user={user} />
              </HospitalAdminRoute>
            }
          />
        </>
      ) : (
        <>
          <Route
            path="/"
            element={
              <>
                <LandingPage
                  onSignIn={() => setIsLoginOpen(true)}
                  onGetStarted={() => setIsRegistrationOpen(true)}
                />
                <LoginModal
                  isOpen={isLoginOpen}
                  onClose={() => setIsLoginOpen(false)}
                  onSwitchToRegister={() => setIsRegistrationOpen(true)}
                />
                <RegistrationModal isOpen={isRegistrationOpen} onClose={() => setIsRegistrationOpen(false)} />
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

export default App;
