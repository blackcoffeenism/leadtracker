import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';

export const AddClientView = () => {
  const { addClient, setActiveTab, user } = useCRM();

  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    location: '',
    status: 'Warm Lead',
    remarks: '',
    agent: user?.email || 'delimagerald9@gmail.com'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addClient({
      ...formData,
      agent: user?.email || formData.agent,
      phone: formData.mobileNumber,
      address: formData.location,
      notes: formData.remarks
    });
  };

  return (
    <main className="pt-20 md:pt-28 px-margin-mobile max-w-2xl mx-auto space-y-lg pb-32 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface font-bold">
            Add New Lead
          </h1>
          <p className="text-body-md text-on-surface-variant text-xs">
            Form mapped directly to Google Sheets schema (<strong>Name, Mobile Number, Email, Location, Lead Status, Remarks, Agent</strong>).
          </p>
        </div>

        <button 
          onClick={() => setActiveTab('clients')}
          className="text-on-surface-variant hover:text-on-surface p-2 rounded-full"
          title="Cancel"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface dark:bg-[#1e2225] p-lg rounded-xl border border-surface-variant dark:border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.04)] space-y-md">
        {/* Name & Lead Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="md:col-span-2">
            <label className="block text-label-md font-label-md text-on-surface-variant dark:text-gray-300 mb-1 font-semibold">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Maria Santos"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-md py-sm bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-on-surface dark:text-white outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant dark:text-gray-300 mb-1 font-semibold">
              Lead Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-md py-sm bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-on-surface dark:text-white outline-none focus:border-primary text-sm font-semibold"
            >
              <option value="Hot Lead">Hot Lead</option>
              <option value="Warm Lead">Warm Lead</option>
              <option value="Cold Lead">Cold Lead</option>
              <option value="Closed Deal">Closed Deal</option>
            </select>
          </div>
        </div>

        {/* Mobile Number & Email (Optional) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant dark:text-gray-300 mb-1 font-semibold">
              Mobile Number (Optional)
            </label>
            <input
              type="tel"
              name="mobileNumber"
              placeholder="e.g. +63 917 123 4567"
              value={formData.mobileNumber}
              onChange={handleChange}
              className="w-full px-md py-sm bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-on-surface dark:text-white outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant dark:text-gray-300 mb-1 font-semibold">
              Email Address (Optional)
            </label>
            <input
              type="email"
              name="email"
              placeholder="maria@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-md py-sm bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-on-surface dark:text-white outline-none focus:border-primary text-sm"
            />
          </div>
        </div>

        {/* Location & Agent */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant dark:text-gray-300 mb-1 font-semibold">
              Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Metro Manila, Philippines"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-md py-sm bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-lg text-on-surface dark:text-white outline-none focus:border-primary text-sm"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant dark:text-gray-300 mb-1 font-semibold flex items-center justify-between">
              <span>Assigned Agent</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Auto-filled (Locked)</span>
            </label>
            <input
              type="text"
              name="agent"
              readOnly
              value={user?.email || formData.agent}
              className="w-full px-md py-sm bg-surface-variant/40 dark:bg-white/10 border border-surface-variant dark:border-white/10 rounded-lg text-on-surface dark:text-gray-300 text-sm font-semibold cursor-not-allowed select-none"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-label-md font-label-md text-on-surface-variant mb-1 font-semibold">
            Remarks
          </label>
          <textarea
            name="remarks"
            rows="3"
            placeholder="Add specific lead comments, remarks, or requirement details..."
            value={formData.remarks}
            onChange={handleChange}
            className="w-full px-md py-sm bg-surface-container-lowest dark:bg-surface-container border border-surface-variant rounded-lg text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary text-sm"
          ></textarea>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-sm pt-md border-t border-surface-variant">
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className="px-lg py-sm text-on-surface-variant font-button text-button hover:bg-surface-container rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-xl py-sm bg-primary-container text-on-primary font-button text-button rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Save Lead
          </button>
        </div>
      </form>
    </main>
  );
};
