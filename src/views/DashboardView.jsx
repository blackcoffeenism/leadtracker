import React from 'react';
import { useCRM } from '../context/CRMContext';

export const DashboardView = () => {
  const { clients, user, viewClientDetails, setActiveTab, setIsSearchOpen } = useCRM();

  const hotLeads = clients.filter(c => c.status === 'Hot Lead');
  const warmLeads = clients.filter(c => c.status === 'Warm Lead');
  const closedDeals = clients.filter(c => c.status === 'Closed Deal');

  return (
    <main className="pt-20 md:pt-28 px-margin-mobile max-w-5xl mx-auto flex flex-col gap-lg pb-32 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/90 to-secondary p-lg rounded-2xl text-on-primary shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary-fixed text-xs uppercase tracking-wider font-bold mb-1">
            <span className="material-symbols-outlined text-sm">waving_hand</span> Welcome Back
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold">
            Good day, {user.name.split(' ')[0]}!
          </h1>
          <p className="font-body-md text-sm text-primary-fixed/90 mt-1 max-w-xl">
            You have <strong className="text-white font-bold">{hotLeads.length} hot leads</strong> requiring follow-ups today. Keep up the high deal velocity!
          </p>
        </div>

        <button
          onClick={() => setActiveTab('add')}
          className="bg-surface text-primary font-bold px-5 py-2.5 rounded-xl shadow hover:bg-surface-container transition-colors flex items-center gap-2 shrink-0"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          Add New Lead
        </button>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
        <div className="bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-soft">
          <div className="flex items-center justify-between text-outline dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Total Leads</span>
            <span className="material-symbols-outlined text-primary p-1 bg-primary-container/10 rounded-lg">group</span>
          </div>
          <div className="text-2xl font-bold text-on-surface dark:text-white">{clients.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-0.5">
            <span className="material-symbols-outlined text-xs">table_chart</span> Live Google Sheet
          </div>
        </div>

        <div className="bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-soft">
          <div className="flex items-center justify-between text-outline dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Hot Leads</span>
            <span className="material-symbols-outlined text-emerald-600 p-1 bg-emerald-100 dark:bg-emerald-950 rounded-lg">local_fire_department</span>
          </div>
          <div className="text-2xl font-bold text-on-surface dark:text-white">{hotLeads.length}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">High conversion priority</div>
        </div>

        <div className="bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-soft">
          <div className="flex items-center justify-between text-outline dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase">Closed Deals</span>
            <span className="material-symbols-outlined text-purple-600 p-1 bg-purple-100 dark:bg-purple-950 rounded-lg">verified</span>
          </div>
          <div className="text-2xl font-bold text-on-surface dark:text-white">{closedDeals.length}</div>
          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">Successfully converted</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Recent Active Leads */}
        <div className="lg:col-span-2 bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-soft space-y-md">
          <div className="flex justify-between items-center border-b border-surface-variant/40 dark:border-white/10 pb-sm">
            <h2 className="font-headline-sm text-lg font-bold text-on-surface dark:text-white">
              Recent Lead Activity
            </h2>
            <button
              onClick={() => setActiveTab('clients')}
              className="text-xs font-semibold text-primary dark:text-primary-fixed hover:underline flex items-center gap-1"
            >
              View all ({clients.length})
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>

          <div className="space-y-sm">
            {clients.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant dark:text-gray-400 text-xs font-semibold">
                <span className="material-symbols-outlined text-3xl text-outline mb-1 block">grid_off</span>
                No leads in Google Sheet (0 items found).
              </div>
            ) : (
              clients.slice(0, 4).map(client => (
                <div
                  key={client.id}
                  onClick={() => viewClientDetails(client.id)}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest dark:bg-white/5 border border-surface-variant/40 dark:border-white/10 hover:border-primary/40 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-9 h-9 rounded-full bg-primary-container/10 border border-surface-variant flex items-center justify-center text-primary dark:text-primary-fixed shrink-0">
                      <span className="material-symbols-outlined text-lg">person</span>
                    </span>
                    <div>
                      <div className="font-bold text-sm text-on-surface dark:text-white flex items-center gap-2">
                        {client.name}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          client.status === 'Hot Lead' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          client.status === 'Warm Lead' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          client.status === 'Closed Deal' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {client.status}
                        </span>
                      </div>
                      <div className="text-xs text-on-surface-variant dark:text-gray-400 truncate max-w-[220px]">
                        Agent: {client.agent || "Unassigned"} | {client.location || client.address}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-outline dark:text-gray-400">{client.assignedDate}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pipeline Breakdown & Quick Shortcuts */}
        <div className="space-y-md">
          {/* Pipeline Stage Distribution */}
          <div className="bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-soft">
            <h2 className="font-headline-sm text-base font-bold text-on-surface dark:text-white mb-md border-b border-surface-variant/40 dark:border-white/10 pb-2">
              Pipeline Stage Breakdown
            </h2>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-700 dark:text-emerald-400">Hot Leads ({hotLeads.length})</span>
                  <span className="dark:text-gray-300">{clients.length ? Math.round((hotLeads.length / clients.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${clients.length ? (hotLeads.length / clients.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-700 dark:text-amber-400">Warm Leads ({warmLeads.length})</span>
                  <span className="dark:text-gray-300">{clients.length ? Math.round((warmLeads.length / clients.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${clients.length ? (warmLeads.length / clients.length) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-blue-700 dark:text-blue-400">Closed Deals ({closedDeals.length})</span>
                  <span className="dark:text-gray-300">{clients.length ? Math.round((closedDeals.length / clients.length) * 100) : 0}%</span>
                </div>
                <div className="w-full h-2 bg-surface-variant dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${clients.length ? (closedDeals.length / clients.length) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tools */}
          <div className="bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-soft">
            <h2 className="font-headline-sm text-base font-bold text-on-surface dark:text-white mb-sm">
              Quick CRM Actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-lowest dark:bg-white/5 hover:bg-surface-container dark:hover:bg-white/10 border border-surface-variant/40 dark:border-white/10 text-xs font-semibold text-on-surface dark:text-white text-left"
              >
                <span className="material-symbols-outlined text-primary text-base">search</span>
                Global Search
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container-lowest dark:bg-white/5 hover:bg-surface-container dark:hover:bg-white/10 border border-surface-variant/40 dark:border-white/10 text-xs font-semibold text-on-surface dark:text-white text-left"
              >
                <span className="material-symbols-outlined text-amber-600 text-base">notifications</span>
                Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
