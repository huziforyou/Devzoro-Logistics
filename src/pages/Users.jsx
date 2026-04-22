import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Search, 
  Shield, 
  Trash2, 
  Edit2, 
  X,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
  Check,
  Eye,
  PlusCircle,
  FileText,
  Settings,
  Building2,
  Truck,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const PermissionItem = ({ icon: Icon, label, description, checked, onChange, disabled }) => (
  <div className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${checked ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-gray-50/50 dark:bg-gray-800/30 border-transparent'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${checked ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-widest ${checked ? 'text-primary dark:text-white' : 'text-gray-400'}`}>{label}</p>
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{description}</p>
      </div>
    </div>
    <button 
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${checked ? 'bg-accent text-white' : 'bg-gray-200 dark:bg-gray-700 text-transparent hover:bg-gray-300'}`}
    >
      <Check size={14} strokeWidth={4} />
    </button>
  </div>
);

const UserModal = ({ isOpen, onClose, user, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'vendor'
  });

  const [permissions, setPermissions] = useState({
    viewVendors: true,
    viewDrivers: true,
    createDispatch: false,
    editDispatch: false,
    viewReports: false,
    manageUsers: false
  });

  // useEffect(() => {
  //   if (user) {
  //     setFormData({
  //       name: user.name || '',
  //       email: user.email || '',
  //       password: '',
  //       role: user.role || 'vendor'
  //     });
  //     // Mock permissions based on role for UI demonstration
  //     updatePermissionsByRole(user.role);
  //   } else {
  //     setFormData({ name: '', email: '', password: '', role: 'vendor' });
  //     updatePermissionsByRole('vendor');
  //   }
  // }, [user]);


  useEffect(() => {
  if (user) {
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'vendor'
    });
    
    // Agar user ke pass database mein permissions hain toh wo use karein, 
    // warna role ke hisaab se default set karein
    if (user.permissions) {
      setPermissions(user.permissions);
    } else {
      updatePermissionsByRole(user.role);
    }
  } else {
    setFormData({ name: '', email: '', password: '', role: 'vendor' });
    updatePermissionsByRole('vendor');
  }
}, [user]);

  const updatePermissionsByRole = (role) => {
    switch (role) {
      case 'super-admin':
        setPermissions({ viewVendors: true, viewDrivers: true, createDispatch: true, editDispatch: true, viewReports: true, manageUsers: true });
        break;
      case 'admin':
        setPermissions({ viewVendors: true, viewDrivers: true, createDispatch: true, editDispatch: true, viewReports: true, manageUsers: false });
        break;
      case 'viewer':
        setPermissions({ viewVendors: true, viewDrivers: true, createDispatch: false, editDispatch: false, viewReports: true, manageUsers: false });
        break;
      default:
        setPermissions({ viewVendors: true, viewDrivers: true, createDispatch: false, editDispatch: false, viewReports: false, manageUsers: false });
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, permissions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">
              {user ? 'Configure User Account' : 'Onboard New User'}
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Profile identity and permission matrix</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-all shadow-sm"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
              <UserIcon size={16} className="text-accent" /> Identity Details
            </h4>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none" />
              </div>
              {!user && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Initial Password</label>
                  <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none" />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">System Role</label>
                <select 
                  value={formData.role} 
                  onChange={(e) => { setFormData({...formData, role: e.target.value}); updatePermissionsByRole(e.target.value); }} 
                  className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none appearance-none"
                >
                  <option value="super-admin">Super Admin (Root Access)</option>
                  <option value="admin">System Admin</option>
                  <option value="viewer">Data Viewer</option>
                  <option value="vendor">Vendor User</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-primary dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Shield size={16} className="text-accent" /> Permission Matrix
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <PermissionItem icon={Building2} label="View Vendors" description="Access to vendor list and profiles" checked={permissions.viewVendors} onChange={() => setPermissions({...permissions, viewVendors: !permissions.viewVendors})} />
              <PermissionItem icon={Truck} label="View Drivers" description="Access to fleet driver management" checked={permissions.viewDrivers} onChange={() => setPermissions({...permissions, viewDrivers: !permissions.viewDrivers})} />
              <PermissionItem icon={PlusCircle} label="Create Dispatch" description="Authority to issue new delivery notes" checked={permissions.createDispatch} onChange={() => setPermissions({...permissions, createDispatch: !permissions.createDispatch})} />
              <PermissionItem icon={ClipboardList} label="Edit Dispatch" description="Modify active or pending orders" checked={permissions.editDispatch} onChange={() => setPermissions({...permissions, editDispatch: !permissions.editDispatch})} />
              <PermissionItem icon={FileText} label="Reports" description="Generate and export performance data" checked={permissions.viewReports} onChange={() => setPermissions({...permissions, viewReports: !permissions.viewReports})} />
              <PermissionItem icon={Settings} label="Manage Users" description="System configuration and user onboarding" checked={permissions.manageUsers} onChange={() => setPermissions({...permissions, manageUsers: !permissions.manageUsers})} />
            </div>
          </div>
        </form>
        
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button type="submit" onClick={handleSubmit} disabled={loading} className="px-12 py-5 btn-primary font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : (user ? 'Save Changes' : 'Confirm Onboarding')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const Users = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (error) { console.error('Failed to fetch users'); }
    finally { setLoading(false); }
  };

  const handleSave = async (data) => {
    setActionLoading(true);
    try {
      if (editingUser) await api.put(`/users/${editingUser._id}`, data);
      else await api.post('/users', data);
      fetchUsers();
      setModalOpen(false);
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user account?')) return;
    try { await api.delete(`/users/${id}`); fetchUsers(); }
    catch (error) { alert('Delete failed'); }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">User Management</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Control system access and user permissions.</p>
        </div>
        {/* {(currentUser?.role === 'admin' || currentUser?.role === 'super-admin') && (
          <button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="btn-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] transition-all">
            <UserPlus size={20} /> New User
          </button>
        )} */}
       
{(currentUser?.role === 'admin' || currentUser?.role === 'super-admin') && (
  <button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="...">
    <UserPlus size={20} /> New User
  </button>
)}
      </div>

      <div className="glass-card p-6 flex items-center border border-gray-100 dark:border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-none rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none" />
        </div>
      </div>

      <div className="glass-card overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                <th className="p-8">Member Info</th>
                <th className="p-8">Role & Status</th>
                <th className="p-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="3" className="p-20 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={32} /></td></tr>
              ) : filteredUsers.map((u) => (
                <tr key={u._id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black">{u.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-black text-primary dark:text-white tracking-tight">{u.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-accent" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-white">{u.role}</span>
                      </div>
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                    </div>
                  </td>
                  <td className="p-8 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingUser(u); setModalOpen(true); }} className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={18} /></button>
                      {(currentUser?.role === 'admin' || currentUser?.role === 'super-admin') && (
                        <button onClick={() => handleDelete(u._id)} className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser} onSave={handleSave} loading={actionLoading} />}
      </AnimatePresence>
    </div>
  );
};

export default Users;
