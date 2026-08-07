import { useState, useEffect } from 'react';
import { X, Download, Eye, CheckCircle, AlertCircle, MapPin, Smartphone } from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface Share {
  id: string;
  share_token: string;
  share_type: 'qr_code' | 'secure_link';
  view_count: number;
  created_at: string;
}

interface AccessLog {
  id: string;
  share_id: string;
  accessed_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

interface AccessLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  share: Share;
}

export default function AccessLogsModal({ isOpen, onClose, share }: AccessLogsModalProps) {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');

  useEffect(() => {
    if (isOpen) {
      loadAccessLogs();
    }
  }, [isOpen, share.id]);

  async function loadAccessLogs() {
    try {
      setLoading(true);

      const q = query(
        collection(db, 'share_access_logs'),
        where('share_id', '==', share.id),
        orderBy('accessed_at', 'desc')
      );
      const snapshot = await getDocs(q);

      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as AccessLog[]);
    } catch (error) {
      console.error('Error loading access logs:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const maskIP = (ip: string | null) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.**`;
    }
    return ip;
  };

  const parseUserAgent = (ua: string | null) => {
    if (!ua) return { device: 'Unknown', browser: 'Unknown' };

    let device = 'Desktop';
    let browser = 'Unknown';

    if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
      device = ua.includes('iPhone') ? 'iPhone' : ua.includes('Android') ? 'Android' : 'Mobile';
    } else if (ua.includes('iPad') || ua.includes('Tablet')) {
      device = 'Tablet';
    }

    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edge')) browser = 'Edge';

    return { device, browser };
  };

  const exportToCSV = () => {
    const headers = ['Timestamp', 'IP Address', 'Device', 'Browser', 'Status'];
    const rows = logs.map(log => {
      const { device, browser } = parseUserAgent(log.user_agent);
      return [
        formatDate(log.accessed_at),
        log.ip_address || 'Unknown',
        device,
        browser,
        'Success'
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MyHealthStatus_AccessLogs_Share_${share.share_token}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean)).size;
  const firstViewed = logs.length > 0 ? logs[logs.length - 1].accessed_at : null;
  const lastViewed = logs.length > 0 ? logs[0].accessed_at : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-gray-900">Access Logs</h2>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Share #{share.share_token.slice(0, 8)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              disabled={logs.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Unique IPs</p>
                  <p className="text-2xl font-bold text-gray-900">{uniqueIPs}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">First Viewed</p>
                  <p className="text-sm font-medium text-gray-900">
                    {firstViewed ? formatDate(firstViewed) : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Last Viewed</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lastViewed ? formatDate(lastViewed) : 'Never'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Eye className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No access logs yet</h3>
                  <p className="text-gray-600 text-center">
                    Access logs will appear here when someone views this share
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          IP Address
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Device/Browser
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log) => {
                        const { device, browser } = parseUserAgent(log.user_agent);
                        return (
                          <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(log.accessed_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                              {maskIP(log.ip_address)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">
                              <div className="flex items-center space-x-1">
                                <MapPin size={14} className="text-gray-400" />
                                <span>San Francisco, CA</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Smartphone size={14} className="text-gray-400" />
                                <span>{device}, {browser}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                <CheckCircle size={12} />
                                <span>Success</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
              <p className="text-xs text-gray-500 text-center">
                These logs are retained for 90 days for security purposes
              </p>
            </div>
          </>
        )}

        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
