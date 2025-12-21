import { Home, BookOpen, User, LogOut, Shield, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useCurrentRoute } from '../hooks/useNavigate';

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const currentRoute = useCurrentRoute();

  const isActive = (route: string) => {
    if (typeof currentRoute === 'string') {
      return currentRoute === route;
    }
    return false;
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Medicare Mastery</h1>
        <p className="text-sm text-gray-600 mt-1">{profile?.full_name}</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <button
          onClick={() => navigate('/dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/dashboard')
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Home size={20} />
          Dashboard
        </button>

        <button
          onClick={() => navigate('/modules')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            isActive('/modules')
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BookOpen size={20} />
          Modules
        </button>

        {profile?.role === 'student' && (
          <button
            onClick={() => navigate('/exam-proof-upload')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/exam-proof-upload')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Upload size={20} />
            Exam Proof
          </button>
        )}

        {profile?.role === 'admin' && (
          <button
            onClick={() => navigate('/admin')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/admin')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Shield size={20} />
            Admin
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <User size={20} />
          Profile
        </button>

        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}
