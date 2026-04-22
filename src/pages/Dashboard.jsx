// import React, { useState, useEffect } from 'react';
// import { useTranslation } from 'react-i18next';
// import { 
//   BarChart, 
//   Bar, 
//   XAxis, 
//   YAxis, 
//   CartesianGrid, 
//   Tooltip, 
//   ResponsiveContainer, 
//   AreaChart, 
//   Area,
//   PieChart,
//   Pie,
//   Cell
// } from 'recharts';
// import { 
//   TrendingUp, 
//   Clock, 
//   CheckCircle2, 
//   Truck, 
//   ArrowUpRight,
//   ArrowDownRight,
//   MoreVertical,
//   Building2,
//   Package,
//   MapPin,
//   ChevronRight
// } from 'lucide-react';
// import api from '../services/api';

// const StatCard = ({ title, value, icon: Icon, color, trend, trendValue }) => (
//   <div className="glass-card p-6 border border-gray-100 dark:border-gray-800">
//     <div className="flex justify-between items-start mb-4">
//       <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-500`}>
//         <Icon size={24} />
//       </div>
//       <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
//         <MoreVertical size={20} />
//       </button>
//     </div>
//     <div>
//       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
//       <div className="flex items-end gap-3">
//         <h3 className="text-3xl font-black text-primary dark:text-white tracking-tight">{value}</h3>
//         {trend && (
//           <div className={`flex items-center gap-1 text-[10px] font-black mb-1.5 px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
//             {trend === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
//             {trendValue}
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// );

// const Dashboard = () => {
//   const { t, i18n } = useTranslation();
//   const [stats, setStats] = useState({
//     vendors: 0,
//     drivers: 0,
//     active: 0,
//     completed: 0,
//     pending: 0,
//     vehicles: 0
//   });
//   const [recentDispatches, setRecentDispatches] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       const [vRes, dRes, oRes, vehRes] = await Promise.all([
//         api.get('/vendors'),
//         api.get('/drivers'),
//         api.get('/dispatch'),
//         api.get('/vehicles')
//       ]);

//       const orders = oRes.data.data;
//       setStats({
//         vendors: vRes.data.count,
//         drivers: dRes.data.count,
//         active: orders.filter(o => ['Picked Up', 'In Transit'].includes(o.status)).length,
//         completed: orders.filter(o => o.status === 'Delivered').length,
//         pending: orders.filter(o => o.status === 'Pending').length,
//         vehicles: vehRes.data.count
//       });
//       setRecentDispatches(orders.slice(0, 5));
//     } catch (error) {
//       console.error('Failed to fetch dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const chartData = [
//     { name: 'Mon', dispatches: 12 },
//     { name: 'Tue', dispatches: 19 },
//     { name: 'Wed', dispatches: 15 },
//     { name: 'Thu', dispatches: 22 },
//     { name: 'Fri', dispatches: 30 },
//     { name: 'Sat', dispatches: 10 },
//     { name: 'Sun', dispatches: 8 },
//   ];

//   const pieData = [
//     { name: 'Delivered', value: stats.completed },
//     { name: 'Active', value: stats.active },
//     { name: 'Pending', value: stats.pending },
//   ];

//   const COLORS = ['#00C2FF', '#06264D', '#F1F5F9'];

//   return (
//     <div className="space-y-8 pb-20">
//       <div className="flex justify-between items-end">
//         <div>
//           <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">
//             {i18n.language === 'ar' ? 'لوحة التحكم' : 'Enterprise Dashboard'}
//           </h1>
//           <p className="text-gray-500 dark:text-gray-400 font-medium">
//             {i18n.language === 'ar' 
//               ? 'مرحباً بعودتك! إليك ملخص لعمليات الإرسال اليوم.' 
//               : "System overview and real-time dispatch monitoring."}
//           </p>
//         </div>
//         <div className="hidden md:flex gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
//           <Clock size={14} className="text-accent" />
//           Last Updated: Just Now
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
//         <StatCard title="Total Vendors" value={stats.vendors} icon={Building2} color="blue" trend="up" trendValue="+2" />
//         <StatCard title="Total Drivers" value={stats.drivers} icon={Truck} color="purple" trend="up" trendValue="+5" />
//         <StatCard title="Active Jobs" value={stats.active} icon={TrendingUp} color="accent" />
//         <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" trend="up" trendValue="+12%" />
//         <StatCard title="Pending" value={stats.pending} icon={Clock} color="amber" />
//         <StatCard title="Vehicles" value={stats.vehicles} icon={Package} color="blue" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Chart */}
//         <div className="lg:col-span-2 glass-card p-8 border border-gray-100 dark:border-gray-800">
//           <div className="flex justify-between items-center mb-10">
//             <div>
//               <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Delivery Performance</h3>
//               <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Weekly dispatch volume analytics</p>
//             </div>
//             <select className="bg-gray-50 dark:bg-gray-800 border-none text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none cursor-pointer">
//               <option>Last 7 Days</option>
//               <option>Last 30 Days</option>
//             </select>
//           </div>
//           <div className="h-[350px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={chartData}>
//                 <defs>
//                   <linearGradient id="colorDisp" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#00C2FF" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                 <XAxis 
//                   dataKey="name" 
//                   axisLine={false} 
//                   tickLine={false} 
//                   tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
//                   dy={15}
//                 />
//                 <YAxis 
//                   axisLine={false} 
//                   tickLine={false} 
//                   tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 700}} 
//                 />
//                 <Tooltip 
//                   contentStyle={{ 
//                     backgroundColor: '#fff', 
//                     borderRadius: '16px', 
//                     border: 'none', 
//                     boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
//                   }} 
//                 />
//                 <Area 
//                   type="monotone" 
//                   dataKey="dispatches" 
//                   stroke="#00C2FF" 
//                   strokeWidth={4} 
//                   fillOpacity={1} 
//                   fill="url(#colorDisp)" 
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Status Analysis */}
//         <div className="glass-card p-8 border border-gray-100 dark:border-gray-800">
//           <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest mb-2">Status Analysis</h3>
//           <p className="text-[10px] text-gray-400 font-bold uppercase mb-10">Dispatch distribution by status</p>
//           <div className="h-[250px] relative">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={pieData}
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={70}
//                   outerRadius={90}
//                   paddingAngle={8}
//                   dataKey="value"
//                 >
//                   {pieData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
//               <span className="text-2xl font-black text-primary dark:text-white">{stats.active + stats.completed + stats.pending}</span>
//               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Total Jobs</span>
//             </div>
//           </div>
//           <div className="space-y-4 mt-10">
//             {pieData.map((item, index) => (
//               <div key={item.name} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50">
//                 <div className="flex items-center gap-3">
//                   <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index]}}></div>
//                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.name}</span>
//                 </div>
//                 <span className="text-xs font-black text-primary dark:text-white">{item.value}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Live Tracking / Recent Activity */}
//       <div className="glass-card p-8 border border-gray-100 dark:border-gray-800">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Live Dispatch Monitor</h3>
//             <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Real-time tracking of active deliveries</p>
//           </div>
//           <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline flex items-center gap-1">
//             View All <ChevronRight size={14} />
//           </button>
//         </div>
        
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 dark:border-gray-800">
//                 <th className="pb-4 pr-4">Order Details</th>
//                 <th className="pb-4 px-4">Logistics Partner</th>
//                 <th className="pb-4 px-4">Route</th>
//                 <th className="pb-4 px-4">Status</th>
//                 <th className="pb-4 pl-4 text-right">Timeline</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
//               {recentDispatches.map((order) => (
//                 <tr key={order._id} className="group transition-all">
//                   <td className="py-5 pr-4">
//                     <div className="flex items-center gap-3">
//                       <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
//                         <Package size={18} />
//                       </div>
//                       <div>
//                         <p className="text-xs font-black text-primary dark:text-white uppercase">{order.deliveryNoteNumber}</p>
//                         <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{order.materialQuantity}</p>
//                       </div>
//                     </div>
//                   </td>
//                   <td className="py-5 px-4">
//                     <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{order.assignedVendor?.name}</p>
//                     <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{order.assignedDriver?.name}</p>
//                   </td>
//                   <td className="py-5 px-4">
//                     <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
//                       <MapPin size={12} className="text-accent" />
//                       <span className="truncate max-w-[120px]">{order.loadingFrom}</span>
//                     </div>
//                   </td>
//                   <td className="py-5 px-4">
//                     <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
//                       order.status === 'Delivered' ? 'bg-green-50 text-green-500' : 
//                       order.status === 'Pending' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
//                     }`}>
//                       {order.status}
//                     </span>
//                   </td>
//                   <td className="py-5 pl-4 text-right">
//                     <p className="text-[10px] font-black text-gray-900 dark:text-white uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
//                     <p className="text-[9px] text-gray-400 font-bold uppercase mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;



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
  Building2,
  Package,
  MapPin,
  ChevronRight,
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
  const [stats, setStats] = useState({
    vendors: 0, drivers: 0, active: 0, completed: 0, pending: 0, vehicles: 0
  });
  const [recentDispatches, setRecentDispatches] = useState([]);
  const [realChartData, setRealChartData] = useState([]); // <--- Dynamic Chart State
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [vRes, dRes, oRes, vehRes] = await Promise.all([
        api.get('/vendors'),
        api.get('/drivers'),
        api.get('/dispatch'),
        api.get('/vehicles')
      ]);

      let orders = oRes.data.data;
      
      // --- Logic for Real Chart Data (Weekly Grouping) ---
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
        vendors: vRes.data.count || vRes.data.data?.length || 0,
        drivers: dRes.data.count || dRes.data.data?.length || 0,
        active: orders.filter(o => ['Picked Up', 'In Transit'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'Delivered').length,
        pending: orders.filter(o => o.status === 'Pending').length,
        vehicles: vehRes.data.count || vehRes.data.data?.length || 0
      });
      setRecentDispatches(orders.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    try {
      const columns = ['Metric', 'Current Value', 'Status'];
      const data = [
        ['Total Vendors', stats.vendors.toString(), 'Operational'],
        ['Total Drivers', stats.drivers.toString(), 'Operational'],
        ['Active Jobs', stats.active.toString(), 'In Transit'],
        ['Completed Orders', stats.completed.toString(), 'Success'],
        ['Pending Orders', stats.pending.toString(), 'Awaiting'],
        ['Fleet Vehicles', stats.vehicles.toString(), 'Active']
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Vendors" value={stats.vendors} icon={Building2} color="blue" />
        <StatCard title="Total Drivers" value={stats.drivers} icon={Truck} color="purple" />
        <StatCard title="Active Jobs" value={stats.active} icon={TrendingUp} color="blue" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        <StatCard title="Order Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard title="Vehicles" value={stats.vehicles} icon={Package} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart with REAL DATA */}
        <div className="lg:col-span-2 glass-card p-8 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">Delivery Performance</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Live dispatch volume analytics</p>
            </div>
          </div>
          <div className="h-[350px]">
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

        {/* Status Analysis (Pie Chart) */}
        <div className="glass-card p-8 border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest mb-2">Status Analysis</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-10">Real-time status mix</p>
          <div className="h-[250px] relative">
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

      {/* Live Table */}
      <div className="glass-card p-8 border border-gray-100 dark:border-gray-800 overflow-hidden">
        <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest mb-8">Recent Live Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-gray-800">
                <th className="pb-4">Dispatch Note</th>
                <th className="pb-4">Partner</th>
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
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{order.assignedVendor?.name || 'N/A'}</p>
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