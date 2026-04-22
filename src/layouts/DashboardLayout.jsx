// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { 
//   LayoutDashboard, 
//   UploadCloud, 
//   FileText, 
//   Truck, 
//   Users, 
//   Settings, 
//   LogOut, 
//   Menu, 
//   Sun,
//   Moon,
//   Search,
//   Bell,
//   Box,
//   Globe,
//   Layers,
//   ClipboardList
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { motion, AnimatePresence } from 'framer-motion';

// const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
//   <Link
//     to={to}
//     className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//       active 
//         ? 'bg-primary text-white shadow-lg shadow-primary/20' 
//         : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
//     }`}
//   >
//     <Icon size={20} />
//     {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
//   </Link>
// );

// const DashboardLayout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const { darkMode, toggleDarkMode } = useTheme();
//   const { t, i18n } = useTranslation();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const toggleLanguage = () => {
//     const nextLng = i18n.language === 'en' ? 'ar' : 'en';
//     i18n.changeLanguage(nextLng);
//   };

//   // const navLinks = [
//   //   { to: '/', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard' },
//   //   { to: '/vendors', icon: Box, label: i18n.language === 'ar' ? 'الموردين' : 'Vendors' },
//   //   { to: '/drivers', icon: Truck, label: i18n.language === 'ar' ? 'السائقين' : 'Drivers' },
//   //   { to: '/dispatch', icon: ClipboardList, label: i18n.language === 'ar' ? 'أوامر الإرسال' : 'Dispatch Orders' },
//   //   { to: '/vehicles', icon: Layers, label: i18n.language === 'ar' ? 'المركبات' : 'Vehicles' },
//   //   { to: '/reports', icon: FileText, label: i18n.language === 'ar' ? 'التقارير' : 'Reports' },
//   //   ...(user?.role === 'admin' || user?.role === 'super-admin' ? [{ to: '/users', icon: Users, label: i18n.language === 'ar' ? 'المستخدمين' : 'Users' }] : []),
//   //   { to: '/settings', icon: Settings, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings' },
//   // ];

//   const navLinks = [
//   { to: '/', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard', permission: true }, // Sab ke liye
//   { to: '/vendors', icon: Box, label: i18n.language === 'ar' ? 'الموردين' : 'Vendors', permission: user?.permissions?.viewVendors },
//   { to: '/drivers', icon: Truck, label: i18n.language === 'ar' ? 'السائقين' : 'Drivers', permission: user?.permissions?.viewDrivers },
//   { to: '/dispatch', icon: ClipboardList, label: i18n.language === 'ar' ? 'أوامر الإرسال' : 'Dispatch Orders', permission: user?.permissions?.viewVendors || user?.permissions?.createDispatch },
//   { to: '/vehicles', icon: Layers, label: i18n.language === 'ar' ? 'المركبات' : 'Vehicles', permission: user?.permissions?.viewDrivers },
//   { to: '/reports', icon: FileText, label: i18n.language === 'ar' ? 'التقارير' : 'Reports', permission: user?.permissions?.viewReports },
//   { to: '/users', icon: Users, label: i18n.language === 'ar' ? 'المستخدمين' : 'Users', permission: user?.role === 'super-admin' || user?.role === 'admin' },
//   { to: '/settings', icon: Settings, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings', permission: true },
// ];

//   return (
//     <div className="flex min-h-screen bg-light dark:bg-dark" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
//       {/* Sidebar */}
//       <aside 
//         className={`${
//           sidebarCollapsed ? 'w-20' : 'w-64'
//         } hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}
//       >
//         <div className="p-6 flex items-center gap-3">
//           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
//             <Truck size={24} />
//           </div>
//           {!sidebarCollapsed && (
//             <div className="flex flex-col">
//               <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-none">Smart Dispatch</span>
//               <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">Enterprise Portal</span>
//             </div>
//           )}
//         </div>

//         {/* <nav className="flex-1 px-4 space-y-2 mt-4">
//           {navLinks.map((link) => (
//             <SidebarLink 
//               key={link.to}
//               {...link}
//               active={location.pathname === link.to}
//               collapsed={sidebarCollapsed}
//             />
//           ))}
//         </nav> */}

//         <nav className="flex-1 px-4 space-y-2 mt-4">
//   {navLinks.filter(link => {
//     // Agar link by default true hai (Dashboard/Settings) 
//     // YA user admin/super-admin hai 
//     // YA user ke paas specific permission hai
//     return link.permission === true || 
//            user?.role === 'admin' || 
//            user?.role === 'super-admin' || 
//            link.permission === true; 
//   }).map((link) => (
//     <SidebarLink key={link.to} {...link} />
//   ))}
// </nav>

//         <div className="p-4 mt-auto">
//           <button 
//             onClick={handleLogout}
//             className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
//           >
//             <LogOut size={20} />
//             {!sidebarCollapsed && <span className="font-medium">{t('logout')}</span>}
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col min-w-0">
//         {/* Navbar */}
//         <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10">
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
//             >
//               <Menu size={20} />
//             </button>
//             <button 
//               onClick={() => setMobileMenuOpen(true)}
//               className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
//             >
//               <Menu size={20} />
//             </button>
//             <div className="relative hidden sm:flex items-center">
//               <Search className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
//               <input 
//                 type="text" 
//                 placeholder={i18n.language === 'ar' ? 'البحث عن أي شيء...' : 'Search everything...'} 
//                 className={`${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-accent w-64 outline-none text-sm`}
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button 
//               onClick={toggleLanguage}
//               className="flex items-center gap-2 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
//             >
//               <Globe size={20} />
//               <span className="text-sm font-medium uppercase">{i18n.language === 'en' ? 'AR' : 'EN'}</span>
//             </button>
//             <button 
//               onClick={toggleDarkMode}
//               className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
//             >
//               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//             </button>
//             <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 relative">
//               <Bell size={20} />
//               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
//             </button>
//             <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2"></div>
//             <div className="flex items-center gap-3 pl-2">
//               <div className={`text-right hidden sm:block ${i18n.language === 'ar' ? 'ml-3' : ''}`}>
//                 <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
//                 <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-[2px]">
//                 <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
//                   <img 
//                     src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
//                     alt={user?.name} 
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className="p-8 flex-1 overflow-y-auto">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={location.pathname}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.2 }}
//             >
//               {children}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </main>

//       {/* Mobile Sidebar Overlay */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <>
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
//             />
//             <motion.div 
//               initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
//               className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 z-50 md:hidden p-6`}
//             >
//               {/* Mobile Sidebar Content */}
//               <div className="flex items-center justify-between mb-8">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white font-bold">S</div>
//                   <span className="text-xl font-bold tracking-tight text-primary dark:text-white">{t('app_name')}</span>
//                 </div>
//                 <button onClick={() => setMobileMenuOpen(false)}>
//                   <Menu size={24} />
//                 </button>
//               </div>
//               <nav className="space-y-2">
//                 {navLinks.map((link) => (
//                   <SidebarLink 
//                     key={link.to}
//                     {...link}
//                     active={location.pathname === link.to}
//                     onClick={() => setMobileMenuOpen(false)}
//                   />
//                 ))}
//               </nav>
//               <div className="mt-auto pt-8">
//                 <button 
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
//                 >
//                   <LogOut size={20} />
//                   <span className="font-medium">{t('logout')}</span>
//                 </button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DashboardLayout;




// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { 
//   LayoutDashboard, 
//   UploadCloud, 
//   FileText, 
//   Truck, 
//   Users, 
//   Settings, 
//   LogOut, 
//   Menu, 
//   Sun,
//   Moon,
//   Search,
//   Bell,
//   Box,
//   Globe,
//   Layers,
//   ClipboardList
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { motion, AnimatePresence } from 'framer-motion';

// const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
//   <Link
//     to={to}
//     className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//       active 
//         ? 'bg-primary text-white shadow-lg shadow-primary/20' 
//         : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
//     }`}
//   >
//     <Icon size={20} />
//     {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
//   </Link>
// );

// const DashboardLayout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const { darkMode, toggleDarkMode } = useTheme();
//   const { t, i18n } = useTranslation();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const toggleLanguage = () => {
//     const nextLng = i18n.language === 'en' ? 'ar' : 'en';
//     i18n.changeLanguage(nextLng);
//   };

//   const navLinks = [
//     { to: '/', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard', permission: true },
//     { to: '/vendors', icon: Box, label: i18n.language === 'ar' ? 'الموردين' : 'Vendors', permission: user?.permissions?.viewVendors },
//     { to: '/drivers', icon: Truck, label: i18n.language === 'ar' ? 'السائقين' : 'Drivers', permission: user?.permissions?.viewDrivers },
//     { to: '/dispatch', icon: ClipboardList, label: i18n.language === 'ar' ? 'أوامر الإرسال' : 'Dispatch Orders', permission: user?.permissions?.viewVendors || user?.permissions?.createDispatch || user?.permissions?.editDispatch },
//     { to: '/vehicles', icon: Layers, label: i18n.language === 'ar' ? 'المركبات' : 'Vehicles', permission: user?.permissions?.viewDrivers },
//     { to: '/reports', icon: FileText, label: i18n.language === 'ar' ? 'التقارير' : 'Reports', permission: user?.permissions?.viewReports },
//     { to: '/users', icon: Users, label: i18n.language === 'ar' ? 'المستخدمين' : 'Users', permission: user?.role === 'super-admin' || user?.role === 'admin' },
//     { to: '/settings', icon: Settings, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings', permission: true },
//   ];

//   // Filter links once to use in both Desktop and Mobile sidebars
//   const visibleLinks = navLinks.filter(link => {
//     const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
//     return isAdmin || link.permission === true;
//   });

//   return (
//     <div className="flex min-h-screen bg-light dark:bg-dark" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
//       {/* Desktop Sidebar */}
//       <aside 
//         className={`${
//           sidebarCollapsed ? 'w-20' : 'w-64'
//         } hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}
//       >
//         <div className="p-6 flex items-center gap-3">
//           <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
//             <Truck size={24} />
//           </div>
//           {!sidebarCollapsed && (
//             <div className="flex flex-col">
//               <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-none">Smart Dispatch</span>
//               <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">Enterprise Portal</span>
//             </div>
//           )}
//         </div>

//         <nav className="flex-1 px-4 space-y-2 mt-4">
//           {visibleLinks.map((link) => (
//             <SidebarLink 
//               key={link.to}
//               to={link.to}
//               icon={link.icon}
//               label={link.label}
//               active={location.pathname === link.to}
//               collapsed={sidebarCollapsed}
//             />
//           ))}
//         </nav>

//         <div className="p-4 mt-auto">
//           <button 
//             onClick={handleLogout}
//             className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
//           >
//             <LogOut size={20} />
//             {!sidebarCollapsed && <span className="font-medium">{t('logout')}</span>}
//           </button>
//         </div>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col min-w-0">
//         {/* Navbar */}
//         <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10">
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
//             >
//               <Menu size={20} />
//             </button>
//             <button 
//               onClick={() => setMobileMenuOpen(true)}
//               className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
//             >
//               <Menu size={20} />
//             </button>
//             <div className="relative hidden sm:flex items-center">
//               <Search className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
//               <input 
//                 type="text" 
//                 placeholder={i18n.language === 'ar' ? 'البحث عن أي شيء...' : 'Search everything...'} 
//                 className={`${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-accent w-64 outline-none text-sm`}
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button 
//               onClick={toggleLanguage}
//               className="flex items-center gap-2 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
//             >
//               <Globe size={20} />
//               <span className="text-sm font-medium uppercase">{i18n.language === 'en' ? 'AR' : 'EN'}</span>
//             </button>
//             <button 
//               onClick={toggleDarkMode}
//               className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
//             >
//               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//             </button>
//             <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 relative">
//               <Bell size={20} />
//               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
//             </button>
//             <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2"></div>
//             <div className="flex items-center gap-3 pl-2">
//               <div className={`text-right hidden sm:block ${i18n.language === 'ar' ? 'ml-3' : ''}`}>
//                 <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
//                 <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-[2px]">
//                 <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
//                   <img 
//                     src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
//                     alt={user?.name} 
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className="p-8 flex-1 overflow-y-auto">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={location.pathname}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.2 }}
//             >
//               {children}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </main>

//       {/* Mobile Sidebar Overlay */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <>
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
//             />
//             <motion.div 
//               initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
//               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//               className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col border-r border-gray-200 dark:border-gray-800`}
//             >
//               {/* Mobile Sidebar Header - Same Design as Desktop */}
//               <div className="p-6 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
//                     <Truck size={24} />
//                   </div>
//                   <div className="flex flex-col">
//                     <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-none">Smart Dispatch</span>
//                     <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">Enterprise Portal</span>
//                   </div>
//                 </div>
//                 {/* Close Button */}
//                 <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
//                    {/* Using X icon from lucide is better but keeping it simple with Menu or just text if X not imported. 
//                        Since X is not imported, I will use a text 'X' or just rely on outside click. 
//                        Let's just use a simple text icon for close to avoid new imports. */}
//                    <span className="text-xl text-gray-500">&times;</span>
//                 </button>
//               </div>

//               {/* Mobile Nav Links */}
//               <nav className="flex-1 px-4 space-y-2 mt-4">
//                 {visibleLinks.map((link) => (
//                   <SidebarLink 
//                     key={link.to}
//                     to={link.to}
//                     icon={link.icon}
//                     label={link.label}
//                     active={location.pathname === link.to}
//                     collapsed={false}
//                   />
//                 ))}
//               </nav>

//               <div className="p-4 mt-auto">
//                 <button 
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
//                 >
//                   <LogOut size={20} />
//                   <span className="font-medium">{t('logout')}</span>
//                 </button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DashboardLayout;


// import React, { useState } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { 
//   LayoutDashboard, 
//   UploadCloud, 
//   FileText, 
//   Truck, 
//   Users, 
//   Settings, 
//   LogOut, 
//   Menu, 
//   Sun,
//   Moon,
//   Search,
//   Bell,
//   Box,
//   Globe,
//   Layers,
//   ClipboardList
// } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import { useTheme } from '../context/ThemeContext';
// import { motion, AnimatePresence } from 'framer-motion';
// import LogoImage from '../assets/devzoro-1.jpg';

// const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
//   <Link
//     to={to}
//     className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
//       active 
//         ? 'bg-primary text-white shadow-lg shadow-primary/20' 
//         : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
//     }`}
//   >
//     <Icon size={20} />
//     {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
//   </Link>
// );

// const DashboardLayout = ({ children }) => {
//   const { user, logout } = useAuth();
//   const { darkMode, toggleDarkMode } = useTheme();
//   const { t, i18n } = useTranslation();
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const location = useLocation();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const toggleLanguage = () => {
//     const nextLng = i18n.language === 'en' ? 'ar' : 'en';
//     i18n.changeLanguage(nextLng);
//   };

//   const navLinks = [
//     { to: '/', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard', permission: true },
//     { to: '/vendors', icon: Box, label: i18n.language === 'ar' ? 'الموردين' : 'Vendors', permission: user?.permissions?.viewVendors },
//     { to: '/drivers', icon: Truck, label: i18n.language === 'ar' ? 'السائقين' : 'Drivers', permission: user?.permissions?.viewDrivers },
//     { to: '/dispatch', icon: ClipboardList, label: i18n.language === 'ar' ? 'أوامر الإرسال' : 'Dispatch Orders', permission: user?.permissions?.viewVendors || user?.permissions?.createDispatch || user?.permissions?.editDispatch },
//     { to: '/vehicles', icon: Layers, label: i18n.language === 'ar' ? 'المركبات' : 'Vehicles', permission: user?.permissions?.viewDrivers },
//     { to: '/reports', icon: FileText, label: i18n.language === 'ar' ? 'التقارير' : 'Reports', permission: user?.permissions?.viewReports },
//     { to: '/users', icon: Users, label: i18n.language === 'ar' ? 'المستخدمين' : 'Users', permission: user?.role === 'super-admin' || user?.role === 'admin' },
//     { to: '/settings', icon: Settings, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings', permission: true },
//   ];

//   // Filter links once to use in both Desktop and Mobile sidebars
//   const visibleLinks = navLinks.filter(link => {
//     const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
//     return isAdmin || link.permission === true;
//   });

//   return (
//     <div className="flex min-h-screen bg-light dark:bg-dark" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
//       {/* Desktop Sidebar */}
//      <aside 
//   className={`${
//     sidebarCollapsed ? 'w-20' : 'w-64'
//   } hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}
// >
//   {/* Logo Section */}
//   <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
//     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 border border-gray-100 shrink-0">
//       <img 
//         src={LogoImage} 
//         alt="Logo" 
//         className="w-full h-full object-contain" 
//       />
//     </div>
    
//     {!sidebarCollapsed && (
//       <div className="flex flex-col overflow-hidden">
//         <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-none truncate">
//           Devzoro Company
//         </span>
//         <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">
//           Enterprise Portal
//         </span>
//       </div>
//     )}
//   </div>

//   <nav className="flex-1 px-4 space-y-2 mt-4">
//     {visibleLinks.map((link) => (
//       <SidebarLink 
//         key={link.to}
//         to={link.to}
//         icon={link.icon}
//         label={link.label}
//         active={location.pathname === link.to}
//         collapsed={sidebarCollapsed}
//       />
//     ))}
//   </nav>

//   <div className="p-4 mt-auto">
//     <button 
//       onClick={handleLogout}
//       className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all`}
//     >
//       <LogOut size={20} />
//       {!sidebarCollapsed && <span className="font-medium">{t('logout')}</span>}
//     </button>
//   </div>
// </aside>

//       {/* Main Content */}
//       <main className="flex-1 flex flex-col min-w-0">
//         {/* Navbar */}
//         <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10">
//           <div className="flex items-center gap-4">
//             <button 
//               onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
//               className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
//             >
//               <Menu size={20} />
//             </button>
//             <button 
//               onClick={() => setMobileMenuOpen(true)}
//               className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
//             >
//               <Menu size={20} />
//             </button>
//             <div className="relative hidden sm:flex items-center">
//               <Search className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
//               <input 
//                 type="text" 
//                 placeholder={i18n.language === 'ar' ? 'البحث عن أي شيء...' : 'Search everything...'} 
//                 className={`${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-accent w-64 outline-none text-sm`}
//               />
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button 
//               onClick={toggleLanguage}
//               className="flex items-center gap-2 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
//             >
//               <Globe size={20} />
//               <span className="text-sm font-medium uppercase">{i18n.language === 'en' ? 'AR' : 'EN'}</span>
//             </button>
//             <button 
//               onClick={toggleDarkMode}
//               className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
//             >
//               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
//             </button>
//             <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 relative">
//               <Bell size={20} />
//               <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
//             </button>
//             <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2"></div>
//             <div className="flex items-center gap-3 pl-2">
//               <div className={`text-right hidden sm:block ${i18n.language === 'ar' ? 'ml-3' : ''}`}>
//                 <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
//                 <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
//               </div>
//               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-[2px]">
//                 <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
//                   <img 
//                     src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
//                     alt={user?.name} 
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Page Content */}
//         <div className="p-8 flex-1 overflow-y-auto">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={location.pathname}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.2 }}
//             >
//               {children}
//             </motion.div>
//           </AnimatePresence>
//         </div>
//       </main>

//       {/* Mobile Sidebar Overlay */}
//       <AnimatePresence>
//         {mobileMenuOpen && (
//           <>
//             <motion.div 
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setMobileMenuOpen(false)}
//               className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
//             />
//             <motion.div 
//               initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
//               transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//               className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col border-r border-gray-200 dark:border-gray-800`}
//             >
//               {/* Mobile Sidebar Header - Same Design as Desktop */}
//               <div className="p-6 flex items-center justify-between">
//   <div className="flex items-center gap-3">
//     {/* Truck icon ki jagah ab aapka Logo image hai */}
//     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 border border-gray-100">
//       <img 
//         src={LogoImage} 
//         alt="Rajas Gulf Logo" 
//         className="w-full h-full object-contain" 
//       />
//     </div>
    
//     <div className="flex flex-col">
//       <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-none">
//         Devzoro Company
//       </span>
//       <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">
//         Enterprise Portal
//       </span>
//     </div>
//   </div>

//   {/* Close Button */}
//   <button 
//     onClick={() => setMobileMenuOpen(false)} 
//     className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
//   >
//     <span className="text-xl text-gray-500">&times;</span>
//   </button>
// </div>

//               {/* Mobile Nav Links */}
//               <nav className="flex-1 px-4 space-y-2 mt-4">
//                 {visibleLinks.map((link) => (
//                   <SidebarLink 
//                     key={link.to}
//                     to={link.to}
//                     icon={link.icon}
//                     label={link.label}
//                     active={location.pathname === link.to}
//                     collapsed={false}
//                   />
//                 ))}
//               </nav>

//               <div className="p-4 mt-auto">
//                 <button 
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
//                 >
//                   <LogOut size={20} />
//                   <span className="font-medium">{t('logout')}</span>
//                 </button>
//               </div>
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default DashboardLayout;


import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  UploadCloud, 
  FileText, 
  Truck, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  Sun,
  Moon,
  Search,
  Bell,
  Box,
  Globe,
  Layers,
  ClipboardList,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import LogoImage from '../assets/devzoro-1.jpg';

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`}
  >
    <Icon size={20} />
    {!collapsed && <span className="font-medium whitespace-nowrap">{label}</span>}
  </Link>
);

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const { t, i18n } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleLanguage = () => {
    const nextLng = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLng);
  };

  const navLinks = [
    { to: '/', icon: LayoutDashboard, label: i18n.language === 'ar' ? 'لوحة التحكم' : 'Dashboard', permission: true },
    { to: '/vendors', icon: Box, label: i18n.language === 'ar' ? 'الموردين' : 'Vendors', permission: user?.permissions?.viewVendors },
    { to: '/drivers', icon: Truck, label: i18n.language === 'ar' ? 'السائقين' : 'Drivers', permission: user?.permissions?.viewDrivers },
    { to: '/dispatch', icon: ClipboardList, label: i18n.language === 'ar' ? 'أوامر الإرسال' : 'Dispatch Orders', permission: user?.permissions?.viewVendors || user?.permissions?.createDispatch || user?.permissions?.editDispatch },
    { to: '/inventory', icon: Package, label: i18n.language === 'ar' ? 'المخزون' : 'Inventory', permission: true },
    { to: '/vehicles', icon: Layers, label: i18n.language === 'ar' ? 'المركبات' : 'Vehicles', permission: user?.permissions?.viewDrivers },
    { to: '/reports', icon: FileText, label: i18n.language === 'ar' ? 'التقارير' : 'Reports', permission: user?.permissions?.viewReports },
    { to: '/users', icon: Users, label: i18n.language === 'ar' ? 'المستخدمين' : 'Users', permission: user?.role === 'super-admin' || user?.role === 'admin' },
    { to: '/settings', icon: Settings, label: i18n.language === 'ar' ? 'الإعدادات' : 'Settings', permission: true },
  ];

  // Filter links once to use in both Desktop and Mobile sidebars
  const visibleLinks = navLinks.filter(link => {
    const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';
    // link.permission can be true (boolean) or an expression that evaluates to true/false
    return isAdmin || link.permission === true || !!link.permission;
  });

  return (
    <div className="flex min-h-screen bg-light dark:bg-dark" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
 <aside 
  className={`${
    sidebarCollapsed ? 'w-20' : 'w-64'
  } hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300`}
>
  {/* Logo Section */}
  <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 border border-gray-100 shrink-0">
      <img 
        src={LogoImage} 
        alt="Logo" 
        className="w-full h-full object-contain" 
      />
    </div>
    
    {!sidebarCollapsed && (
      <div className="flex flex-col min-w-0">
        <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-tight whitespace-normal">
          Devzoro Company
        </span>
        <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">
          Enterprise Portal
        </span>
      </div>
    )}
  </div>

  <nav className="flex-1 px-4 space-y-2 mt-4">
    {visibleLinks.map((link) => (
      <SidebarLink 
        key={link.to}
        to={link.to}
        icon={link.icon}
        label={link.label}
        active={location.pathname === link.to}
        collapsed={sidebarCollapsed}
      />
    ))}
  </nav>

  <div className="p-4 mt-auto">
    <button 
      onClick={handleLogout}
      className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all`}
    >
      <LogOut size={20} />
      {!sidebarCollapsed && <span className="font-medium">{t('logout')}</span>}
    </button>
  </div>
</aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500"
            >
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:flex items-center">
              <Search className={`absolute ${i18n.language === 'ar' ? 'right-3' : 'left-3'} text-gray-400`} size={18} />
              <input 
                type="text" 
                placeholder={i18n.language === 'ar' ? 'البحث عن أي شيء...' : 'Search everything...'} 
                className={`${i18n.language === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 bg-gray-100 dark:bg-gray-800 border-none rounded-xl focus:ring-2 focus:ring-accent w-64 outline-none text-sm`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
            >
              <Globe size={20} />
              <span className="text-sm font-medium uppercase">{i18n.language === 'en' ? 'AR' : 'EN'}</span>
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className={`text-right hidden sm:block ${i18n.language === 'ar' ? 'ml-3' : ''}`}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent p-[2px]">
                <div className="w-full h-full rounded-[10px] bg-white dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
                    alt={user?.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div 
              initial={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: i18n.language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed inset-y-0 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} w-64 bg-white dark:bg-gray-900 z-50 md:hidden flex flex-col border-r border-gray-200 dark:border-gray-800`}
            >
              {/* Mobile Sidebar Header - Same Design as Desktop */}
              <div className="p-6 flex items-center justify-between">
  <div className="flex items-center gap-3">
    {/* Truck icon ki jagah ab aapka Logo image hai */}
    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary/10 border border-gray-100">
      <img 
        src={LogoImage} 
        alt="Rajas Gulf Logo" 
        className="w-full h-full object-contain" 
      />
    </div>
    
    <div className="flex flex-col">
      <span className="text-sm font-black tracking-tight text-primary dark:text-white uppercase leading-none">
        Devzoro Company
      </span>
      <span className="text-[8px] font-black text-accent uppercase tracking-widest mt-1">
        Enterprise Portal
      </span>
    </div>
  </div>

  {/* Close Button */}
  <button 
    onClick={() => setMobileMenuOpen(false)} 
    className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
  >
    <span className="text-xl text-gray-500">&times;</span>
  </button>
</div>

              {/* Mobile Nav Links */}
              <nav className="flex-1 px-4 space-y-2 mt-4">
                {visibleLinks.map((link) => (
                  <SidebarLink 
                    key={link.to}
                    to={link.to}
                    icon={link.icon}
                    label={link.label}
                    active={location.pathname === link.to}
                    collapsed={false}
                  />
                ))}
              </nav>

              <div className="p-4 mt-auto">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-medium">{t('logout')}</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;