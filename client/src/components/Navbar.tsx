import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMenuAlt2, HiOutlineLogout } from 'react-icons/hi';

interface NavbarProps {
  onMenuToggle: () => void;
  title?: string;
}

export default function Navbar({ onMenuToggle, title = 'Dashboard' }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 p-1 rounded-full hover:bg-surface-800/50 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
            <span className="text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-surface-200">{user?.name}</p>
            <p className="text-xs text-surface-500">{user?.role}</p>
          </div>
        </button>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-surface-900 border border-surface-800 rounded-xl shadow-xl shadow-black/20 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 border-b border-surface-800/50">
              <p className="text-sm font-medium text-surface-100">{user?.name}</p>
              <p className="text-xs text-surface-400">{user?.email}</p>
              <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium bg-primary-500/10 text-primary-300">
                {user?.role}
              </span>
            </div>
            <div className="p-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
              >
                <HiOutlineLogout className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
