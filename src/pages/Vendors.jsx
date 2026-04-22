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
  FileDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDFReport } from '../utils/pdfHelper';

const VendorModal = ({ isOpen, onClose, vendor, onSave, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    contactPerson: '',
    status: 'active'
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        vatNumber: vendor.vatNumber || '',
        contactPerson: vendor.contactPerson || '',
        status: vendor.status || 'active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        vatNumber: '',
        contactPerson: '',
        status: 'active'
      });
    }
  }, [vendor]);

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
              {vendor ? 'Edit Vendor' : 'Add New Vendor'}
            </h3>
            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Enterprise Partner Details</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Vendor Company Name</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" placeholder="e.g. Saudi Logistics Corp" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Contact Person</label>
            <input type="text" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">VAT Number</label>
            <input type="text" value={formData.vatNumber} onChange={(e) => setFormData({...formData, vatNumber: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Address</label>
            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Phone Number</label>
            <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all" />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Physical Address</label>
            <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows="2" className="w-full px-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all resize-none" />
          </div>
          <div className="md:col-span-2 pt-4">
            <button type="submit" disabled={loading} className="w-full btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {vendor ? 'Update Vendor' : 'Create Vendor'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// const VendorDetailsModal = ({ isOpen, onClose, vendorId }) => {
//   const [vendor, setVendor] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (isOpen && vendorId) fetchVendorDetails();
//   }, [isOpen, vendorId]);

//   const fetchVendorDetails = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/vendors/${vendorId}`);
//       setVendor(res.data.data);
//     } catch (error) {
//       console.error('Failed to fetch vendor details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
//       <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
//         <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
//           <div>
//             <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight flex items-center gap-3">
//               <Building2 className="text-accent" />
//               {vendor?.name}
//             </h3>
//             <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Vendor Activity & History</p>
//           </div>
//           <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl text-gray-400 transition-all shadow-sm">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="flex-1 overflow-y-auto p-8">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-20 gap-4">
//               <Loader2 className="animate-spin text-primary" size={40} />
//               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Records...</p>
//             </div>
//           ) : (
//             <div className="space-y-10">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
//                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Primary Contact</p>
//                   <p className="text-sm font-bold text-primary dark:text-white">{vendor?.contactPerson || 'Not Set'}</p>
//                 </div>
//                 <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
//                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">VAT Number</p>
//                   <p className="text-sm font-bold text-primary dark:text-white">{vendor?.vatNumber || 'N/A'}</p>
//                 </div>
//                 <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
//                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</p>
//                   <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-full">Active Partner</span>
//                 </div>
//               </div>

//               <section>
//                 <h4 className="text-xs font-black text-primary dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
//                   <History size={18} className="text-accent" />
//                   Dispatch History
//                 </h4>
//                 <div className="space-y-4">
//                   {!vendor?.records?.length ? (
//                     <div className="py-12 text-center bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800 text-gray-400 text-xs font-black uppercase tracking-widest">No history found</div>
//                   ) : (
//                     vendor.records.map((record) => (
//                       <div key={record._id} className="p-6 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-accent/30 transition-all group">
//                         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
//                           <div className="flex items-center gap-4">
//                             <div className="w-12 h-12 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
//                               <Box size={24} />
//                             </div>
//                             <div>
//                               <h5 className="text-sm font-black text-primary dark:text-white uppercase tracking-tight">{record.deliveryNoteNumber}</h5>
//                               <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
//                                 <Clock size={12} /> {new Date(record.createdAt).toLocaleDateString()}
//                                 <span className="mx-1">•</span>
//                                 <span className="text-accent">Driver: {record.assignedDriver?.name}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">{record.status}</span>
//                         </div>
//                       </div>
//                     ))
//                   )}
//                 </div>
//               </section>
//             </div>
//           )}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

const VendorDetailsModal = ({ isOpen, onClose, vendorId }) => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('drivers'); 

  useEffect(() => {
    if (isOpen && vendorId) fetchVendorDetails();
  }, [isOpen, vendorId]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/vendors/${vendorId}`);
      setVendor(res.data.data);
    } catch (error) {
      console.error('Failed to fetch details');
    } finally {
      setLoading(false);
    }
  };

  // Driver details logic - Showing current active load and destination
  const getDriverStats = () => {
    if (!vendor?.records) return [];
    const driverMap = new Map();
    
    // Records ko sort kar rahe hain taake latest update upar ho
    const sortedRecords = [...vendor.records].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    sortedRecords.forEach(record => {
      const driverId = record.assignedDriver?._id;
      if (driverId && !driverMap.has(driverId)) {
        driverMap.set(driverId, {
          name: record.assignedDriver.name,
          phone: record.assignedDriver.phone || 'N/A',
          iqama: record.assignedDriver.iqamaNumber || 'N/A',
          plate: record.vehiclePlateNumber,
          status: record.status,
          quantity: record.materialQuantity || 'Not Specified',
          from: record.loadingFrom,
          to: record.offloadingTo,
          dnNumber: record.deliveryNoteNumber,
          time: new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(record.createdAt).toLocaleDateString()
        });
      }
    });
    return Array.from(driverMap.values());
  };

  const drivers = getDriverStats();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Section */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20 transition-transform hover:rotate-3">
              <Building2 size={40} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">{vendor?.name}</h3>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                <MapPin size={14} className="text-accent" /> {vendor?.address || 'Operational Zone'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-red-50 hover:text-red-500 rounded-2xl text-gray-400 transition-all">
            <X size={28} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-8 px-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
          {['drivers', 'history'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 ${activeTab === tab ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-primary'}`}>
              {tab === 'drivers' ? 'Active Drivers & Cargo' : 'Past Dispatch Records'}
            </button>
          ))}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-10 bg-gray-50/30 dark:bg-gray-900/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-primary" size={48} />
              <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Syncing Logistics...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'drivers' ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {drivers.map((driver, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 p-6 shadow-sm hover:shadow-xl hover:border-accent/30 transition-all group overflow-hidden relative">
                      {/* Driver Info Header */}
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <User size={28} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-primary dark:text-white uppercase text-sm">{driver.name}</h4>
                          <div className="flex flex-col gap-0.5 mt-1">
                            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-tighter w-fit">
                               DN: {driver.dnNumber}
                            </span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                               Iqama: {driver.iqama}
                            </span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                          driver.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                          driver.status === 'Pending Approval' ? 'bg-amber-100 text-amber-600' : 
                          'bg-blue-100 text-blue-600 animate-pulse'
                        }`}>
                          {driver.status}
                        </div>
                      </div>

                      {/* Cargo Details Card */}
                      <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-[1.5rem] border border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Box size={16} className="text-accent" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">Quantity</span>
                          </div>
                          <span className="text-xs font-black text-primary dark:text-white">{driver.quantity}</span>
                        </div>

                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">Dropping At</span>
                          </div>
                          <span className="text-xs font-bold text-right text-primary dark:text-white max-w-[120px] leading-tight">{driver.to}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-blue-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase">Status Time</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-black text-primary dark:text-white block">{driver.time}</span>
                            <span className="text-[9px] font-bold text-gray-400">{driver.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 flex flex-col gap-2 px-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                            <Truck size={12} /> <span>{driver.plate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-accent">
                            <Phone size={12} /> <span>{driver.phone}</span>
                          </div>
                        </div>
                        <button className="text-[10px] font-black text-accent uppercase flex items-center gap-1 hover:underline self-end">
                          View Trip <ArrowRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : (
                /* History View (Simplified for contrast) */
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {vendor.records?.map((record, i) => (
                    <div key={i} className="p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center group hover:bg-primary/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-xs font-black text-gray-400 w-8">{i + 1}</div>
                        <div>
                          <p className="text-sm font-black text-primary dark:text-white uppercase">{record.deliveryNoteNumber}</p>
                          <p className="text-[10px] font-bold text-gray-400 italic">{record.loadingFrom} → {record.offloadingTo}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-primary dark:text-white uppercase">{record.assignedDriver?.name}</p>
                          <p className="text-[9px] font-bold text-gray-400">{record.materialQuantity}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${
                          record.status === 'Delivered' ? 'bg-green-100 text-green-600' : 
                          record.status === 'Pending Approval' ? 'bg-amber-100 text-amber-600' : 
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Vendors = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchVendors(); }, []);

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      setVendors(res.data.data);
    } catch (error) {
      console.error('Failed to fetch vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editingVendor) await api.put(`/vendors/${editingVendor._id}`, formData);
      else await api.post('/vendors', formData);
      fetchVendors();
      setModalOpen(false);
      setEditingVendor(null);
    } catch (error) {
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await api.delete(`/vendors/${id}`);
      fetchVendors();
    } catch (error) {
      alert('Delete failed');
    }
  };

  const exportPDF = async () => {
    try {
      const columns = ['Vendor Name', 'Contact Person', 'Email', 'Phone', 'VAT Number', 'Status'];
      const data = vendors.map(v => [
        v.name,
        v.contactPerson || 'N/A',
        v.email || 'N/A',
        v.phone || 'N/A',
        v.vatNumber || 'N/A',
        v.status || 'Active'
      ]);

      await generatePDFReport("All Vendors Report", columns, data, "Vendors_List_Report.pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to export PDF");
    }
  };

  const filteredVendors = vendors.filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">Logistics Partners</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Manage and monitor enterprise vendor relationships.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={exportPDF}
            className="px-6 py-4 bg-white dark:bg-gray-800 text-primary dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 hover:bg-gray-50 transition-all"
          >
            <FileDown size={18} /> Export PDF
          </button>
          {(user?.role === 'admin' || user?.role === 'super-admin') && (
            <button onClick={() => { setEditingVendor(null); setModalOpen(true); }} className="btn-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center gap-2 hover:scale-[1.02] transition-all">
              <Plus size={20} /> Add New Vendor
            </button>
          )}
        </div>
      </div>

      <div className="glass-card p-6 flex items-center border border-gray-100 dark:border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search vendors by name or contact..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-none rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVendors.map((vendor) => (
            <div key={vendor._id} onClick={() => { setSelectedVendorId(vendor._id); setDetailsModalOpen(true); }} className="glass-card p-8 border border-gray-100 dark:border-gray-800 hover:border-accent/20 transition-all group relative cursor-pointer flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl shadow-primary/20">
                  <Building2 size={28} />
                </div>
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => { setEditingVendor(vendor); setModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"><Edit2 size={18} /></button>
                  {(user?.role === 'admin' || user?.role === 'super-admin') && (
                    <button onClick={() => handleDelete(vendor._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                  )}
                </div>
              </div>
              <h3 className="text-xl font-black text-primary dark:text-white mb-1 tracking-tight uppercase">{vendor.name}</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
                <MapPin size={14} className="text-accent" /> {vendor.address || 'Global HQ'}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-auto">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Jobs</p>
                  <p className="text-sm font-black text-primary dark:text-white">{vendor.recordCount || 0}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Drivers</p>
                  <p className="text-sm font-black text-accent">Active</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && <VendorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} vendor={editingVendor} onSave={handleSave} loading={actionLoading} />}
        {detailsModalOpen && <VendorDetailsModal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} vendorId={selectedVendorId} />}
      </AnimatePresence>
    </div>
  );
};

export default Vendors;
