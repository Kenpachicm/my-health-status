import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, CreditCard as Edit, Copy, Pause, Play, BarChart3, Send, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { collection, query, orderBy, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface SurveyStats {
  id: string;
  title: string;
  survey_type: string;
  status: string;
  created_at: string;
  total_sent: number;
  total_responses: number;
  response_rate: number;
  avg_completion_time: number;
}

export default function SurveyManagement() {
  const navigate = useNavigate();
  const [surveys, setSurveys] = useState<SurveyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState({
    total_sent: 0,
    response_rate: 0,
    avg_completion_time: 0,
    pending_responses: 0,
  });

  useEffect(() => {
    loadSurveys();
    loadOverviewStats();
  }, []);

  const loadSurveys = async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'surveys'), orderBy('created_at', 'desc'))
      );
      const surveysData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      if (surveysData) {
        const statsPromises = surveysData.map(async (survey) => {
          const notifSnapshot = await getDocs(
            query(collection(db, 'survey_notifications'), where('survey_id', '==', survey.id))
          );
          const sentCount = notifSnapshot.size;

          const respSnapshot = await getDocs(
            query(
              collection(db, 'survey_responses'),
              where('survey_id', '==', survey.id),
              where('is_complete', '==', true)
            )
          );
          const responses = respSnapshot.docs.map((d) => d.data()) as any[];

          const totalResponses = responses.length || 0;
          const avgTime =
            totalResponses > 0
              ? responses.reduce((sum, r) => sum + (r.completion_time_seconds || 0), 0) /
                totalResponses
              : 0;

          return {
            id: survey.id,
            title: survey.title,
            survey_type: survey.survey_type,
            status: survey.status,
            created_at: survey.created_at,
            total_sent: sentCount || 0,
            total_responses: totalResponses,
            response_rate:
              sentCount && sentCount > 0 ? (totalResponses / sentCount) * 100 : 0,
            avg_completion_time: avgTime,
          };
        });

        const stats = await Promise.all(statsPromises);
        setSurveys(stats);
      }
    } catch (error) {
      console.error('Error loading surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewStats = async () => {
    try {
      const notifSnapshot = await getDocs(query(collection(db, 'survey_notifications')));
      const totalSent = notifSnapshot.size;

      const respSnapshot = await getDocs(query(collection(db, 'survey_responses')));
      const allResponses = respSnapshot.docs.map((d) => d.data()) as any[];

      const completedResponses =
        allResponses.filter((r) => r.is_complete) || [];
      const pendingCount = allResponses.filter((r) => !r.is_complete).length || 0;

      const avgTime =
        completedResponses.length > 0
          ? completedResponses.reduce(
              (sum, r) => sum + (r.completion_time_seconds || 0),
              0
            ) / completedResponses.length
          : 0;

      setOverviewStats({
        total_sent: totalSent || 0,
        response_rate:
          totalSent && totalSent > 0
            ? (completedResponses.length / totalSent) * 100
            : 0,
        avg_completion_time: avgTime,
        pending_responses: pendingCount,
      });
    } catch (error) {
      console.error('Error loading overview stats:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post_testing':
        return 'bg-blue-100 text-blue-800';
      case 'monthly_checkin':
        return 'bg-green-100 text-green-800';
      case 'feature_feedback':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading surveys...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey Management</h1>
            <p className="text-gray-600 mt-1">
              Create, manage, and analyze pilot program surveys
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/surveys/new')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Survey</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Send className="text-blue-600" size={24} />
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {overviewStats.total_sent}
            </h3>
            <p className="text-sm text-gray-600">Total Surveys Sent</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {overviewStats.response_rate.toFixed(0)}%
            </h3>
            <p className="text-sm text-gray-600">Response Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-purple-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatTime(Math.round(overviewStats.avg_completion_time))}
            </h3>
            <p className="text-sm text-gray-600">Avg. Completion Time</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-orange-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {overviewStats.pending_responses}
            </h3>
            <p className="text-sm text-gray-600">Pending Responses</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Survey Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">
                    Responses
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">
                    Response Rate
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-700">
                    Created
                  </th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr
                    key={survey.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{survey.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(
                          survey.survey_type
                        )}`}
                      >
                        {survey.survey_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          survey.status
                        )}`}
                      >
                        {survey.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-medium">
                        {survey.total_responses}/{survey.total_sent}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-medium">
                        {survey.response_rate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-sm text-gray-600">
                      {new Date(survey.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => navigate(`/admin/surveys/${survey.id}/results`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Results"
                        >
                          <BarChart3 size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/surveys/${survey.id}/preview`)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title={survey.status === 'active' ? 'Pause' : 'Activate'}
                        >
                          {survey.status === 'active' ? (
                            <Pause size={18} />
                          ) : (
                            <Play size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {surveys.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">No surveys created yet</p>
              <button
                onClick={() => navigate('/admin/surveys/new')}
                className="text-blue-600 hover:underline font-medium"
              >
                Create your first survey
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
