import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, setUserSearchQuery } from '../../dashboard/dashboardSlice';

export default function UsersPage() {
  const dispatch = useDispatch();
  const { users, userSearchQuery, isLoading } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    dispatch(setUserSearchQuery(e.target.value));
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Quick stats for users */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2">Total Registrations</span>
          <h3 className="text-2xl font-black text-appTextLight">{users.length}</h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2">Administrators</span>
          <h3 className="text-2xl font-black text-appSecondary">
            {adminCount}
          </h3>
        </div>
        <div className="bg-appCard border border-white/5 rounded-2xl p-5 hover:border-appSecondary/35 transition-all shadow-lg">
          <span className="text-xs font-semibold text-appTextGray uppercase tracking-wider block mb-2">Active Sessions</span>
          <h3 className="text-2xl font-black text-emerald-400">
            {activeCount}
          </h3>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-appCard border border-white/5 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-md font-bold">Registered Users Accounts</h2>
            <p className="text-xs text-appTextGray">Manage user account permissions, security profiles, and connection status</p>
          </div>
          <div>
            <input
              type="text"
              placeholder="Filter users..."
              value={userSearchQuery}
              onChange={handleSearchChange}
              className="px-4 py-2 bg-black border border-white/10 rounded-xl text-xs text-appTextLight focus:outline-none focus:border-appSecondary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-appTextGray uppercase tracking-wider bg-black/20">
                <th className="p-4 pl-6">User details</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Role Permission</th>
                <th className="p-4">Status</th>
                <th className="p-4 pr-6">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-appTextGray">
                    Syncing user database registry...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-appTextGray">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 pl-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-appSecondary/10 border border-appSecondary/25 flex items-center justify-center font-bold text-appSecondary">
                        {u.name ? u.name[0].toUpperCase() : '?'}
                      </div>
                      <span className="font-bold text-appTextLight">{u.name}</span>
                    </td>
                    <td className="p-4 font-medium text-appTextGray">{u.email}</td>
                    <td className="p-4 font-medium text-appTextGray">{u.phoneNumber || '—'}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin' 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-appSecondary/10 text-appSecondary border border-appSecondary/20'
                      }`}>
                        {u.role ? u.role.toUpperCase() : 'USER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-appTextGray font-medium">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
