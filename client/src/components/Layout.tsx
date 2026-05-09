import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/team': 'Team Members',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (pageTitles[path]) return pageTitles[path];
    if (path.startsWith('/projects/')) return 'Project Details';
    if (path.startsWith('/tasks/new')) return 'Create Task';
    if (path.startsWith('/tasks/edit')) return 'Edit Task';
    return 'ETHERA';
  };

  return (
    <div className="min-h-screen bg-surface-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-[260px] min-h-screen flex flex-col">
        <Navbar onMenuToggle={() => setSidebarOpen(true)} title={getTitle()} />

        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
