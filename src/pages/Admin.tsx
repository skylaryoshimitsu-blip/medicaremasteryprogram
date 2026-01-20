import { useEffect, useState } from 'react';
import { RefreshCw, Check, X, XCircle, Save, Trash2 } from 'lucide-react';
import { supabase, Profile, Module } from '../lib/supabase';
import { Sidebar } from '../components/Sidebar';

type UserWithProgress = Profile & {
  progress: number;
  lastModule: string;
};

type QuizQuestion = {
  id: string;
  quiz_id: string;
  question_text: string;
  options: string[];
  correct_answer: number;
  order_index: number;
};

function QuizQuestionEditor({
  question,
  index,
  onSave,
  onDelete,
}: {
  question: QuizQuestion;
  index: number;
  onSave: (question: QuizQuestion) => void;
  onDelete: () => void;
}) {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onSave(editedQuestion);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="font-medium text-gray-900 mb-2">
              Question {index + 1}: {question.question_text}
            </div>
            <div className="space-y-1">
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`text-sm ${
                    idx === question.correct_answer
                      ? 'text-green-600 font-medium'
                      : 'text-gray-600'
                  }`}
                >
                  {String.fromCharCode(65 + idx)}. {option}
                  {idx === question.correct_answer && ' (Correct)'}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Save size={18} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 bg-gray-50">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question {index + 1}
          </label>
          <textarea
            value={editedQuestion.question_text}
            onChange={(e) =>
              setEditedQuestion({ ...editedQuestion, question_text: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          {editedQuestion.options.map((option, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600 w-6">
                {String.fromCharCode(65 + idx)}.
              </span>
              <input
                type="text"
                value={option}
                onChange={(e) => {
                  const newOptions = [...editedQuestion.options];
                  newOptions[idx] = e.target.value;
                  setEditedQuestion({ ...editedQuestion, options: newOptions });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={editedQuestion.correct_answer === idx}
                onChange={() =>
                  setEditedQuestion({ ...editedQuestion, correct_answer: idx })
                }
                className="w-4 h-4"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditedQuestion(question);
              setIsEditing(false);
            }}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

type StudentWithDetails = Profile & {
  currentPhase: number | null;
  examStatus: 'passed' | 'not_passed' | 'not_attempted';
  lastActivity: string | null;
};

type PhaseUnlock = {
  id: string;
  user_id: string;
  phase_number: number;
  screenshot_url: string | null;
  uploaded_at: string | null;
  approved: boolean | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  profiles?: {
    full_name: string;
    email: string;
  };
  reviewer?: {
    full_name: string;
  };
};

type Tab = 'students' | 'progress' | 'uploads' | 'content' | 'phase-unlock';

type Lesson = {
  id: string;
  module_id: string;
  title: string;
  content: string;
  order_index: number;
  is_active: boolean;
};

type Quiz = {
  id: string;
  module_id: string;
  title: string;
  passing_score: number;
};

export function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('students');
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [usersWithProgress, setUsersWithProgress] = useState<UserWithProgress[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [uploads, setUploads] = useState<PhaseUnlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [examAttempts, setExamAttempts] = useState<any[]>([]);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [editingLesson, setEditingLesson] = useState(false);
  const [rejectingUpload, setRejectingUpload] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminPhases, setAdminPhases] = useState<any[]>([]);
  const [selectedStudentForPhaseUnlock, setSelectedStudentForPhaseUnlock] = useState<Profile | null>(null);
  const [studentPhases, setStudentPhases] = useState<any[]>([]);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [phaseModules, setPhaseModules] = useState<any[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleLessons, setModuleLessons] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);

    if (activeTab === 'students') {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (profilesData) {
        const studentsWithDetails = await Promise.all(
          profilesData.map(async (student) => {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('module_id, is_completed, modules!inner(phase_number)')
              .eq('user_id', student.id)
              .eq('is_unlocked', true)
              .order('modules(phase_number)', { ascending: false });

            const currentPhase = progressData && progressData.length > 0
              ? (progressData[0] as any).modules.phase_number
              : null;

            const { data: examData } = await supabase
              .from('exam_simulation_attempts')
              .select('passed')
              .eq('user_id', student.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            let examStatus: 'passed' | 'not_passed' | 'not_attempted' = 'not_attempted';
            if (examData) {
              examStatus = examData.passed ? 'passed' : 'not_passed';
            }

            return {
              ...student,
              currentPhase,
              examStatus,
              lastActivity: student.last_activity_at,
            };
          })
        );

        setStudents(studentsWithDetails);
      }
    }

    if (activeTab === 'progress') {
      const [profilesRes, modulesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student'),
        supabase.from('modules').select('*').order('order_index'),
      ]);

      if (profilesRes.data && modulesRes.data) {
        setModules(modulesRes.data);

        const usersWithProgress = await Promise.all(
          profilesRes.data.map(async (user) => {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('*, modules!inner(title)')
              .eq('user_id', user.id);

            const completed = progressData?.filter((p) => p.is_completed).length || 0;
            const progress = Math.round((completed / modulesRes.data.length) * 100);

            const lastCompleted = progressData?.find((p) => p.is_completed);
            const lastModule = lastCompleted
              ? (lastCompleted as any).modules.title
              : 'Not started';

            return {
              ...user,
              progress,
              lastModule,
            };
          })
        );

        setUsersWithProgress(usersWithProgress);
      }
    }

    if (activeTab === 'uploads') {
      const { data } = await supabase
        .from('phase_unlocks')
        .select(`
          *,
          profiles!phase_unlocks_user_id_fkey(full_name, email),
          reviewer:profiles!phase_unlocks_reviewed_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      if (data) setUploads(data as PhaseUnlock[]);
    }

    if (activeTab === 'content') {
      const { data } = await supabase
        .from('modules')
        .select('*')
        .order('order_index');
      if (data) setModules(data);
    }

    if (activeTab === 'phase-unlock') {
      const [modulesRes, currentUserRes, studentsRes] = await Promise.all([
        supabase.from('modules').select('*').order('phase_number'),
        supabase.auth.getUser(),
        supabase.from('profiles').select('*').eq('role', 'student').order('created_at', { ascending: false }),
      ]);

      if (modulesRes.data) {
        setModules(modulesRes.data);

        if (currentUserRes.data.user) {
          const { data: progressData } = await supabase
            .from('user_progress')
            .select('module_id, is_unlocked')
            .eq('user_id', currentUserRes.data.user.id);

          const phaseStatus = modulesRes.data.map((module) => {
            const progress = progressData?.find((p) => p.module_id === module.id);
            return {
              phase_number: module.phase_number,
              phase_name: `Phase ${module.phase_number}`,
              module_id: module.id,
              title: module.title,
              is_unlocked: progress?.is_unlocked || false,
            };
          });

          setAdminPhases(phaseStatus);
        }
      }

      if (studentsRes.data) {
        const studentsWithDetails = await Promise.all(
          studentsRes.data.map(async (student) => {
            const { data: progressData } = await supabase
              .from('user_progress')
              .select('module_id, is_completed, modules!inner(phase_number)')
              .eq('user_id', student.id)
              .order('modules(phase_number)');

            const currentPhase = progressData?.find((p) => !p.is_completed);
            const completedCount = progressData?.filter((p) => p.is_completed).length || 0;

            return {
              ...student,
              currentPhase: currentPhase
                ? `Phase ${(currentPhase.modules as any).phase_number}`
                : 'Completed',
              progress: Math.round((completedCount / (progressData?.length || 1)) * 100),
              lastActivityAt: student.last_activity_at,
            };
          })
        );
        setStudents(studentsWithDetails);
      }
    }

    setLoading(false);
  }

  async function resetUserProgress(userId: string) {
    if (!confirm('Are you sure you want to reset this user\'s progress?')) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await Promise.all([
      supabase.from('user_progress').delete().eq('user_id', userId),
      supabase.from('lesson_completions').delete().eq('user_id', userId),
      supabase.from('quiz_attempts').delete().eq('user_id', userId),
    ]);

    const firstModule = modules[0];
    if (firstModule) {
      await supabase.from('user_progress').insert([
        {
          user_id: userId,
          module_id: firstModule.id,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        },
      ]);
    }

    await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: 'student_progress_reset',
        target_type: 'student',
        target_id: userId,
        details: {},
      });

    loadData();
  }

  async function approveUpload(uploadId: string, approve: boolean, reason?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const upload = uploads.find((u) => u.id === uploadId);
    if (!upload) return;

    const status = approve ? 'approved' : 'rejected';

    await supabase
      .from('phase_unlocks')
      .update({
        status,
        rejection_reason: approve ? null : reason || null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', uploadId);

    await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: approve ? 'upload_approved' : 'upload_rejected',
        target_type: 'upload',
        target_id: uploadId,
        details: {
          student_user_id: upload.user_id,
          phase_number: upload.phase_number,
          screenshot_url: upload.screenshot_url,
          rejection_reason: reason || null,
        },
      });

    loadData();
  }

  function handleReject(uploadId: string) {
    setRejectingUpload(uploadId);
    setRejectionReason('');
  }

  function confirmReject() {
    if (rejectingUpload) {
      approveUpload(rejectingUpload, false, rejectionReason);
      setRejectingUpload(null);
      setRejectionReason('');
    }
  }

  async function viewStudentDetails(student: StudentWithDetails) {
    setSelectedStudent(student);

    const [modulesRes, examAttemptsRes] = await Promise.all([
      supabase.from('modules').select('*').order('order_index'),
      supabase
        .from('exam_simulation_attempts')
        .select('version_number, score, passed, created_at')
        .eq('user_id', student.id)
        .order('created_at', { ascending: false }),
    ]);

    const modulesData = modulesRes.data;
    const examAttemptsData = examAttemptsRes.data || [];

    setExamAttempts(examAttemptsData);

    if (modulesData) {
      const progressDetails = await Promise.all(
        modulesData.map(async (module) => {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', student.id)
            .eq('module_id', module.id)
            .maybeSingle();

          const { data: quizData } = await supabase
            .from('quizzes')
            .select('id')
            .eq('module_id', module.id)
            .maybeSingle();

          let quizAttempts: any[] = [];
          if (quizData) {
            const { data: attempts } = await supabase
              .from('quiz_attempts')
              .select('score, passed, created_at')
              .eq('user_id', student.id)
              .eq('quiz_id', quizData.id)
              .order('created_at', { ascending: false });

            quizAttempts = attempts || [];
          }

          const bestScore = quizAttempts.length > 0
            ? Math.max(...quizAttempts.map((a) => a.score))
            : null;

          return {
            module,
            progress,
            quizAttempts,
            bestScore,
          };
        })
      );

      setStudentProgress(progressDetails);
    }
  }

  async function loadModuleLessons(module: Module) {
    setSelectedModule(module);
    setSelectedLesson(null);
    setEditingLesson(false);

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('order_index');

    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('module_id', module.id);

    if (lessonsData) setLessons(lessonsData);
    if (quizzesData) setQuizzes(quizzesData);
  }

  async function loadLessonForEdit(lesson: Lesson) {
    setSelectedLesson(lesson);
    setEditingLesson(true);
  }

  async function loadQuizQuestions(quizId: string) {
    const { data } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('quiz_id', quizId)
      .order('order_index');

    if (data) {
      setQuizQuestions(
        data.map((q) => ({
          ...q,
          options: q.options as string[],
        }))
      );
    }
  }

  async function saveLessonContent() {
    if (!selectedLesson) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('lessons')
      .update({
        title: selectedLesson.title,
        content: selectedLesson.content,
      })
      .eq('id', selectedLesson.id);

    await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: 'lesson_updated',
        target_type: 'lesson',
        target_id: selectedLesson.id,
        details: {
          lesson_title: selectedLesson.title,
        },
      });

    setEditingLesson(false);
    if (selectedModule) loadModuleLessons(selectedModule);
  }

  async function saveQuizQuestion(question: QuizQuestion) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('quiz_questions')
      .update({
        question_text: question.question_text,
        options: question.options,
        correct_answer: question.correct_answer,
      })
      .eq('id', question.id);

    await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: 'quiz_updated',
        target_type: 'quiz_question',
        target_id: question.id,
        details: {
          quiz_id: question.quiz_id,
          question_text: question.question_text,
        },
      });

    const quizId = question.quiz_id;
    loadQuizQuestions(quizId);
  }

  async function deleteQuizQuestion(questionId: string, quizId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('quiz_questions').delete().eq('id', questionId);

    await supabase
      .from('admin_action_logs')
      .insert({
        admin_user_id: user.id,
        action_type: 'quiz_question_deleted',
        target_type: 'quiz_question',
        target_id: questionId,
        details: {
          quiz_id: quizId,
        },
      });

    loadQuizQuestions(quizId);
  }

  async function addQuizQuestion(quizId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: maxOrderData } = await supabase
      .from('quiz_questions')
      .select('order_index')
      .eq('quiz_id', quizId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextOrder = maxOrderData ? maxOrderData.order_index + 1 : 0;

    const { data: newQuestion } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question_text: 'New question',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 0,
        order_index: nextOrder,
      })
      .select()
      .single();

    if (newQuestion) {
      await supabase
        .from('admin_action_logs')
        .insert({
          admin_user_id: user.id,
          action_type: 'quiz_question_created',
          target_type: 'quiz_question',
          target_id: newQuestion.id,
          details: {
            quiz_id: quizId,
          },
        });
    }

    loadQuizQuestions(quizId);
  }

  function closeStudentModal() {
    setSelectedStudent(null);
    setStudentProgress([]);
    setExamAttempts([]);
  }

  async function unlockPhaseForAdmin(moduleId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('module_id', moduleId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_progress')
        .update({
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_progress').insert({
        user_id: user.id,
        module_id: moduleId,
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
      });
    }

    loadData();
  }

  async function selectStudentForPhaseUnlock(student: Profile) {
    setSelectedStudentForPhaseUnlock(student);

    const { data: progressData } = await supabase
      .from('user_progress')
      .select('module_id, is_unlocked')
      .eq('user_id', student.id);

    const phaseStatus = modules.map((module) => {
      const progress = progressData?.find((p) => p.module_id === module.id);
      return {
        phase_number: module.phase_number,
        phase_name: `Phase ${module.phase_number}`,
        module_id: module.id,
        title: module.title,
        is_unlocked: progress?.is_unlocked || false,
      };
    });

    setStudentPhases(phaseStatus);
  }

  async function unlockPhaseForStudent(moduleId: string) {
    if (!selectedStudentForPhaseUnlock) return;

    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', selectedStudentForPhaseUnlock.id)
      .eq('module_id', moduleId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('user_progress')
        .update({
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      await supabase.from('user_progress').insert({
        user_id: selectedStudentForPhaseUnlock.id,
        module_id: moduleId,
        is_unlocked: true,
        unlocked_at: new Date().toISOString(),
      });
    }

    selectStudentForPhaseUnlock(selectedStudentForPhaseUnlock);
  }

  async function unlockAllPhasesForStudent() {
    if (!selectedStudentForPhaseUnlock) return;
    if (!confirm(`Unlock all phases for ${selectedStudentForPhaseUnlock.full_name}?`)) return;

    const unlockPromises = modules.map((module) => {
      return supabase
        .from('user_progress')
        .upsert({
          user_id: selectedStudentForPhaseUnlock.id,
          module_id: module.id,
          is_unlocked: true,
          unlocked_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,module_id'
        });
    });

    await Promise.all(unlockPromises);
    selectStudentForPhaseUnlock(selectedStudentForPhaseUnlock);
  }

  async function togglePhaseExpansion(phaseNumber: number) {
    if (expandedPhase === phaseNumber) {
      setExpandedPhase(null);
      setPhaseModules([]);
      return;
    }

    setExpandedPhase(phaseNumber);
    const module = modules.find((m) => m.phase_number === phaseNumber);
    if (!module || !selectedStudentForPhaseUnlock) return;

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id, title, order_index, is_active')
      .eq('module_id', module.id)
      .order('order_index');

    if (lessonsData) {
      const { data: completionsData } = await supabase
        .from('lesson_completions')
        .select('lesson_id')
        .eq('user_id', selectedStudentForPhaseUnlock.id);

      const lessonStatus = lessonsData.map((lesson) => ({
        ...lesson,
        is_completed: completionsData?.some((c) => c.lesson_id === lesson.id) || false,
      }));

      setPhaseModules([{ module_id: module.id, lessons: lessonStatus }]);
    }
  }

  async function unlockLessonForStudent(lessonId: string) {
    if (!selectedStudentForPhaseUnlock) return;

    const { data: existing } = await supabase
      .from('lesson_completions')
      .select('id')
      .eq('user_id', selectedStudentForPhaseUnlock.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (!existing) {
      await supabase.from('lesson_completions').insert({
        user_id: selectedStudentForPhaseUnlock.id,
        lesson_id: lessonId,
      });
    }

    if (expandedPhase !== null) {
      togglePhaseExpansion(expandedPhase);
    }
  }

  async function unlockAllLessonsInPhase(phaseNumber: number) {
    if (!selectedStudentForPhaseUnlock) return;
    if (!confirm(`Unlock all lessons in Phase ${phaseNumber}?`)) return;

    const module = modules.find((m) => m.phase_number === phaseNumber);
    if (!module) return;

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', module.id);

    if (lessonsData) {
      const completionPromises = lessonsData.map((lesson) => {
        return supabase
          .from('lesson_completions')
          .upsert({
            user_id: selectedStudentForPhaseUnlock.id,
            lesson_id: lesson.id,
          }, {
            onConflict: 'user_id,lesson_id'
          });
      });

      await Promise.all(completionPromises);
    }

    if (expandedPhase !== null) {
      togglePhaseExpansion(expandedPhase);
    }
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Manage students, progress, and content</p>
          </div>

          <div className="bg-white border-b border-gray-200 mb-6">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'students'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'progress'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Progress
              </button>
              <button
                onClick={() => setActiveTab('uploads')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'uploads'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Upload Reviews
              </button>
              <button
                onClick={() => setActiveTab('content')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'content'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Content Manager
              </button>
              <button
                onClick={() => setActiveTab('phase-unlock')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'phase-unlock'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                Phase Unlock
              </button>
            </nav>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : (
            <>
              {activeTab === 'students' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Enrollment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Current Phase
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Activity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Exam Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr
                          key={student.id}
                          onClick={() => viewStudentDetails(student)}
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{student.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                                student.enrollment_status === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {student.enrollment_status === 'paid' ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {student.currentPhase ? `Phase ${student.currentPhase}` : 'Not started'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {student.lastActivity
                                ? new Date(student.lastActivity).toLocaleDateString()
                                : 'No activity'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {student.examStatus === 'passed' && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                                Passed
                              </span>
                            )}
                            {student.examStatus === 'not_passed' && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                                Not Passed
                              </span>
                            )}
                            {student.examStatus === 'not_attempted' && (
                              <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                Not Attempted
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                            No students enrolled
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Progress
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Last Module
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {usersWithProgress.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${user.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600">{user.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{user.lastModule}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => resetUserProgress(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                              title="Reset Progress"
                            >
                              <RefreshCw size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {usersWithProgress.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No student progress data
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'uploads' && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Phase
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          File
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Reviewed By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {uploads.map((upload) => (
                        <tr key={upload.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {upload.profiles?.full_name}
                            </div>
                            <div className="text-xs text-gray-500">{upload.profiles?.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">Phase {upload.phase_number}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {new Date(upload.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {upload.screenshot_url ? (
                              <a
                                href={upload.screenshot_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                View File
                              </a>
                            ) : (
                              <span className="text-sm text-gray-400">No file</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              {upload.status === 'pending' && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                                  Pending
                                </span>
                              )}
                              {upload.status === 'approved' && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                                  Approved
                                </span>
                              )}
                              {upload.status === 'rejected' && (
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800">
                                  Rejected
                                </span>
                              )}
                              {upload.rejection_reason && upload.status === 'rejected' && (
                                <div className="mt-1 text-xs text-gray-600">
                                  Reason: {upload.rejection_reason}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {upload.reviewed_by && upload.reviewer ? (
                              <div className="text-sm">
                                <div className="text-gray-900 font-medium">
                                  {upload.reviewer.full_name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(upload.reviewed_at!).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">Not reviewed</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approveUpload(upload.id, true)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Approve"
                                disabled={upload.status === 'approved'}
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(upload.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reject"
                                disabled={upload.status === 'rejected'}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {uploads.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                            No upload reviews pending
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'content' && (
                <>
                  {!selectedModule && !editingLesson && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Modules</h3>
                        <p className="text-sm text-gray-600 mt-1">Select a module to edit its lessons and quizzes</p>
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Phase
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {modules.map((module) => (
                            <tr key={module.id}>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                  Phase {module.phase_number}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">{module.title}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-600 max-w-md truncate">
                                  {module.description}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => loadModuleLessons(module)}
                                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Edit Content
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedModule && !editingLesson && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{selectedModule.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">Edit lessons and quiz questions</p>
                        </div>
                        <button
                          onClick={() => setSelectedModule(null)}
                          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                        >
                          Back to Modules
                        </button>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">Lessons</h4>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {lessons.map((lesson) => (
                            <div key={lesson.id} className="px-6 py-4 flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-gray-900">{lesson.title}</div>
                                  {lesson.is_active === false && (
                                    <span className="px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-600">
                                      Inactive
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 line-clamp-2">{lesson.content}</div>
                              </div>
                              <button
                                onClick={() => loadLessonForEdit(lesson)}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                              >
                                Edit
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white rounded-lg border border-gray-200">
                          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">{quiz.title}</h4>
                            <button
                              onClick={() => {
                                loadQuizQuestions(quiz.id);
                              }}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                              {quizQuestions.length > 0 && quizQuestions[0]?.quiz_id === quiz.id ? 'Hide' : 'Show'} Questions
                            </button>
                          </div>

                          {quizQuestions.length > 0 && quizQuestions[0]?.quiz_id === quiz.id && (
                            <div className="divide-y divide-gray-200">
                              {quizQuestions.map((question, idx) => (
                                <QuizQuestionEditor
                                  key={question.id}
                                  question={question}
                                  index={idx}
                                  onSave={saveQuizQuestion}
                                  onDelete={() => deleteQuizQuestion(question.id, quiz.id)}
                                />
                              ))}
                              <div className="px-6 py-4">
                                <button
                                  onClick={() => addQuizQuestion(quiz.id)}
                                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Add Question
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {editingLesson && selectedLesson && (
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900">Edit Lesson</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingLesson(false);
                              setSelectedLesson(null);
                            }}
                            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={saveLessonContent}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            Save Changes
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Title
                          </label>
                          <input
                            type="text"
                            value={selectedLesson.title}
                            onChange={(e) =>
                              setSelectedLesson({ ...selectedLesson, title: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Content
                          </label>
                          <textarea
                            value={selectedLesson.content}
                            onChange={(e) =>
                              setSelectedLesson({ ...selectedLesson, content: e.target.value })
                            }
                            rows={20}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'phase-unlock' && (
                <>
                  <div className="bg-white rounded-lg border border-gray-200 mb-6">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Admin Phase Control</h3>
                      <p className="text-sm text-gray-600 mt-1">Manage your own phase unlocks</p>
                    </div>
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Phase Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Current Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {adminPhases.map((phase) => (
                          <tr key={phase.phase_number}>
                            <td className="px-6 py-4 text-sm text-gray-900">{phase.phase_name}</td>
                            <td className="px-6 py-4">
                              {phase.is_unlocked ? (
                                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  Unlocked
                                </span>
                              ) : (
                                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                  Locked
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {phase.is_unlocked ? (
                                <button
                                  disabled
                                  className="px-4 py-2 text-sm text-gray-400 bg-gray-100 rounded cursor-not-allowed"
                                >
                                  Already Unlocked
                                </button>
                              ) : (
                                <button
                                  onClick={() => unlockPhaseForAdmin(phase.module_id)}
                                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Unlock Phase
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Student Phase Control</h3>
                      <p className="text-sm text-gray-600 mt-1">Select a student to manage their phase unlocks</p>
                    </div>

                    {!selectedStudentForPhaseUnlock ? (
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Student Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Email
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 text-sm text-gray-900">{student.full_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => selectStudentForPhaseUnlock(student)}
                                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Select
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div>
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {selectedStudentForPhaseUnlock.full_name}
                            </h4>
                            <p className="text-sm text-gray-600">{selectedStudentForPhaseUnlock.email}</p>
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={unlockAllPhasesForStudent}
                              className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Unlock All Phases
                            </button>
                            <button
                              onClick={() => setSelectedStudentForPhaseUnlock(null)}
                              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 rounded"
                            >
                              Back to Students
                            </button>
                          </div>
                        </div>
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Phase
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {studentPhases.map((phase) => (
                              <>
                                <tr key={phase.phase_number}>
                                  <td className="px-6 py-4">
                                    <button
                                      onClick={() => togglePhaseExpansion(phase.phase_number)}
                                      className="text-sm font-medium text-gray-900 hover:text-blue-600"
                                    >
                                      {expandedPhase === phase.phase_number ? '▼' : '▶'} {phase.phase_name}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4">
                                    {phase.is_unlocked ? (
                                      <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                        Unlocked
                                      </span>
                                    ) : (
                                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                        Locked
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                      {phase.is_unlocked ? (
                                        <button
                                          disabled
                                          className="px-4 py-2 text-sm text-gray-400 bg-gray-100 rounded cursor-not-allowed"
                                        >
                                          Phase Unlocked
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => unlockPhaseForStudent(phase.module_id)}
                                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                          Unlock Phase
                                        </button>
                                      )}
                                      {expandedPhase === phase.phase_number && (
                                        <button
                                          onClick={() => unlockAllLessonsInPhase(phase.phase_number)}
                                          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                          Unlock All Lessons
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                                {expandedPhase === phase.phase_number && phaseModules.length > 0 && (
                                  <tr>
                                    <td colSpan={3} className="px-6 py-4 bg-gray-50">
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium text-gray-700 mb-3">Lessons:</h5>
                                        {phaseModules[0]?.lessons?.map((lesson: any) => (
                                          <div
                                            key={lesson.id}
                                            className="flex items-center justify-between py-2 px-4 bg-white rounded border border-gray-200"
                                          >
                                            <span className="text-sm text-gray-900">{lesson.title}</span>
                                            <div className="flex items-center gap-3">
                                              {lesson.is_completed ? (
                                                <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                                  Completed
                                                </span>
                                              ) : (
                                                <>
                                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                                                    Not Completed
                                                  </span>
                                                  <button
                                                    onClick={() => unlockLessonForStudent(lesson.id)}
                                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                  >
                                                    Mark Complete
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedStudent.full_name}</h2>
                <p className="text-sm text-gray-600">{selectedStudent.email}</p>
              </div>
              <button
                onClick={closeStudentModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Enrollment Status</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedStudent.enrollment_status === 'paid' ? 'Paid' : 'Unpaid'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Phase</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedStudent.currentPhase ? `Phase ${selectedStudent.currentPhase}` : 'Not started'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Activity</p>
                  <p className="text-lg font-medium text-gray-900">
                    {selectedStudent.lastActivity
                      ? new Date(selectedStudent.lastActivity).toLocaleDateString()
                      : 'No activity'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Overall Completion</p>
                  <p className="text-lg font-medium text-gray-900">
                    {studentProgress.filter((item) => item.progress?.is_completed).length} of{' '}
                    {studentProgress.length} Phases
                  </p>
                </div>
              </div>

              {examAttempts.length > 0 && (
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Exam Simulation Attempts
                  </h3>
                  <div className="space-y-3">
                    {examAttempts.map((attempt, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-900">
                              Version {attempt.version_number}
                            </span>
                            <span className="text-sm text-gray-600">
                              {new Date(attempt.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm text-gray-600">Score:</span>
                                <span className="text-sm font-medium text-gray-900">
                                  {attempt.score}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    attempt.passed ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${attempt.score}%` }}
                                />
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 text-xs font-medium rounded ${
                                attempt.passed
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {attempt.passed ? 'Passed' : 'Failed'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Best Score:</span>
                      <span className="text-lg font-bold text-blue-900">
                        {Math.max(...examAttempts.map((a) => a.score))}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase Progress</h3>
              <div className="space-y-4">
                {studentProgress.map((item) => (
                  <div key={item.module.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          Phase {item.module.phase_number}: {item.module.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {!item.progress && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                              Not Started
                            </span>
                          )}
                          {item.progress?.is_unlocked && !item.progress?.is_completed && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              In Progress
                            </span>
                          )}
                          {item.progress?.is_completed && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                              Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {item.progress && (
                      <div className="space-y-3">
                        {item.quizAttempts.length > 0 && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-medium text-gray-700">Quiz Performance</p>
                              {item.bestScore !== null && (
                                <span className="text-sm font-medium text-gray-900">
                                  Best: {item.bestScore}%
                                </span>
                              )}
                            </div>
                            {item.bestScore !== null && (
                              <div className="mb-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      item.bestScore >= 80 ? 'bg-green-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${item.bestScore}%` }}
                                  />
                                </div>
                              </div>
                            )}
                            <div className="space-y-2">
                              {item.quizAttempts.map((attempt: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded"
                                >
                                  <span className="text-gray-600">
                                    {new Date(attempt.created_at).toLocaleDateString()}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-900 font-medium">
                                      {attempt.score}%
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 text-xs rounded ${
                                        attempt.passed
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {attempt.passed ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.quizAttempts.length === 0 && (
                          <p className="text-sm text-gray-500 pt-2 border-t border-gray-200">
                            No quiz attempts yet
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectingUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Exam Proof</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejection. This will be shown to the student.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setRejectingUpload(null);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
