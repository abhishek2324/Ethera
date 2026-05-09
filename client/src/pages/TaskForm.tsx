import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { taskAPI, projectAPI, authAPI } from '../services/api';
import { HiOutlineArrowLeft } from 'react-icons/hi';

export default function TaskForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '');
  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [projRes, userRes] = await Promise.all([projectAPI.getAll(), authAPI.getUsers()]);
        setProjects(projRes.data.projects);
        setUsers(userRes.data.users);
        if (isEdit) {
          const taskRes = await taskAPI.getOne(id!);
          const t = taskRes.data.task;
          setTitle(t.title); setDescription(t.description || '');
          setPriority(t.priority); setStatus(t.status);
          setDueDate(t.dueDate ? t.dueDate.split('T')[0] : '');
          setAssignedTo(t.assignedTo?._id || '');
          setProjectId(t.projectId?._id || '');
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const data = { title, description, priority, status, dueDate: dueDate || undefined, assignedTo: assignedTo || undefined, projectId };
      if (isEdit) { await taskAPI.update(id!, data); }
      else { await taskAPI.create(data as any); }
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally { setSaving(false); }
  };

  const inputClass = "w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all";

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-surface-400 hover:text-primary-400 text-sm transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-6">{isEdit ? 'Edit Task' : 'Create New Task'}</h2>
        {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required className={inputClass} placeholder="Task title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputClass + " resize-none"} placeholder="Describe the task" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Project *</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className={inputClass + " appearance-none"}>
                <option value="">Select project</option>
                {projects.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Assign To</label>
              <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputClass + " appearance-none"}>
                <option value="">Unassigned</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass + " appearance-none"}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass + " appearance-none"}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={saving} className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}
