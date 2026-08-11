import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';

export const ClientDetailsView = () => {
  const { 
    clients, 
    selectedClientId, 
    setActiveTab, 
    updateClientStatus, 
    addTimelineNote 
  } = useCRM();

  const [newNote, setNewNote] = useState('');
  const [isEditingStatus, setIsEditingStatus] = useState(false);

  const client = clients.find(c => c.id === selectedClientId) || clients[0];

  if (!client) return null;

  const handleAddNoteSubmit = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addTimelineNote(client.id, newNote);
    setNewNote('');
  };

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

  return (
    <main className="pt-20 md:pt-28 px-4 sm:px-6 max-w-4xl mx-auto w-full min-w-0 space-y-md sm:space-y-lg pb-28 sm:pb-32 animate-in fade-in duration-200">
      {/* Top back shortcut for desktop */}
      <div className="hidden md:flex items-center gap-2 mb-2">
        <button 
          onClick={() => setActiveTab('clients')}
          className="flex items-center gap-1 text-sm font-semibold text-primary dark:text-primary-fixed hover:underline"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Clients List
        </button>
      </div>

      {/* Header Profile Section (No Image Avatar) */}
      <section className="bg-surface dark:bg-[#1e2225] p-lg rounded-xl border border-surface-variant dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)] space-y-md">
        <div className="flex flex-col md:flex-row items-start justify-between gap-md border-b border-surface-variant/40 dark:border-white/10 pb-md">
          <div className="space-y-xs">
            <div className="flex flex-wrap items-center gap-sm">
              <span className="w-12 h-12 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed">
                <span className="material-symbols-outlined text-2xl">person</span>
              </span>
              <div>
                <h1 className="font-headline-lg text-2xl font-bold text-on-surface dark:text-white">
                  {client.name}
                </h1>
                <p className="text-xs font-semibold text-primary dark:text-primary-fixed flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">badge</span>
                  Agent: {client.agent || "Unassigned"}
                </p>
              </div>
              <span className={`ml-auto md:ml-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadgeStyle(client.status)}`}>
                {client.status}
              </span>
            </div>
          </div>

          {/* Change Status Quick Menu */}
          <div className="relative self-start">
            <button 
              onClick={() => setIsEditingStatus(!isEditingStatus)}
              className="px-3 py-1.5 bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-xs font-semibold text-on-surface dark:text-gray-200 hover:text-primary flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Status: {client.status}
              <span className="material-symbols-outlined text-xs">arrow_drop_down</span>
            </button>
            {isEditingStatus && (
              <div className="absolute right-0 mt-1 w-40 bg-surface dark:bg-[#111416] border border-surface-variant dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden text-xs">
                {['Hot Lead', 'Warm Lead', 'Cold Lead', 'Closed Deal'].map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      updateClientStatus(client.id, st);
                      setIsEditingStatus(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-surface-container transition-colors ${
                      client.status === st ? 'font-bold text-primary bg-primary-container/10' : 'text-on-surface dark:text-gray-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Contact Action Buttons */}
        <div className="flex flex-wrap items-center gap-sm">
          <a 
            href={`tel:${client.mobileNumber || client.phone}`}
            className="bg-primary-container text-on-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:opacity-90 transition-opacity shadow-sm"
          >
            <span className="material-symbols-outlined text-base">call</span> Call Mobile
          </a>
          <a 
            href={`mailto:${client.email}`}
            className="bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 text-on-surface dark:text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-base">mail</span> Send Email
          </a>
        </div>
      </section>

      {/* Details Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-md">
        {/* Contact Info Card */}
        <div className="bg-surface dark:bg-surface-dim p-md rounded-xl border border-surface-variant dark:border-outline/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] space-y-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface font-bold border-b border-surface-variant dark:border-outline/20 pb-xs">
            Contact Information
          </h2>
          <div className="space-y-sm">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">person</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Name</p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface font-semibold">{client.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">phone</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Mobile Number</p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface font-semibold">{client.mobileNumber || client.phone || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">email</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Email Address</p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface font-semibold">{client.email || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">location_on</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Location</p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface font-semibold">{client.location || client.address || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Details Card */}
        <div className="bg-surface dark:bg-surface-dim p-md rounded-xl border border-surface-variant dark:border-outline/20 shadow-[0_4px_12px_rgba(0,0,0,0.04)] space-y-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface font-bold border-b border-surface-variant dark:border-outline/20 pb-xs">
            Lead Details & Assignment
          </h2>
          <div className="space-y-sm">
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">badge</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Assigned Agent</p>
                <p className="font-body-md text-body-md text-primary font-bold">{client.agent || "Unassigned"}</p>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">flag</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Lead Status</p>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeStyle(client.status)}`}>
                  {client.status}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-sm">
              <span className="material-symbols-outlined text-outline mt-0.5">notes</span>
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant">Remarks</p>
                <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface italic">{client.remarks || client.notes || "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Activity Timeline Section */}
      <section className="bg-surface dark:bg-[#1e2225] p-md rounded-xl border border-surface-variant dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)] space-y-md">
        <div className="flex items-center justify-between">
          <h2 className="font-headline-sm text-lg text-on-surface dark:text-white font-bold">
            Activity Timeline
          </h2>
          <span className="text-xs text-on-surface-variant font-mono">{(client.timeline || []).length} events recorded</span>
        </div>

        {/* Form to Append New Note */}
        <form onSubmit={handleAddNoteSubmit} className="flex gap-2">
          <input
            type="text"
            placeholder="Log new call note, meeting outcome, or reminder..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 px-md py-sm bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-sm text-on-surface dark:text-white outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="px-md py-sm bg-primary-container text-on-primary font-semibold text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">send</span>
            Add Event
          </button>
        </form>

        <div className="relative pl-sm pt-md">
          {/* Vertical Line */}
          <div className="absolute left-[15px] top-2 bottom-0 w-px bg-surface-variant dark:bg-white/10"></div>
          
          {/* Timeline Items */}
          <div className="space-y-lg">
            {(client.timeline || []).map((item) => (
              <div key={item.id} className="relative flex items-start gap-md">
                <div className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-surface dark:ring-surface-dim ${
                  item.isCurrent ? 'bg-primary-container' : 'bg-outline-variant'
                }`}></div>
                <div className="flex-1">
                  <p className="font-label-md text-label-md text-on-surface-variant mb-0.5 text-xs font-medium">
                    {item.date}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface dark:text-inverse-on-surface font-bold">
                    {item.title}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
