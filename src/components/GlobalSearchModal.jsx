import React, { useEffect, useRef } from 'react';
import { useCRM } from '../context/CRMContext';

export const GlobalSearchModal = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    searchQuery, 
    setSearchQuery, 
    clients, 
    viewClientDetails,
    setActiveTab
  } = useCRM();

  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 md:pt-24 px-4 animate-in fade-in duration-200">
      <div className="bg-surface dark:bg-surface-container-lowest border border-surface-variant dark:border-outline-variant/30 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-surface-variant dark:border-outline/20 flex items-center gap-3 bg-surface-container-lowest dark:bg-surface-dim">
          <span className="material-symbols-outlined text-outline text-2xl">search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search clients by name, role, email, status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent outline-none text-on-surface dark:text-inverse-on-surface font-body-md text-base placeholder-outline"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="p-1 text-outline hover:text-on-surface rounded-full"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="px-2 py-1 text-xs font-semibold bg-surface-variant dark:bg-surface-container text-on-surface-variant rounded hover:bg-surface-container-high transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <div className="text-xs font-label-md uppercase tracking-wider text-outline">
            {searchQuery ? `Search Results (${filteredClients.length})` : 'Recent Clients'}
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">search_off</span>
              <p>No clients matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => {
                    viewClientDetails(client.id);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors cursor-pointer border border-transparent hover:border-surface-variant"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={client.avatar} 
                      alt={client.name}
                      className="w-10 h-10 rounded-full object-cover border border-surface-variant" 
                    />
                    <div>
                      <div className="font-headline-sm text-sm font-semibold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
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
                      <div className="text-xs text-on-surface-variant">{client.title} • {client.email}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-outline text-lg">chevron_right</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick Action Navigation */}
          <div className="pt-2 border-t border-surface-variant/50">
            <div className="text-xs font-label-md uppercase tracking-wider text-outline mb-2">Quick Navigation</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTab('add');
                  setIsSearchOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-lowest dark:bg-surface-dim hover:bg-surface-container border border-surface-variant/60 text-xs font-semibold text-primary"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                Add New Client
              </button>
              <button
                onClick={() => {
                  setActiveTab('alerts');
                  setIsSearchOpen(false);
                }}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-lowest dark:bg-surface-dim hover:bg-surface-container border border-surface-variant/60 text-xs font-semibold text-on-surface"
              >
                <span className="material-symbols-outlined text-base">notifications</span>
                View Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
