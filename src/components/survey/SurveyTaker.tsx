import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, CheckCircle } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getDoc, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import { renderQuestion } from './QuestionTypes';

interface Survey {
  id: string;
  title: string;
  description: string;
  show_progress: boolean;
  estimated_minutes: number;
  thank_you_message: string;
}

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  order_index: number;
  options?: string[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: any;
  help_text?: string;
  char_limit?: number;
  created_at?: any;
}

export default function SurveyTaker() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [responseId, setResponseId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigate('/');
        return;
      }

      const surveyDoc = await getDoc(doc(db, 'surveys', surveyId!));
      const surveyData = surveyDoc.exists() ? { id: surveyDoc.id, ...surveyDoc.data() } : null;

      const questionsSnapshot = await getDocs(
        query(
          collection(db, 'survey_questions'),
          where('survey_id', '==', surveyId),
          orderBy('order_index')
        )
      );
      const questionsData = questionsSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];

      if (surveyData) setSurvey(surveyData as Survey);
      if (questionsData) setQuestions(questionsData);

      const existingResponseSnapshot = await getDocs(
        query(
          collection(db, 'survey_responses'),
          where('survey_id', '==', surveyId),
          where('user_id', '==', user.uid),
          where('is_complete', '==', false)
        )
      );
      const existingResponseDoc = existingResponseSnapshot.docs[0];

      if (existingResponseDoc) {
        const existingResponse = { id: existingResponseDoc.id, ...existingResponseDoc.data() } as any;
        setResponseId(existingResponse.id);
        setCurrentIndex(existingResponse.current_question_index);
        await loadExistingAnswers(existingResponse.id);
      } else {
        const newResponseRef = await addDoc(collection(db, 'survey_responses'), {
          survey_id: surveyId,
          user_id: user.uid,
          started_at: new Date().toISOString(),
          is_complete: false,
          current_question_index: 0,
          created_at: serverTimestamp(),
        });

        setResponseId(newResponseRef.id);
      }

      const notifSnapshot = await getDocs(
        query(
          collection(db, 'survey_notifications'),
          where('survey_id', '==', surveyId),
          where('user_id', '==', user.uid)
        )
      );
      await Promise.all(
        notifSnapshot.docs.map((n) =>
          updateDoc(doc(db, 'survey_notifications', n.id), {
            status: 'opened',
            opened_at: new Date().toISOString(),
            updated_at: serverTimestamp(),
          })
        )
      );
    } catch (error) {
      console.error('Error loading survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAnswers = async (respId: string) => {
    const snapshot = await getDocs(
      query(collection(db, 'survey_answers'), where('response_id', '==', respId))
    );
    const data = snapshot.docs.map((d) => d.data()) as any[];

    if (data) {
      const answersMap: Record<string, any> = {};
      data.forEach((ans) => {
        answersMap[ans.question_id] = ans.answer_value;
      });
      setAnswers(answersMap);
    }
  };

  const saveAnswer = async (questionId: string, value: any) => {
    if (!responseId) return;

    setSaving(true);
    try {
      const existingSnapshot = await getDocs(
        query(
          collection(db, 'survey_answers'),
          where('response_id', '==', responseId),
          where('question_id', '==', questionId)
        )
      );
      const existingDoc = existingSnapshot.docs[0];

      if (existingDoc) {
        await updateDoc(doc(db, 'survey_answers', existingDoc.id), {
          answer_value: value,
          answered_at: new Date().toISOString(),
          updated_at: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, 'survey_answers'), {
          response_id: responseId,
          question_id: questionId,
          answer_value: value,
          answered_at: new Date().toISOString(),
          created_at: serverTimestamp(),
        });
      }

      await updateDoc(doc(db, 'survey_responses', responseId), {
        current_question_index: currentIndex,
        updated_at: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAnswerChange = (value: any) => {
    const currentQuestion = questions[currentIndex];
    setAnswers({ ...answers, [currentQuestion.id]: value });
    saveAnswer(currentQuestion.id, value);
    setErrors({ ...errors, [currentQuestion.id]: '' });
  };

  const validateCurrentQuestion = () => {
    const currentQuestion = questions[currentIndex];
    if (!currentQuestion.required) return true;

    const answer = answers[currentQuestion.id];
    if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
      setErrors({
        ...errors,
        [currentQuestion.id]: 'This question is required',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentQuestion()) return;

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion() || !responseId) return;

    setSaving(true);
    try {
      const startTime = new Date(questions[0]?.created_at || new Date());
      const completionTime = Math.floor((Date.now() - startTime.getTime()) / 1000);

      await updateDoc(doc(db, 'survey_responses', responseId), {
        is_complete: true,
        completed_at: new Date().toISOString(),
        completion_time_seconds: completionTime,
        updated_at: serverTimestamp(),
      });

      const user = auth.currentUser;
      if (user) {
        const notifSnapshot = await getDocs(
          query(
            collection(db, 'survey_notifications'),
            where('survey_id', '==', surveyId),
            where('user_id', '==', user.uid)
          )
        );
        await Promise.all(
          notifSnapshot.docs.map((n) =>
            updateDoc(doc(db, 'survey_notifications', n.id), {
              status: 'completed',
              completed_at: new Date().toISOString(),
              updated_at: serverTimestamp(),
            })
          )
        );
      }

      setCompleted(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (responseId) {
      await updateDoc(doc(db, 'survey_responses', responseId), {
        current_question_index: currentIndex,
        updated_at: serverTimestamp(),
      });
    }
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (completed && survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Thank You for Your Feedback!
            </h1>
            <p className="text-lg text-gray-600">{survey.thank_you_message}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-blue-900">
              Your input helps us improve MyHealthStatus for everyone in the pilot program.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!survey || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">Survey not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-gray-900">{survey.title}</h1>
            <button
              onClick={handleSaveAndExit}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm"
              disabled={saving}
            >
              <Save size={18} />
              <span>Save & Exit</span>
            </button>
          </div>
          {survey.show_progress && (
            <div>
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span>~{survey.estimated_minutes} minutes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {currentQuestion.question_text}
              {currentQuestion.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </h2>
            {currentQuestion.help_text && (
              <p className="text-sm text-gray-600">{currentQuestion.help_text}</p>
            )}
          </div>

          {renderQuestion(
            currentQuestion,
            answers[currentQuestion.id],
            handleAnswerChange,
            errors[currentQuestion.id]
          )}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Submit Survey'}
                <CheckCircle size={20} />
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {saving && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Saving your answer...</p>
          </div>
        )}
      </div>
    </div>
  );
}
