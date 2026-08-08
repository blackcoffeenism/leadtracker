import React from 'react';
import { useCRM } from '../context/CRMContext';

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
          </div>
        </div>
      </header>

      {/* Desktop Web Top Nav (Hidden on Mobile) */}
      <header className="hidden md:flex fixed top-0 left-0 w-full z-50 justify-between items-center px-8 h-20 bg-surface dark:bg-[#191c1e] shadow-sm border-b border-surface-variant/40 dark:border-white/10 transition-colors duration-200">
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
            <span>Search leads...</span>
            <kbd className="hidden lg:inline-block px-2 py-0.5 text-[10px] font-semibold bg-surface-variant dark:bg-white/20 text-outline dark:text-gray-300 rounded shadow-inner">⌘K</kbd>
          </button>

          <div 
            onClick={() => setActiveTab('settings')}
            className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-surface-container dark:hover:bg-white/5 transition-colors"
          >
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-container shadow-sm"
            />
            <div className="hidden xl:block text-left pr-2">
              <div className="font-label-lg text-sm text-on-surface dark:text-white font-semibold">{user.name}</div>
              <div className="text-xs text-on-surface-variant dark:text-gray-400">{user.role}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      {!isSubPage && (
        <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 pb-safe bg-surface-container dark:bg-[#191c1e] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] dark:border-t dark:border-white/10 rounded-t-xl md:hidden transition-colors">
          {/* Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 ${
              activeTab === 'dashboard'
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full font-semibold'
                : 'text-on-surface-variant dark:text-outline hover:opacity-80 active:scale-95'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'dashboard' ? 'filled' : ''}`}>dashboard</span>
            <span className="font-label-md text-label-md mt-0.5 text-[11px]">Dashboard</span>
          </button>

          {/* Clients */}
          <button
            onClick={() => setActiveTab('clients')}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 ${
              activeTab === 'clients'
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full font-semibold'
                : 'text-on-surface-variant dark:text-outline hover:opacity-80 active:scale-95'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'clients' ? 'filled' : ''}`}>group</span>
            <span className="font-label-md text-label-md mt-0.5 text-[11px]">Clients</span>
          </button>

          {/* Add */}
          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 ${
              activeTab === 'add'
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full font-semibold'
                : 'text-on-surface-variant dark:text-outline hover:opacity-80 active:scale-95'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'add' ? 'filled' : ''}`}>add</span>
            <span className="font-label-md text-label-md mt-0.5 text-[11px]">Add</span>
          </button>

          {/* Alerts */}
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 relative ${
              activeTab === 'alerts'
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full font-semibold'
                : 'text-on-surface-variant dark:text-outline hover:opacity-80 active:scale-95'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'alerts' ? 'filled' : ''}`}>notifications</span>
            {unreadCount > 0 && activeTab !== 'alerts' && (
              <span className="absolute top-1 right-3 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
            )}
            <span className="font-label-md text-label-md mt-0.5 text-[11px]">Alerts</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 ${
              activeTab === 'settings'
                ? 'bg-secondary-container dark:bg-secondary text-on-secondary-container dark:text-on-secondary rounded-full font-semibold'
                : 'text-on-surface-variant dark:text-outline hover:opacity-80 active:scale-95'
            }`}
          >
            <span className={`material-symbols-outlined ${activeTab === 'settings' ? 'filled' : ''}`}>settings</span>
            <span className="font-label-md text-label-md mt-0.5 text-[11px]">Settings</span>
          </button>
        </nav>
      )}
    </>
  );
};
