import { useAuth } from '../context/AuthContext';
import { HiOutlineMenuAlt2, HiOutlineBell } from 'react-icons/hi';

interface NavbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function Navbar({ onMenuToggle, title = 'Dashboard' }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface-900/60 backdrop-blur-xl border-b border-surface-800/50 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-surface-400 hover:text-white p-2 rounded-lg hover:bg-surface-800/50 transition-colors"
        >
          <HiOutlineMenuAlt2 className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-surface-100">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-surface-400 hover:text-white rounded-lg hover:bg-surface-800/50 transition-colors">
          <HiOutlineBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-surface-800/50">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-surface-200">{user?.name}</p>
            <p className="text-xs text-surface-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
