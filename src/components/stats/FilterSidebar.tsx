import { X, Download, RotateCcw } from 'lucide-react';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    year: number;
    stiType: string[];
    ageGroups: string[];
    genders: string[];
    regions: string[];
  };
  onFilterChange: (filters: any) => void;
  onReset: () => void;
  onExport: (format: 'csv' | 'pdf') => void;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onReset,
  onExport,
}: FilterSidebarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const stiTypes = ['All', 'HIV', 'Chlamydia', 'Gonorrhea', 'Syphilis', 'HPV', 'Herpes'];
  const ageGroups = ['15-19', '20-24', '25-29', '30-39', '40+'];
  const genders = ['All', 'Male', 'Female', 'Other'];
  const regions = ['All', 'Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'];

  const handleCheckboxChange = (category: string, value: string) => {
    const currentValues = filters[category as keyof typeof filters] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onFilterChange({ ...filters, [category]: newValues });
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden"
        onClick={onClose}
      />
      <div
        className={`fixed lg:sticky top-0 right-0 lg:right-auto h-screen w-80 bg-white shadow-xl z-50 overflow-y-auto transition-transform transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Year
            </label>
            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ ...filters, year: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              STI Type
            </label>
            <div className="space-y-2">
              {stiTypes.map((type) => (
                <label key={type} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.stiType.includes(type)}
                    onChange={() => handleCheckboxChange('stiType', type)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Age Groups
            </label>
            <div className="space-y-2">
              {ageGroups.map((group) => (
                <label key={group} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.ageGroups.includes(group)}
                    onChange={() => handleCheckboxChange('ageGroups', group)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{group}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Gender
            </label>
            <div className="space-y-2">
              {genders.map((gender) => (
                <label key={gender} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.genders.includes(gender)}
                    onChange={() => handleCheckboxChange('genders', gender)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Region
            </label>
            <div className="space-y-2">
              {regions.map((region) => (
                <label key={region} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region)}
                    onChange={() => handleCheckboxChange('regions', region)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{region}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <RotateCcw size={18} />
            <span>Reset All Filters</span>
          </button>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Export Data</h3>
            <div className="space-y-2">
              <button
                onClick={() => onExport('csv')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={18} />
                <span>Download CSV</span>
              </button>
              <button
                onClick={() => onExport('pdf')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Download size={18} />
                <span>Generate PDF Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
