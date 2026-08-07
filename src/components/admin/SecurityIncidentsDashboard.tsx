import { useState, useEffect } from 'react';
import { AlertTriangle, Filter, Search, Eye, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { collection, query, orderBy, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SecurityIncident {
  id: string;
  ticket_number: string;
  user_id: string;
  issue_type: string;
  severity: 'critical' | 'moderate' | 'low';
  description: string;
  occurred_at: string;
  affected_resources: string[];
  contact_email: string;
  contact_phone: string | null;
  preferred_response_time: string;
  immediate_actions: string[];
  ip_address: string | null;
  device_info: string | null;
  status: 'new' | 'under_investigation' | 'resolved' | 'false_alarm';
  assigned_to: string | null;
  admin_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

const severityColors = {
  critical: 'bg-red-100 text-red-800 border-red-300',
  moderate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  low: 'bg-green-100 text-green-800 border-green-300',
};

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  under_investigation: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  false_alarm: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  new: Clock,
  under_investigation: AlertTriangle,
  resolved: CheckCircle,
  false_alarm: XCircle,
};

export default function SecurityIncidentsDashboard() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [filters, setFilters] = useState({
    severity: 'all',
    status: 'all',
    search: '',
  });
  const [adminNotes, setAdminNotes] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, filters]);

  const fetchIncidents = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'security_incidents'), orderBy('created_at', 'desc'))
      );
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as SecurityIncident[];
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    if (filters.severity !== 'all') {
      filtered = filtered.filter((i) => i.severity === filters.severity);
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter((i) => i.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.ticket_number.toLowerCase().includes(searchLower) ||
          i.issue_type.toLowerCase().includes(searchLower) ||
          i.description.toLowerCase().includes(searchLower) ||
          i.contact_email.toLowerCase().includes(searchLower)
      );
    }

    setFilteredIncidents(filtered);
  };

  const updateIncidentStatus = async (incidentId: string, newStatus: string) => {
    try {
      const updates: any = { status: newStatus, updated_at: serverTimestamp() };

      if (newStatus === 'resolved') {
        updates.resolved_at = new Date().toISOString();
      }

      await updateDoc(doc(db, 'security_incidents', incidentId), updates);
      fetchIncidents();
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const updateIncidentDetails = async (incidentId: string) => {
    try {
      await updateDoc(doc(db, 'security_incidents', incidentId), {
        admin_notes: adminNotes,
        assigned_to: assignedTo || null,
        updated_at: serverTimestamp(),
      });
      fetchIncidents();
      setSelectedIncident(null);
    } catch (error) {
      console.error('Error updating incident details:', error);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Ticket Number',
      'Date',
      'Severity',
      'Status',
      'Issue Type',
      'Email',
      'Description',
    ];

    const rows = filteredIncidents.map((i) => [
      i.ticket_number,
      new Date(i.created_at).toLocaleDateString(),
      i.severity,
      i.status,
      i.issue_type,
      i.contact_email,
      i.description.replace(/,/g, ';'),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-incidents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getIncidentStats = () => {
    return {
      total: incidents.length,
      critical: incidents.filter((i) => i.severity === 'critical').length,
      new: incidents.filter((i) => i.status === 'new').length,
      investigating: incidents.filter((i) => i.status === 'under_investigation').length,
    };
  };

  const stats = getIncidentStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Incidents Dashboard</h1>
          <p className="text-gray-600">Monitor and manage security incident reports</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-6">
            <p className="text-sm text-red-700 mb-1">Critical</p>
            <p className="text-3xl font-bold text-red-900">{stats.critical}</p>
          </div>
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-6">
            <p className="text-sm text-blue-700 mb-1">New</p>
            <p className="text-3xl font-bold text-blue-900">{stats.new}</p>
          </div>
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-6">
            <p className="text-sm text-yellow-700 mb-1">Investigating</p>
            <p className="text-3xl font-bold text-yellow-900">{stats.investigating}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by ticket, email, or description..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="resolved">Resolved</option>
              <option value="false_alarm">False Alarm</option>
            </select>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredIncidents.map((incident) => {
            const StatusIcon = statusIcons[incident.status];
            return (
              <div
                key={incident.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-shadow ${
                  incident.severity === 'critical' ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-bold text-gray-900 font-mono">
                        {incident.ticket_number}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityColors[incident.severity]}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[incident.status]}`}>
                        <StatusIcon className="inline mr-1" size={12} />
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{incident.issue_type}</p>
                    <p className="text-sm text-gray-500">
                      Reported: {new Date(incident.created_at).toLocaleString()} | {incident.contact_email}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedIncident(incident);
                      setAdminNotes(incident.admin_notes || '');
                      setAssignedTo(incident.assigned_to || '');
                    }}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center space-x-2"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{incident.description}</p>

                <div className="flex gap-2">
                  {incident.status !== 'under_investigation' && (
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'under_investigation')}
                      className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-semibold hover:bg-yellow-100 transition-colors"
                    >
                      Mark Investigating
                    </button>
                  )}
                  {incident.status !== 'resolved' && (
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'resolved')}
                      className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold hover:bg-green-100 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {incident.status !== 'false_alarm' && (
                    <button
                      onClick={() => updateIncidentStatus(incident.id, 'false_alarm')}
                      className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Mark False Alarm
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredIncidents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle size={48} className="mx-auto mb-3 text-gray-400" />
              <p>No incidents found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Incident Details</h2>
              <button
                onClick={() => setSelectedIncident(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ticket Number</label>
                  <p className="text-lg font-mono font-bold text-gray-900">{selectedIncident.ticket_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[selectedIncident.status]}`}>
                    {selectedIncident.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Severity</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${severityColors[selectedIncident.severity]}`}>
                    {selectedIncident.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reported</label>
                  <p className="text-gray-900">{new Date(selectedIncident.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                  <p className="text-gray-900">{selectedIncident.contact_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
                  <p className="text-gray-900">{selectedIncident.contact_phone || 'Not provided'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Issue Type</label>
                <p className="text-gray-900">{selectedIncident.issue_type}</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {selectedIncident.description}
                </p>
              </div>

              {selectedIncident.immediate_actions.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Immediate Actions Taken</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedIncident.immediate_actions.map((action) => (
                      <span key={action} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {action.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned To</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Team member name or email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes and investigation details..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateIncidentDetails(selectedIncident.id)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
