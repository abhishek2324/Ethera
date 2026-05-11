import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import { HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamation, HiOutlineFolder, HiOutlineUserGroup } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

interface DashboardData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalProjects: number;
  totalMembers: number;
  recentTasks: any[];
  myTasks: any[];
  priorityDistribution: { high: number; medium: number; low: number };
}

export default function Dashboard() {
  const { isAdmin } = useAuth();

  const { data, isLoading: loading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardAPI.get();
      return res.data.dashboard as DashboardData;
    },
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!data) return <p className="text-surface-400">Failed to load dashboard data.</p>;

  const completionRate = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  const stats = [
    { label: 'Total Tasks', value: data.totalTasks, icon: HiOutlineClipboardList, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: data.completedTasks, icon: HiOutlineCheckCircle, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: data.pendingTasks, icon: HiOutlineClock, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: data.overdueTasks, icon: HiOutlineExclamation, color: 'from-red-500 to-red-600', bg: 'bg-red-500/10' },
    { label: 'Projects', value: data.totalProjects, icon: HiOutlineFolder, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10' },
    ...(isAdmin ? [{ label: 'Members', value: data.totalMembers, icon: HiOutlineUserGroup, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-500/10' }] : []),
  ];

  const priorityColors: Record<string, string> = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' };
  const statusColors: Record<string, string> = { Pending: 'text-amber-400 bg-amber-500/10', 'In Progress': 'text-blue-400 bg-blue-500/10', Completed: 'text-emerald-400 bg-emerald-500/10' };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-5 hover:border-surface-700/50 transition-all group" style={{ animationDelay: `${i * 50}ms` }}>
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'inherit' }} />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-surface-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Progress + Priority Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Progress */}
        <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-surface-100 mb-4">Task Completion</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-surface-800" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${completionRate * 2.64} ${264 - completionRate * 2.64}`} />
                <defs><linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#818cf8" /></linearGradient></defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">{completionRate}%</span>
            </div>
            <div>
              <p className="text-sm text-surface-300">{data.completedTasks} of {data.totalTasks} tasks completed</p>
              <p className="text-xs text-surface-500 mt-1">{data.inProgressTasks} in progress</p>
            </div>
          </div>
          <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-surface-100 mb-4">Priority Distribution</h2>
          <div className="space-y-4">
            {['High', 'Medium', 'Low'].map((level) => {
              const count = data.priorityDistribution[level.toLowerCase() as 'high' | 'medium' | 'low'];
              const pct = data.totalTasks > 0 ? Math.round((count / data.totalTasks) * 100) : 0;
              return (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-surface-300">{level}</span>
                    <span className="text-surface-400">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-surface-800 rounded-full h-2 overflow-hidden">
                    <div className={`h-full ${priorityColors[level]} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-surface-100 mb-4">Recent Tasks</h2>
        {data.recentTasks.length === 0 ? (
          <p className="text-surface-500 text-sm py-4 text-center">No tasks yet. Create your first task!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-surface-400 border-b border-surface-800/50">
                <th className="text-left py-3 px-3 font-medium">Task</th>
                <th className="text-left py-3 px-3 font-medium">Project</th>
                <th className="text-left py-3 px-3 font-medium">Assigned</th>
                <th className="text-left py-3 px-3 font-medium">Status</th>
                <th className="text-left py-3 px-3 font-medium">Priority</th>
              </tr></thead>
              <tbody>
                {data.recentTasks.map((task: any) => (
                  <tr key={task._id} className="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-3 text-surface-200">{task.title}</td>
                    <td className="py-3 px-3 text-surface-400">{task.projectId?.title || '—'}</td>
                    <td className="py-3 px-3 text-surface-400">{task.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-3 px-3"><span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[task.status] || ''}`}>{task.status}</span></td>
                    <td className="py-3 px-3"><span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]}`} /><span className="text-surface-300">{task.priority}</span></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
