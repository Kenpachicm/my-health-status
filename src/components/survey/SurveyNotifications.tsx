import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, ArrowRight, X } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';

interface PendingSurvey {
  id: string;
  title: string;
  description: string;
  estimated_minutes: number;
  notification_id: string;
  status: string;
}

export default function SurveyNotifications() {
  const navigate = useNavigate();
  const [pendingSurveys, setPendingSurveys] = useState<PendingSurvey[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPendingSurveys();
  }, []);

  const loadPendingSurveys = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const withTimeout = <T,>(p: Promise<T>, ms = 8000): Promise<T> =>
        Promise.race([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
        ]);

      const notifSnapshot = await withTimeout(
        getDocs(
          query(
            collection(db, 'survey_notifications'),
            where('user_id', '==', user.uid),
            where('status', 'in', ['pending', 'opened']),
            orderBy('sent_at', 'desc')
          )
        )
      );
      const notifications = notifSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      if (notifications.length > 0) {
        const surveys = await Promise.all(
          notifications
            .filter((n) => n.survey_id)
            .map(async (n) => {
              const surveyDoc = await withTimeout(getDoc(doc(db, 'surveys', n.survey_id)));
              const s = surveyDoc.exists() ? (surveyDoc.data() as any) : null;
              return {
                id: s?.id ?? n.survey_id,
                title: s?.title,
                description: s?.description,
                estimated_minutes: s?.estimated_minutes,
                notification_id: n.id,
                status: n.status,
              };
            })
        );
        const validSurveys = surveys.filter((s) => s.title) as PendingSurvey[];
        setPendingSurveys(validSurveys);
      }
    } catch (error) {
      // Firestore unreachable — silently skip survey notifications
    }
  };

  const handleStartSurvey = (surveyId: string) => {
    navigate(`/survey/${surveyId}`);
  };

  const handleDismiss = async (notificationId: string, surveyId: string) => {
    setDismissed(new Set([...dismissed, surveyId]));

    try {
      await updateDoc(doc(db, 'survey_notifications', notificationId), {
        status: 'skipped',
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error dismissing survey:', error);
    }
  };

  const visibleSurveys = pendingSurveys.filter(s => !dismissed.has(s.id));

  if (visibleSurveys.length === 0) return null;

  return (
    <div className="space-y-4">
      {visibleSurveys.map((survey) => (
        <div
          key={survey.id}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="bg-blue-100 p-3 rounded-lg">
                <ClipboardList className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold text-gray-900">{survey.title}</h3>
                  {survey.status === 'opened' && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{survey.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>~{survey.estimated_minutes} minutes</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDismiss(survey.notification_id, survey.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <X size={20} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={() => handleStartSurvey(survey.id)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <span>{survey.status === 'opened' ? 'Continue' : 'Start'} Survey</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
