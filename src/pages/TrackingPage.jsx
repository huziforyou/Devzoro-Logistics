import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Phone, 
  User,
  Power,
  RefreshCw
} from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Vehicle Icon URL
const VEHICLE_ICON_URL = 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png';

const TrackingPage = () => {
  const { trackingId } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [currentPos, setCurrentPos] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [actualDistance, setActualDistance] = useState(0);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const watchIdRef = useRef(null);

  // Memoize icons to prevent re-creation
   const vehicleIcon = useMemo(() => new L.Icon({
     iconUrl: VEHICLE_ICON_URL,
     iconSize: [40, 40],
     iconAnchor: [20, 20],
     popupAnchor: [0, -20],
   }), []);
 
   const defaultIcon = useMemo(() => new L.Icon({
     iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
     iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
     shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
     iconSize: [25, 41],
     iconAnchor: [12, 41],
   }), []);

  useEffect(() => {
    fetchTrackingDetails();
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [trackingId]);

  useEffect(() => {
    if (order && order.status === 'Pending' && !trackingActive) {
      // Step 1: Start tracking if Pending
      startTracking();
    } else if (order && order.status === 'In Transit') {
      // Step 2: If In Transit, start tracking to keep live view
      if (!trackingActive) startTracking();
      
      // Step 3: "Re-scan to Deliver" Logic
      // If they scanned the QR again, we show the confirmation immediately
      const hasConfirmed = localStorage.getItem(`delivered_confirm_${trackingId}`);
      if (!hasConfirmed) {
        setTimeout(() => {
          if (window.confirm('📍 DESTINATION REACHED?\n\nYou are already In-Transit. Do you want to mark this order as DELIVERED now?')) {
            localStorage.setItem(`delivered_confirm_${trackingId}`, 'true');
            stopTracking();
          }
        }, 1500);
      }
    }
  }, [order]);

  const fetchTrackingDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/dispatch/track/${trackingId}`);
      const data = res.data.data;
      setOrder(data);
      setActualDistance(data.actualDistance || 0);
      setTrackingHistory(data.trackingHistory || []);
      if (data.status === 'Delivered') {
        setError('Order has already been delivered');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Tracking ID not found');
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    let lastSentPos = null;
    const DISTANCE_THRESHOLD = 0.05; // 50 meters

    setTrackingActive(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        setLastUpdate(new Date());

        // Efficiency Logic: Only send if moved significantly (> 50m)
        if (lastSentPos) {
          const calculateDistance = (lat1, lon1, lat2, lon2) => {
            const R = 6371; 
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a = 
              Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2); 
            return R * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 2;
          };

          const dist = calculateDistance(lastSentPos.lat, lastSentPos.lng, latitude, longitude);
          if (dist < DISTANCE_THRESHOLD) return;
        }
        
        try {
          const res = await api.put(`/dispatch/track/${trackingId}/location`, {
            lat: latitude,
            lng: longitude
          });
          const updatedOrder = res.data.data;
          setActualDistance(updatedOrder.actualDistance);
          setTrackingHistory(updatedOrder.trackingHistory || []);
          lastSentPos = { lat: latitude, lng: longitude };
        } catch (err) {
          console.error('Failed to update location:', err);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setTrackingActive(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 10000 // 10 seconds cache
      }
    );
  };

  const stopTracking = async () => {
    if (window.confirm('Confirm Delivery: Have you reached the destination and delivered the items?')) {
      try {
        if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        setTrackingActive(false);
        
        // Use current position for completion
        const pos = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => resolve(currentPos)
          );
        });

        await api.put(`/dispatch/track/${trackingId}/complete`, {
          lat: pos?.lat,
          lng: pos?.lng
        });
        
        alert('SUCCESS: Delivery marked as Delivered!');
        fetchTrackingDetails();
      } catch (err) {
        alert('Error: Failed to mark as delivered');
      }
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <p className="text-sm font-black uppercase tracking-widest text-gray-400">Initializing Tracking...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
        <AlertCircle size={40} />
      </div>
      <h2 className="text-2xl font-black text-primary uppercase tracking-tight mb-2">Access Denied</h2>
      <p className="text-gray-500 mb-8">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-2">
        <RefreshCw size={20} /> Retry
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-lg font-black text-primary uppercase tracking-tight">Driver Hub</h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order: {order?.deliveryNoteNumber}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${trackingActive ? 'bg-green-100 text-green-600 animate-pulse' : 'bg-gray-100 text-gray-400'}`}>
            {trackingActive ? 'Live Tracking' : 'Idle'}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Live Map */}
        <div className="h-[300px] w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative z-0">
          <MapContainer 
            center={currentPos ? [currentPos.lat, currentPos.lng] : (order?.loadingCoords?.lat ? [order.loadingCoords.lat, order.loadingCoords.lng] : [24.7136, 46.6753])} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {order?.loadingCoords?.lat && (
              <Marker position={[order.loadingCoords.lat, order.loadingCoords.lng]} icon={defaultIcon}>
                <Popup>Loading Point</Popup>
              </Marker>
            )}

            {order?.offloadingCoords?.lat && (
              <Marker position={[order.offloadingCoords.lat, order.offloadingCoords.lng]} icon={defaultIcon}>
                <Popup>Offloading Point</Popup>
              </Marker>
            )}

            {currentPos && (
              <Marker 
                position={[currentPos.lat, currentPos.lng]}
                icon={vehicleIcon}
              >
                <Popup>Your Location</Popup>
              </Marker>
            )}

            {trackingHistory.length > 1 && (
              <Polyline positions={trackingHistory.map(h => [h.lat, h.lng])} color="green" weight={4} />
            )}
          </MapContainer>
        </div>

        {/* Route Info */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <Navigation className="text-accent" size={20} />
            <h2 className="text-xs font-black text-primary uppercase tracking-widest">Route Intelligence</h2>
          </div>
          
          <div className="flex gap-4">
            <div className="flex flex-col items-center py-1">
              <div className="w-3 h-3 rounded-full border-2 border-primary bg-white" />
              <div className="w-[2px] flex-1 bg-gradient-to-b from-primary to-accent my-1" />
              <div className="w-3 h-3 rounded-full border-2 border-accent bg-white" />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Origin</p>
                <p className="font-bold text-gray-800">{order?.loadingFrom}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Destination</p>
                <p className="font-bold text-gray-800">{order?.offloadingTo}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Actual Dist</p>
              <p className="text-lg font-black text-primary">{actualDistance.toFixed(2)} km</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
              <p className="text-lg font-black text-accent uppercase">{order?.status}</p>
            </div>
          </div>
        </div>

        {/* Driver Details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
              <User size={28} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Driver Info</p>
              <h3 className="font-black text-primary uppercase">{order?.assignedDriver?.fullName}</h3>
              <p className="text-xs font-bold text-gray-500">{order?.assignedDriver?.phoneNumber}</p>
            </div>
            <a href={`tel:${order?.assignedDriver?.phoneNumber}`} className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
              <Phone size={20} />
            </a>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 pb-10">
          {!trackingActive ? (
            <button 
              onClick={startTracking}
              className="w-full bg-primary text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Power size={24} />
              Start Live Tracking
            </button>
          ) : (
            <button 
              onClick={stopTracking}
              className="w-full bg-green-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-green-600/30 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CheckCircle2 size={24} />
              Complete Delivery
            </button>
          )}
          <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest mt-6 px-4 leading-relaxed">
            {trackingActive 
              ? `Tracking is active. Last sync: ${lastUpdate?.toLocaleTimeString()}`
              : 'Please click start when you begin your journey.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
