import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Globe, 
  Palette, 
  Shield, 
  Building2, 
  Upload,
  Check,
  Save,
  Loader2
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const SettingSection = ({ icon: Icon, title, description, children }) => (
  <div className="glass-card overflow-hidden border border-gray-100 dark:border-gray-800">
    <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-primary dark:text-accent shadow-sm">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-widest">{title}</h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{description}</p>
        </div>
      </div>
      <button className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-primary transition-all">
        Reset to Default
      </button>
    </div>
    <div className="p-8">{children}</div>
  </div>
);

const Settings = () => {
  const { i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-primary dark:text-white mb-2 tracking-tight uppercase">System Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Configure enterprise preferences and portal behavior.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="btn-primary px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Configuration
        </button>
      </div>

      <div className="space-y-8">
        {/* Company Profile */}
        <SettingSection 
          icon={Building2} 
          title="Company Identity" 
          description="Manage corporate branding and public profile"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Organization Name</label>
                <input type="text" className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent" defaultValue="Devzoro Company" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Support Email</label>
                <input type="email" className="w-full px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-accent" defaultValue="devzoro.developers@gmail.com" />
              </div>
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-300 mb-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <Upload size={32} />
              </div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Upload Company Logo</p>
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">SVG, PNG, JPG (MAX. 2MB)</p>
            </div>
          </div>
        </SettingSection>

        {/* Language & Region */}
        <SettingSection 
          icon={Globe} 
          title="Localization" 
          description="Set your preferred language and regional formats"
        >
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => i18n.changeLanguage('en')}
              className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${i18n.language === 'en' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-accent'}`}
            >
              English (US) {i18n.language === 'en' && <Check size={14} />}
            </button>
            <button 
              onClick={() => i18n.changeLanguage('ar')}
              className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${i18n.language === 'ar' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-accent'}`}
            >
              العربية (Saudi) {i18n.language === 'ar' && <Check size={14} />}
            </button>
          </div>
        </SettingSection>

        {/* Theme Preferences */}
        <SettingSection 
          icon={Palette} 
          title="Visual Theme" 
          description="Personalize the portal appearance and colors"
        >
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${theme === 'light' ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-accent'}`}
            >
              Light Mode {theme === 'light' && <Check size={14} />}
            </button>
            <button 
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 border ${theme === 'dark' ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-700 hover:border-accent'}`}
            >
              Dark Mode {theme === 'dark' && <Check size={14} />}
            </button>
          </div>
        </SettingSection>

        {/* Notifications */}
        <SettingSection 
          icon={Bell} 
          title="Notification Center" 
          description="Control how you receive system alerts and updates"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
              <div>
                <p className="text-[10px] font-black text-primary dark:text-white uppercase tracking-widest">Email Alerts</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Receive dispatch updates via email</p>
              </div>
              <div className="w-12 h-6 bg-accent rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute right-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
              <div>
                <p className="text-[10px] font-black text-primary dark:text-white uppercase tracking-widest">Push Notifications</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Real-time desktop alerts for new jobs</p>
              </div>
              <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full relative p-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute left-1"></div>
              </div>
            </div>
          </div>
        </SettingSection>
      </div>
    </div>
  );
};

export default Settings;
