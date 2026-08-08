import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { EditProfileModal } from '../components/EditProfileModal';
import { NotificationPreferencesModal } from '../components/NotificationPreferencesModal';
import { InfoModal } from '../components/InfoModal';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? "http://localhost:5050" : window.location.origin);

export const SettingsView = () => {
  const { user, isDarkMode, toggleDarkMode, logout } = useCRM();

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNotifPrefOpen, setIsNotifPrefOpen] = useState(false);
  const [infoModalType, setInfoModalType] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  
  const [allowedAccounts, setAllowedAccounts] = useState([]);
  const [appsScriptUrl, setAppsScriptUrl] = useState('');
  const [appsScriptMsg, setAppsScriptMsg] = useState('');

  // Load dynamic accounts & Apps Script URL from backend API
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/settings/share-accounts`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.accounts) setAllowedAccounts(data.accounts);
      })
      .catch(err => console.warn("Share list load warning:", err));

    fetch(`${BACKEND_URL}/api/settings/apps-script`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.appsScriptUrl) setAppsScriptUrl(data.appsScriptUrl);
      })
      .catch(err => console.warn("Apps Script URL load warning:", err));
  }, []);

  const handleSaveAppsScriptUrl = (e) => {
    e.preventDefault();
    setAppsScriptMsg('');
    fetch(`${BACKEND_URL}/api/settings/apps-script`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: appsScriptUrl })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setAppsScriptMsg("Google Apps Script Web App API URL saved!");
      } else {
        setAppsScriptMsg(data.error || "Failed to save Apps Script URL.");
      }
    })
    .catch(err => setAppsScriptMsg("Error communicating with backend API."));
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <main className="flex-grow px-4 sm:px-6 pt-20 md:pt-28 pb-28 sm:pb-32 max-w-2xl mx-auto w-full animate-in fade-in duration-200">
      {/* Profile Card */}
      <section className="mb-lg">
        <div className="bg-surface-container-lowest dark:bg-[#1e2225] rounded-xl border border-surface-variant dark:border-white/10 p-lg flex flex-col items-center text-center shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="w-24 h-24 mb-md relative">
            <img 
              className="w-full h-full rounded-full object-cover shadow-sm ring-2 ring-primary/20" 
              src={user.avatar} 
              alt={user.name} 
            />
            <button 
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute bottom-0 right-0 bg-primary-container text-on-primary rounded-full p-1.5 shadow-sm hover:opacity-90 transition-opacity"
              title="Edit Profile"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-white mb-xs font-bold">{user.name}</h2>
          <p className="font-body-md text-body-md text-on-surface-variant dark:text-gray-400">{user.email}</p>
          <span className="mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-container/10 text-primary dark:text-primary-fixed">
            {user.role}
          </span>
        </div>
      </section>

      {/* Settings List */}
      <section className="flex flex-col gap-sm">
        {/* Profile */}
        <button 
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 hover:bg-surface-container dark:hover:bg-white/5 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left"
        >
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-outline dark:text-gray-400">person</span>
            <span className="font-label-lg text-label-lg font-medium">Profile</span>
          </div>
          <span className="material-symbols-outlined text-outline dark:text-gray-400">chevron_right</span>
        </button>

        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-outline dark:text-gray-400">dark_mode</span>
            <span className="font-label-lg text-label-lg font-medium">Dark Mode</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={isDarkMode}
              onChange={toggleDarkMode}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-surface-variant dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
          </label>
        </div>

        {/* Master Registry Connected Status */}
        <div className="flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">table_chart</span>
            <div>
              <span className="font-label-lg text-label-lg font-medium block">Master Registry Sync</span>
              <span className="text-[11px] text-on-surface-variant dark:text-gray-400">Program 1 Web URL connected via Master Spreadsheet</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Connected
          </span>
        </div>

        {/* Notification Settings */}
        <button 
          onClick={() => setIsNotifPrefOpen(true)}
          className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 hover:bg-surface-container dark:hover:bg-white/5 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left"
        >
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-outline dark:text-gray-400">notifications</span>
            <span className="font-label-lg text-label-lg font-medium">Notification Settings</span>
          </div>
          <span className="material-symbols-outlined text-outline dark:text-gray-400">chevron_right</span>
        </button>

        {/* About */}
        <button 
          onClick={() => setInfoModalType('about')}
          className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 hover:bg-surface-container dark:hover:bg-white/5 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left"
        >
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-outline dark:text-gray-400">info</span>
            <span className="font-label-lg text-label-lg font-medium">About</span>
          </div>
          <span className="material-symbols-outlined text-outline dark:text-gray-400">chevron_right</span>
        </button>

        {/* Privacy Policy */}
        <button 
          onClick={() => setInfoModalType('privacy')}
          className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 hover:bg-surface-container dark:hover:bg-white/5 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left"
        >
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-outline dark:text-gray-400">policy</span>
            <span className="font-label-lg text-label-lg font-medium">Privacy Policy</span>
          </div>
          <span className="material-symbols-outlined text-outline dark:text-gray-400">chevron_right</span>
        </button>

        {/* Terms of Service */}
        <button 
          onClick={() => setInfoModalType('terms')}
          className="w-full flex items-center justify-between p-md bg-surface-container-lowest dark:bg-[#1e2225] rounded-lg border border-surface-variant dark:border-white/10 hover:bg-surface-container dark:hover:bg-white/5 transition-colors shadow-[0_4px_12px_rgba(0,0,0,0.04)] text-left"
        >
          <div className="flex items-center gap-md text-on-surface dark:text-gray-200">
            <span className="material-symbols-outlined text-outline dark:text-gray-400">description</span>
            <span className="font-label-lg text-label-lg font-medium">Terms of Service</span>
          </div>
          <span className="material-symbols-outlined text-outline dark:text-gray-400">chevron_right</span>
        </button>
      </section>

      {/* App Version */}
      <div className="text-center mt-lg mb-xl">
        <span className="font-body-md text-body-md text-outline">App Version 1.0</span>
      </div>

      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-sm p-md bg-error-container/60 dark:bg-error-container/30 rounded-lg border border-error/20 text-error dark:text-red-400 font-button text-button hover:bg-error-container transition-colors shadow-sm cursor-pointer"
      >
        <span className="material-symbols-outlined">logout</span>
        Logout
      </button>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
      />
      
      <NotificationPreferencesModal 
        isOpen={isNotifPrefOpen} 
        onClose={() => setIsNotifPrefOpen(false)} 
      />

      <InfoModal 
        type={infoModalType} 
        isOpen={!!infoModalType} 
        onClose={() => setInfoModalType(null)} 
      />

    </main>
  );
};
