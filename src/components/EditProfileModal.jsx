import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { getInitialsAvatar } from '../utils/avatar';

export const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useCRM();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [avatar, setAvatar] = useState('');

  // Re-sync form fields every time the modal opens or the user object changes
  useEffect(() => {
    if (isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setRole(user.role || '');
      setAvatar(user.picture || user.avatar || getInitialsAvatar(user.name));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({ name, email, role, avatar, picture: avatar });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest dark:bg-surface-dim border border-surface-variant rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-lg border-b border-surface-variant flex justify-between items-center">
          <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface font-bold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:bg-surface-container rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-lg space-y-md">
          <div className="flex justify-center mb-md">
            <div className="relative w-20 h-20">
              <img 
                src={avatar || getInitialsAvatar(name)} 
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full rounded-full object-cover border-2 border-primary-container bg-primary-container"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = getInitialsAvatar(name);
                }}
              />
              <button 
                type="button"
                onClick={() => {
                  const newAvatar = prompt("Enter Image URL for profile avatar:", avatar);
                  if (newAvatar) setAvatar(newAvatar);
                }}
                className="absolute bottom-0 right-0 bg-primary-container text-on-primary rounded-full p-1.5 shadow hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-md py-sm bg-surface dark:bg-surface-container border border-surface-variant rounded-lg text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-md py-sm bg-surface dark:bg-surface-container border border-surface-variant rounded-lg text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-label-md font-label-md text-on-surface-variant mb-1">Job Title / Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-md py-sm bg-surface dark:bg-surface-container border border-surface-variant rounded-lg text-on-surface dark:text-inverse-on-surface outline-none focus:border-primary"
            />
          </div>

          <div className="flex justify-end gap-sm pt-md border-t border-surface-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-md py-sm text-on-surface-variant font-button text-button hover:bg-surface-container rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-lg py-sm bg-primary-container text-on-primary font-button text-button rounded-lg shadow hover:opacity-90 transition-opacity"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
