import { createBrowserRouter, Navigate } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import CreateExam from '../pages/CreateExam';
import Results from '../pages/Results';
import Exams from '../pages/Exams';
import Settings from '../pages/Settings';
import Pricing from '../pages/Pricing';
import PublicPricing from '../pages/PublicPricing';
import EvaluationProgress from '../pages/EvaluationProgress';
import ExamDetail from '../pages/ExamDetail';
import Analytics from '../pages/Analytics';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Support from '../pages/Support';
import NotFound from '../pages/NotFound';
import Layout from '../components/layout/Layout';

// AI Quiz Arena Pages
import TeacherQuizzes from '../pages/teacher/TeacherQuizzes';
import CreateQuiz from '../pages/teacher/CreateQuiz';
import EditQuiz from '../pages/teacher/EditQuiz';
import HostArena from '../pages/teacher/HostArena';
import QuizResults from '../pages/teacher/QuizResults';
import StudentJoin from '../pages/student/StudentJoin';
import StudentArena from '../pages/student/StudentArena';
import StudentResult from '../pages/student/StudentResult';

// Guard for protected faculty portal routes
const ProtectedLayout = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout />;
};

// Smart pricing: public marketing page for unauthenticated visitors, internal billing manager for logged-in faculty
const SmartPricing = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (token) {
    return (
      <Layout>
        <Pricing />
      </Layout>
    );
  }
  return <PublicPricing />;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/pricing',
    element: <SmartPricing />,
  },
  {
    path: '/privacy',
    element: <Privacy />,
  },
  {
    path: '/terms',
    element: <Terms />,
  },
  {
    path: '/support',
    element: <Support />,
  },
  {
    path: '/help',
    element: <Navigate to="/support" replace />,
  },
  {
    path: '/contact',
    element: <Navigate to="/support" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/create-exam', element: <CreateExam /> },
      { path: '/results', element: <Results /> },
      { path: '/exams', element: <Exams /> },
      { path: '/exams/:id', element: <ExamDetail /> },
      { path: '/settings', element: <Settings /> },
      { path: '/analytics', element: <Analytics /> },
      { path: '/evaluation-progress', element: <EvaluationProgress /> },
      // AI Quiz Arena Teacher Routes
      { path: '/teacher/quizzes', element: <TeacherQuizzes /> },
      { path: '/teacher/quizzes/create', element: <CreateQuiz /> },
      { path: '/teacher/quizzes/:id/edit', element: <EditQuiz /> },
      { path: '/teacher/quizzes/:id/host', element: <HostArena /> },
      { path: '/teacher/quizzes/:id/results', element: <QuizResults /> },
    ],
  },
  // Student Mobile-First Quiz Arena Routes (Public / Guest)
  {
    path: '/join/:code',
    element: <StudentJoin />,
  },
  {
    path: '/join',
    element: <StudentJoin />,
  },
  {
    path: '/quiz/:sessionId',
    element: <StudentArena />,
  },
  {
    path: '/quiz/:sessionId/result',
    element: <StudentResult />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);
