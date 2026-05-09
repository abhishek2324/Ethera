import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HiOutlineArrowLeft, HiOutlineUserGroup, HiOutlineCalendar } from 'react-icons/hi';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await projectAPI.getOne(id!);
        setProject(res.data.project);
        setTasks(res.data.tasks);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const statusColors: Record<string, string> = { Pending: 'text-amber-400 bg-amber-500/10', 'In Progress': 'text-blue-400 bg-blue-500/10', Completed: 'text-emerald-400 bg-emerald-500/10' };
  const priorityColors: Record<string, string> = { High: 'bg-red-500', Medium: 'bg-amber-500', Low: 'bg-emerald-500' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!project) return <p className="text-surface-400">Project not found.</p>;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 text-sm transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">{project.title}</h2>
        <p className="text-surface-400 text-sm mb-4">{project.description || 'No description'}</p>
        <div className="flex flex-wrap gap-4 text-sm text-surface-400">
          <span className="flex items-center gap-1.5"><HiOutlineUserGroup className="w-4 h-4" /> {project.members?.length || 0} members</span>
          <span className="flex items-center gap-1.5"><HiOutlineCalendar className="w-4 h-4" /> Created {new Date(project.createdAt).toLocaleDateString()}</span>
          <span>By {project.createdBy?.name}</span>
        </div>
        {project.members?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.members.map((m: any) => (
              <span key={m._id} className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface-800/50 rounded-lg text-xs text-surface-300">
                <span className="w-5 h-5 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-300 text-[10px] font-semibold">{m.name?.charAt(0)}</span>
                {m.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-surface-100">Tasks ({tasks.length})</h3>
        {isAdmin && (
          <Link to={`/tasks/new?projectId=${project._id}`} className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-primary-500/20">
            Add Task
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-surface-900/60 border border-surface-800/50 rounded-2xl"><p className="text-surface-500">No tasks in this project</p></div>
      ) : (
        <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-surface-400 border-b border-surface-800/50">
                <th className="text-left py-3 px-4 font-medium">Task</th>
                <th className="text-left py-3 px-4 font-medium">Assigned</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Priority</th>
                <th className="text-left py-3 px-4 font-medium">Due</th>
              </tr></thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t._id} className="border-b border-surface-800/30 hover:bg-surface-800/30 transition-colors">
                    <td className="py-3 px-4"><Link to={`/tasks/edit/${t._id}`} className="text-surface-200 hover:text-primary-400 transition-colors">{t.title}</Link></td>
                    <td className="py-3 px-4 text-surface-400">{t.assignedTo?.name || 'Unassigned'}</td>
                    <td className="py-3 px-4"><span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[t.status]}`}>{t.status}</span></td>
                    <td className="py-3 px-4"><span className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${priorityColors[t.priority]}`} />{t.priority}</span></td>
                    <td className="py-3 px-4 text-surface-400">{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</td>
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
