import React, { useState } from 'react';

export const NotificationPreferencesModal = ({ isOpen, onClose }) => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest dark:bg-surface-dim border border-surface-variant rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-lg border-b border-surface-variant flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface font-bold">Notification Preferences</h2>
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:bg-surface-container rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-lg space-y-md">
          <div className="flex items-center justify-between py-sm border-b border-surface-variant/40">
            <div>
              <div className="font-label-lg text-on-surface dark:text-inverse-on-surface font-semibold">Push Notifications</div>
              <div className="text-xs text-on-surface-variant">Instant browser & mobile push alerts</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={pushAlerts} 
                onChange={(e) => setPushAlerts(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-sm border-b border-surface-variant/40">
            <div>
              <div className="font-label-lg text-on-surface dark:text-inverse-on-surface font-semibold">Email Alerts</div>
              <div className="text-xs text-on-surface-variant">Daily lead digests & urgent reminders</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={emailAlerts} 
                onChange={(e) => setEmailAlerts(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-sm border-b border-surface-variant/40">
            <div>
              <div className="font-label-lg text-on-surface dark:text-inverse-on-surface font-semibold">SMS Notifications</div>
              <div className="text-xs text-on-surface-variant">Text messages for hot lead assignments</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={smsAlerts} 
                onChange={(e) => setSmsAlerts(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-sm">
            <div>
              <div className="font-label-lg text-on-surface dark:text-inverse-on-surface font-semibold">Weekly Report Email</div>
              <div className="text-xs text-on-surface-variant">Performance & conversion summary</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={weeklyDigest} 
                onChange={(e) => setWeeklyDigest(e.target.checked)} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-surface-variant">
            <button
              onClick={onClose}
              className="px-lg py-sm bg-primary-container text-on-primary font-button text-button rounded-lg shadow hover:opacity-90 transition-opacity"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
