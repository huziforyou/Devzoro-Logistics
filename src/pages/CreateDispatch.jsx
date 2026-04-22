import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  FileText, 
  Loader2, 
  Clock,
  Layout,
  Plus,
  Save,
  Truck,
  MapPin,
  User,
  AlertCircle,
  Tag,
  ClipboardList,
  ArrowLeft
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

const CreateDispatch = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [vendors, setVendors] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    defaultValues: {
      loadingDateTime: new Date().toISOString().slice(0, 16),
      loadingFrom: '',
      offloadingTo: '',
      materialDescription: '',
      deliveryNoteNumber: '',
      customerName: '',
      customerVAT: '',
      materialQuantity: '',
      assignedVendor: '',
      assignedDriver: '',
      vehiclePlateNumber: '',
      priority: 'medium',
      notes: ''
    }
  });

  const selectedVendor = watch('assignedVendor');
  const selectedDriver = watch('assignedDriver');

  useEffect(() => {
    const initData = async () => {
      setFetching(true);
      try {
        // 1. Fetch Vendors first
        const vRes = await api.get('/vendors');
        setVendors(vRes.data.data);

        if (isEditMode) {
          // 2. Fetch Dispatch details
          const dRes = await api.get(`/dispatch/${id}`);
          const data = dRes.data.data;

          // 3. Fetch Drivers and Vehicles for the assigned vendor immediately
          if (data.assignedVendor?._id || data.assignedVendor) {
            const vendorId = data.assignedVendor?._id || data.assignedVendor;
            
            const [drRes, vehRes] = await Promise.all([
              api.get('/drivers'),
              api.get('/vehicles')
            ]);
            
            setDrivers(drRes.data.data.filter(d => (d.vendor?._id || d.vendor) === vendorId));
            setVehicles(vehRes.data.data.filter(v => (v.vendor?._id || v.vendor) === vendorId));
          }

          // 4. Reset form with all data populated
          reset({
            loadingDateTime: new Date(data.loadingDateTime).toISOString().slice(0, 16),
            loadingFrom: data.loadingFrom,
            offloadingTo: data.offloadingTo,
            materialDescription: data.materialDescription,
            deliveryNoteNumber: data.deliveryNoteNumber,
            customerName: data.customerName,
            customerVAT: data.customerVAT,
            materialQuantity: data.materialQuantity,
            assignedVendor: data.assignedVendor?._id || data.assignedVendor,
            assignedDriver: data.assignedDriver?._id || data.assignedDriver,
            vehiclePlateNumber: data.vehiclePlateNumber,
            priority: data.priority,
            notes: data.notes
          });
        }
      } catch (err) {
        console.error('Initialization failed:', err);
      } finally {
        setFetching(false);
      }
    };

    initData();
  }, [id, isEditMode]);

  useEffect(() => {
    if (selectedVendor) {
      fetchDrivers(selectedVendor);
      fetchVehicles(selectedVendor);
    } else {
      setDrivers([]);
      setVehicles([]);
    }
  }, [selectedVendor]);

  useEffect(() => {
    if (selectedDriver) {
      const driver = drivers.find(d => d._id === selectedDriver);
      if (driver && driver.vehiclePlateNumber) {
        setValue('vehiclePlateNumber', driver.vehiclePlateNumber);
      }
    }
  }, [selectedDriver, drivers, setValue]);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data.data);
    } catch (err) {
      console.error('Failed to fetch vendors');
    }
  };

  const fetchDrivers = async (vendorId) => {
    try {
      const res = await api.get('/drivers');
      const filtered = res.data.data.filter(d => (d.vendor?._id || d.vendor) === vendorId);
      setDrivers(filtered);
    } catch (err) {
      console.error('Failed to fetch drivers');
    }
  };

  const fetchVehicles = async (vendorId) => {
    try {
      const res = await api.get('/vehicles');
      const filtered = res.data.data.filter(v => (v.vendor?._id || v.vendor) === vendorId);
      setVehicles(filtered);
    } catch (err) {
      console.error('Failed to fetch vehicles');
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEditMode) {
        await api.put(`/dispatch/${id}`, data);
        alert('Dispatch updated successfully!');
      } else {
        await api.post('/dispatch', data);
        alert('Dispatch created successfully!');
      }
      navigate('/dispatch');
    } catch (err) {
      console.error('Failed to save dispatch:', err);
      alert(err.response?.data?.error || 'Failed to save dispatch');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Dispatch Data...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/dispatch')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors"
          >
            <ArrowLeft size={14} /> Back to List
          </button>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shadow-inner">
              <Plus size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-primary dark:text-white uppercase tracking-tight">
                {isEditMode ? 'Update Dispatch' : 'New Dispatch'}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {isEditMode ? 'Modify existing logistics order' : 'Initiate a new logistics movement'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="px-4 py-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
            <p className="text-xs font-black text-accent uppercase tracking-tight">DRAFT MODE</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Form Area */}
          <div className="lg:col-span-8 space-y-10">
            {/* Route Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl"><MapPin size={24} /></div>
                <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Route Intelligence</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loading From (Origin)</label>
                  <input {...register('loadingFrom', { required: true })} className="input-field" placeholder="City / Warehouse" />
                  {errors.loadingFrom && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">Required field</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Offloading To (Destination)</label>
                  <input {...register('offloadingTo', { required: true })} className="input-field" placeholder="Client / Site" />
                  {errors.offloadingTo && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">Required field</span>}
                </div>
              </div>
            </motion.div>

            {/* Material Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-2xl"><ClipboardList size={24} /></div>
                <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Cargo Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Material Description</label>
                  <input {...register('materialDescription')} className="input-field" placeholder="What is being transported?" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Delivery Note # (Unique)</label>
                  <input 
                    {...register('deliveryNoteNumber', { required: true })} 
                    className={`input-field ${isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70' : ''}`} 
                    placeholder="DN-XXXXX" 
                    readOnly={isEditMode} 
                  />
                  {errors.deliveryNoteNumber && <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest ml-1">Required field</span>}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Quantity / Volume</label>
                  <input {...register('materialQuantity')} className="input-field" placeholder="e.g. 30 Tons" />
                </div>
              </div>
            </motion.div>

            {/* Customer Details */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl"><User size={24} /></div>
                <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Client Intelligence</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Customer Name</label>
                  <input {...register('customerName')} className="input-field" placeholder="End Client Name" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Customer VAT (Optional)</label>
                  <input {...register('customerVAT')} className="input-field" placeholder="VAT Registration #" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-10">
            {/* Logistics Partner */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 bg-primary text-white border-none shadow-2xl shadow-primary/30"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/10 rounded-2xl text-white"><Truck size={24} /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Logistics Partner</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Assigned Vendor</label>
                  <select {...register('assignedVendor', { required: true })} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-white/50 outline-none appearance-none transition-all">
                    <option value="" className="text-gray-900">Select Vendor</option>
                    {vendors.map(v => <option key={v._id} value={v._id} className="text-gray-900">{v.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Assigned Driver</label>
                  <select {...register('assignedDriver', { required: true })} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-white/50 outline-none appearance-none transition-all disabled:opacity-50">
                    <option value="" className="text-gray-900">Select Driver</option>
                    {drivers.map(d => <option key={d._id} value={d._id} className="text-gray-900">{d.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Vehicle Plate #</label>
                  <input {...register('vehiclePlateNumber')} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold text-white placeholder:text-white/30 outline-none" placeholder="Automatic Link" readOnly />
                </div>
              </div>
            </motion.div>

            {/* Schedule & Priority */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 border border-gray-100 dark:border-gray-800"
            >
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loading Date & Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="datetime-local" {...register('loadingDateTime', { required: true })} className="input-field pl-12" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Priority Level</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high', 'urgent'].map(p => (
                      <button 
                        key={p}
                        type="button"
                        onClick={() => setValue('priority', p)}
                        className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${watch('priority') === p ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 bg-accent text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-accent/40 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                {isEditMode ? 'Update Logistics Order' : 'Execute Dispatch'}
              </button>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  ); };

export default CreateDispatch;
