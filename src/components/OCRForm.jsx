import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Download, 
  Layers,
  User,
  Phone,
  Truck,
  CreditCard,
  Building,
  Calendar,
  MapPin,
  FileText,
  Package,
  Check,
  Plus,
  X,
  Info,
  ShieldCheck,
  Hash
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const FormField = ({ label, name, icon: Icon, register, error, isSelected, onToggle, i18n, type = "text" }) => (
  <div className={`space-y-1.5 p-4 rounded-2xl border transition-all ${isSelected ? 'border-accent bg-accent/5' : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 opacity-70'}`}>
    <div className="flex justify-between items-center px-1 mb-2">
      <div className="flex items-center gap-2">
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggle(name)}
          className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
        />
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-pointer" onClick={() => onToggle(name)}>{label}</label>
      </div>
      {isSelected && <Check size={12} className="text-accent" />}
    </div>
    <div className="relative">
      <div className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`}>
        <Icon size={16} />
      </div>
      <input 
        type={type}
        {...register(name)}
        disabled={!isSelected}
        className={`w-full ${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 bg-white dark:bg-gray-900 border ${
          error ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'
        } rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all shadow-sm disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed`}
      />
    </div>
  </div>
);

const OCRForm = ({ initialData, onSave, onReRun, onDownload }) => {
  const { t, i18n } = useTranslation();
  const [selectedFields, setSelectedFields] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      ...initialData,
      loadingDateTime: initialData?.loadingDateTime ? new Date(initialData.loadingDateTime).toISOString().split('T')[0] : '',
      endDateTime: '',
      notes: '',
      status: 'pending',
      approvedBy: '',
      pickupVehicle: '',
      deliveryVehicle: '',
      assignedDriver: ''
    }
  });

  const selectedPickupVehicle = watch('pickupVehicle');

  useEffect(() => {
    if (initialData) {
      // Select fields that have data by default
      const fieldsWithData = Object.keys(initialData).filter(key => 
        initialData[key] && 
        key !== 'documentId' && 
        key !== '_id' && 
        key !== 'fullText' &&
        key !== 'verified' &&
        key !== 'createdAt' &&
        key !== 'updatedAt'
      );
      setSelectedFields(fieldsWithData);
      
      // Update form values
      Object.keys(initialData).forEach(key => {
        if (key === 'loadingDateTime' && initialData[key]) {
          setValue('loadingDateTime', new Date(initialData[key]).toISOString().split('T')[0]);
        } else if (key === 'itemNames' && Array.isArray(initialData[key])) {
          setValue('itemNames', initialData[key].join(', '));
        } else {
          setValue(key, initialData[key]);
        }
      });
    }
    
    // Fetch vehicles
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles');
        setVehicles(res.data.data);
      } catch (err) {
        console.error('Failed to fetch vehicles');
      }
    };
    fetchVehicles();
  }, [initialData, setValue]);

  // Fetch drivers when pickup vehicle changes
  useEffect(() => {
    const fetchDrivers = async () => {
      if (!selectedPickupVehicle) {
        setDrivers([]);
        return;
      }
      try {
        const res = await api.get('/drivers');
        // Filter drivers by selected vehicle
        const filteredDrivers = res.data.data.filter(d => d.vehicle?._id === selectedPickupVehicle);
        setDrivers(filteredDrivers);
      } catch (err) {
        console.error('Failed to fetch drivers');
      }
    };
    fetchDrivers();
  }, [selectedPickupVehicle]);

  const toggleField = (fieldName) => {
    setSelectedFields(prev => 
      prev.includes(fieldName) ? prev.filter(f => f !== fieldName) : [...prev, fieldName]
    );
  };

  const handleCreateCollection = () => {
    setShowCollectionModal(true);
  };

  const submitToCollection = async () => {
    if (!collectionName) return toast.error('Please enter a collection name');
    
    const formData = watch();
    const finalData = {
      ...formData,
      selectedFields,
      collectionName,
      documentId: initialData.documentId
    };

    try {
      await onSave(finalData);
      setShowCollectionModal(false);
      setCollectionName('');
      toast.success('Collection saved successfully');
    } catch (err) {
      toast.error('Failed to save collection');
    }
  };

  const mainFields = [
    { id: 1, label: "Driver Name", name: "driverName", icon: User },
    { id: 2, label: "Driver Contact #", name: "driverContactNumber", icon: Phone },
    { id: 3, label: "Vehicle Plate #", name: "vehiclePlateNumber", icon: Truck },
    { id: 4, label: "Driver Iqama #", name: "driverIqamaNumber", icon: CreditCard },
    { id: 5, label: "Vehicle Name", name: "vehicleName", icon: Building },
    { id: 6, label: "Loading Date/Time", name: "loadingDateTime", icon: Calendar, type: "date" },
    { id: 7, label: "Loading Location (From)", name: "loadingFrom", icon: MapPin },
    { id: 8, label: "Off Loading Location (To)", name: "offloadingTo", icon: MapPin },
    { id: 9, label: "Material Description", name: "materialDescription", icon: FileText },
    { id: 10, label: "Delivery Note #", name: "deliveryNoteNumber", icon: Hash },
    { id: 11, label: "Customer Name", name: "customerName", icon: User },
    { id: 12, label: "Customer VAT", name: "customerVAT", icon: ShieldCheck },
    { id: 13, label: "Material Quantity", name: "materialQuantity", icon: Package },
    { id: 14, label: "Model Number", name: "modelNumber", icon: Layers },
    { id: 15, label: "Serial Number", name: "serialNumber", icon: Hash },
    { id: 16, label: "Price", name: "price", icon: CreditCard, type: "number" },
    { id: 17, label: "Item Names", name: "itemNames", icon: Package },
  ];

  return (
    <div className="glass-card overflow-hidden flex flex-col h-full border border-gray-100 dark:border-gray-800" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
            {i18n.language === 'ar' ? 'تحقق من البيانات' : 'AI Data Verification'}
          </h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">
            {i18n.language === 'ar' ? 'اختر الحقول المستخرجة وقم بتصحيحها' : 'Select extracted fields & verify details'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={onReRun} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-accent rounded-xl transition-all" title="Re-run OCR"><RefreshCw size={18} /></button>
          <button onClick={onDownload} className="p-3 bg-gray-50 dark:bg-gray-800 text-gray-500 hover:text-primary rounded-xl transition-all" title="Download Document"><Download size={18} /></button>
        </div>
      </div>

      <form className="flex-1 overflow-y-auto p-8 space-y-10">
        {/* Step 3: Smart Checkbox UI Section */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center"><CheckCircle2 size={18} /></div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Step 3: AI Extracted Data Selection</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainFields.map(field => (
              <FormField 
                key={field.id}
                label={field.label} 
                name={field.name} 
                icon={field.icon} 
                register={register} 
                isSelected={selectedFields.includes(field.name)} 
                onToggle={toggleField} 
                i18n={i18n} 
                type={field.type}
              />
            ))}
          </div>
        </section>

        {/* Step 5: Manual Edit Inputs Section */}
        <section className="pt-10 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><Plus size={18} /></div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Step 5: Manual Entry & Approval</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pickup Date</label>
              <input type="date" {...register('loadingDateTime')} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">End Date (Delivery)</label>
              <input type="date" {...register('endDateTime')} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Approved By</label>
              <input type="text" {...register('approvedBy')} className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent" placeholder="Admin Name" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Status</label>
              <select {...register('status')} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent">
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="dispatched">Dispatched</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Pickup Vehicle</label>
              <select {...register('pickupVehicle')} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent">
                <option value="">Select Pickup Vehicle</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.plateNumber} ({v.type})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Delivery Vehicle</label>
              <select {...register('deliveryVehicle')} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent">
                <option value="">Select Delivery Vehicle</option>
                {vehicles.map(v => <option key={v._id} value={v._id}>{v.plateNumber} ({v.type})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Assigned Driver</label>
              <select {...register('assignedDriver')} disabled={!selectedPickupVehicle} className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent disabled:opacity-50">
                <option value="">{selectedPickupVehicle ? 'Select Driver' : 'Select Vehicle First'}</option>
                {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.iqamaNumber})</option>)}
              </select>
            </div>
          </div>
          <div className="mt-6 space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Additional Notes</label>
            <textarea {...register('notes')} rows="3" className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent resize-none" placeholder="Any extra instructions or notes..." />
          </div>
        </section>

        {/* Raw Text Section */}
        {initialData?.fullText && (
          <section className="pt-10 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center"><FileText size={18} /></div>
              <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Full Extracted Text (Ref)</h4>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-800/30 rounded-2xl text-xs font-mono text-gray-500 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto border border-gray-100 dark:border-gray-800">
              {initialData.fullText}
            </div>
          </section>
        )}
      </form>

      {/* Footer Actions */}
      <div className="p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={handleCreateCollection}
          className="flex-1 btn-primary py-5 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Layers size={18} /> Step 4: Save to Collection
        </button>
        <button 
          type="submit"
          onClick={handleSubmit(onSave)}
          className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-5 font-black uppercase tracking-widest text-xs text-gray-700 dark:text-gray-200 flex items-center justify-center gap-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-lg"
        >
          <Save size={18} /> Just Save Record
        </button>
      </div>

      {/* Collection Modal */}
      <AnimatePresence>
        {showCollectionModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCollectionModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-8">
              <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Step 4: Collection Name</h3>
              <p className="text-xs text-gray-500 mb-6 font-bold uppercase tracking-widest">Selected records will be added to this group.</p>
              <div className="space-y-4">
                <input 
                  type="text" 
                  value={collectionName} 
                  onChange={(e) => setCollectionName(e.target.value)} 
                  placeholder="e.g. Saudi Deliveries April" 
                  className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={() => setShowCollectionModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest">Cancel</button>
                  <button onClick={submitToCollection} className="flex-1 btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest">Create & Save</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OCRForm;
