import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Search, 
  ArrowRight, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  FileDown,
  Loader2,
  Filter,
  User,
  Building2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generatePDFReport } from '../utils/pdfHelper';

const Inventory = () => {
  const { user: currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All'); // All, Shortage, Excess, Exact

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dispatch');
      // Sirf 'Delivered' orders ki inventory banti hai
      const deliveredOrders = res.data.data.filter(o => o.status === 'Delivered');
      setOrders(deliveredOrders);
    } catch (error) {
      console.error('Failed to fetch inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = orders.filter(order => {
    const matchesSearch = 
      order.deliveryNoteNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.assignedVehicle?.plateNumber || order.assignedVehicle?.name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.loadingFrom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.offloadingTo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'All' || order.quantityStatus === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate Stats
  const stats = {
    totalDelivered: orders.length,
    totalShortages: orders.filter(o => o.quantityStatus === 'Shortage').length,
    totalExcess: orders.filter(o => o.quantityStatus === 'Excess').length,
    exactMatches: orders.filter(o => o.quantityStatus === 'Exact').length
  };

  const generateInventoryPDF = async () => {
    try {
      const filename = `Inventory_Report_${new Date().getTime()}.pdf`;
      const columns = ['DN#', 'Client', 'Vehicle', 'Sent Qty', 'Recv Qty', 'Status', 'Diff', 'Date'];
      const tableRows = filteredInventory.map(o => [
        o.deliveryNoteNumber,
        o.customerName || 'N/A',
        o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || 'N/A',
        o.materialQuantity || '0',
        o.receivedQuantity || '0',
        o.quantityStatus,
        o.quantityDifference || '0',
        new Date(o.deliveredDate).toLocaleDateString()
      ]);

      await generatePDFReport("Complete Inventory Report", columns, tableRows, filename);
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white uppercase tracking-tight">
            Inventory Tracking
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor quantity differences and delivery accuracy</p>
        </div>
        <button 
          onClick={generateInventoryPDF}
          className="px-8 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <FileDown size={18} /> Export Inventory PDF
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
              <Package size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Deliveries</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalDelivered}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exact Match</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.exactMatches}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
              <TrendingDown size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shortages (Kam)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalShortages}</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-gray-100 dark:border-gray-800 rounded-3xl bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Excess (Zyada)</p>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalExcess}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="glass-card p-4 flex items-center border border-gray-100 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 shadow-sm flex-1 w-full">
          <Search className="ml-4 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by DN, Vehicle or Client..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border-none focus:ring-0 font-bold text-gray-700 dark:text-white"
          />
        </div>
        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-x-auto w-full md:w-auto">
          {['All', 'Exact', 'Shortage', 'Excess'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${filterType === type ? 'bg-white dark:bg-gray-900 text-primary shadow-sm' : 'text-gray-500'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card overflow-hidden border border-gray-100 dark:border-gray-800 rounded-[2rem] bg-white dark:bg-gray-900 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50">
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="p-6">DN & Vehicle</th>
                <th className="p-6 text-center">Dispatch Qty</th>
                <th className="p-6 text-center">Received Qty</th>
                <th className="p-6 text-center">Status / Diff</th>
                <th className="p-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                <tr><td colSpan="5" className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
              ) : filteredInventory.length === 0 ? (
                <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold uppercase text-[10px]">No Inventory Records Found</td></tr>
              ) : filteredInventory.map((order) => (
                <tr key={order._id} className="transition-all hover:bg-primary/[0.02] dark:hover:bg-primary/[0.04]">
                  <td className="p-6">
                    <div className="font-black text-sm text-gray-900 dark:text-white">{order.deliveryNoteNumber}</div>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                        <Building2 size={10} className="text-primary"/> {order.assignedVehicle?.plateNumber || order.assignedVehicle?.name || 'N/A'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase">
                        <User size={10}/> {order.customerName || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center font-bold text-gray-600 dark:text-gray-400">
                    {order.materialQuantity}
                  </td>
                  <td className="p-6 text-center font-black text-gray-900 dark:text-white">
                    {order.receivedQuantity}
                  </td>
                  <td className="p-6 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                        order.quantityStatus === 'Exact' ? 'bg-green-100 text-green-600' : 
                        order.quantityStatus === 'Shortage' ? 'bg-red-100 text-red-600' : 
                        'bg-amber-100 text-amber-600'
                      }`}>
                        {order.quantityStatus}
                      </span>
                      {order.quantityStatus !== 'Exact' && (
                        <span className="text-[10px] font-bold text-gray-400">Diff: {order.quantityDifference}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    <div className="text-[10px] font-bold text-gray-500 uppercase">
                      {new Date(order.deliveredDate).toLocaleDateString()}
                    </div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase">{order.deliveredTime}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
