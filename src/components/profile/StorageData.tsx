import { useState } from 'react';
import { HardDrive, Download, Trash2, AlertTriangle, Check } from 'lucide-react';
import DeleteAccountModal from './DeleteAccountModal';

interface StorageDataProps {
  user: any;
}

export default function StorageData({ user }: StorageDataProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDataRequestModalOpen, setIsDataRequestModalOpen] = useState(false);
  const [dataRequested, setDataRequested] = useState(false);

  const storageUsed = 125;
  const storageTotal = 500;
  const storagePercent = (storageUsed / storageTotal) * 100;

  const getStorageColor = () => {
    if (storagePercent >= 95) return 'bg-red-600';
    if (storagePercent >= 80) return 'bg-orange-500';
    return 'bg-blue-600';
  };

  const handleRequestData = () => {
    setDataRequested(true);
    setIsDataRequestModalOpen(false);
    setTimeout(() => setDataRequested(false), 5000);
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Storage & Data</h2>
          <p className="text-gray-600">Manage your data and storage</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <HardDrive className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Storage Usage</h3>
              <p className="text-sm text-gray-500">
                {storageUsed} MB of {storageTotal} MB used ({storagePercent.toFixed(1)}%)
              </p>
            </div>
          </div>

          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${getStorageColor()} transition-all duration-300`}
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Test result files</span>
              <span className="font-medium text-gray-900">120 MB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Profile data</span>
              <span className="font-medium text-gray-900">2 MB</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Share data</span>
              <span className="font-medium text-gray-900">3 MB</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <a
              href="#"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Results →
            </a>
            <p className="text-xs text-gray-500 mt-1">Delete old results to free up space</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Download className="text-green-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Download Your Data</h3>
              <p className="text-sm text-gray-500">
                Get a copy of all your information (HIPAA right to access)
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            You'll receive an email with a secure link to download your profile information, test results, share history, and account activity logs.
          </p>

          {dataRequested && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
              <Check className="text-green-600" size={18} />
              <p className="text-sm text-green-800 font-medium">
                Data download requested! Check your email within 24 hours.
              </p>
            </div>
          )}

          <button
            onClick={() => setIsDataRequestModalOpen(true)}
            disabled={dataRequested}
            className="w-full px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Request Data Download
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Processing time: up to 24 hours
          </p>
        </div>

        <div className="bg-red-50 rounded-xl border-2 border-red-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 className="text-red-600" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">This action cannot be undone</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Deleting your account will:</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Permanently delete all your test results</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Remove all active shares</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Delete your Member ID</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Erase all account information</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Cannot be recovered after 30 days</span>
              </li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <AlertTriangle className="text-amber-600 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Grace Period:</span> You have 30 days to reactivate before permanent deletion
            </p>
          </div>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-full px-4 py-3 bg-white border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {isDataRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Request Data Download?</h3>

            <p className="text-gray-600 mb-4">
              You'll receive an email with a secure link to download:
            </p>

            <ul className="space-y-2 mb-6 text-sm text-gray-700">
              <li className="flex items-start">
                <Check size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Your profile information</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>All test results and files</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Share history and access logs</span>
              </li>
              <li className="flex items-start">
                <Check size={16} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                <span>Account activity logs</span>
              </li>
            </ul>

            <label className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer mb-4">
              <input type="checkbox" className="mt-0.5" defaultChecked />
              <span className="text-sm text-blue-900">
                I understand this download will be available for 7 days
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={() => setIsDataRequestModalOpen(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestData}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Request Download
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          user={user}
        />
      )}
    </>
  );
}
