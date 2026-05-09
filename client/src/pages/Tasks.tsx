import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineClipboardList, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const { isAdmin } = useAuth();

  const fetchTasks = async () => {
    try {
      const params: Record<string, string> = {};
      if (statusFilter) params.status = statusFilter;
      const res = await taskAPI.getAll(params);
      setTasks(res.data.tasks);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { setLoading(true); fetchTasks(); }, [statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try { await taskAPI.delete(id); fetchTasks(); } catch (err) { console.error(err); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try { await taskAPI.update(id, { status }); fetchTasks(); } catch (err) { console.error(err); }
  };

  const statusColors: Record<string, string> = { Pending: 'text-amber-400 bg-amber-500/10', 'In Progress': 'text-blue-400 bg-blue-500/10', Completed: 'text-emerald-400 bg-emerald-500/10' };
  const priorityColors: Record<string, string> = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' };
  const statuses = ['Pending', 'In Progress', 'Completed'];
  const filterBtnClass = (s: string) => `px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? 'bg-primary-500/20 text-primary-300' : 'text-surface-400 hover:text-surface-200 hover:bg-surface-800/50'}`;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setStatusFilter('')} className={filterBtnClass('')}>All</button>
          {statuses.map((s) => <button key={s} onClick={() => setStatusFilter(s)} className={filterBtnClass(s)}>{s}</button>)}
        </div>
        {isAdmin && (
          <Link to="/tasks/new" className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-primary-500/20">
            <HiOutlinePlus className="w-4 h-4" /> New Task
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-surface-900/60 border border-surface-800/50 rounded-2xl">
          <HiOutlineClipboardList className="w-12 h-12 mx-auto text-surface-600 mb-3" />
          <p className="text-surface-400">No tasks found</p>
        </div>
      ) : (
        <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-surface-400 border-b border-surface-800/50">
                <th className="text-left py-3 px-4 font-medium">Task</th>
                <th className="text-left py-3 px-4 font-medium">Project</th>
                <th className="text-left py-3 px-4 font-medium">Assigned</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Priority</th>
                <th className="text-left py-3 px-4 font-medium">Due</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id} className="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4 text-surface-200 font-medium">{t.title}</td>
                    <td className="py-3 px-4 text-surface-400">{t.projectId?.title || '—'}</td>
                    <td className="py-3 px-4 text-surface-400">{t.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4">
                      <select value={t.status} onChange={(e) => handleStatusChange(t._id, e.target.value)} className={`px-2.5 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${statusColors[t.status]} focus:outline-none`}>
                        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4"><span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${priorityColors[t.priority]}`} />{t.priority}</span></td>
                    <td className="py-3 px-4 text-surface-400">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {isAdmin && <Link to={`/tasks/edit/${t._id}`} className="p-1.5 text-surface-500 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"><HiOutlinePencil className="w-4 h-4" /></Link>}
                        {isAdmin && <button onClick={() => handleDelete(t._id)} className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
