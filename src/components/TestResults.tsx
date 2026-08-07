import { useState, useEffect } from 'react';
import { Search, ChevronDown, Copy, Check, FileText } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ResultCard from './ResultCard';
import ResultDetailModal from './ResultDetailModal';
import EmptyResults from './EmptyResults';
import ShareWizard from './ShareWizard';

interface TestResult {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  test_date: string;
  test_types: string[];
  facility_name: string;
  notes: string;
  status: string;
  uploaded_at: string;
}

interface TestResultsProps {
  memberId: string;
  userId: string;
}

export default function TestResults({ memberId, userId }: TestResultsProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [isShareWizardOpen, setIsShareWizardOpen] = useState(false);
  const [shareResultIds, setShareResultIds] = useState<string[]>([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);

    try {
      const q = query(
        collection(db, 'test_results'),
        where('user_id', '==', userId),
        where('status', '==', 'active'),
        orderBy('test_date', 'desc')
      );
      const snap = await getDocs(q);
      setResults(snap.docs.map(d => ({ id: d.id, ...d.data() })) as TestResult[]);
    } catch (error) {
      console.error('Error fetching results:', error);
    }
    setLoading(false);
  };

  const copyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const toggleSelectResult = (resultId: string) => {
    const newSelected = new Set(selectedResults);
    if (newSelected.has(resultId)) {
      newSelected.delete(resultId);
    } else {
      newSelected.add(resultId);
    }
    setSelectedResults(newSelected);
  };

  const selectAll = () => {
    if (selectedResults.size === filteredResults.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filteredResults.map(r => r.id)));
    }
  };

  const handleBulkArchive = async () => {
    const resultIds = Array.from(selectedResults);
    await Promise.all(resultIds.map(id => updateDoc(doc(db, 'test_results', id), { status: 'archived' })));

    setSelectedResults(new Set());
    fetchResults();
  };

  const handleBulkShare = () => {
    setShareResultIds(Array.from(selectedResults));
    setIsShareWizardOpen(true);
  };

  const handleShareSingle = (resultId: string) => {
    setShareResultIds([resultId]);
    setIsShareWizardOpen(true);
  };

  const isResultNew = (uploadedAt: string) => {
    const daysDiff = (Date.now() - new Date(uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 7;
  };

  const filteredResults = results
    .filter(result => {
      const matchesSearch = searchQuery === '' ||
        result.facility_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.test_types?.some(type =>
          type.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilter = filterBy === 'all' || (() => {
        const daysSinceTest = (Date.now() - new Date(result.test_date).getTime()) / (1000 * 60 * 60 * 24);
        if (filterBy === 'month') return daysSinceTest <= 30;
        if (filterBy === '3months') return daysSinceTest <= 90;
        return true;
      })();

      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.test_date).getTime() - new Date(a.test_date).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.test_date).getTime() - new Date(b.test_date).getTime();
      } else {
        return (a.facility_name || '').localeCompare(b.facility_name || '');
      }
    });

  const selectedResult = selectedResultId
    ? results.find(r => r.id === selectedResultId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return <EmptyResults memberId={memberId} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">My Test Results</h1>

          <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-lg border border-gray-200 inline-flex">
            <span className="text-sm text-gray-600">Member ID:</span>
            <span className="font-mono font-bold text-gray-900">{memberId}</span>
            <button
              onClick={copyMemberId}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
              aria-label="Copy Member ID"
            >
              {copiedId ? (
                <Check size={18} className="text-green-600" />
              ) : (
                <Copy size={18} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by clinic or test type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="clinic">By Clinic</option>
            </select>

            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Results</option>
              <option value="month">This Month</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>

          {selectedResults.size > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-gray-900">
                  {selectedResults.size} result{selectedResults.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={() => setSelectedResults(new Set())}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkShare}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Share Selected
                </button>
                <button
                  onClick={handleBulkArchive}
                  className="bg-white text-gray-700 px-6 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Archive Selected
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredResults.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((result) => (
              <ResultCard
                key={result.id}
                result={result}
                isNew={isResultNew(result.uploaded_at)}
                isSelected={selectedResults.has(result.id)}
                onSelect={() => toggleSelectResult(result.id)}
                onView={() => setSelectedResultId(result.id)}
                onShare={() => handleShareSingle(result.id)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedResult && (
        <ResultDetailModal
          result={selectedResult}
          onClose={() => setSelectedResultId(null)}
          onNavigate={(direction) => {
            const currentIndex = filteredResults.findIndex(r => r.id === selectedResultId);
            const newIndex = direction === 'next'
              ? Math.min(currentIndex + 1, filteredResults.length - 1)
              : Math.max(currentIndex - 1, 0);
            setSelectedResultId(filteredResults[newIndex].id);
          }}
          hasNext={filteredResults.findIndex(r => r.id === selectedResultId) < filteredResults.length - 1}
          hasPrev={filteredResults.findIndex(r => r.id === selectedResultId) > 0}
        />
      )}

      <ShareWizard
        isOpen={isShareWizardOpen}
        onClose={() => {
          setIsShareWizardOpen(false);
          setShareResultIds([]);
          fetchResults();
        }}
        initialResultIds={shareResultIds}
        userId={userId}
        memberId={memberId}
      />
    </div>
  );
}
