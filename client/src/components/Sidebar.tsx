import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineViewGrid,
  HiOutlineFolder,
  HiOutlineClipboardList,
  HiOutlineUserGroup,
  HiOutlineLogout,
  HiOutlineX,
} from 'react-icons/hi';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
  { to: '/projects', label: 'Projects', icon: HiOutlineFolder },
  { to: '/tasks', label: 'Tasks', icon: HiOutlineClipboardList },
  { to: '/team', label: 'Team', icon: HiOutlineUserGroup, adminOnly: true },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-surface-900/80 backdrop-blur-xl border-r border-surface-800/50 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-surface-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary-400 to-primary-200 bg-clip-text text-transparent">
              ETHERA
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-surface-400 hover:text-white transition-colors"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/5'
                      : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {item.label}
              </NavLink>
            ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-surface-800/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-surface-100 truncate">{user?.name}</p>
              <p className="text-xs text-surface-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <HiOutlineLogout className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
