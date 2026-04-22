import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Building2, 
  Loader2, 
  X,
  Save,
  Trash2,
  Edit2,
  Truck,
  User,
  Calendar,
  FileDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDFReport } from '../utils/pdfHelper';

const VehicleModal = ({ isOpen, onClose, vehicle, onSave, vendors, drivers, loading }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    type: '',
    assignedDriver: '',
    vendor: '',
    insuranceExpiry: '',
    status: 'active'
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plateNumber: vehicle.plateNumber || '',
        type: vehicle.type || '',
        assignedDriver: vehicle.assignedDriver?._id || vehicle.assignedDriver || '',
        vendor: vehicle.vendor?._id || vehicle.vendor || '',
        insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : '',
        status: vehicle.status || 'active'
      });
    } else {
      setFormData({
        plateNumber: '',
        type: '',
        assignedDriver: '',
        vendor: vendors[0]?._id || '',
        insuranceExpiry: '',
        status: 'active'
      });
    }
  }, [vehicle, vendors]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">
              {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Fleet Asset Management</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Plate Number</label>
            <input type="text" required value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" placeholder="ABC-1234" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vehicle Type</label>
            <input type="text" required value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" placeholder="e.g. Heavy Truck" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Logistics Vendor</label>
            <select required value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none appearance-none">
              <option value="">Select Vendor</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Insurance Expiry</label>
            <input type="date" value={formData.insuranceExpiry} onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Assigned Driver</label>
            <select value={formData.assignedDriver} onChange={(e) => setFormData({...formData, assignedDriver: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none appearance-none">
              <option value="">Unassigned</option>
              {drivers.filter(d => d.vendor?._id === formData.vendor).map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Operational Status</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none appearance-none">
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="md:col-span-2 pt-4">
            <button type="submit" disabled={loading} className="w-full btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {vehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Vehicles = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchVehicles(); fetchVendors(); fetchDrivers(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/vehicles');
      setVehicles(res.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data.data);
    } catch (error) { console.error('Failed to fetch vendors'); }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data.data);
    } catch (error) { console.error('Failed to fetch drivers'); }
  };

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editingVehicle) await api.put(`/vehicles/${editingVehicle._id}`, formData);
      else await api.post('/vehicles', formData);
      fetchVehicles();
      setModalOpen(false);
      setEditingVehicle(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      await api.delete(`/vehicles/${id}`);
      fetchVehicles();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const exportPDF = async () => {
    try {
      const columns = ['Plate Number', 'Type', 'Vendor', 'Driver', 'Insurance Expiry', 'Status'];
      const data = vehicles.map(v => [
        v.plateNumber,
        v.type,
        v.vendor?.name || 'N/A',
        v.assignedDriver?.name || 'Unassigned',
        v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString() : 'N/A',
        v.status || 'Active'
      ]);

      await generatePDFReport("Fleet Vehicles Report", columns, data, "Vehicles_List_Report.pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to export PDF");
    }
  };

  const filteredVehicles = vehicles.filter(v => v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">Fleet Assets</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage logistics vehicles and maintenance schedules.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={exportPDF}
            className="px-6 py-4 bg-white dark:bg-gray-800 text-primary dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <FileDown size={18} /> Export PDF
          </button>
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <button onClick={() => { setEditingVehicle(null); setModalOpen(true); }} className="btn-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] transition-all">
              <Plus size={20} /> Register Vehicle
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-6 flex items-center border border-gray-100 dark:border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search by plate number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-none rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVehicles.map((v) => (
            <div key={v._id} className="glass-card p-8 border border-gray-100 dark:border-gray-800 hover:border-accent/20 transition-all group relative flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-accent/5 text-accent rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300 shadow-sm">
                  <Truck size={28} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingVehicle(v); setModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={18} /></button>
                  {user?.role === 'super-admin' && <button onClick={() => handleDelete(v._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>}
                </div>
              </div>
              <h3 className="text-xl font-black text-primary dark:text-white mb-1 tracking-tight uppercase">{v.plateNumber}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">{v.type}</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <Building2 size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate">{v.vendor?.name}</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <User size={16} className="text-gray-400" />
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{v.assignedDriver?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-gray-50 dark:border-gray-800 mt-auto">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Insurance Expiry</span>
                  <span className={`text-[10px] font-bold mt-1 ${new Date(v.insuranceExpiry) < new Date() ? 'text-red-500' : 'text-primary dark:text-white'}`}>
                    {v.insuranceExpiry ? new Date(v.insuranceExpiry).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${v.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && <VehicleModal isOpen={modalOpen} onClose={() => setModalOpen(false)} vehicle={editingVehicle} onSave={handleSave} vendors={vendors} drivers={drivers} loading={actionLoading} />}
      </AnimatePresence>
    </div>
  );
};

export default Vehicles;
