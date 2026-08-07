import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Users, Clock, TrendingUp, MessageSquare } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { collection, query, where, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface QuestionResult {
  question_id: string;
  question_text: string;
  question_type: string;
  total_responses: number;
  answer_distribution: Record<string, number>;
  average_rating?: number;
  text_responses?: string[];
}

export default function SurveyResults() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<any>(null);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [stats, setStats] = useState({
    total_sent: 0,
    total_responses: 0,
    response_rate: 0,
    avg_completion_time: 0,
    completion_rate: 0,
  });
  const [selectedTab, setSelectedTab] = useState<'summary' | 'responses'>('summary');

  useEffect(() => {
    loadResults();
  }, [surveyId]);

  const loadResults = async () => {
    try {
      const surveyDoc = await getDoc(doc(db, 'surveys', surveyId!));
      const surveyData = surveyDoc.exists() ? { id: surveyDoc.id, ...surveyDoc.data() } : null;

      const questionsSnapshot = await getDocs(
        query(
          collection(db, 'survey_questions'),
          where('survey_id', '==', surveyId),
          orderBy('order_index')
        )
      );
      const questions = questionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      const notifSnapshot = await getDocs(
        query(collection(db, 'survey_notifications'), where('survey_id', '==', surveyId))
      );
      const sentCount = notifSnapshot.size;

      const responsesSnapshot = await getDocs(
        query(collection(db, 'survey_responses'), where('survey_id', '==', surveyId))
      );
      const responses = responsesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      const completedResponses = responses.filter((r) => r.is_complete) || [];
      const avgTime =
        completedResponses.length > 0
          ? completedResponses.reduce(
              (sum, r) => sum + (r.completion_time_seconds || 0),
              0
            ) / completedResponses.length
          : 0;

      setSurvey(surveyData);
      setStats({
        total_sent: sentCount || 0,
        total_responses: completedResponses.length,
        response_rate:
          sentCount && sentCount > 0 ? (completedResponses.length / sentCount) * 100 : 0,
        avg_completion_time: avgTime,
        completion_rate:
          responses && responses.length > 0
            ? (completedResponses.length / responses.length) * 100
            : 0,
      });

      if (questions && completedResponses.length > 0) {
        const questionResults = await Promise.all(
          questions.map(async (q) => {
            const answersSnapshot = await getDocs(
              query(
                collection(db, 'survey_answers'),
                where('question_id', '==', q.id),
                where('response_id', 'in', completedResponses.map((r) => r.id))
              )
            );
            const answers = answersSnapshot.docs.map((d) => d.data()) as any[];

            const distribution: Record<string, number> = {};
            const textResponses: string[] = [];
            let ratingSum = 0;
            let ratingCount = 0;

            answers.forEach((ans) => {
              const value = ans.answer_value;

              if (q.question_type === 'text_short' || q.question_type === 'text_long') {
                if (value) textResponses.push(value as string);
              } else if (q.question_type === 'rating_stars' || q.question_type === 'rating_scale') {
                ratingSum += Number(value);
                ratingCount++;
                distribution[value] = (distribution[value] || 0) + 1;
              } else if (q.question_type === 'multiple_choice_multi') {
                const values = Array.isArray(value) ? value : [];
                values.forEach((v: string) => {
                  distribution[v] = (distribution[v] || 0) + 1;
                });
              } else {
                distribution[value] = (distribution[value] || 0) + 1;
              }
            });

            return {
              question_id: q.id,
              question_text: q.question_text,
              question_type: q.question_type,
              total_responses: answers.length || 0,
              answer_distribution: distribution,
              average_rating: ratingCount > 0 ? ratingSum / ratingCount : undefined,
              text_responses: textResponses.length > 0 ? textResponses : undefined,
            };
          })
        );

        setResults(questionResults);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const exportToCSV = () => {
    console.log('Exporting to CSV...');
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/surveys')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Back to Surveys</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{survey?.title}</h1>
              <p className="text-gray-600 mt-1">Survey Results & Analytics</p>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.total_responses}/{stats.total_sent}
            </h3>
            <p className="text-sm text-gray-600">Responses Received</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.response_rate.toFixed(0)}%
            </h3>
            <p className="text-sm text-gray-600">Response Rate</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="text-purple-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {formatTime(Math.round(stats.avg_completion_time))}
            </h3>
            <p className="text-sm text-gray-600">Avg. Completion Time</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="text-orange-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {stats.completion_rate.toFixed(0)}%
            </h3>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setSelectedTab('summary')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  selectedTab === 'summary'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Question Summary
              </button>
              <button
                onClick={() => setSelectedTab('responses')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  selectedTab === 'responses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Individual Responses
              </button>
            </div>
          </div>

          {selectedTab === 'summary' && (
            <div className="p-6 space-y-8">
              {results.map((result, index) => (
                <div key={result.question_id} className="border-b border-gray-200 pb-8 last:border-b-0">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {index + 1}. {result.question_text}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {result.total_responses} responses
                    </p>
                  </div>

                  {(result.question_type === 'multiple_choice_single' ||
                    result.question_type === 'yes_no' ||
                    result.question_type === 'likert') && (
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(result.answer_distribution).map(
                                ([name, value]) => ({ name, value })
                              )}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} (${(percent * 100).toFixed(0)}%)`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {Object.keys(result.answer_distribution).map(
                                (entry, idx) => (
                                  <Cell
                                    key={`cell-${idx}`}
                                    fill={COLORS[idx % COLORS.length]}
                                  />
                                )
                              )}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(result.answer_distribution).map(
                          ([answer, count]) => (
                            <div key={answer} className="flex items-center justify-between">
                              <span className="text-gray-700">{answer}</span>
                              <span className="font-semibold text-gray-900">
                                {count} (
                                {((count / result.total_responses) * 100).toFixed(0)}%)
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {(result.question_type === 'rating_stars' ||
                    result.question_type === 'rating_scale') && (
                    <div>
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-blue-600">
                          {result.average_rating?.toFixed(1)}
                        </span>
                        <span className="text-gray-600 ml-2">/ {result.question_type === 'rating_stars' ? '5' : '10'}</span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={Object.entries(result.answer_distribution).map(
                              ([rating, count]) => ({
                                rating: `${rating}`,
                                count,
                              })
                            )}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="rating" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#3B82F6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {result.question_type === 'multiple_choice_multi' && (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={Object.entries(result.answer_distribution).map(
                            ([option, count]) => ({ option, count })
                          )}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="option" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10B981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {(result.question_type === 'text_short' ||
                    result.question_type === 'text_long') &&
                    result.text_responses && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {result.text_responses.map((response, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                          >
                            <p className="text-gray-800">{response}</p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'responses' && (
            <div className="p-6">
              <p className="text-gray-600 text-center py-8">
                Individual response view coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
