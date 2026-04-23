import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  Download, 
  Filter, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Calendar,
  Printer,
  FileDown,
  TrendingUp,
  Truck,
  Building2,
  Users,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { generatePDFReport } from '../utils/pdfHelper';

const ReportCard = ({ title, description, icon: Icon, color, onPDF, loading }) => (
  <div className="glass-card p-8 border border-gray-100 dark:border-gray-800 hover:border-accent/20 transition-all group cursor-pointer">
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 text-${color}-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
      <Icon size={28} />
    </div>
    <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest mb-2">{title}</h3>
    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 leading-relaxed">{description}</p>
    <div className="flex gap-2">
      <button className="flex-1 py-3 bg-gray-50 dark:bg-gray-800 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all flex items-center justify-center gap-2 rounded-xl">
        <Printer size={14} /> Print
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onPDF(); }}
        disabled={loading}
        className="flex-1 py-3 bg-primary/5 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 rounded-xl disabled:opacity-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />} PDF
      </button>
    </div>
  </div>
);

const Reports = () => {
  const { t, i18n } = useTranslation();
  const [loadingReport, setLoadingReport] = useState(null);
  
  // Date Filtering State
  const [filterType, setFilterType] = useState('all'); // 'all', 'range', 'monthly', 'yearly'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const filterDataByDate = (data, dateField = 'createdAt') => {
    if (filterType === 'all') return data;
    
    const filtered = data.filter(item => {
      const itemDate = new Date(item[dateField]);
      if (isNaN(itemDate.getTime())) return true; // Fallback for invalid dates

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

    return filtered;
  };

  const exportVehiclePerformance = async () => {
    try {
      setLoadingReport('vehicle');
      const res = await api.get('/vehicles');
      const vehicles = filterDataByDate(res.data.data);
      
      const columns = ['Vehicle Name', 'Vehicle Type', 'Plate Number', 'Current Driver', 'Assignment Status', 'Created At'];
      const data = vehicles.map(v => [
        v.plateNumber || v.name,
        v.vehicleType || 'N/A',
        v.plateNumber || v.name || 'N/A',
        v.assignedDriver?.name || 'N/A',
        v.assignmentStatus,
        new Date(v.createdAt).toLocaleDateString()
      ]);

      await generatePDFReport("Vehicle Performance Report", columns, data, `Vehicle_Report_${filterType}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
    } finally {
      setLoadingReport(null);
    }
  };

  const exportDriverReports = async () => {
    try {
      setLoadingReport('driver');
      const res = await api.get('/drivers');
      const drivers = filterDataByDate(res.data.data);
      
      const columns = ['Driver Name', 'Iqama Number', 'Phone', 'Vehicle', 'Plate Number', 'Status', 'Created At'];
      const data = drivers.map(d => [
        d.name,
        d.iqamaNumber,
        d.phone,
        d.vehicle?.name || 'N/A',
        d.vehiclePlateNumber || 'N/A',
        d.status || 'Active',
        new Date(d.createdAt).toLocaleDateString()
      ]);

      await generatePDFReport("Driver Trip Report", columns, data, `Driver_Report_${filterType}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
    } finally {
      setLoadingReport(null);
    }
  };

  const exportDispatchVolume = async () => {
    try {
      setLoadingReport('dispatch');
      const res = await api.get('/dispatch');
      const orders = filterDataByDate(res.data.data);
      
      const columns = ['DN Number', 'Vehicle', 'Driver', 'Material', 'Loading', 'Offloading', 'Status', 'Date'];
      const data = orders.map(o => [
        o.deliveryNoteNumber,
        o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || 'N/A',
        o.assignedDriver?.name || 'N/A',
        o.materialQuantity,
        o.loadingFrom,
        o.offloadingTo,
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ]);

      await generatePDFReport("Dispatch Volume Report", columns, data, `Dispatch_Report_${filterType}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
    } finally {
      setLoadingReport(null);
    }
  };

  const exportDelayAnalytics = async () => {
    try {
      setLoadingReport('delay');
      const res = await api.get('/dispatch');
      const filteredOrders = filterDataByDate(res.data.data);
      const orders = filteredOrders.filter(o => o.status !== 'Delivered');
      
      const columns = ['DN Number', 'Vehicle', 'Status', 'Loading From', 'Offloading To', 'Created At'];
      const data = orders.map(o => [
        o.deliveryNoteNumber,
        o.assignedVehicle?.plateNumber || o.assignedVehicle?.name || 'N/A',
        o.status,
        o.loadingFrom,
        o.offloadingTo,
        new Date(o.createdAt).toLocaleDateString()
      ]);

      await generatePDFReport("Delay & Active Analytics Report", columns, data, `Delay_Analytics_${filterType}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Failed to generate report");
    } finally {
      setLoadingReport(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">Intelligence & Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Generate enterprise-level logistics and performance analytics.</p>
        </div>
        
        {/* Advanced Filtering UI */}
        <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            {['all', 'range', 'monthly', 'yearly'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filterType === type ? 'bg-white dark:bg-gray-700 text-primary dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block" />

          {filterType === 'range' && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary"
              />
              <span className="text-gray-400 font-black text-[10px] uppercase">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary"
              />
            </div>
          )}

          {filterType === 'monthly' && (
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary animate-in fade-in slide-in-from-right-4"
            />
          )}

          {filterType === 'yearly' && (
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-[10px] font-bold text-gray-700 dark:text-white focus:ring-primary animate-in fade-in slide-in-from-right-4"
            >
              {[0, 1, 2, 3].map(i => {
                const year = (new Date().getFullYear() - i).toString();
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <ReportCard 
          title="Vehicle Performance" 
          description="Detailed analysis of vehicle types, assignments and current status." 
          icon={Building2} 
          color="blue" 
          onPDF={exportVehiclePerformance}
          loading={loadingReport === 'vehicle'}
        />
        <ReportCard 
          title="Driver Trip Reports" 
          description="Comprehensive log of all driver assignments and completion rates." 
          icon={Truck} 
          color="purple" 
          onPDF={exportDriverReports}
          loading={loadingReport === 'driver'}
        />
        <ReportCard 
          title="Dispatch Volume" 
          description="Monthly and weekly trends of material quantities and delivery notes." 
          icon={BarChart3} 
          color="accent" 
          onPDF={exportDispatchVolume}
          loading={loadingReport === 'dispatch'}
        />
        <ReportCard 
          title="Delay Analytics" 
          description="Identification of bottlenecks and delayed delivery patterns." 
          icon={TrendingUp} 
          color="amber" 
          onPDF={exportDelayAnalytics}
          loading={loadingReport === 'delay'}
        />
      </div>

      <div className="glass-card p-10 border border-gray-100 dark:border-gray-800 bg-primary/5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/20">
              <PieChartIcon size={40} />
            </div>
            <div>
              <h3 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Custom Report Builder</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Select dimensions and metrics for personalized exports.</p>
              {filterType !== 'all' && (
                <div className="mt-2 px-3 py-1 bg-accent/10 text-accent rounded-lg text-[9px] font-black uppercase tracking-widest inline-block">
                  Active Filter: {filterType} ({filterType === 'range' ? `${startDate || 'Any'} to ${endDate || 'Today'}` : filterType === 'monthly' ? selectedMonth : selectedYear})
                </div>
              )}
            </div>
          </div>
          <button 
            onClick={exportDispatchVolume}
            className="px-10 py-5 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
          >
            Configure Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
