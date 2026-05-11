import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil, HiOutlineFolder, HiOutlineX } from 'react-icons/hi';

export default function Projects() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  const { data: projects = [], isLoading: loading, refetch: fetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await projectAPI.getAll();
      return res.data.projects;
    },
  });

  const openCreate = async () => {
    setEditId(null); setTitle(''); setDescription(''); setMembers([]);
    if (isAdmin) { try { const r = await authAPI.getUsers(); setUsers(r.data.users); } catch {} }
    setShowModal(true);
  };

  const openEdit = async (p: any) => {
    setEditId(p._id); setTitle(p.title); setDescription(p.description || '');
    setMembers(p.members?.map((m: any) => m._id) || []);
    if (isAdmin) { try { const r = await authAPI.getUsers(); setUsers(r.data.users); } catch {} }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) { await projectAPI.update(editId, { title, description, members }); }
      else { await projectAPI.create({ title, description, members }); }
      setShowModal(false); fetchProjects();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try { await projectAPI.delete(id); fetchProjects(); } catch (err) { console.error(err); }
  };

  const toggleMember = (id: string) => {
    setMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-surface-400 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-primary-500/20">
            <HiOutlinePlus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20 bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl">
          <HiOutlineFolder className="w-12 h-12 mx-auto text-surface-600 mb-3" />
          <p className="text-surface-400">No projects yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <Link to={`/projects/${p._id}`} key={p._id} className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-6 hover:border-primary-500/30 transition-all group block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HiOutlineFolder className="w-5 h-5 text-primary-400" />
                </div>
                {isAdmin && (
                  <div className="flex gap-1" onClick={(e) => e.preventDefault()}>
                    <button onClick={() => openEdit(p)} className="p-1.5 text-surface-500 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"><HiOutlinePencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-1.5 text-surface-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><HiOutlineTrash className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              <h3 className="text-base font-semibold text-surface-100 mb-1">{p.title}</h3>
              <p className="text-sm text-surface-400 line-clamp-2 mb-4">{p.description || 'No description'}</p>
              <div className="flex items-center justify-between text-xs text-surface-500">
                <span>{p.taskCount || 0} tasks · {p.completedCount || 0} done</span>
                <div className="flex -space-x-2">
                  {p.members?.slice(0, 3).map((m: any) => (
                    <div key={m._id} className="w-6 h-6 rounded-full bg-surface-700 border-2 border-surface-900 flex items-center justify-center text-[10px] text-surface-300 font-medium" title={m.name}>{m.name?.charAt(0)}</div>
                  ))}
                  {p.members?.length > 3 && <div className="w-6 h-6 rounded-full bg-surface-700 border-2 border-surface-900 flex items-center justify-center text-[10px] text-surface-400">+{p.members.length - 3}</div>}
                </div>
              </div>
              {p.taskCount > 0 && (
                <div className="mt-3 w-full bg-surface-800 rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-600 to-primary-400 rounded-full" style={{ width: `${Math.round((p.completedCount / p.taskCount) * 100)}%` }} />
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{editId ? 'Edit Project' : 'New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white"><HiOutlineX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50" placeholder="Project name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-surface-800/50 border border-surface-700/50 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none" placeholder="Describe the project" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-300 mb-1.5">Members</label>
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {users.map((u) => (
                    <label key={u._id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800/50 cursor-pointer">
                      <input type="checkbox" checked={members.includes(u._id)} onChange={() => toggleMember(u._id)} className="accent-primary-500" />
                      <span className="text-sm text-surface-200">{u.name}</span>
                      <span className="text-xs text-surface-500">{u.email}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={handleSave} disabled={saving || !title.trim()} className="w-full py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-medium rounded-xl transition-all disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
