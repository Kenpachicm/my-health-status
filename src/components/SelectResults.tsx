import { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SelectResultsProps {
  onClose: () => void;
  onContinue: (selectedIds: string[]) => void;
  userId: string;
}

interface TestResult {
  id: string;
  test_date: string;
  facility_name?: string;
  test_types?: string[];
}

export default function SelectResults({ onClose, onContinue, userId }: SelectResultsProps) {
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
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

  const toggleResult = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      green: 'bg-green-100 text-green-800',
      teal: 'bg-teal-100 text-teal-800',
      pink: 'bg-pink-100 text-pink-800',
      yellow: 'bg-yellow-100 text-yellow-800',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Results to Share</h2>
          <p className="text-gray-600 mt-1">Choose which test results you want to share with your partner</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="font-semibold text-gray-900">
            {selectedIds.size} result{selectedIds.size !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No test results available to share</p>
        </div>
      ) : (
        <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.id}
              onClick={() => toggleResult(result.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                selectedIds.has(result.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{result.facility_name || 'Test Results'}</h3>
                  <p className="text-sm text-gray-600 mb-2">{formatDate(result.test_date)}</p>
                  <div className="flex flex-wrap gap-2">
                    {(result.test_types || []).slice(0, 3).map((type, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800"
                      >
                        {type}
                      </span>
                    ))}
                    {(result.test_types || []).length > 3 && (
                      <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                        +{(result.test_types || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 ${
                  selectedIds.has(result.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {selectedIds.has(result.id) && (
                    <CheckCircle className="text-white" size={20} fill="currentColor" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={() => onContinue(Array.from(selectedIds))}
          disabled={selectedIds.size === 0}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
