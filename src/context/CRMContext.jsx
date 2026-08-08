import React, { createContext, useContext, useState, useEffect } from 'react';

const CRMContext = createContext();

const INITIAL_USER = {
  name: "Gerald Smith",
  email: "gerald.smith@example.com",
  role: "VP of Business Development",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGBhs0HsHT1AYlPjJ493GkCVwowslTC4pTTZrXb-ADu-V-TD1uyhnnVTx5HQewVO00tjv5W827r9LBMgL7Tz7KM8Jqu9nG6Bi50Qg8gPcjdduPgp55bnYpNUOKxoxXmyeSVyuVKDcDUTqN_95EXpx4Tx9NPPUXQy6xYuYfTeY2zSNiGV_CF6t54FZnFzbjhbWATeFOCXM9q9NTIhNElD3zaX1b_OJy1Rk_RNWcrSNIlMFahTF73DMz"
};

const INITIAL_CLIENTS = [];

const INITIAL_NOTIFICATIONS = [
  {
    id: "n1",
    title: "New client added",
    description: "Sarah Jenkins has been assigned to you. She is interested in downtown properties.",
    time: "2m ago",
    group: "Today",
    unread: true,
    icon: "person_add",
    colorClass: "primary-container",
    iconColorClass: "text-primary-container"
  },
  {
    id: "n2",
    title: "Follow-up Reminder",
    description: "Reminder to call John Doe regarding the property viewing at 123 Main St.",
    time: "10:00 AM",
    group: "Today",
    unread: true,
    icon: "schedule",
    colorClass: "[#f59e0b]",
    iconColorClass: "text-[#d97706]"
  },
  {
    id: "n3",
    title: "Document Signed",
    description: "The leasing agreement for Unit 4B has been signed by Mike Ross.",
    time: "8:30 AM",
    group: "Today",
    unread: false,
    icon: "check_circle",
    colorClass: "[#10b981]",
    iconColorClass: "text-[#059669]"
  },
  {
    id: "n4",
    title: "New Message",
    description: "You have a new message from Emma Stone regarding pricing.",
    time: "Yesterday",
    group: "Yesterday",
    unread: false,
    icon: "mail",
    colorClass: "primary-container",
    iconColorClass: "text-primary-container"
  },
  {
    id: "n5",
    title: "Weekly Report Ready",
    description: "Your lead generation report for last week is now available to view.",
    time: "Yesterday",
    group: "Yesterday",
    unread: false,
    icon: "insights",
    colorClass: "surface-variant",
    iconColorClass: "text-on-surface-variant"
  },
  {
    id: "n6",
    title: "System Update",
    description: "LeadFlow CRM has been updated to version 2.4 with new analytics features.",
    time: "Oct 24",
    group: "Earlier",
    unread: false,
    icon: "update",
    colorClass: "primary-container",
    iconColorClass: "text-primary-container"
  }
];

export const CRMProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch (e) {
      return INITIAL_USER;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow_auth');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  const [clients, setClients] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow_clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch (e) {
      return INITIAL_CLIENTS;
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState('1');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('leadflow_theme');
      return saved ? saved === 'dark' : false;
    } catch (e) {
      return false;
    }
  });

  // Apply dark mode class to html element
  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('leadflow_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('leadflow_theme', 'light');
      }
    } catch (e) {
      console.warn("Unable to save theme preference:", e);
    }
  }, [isDarkMode]);

  // Persist state safely to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('leadflow_auth', JSON.stringify(isAuthenticated));
    } catch (e) {
      console.warn("Unable to save auth status:", e);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('leadflow_user', JSON.stringify(user));
    } catch (e) {
      console.warn("Unable to save user to localStorage:", e);
    }
  }, [user]);

  const loginWithUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setActiveTab('dashboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveTab('signup');
  };

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const viewClientDetails = (clientId) => {
    setSelectedClientId(clientId);
    setActiveTab('client_details');
  };

  useEffect(() => {
    try {
      localStorage.setItem('leadflow_clients', JSON.stringify(clients));
    } catch (e) {
      console.warn("Unable to save clients to localStorage:", e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('leadflow_notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn("Unable to save notifications to localStorage:", e);
    }
  }, [notifications]);

  // Auto-fetch live Google Sheet data on mount when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      syncGoogleSheet();
    }
  }, [isAuthenticated]);

  const [isSyncingSheet, setIsSyncingSheet] = useState(false);
  const [sheetSyncStatus, setSheetSyncStatus] = useState(null);

  const syncGoogleSheet = async (customSheetUrl) => {
    setIsSyncingSheet(true);
    setSheetSyncStatus(null);
    const targetUrl = customSheetUrl || "https://docs.google.com/spreadsheets/d/1qTmp6AdRoqdOxYS4LwTb1zg9T1gRapDCyqfU5i42ZFY/edit?usp=sharing";

    try {
      const res = await fetch("http://localhost:5050/api/sheets/sync", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sheetUrl: targetUrl, userEmail: user?.email })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setClients(data.clients);
        setSheetSyncStatus({ type: 'success', message: data.message });
      } else {
        setSheetSyncStatus({ 
          type: 'warning', 
          message: data.error || "Unable to sync automatically. Make sure the Google Sheet is shared with 'Anyone with the link can view'." 
        });
      }
    } catch (err) {
      console.warn("Backend sheet sync error:", err);
      setSheetSyncStatus({ 
        type: 'info', 
        message: "Google Sheet link is configured. (Note: To load live data automatically, click 'File > Share > Publish to Web' or set permission to 'Anyone with link can view' in Google Sheets)." 
      });
    } finally {
      setIsSyncingSheet(false);
    }
  };

  const addClient = async (newClientData) => {
    const id = Date.now().toString();
    const newClient = {
      id,
      name: newClientData.name,
      mobileNumber: newClientData.mobileNumber || newClientData.phone || "",
      phone: newClientData.phone || newClientData.mobileNumber || "",
      email: newClientData.email || "",
      location: newClientData.location || newClientData.address || "",
      address: newClientData.address || newClientData.location || "",
      status: newClientData.status || "Warm Lead",
      remarks: newClientData.remarks || newClientData.notes || "",
      notes: newClientData.notes || newClientData.remarks || "",
      agent: newClientData.agent || user?.email || "",
      source: "Manual Entry",
      assignedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dealValue: newClientData.dealValue || "$500,000",
      avatar: newClientData.avatar || `https://images.unsplash.com/photo-1534528741775?w=150`,
      timeline: [
        {
          id: `t_${Date.now()}`,
          date: 'Just now',
          title: 'Created',
          description: 'Client added to LeadFlow CRM.',
          isCurrent: true
        }
      ]
    };

    setClients(prev => [newClient, ...prev]);

    // Async sync to Express backend
    try {
      await fetch("http://localhost:5050/api/clients", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      });
    } catch (e) {
      console.warn("Backend API sync warning:", e);
    }

    // Push notification
    const newNotif = {
      id: `n_${Date.now()}`,
      title: 'New client added',
      description: `${newClient.name} has been added to your CRM.`,
      time: 'Just now',
      group: 'Today',
      unread: true,
      icon: 'person_add',
      colorClass: 'primary-container',
      iconColorClass: 'text-primary-container'
    };
    setNotifications(prev => [newNotif, ...prev]);

    viewClientDetails(id);
  };

  const updateClientStatus = (clientId, newStatus) => {
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const updatedTimeline = [
          {
            id: `t_${Date.now()}`,
            date: 'Just now',
            title: 'Status updated',
            description: `Status updated to '${newStatus}'.`,
            isCurrent: true
          },
          ...client.timeline.map(item => ({ ...item, isCurrent: false }))
        ];
        return {
          ...client,
          status: newStatus,
          timeline: updatedTimeline
        };
      }
      return client;
    }));
  };

  const addTimelineNote = async (clientId, noteText) => {
    if (!noteText.trim()) return;
    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        const newEntry = {
          id: `t_${Date.now()}`,
          date: 'Just now',
          title: 'Note added',
          description: noteText,
          isCurrent: true
        };
        return {
          ...client,
          timeline: [newEntry, ...client.timeline.map(item => ({ ...item, isCurrent: false }))]
        };
      }
      return client;
    }));

    // Async sync to Express backend
    try {
      await fetch(`http://localhost:5050/api/clients/${clientId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText })
      });
    } catch (e) {
      console.warn("Backend timeline note sync warning:", e);
    }
  };

  const toggleNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, unread: !n.unread } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const updateUserProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <CRMContext.Provider
      value={{
        user,
        isAuthenticated,
        loginWithUser,
        logout,
        clients,
        notifications,
        activeTab,
        setActiveTab,
        selectedClientId,
        setSelectedClientId,
        viewClientDetails,
        addClient,
        updateClientStatus,
        addTimelineNote,
        toggleNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        isDarkMode,
        toggleDarkMode,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        syncGoogleSheet,
        isSyncingSheet,
        sheetSyncStatus
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => useContext(CRMContext);
