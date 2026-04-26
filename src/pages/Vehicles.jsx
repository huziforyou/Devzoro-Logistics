import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Box, 
  Plus, 
  Search, 
  MapPin, 
  Building2, 
  ShieldCheck, 
  Users,
  Loader2,
  X,
  Phone,
  Mail,
  Save,
  Trash2,
  Edit2,
  ExternalLink,
  History,
  Clock,
  ArrowRight,
  User,
  Truck,
  FileDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Layers
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDFReport } from '../utils/pdfHelper';

const VehicleModal = ({ isOpen, onClose, vehicle, onSave, loading }) => {
  const [formData, setFormData] = useState({
    plateNumber: '',
    vehicleType: 'FlatBack',
    status: 'active'
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plateNumber: vehicle.plateNumber || vehicle.name || '',
        vehicleType: vehicle.vehicleType || 'FlatBack',
        status: vehicle.status || 'active'
      });
    } else {
      setFormData({
        plateNumber: '',
        vehicleType: 'FlatBack',
        status: 'active'
      });
    }
  }, [vehicle]);

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
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Vehicle Asset Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Plate Number</label>
            <div className="relative">
              <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" required value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" placeholder="e.g. ABC-1234" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vehicle Type</label>
            <select 
              required 
              value={formData.vehicleType} 
              onChange={(e) => setFormData({...formData, vehicleType: e.target.value})} 
              className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none appearance-none"
            >
              <option value="FlatBack">FlatBack</option>
              <option value="Tanker">Tanker</option>
              <option value="Trailer">Trailer</option>
              <option value="Dyna">Dyna</option>
            </select>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="w-full btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {vehicle ? 'Update Vehicle' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const AssignDriverModal = ({ isOpen, onClose, vehicleId, drivers, onAssign, loading }) => {
  const [selectedDriver, setSelectedDriver] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Assign Driver</h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Select Driver for Vehicle</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Select Driver</label>
            <select 
              value={selectedDriver} 
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none appearance-none"
            >
              <option value="">Select a Driver</option>
              {drivers.map(d => <option key={d._id} value={d._id}>{d.fullName} ({d.iqamaNumber})</option>)}
            </select>
          </div>
          <button 
            onClick={() => onAssign(selectedDriver)} 
            disabled={!selectedDriver || loading}
            className="w-full btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <User size={18} />}
            Request Assignment
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const VehicleDetailsModal = ({ isOpen, onClose, vehicleId, onApprove, onReject }) => {
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState({ lat: '', lng: '' });
  const [locSaving, setLocSaving] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    if (isOpen && vehicleId) fetchVehicleDetails();
  }, [isOpen, vehicleId]);

  const fetchVehicleDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vehicles/${vehicleId}`);
      setVehicle(res.data.data);
      setLoc({
        lat: res.data.data?.lastLocation?.lat ?? '',
        lng: res.data.data?.lastLocation?.lng ?? '',
      });
    } catch (error) {
      console.error('Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = async () => {
    if (!vehicle?._id) return;
    const latNum = Number(loc.lat);
    const lngNum = Number(loc.lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      alert('Please enter valid latitude/longitude numbers');
      return;
    }
    try {
      setLocSaving(true);
      await api.put(`/vehicles/${vehicle._id}/location`, { lat: latNum, lng: lngNum });
      await fetchVehicleDetails();
    } catch (e) {
      alert('Failed to update live location');
    } finally {
      setLocSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 transition-transform hover:rotate-3">
              <Truck size={40} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">{vehicle?.plateNumber}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                <Layers size={14} className="text-accent" /> {vehicle?.vehicleType}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30 dark:bg-gray-900/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Syncing Records...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Assignment Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Driver Assignment Status</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Driver</p>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-primary dark:text-white uppercase">{vehicle?.assignedDriver?.fullName || 'No Driver Assigned'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Active Status</p>
                      </div>
                    </div>
                  </div>

                  {vehicle?.assignmentStatus === 'pending' && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pending Approval</p>
                      <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-amber-500">
                          <Clock size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-primary dark:text-white uppercase">{vehicle?.pendingDriver?.fullName}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Awaiting Admin Approval</p>
                        </div>
                      </div>
                      
                      {isAdmin && (
                        <div className="flex gap-3 pt-2">
                          <button 
                            onClick={() => onApprove(vehicle._id)}
                            className="flex-1 py-3 bg-green-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Approve
                          </button>
                          <button 
                            onClick={() => onReject(vehicle._id)}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle History Section */}
              <section>
                <h4 className="text-xs font-black text-primary dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                  <History size={18} className="text-accent" />
                  Dispatch History
                </h4>
                <div className="space-y-4">
                  {!vehicle?.records?.length ? (
                    <div className="py-12 text-center bg-white dark:bg-gray-800 rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-black uppercase tracking-widest">No history found</div>
                  ) : (
                    vehicle.records.map((record) => (
                      <div key={record._id} className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-accent/30 transition-all group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                              <Box size={24} />
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-primary dark:text-white uppercase tracking-tight">{record.deliveryNoteNumber}</h5>
                              <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                <Clock size={12} /> {new Date(record.createdAt).toLocaleDateString()}
                                <span className="mx-1">•</span>
                                <span className="text-accent">Driver: {record.assignedDriver?.fullName}</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">{record.status}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Live Tracking */}
              <section className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Live Tracking</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Latitude</label>
                    <input
                      value={loc.lat}
                      onChange={(e) => setLoc({ ...loc, lat: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white outline-none"
                      placeholder="e.g. 24.7136"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Longitude</label>
                    <input
                      value={loc.lng}
                      onChange={(e) => setLoc({ ...loc, lng: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white outline-none"
                      placeholder="e.g. 46.6753"
                    />
                  </div>
                  <button
                    disabled={!isAdmin || locSaving}
                    onClick={saveLocation}
                    className="py-3 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-accent/90 transition-all disabled:opacity-50"
                  >
                    {locSaving ? 'Saving...' : 'Update Location'}
                  </button>
                </div>
                <p className="mt-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                  Updates broadcast in real-time via Socket.io (`vehicleLocationUpdate`)
                </p>
              </section>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  useEffect(() => {
    fetchVehicles();
    fetchDrivers();
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vehicles');
      setVehicles(res.data.data);
    } catch (error) {
      console.error('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const res = await api.get('/drivers');
      setDrivers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch drivers');
    }
  };

  const handleSave = async (formData) => {
    try {
      setModalLoading(true);
      if (selectedVehicle) {
        await api.put(`/vehicles/${selectedVehicle._id}`, formData);
      } else {
        await api.post('/vehicles', formData);
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to save vehicle:', error);
      alert(error.response?.data?.error || 'Failed to save vehicle');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await api.delete(`/vehicles/${id}`);
        fetchVehicles();
      } catch (error) {
        console.error('Failed to delete vehicle');
      }
    }
  };

  const handleAssignDriver = async (driverId) => {
    try {
      setModalLoading(true);
      await api.put(`/vehicles/${selectedVehicle._id}/assign`, { driverId });
      setIsAssignModalOpen(false);
      fetchVehicles();
    } catch (error) {
      console.error('Failed to assign driver');
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/vehicles/${id}/approve`);
      fetchVehicles();
      if (selectedVehicle?._id === id) {
        // Refresh details modal if it's open for this vehicle
        const res = await api.get(`/vehicles/${id}`);
        setSelectedVehicle(res.data.data);
      }
    } catch (error) {
      console.error('Failed to approve assignment');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/vehicles/${id}/reject`);
      fetchVehicles();
      if (selectedVehicle?._id === id) {
        const res = await api.get(`/vehicles/${id}`);
        setSelectedVehicle(res.data.data);
      }
    } catch (error) {
      console.error('Failed to reject assignment');
    }
  };

  const filteredVehicles = vehicles.filter(v => 
    (v.plateNumber || v.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vehicleType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-4xl font-black text-primary dark:text-white uppercase tracking-tight flex items-center gap-4">
            <Truck className="text-accent" size={40} />
            Vehicle Fleet
          </h2>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">Manage Assets & Driver Assignments</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-accent transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search plate or type..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-4 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-sm font-bold shadow-sm focus:ring-4 focus:ring-accent/10 outline-none w-full md:w-80 transition-all"
            />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => { setSelectedVehicle(null); setIsModalOpen(true); }}
              className="btn-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} /> Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Fleet', value: vehicles.length, icon: Truck, color: 'bg-blue-500' },
          { label: 'Active', value: vehicles.filter(v => v.status === 'active').length, icon: CheckCircle2, color: 'bg-green-500' },
          { label: 'Pending Approval', value: vehicles.filter(v => v.assignmentStatus === 'pending').length, icon: Clock, color: 'bg-amber-500' },
          { label: 'Unassigned', value: vehicles.filter(v => !v.assignedDriver).length, icon: AlertCircle, color: 'bg-gray-500' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-primary dark:text-white mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Synchronizing Fleet...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVehicles.map((v) => (
              <motion.div
                key={v._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 shadow-sm hover:shadow-2xl hover:border-accent/30 transition-all group relative"
              >
                {/* Status Badge */}
                <div className="absolute top-8 right-8 flex flex-col items-end gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    v.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {v.status}
                  </span>
                  {v.assignmentStatus === 'pending' && (
                    <span className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                      Pending Approval
                    </span>
                  )}
                </div>

                {/* Card Header */}
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                    <Truck size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight leading-tight">{v.plateNumber || v.name}</h3>
                    <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mt-1">{v.vehicleType}</p>
                  </div>
                </div>

                {/* Info List */}
                <div className="space-y-6 mb-10">
                  <div className="flex items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary shadow-sm">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Assigned Driver</p>
                      <p className="text-xs font-bold text-primary dark:text-white uppercase mt-0.5">
                        {v.assignedDriver?.fullName || 'Unassigned'}
                      </p>
                    </div>
                    {!v.assignedDriver && v.assignmentStatus !== 'pending' && (
                      <button 
                        onClick={() => { setSelectedVehicle(v); setIsAssignModalOpen(true); }}
                        className="p-2 hover:bg-accent hover:text-white rounded-lg text-accent transition-all"
                        title="Assign Driver"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total Trips</p>
                      <p className="text-xs font-bold text-primary dark:text-white uppercase mt-1">{v.recordCount || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button 
                    onClick={() => { setSelectedVehicle(v); setIsDetailsModalOpen(true); }}
                    className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    View Details <ArrowRight size={14} />
                  </button>
                  {isAdmin && (
                    <>
                      <button onClick={() => { setSelectedVehicle(v); setIsModalOpen(true); }} className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(v._id)} className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <VehicleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        vehicle={selectedVehicle} 
        onSave={handleSave} 
        loading={modalLoading} 
      />
      
      <AssignDriverModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        vehicleId={selectedVehicle?._id}
        drivers={drivers}
        onAssign={handleAssignDriver}
        loading={modalLoading}
      />

      <VehicleDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        vehicleId={selectedVehicle?._id}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default Vehicles;