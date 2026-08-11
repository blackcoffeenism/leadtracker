import React from 'react';
import { useCRM } from '../context/CRMContext';
import { getInitialsAvatar } from '../utils/avatar';

export const Navbar = () => {
  const { 
    user, 
    activeTab, 
    setActiveTab, 
    notifications, 
    setIsSearchOpen,
    selectedClientId,
    setSelectedClientId
  } = useCRM();

  const userPhoto = user.picture || user.avatar || getInitialsAvatar(user.name);
  const unreadCount = notifications.filter(n => n.unread).length;

  const isSubPage = activeTab === 'client_details';

  return (
    <>
      {/* Mobile Top AppBar */}
      <header className="bg-surface/90 dark:bg-[#191c1e]/90 backdrop-blur-md border-b border-surface-variant/30 dark:border-white/10 shadow-sm top-0 z-50 fixed w-full md:hidden h-16 transition-colors duration-200">
        <div className="flex justify-between items-center px-4 h-full w-full">
          {isSubPage ? (
            <button 
              onClick={() => setActiveTab('clients')}
              className="text-on-surface-variant dark:text-gray-300 hover:bg-surface-container-high dark:hover:bg-white/10 transition-colors p-2 rounded-full flex items-center justify-center"
              aria-label="Back to Clients"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          ) : (
            <div 
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src="/logo.png" alt="LeadFlow CRM Logo" className="w-8 h-8 object-contain drop-shadow-sm" />
              <h1 className="font-headline-md text-base font-bold text-primary dark:text-primary-fixed">
                LeadFlow CRM
              </h1>
            </div>
          )}

          {isSubPage && (
            <div className="font-headline-sm text-headline-sm text-primary dark:text-primary-fixed font-bold">
              Client Details
            </div>
          )}

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-on-surface-variant dark:text-gray-300 hover:bg-surface-container-high dark:hover:bg-white/10 p-2 rounded-full transition-colors"
              aria-label="Search"
            >
              <span className="material-symbols-outlined">search</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="p-1 rounded-full hover:bg-surface-container-high dark:hover:bg-white/10 transition-colors shrink-0"
              title="View Profile Settings"
            >
              <img 
                src={userPhoto} 
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full object-cover border border-primary-container shadow-xs bg-primary-container"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getInitialsAvatar(user.name);
                }}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Web Top Nav (Hidden on Mobile) */}
      <header className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-between items-center px-4 lg:px-8 h-20 bg-surface dark:bg-[#191c1e] shadow-sm border-b border-surface-variant/40 dark:border-white/10 transition-colors duration-200">
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img src="/logo.png" alt="LeadFlow CRM Logo" className="w-10 h-10 object-contain drop-shadow-sm" />
            <span className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed">
              LeadFlow CRM
            </span>
          </div>

          <nav className="flex gap-2 ml-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary-container/10 text-primary dark:text-primary-fixed font-bold'
                  : 'text-on-surface-variant dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                activeTab === 'clients' || activeTab === 'client_details'
                  ? 'bg-primary-container/10 text-primary dark:text-primary-fixed font-bold'
                  : 'text-on-surface-variant dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-white/5'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors flex items-center gap-1 ${
                activeTab === 'add'
                  ? 'bg-primary-container/10 text-primary dark:text-primary-fixed font-bold'
                  : 'text-on-surface-variant dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Client
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-primary-container/10 text-primary dark:text-primary-fixed font-bold'
                  : 'text-on-surface-variant dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-white/5'
              }`}
            >
              Alerts
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs font-bold bg-primary-container text-on-primary rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary-container/10 text-primary dark:text-primary-fixed font-bold'
                  : 'text-on-surface-variant dark:text-gray-300 hover:text-primary dark:hover:text-primary-fixed hover:bg-surface-container-high dark:hover:bg-white/5'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 bg-surface-container-low dark:bg-white/10 px-3 py-1.5 rounded-full text-on-surface-variant dark:text-gray-200 text-sm hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-xl">search</span>
            <span className="hidden lg:inline">Search leads...</span>
            <kbd className="hidden xl:inline-block px-2 py-0.5 text-[10px] font-semibold bg-surface-variant dark:bg-white/20 text-outline dark:text-gray-300 rounded shadow-inner">⌘K</kbd>
          </button>

          <div 
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-3 cursor-pointer p-1.5 px-3 rounded-full hover:bg-surface-container-high dark:hover:bg-white/10 transition-colors border border-surface-variant/40 dark:border-white/10"
            title="View Settings & Profile"
          >
            <img 
              src={userPhoto} 
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border-2 border-primary-container shadow-sm shrink-0 bg-primary-container"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = getInitialsAvatar(user.name);
              }}
            />
            <div className="hidden xl:block text-left pr-1">
              <div className="font-label-lg text-sm text-on-surface dark:text-white font-bold leading-tight">{user.name}</div>
              <div className="text-[11px] text-on-surface-variant dark:text-gray-400 font-medium truncate max-w-[140px]">{user.email}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {!isSubPage && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 dark:bg-[#191c1e]/95 backdrop-blur-lg border-t border-surface-variant/30 dark:border-white/10 shadow-lg md:hidden transition-colors pb-safe">
          <div className="grid grid-cols-5 h-16 items-center px-1 max-w-md mx-auto">
            {/* Dashboard */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex flex-col items-center justify-center h-full w-full py-1 text-center group cursor-pointer"
            >
              <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                activeTab === 'dashboard'
                  ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-fixed shadow-xs'
                  : 'text-on-surface-variant dark:text-gray-400 group-hover:text-on-surface'
              }`}>
                <span className={`material-symbols-outlined text-[20px] transition-transform ${activeTab === 'dashboard' ? 'filled scale-105' : ''}`}>
                  dashboard
                </span>
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                activeTab === 'dashboard' ? 'font-bold text-primary dark:text-primary-fixed' : 'font-medium text-on-surface-variant dark:text-gray-400'
              }`}>
                Dashboard
              </span>
            </button>

            {/* Clients */}
            <button
              onClick={() => setActiveTab('clients')}
              className="flex flex-col items-center justify-center h-full w-full py-1 text-center group cursor-pointer"
            >
              <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                activeTab === 'clients'
                  ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-fixed shadow-xs'
                  : 'text-on-surface-variant dark:text-gray-400 group-hover:text-on-surface'
              }`}>
                <span className={`material-symbols-outlined text-[20px] transition-transform ${activeTab === 'clients' ? 'filled scale-105' : ''}`}>
                  group
                </span>
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                activeTab === 'clients' ? 'font-bold text-primary dark:text-primary-fixed' : 'font-medium text-on-surface-variant dark:text-gray-400'
              }`}>
                Clients
              </span>
            </button>

            {/* Add */}
            <button
              onClick={() => setActiveTab('add')}
              className="flex flex-col items-center justify-center h-full w-full py-1 text-center group cursor-pointer"
            >
              <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                activeTab === 'add'
                  ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-fixed shadow-xs'
                  : 'text-on-surface-variant dark:text-gray-400 group-hover:text-on-surface'
              }`}>
                <span className={`material-symbols-outlined text-[20px] transition-transform ${activeTab === 'add' ? 'filled scale-105' : ''}`}>
                  add_circle
                </span>
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                activeTab === 'add' ? 'font-bold text-primary dark:text-primary-fixed' : 'font-medium text-on-surface-variant dark:text-gray-400'
              }`}>
                Add Lead
              </span>
            </button>

            {/* Alerts */}
            <button
              onClick={() => setActiveTab('alerts')}
              className="flex flex-col items-center justify-center h-full w-full py-1 text-center group cursor-pointer"
            >
              <div className={`relative w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                activeTab === 'alerts'
                  ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-fixed shadow-xs'
                  : 'text-on-surface-variant dark:text-gray-400 group-hover:text-on-surface'
              }`}>
                <span className={`material-symbols-outlined text-[20px] transition-transform ${activeTab === 'alerts' ? 'filled scale-105' : ''}`}>
                  notifications
                </span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface dark:ring-[#191c1e]"></span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                activeTab === 'alerts' ? 'font-bold text-primary dark:text-primary-fixed' : 'font-medium text-on-surface-variant dark:text-gray-400'
              }`}>
                Alerts
              </span>
            </button>

            {/* Settings */}
            <button
              onClick={() => setActiveTab('settings')}
              className="flex flex-col items-center justify-center h-full w-full py-1 text-center group cursor-pointer"
            >
              <div className={`w-12 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                activeTab === 'settings'
                  ? 'bg-primary/15 dark:bg-primary/25 text-primary dark:text-primary-fixed shadow-xs'
                  : 'text-on-surface-variant dark:text-gray-400 group-hover:text-on-surface'
              }`}>
                <span className={`material-symbols-outlined text-[20px] transition-transform ${activeTab === 'settings' ? 'filled scale-105' : ''}`}>
                  settings
                </span>
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 transition-colors ${
                activeTab === 'settings' ? 'font-bold text-primary dark:text-primary-fixed' : 'font-medium text-on-surface-variant dark:text-gray-400'
              }`}>
                Settings
              </span>
            </button>
          </div>
        </nav>
      )}
    </>
  );
};
