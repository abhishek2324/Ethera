import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../services/api';
import { HiOutlineUserGroup, HiOutlineShieldCheck } from 'react-icons/hi';

export default function Team() {
  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const res = await authAPI.getUsers();
      return res.data.users;
    },
  });

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <p className="text-surface-400 text-sm">{users.length} team member{users.length !== 1 ? 's' : ''}</p>

      {users.length === 0 ? (
        <div className="text-center py-20 bg-surface-900/60 border border-surface-800/50 rounded-2xl">
          <HiOutlineUserGroup className="w-12 h-12 mx-auto text-surface-600 mb-3" />
          <p className="text-surface-400">No team members</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u._id} className="bg-surface-900/60 backdrop-blur-xl border border-surface-800/50 rounded-2xl p-5 hover:border-surface-700/50 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-lg">{u.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-surface-100 truncate">{u.name}</h3>
                  <p className="text-xs text-surface-400 truncate">{u.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${u.role === 'Admin' ? 'bg-primary-500/10 text-primary-300' : 'bg-surface-800 text-surface-400'}`}>
                    <HiOutlineShieldCheck className="w-3 h-3" /> {u.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
