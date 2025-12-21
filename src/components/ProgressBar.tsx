import { useProgress } from '../contexts/ProgressContext';

export function ProgressBar() {
  const { progress } = useProgress();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
        <span className="text-2xl font-bold text-blue-600">{progress.overallProgress}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress.overallProgress}%` }}
        ></div>
      </div>

      <p className="text-sm text-gray-600">
        {progress.completedLessons} of {progress.totalLessons} lessons completed
      </p>
    </div>
  );
}
