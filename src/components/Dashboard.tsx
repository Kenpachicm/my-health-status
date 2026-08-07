import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Share2, Clock, Bell, Home, CircleUser as UserCircle, LogOut, ChevronDown, Copy, CheckCircle, FileSearch, Building2 } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import RequestResultsModal from './RequestResultsModal';
import TestResults from './TestResults';
import ShareWizard from './ShareWizard';
import MyShares from './MyShares';
import SurveyNotifications from './survey/SurveyNotifications';
import ResultCard from './ResultCard';
import ResultDetailModal from './ResultDetailModal';

interface DashboardProps {
  user: {
    id: string;
    email: string;
    memberId: string;
    role: string;
    hospitalId: string | null;
  };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeResultsTab, setActiveResultsTab] = useState('all');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isShareWizardOpen, setIsShareWizardOpen] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [stats, setStats] = useState({
    totalResults: 0,
    activeShares: 0,
    lastUpdated: '2 days ago',
  });
  const [dashboardResults, setDashboardResults] = useState<any[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStats();
    fetchDashboardResults();
  }, [user.id]);

  const fetchStats = async () => {
    try {
      const withTimeout = <T,>(p: Promise<T>, ms = 8000): Promise<T> =>
        Promise.race([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
        ]);

      const [resultsSnap, sharesSnap] = await Promise.all([
        withTimeout(getDocs(query(collection(db, 'test_results'), where('user_id', '==', user.id), where('status', '==', 'active')))),
        withTimeout(getDocs(query(collection(db, 'shares'), where('user_id', '==', user.id), where('status', '==', 'active')))),
      ]);

      setStats({
        totalResults: resultsSnap.size,
        activeShares: sharesSnap.size,
        lastUpdated: '2 days ago',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDashboardResults = async () => {
    try {
      const withTimeout = <T,>(p: Promise<T>, ms = 8000): Promise<T> =>
        Promise.race([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
        ]);

      const q = query(
        collection(db, 'test_results'),
        where('user_id', '==', user.id),
        where('status', '==', 'active'),
        orderBy('test_date', 'desc'),
        limit(5)
      );
      const snap = await withTimeout(getDocs(q));
      setDashboardResults(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error('Error fetching dashboard results:', error);
    }
  };

  const handleViewResult = (resultId: string) => {
    setSelectedResultId(resultId);
  };

  const handleShareResult = (resultId: string) => {
    setActiveTab('shares');
    setIsShareWizardOpen(true);
  };

  const userName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);

  const selectedResult = selectedResultId
    ? dashboardResults.find(r => r.id === selectedResultId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {showNotificationBanner && (
        <div className="bg-blue-50 border-b border-blue-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎉</span>
              <p className="text-sm text-blue-900">
                <span className="font-semibold">New test results available!</span> You have 3 new results from City Medical Center
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                View Results
              </button>
              <button
                onClick={() => setShowNotificationBanner(false)}
                className="text-blue-600 hover:text-blue-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <img src="/my_health.png" alt="MyHealthStatus" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900">MyHealthStatus</span>
            </button>

            <div className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1 ${
                  activeTab === 'results' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Results</span>
                {stats.totalResults > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full font-bold">
                    {stats.totalResults}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('shares')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'shares' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                My Shares
              </button>
              {user.role === 'hospital_admin' && (
                <button
                  onClick={() => navigate('/hospital-dashboard')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <Building2 size={15} />
                  Hospital Portal
                </button>
              )}
            </div>

            <div className="hidden lg:flex items-center bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-xs text-blue-600 font-medium mr-2">Member ID:</span>
              <span className="text-sm font-bold text-blue-900 font-mono tracking-wide">{user.memberId}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="text-gray-600" size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative user-menu">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCircle className="text-blue-600" size={24} />
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                  <div className="px-4 py-3 border-b border-gray-100 md:hidden">
                    <p className="text-xs text-gray-500 mb-1">Member ID</p>
                    <p className="text-sm font-mono font-bold text-blue-900">{user.memberId}</p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors text-left"
                  >
                    <UserCircle size={18} className="text-gray-600" />
                    <span className="text-sm text-gray-700">Profile & Settings</span>
                  </button>

                  {user.role === 'hospital_admin' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/hospital-dashboard');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-emerald-50 transition-colors text-left"
                    >
                      <Building2 size={18} className="text-emerald-600" />
                      <span className="text-sm text-emerald-700">Hospital Portal</span>
                    </button>
                  )}

                  <div className="border-t border-gray-100 my-2" />

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={18} className="text-red-600" />
                    <span className="text-sm text-red-600">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <main className="pb-24 md:pb-8">
        {activeTab === 'results' ? (
          <TestResults memberId={user.memberId} userId={user.id} />
        ) : activeTab === 'shares' ? (
          <MyShares userId={user.id} memberId={user.memberId} />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600">Your test results from partnered clinics appear here automatically</p>
            </div>

            <div className="mb-8">
              <SurveyNotifications />
            </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.totalResults}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Total Results Available</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Share2 className="text-emerald-600" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stats.activeShares}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Active Shares</h3>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Last updated</p>
                <p className="text-lg font-semibold text-gray-900">{stats.lastUpdated}</p>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Recent Activity</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setIsShareWizardOpen(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-3"
          >
            <Share2 size={24} />
            <span>Share Results</span>
          </button>

          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-3"
          >
            <FileSearch size={24} />
            <span>Request Results from Clinic</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Test Results</h2>

            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveResultsTab('all')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeResultsTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Results
              </button>
              <button
                onClick={() => setActiveResultsTab('recent')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeResultsTab === 'recent'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Recent
              </button>
              <button
                onClick={() => setActiveResultsTab('shared')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeResultsTab === 'shared'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Shared
              </button>
              <button
                onClick={() => setActiveResultsTab('archived')}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeResultsTab === 'archived'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          <div className="p-6">
            {dashboardResults.length > 0 ? (
              <div className="space-y-4">
                {dashboardResults.map((result) => (
                  <ResultCard
                    key={result.id}
                    result={result}
                    onView={() => handleViewResult(result.id)}
                    onShare={() => handleShareResult(result.id)}
                  />
                ))}
                {stats.totalResults > 5 && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className="w-full py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    View all {stats.totalResults} results →
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="text-blue-400" size={40} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No results yet</h3>
                <p className="text-gray-600 mb-2 max-w-lg mx-auto">
                  Your test results from partnered clinics and labs will appear here automatically
                </p>
                <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                  Make sure to provide your Member ID to your healthcare provider
                </p>

                <div className="inline-flex items-center space-x-2 bg-blue-50 px-4 py-3 rounded-lg mb-6">
                  <span className="text-xs text-blue-600 font-medium">Your Member ID:</span>
                  <span className="text-sm font-bold text-blue-900 font-mono tracking-wide">{user.memberId}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(user.memberId)}
                    className="ml-2 p-1.5 hover:bg-blue-100 rounded transition-colors"
                    title="Copy Member ID"
                  >
                    <Copy size={16} className="text-blue-600" />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(user.memberId)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                  >
                    <Copy size={18} />
                    <span>Copy Member ID</span>
                  </button>
                  <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors inline-flex items-center space-x-2">
                    <span>Find a Partnered Clinic</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
          </div>
        )}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('results')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors relative ${
              activeTab === 'results' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <div className="relative">
              <FileText size={24} />
              {stats.totalResults > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {stats.totalResults}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Results</span>
          </button>

          <button
            onClick={() => setActiveTab('shares')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'shares' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <Share2 size={24} />
            <span className="text-xs font-medium">Share</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <UserCircle size={24} />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </nav>

      <RequestResultsModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        memberId={user.memberId}
      />

      <ShareWizard
        isOpen={isShareWizardOpen}
        onClose={() => setIsShareWizardOpen(false)}
        userId={user.id}
        memberId={user.memberId}
      />

      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResultId(null)}
          onNavigate={(direction) => {
            const currentIndex = dashboardResults.findIndex(r => r.id === selectedResultId);
            const newIndex = direction === 'next'
              ? Math.min(currentIndex + 1, dashboardResults.length - 1)
              : Math.max(currentIndex - 1, 0);
            setSelectedResultId(dashboardResults[newIndex].id);
          }}
          hasNext={dashboardResults.findIndex(r => r.id === selectedResultId) < dashboardResults.length - 1}
          hasPrev={dashboardResults.findIndex(r => r.id === selectedResultId) > 0}
        />
      )}
    </div>
  );
}
