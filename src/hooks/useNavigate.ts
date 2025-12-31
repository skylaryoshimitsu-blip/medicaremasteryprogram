import { useState, useEffect } from 'react';

export type Route =
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

let currentRoute: Route = '/auth';
let listeners: Array<(route: Route) => void> = [];

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
