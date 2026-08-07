import { useState, useEffect } from 'react';
import { Share2, Eye, Clock, CheckCircle, Search, Plus, AlertCircle, Network } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ShareCard from './ShareCard';
import ViewShareModal from './ViewShareModal';
import AccessLogsModal from './AccessLogsModal';
import RevokeShareModal from './RevokeShareModal';

interface MySharesProps {
  userId: string;
  memberId: string;
}

interface Share {
  id: string;
  share_token: string;
  share_type: 'qr_code' | 'secure_link';
  expires_at: string;
  created_at: string;
  is_active: boolean;
  view_count: number;
  last_viewed_at: string | null;
  require_access_code: boolean;
  access_code: string | null;
  notify_on_access: boolean;
  single_view_only: boolean;
  personal_message: string | null;
  share_results: Array<{
    test_result_id: string;
  }>;
}

export default function MyShares({ userId, memberId }: MySharesProps) {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'expires_soon' | 'most_viewed'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShare, setSelectedShare] = useState<Share | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);

  useEffect(() => {
    loadShares();
  }, [userId]);

  async function loadShares() {
    try {
      setLoading(true);

      const sharesQuery = query(
        collection(db, 'shares'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc')
      );
      const sharesSnapshot = await getDocs(sharesQuery);

      const sharesData = await Promise.all(sharesSnapshot.docs.map(async (shareDoc) => {
        const shareResultsQuery = query(
          collection(db, 'share_results'),
          where('share_id', '==', shareDoc.id)
        );
        const shareResultsSnapshot = await getDocs(shareResultsQuery);
        return {
          id: shareDoc.id,
          ...shareDoc.data(),
          share_results: shareResultsSnapshot.docs.map(d => ({ test_result_id: d.data().test_result_id })),
        } as Share;
      }));

      setShares(sharesData);
    } catch (error) {
      console.error('Error loading shares:', error);
    } finally {
      setLoading(false);
    }
  }

  const now = new Date();
  const filteredShares = shares.filter(share => {
    const isExpired = new Date(share.expires_at) < now;
    const isRevoked = !share.is_active && !isExpired;

    if (activeFilter === 'active') return share.is_active && !isExpired;
    if (activeFilter === 'expired') return isExpired;
    if (activeFilter === 'revoked') return isRevoked;

    return true;
  });

  const sortedShares = [...filteredShares].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'expires_soon':
        return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
      case 'most_viewed':
        return b.view_count - a.view_count;
      default:
        return 0;
    }
  });

  const searchedShares = sortedShares.filter(share => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      share.share_token.toLowerCase().includes(query) ||
      share.share_type.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: shares.length,
    active: shares.filter(s => s.is_active && new Date(s.expires_at) > now).length,
    totalViews: shares.reduce((sum, s) => sum + s.view_count, 0),
    expiringSoon: shares.filter(s => {
      const expiresAt = new Date(s.expires_at);
      const hoursUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      return s.is_active && hoursUntilExpiry > 0 && hoursUntilExpiry <= 24;
    }).length,
  };

  const handleViewShare = (share: Share) => {
    setSelectedShare(share);
    setViewModalOpen(true);
  };

  const handleViewLogs = (share: Share) => {
    setSelectedShare(share);
    setLogsModalOpen(true);
  };

  const handleRevokeClick = (share: Share) => {
    setSelectedShare(share);
    setRevokeModalOpen(true);
  };

  const handleRevokeConfirm = async () => {
    if (!selectedShare) return;

    try {
      await updateDoc(doc(db, 'shares', selectedShare.id), {
        is_active: false,
        updated_at: serverTimestamp(),
      });

      await loadShares();
      setRevokeModalOpen(false);
      setSelectedShare(null);
    } catch (error) {
      console.error('Error revoking share:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Shares</h1>
          <p className="text-gray-600">Manage and track your shared test results</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-md">
          <Plus size={20} />
          <span>Create New Share</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Network className="text-blue-600" size={20} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total shares created</h3>
          <p className="text-xs text-green-600">+3 this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.active}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Currently active</h3>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Eye className="text-purple-600" size={20} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.totalViews}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Total verification views</h3>
          <p className="text-xs text-gray-500">6 in last 7 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="text-orange-600" size={20} />
            </div>
            <span className="text-3xl font-bold text-gray-900">{stats.expiringSoon}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Expiring within 24 hours</h3>
          {stats.expiringSoon > 0 && (
            <div className="flex items-center space-x-1">
              <AlertCircle className="text-orange-500" size={12} />
              <span className="text-xs text-orange-600">Action needed</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Shares
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'active'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setActiveFilter('expired')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'expired'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Expired ({shares.filter(s => new Date(s.expires_at) < now).length})
            </button>
            <button
              onClick={() => setActiveFilter('revoked')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeFilter === 'revoked'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Revoked (0)
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search shares..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="newest">Date Created (Newest First)</option>
              <option value="oldest">Date Created (Oldest First)</option>
              <option value="expires_soon">Expires Soonest</option>
              <option value="most_viewed">Most Viewed</option>
            </select>
          </div>
        </div>

        {searchedShares.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="text-blue-400" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {shares.length === 0 ? 'No shares created yet' : 'No shares found'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {shares.length === 0
                ? 'Share your test results securely with partners via QR codes or encrypted links'
                : 'Try adjusting your search or filters'}
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
              <Plus size={20} />
              <span>{shares.length === 0 ? 'Create Your First Share' : 'Create New Share'}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {searchedShares.map((share) => (
              <ShareCard
                key={share.id}
                share={share}
                onView={handleViewShare}
                onViewLogs={handleViewLogs}
                onRevoke={handleRevokeClick}
              />
            ))}
          </div>
        )}
      </div>

      {selectedShare && (
        <>
          <ViewShareModal
            isOpen={viewModalOpen}
            onClose={() => {
              setViewModalOpen(false);
              setSelectedShare(null);
            }}
            share={selectedShare}
            memberId={memberId}
          />

          <AccessLogsModal
            isOpen={logsModalOpen}
            onClose={() => {
              setLogsModalOpen(false);
              setSelectedShare(null);
            }}
            share={selectedShare}
          />

          <RevokeShareModal
            isOpen={revokeModalOpen}
            onClose={() => {
              setRevokeModalOpen(false);
              setSelectedShare(null);
            }}
            share={selectedShare}
            onConfirm={handleRevokeConfirm}
          />
        </>
      )}
    </div>
  );
}
