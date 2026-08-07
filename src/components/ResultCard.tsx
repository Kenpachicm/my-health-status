import { useState } from 'react';
import { Building2, Share2, MoreVertical, Download, Archive, AlertCircle, FileText } from 'lucide-react';

interface ResultCardProps {
  result: {
    id: string;
    file_name: string;
    test_date: string;
    test_types: string[];
    facility_name: string;
    uploaded_at: string;
  };
  isNew: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onView: () => void;
  onShare: () => void;
}

export default function ResultCard({ result, isNew, isSelected, onSelect, onView, onShare }: ResultCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Added today';
    if (days === 1) return 'Added yesterday';
    if (days < 7) return `Added ${days} days ago`;
    if (days < 30) return `Added ${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `Added ${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const getColorClass = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-teal-100 text-teal-800',
      'bg-pink-100 text-pink-800',
      'bg-green-100 text-green-800',
    ];
    return colors[index % colors.length];
  };

  return (
    <div className={`relative bg-white border-2 rounded-xl p-4 transition-all group hover:shadow-lg hover:scale-[1.02] ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <div className="absolute top-4 left-4 z-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
        />
      </div>

      {isNew && (
        <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          NEW
        </div>
      )}

      <div className="relative pt-6">
        <button
          onClick={onView}
          className="w-full text-left"
        >
          <div className="flex items-start space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="text-blue-600" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{result.facility_name || 'Unknown Facility'}</h3>
              <p className="text-sm text-gray-600">{formatDate(result.test_date)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {result.test_types?.slice(0, 4).map((type, index) => (
              <span
                key={index}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getColorClass(index)}`}
              >
                {type}
              </span>
            ))}
            {result.test_types?.length > 4 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                +{result.test_types.length - 4} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 text-sm">
            <span className="text-gray-500">{getTimeAgo(result.uploaded_at)}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
              {result.file_name}
            </span>
          </div>
        </button>

        <div className="flex items-center justify-between">
          <button
            onClick={onShare}
            className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Share This Result
          </button>

          <div className="relative ml-2">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical size={20} className="text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-xl py-2 w-48 z-20">
                  <button
                    onClick={() => { onView(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
                  >
                    <FileText size={16} />
                    <span>View Full Report</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
                    <Download size={16} />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => { onShare(); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  <hr className="my-2 border-gray-200" />
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-gray-700">
                    <Archive size={16} />
                    <span>Archive</span>
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-red-600">
                    <AlertCircle size={16} />
                    <span>Report Issue</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
