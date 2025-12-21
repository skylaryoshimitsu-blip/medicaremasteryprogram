import { useAuth } from './contexts/AuthContext';
import { useCurrentRoute } from './hooks/useNavigate';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { ModulesList } from './pages/ModulesList';
import { ModuleDetail } from './pages/ModuleDetail';
import { LessonDetail } from './pages/LessonDetail';
import { Quiz } from './pages/Quiz';
import { Certificate } from './pages/Certificate';
import { Admin } from './pages/Admin';
import LessonQuiz from './pages/LessonQuiz';
import QuizReview from './pages/QuizReview';
import StateSyllabus from './pages/StateSyllabus';
import Flashcards from './pages/Flashcards';
import ExamSimulation from './pages/ExamSimulation';
import Profile from './pages/Profile';
import AdminAnswerKeys from './pages/AdminAnswerKeys';
import PhaseUnlock from './pages/PhaseUnlock';
import { ExamProofUpload } from './pages/ExamProofUpload';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';

function App() {
  const { user, loading } = useAuth();
  const route = useCurrentRoute();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (typeof route === 'string') {
    switch (route) {
      case '/auth':
        return <Auth />;
      case '/dashboard':
        return <Dashboard />;
      case '/modules':
        return <ModulesList />;
      case '/admin':
        return (
          <ProtectedAdminRoute>
            <Admin />
          </ProtectedAdminRoute>
        );
      case '/admin-answer-keys':
        return (
          <ProtectedAdminRoute>
            <AdminAnswerKeys />
          </ProtectedAdminRoute>
        );
      case '/certificate':
        return <Certificate />;
      case '/state-syllabus':
        return <StateSyllabus />;
      case '/flashcards':
        return <Flashcards />;
      case '/exam-simulation':
        return <ExamSimulation />;
      case '/profile':
        return <Profile />;
      case '/phase-unlock':
        return <PhaseUnlock />;
      case '/exam-proof-upload':
        return <ExamProofUpload />;
      default:
        return <Dashboard />;
    }
  }

  if (route.type === 'module') {
    return <ModuleDetail moduleId={route.id} />;
  }

  if (route.type === 'lesson') {
    return <LessonDetail moduleId={route.moduleId} lessonId={route.lessonId} />;
  }

  if (route.type === 'quiz') {
    return <Quiz moduleId={route.moduleId} quizId={route.quizId} />;
  }

  if (route.type === 'lessonQuiz') {
    return <LessonQuiz />;
  }

  if (route.type === 'quizReview') {
    return <QuizReview />;
  }

  if (route.type === 'flashcardsLesson') {
    return <Flashcards />;
  }

  return <Dashboard />;
}

export default App;
