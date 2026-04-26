import { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, Download, Eye, Loader2, Truck, FileDown, Plus, 
  X, Printer, CheckCircle2, Clock, Navigation,
  ArrowRight, ArrowLeft, Trash2, Edit2, Upload, FileText, Calendar, Timer,
  QrCode, MapPin, ExternalLink
} from 'lucide-react';
import { QRCodeCanvas as QRCode } from 'qrcode.react';
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
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import { applyTemplate, downloadPDF, generateDetailedDispatchOrderPDF, generatePDFReport } from '../utils/pdfHelper';
import LogoImage from '../assets/devzoro-1.jpg';

// Custom Icons Definition (Outside component to avoid Illegal Constructor error)
const truckIcon = L.icon({ 
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', 
  iconSize: [35, 35], 
  iconAnchor: [17, 17], 
  popupAnchor: [0, -17],
});

const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

import toast from 'react-hot-toast';

const DispatchOrders = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeTab, setActiveTab] = useState('Pending'); 
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isOutForDeliveryModalOpen, setIsOutForDeliveryModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [followDriver, setFollowDriver] = useState(true);
  const mapRef = useRef(null);
  const pollingRef = useRef(null);
  
  const [showCompletionQR, setShowCompletionQR] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditingDelivery, setIsEditingDelivery] = useState(false);
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [etaInfo, setEtaInfo] = useState(null);

  // Date Filtering State
  const [filterType, setFilterType] = useState('all'); // 'all', 'range', 'monthly', 'yearly'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Export Customization State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [availableColumns] = useState([
    { id: 'deliveryNoteNumber', label: 'DN Number', checked: true },
    { id: 'customerName', label: 'Client Name', checked: true },
    { id: 'assignedVehicle', label: 'Vehicle Name', checked: true },
    { id: 'materialDescription', label: 'Material', checked: true },
    { id: 'materialQuantity', label: 'Quantity', checked: true },
    { id: 'route', label: 'Route', checked: true },
    { id: 'assignedDriver', label: 'Driver', checked: true },
    { id: 'vehiclePlateNumber', label: 'Vehicle Plate', checked: true },
    { id: 'status', label: 'Status', checked: true },
    { id: 'createdAt', label: 'Created Date', checked: true },
    { id: 'outForDeliveryTime', label: 'Departure Time', checked: false },
    { id: 'deliveredDate', label: 'Delivered Date', checked: false },
    { id: 'deliveredTime', label: 'Delivered Time', checked: false },
    { id: 'receivedQuantity', label: 'Received Qty', checked: false },
    { id: 'quantityStatus', label: 'Qty Status', checked: false },
    { id: 'quantityDifference', label: 'Qty Difference', checked: false },
    { id: 'deliveryNotes', label: 'Notes', checked: false }
  ]);
  const [selectedColumns, setSelectedColumns] = useState(availableColumns.filter(c => c.checked).map(c => c.id));

  const filterDataByDate = (data) => {
    if (filterType === 'all') return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.createdAt);
      if (isNaN(itemDate.getTime())) return true;

      if (filterType === 'range') {
        if (!startDate && !endDate) return true;
        const start = startDate ? new Date(startDate) : new Date(0);
        const end = endDate ? new Date(endDate) : new Date();
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return itemDate >= start && itemDate <= end;
      }
      
      if (filterType === 'monthly') {
        const [year, month] = selectedMonth.split('-');
        return itemDate.getFullYear() === parseInt(year) && (itemDate.getMonth() + 1) === parseInt(month);
      }
      
      if (filterType === 'yearly') {
        return itemDate.getFullYear() === parseInt(selectedYear);
      }
      
      return true;
    });
  };

  // Out for Delivery Form State
  const [outForDeliveryData, setOutForDeliveryData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  });

  // Delivery Form State
  const [deliveryData, setDeliveryData] = useState({
    deliveredDate: new Date().toISOString().split('T')[0],
    deliveredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    receivedQuantity: '',
    quantityStatus: 'Exact',
    quantityDifference: '0',
    deliveryNotes: '',
    deliveryNote: null
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  // Keyboard Support: Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsTrackingModalOpen(false);
        setIsModalOpen(false);
        setIsOutForDeliveryModalOpen(false);
        setIsDeliveryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const haversineKm = (a, b) => {
    if (!a || !b) return null;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const lat1 = a.lat, lng1 = a.lng, lat2 = b.lat, lng2 = b.lng;
    if (![lat1, lng1, lat2, lng2].every(n => typeof n === 'number' && Number.isFinite(n))) return null;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const sLat1 = toRad(lat1);
    const sLat2 = toRad(lat2);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(sLat1) * Math.cos(sLat2) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return R * c;
  };

  const estimateEtaMinutes = (distanceKm, speedKph = 60) => {
    if (typeof distanceKm !== 'number' || !Number.isFinite(distanceKm) || distanceKm < 0) return null;
    return Math.round((distanceKm / speedKph) * 60);
  };

  useEffect(() => {
    const fetchEta = async () => {
      if (!isModalOpen || !selectedOrder?._id) return;
      try {
        const res = await api.get(`/dispatch/${selectedOrder._id}/eta`);
        setEtaInfo(res.data.data);
      } catch (e) {
        setEtaInfo({ distanceKm: null, etaMinutes: null, reason: 'Failed to fetch ETA' });
      }
    };
    fetchEta();
  }, [isModalOpen, selectedOrder?._id]);

  useEffect(() => {
    if (!isModalOpen || !selectedOrder) return;
    const vehicleId = selectedOrder.assignedVehicle?._id || selectedOrder.assignedVehicle;
    const destination = selectedOrder.offloadingCoords;
    const live = vehicleId ? vehicleLocations[vehicleId] : null;
    if (!vehicleId || !destination || typeof destination.lat !== 'number' || typeof destination.lng !== 'number' || !live) return;
    const distanceKm = haversineKm(live, destination);
    const etaMinutes = distanceKm === null ? null : estimateEtaMinutes(distanceKm, 60);
    setEtaInfo(prev => ({
      ...(prev || {}),
      distanceKm: distanceKm === null ? null : Number(distanceKm.toFixed(2)),
      etaMinutes,
      currentLocation: live,
      destination
    }));
  }, [vehicleLocations, isModalOpen, selectedOrder]);

  useEffect(() => {
    if (!isTrackingModalOpen || !mapRef.current) return;
    
    const loading = selectedOrder?.loadingCoords;
    const offloading = selectedOrder?.offloadingCoords;
    const current = selectedOrder?.currentLocation;
    
    const validPoints = [];
    
    if (typeof loading?.lat === 'number' && typeof loading?.lng === 'number') {
      validPoints.push([loading.lat, loading.lng]);
    }
    if (typeof offloading?.lat === 'number' && typeof offloading?.lng === 'number') {
      validPoints.push([offloading.lat, offloading.lng]);
    }
    if (typeof current?.lat === 'number' && typeof current?.lng === 'number') {
      validPoints.push([current.lat, current.lng]);
    }
    
    if (validPoints.length >= 2) {
      const bounds = L.latLngBounds(validPoints);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [isTrackingModalOpen, selectedOrder?._id, 
      selectedOrder?.loadingCoords?.lat, selectedOrder?.loadingCoords?.lng,
      selectedOrder?.offloadingCoords?.lat, selectedOrder?.offloadingCoords?.lng,
      selectedOrder?.currentLocation?.lat, selectedOrder?.currentLocation?.lng]);

  useEffect(() => {
    if (isTrackingModalOpen && selectedOrder?._id) {
      // Polling start: Every 5 seconds
      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.get(`/dispatch/${selectedOrder._id}`);
          const updatedOrder = res.data.data;
          
          setSelectedOrder(updatedOrder);

          // Auto-center map if Follow Driver is on
          if (followDriver && updatedOrder.currentLocation?.lat && mapRef.current) {
            mapRef.current.setView(
              [updatedOrder.currentLocation.lat, updatedOrder.currentLocation.lng], 
              mapRef.current.getZoom(),
              { animate: true }
            );
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isTrackingModalOpen, selectedOrder?._id, followDriver]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dispatch');
      setOrders(res.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDeliveryNote = (order) => {
    if (!order.deliveryNoteData) {
      toast.error("No delivery note available");
      return;
    }

    try {
      // 1. Decode Base64 string to a byte array
      const byteCharacters = atob(order.deliveryNoteData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 2. Create a blob from the byte array with the correct MIME type
      const blob = new Blob([byteArray], { type: order.deliveryNoteType || 'application/pdf' });

      // 3. Create a temporary URL for the blob and open it in a new tab
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Clean up the object URL after a short delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      console.error("Error opening delivery note:", err);
      toast.error("Could not open delivery note");
    }
  };

  const handleOutForDelivery = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.put(`/dispatch/${selectedOrder._id}/out-for-delivery`, {
        outForDeliveryDate: outForDeliveryData.date,
        outForDeliveryTime: outForDeliveryData.time
      });
      
      setOrders(prev => prev.map(order => 
        order._id === selectedOrder._id ? res.data.data : order
      ));
      
      setIsOutForDeliveryModalOpen(false);
      setIsModalOpen(false);
      toast.success("Status updated to Out for Delivery");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditDelivery = (order) => {
    setSelectedOrder(order);
    setIsEditingDelivery(true);
    setDeliveryData({
      deliveredDate: order.deliveredDate ? new Date(order.deliveredDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      deliveredTime: order.deliveredTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      receivedQuantity: order.receivedQuantity || '',
      quantityStatus: order.quantityStatus || 'Exact',
      quantityDifference: order.quantityDifference || '0',
      deliveryNotes: order.deliveryNotes || '',
      deliveryNote: null
    });
    setIsDeliveryModalOpen(true);
  };

  const handleDeliveredSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const formData = new FormData();
    formData.append('deliveredDate', deliveryData.deliveredDate);
    formData.append('deliveredTime', deliveryData.deliveredTime);
    formData.append('receivedQuantity', deliveryData.receivedQuantity);
    formData.append('quantityStatus', deliveryData.quantityStatus);
    formData.append('quantityDifference', deliveryData.quantityDifference);
    formData.append('deliveryNotes', deliveryData.deliveryNotes);
    if (deliveryData.deliveryNote) {
      formData.append('deliveryNote', deliveryData.deliveryNote);
    }

    try {
      const res = await api.put(`/dispatch/${selectedOrder._id}/delivered`, formData);
      
      setOrders(prev => prev.map(order => 
        order._id === selectedOrder._id ? res.data.data : order
      ));
      
      setIsDeliveryModalOpen(false);
      setIsModalOpen(false);
      toast.success(isEditingDelivery ? "Delivery info updated successfully!" : "Delivery confirmed successfully!");
      setDeliveryData({
        deliveredDate: new Date().toISOString().split('T')[0],
        deliveredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        receivedQuantity: '',
        quantityStatus: 'Exact',
        quantityDifference: '0',
        deliveryNotes: '',
        deliveryNote: null
      });
    } catch (error) {
      console.error("Delivery update failed:", error);
      const errorMsg = error.response?.data?.error || error.message || "Failed to update delivery";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
      setIsEditingDelivery(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this dispatch?')) return;
    try {
      await api.delete(`/dispatch/${orderId}`);
      setOrders(prev => prev.filter(order => order._id !== orderId));
      setSelectedIds(prev => prev.filter(id => id !== orderId));
      toast.success("Dispatch deleted successfully");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete dispatch");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} orders?`)) return;
    setIsUpdating(true);
    try {
      await api.post('/dispatch/bulk-delete', { ids: selectedIds });
      setOrders(prev => prev.filter(order => !selectedIds.includes(order._id)));
      setSelectedIds([]);
      toast.success("Selected orders deleted successfully");
    } catch (error) {
      console.error("Bulk delete failed:", error);
      toast.error("Failed to delete selected orders");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    if (!window.confirm(`Are you sure you want to update ${selectedIds.length} orders to ${status}?`)) return;
    setIsUpdating(true);
    try {
      await api.put('/dispatch/bulk-status', { ids: selectedIds, status });
      await fetchOrders(); // Refresh to get full updated data
      setSelectedIds([]);
      toast.success(`Selected orders updated to ${status}`);
    } catch (error) {
      console.error("Bulk status update failed:", error);
      toast.error("Failed to update status for selected orders");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map(o => o._id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = order.status === activeTab;
    const matchesSearch = 
      order.deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.assignedVehicle?.plateNumber || order.assignedVehicle?.name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.assignedDriver?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Apply Date Filter to the table view as well
    const matchesDate = filterDataByDate([order]).length > 0;
    
    return matchesTab && matchesSearch && matchesDate;
  });

  const generateExcel = () => {
    try {
      let dataToExport = orders;
      
      // Apply Search Filter
      if (searchTerm) {
        dataToExport = dataToExport.filter(o => 
          o.deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.assignedDriver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply Date Filter
      dataToExport = filterDataByDate(dataToExport);

      if (dataToExport.length === 0) {
        toast.error("No data found for the selected filters");
        return;
      }

      const worksheetData = dataToExport.map(o => {
        const row = {};
        if (selectedColumns.includes('deliveryNoteNumber')) row["DN Number"] = o.deliveryNoteNumber;
        if (selectedColumns.includes('customerName')) row["Client Name"] = o.customerName || 'N/A';
        if (selectedColumns.includes('assignedVehicle')) row["Vehicle Name"] = o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || 'N/A';
        if (selectedColumns.includes('materialDescription')) row["Material"] = o.materialDescription || 'N/A';
        if (selectedColumns.includes('materialQuantity')) row["Quantity"] = o.materialQuantity || '0';
        if (selectedColumns.includes('route')) row["Route"] = `${o.loadingFrom} to ${o.offloadingTo}`;
        if (selectedColumns.includes('assignedDriver')) row["Driver"] = o.assignedDriver?.name || 'N/A';
        if (selectedColumns.includes('vehiclePlateNumber')) row["Vehicle Plate"] = o.vehiclePlateNumber || 'N/A';
        if (selectedColumns.includes('status')) row["Status"] = o.status;
        if (selectedColumns.includes('createdAt')) row["Created Date"] = new Date(o.createdAt).toLocaleDateString();
        if (selectedColumns.includes('outForDeliveryTime')) row["Out For Delivery Time"] = o.outForDeliveryTime ? new Date(o.outForDeliveryTime).toLocaleString() : 'N/A';
        if (selectedColumns.includes('deliveredDate')) row["Delivered Date"] = o.deliveredDate ? new Date(o.deliveredDate).toLocaleDateString() : 'N/A';
        if (selectedColumns.includes('deliveredTime')) row["Delivered Time"] = o.deliveredTime || 'N/A';
        if (selectedColumns.includes('receivedQuantity')) row["Received Qty"] = o.receivedQuantity || '0';
        if (selectedColumns.includes('quantityStatus')) row["Qty Status"] = o.quantityStatus || 'N/A';
        if (selectedColumns.includes('quantityDifference')) row["Qty Difference"] = o.quantityDifference || '0';
        if (selectedColumns.includes('deliveryNotes')) row["Notes"] = o.deliveryNotes || '';
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Dispatch Report");
      
      XLSX.writeFile(workbook, `Dispatch_Report_${filterType}_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel");
    }
  };

  const generateCSV = () => {
    try {
      let dataToExport = orders;
      
      // Apply Search Filter
      if (searchTerm) {
        dataToExport = dataToExport.filter(o => 
          o.deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          o.assignedDriver?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Apply Date Filter
      dataToExport = filterDataByDate(dataToExport);

      if (dataToExport.length === 0) {
        toast.error("No data found for the selected filters");
        return;
      }

      const activeCols = availableColumns.filter(c => selectedColumns.includes(c.id));
      const headers = activeCols.map(c => c.label);
      
      const rows = dataToExport.map(o => {
        const row = [];
        if (selectedColumns.includes('deliveryNoteNumber')) row.push(o.deliveryNoteNumber);
        if (selectedColumns.includes('customerName')) row.push(`"${o.customerName || 'N/A'}"`);
        if (selectedColumns.includes('assignedVehicle')) row.push(`"${o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || 'N/A'}"`);
        if (selectedColumns.includes('materialDescription')) row.push(`"${o.materialDescription || 'N/A'}"`);
        if (selectedColumns.includes('materialQuantity')) row.push(o.materialQuantity || '0');
        if (selectedColumns.includes('route')) row.push(`"${o.loadingFrom} to ${o.offloadingTo}"`);
        if (selectedColumns.includes('assignedDriver')) row.push(`"${o.assignedDriver?.name || 'N/A'}"`);
        if (selectedColumns.includes('vehiclePlateNumber')) row.push(o.vehiclePlateNumber || 'N/A');
        if (selectedColumns.includes('status')) row.push(o.status);
        if (selectedColumns.includes('createdAt')) row.push(new Date(o.createdAt).toLocaleDateString());
        if (selectedColumns.includes('outForDeliveryTime')) row.push(`"${o.outForDeliveryTime ? new Date(o.outForDeliveryTime).toLocaleString() : 'N/A'}"`);
        if (selectedColumns.includes('deliveredDate')) row.push(`"${o.deliveredDate ? new Date(o.deliveredDate).toLocaleDateString() : 'N/A'}"`);
        if (selectedColumns.includes('deliveredTime')) row.push(`"${o.deliveredTime || 'N/A'}"`);
        if (selectedColumns.includes('receivedQuantity')) row.push(o.receivedQuantity || '0');
        if (selectedColumns.includes('quantityStatus')) row.push(o.quantityStatus || 'N/A');
        if (selectedColumns.includes('quantityDifference')) row.push(o.quantityDifference || '0');
        if (selectedColumns.includes('deliveryNotes')) row.push(`"${(o.deliveryNotes || '').replace(/"/g, '""')}"`);
        return row;
      });

      const csvContent = [
        headers.join(","),
        ...rows.map(r => r.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Dispatch_Report_${filterType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV Export Error:", err);
      toast.error("Failed to export CSV");
    }
  };

  const generatePDF = async (order = null) => {
    try {
      const filename = order ? `Order_${order.deliveryNoteNumber}.pdf` : `Dispatch_Report_${filterType}_${new Date().toISOString().split('T')[0]}.pdf`;

      if (order) {
        await generateDetailedDispatchOrderPDF(order, filename);
      } else {
        let dataToPrint = orders;

        // Apply Search Filter
        if (searchTerm) {
          dataToPrint = dataToPrint.filter(o => 
            o.deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.assignedVehicle?.plateNumber || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.assignedDriver?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply Date Filter
        dataToPrint = filterDataByDate(dataToPrint);

        if (dataToPrint.length === 0) {
          toast.error("No data found for the selected filters");
          return;
        }
        
        const activeCols = availableColumns.filter(c => selectedColumns.includes(c.id));
        const columns = activeCols.map(c => c.label);
        const tableRows = dataToPrint.map(o => {
          const row = [];
          if (selectedColumns.includes('deliveryNoteNumber')) row.push(o.deliveryNoteNumber);
          if (selectedColumns.includes('customerName')) row.push(o.customerName || 'N/A');
          if (selectedColumns.includes('assignedVehicle')) row.push(o.assignedVehicle?.plateNumber || 'N/A');
          if (selectedColumns.includes('materialDescription')) row.push(o.materialDescription || 'N/A');
          if (selectedColumns.includes('materialQuantity')) row.push(o.materialQuantity || '0');
          if (selectedColumns.includes('route')) row.push(`${o.loadingFrom} to ${o.offloadingTo}`);
          if (selectedColumns.includes('assignedDriver')) row.push(o.assignedDriver?.fullName || 'N/A');
          if (selectedColumns.includes('vehiclePlateNumber')) row.push(o.vehiclePlateNumber || 'N/A');
          if (selectedColumns.includes('status')) row.push(o.status);
          if (selectedColumns.includes('createdAt')) row.push(new Date(o.createdAt).toLocaleDateString());
          if (selectedColumns.includes('outForDeliveryTime')) row.push(o.outForDeliveryTime ? new Date(o.outForDeliveryTime).toLocaleString() : 'N/A');
          if (selectedColumns.includes('deliveredDate')) row.push(o.deliveredDate ? new Date(o.deliveredDate).toLocaleDateString() : 'N/A');
          if (selectedColumns.includes('deliveredTime')) row.push(o.deliveredTime || 'N/A');
          if (selectedColumns.includes('receivedQuantity')) row.push(o.receivedQuantity || '0');
          if (selectedColumns.includes('quantityStatus')) row.push(o.quantityStatus || 'N/A');
          if (selectedColumns.includes('quantityDifference')) row.push(o.quantityDifference || '0');
          if (selectedColumns.includes('deliveryNotes')) row.push(o.deliveryNotes || '');
          return row;
        });

        await generatePDFReport(`Dispatch Report (${filterType.toUpperCase()})`, columns, tableRows, filename);
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  const handleCompleteTracking = async () => {
    if (!selectedOrder) return;
    if (window.confirm('Are you sure you want to finalize tracking and mark as Delivered?')) {
      setIsUpdating(true);
      try {
        await api.put(`/dispatch/track/${selectedOrder.trackingId}/complete`, {
          lat: selectedOrder.currentLocation?.lat,
          lng: selectedOrder.currentLocation?.lng
        });
        toast.success('Tracking completed and order marked as Delivered!');
        fetchOrders();
        setIsTrackingModalOpen(false);
      } catch (err) {
        toast.error('Failed to complete tracking');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="w-full lg:w-auto">
          <button 
            onClick={() => navigate('/dispatch')} 
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 hover:text-primary transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Dispatch List
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-primary dark:text-white uppercase tracking-tight">
            Logistics Control
          </h1>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium tracking-tight">Track and manage your dispatches</p>
        </div>

        {/* Advanced Filtering UI */}
        <div className="w-full lg:w-auto flex flex-col md:flex-row items-stretch md:items-center gap-3 bg-white dark:bg-gray-800 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {['all', 'range', 'monthly', 'yearly'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${filterType === type ? 'bg-white dark:bg-gray-800 text-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block" />

          <div className="flex-1">
            {filterType === 'range' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary py-2 px-3"
                />
                <span className="text-gray-400 font-black text-[10px] uppercase">to</span>
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary py-2 px-3"
                />
              </div>
            )}

            {filterType === 'monthly' && (
              <input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary animate-in fade-in slide-in-from-right-4 py-2 px-3"
              />
            )}

            {filterType === 'yearly' && (
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary animate-in fade-in slide-in-from-right-4 py-2 px-3"
              >
                {[0, 1, 2, 3].map(i => {
                  const year = (new Date().getFullYear() - i).toString();
                  return <option key={year} value={year}>{year}</option>;
                })}
              </select>
            )}
          </div>
        </div>

        <div className="w-full lg:w-auto flex flex-col md:flex-row gap-3">
          {(isAdmin || currentUser?.permissions?.viewReports) && (
            <div className="grid grid-cols-3 md:flex gap-2">
              <button 
                onClick={() => generatePDF()} 
                className="flex justify-center items-center px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase shadow-sm gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                title="Download PDF Report"
              >
                <FileDown size={16} className="text-red-500" /> <span className="hidden sm:inline">PDF</span>
              </button>
              <button 
                onClick={generateExcel} 
                className="flex justify-center items-center px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase shadow-sm gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                title="Download Excel Report"
              >
                <FileText size={16} className="text-green-500" /> <span className="hidden sm:inline">Excel</span>
              </button>
              <button 
                onClick={generateCSV} 
                className="flex justify-center items-center px-4 md:px-6 py-3 md:py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase shadow-sm gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                title="Download CSV Report"
              >
                <FileText size={16} className="text-blue-500" /> <span className="hidden sm:inline">CSV</span>
              </button>
              <button 
                onClick={() => setIsExportModalOpen(true)}
                className="flex justify-center items-center px-4 md:px-6 py-3 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl text-[9px] md:text-[10px] font-black uppercase shadow-lg shadow-primary/20 gap-2 hover:bg-primary/90 transition-all"
                title="Customize Export Columns"
              >
                <Edit2 size={16} /> <span className="hidden sm:inline">Columns</span>
              </button>
            </div>
          )}
          
          {(isAdmin || currentUser?.permissions?.createDispatch) && (
            <button 
              onClick={() => navigate('/dispatch/create')}
              className="btn-primary px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus size={20} />
              New Dispatch
            </button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && isAdmin && (
        <div className="glass-card p-4 flex flex-col md:flex-row items-center justify-between border border-primary/20 rounded-2xl bg-primary/5 dark:bg-primary/10 shadow-lg animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-primary tracking-widest">Orders Selected</p>
              <p className="text-[9px] font-bold text-gray-500 uppercase">Apply bulk actions to selection</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <button 
              onClick={() => handleBulkStatusUpdate('Picked Up')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Truck size={14} /> Picked Up
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate('In Transit')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <Timer size={14} /> In Transit
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate('Delivered')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={14} /> Delivered
            </button>
            <button 
              onClick={() => handleBulkStatusUpdate('Cancelled')}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-[9px] font-black uppercase rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 text-red-500"
            >
              <X size={14} /> Cancel
            </button>
            <div className="w-[1px] h-8 bg-gray-200 dark:bg-gray-700 mx-2 hidden md:block" />
            <button 
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-500 text-white text-[9px] font-black uppercase rounded-lg hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              <Trash2 size={14} /> Bulk Delete
            </button>
            <button 
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[9px] font-black uppercase rounded-lg hover:bg-gray-300 transition-all"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl w-full sm:w-fit border border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
        {['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Cancelled'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white dark:bg-gray-900 text-primary dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab === 'Pending' && <Clock size={14} />}
            {tab === 'Picked Up' && <Truck size={14} />}
            {tab === 'In Transit' && <Timer size={14} />}
            {tab === 'Delivered' && <CheckCircle2 size={14} />}
            {tab === 'Cancelled' && <X size={14} />}
            {tab} ({orders.filter(o => o.status === tab).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="glass-card p-4 flex items-center border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab} items by DN, Vehicle or Driver...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm font-bold dark:text-white"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card overflow-hidden border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 dark:bg-gray-800/80">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                {isAdmin && (
                  <th className="p-6 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-all"
                      checked={filteredOrders.length > 0 && selectedIds.length === filteredOrders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                )}
                <th className="p-6">DN Details</th>
                <th className="p-6">Vehicle Details</th>
                <th className="p-6">Live Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="animate-spin text-primary" size={32} />
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loading Records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">
                    No records found in {activeTab}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    className={`group hover:bg-primary/[0.02] dark:hover:bg-primary/[0.05] transition-all ${selectedIds.includes(order._id) ? 'bg-primary/[0.03] dark:bg-primary/[0.08]' : ''}`}
                  >
                    {isAdmin && (
                      <td className="p-6 w-10">
                        <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer transition-all"
                          checked={selectedIds.includes(order._id)}
                          onChange={() => toggleSelectOne(order._id)}
                        />
                      </td>
                    )}
                    <td className="p-6">
                      <div className="font-black text-sm text-gray-800 dark:text-white group-hover:text-primary transition-colors">{order.deliveryNoteNumber}</div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                        <span className="text-primary/60">{order.loadingFrom}</span>
                        <ArrowRight size={10} />
                        <span className="text-accent">{order.offloadingTo}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="font-bold text-sm text-gray-700 dark:text-gray-300">{order.assignedVehicle?.plateNumber}</div>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-tight">
                        <span className="flex items-center gap-1"><Truck size={12}/> {order.assignedVehicle?.plateNumber}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="flex items-center gap-1"><Clock size={12}/> {order.assignedDriver?.fullName}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          order.status === 'Delivered' ? 'bg-green-500' : 
                          order.status === 'Cancelled' ? 'bg-red-500' : 'bg-amber-500'
                        }`} />
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                          title="Quick View"
                        >
                          <Eye size={18} />
                        </button>
                        {isAdmin && (
                          <>
                            <button 
                              onClick={() => navigate(`/dispatch/edit/${order._id}`)}
                              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                              title="Edit Order"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Order"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => generatePDF(order)}
                          className="p-2 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-xl transition-all"
                          title="Download PDF"
                        >
                          <FileDown size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- QUICK VIEW MODAL --- */}
      {isModalOpen && selectedOrder && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
        >
          <div className="bg-white dark:bg-gray-900 w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200 relative flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 relative sticky top-0 z-10 backdrop-blur-sm">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center text-primary">
                  <FileText size={24} className="md:w-7 md:h-7" />
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black uppercase text-primary tracking-tight">Order Details</h2>
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">DN: {selectedOrder.deliveryNoteNumber}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 md:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl md:rounded-2xl transition-all group"
                aria-label="Close"
              >
                <X size={20} className="md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-10 custom-scrollbar">
              {/* Route & Status Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800 pb-3">Route Journey</h3>
                  <div className="flex gap-4 bg-gray-50 dark:bg-gray-800/30 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col items-center py-1">
                      <div className="w-3 h-3 rounded-full border-2 border-primary bg-white dark:bg-gray-900" />
                      <div className="w-[2px] flex-1 bg-gradient-to-b from-primary to-accent my-1" />
                      <div className="w-3 h-3 rounded-full border-2 border-accent bg-white dark:bg-gray-900" />
                    </div>
                    <div className="space-y-6 flex-1">
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Loading Point</p>
                        <p className="font-bold text-sm md:text-base text-gray-800 dark:text-gray-200">{selectedOrder.loadingFrom}</p>
                      </div>
                      <div>
                        <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Offloading Point</p>
                        <p className="font-bold text-sm md:text-base text-gray-800 dark:text-gray-200">{selectedOrder.offloadingTo}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Live Distance & ETA</h3>
                    <div className="grid grid-cols-2 gap-4 md:gap-6">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Distance</p>
                        <p className="text-base md:text-lg font-black text-primary dark:text-white">
                          {etaInfo?.distanceKm != null ? `${etaInfo.distanceKm} km` : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl">
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">ETA</p>
                        <p className="text-base md:text-lg font-black text-primary dark:text-white">
                          {etaInfo?.etaMinutes != null ? `${etaInfo.etaMinutes} min` : 'N/A'}
                        </p>
                      </div>
                    </div>
                    {etaInfo?.reason && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                          {etaInfo.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800 pb-3">QR Tracking</h3>
                  <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-800">
                    <div className="bg-white p-4 rounded-3xl shadow-xl mb-4">
                      <QRCode 
                        value={`${window.location.origin}/track/${selectedOrder.trackingId}`} 
                        size={140}
                        level="H"
                        marginSize={2}
                        className="transition-all"
                      />
                    </div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center max-w-[200px] leading-relaxed">
                      Scan to Start Tracking or Complete Delivery
                    </p>
                    <div className="flex gap-2 w-full mt-6">
                      <button 
                        onClick={() => setIsTrackingModalOpen(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white dark:bg-gray-900 text-primary dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
                      >
                        <MapPin size={16} className="group-hover:scale-110 transition-transform" /> View Live Map
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Vehicle</p>
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{selectedOrder.assignedVehicle?.plateNumber}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/30 p-4 rounded-2xl">
                      <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Driver</p>
                      <p className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{selectedOrder.assignedDriver?.fullName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Logistics Status</p>
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        selectedOrder.status === 'Delivered' ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                      }`} />
                      <span className="text-lg md:text-xl font-black text-gray-800 dark:text-white uppercase tracking-tight">{selectedOrder.status}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3 w-full md:w-auto">
                    {selectedOrder.status === 'Pending' && (
                      <button 
                        onClick={() => setIsOutForDeliveryModalOpen(true)}
                        disabled={isUpdating}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="animate-spin" size={16}/> : <Truck size={18}/>}
                        Out For Delivery
                      </button>
                    )}
                    
                    {selectedOrder.status === 'Out For Delivery' && (
                      <button 
                        onClick={() => {
                          setIsEditingDelivery(false);
                          setIsDeliveryModalOpen(true);
                        }}
                        disabled={isUpdating}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isUpdating ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={18}/>}
                        Confirm Delivery
                      </button>
                    )}

                    {selectedOrder.status === 'Delivered' && (
                      <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => handleEditDelivery(selectedOrder)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Edit2 size={18}/> Edit
                        </button>
                        <button 
                          onClick={() => handleViewDeliveryNote(selectedOrder)}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-accent/20 hover:scale-105 active:scale-95 transition-all"
                        >
                          <FileText size={18}/> Note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-4 sticky bottom-0 z-10 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 w-full md:w-auto">
                <button 
                  onClick={() => generatePDF(selectedOrder)}
                  className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all bg-white dark:bg-gray-900 md:bg-transparent rounded-xl md:rounded-none w-full md:w-auto justify-center"
                >
                  <Printer size={18} /> Print Manifest
                </button>
                <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block" />
                <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full md:w-auto px-10 py-4 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-300 dark:hover:bg-gray-700 transition-all shadow-lg"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- OUT FOR DELIVERY MODAL --- */}
      {isOutForDeliveryModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsOutForDeliveryModalOpen(false); }}
        >
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-primary text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">Out For Delivery</h3>
              <button 
                onClick={() => setIsOutForDeliveryModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all group"
                aria-label="Close"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
            <form onSubmit={handleOutForDelivery} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="date" 
                    required
                    value={outForDeliveryData.date}
                    onChange={(e) => setOutForDeliveryData({...outForDeliveryData, date: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Departure Time</label>
                <div className="relative">
                  <Timer className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="time" 
                    required
                    value={outForDeliveryData.time}
                    onChange={(e) => setOutForDeliveryData({...outForDeliveryData, time: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold focus:ring-2 ring-primary/20 transition-all"
                  />
                </div>
              </div>
              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full py-5 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin mx-auto" size={20}/> : 'Confirm Departure'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- DELIVERY CONFIRMATION MODAL --- */}
      {isDeliveryModalOpen && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setIsDeliveryModalOpen(false); }}
        >
          <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-green-600 text-white">
              <h3 className="text-xl font-black uppercase tracking-tight">{isEditingDelivery ? 'Edit Delivery Info' : 'Confirm Delivery'}</h3>
              <button 
                onClick={() => setIsDeliveryModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-all group"
                aria-label="Close"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
            <form onSubmit={handleDeliveredSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Date</label>
                  <input 
                    type="date" 
                    required
                    value={deliveryData.deliveredDate}
                    onChange={(e) => setDeliveryData({...deliveryData, deliveredDate: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Time</label>
                  <input 
                    type="time" 
                    required
                    value={deliveryData.deliveredTime}
                    onChange={(e) => setDeliveryData({...deliveryData, deliveredTime: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Received Qty</label>
                  <input 
                    type="number" 
                    required
                    placeholder="Enter quantity"
                    value={deliveryData.receivedQuantity}
                    onChange={(e) => setDeliveryData({...deliveryData, receivedQuantity: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                  <select 
                    value={deliveryData.quantityStatus}
                    onChange={(e) => setDeliveryData({...deliveryData, quantityStatus: e.target.value})}
                    className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold"
                  >
                    <option value="Exact">Exact</option>
                    <option value="Shortage">Shortage</option>
                    <option value="Excess">Excess</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Upload Delivery Note (PDF/Image)</label>
                <div className="relative group">
                  <input 
                    type="file" 
                    accept="application/pdf,image/*"
                    onChange={(e) => setDeliveryData({...deliveryData, deliveryNote: e.target.files[0]})}
                    className="hidden" 
                    id="deliveryNoteUpload"
                  />
                  <label 
                    htmlFor="deliveryNoteUpload"
                    className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl cursor-pointer hover:border-green-500 hover:bg-green-50/50 transition-all group-hover:scale-[1.01]"
                  >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center text-green-600 mb-3">
                      <Upload size={24}/>
                    </div>
                    <p className="text-sm font-black text-gray-700 dark:text-gray-200 uppercase tracking-tight">
                      {deliveryData.deliveryNote ? deliveryData.deliveryNote.name : 'Choose File or Drop here'}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Notes</label>
                <textarea 
                  value={deliveryData.deliveryNotes}
                  onChange={(e) => setDeliveryData({...deliveryData, deliveryNotes: e.target.value})}
                  className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm font-bold min-h-[100px]"
                  placeholder="Enter any notes about the delivery..."
                />
              </div>

              <button 
                type="submit"
                disabled={isUpdating}
                className="w-full py-5 bg-green-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-green-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isUpdating ? <Loader2 className="animate-spin mx-auto" size={20}/> : (isEditingDelivery ? 'Update Delivery Info' : 'Confirm & Complete')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- LIVE TRACKING MODAL --- */}
      {isTrackingModalOpen && selectedOrder && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-md"
          onClick={(e) => { if (e.target === e.currentTarget) setIsTrackingModalOpen(false); }}
        >
          <div className="bg-white dark:bg-gray-900 w-full md:max-w-5xl h-full md:h-[90vh] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col relative">
            {/* Sticky Header */}
            <div className="sticky top-0 z-[1001] p-4 md:p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white/95 dark:bg-gray-900/95 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsTrackingModalOpen(false)} 
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-xs font-bold transition-all group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm md:text-xl font-black uppercase tracking-tight text-primary">Route Journey & Live Tracking</h3>
                    {selectedOrder.status === 'Out for Delivery' && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-[8px] font-black uppercase animate-pulse">
                        <span className="w-1 h-1 bg-red-600 rounded-full" />
                        Live
                      </span>
                    )}
                  </div>
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 md:mt-1">
                    Vehicle: {selectedOrder.assignedVehicle?.plateNumber} | Driver: {selectedOrder.assignedDriver?.fullName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsTrackingModalOpen(false)}
                className="p-2 md:p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group"
                aria-label="Close"
              >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
              {!selectedOrder ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">Loading Tracking Data...</p>
                  </div>
                </div>
              ) : (
                <MapContainer 
                  center={[selectedOrder.currentLocation?.lat || 24.7136, selectedOrder.currentLocation?.lng || 46.6753]} 
                  zoom={13} 
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {/* Loading Point */}
                  {typeof selectedOrder.loadingCoords?.lat === 'number' && typeof selectedOrder.loadingCoords?.lng === 'number' && (
                    <Marker position={[selectedOrder.loadingCoords.lat, selectedOrder.loadingCoords.lng]} icon={defaultIcon}>
                      <Popup>Loading Point: {selectedOrder.loadingFrom}</Popup>
                    </Marker>
                  )}
                  
                  {/* Offloading Point */}
                  {typeof selectedOrder.offloadingCoords?.lat === 'number' && typeof selectedOrder.offloadingCoords?.lng === 'number' && (
                    <Marker position={[selectedOrder.offloadingCoords.lat, selectedOrder.offloadingCoords.lng]} icon={defaultIcon}>
                      <Popup>Offloading Point: {selectedOrder.offloadingTo}</Popup>
                    </Marker>
                  )}

                  {/* Current Location - Vehicle Icon */}
                  {typeof selectedOrder.currentLocation?.lat === 'number' && typeof selectedOrder.currentLocation?.lng === 'number' && (
                    <Marker 
                      position={[selectedOrder.currentLocation.lat, selectedOrder.currentLocation.lng]}
                      icon={truckIcon}
                    >
                      <Popup>Live Position: {selectedOrder.assignedVehicle?.plateNumber}</Popup>
                    </Marker>
                  )}

                  {/* Breadcrumb Trail (Tracking History) - Solid Blue Line */}
                  {Array.isArray(selectedOrder.trackingHistory) && selectedOrder.trackingHistory.length > 1 && (
                    <Polyline 
                      positions={selectedOrder.trackingHistory.map(h => [h.lat, h.lng])} 
                      color="#0066FF"
                      weight={5}
                      opacity={0.9}
                    />
                  )}

                  {/* Planned Route Line (Dashed) */}
                  {typeof selectedOrder.loadingCoords?.lat === 'number' && typeof selectedOrder.loadingCoords?.lng === 'number' &&
                   typeof selectedOrder.offloadingCoords?.lat === 'number' && typeof selectedOrder.offloadingCoords?.lng === 'number' && (
                    <Polyline 
                      positions={[
                        [selectedOrder.loadingCoords.lat, selectedOrder.loadingCoords.lng],
                        [selectedOrder.offloadingCoords.lat, selectedOrder.offloadingCoords.lng]
                      ]} 
                      color="#666666"
                      dashArray="10, 10"
                      opacity={0.4}
                    />
                  )}
                </MapContainer>
              )}

              {/* Stats Overlay */}
              {selectedOrder && (
                <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 right-4 md:right-8 flex flex-col md:flex-row gap-3 md:gap-4 z-[1000]">
                  <div className="flex-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 grid grid-cols-3 gap-2 md:gap-6">
                    <div>
                      <p className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Actual Distance</p>
                      <p className="text-xs md:text-lg font-black text-primary">{(selectedOrder.actualDistance || 0).toFixed(2)} km</p>
                    </div>
                    <div>
                      <p className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Status</p>
                      <p className="text-xs md:text-lg font-black text-accent uppercase">{selectedOrder.status}</p>
                    </div>
                    <div>
                      <p className="text-[7px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Last Update</p>
                      <p className="text-xs md:text-lg font-black text-primary truncate">{selectedOrder.currentLocation?.timestamp ? new Date(selectedOrder.currentLocation.timestamp).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 md:gap-4">
                    {/* Follow Driver Toggle */}
                    <button 
                      onClick={() => setFollowDriver(!followDriver)}
                      className={`flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-3xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-2xl ${
                        followDriver 
                          ? 'bg-primary text-white shadow-primary/30' 
                          : 'bg-white dark:bg-gray-800 text-gray-400 border border-gray-100 dark:border-gray-700'
                      }`}
                    >
                      <Navigation size={14} className={followDriver ? 'animate-pulse' : ''} />
                      <span className="whitespace-nowrap">{followDriver ? 'Following' : 'Follow'}</span>
                    </button>
                    <button 
                      onClick={handleCompleteTracking}
                      disabled={isUpdating}
                      className="flex-1 md:flex-none px-6 md:px-10 bg-green-600 text-white rounded-xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-2xl hover:bg-green-700 transition-all disabled:opacity-50"
                    >
                      {isUpdating ? <Loader2 className="animate-spin" /> : 'Complete'}
                    </button>
                    <button 
                      onClick={() => setIsTrackingModalOpen(false)}
                      className="px-4 md:px-6 bg-red-500 text-white rounded-xl md:rounded-3xl font-black uppercase tracking-widest text-[8px] md:text-[10px] shadow-2xl hover:bg-red-600 transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatchOrders;
