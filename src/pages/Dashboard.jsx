import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Users,
  Loader2,
  FileDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { generatePDFReport } from '../utils/pdfHelper';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
  <div className="glass-card p-6 border border-gray-100 dark:border-gray-800">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
        <Icon size={24} />
      </div>
      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <MoreVertical size={20} />
      </button>
    </div>
    <div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-3xl font-black text-primary dark:text-white tracking-tight">{value}</h3>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black mb-1.5 px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {trendValue}
          </div>
        )}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
  const [stats, setStats] = useState({
    drivers: 0, active: 0, completed: 0, pending: 0, vehicles: 0
  });
  const [pendingVehicleAssignments, setPendingVehicleAssignments] = useState([]);
  const [recentDispatches, setRecentDispatches] = useState([]);
  const [realChartData, setRealChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dRes, oRes, vehRes] = await Promise.all([
        api.get('/drivers'),
        api.get('/dispatch'),
        api.get('/vehicles')
      ]);

      let orders = oRes.data.data;
      
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return { 
            name: days[d.getDay()], 
            dispatches: 0, 
            fullDate: d.toLocaleDateString() 
        };
      }).reverse();

      orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const dayMatch = last7Days.find(day => day.fullDate === orderDate);
        if (dayMatch) {
          dayMatch.dispatches += 1;
        }
      });
      setRealChartData(last7Days);
      
      setStats({
        drivers: dRes.data.count || dRes.data.data?.length || 0,
        active: orders.filter(o => ['Picked Up', 'In Transit'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'Delivered').length,
        pending: orders.filter(o => o.status === 'Pending').length,
        vehicles: vehRes.data.count || vehRes.data.data?.length || 0
      });
      const vehicles = vehRes.data.data || [];
      setPendingVehicleAssignments(
        vehicles
          .filter(v => v.assignmentStatus === 'pending')
          .map(v => ({
            _id: v._id,
            plateNumber: v.plateNumber,
            vehicleType: v.vehicleType,
            pendingDriverName: v.pendingDriver?.fullName
          }))
      );

      // Find driver's own requests if user has a driverProfile
      const myDriverId = user?.driverProfile;
      if (myDriverId) {
        const myVehicleRequests = vehicles
          .filter(v => v.pendingDriver?._id === myDriverId || v.pendingDriver === myDriverId)
          .map(v => ({
            _id: v._id,
            plateNumber: v.plateNumber,
            vehicleType: v.vehicleType,
            status: v.assignmentStatus,
            requestedAt: v.updatedAt
          }));
        
        // Also check vehicles assigned to this driver
        const myAssignedVehicles = vehicles
          .filter(v => v.assignedDriver?._id === myDriverId || v.assignedDriver === myDriverId)
          .map(v => ({
            _id: v._id,
            plateNumber: v.plateNumber,
            vehicleType: v.vehicleType,
            status: 'approved',
            requestedAt: v.updatedAt
          }));
        
        setMyRequests([...myVehicleRequests, ...myAssignedVehicles]);
      }
      
      setRecentDispatches(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVehicleAssignment = async (vehicleId) => {
    try {
      await api.put(`/vehicles/${vehicleId}/approve`);
      await fetchDashboardData();
    } catch (e) {
      alert('Failed to approve assignment');
    }
  };

  const handleRejectVehicleAssignment = async (vehicleId) => {
    try {
      await api.put(`/vehicles/${vehicleId}/reject`);
      await fetchDashboardData();
    } catch (e) {
      alert('Failed to reject assignment');
    }
  };

  const exportPDF = async () => {
    try {
      const columns = ['Metric', 'Current Value', 'Status'];
      const data = [
        ['Total Vehicles', stats.vehicles.toString(), 'Active'],
        ['Total Drivers', stats.drivers.toString(), 'Operational'],
        ['Active Jobs', stats.active.toString(), 'In Transit'],
        ['Completed Orders', stats.completed.toString(), 'Success'],
        ['Pending Orders', stats.pending.toString(), 'Awaiting']
      ];

      await generatePDFReport("Enterprise Dashboard Summary", columns, data, "Dashboard_Summary_Report.pdf");
    } catch (error) {
      console.error(error);
      alert("Failed to export summary");
    }
  };

  const pieData = [
    { name: 'Delivered', value: stats.completed },
    { name: 'Active', value: stats.active },
    { name: 'Pending', value: stats.pending },
  ];

  const COLORS = ['#10B981', '#00C2FF', '#F59E0B'];

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-primary" size={40} />
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Syncing Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">
            {i18n.language === 'ar' ? 'لوحة التحكم' : 'Enterprise Dashboard'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">System overview and real-time dispatch monitoring.</p>
        </div>
        <button 
          onClick={exportPDF}
          className="px-6 py-4 bg-white dark:bg-gray-800 text-primary dark:text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-2 hover:bg-gray-50 transition-all"
        >
          <FileDown size={18} /> Download Summary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Vehicles" value={stats.vehicles} icon={Truck} color="blue" />
        <StatCard title="Total Drivers" value={stats.drivers} icon={Users} color="purple" />
        <StatCard title="Active Jobs" value={stats.active} icon={TrendingUp} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        <StatCard title="Order Pending" value={stats.pending} icon={Clock} color="amber" />
      </div>

      {isAdmin && (
        <div className="glass-card p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Pending Vehicle Approvals</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Driver ↔ vehicle assignment requests</p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest">
              {pendingVehicleAssignments.length} pending
            </span>
          </div>

          {pendingVehicleAssignments.length === 0 ? (
            <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
              No pending approvals
            </div>
          ) : (
            <div className="space-y-3">
              {pendingVehicleAssignments.map((v) => (
                <div key={v._id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-black text-primary dark:text-white uppercase tracking-tight truncate">
                      {v.plateNumber} <span className="text-gray-400 font-bold">({v.vehicleType})</span>
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Requested driver: <span className="text-primary dark:text-white">{v.pendingDriverName || 'N/A'}</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveVehicleAssignment(v._id)}
                      className="px-5 py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectVehicleAssignment(v._id)}
                      className="px-5 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isAdmin && myRequests.length > 0 && (
        <div className="glass-card p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">My Vehicle Assignment Requests</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Your vehicle assignment status</p>
            </div>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[9px] font-black uppercase tracking-widest">
              {myRequests.filter(r => r.status === 'pending').length} pending
            </span>
          </div>

          <div className="space-y-3">
            {myRequests.map((req) => (
              <div key={req._id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white/60 dark:bg-gray-900/40 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black text-primary dark:text-white uppercase tracking-tight truncate">
                    {req.plateNumber} <span className="text-gray-400 font-bold">({req.vehicleType})</span>
                  </p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                    Requested: <span className="text-primary dark:text-white">{new Date(req.requestedAt).toLocaleDateString()}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <span className="px-4 py-2 bg-amber-100 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      Pending Approval
                    </span>
                  )}
                  {req.status === 'approved' && (
                    <span className="px-4 py-2 bg-green-100 text-green-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      Approved - Vehicle Assigned
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Delivery Performance</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Live dispatch volume analytics</p>
            </div>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={realChartData}>
                <defs>
                  <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00C2FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} dy={15} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} 
                />
                <Area type="monotone" dataKey="dispatches" stroke="#00C2FF" strokeWidth={4} fillOpacity={1} fill="url(#colorDisp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest mb-2">Status Analysis</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-10">Real-time status mix</p>
          <div style={{ height: '250px', width: '100%', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-primary dark:text-white">{stats.active + stats.completed + stats.pending}</span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="space-y-4 mt-10">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
                </div>
                <span className="text-xs font-black text-primary dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card p-8 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest mb-8">Recent Live Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="pb-4">Dispatch Note</th>
                <th className="pb-4">Vehicle</th>
                <th className="pb-4">Status</th>
                <th className="pb-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {recentDispatches.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4">
                    <p className="text-xs font-black text-primary dark:text-white uppercase">{order.deliveryNoteNumber}</p>
                    <p className="text-[9px] text-gray-400 font-bold uppercase">{order.materialQuantity}</p>
                  </td>
                  <td className="py-4">
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{order.assignedVehicle?.plateNumber || order.assignedVehicle?.name || 'N/A'}</p>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <p className="text-[9px] font-black text-gray-900 dark:text-white">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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

export default Dashboard;
