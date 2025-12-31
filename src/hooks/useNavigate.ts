import { useState, useEffect } from 'react';

export type Route =
  | '/login'
  | '/signup'
  | '/auth'
  | '/dashboard'
  | '/modules'
  | '/admin'
  | '/certificate'
  | '/state-syllabus'
  | '/flashcards'
  | '/exam-simulation'
  | '/profile'
  | '/admin-answer-keys'
  | '/phase-unlock'
  | '/exam-proof-upload'
  | '/success'
  | '/cancel'
  | { type: 'module'; id: string }
  | { type: 'lesson'; moduleId: string; lessonId: string }
  | { type: 'quiz'; moduleId: string; quizId: string }
  | { type: 'lessonQuiz'; lessonId: string }
  | { type: 'quizReview'; attemptId: string }
  | { type: 'flashcardsLesson'; lessonId: string };

// Parse URL path to Route
function parsePathToRoute(pathname: string): Route {
  // Handle simple string routes
  const simpleRoutes: Route[] = [
    '/login',
    '/signup',
    '/auth',
    '/dashboard',
    '/modules',
    '/admin',
    '/certificate',
    '/state-syllabus',
    '/flashcards',
    '/exam-simulation',
    '/profile',
    '/admin-answer-keys',
    '/phase-unlock',
    '/exam-proof-upload',
    '/success',
    '/cancel',
  ];

  if (simpleRoutes.includes(pathname as Route)) {
    return pathname as Route;
  }

  // Handle dynamic routes
  const moduleMatch = pathname.match(/^\/module\/([^/]+)$/);
  if (moduleMatch) {
    return { type: 'module', id: moduleMatch[1] };
  }

  const lessonMatch = pathname.match(/^\/module\/([^/]+)\/lesson\/([^/]+)$/);
  if (lessonMatch) {
    return { type: 'lesson', moduleId: lessonMatch[1], lessonId: lessonMatch[2] };
  }

  const quizMatch = pathname.match(/^\/module\/([^/]+)\/quiz\/([^/]+)$/);
  if (quizMatch) {
    return { type: 'quiz', moduleId: quizMatch[1], quizId: quizMatch[2] };
  }

  const lessonQuizMatch = pathname.match(/^\/lesson-quiz\/([^/]+)$/);
  if (lessonQuizMatch) {
    return { type: 'lessonQuiz', lessonId: lessonQuizMatch[1] };
  }

  const quizReviewMatch = pathname.match(/^\/quiz-review\/([^/]+)$/);
  if (quizReviewMatch) {
    return { type: 'quizReview', attemptId: quizReviewMatch[1] };
  }

  const flashcardsLessonMatch = pathname.match(/^\/flashcards\/lesson\/([^/]+)$/);
  if (flashcardsLessonMatch) {
    return { type: 'flashcardsLesson', lessonId: flashcardsLessonMatch[1] };
  }

  // Default to login for root or unknown routes
  if (pathname === '/' || pathname === '') {
    return '/login';
  }

  return '/login';
}

// Convert Route to URL path
function routeToPath(route: Route): string {
  if (typeof route === 'string') {
    return route;
  }

  switch (route.type) {
    case 'module':
      return `/module/${route.id}`;
    case 'lesson':
      return `/module/${route.moduleId}/lesson/${route.lessonId}`;
    case 'quiz':
      return `/module/${route.moduleId}/quiz/${route.quizId}`;
    case 'lessonQuiz':
      return `/lesson-quiz/${route.lessonId}`;
    case 'quizReview':
      return `/quiz-review/${route.attemptId}`;
    case 'flashcardsLesson':
      return `/flashcards/lesson/${route.lessonId}`;
    default:
      return '/login';
  }
}

// Initialize from current URL
let currentRoute: Route = parsePathToRoute(window.location.pathname);
let listeners: Array<(route: Route) => void> = [];

// Listen for browser back/forward navigation
window.addEventListener('popstate', () => {
  currentRoute = parsePathToRoute(window.location.pathname);
  listeners.forEach((listener) => listener(currentRoute));
});

export function useNavigate() {
  const [, setUpdate] = useState({});

  useEffect(() => {
    const listener = () => setUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return (route: Route) => {
    currentRoute = route;
    const path = routeToPath(route);
    window.history.pushState({}, '', path);
    listeners.forEach((listener) => listener(route));
  };
}

export function useCurrentRoute(): Route {
  const [route, setRoute] = useState<Route>(currentRoute);

  useEffect(() => {
    const listener = (newRoute: Route) => setRoute(newRoute);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return route;
}
