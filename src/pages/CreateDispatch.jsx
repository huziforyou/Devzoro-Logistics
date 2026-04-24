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
  ArrowLeft,
  Search
} from 'lucide-react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider, GeoSearchControl } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import L from 'leaflet';

import { QRCodeCanvas } from 'qrcode.react';

// CSS for Z-Index Fix and Search Results Visibility
const customMapStyles = `
  .custom-search-container {
    z-index: 1001 !important;
  }
  .leaflet-control-geosearch .results {
    z-index: 1002 !important;
    background: white;
    max-height: 250px;
    overflow-y: auto;
    border-radius: 12px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
    margin-top: 10px;
    width: 300px;
  }
  .leaflet-control-geosearch .results > * {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    color: #1f2937;
  }
  .leaflet-control-geosearch .results > *:hover {
    background: #f9fafb;
    color: #0066FF;
  }
  .glass-card {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 2.5rem;
  }
  .dark .glass-card {
    background: rgba(17, 24, 39, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

const ManualPinControl = ({ onPinDrop, activeField, manualPinActive, setManualPinActive }) => {
  useMapEvents({
    click(e) {
      if (manualPinActive) {
        const { lat, lng } = e.latlng;
        // Reverse geocode to get human readable address
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en,ar`)
          .then(res => res.json())
          .then(data => {
            onPinDrop({
              lat,
              lng,
              label: data.display_name || `Manual Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
            }, activeField);
            setManualPinActive(false); // Disable manual pin after selection
          });
      }
    },
  });
  return null;
};

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for Loading and Offloading
const loadingIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const offloadingIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const SearchControl = ({ placeholder, type, setActiveField }) => {
  const map = useMap();
  
  useEffect(() => {
    const provider = new OpenStreetMapProvider({
      params: { countrycodes: 'sa' } // Saudi Arabia Only
    });

    const searchControl = new GeoSearchControl({
      provider,
      style: 'bar',
      position: type === 'loading' ? 'topleft' : 'topright',
      showMarker: false,
      autoClose: true,
      retainZoomLevel: false,
      searchLabel: placeholder,
      updateMap: true
    });

    map.addControl(searchControl);

    const container = searchControl.getContainer();
    const input = container.querySelector('input');
    
    const handleInteraction = () => setActiveField(type);
    
    if (input) {
      input.addEventListener('focus', handleInteraction);
      input.addEventListener('click', handleInteraction);
    }

    return () => {
      if (input) {
        input.removeEventListener('focus', handleInteraction);
        input.removeEventListener('click', handleInteraction);
      }
      map.removeControl(searchControl);
    };
  }, [map, type, placeholder, setActiveField]);

  return null;
};

const MapSearchHandler = ({ activeField, onLoadingSelect, onOffloadingSelect }) => {
  const map = useMap();

  useEffect(() => {
    const handleLocationFound = (e) => {
      const loc = {
        lat: e.location.y,
        lng: e.location.x,
        label: e.location.label
      };

      if (activeField === 'loading') {
        onLoadingSelect(loc);
      } else {
        onOffloadingSelect(loc);
      }
    };

    map.on('geosearch/showlocation', handleLocationFound);
    return () => map.off('geosearch/showlocation', handleLocationFound);
  }, [map, activeField, onLoadingSelect, onOffloadingSelect]);

  return null;
};


const CreateDispatch = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [createdDispatch, setCreatedDispatch] = useState(null);
  
  const [loadingPoint, setLoadingPoint] = useState(null); 
  const [loadingAddr, setLoadingAddr] = useState("");
  const [offloadingPoint, setOffloadingPoint] = useState(null); 
  const [offloadingAddr, setOffloadingAddr] = useState("");
  
  const [activeField, setActiveField] = useState('loading'); 
  const [manualPinActive, setManualPinActive] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors, isValid } } = useForm({
    mode: 'onChange',
    defaultValues: {
      loadingDateTime: new Date().toISOString().slice(0, 16),
      loadingFrom: '',
      offloadingTo: '',
      loadingCoords: { lat: '', lng: '' },
      offloadingCoords: { lat: '', lng: '' },
      materialDescription: '',
      deliveryNoteNumber: '',
      customerName: '',
      customerVAT: '',
      materialQuantity: '',
      assignedVehicle: '', 
      assignedDriver: '',
      vehiclePlateNumber: '',
      distance: '',
      estimatedTime: '',
      priority: 'medium',
      notes: '',
      trackingId: `DISP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
  });

  const trackingId = watch('trackingId');

  // Calculate distance only when BOTH points are present
  useEffect(() => {
    if (loadingPoint && offloadingPoint) {
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; 
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
          Math.sin(dLon/2) * Math.sin(dLon/2)
          ; 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        return R * c; 
      };

      const dist = calculateDistance(loadingPoint.lat, loadingPoint.lng, offloadingPoint.lat, offloadingPoint.lng);
      setValue('distance', `${dist.toFixed(2)} km`);
      const timeInMinutes = (dist / 60) * 60;
      setValue('estimatedTime', `${Math.round(timeInMinutes)} mins`);
    } else {
      setValue('distance', '');
      setValue('estimatedTime', '');
    }
  }, [loadingPoint, offloadingPoint, setValue]);

  // 2. Separate Callback Handlers (Strictly Independent)
  const handleLoadingSelect = (loc) => {
    console.log("Loading Selected:", loc); // Debugging ke liye
    setLoadingPoint(loc);
    setLoadingAddr(loc.label);
    setValue('loadingFrom', loc.label);
    setValue('loadingCoords', { lat: loc.lat, lng: loc.lng });
  };

  const handleOffloadingSelect = (loc) => {
    console.log("Offloading Selected:", loc); // Debugging ke liye
    setOffloadingPoint(loc);
    setOffloadingAddr(loc.label);
    setValue('offloadingTo', loc.label);
    setValue('offloadingCoords', { lat: loc.lat, lng: loc.lng });
  };

  // Manual Pin Handler
  const handleManualPinFound = (loc) => {
    if (activeField === 'loading') {
      handleLoadingSelect(loc);
    } else {
      handleOffloadingSelect(loc);
    }
  };

  const selectedVehicleId = watch('assignedVehicle');
  const selectedDriverId = watch('assignedDriver');

  useEffect(() => {
    const initData = async () => {
      setFetching(true);
      try {
        const vRes = await api.get('/vehicles');
        setVehicles(vRes.data.data);
        const drRes = await api.get('/drivers');
        setDrivers(drRes.data.data);

        if (isEditMode) {
          const dRes = await api.get(`/dispatch/${id}`);
          const data = dRes.data.data;
          
          // Sync requested states
          if (data.loadingCoords?.lat) {
            setLoadingPoint({
              lat: data.loadingCoords.lat,
              lng: data.loadingCoords.lng,
              label: data.loadingFrom
            });
            setLoadingAddr(data.loadingFrom);
          }
          if (data.offloadingCoords?.lat) {
            setOffloadingPoint({
              lat: data.offloadingCoords.lat,
              lng: data.offloadingCoords.lng,
              label: data.offloadingTo
            });
            setOffloadingAddr(data.offloadingTo);
          }

          reset({
            ...data,
            loadingDateTime: new Date(data.loadingDateTime).toISOString().slice(0, 16),
            assignedVehicle: data.assignedVehicle?._id || data.assignedVehicle,
            assignedDriver: data.assignedDriver?._id || data.assignedDriver,
          });
        }
      } catch (err) {
        console.error('Initialization failed:', err);
      } finally {
        setFetching(false);
      }
    };
    initData();
  }, [id, isEditMode, reset]);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v._id === selectedVehicleId);
      if (vehicle) {
        const driver = drivers.find(d => (d.assignedVehicle?._id || d.assignedVehicle) === selectedVehicleId);
        if (driver) {
          setValue('assignedDriver', driver._id);
          setValue('vehiclePlateNumber', vehicle.plateNumber);
        } else {
          setValue('assignedDriver', '');
          setValue('vehiclePlateNumber', vehicle.plateNumber);
        }
      }
    }
  }, [selectedVehicleId, vehicles, drivers, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let res;
      if (isEditMode) {
        res = await api.put(`/dispatch/${id}`, data);
      } else {
        res = await api.post('/dispatch', data);
      }
      setCreatedDispatch(res.data.data || res.data);
      setShowQR(true);
    } catch (err) {
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

  const trackingUrl = `${window.location.origin}/track/${trackingId}`;

  if (showQR) {
    return (
      <div className="max-w-xl mx-auto py-20">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center space-y-8 shadow-2xl">
          <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
            <Save size={40} />
          </div>
          <h2 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">Dispatch Confirmed!</h2>
          <p className="text-gray-500 font-medium">Tracking ID: <span className="text-accent font-bold">{trackingId}</span></p>
          
          <div className="bg-white p-6 rounded-3xl inline-block shadow-inner border border-gray-100">
            <QRCodeCanvas value={trackingUrl} size={200} />
          </div>
          
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Driver can scan this to start tracking</p>
          
          <div className="flex gap-4">
            <button onClick={() => navigate('/dispatch')} className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.02] transition-all">
              Go to List
            </button>
            <button onClick={() => window.print()} className="px-8 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
              Print Slip
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <style>{customMapStyles}</style>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button onClick={() => navigate('/dispatch')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
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
                Step-by-Step Logistics Deployment
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-2xl"><MapPin size={24} /></div>
                <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Step 1: Map Locations</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6 mb-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Loading Point (Saudi Arabia)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setActiveField('loading');
                        setManualPinActive(!manualPinActive);
                      }}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${manualPinActive && activeField === 'loading' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {manualPinActive && activeField === 'loading' ? 'Click Map to Set' : 'Manual Pin'}
                    </button>
                  </div>
                  <input 
                    readOnly 
                    value={loadingAddr}
                    onFocus={() => setActiveField('loading')}
                    className={`input-field bg-gray-50/50 dark:bg-gray-800/30 cursor-pointer text-xs transition-all ${activeField === 'loading' ? 'ring-2 ring-green-500/30 border-green-500' : ''}`} 
                    placeholder="Search Loading Point..." 
                  />
                  <input type="hidden" {...register('loadingFrom', { required: true })} value={loadingAddr} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Offloading Point (Saudi Arabia)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setActiveField('offloading');
                        setManualPinActive(!manualPinActive);
                      }}
                      className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg transition-all ${manualPinActive && activeField === 'offloading' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {manualPinActive && activeField === 'offloading' ? 'Click Map to Set' : 'Manual Pin'}
                    </button>
                  </div>
                  <input 
                    readOnly 
                    value={offloadingAddr}
                    onFocus={() => setActiveField('offloading')}
                    className={`input-field bg-gray-50/50 dark:bg-gray-800/30 cursor-pointer text-xs transition-all ${activeField === 'offloading' ? 'ring-2 ring-red-500/30 border-red-500' : ''}`} 
                    placeholder="Search Offloading Point..." 
                  />
                  <input type="hidden" {...register('offloadingTo', { required: true })} value={offloadingAddr} />
                </div>
              </div>

              <div className="h-[500px] w-full rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl relative z-0">
                <MapContainer center={[23.8859, 45.0792]} zoom={5} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  
                  <SearchControl placeholder="Search Loading..." type="loading" setActiveField={setActiveField} />
                  <SearchControl placeholder="Search Offloading..." type="offloading" setActiveField={setActiveField} />

                  <MapSearchHandler 
                    activeField={activeField}
                    onLoadingSelect={handleLoadingSelect}
                    onOffloadingSelect={handleOffloadingSelect}
                  />
                  
                  <ManualPinControl onPinDrop={handleManualPinFound} activeField={activeField} manualPinActive={manualPinActive} setManualPinActive={setManualPinActive} />

                  {/* Double Markers: Blue for Loading, Red for Offloading */}
                  {loadingPoint?.lat && (
                    <Marker 
                      key={`marker-loading-${loadingPoint.lat}-${loadingPoint.lng}`}
                      position={[loadingPoint.lat, loadingPoint.lng]} 
                      icon={loadingIcon}
                    >
                      <Popup>Loading Point: {loadingPoint.label}</Popup>
                    </Marker>
                  )}

                  {offloadingPoint?.lat && (
                    <Marker 
                      key={`marker-offloading-${offloadingPoint.lat}-${offloadingPoint.lng}`}
                      position={[offloadingPoint.lat, offloadingPoint.lng]} 
                      icon={offloadingIcon}
                    >
                      <Popup>Offloading Point: {offloadingPoint.label}</Popup>
                    </Marker>
                  )}

                  {/* Path (Route) only drawn when BOTH values are present */}
                  {loadingPoint?.lat && offloadingPoint?.lat && (
                    <Polyline 
                      positions={[[loadingPoint.lat, loadingPoint.lng], [offloadingPoint.lat, offloadingPoint.lng]]} 
                      color="#0066FF" 
                      dashArray="10, 10" 
                      weight={3}
                    />
                  )}
                </MapContainer>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-10 border-t border-gray-100 dark:border-gray-800 pt-8">
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Distance</p>
                  <p className="text-2xl font-black text-primary dark:text-white">{watch('distance') || '0.00 km'}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Estimated Time</p>
                  <p className="text-2xl font-black text-accent">{watch('estimatedTime') || '0 mins'}</p>
                </div>
              </div>
            </motion.div>

            {/* Material Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-2xl"><ClipboardList size={24} /></div>
                <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Step 2: Cargo Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Material Description</label><input {...register('materialDescription')} className="input-field" placeholder="What is being transported?" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Delivery Note #</label><input {...register('deliveryNoteNumber', { required: true })} className={`input-field ${isEditMode ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-70' : ''}`} placeholder="DN-XXXXX" readOnly={isEditMode} /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Quantity</label><input {...register('materialQuantity')} className="input-field" placeholder="e.g. 30 Tons" /></div>
              </div>
            </motion.div>

            {/* Customer Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-2xl"><User size={24} /></div>
                <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Client Intelligence</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Customer Name</label><input {...register('customerName')} className="input-field" placeholder="End Client Name" /></div>
                <div className="space-y-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Customer VAT</label><input {...register('customerVAT')} className="input-field" placeholder="VAT Registration #" /></div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 space-y-10">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-10 bg-primary text-white border-none shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-white/10 rounded-2xl text-white"><Truck size={24} /></div>
                <h3 className="text-xl font-black uppercase tracking-tight">Step 3: Assignment</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Assigned Vehicle</label>
                  <select {...register('assignedVehicle', { required: true })} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-white/50 outline-none appearance-none transition-all">
                    <option value="" className="text-gray-900">Select Vehicle</option>
                    {vehicles.map(v => <option key={v._id} value={v._id} className="text-gray-900">{v.plateNumber} ({v.vehicleType})</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] ml-1">Assigned Driver</label>
                  <select {...register('assignedDriver', { required: true })} className="w-full px-5 py-4 bg-white/10 border border-white/20 rounded-2xl text-sm font-bold text-white focus:ring-2 focus:ring-white/50 outline-none appearance-none transition-all">
                    <option value="" className="text-gray-900">Select Driver</option>
                    {drivers.map(d => <option key={d._id} value={d._id} className="text-gray-900">{d.fullName}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-10 border border-gray-100 dark:border-gray-800 shadow-lg">
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
                      <button key={p} type="button" onClick={() => setValue('priority', p)} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${watch('priority') === p ? 'bg-primary text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <button 
              type="submit" 
              disabled={loading || !loadingPoint || !offloadingPoint} 
              className="w-full bg-accent text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-accent/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
              {isEditMode ? 'Update Dispatch' : 'Confirm Dispatch'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateDispatch;
