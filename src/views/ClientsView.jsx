import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';

export const ClientsView = () => {
  const { 
    clients, 
    viewClientDetails, 
    setActiveTab, 
    syncGoogleSheet, 
    isSyncingSheet, 
    sheetSyncStatus 
  } = useCRM();

  const [activeFilter, setActiveFilter] = useState('All');
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [customSheetUrl, setCustomSheetUrl] = useState("https://docs.google.com/spreadsheets/d/1qTmp6AdRoqdOxYS4LwTb1zg9T1gRapDCyqfU5i42ZFY/edit?usp=sharing");

  const filters = ['All', 'Hot Lead', 'Warm Lead', 'Cold Lead', 'Closed Deal'];

  const filteredClients = clients.filter(c => {
    const matchesFilter = activeFilter === 'All' || c.status === activeFilter;
    const query = filterQuery.toLowerCase();
    const matchesQuery = (c.name || '').toLowerCase().includes(query) ||
                         (c.email || '').toLowerCase().includes(query) ||
                         (c.location || c.address || '').toLowerCase().includes(query) ||
                         (c.agent || '').toLowerCase().includes(query) ||
                         (c.mobileNumber || c.phone || '').toLowerCase().includes(query) ||
                         (c.remarks || c.notes || '').toLowerCase().includes(query);
    return matchesFilter && matchesQuery;
  }).sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'agent') return (a.agent || '').localeCompare(b.agent || '');
    return 0;
  });

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Hot Lead':
        return 'bg-[#dcfce7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300';
      case 'Warm Lead':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
      case 'Closed Deal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';
      case 'Cold Lead':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const handleSyncSubmit = (e) => {
    e.preventDefault();
    syncGoogleSheet(customSheetUrl);
    setShowSyncModal(false);
  };

  return (
    <main className="pt-20 md:pt-28 px-4 sm:px-6 max-w-5xl mx-auto flex flex-col gap-md sm:gap-lg pb-28 sm:pb-32 animate-in fade-in duration-200">
      {/* Title & Top Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface font-bold flex items-center gap-2">
            Clients & Leads
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">table_chart</span>
              Google Sheets Synced
            </span>
          </h1>
          <p className="text-xs text-on-surface-variant">
            Live leads loaded with <strong>Name, Mobile Number, Email, Location, Lead Status, Remarks, and Agent</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => syncGoogleSheet(customSheetUrl)}
            disabled={isSyncingSheet}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-4 py-2 font-button text-button flex items-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-50"
            title="Sync with Google Sheets"
          >
            <span className={`material-symbols-outlined text-[20px] ${isSyncingSheet ? 'animate-spin' : ''}`}>
              {isSyncingSheet ? 'refresh' : 'sync'}
            </span>
            {isSyncingSheet ? 'Syncing...' : 'Sync Sheet'}
          </button>

          <button
            onClick={() => setActiveTab('add')}
            className="bg-primary-container text-on-primary rounded-lg px-4 py-2 font-button text-button flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">person_add</span>
            Add Lead
          </button>
        </div>
      </div>

      {/* Sheet Sync Notification / Feedback Banner */}
      {sheetSyncStatus && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
          sheetSyncStatus.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 text-emerald-900 dark:text-emerald-200' :
          sheetSyncStatus.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-300 text-amber-900 dark:text-amber-200' :
          'bg-blue-50 dark:bg-blue-950/80 border-blue-300 text-blue-900 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base shrink-0">
              {sheetSyncStatus.type === 'success' ? 'check_circle' : 'info'}
            </span>
            <span>{sheetSyncStatus.message}</span>
          </div>
          <button 
            onClick={() => setShowSyncModal(true)}
            className="underline font-bold text-xs shrink-0 hover:opacity-80"
          >
            Configure Sheet Link
          </button>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col gap-md">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
            <input
              type="text"
              placeholder="Search by name, agent, email, location..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface dark:bg-[#1e2225] border border-surface-variant dark:border-white/10 rounded-lg text-sm outline-none focus:border-primary text-on-surface dark:text-white"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-on-surface-variant dark:text-gray-400 font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-surface dark:bg-[#1e2225] border border-surface-variant dark:border-white/10 rounded-lg text-xs font-semibold outline-none text-on-surface dark:text-white"
            >
              <option value="newest">Recent First</option>
              <option value="name">Name (A-Z)</option>
              <option value="agent">Agent Name</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-primary-container text-on-primary shadow-sm'
                  : 'bg-surface dark:bg-[#1e2225] border border-surface-variant dark:border-white/10 text-on-surface-variant dark:text-gray-300 hover:bg-surface-container'
              }`}
            >
              {filter}
              <span className="ml-1 opacity-70">
                ({filter === 'All' ? clients.length : clients.filter(c => c.status === filter).length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Client List Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-surface dark:bg-[#1e2225] border border-surface-variant dark:border-white/10 rounded-xl p-xl text-center text-on-surface-variant my-8">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">person_search</span>
          <p className="font-semibold text-base">No leads found matching your search criteria.</p>
          <button
            onClick={() => { setActiveFilter('All'); setFilterQuery(''); }}
            className="mt-3 text-xs text-primary font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {filteredClients.map(client => (
            <div
              key={client.id}
              className="bg-surface dark:bg-[#1e2225] rounded-xl border border-surface-variant dark:border-white/10 p-md flex flex-col justify-between hover:border-primary/50 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.04)] group"
            >
              <div>
                {/* Header: Avatar, Name, Agent & Lead Status */}
                <div className="flex items-start justify-between gap-3 mb-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-primary-container/10 border border-surface-variant flex items-center justify-center text-primary dark:text-primary-fixed shrink-0">
                      <span className="material-symbols-outlined text-xl">person</span>
                    </span>
                    <div>
                      <h3 
                        onClick={() => viewClientDetails(client.id)}
                        className="font-headline-sm text-base font-bold text-on-surface dark:text-white group-hover:text-primary transition-colors cursor-pointer"
                      >
                        {client.name}
                      </h3>
                      <p className="text-xs text-primary dark:text-primary-fixed font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">badge</span>
                        Agent: {client.agent || "Unassigned"}
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full font-label-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(client.status)}`}>
                    {client.status}
                  </span>
                </div>

                {/* 7 Columns Data Display */}
                <div className="space-y-1.5 py-2.5 border-t border-b border-surface-variant/40 text-xs text-on-surface-variant my-2 bg-surface-container-lowest/50 dark:bg-white/5 p-2.5 rounded-lg">
                  {/* Mobile Number */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-outline dark:text-gray-400">
                      <span className="material-symbols-outlined text-xs">call</span> Mobile:
                    </span>
                    <span className="font-semibold text-on-surface dark:text-white">{client.mobileNumber || client.phone || "—"}</span>
                  </div>

                  {/* Email */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-outline dark:text-gray-400">
                      <span className="material-symbols-outlined text-xs">mail</span> Email:
                    </span>
                    <span className="truncate max-w-[190px] font-medium text-on-surface dark:text-gray-200">{client.email || "—"}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-outline dark:text-gray-400">
                      <span className="material-symbols-outlined text-xs">location_on</span> Location:
                    </span>
                    <span className="font-medium text-on-surface dark:text-gray-200">{client.location || client.address || "—"}</span>
                  </div>

                  {/* Remarks */}
                  <div className="pt-1 mt-1 border-t border-surface-variant/20 dark:border-white/10">
                    <span className="block text-[11px] font-semibold text-outline dark:text-gray-400 mb-0.5">
                      Remarks:
                    </span>
                    <p className="text-xs text-on-surface dark:text-gray-300 italic line-clamp-2">
                      {client.remarks || client.notes ? `"${client.remarks || client.notes}"` : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-outline font-medium">Assigned to {client.agent || "Agent"}</span>
                <div className="flex items-center gap-2">
                  <a 
                    href={`tel:${client.mobileNumber || client.phone}`}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full" 
                    title="Call Mobile"
                  >
                    <span className="material-symbols-outlined text-lg">call</span>
                  </a>
                  <a 
                    href={`mailto:${client.email}`}
                    className="p-1.5 text-on-surface-variant hover:bg-surface-container rounded-full" 
                    title="Email Lead"
                  >
                    <span className="material-symbols-outlined text-lg">mail</span>
                  </a>
                  <button
                    onClick={() => viewClientDetails(client.id)}
                    className="flex items-center gap-1 text-xs font-semibold text-primary dark:text-primary-fixed hover:underline px-2 py-1 bg-primary-container/10 rounded-lg"
                  >
                    View Details
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sync Google Sheet Link Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#1e2225] border border-surface-variant dark:border-white/10 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-surface-variant dark:border-white/10 pb-3">
              <h3 className="font-bold text-lg text-on-surface dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600">table_chart</span>
                Google Sheets Integration
              </h3>
              <button 
                onClick={() => setShowSyncModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant dark:text-gray-300">
              Enter your Google Sheet URL containing columns: <strong>Name, Mobile Number, Email, Location, Lead Status, Remarks, and Agent</strong>.
            </p>

            <form onSubmit={handleSyncSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-gray-200 mb-1">
                  Google Sheet URL / Link
                </label>
                <input 
                  type="url"
                  required
                  value={customSheetUrl}
                  onChange={(e) => setCustomSheetUrl(e.target.value)}
                  className="w-full p-3 bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-xl text-xs font-mono outline-none focus:border-primary text-on-surface dark:text-white"
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-xl text-[11px] text-blue-900 dark:text-blue-200 space-y-1">
                <p className="font-bold">Google Sheet Share Permission Requirement:</p>
                <p>In Google Sheets, click <strong>Share</strong> (top right) and set access to <strong>"Anyone with the link can view"</strong> so the app can pull your live data.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-on-surface-variant hover:bg-surface-container rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSyncingSheet}
                  className="px-5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">sync</span>
                  Sync Sheet Data Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};
