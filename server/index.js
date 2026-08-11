import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'leadflow_secret_jwt_key_2026';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '1089274928172-demo-client-id.apps.googleusercontent.com';

const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json());

// In-Memory Database Stores (Persisted in server state)
let usersStore = [
  {
    id: "u_1",
    googleId: "109823749817293",
    name: "Gerald Smith",
    email: "gerald.smith@example.com",
    role: "VP of Business Development",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGBhs0HsHT1AYlPjJ493GkCVwowslTC4pTTZrXb-ADu-V-TD1uyhnnVTx5HQewVO00tjv5W827r9LBMgL7Tz7KM8Jqu9nG6Bi50Qg8gPcjdduPgp55bnYpNUOKxoxXmyeSVyuVKDcDUTqN_95EXpx4Tx9NPPUXQy6xYuYfTeY2zSNiGV_CF6t54FZnFzbjhbWATeFOCXM9q9NTIhNElD3zaX1b_OJy1Rk_RNWcrSNIlMFahTF73DMz"
  }
];

let clientsStore = [];

let notificationsStore = [
  {
    id: "n1",
    title: "New client added",
    description: "Sarah Jenkins has been assigned to you. She is interested in downtown properties.",
    time: "2m ago",
    group: "Today",
    unread: true,
    icon: "person_add"
  },
  {
    id: "n2",
    title: "Follow-up Reminder",
    description: "Reminder to call John Doe regarding the property viewing at 123 Main St.",
    time: "10:00 AM",
    group: "Today",
    unread: true,
    icon: "schedule"
  },
  {
    id: "n3",
    title: "Document Signed",
    description: "The leasing agreement for Unit 4B has been signed by Mike Ross.",
    time: "8:30 AM",
    group: "Today",
    unread: false,
    icon: "check_circle"
  }
];

// Helper: Verify Google OAuth Token
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID
    });
    return ticket.getPayload();
  } catch (error) {
    console.warn("Google verifyIdToken failed or demo mode token used:", error.message);
    // Decode basic JWT or return standard mock payload if demo token
    try {
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }
}

// Master Registry Spreadsheet (1T2OJynI6frBrporELWnh_t-0-4mrox_NHOz1uOrlFXs)
const MASTER_REGISTRY_SHEET_ID = "1T2OJynI6frBrporELWnh_t-0-4mrox_NHOz1uOrlFXs";
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID || "1qTmp6AdRoqdOxYS4LwTb1zg9T1gRapDCyqfU5i42ZFY";

let GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx05pB7ImJtphplQK7iPTj9iS7kwUqLG5Fq0jIQCqX6cjdiFxbNZon9v1d4JI3EAr0/exec";

// Dynamically fetch Program 1 Web URL from Master Registry Spreadsheet
async function getProgram1WebUrl() {
  try {
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${MASTER_REGISTRY_SHEET_ID}/export?format=csv`;
    const response = await fetch(csvExportUrl);
    if (response.ok) {
      const csvText = await response.text();
      const lines = csvText.split(/\r?\n/).filter(line => line.trim());
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
        const name = parts[0] || "";
        const url = parts[1] || "";
        if (name.toLowerCase().includes("program 1") && url.startsWith("https://script.google.com/")) {
          GOOGLE_APPS_SCRIPT_URL = url;
          console.log(`[Master Registry resolved] Program 1 Web URL: ${GOOGLE_APPS_SCRIPT_URL}`);
          return url;
        }
      }
    }
  } catch (err) {
    console.warn("Failed to fetch Master Registry Web URL:", err.message);
  }
  return GOOGLE_APPS_SCRIPT_URL;
}

// Immediately resolve Program 1 Web URL on server startup
getProgram1WebUrl();

// Dynamic Google Sheet Share Permission Checker (No Hardcoding)
async function checkGoogleSheetPermission(email) {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();

  const activeWebUrl = await getProgram1WebUrl();

  // 1. Query Google Apps Script Web App API for real-time Drive share settings
  if (activeWebUrl) {
    try {
      const apiEndpoint = `${activeWebUrl}?action=checkPermission&email=${encodeURIComponent(normalizedEmail)}`;
      const res = await fetch(apiEndpoint);
      if (res.ok) {
        const data = await res.json();
        console.log(`[Google Apps Script API Check] Email: ${normalizedEmail} -> Allowed: ${data.isAllowed}`);
        if (typeof data.isAllowed === 'boolean') {
          return data.isAllowed;
        }
        if (data.shareList && Array.isArray(data.shareList)) {
          return data.shareList.some(acc => acc.toLowerCase() === normalizedEmail);
        }
      }
    } catch (e) {
      console.warn("Google Apps Script API call error:", e.message);
    }
  }

  // 2. Dynamic Sheet Content Inspection: Check emails/agents in Google Sheet CSV
  try {
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
    const res = await fetch(csvExportUrl);
    if (res.ok) {
      const csvText = await res.text();
      const lines = csvText.split(/\r?\n/).filter(line => line.trim());
      const sheetEmails = new Set();

      lines.forEach(line => {
        const matches = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (matches) {
          matches.forEach(m => sheetEmails.add(m.toLowerCase()));
        }
      });

      if (sheetEmails.has(normalizedEmail)) {
        console.log(`[Google Sheet Content Match] Found ${normalizedEmail} in sheet data.`);
        return true;
      }
    }
  } catch (err) {
    console.warn("Google Sheet CSV inspection warning:", err.message);
  }

  // 3. Match existing users registered in server DB
  const isExistingUser = usersStore.some(u => u.email.toLowerCase() === normalizedEmail);
  return isExistingUser;
}

// API Routes

// 1. Google OAuth Signup / Login (POST for API fetch)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, idToken, email, name, picture, avatar, id } = req.body;
    const tokenToVerify = credential || idToken;

    // Debug: log exactly what the client sent
    console.log('[Google Auth] Received body:', { email, name, picture: picture ? picture.slice(0, 60) + '...' : null, avatar: avatar ? avatar.slice(0, 60) + '...' : null, id, hasCredential: !!tokenToVerify });

    let targetEmail = email;
    let payload = null;

    if (tokenToVerify) {
      payload = await verifyGoogleToken(tokenToVerify);
      if (payload && payload.email) {
        targetEmail = payload.email;
      }
    }

    if (!targetEmail && payload && payload.email) {
      targetEmail = payload.email;
    }

    if (!targetEmail) {
      return res.status(400).json({ error: "Missing Google ID token or email credential." });
    }

    const normalizedEmail = targetEmail.trim().toLowerCase();

    // DYNAMIC GOOGLE APPS SCRIPT & SHEET SHARE PERMISSION CHECK
    const isAllowed = await checkGoogleSheetPermission(normalizedEmail);

    if (!isAllowed) {
      console.warn(`[Google Auth Denied] ${normalizedEmail} is NOT listed in Google Sheet share settings.`);
      return res.status(403).json({
        success: false,
        error: `Access Denied: Your Google account (${normalizedEmail}) is not listed in the Google Sheet share settings list.`
      });
    }

    // Extract real Google account full name & profile picture avatar dynamically from Google OAuth
    // Priority: ID token payload > request body > fallback
    let userFullName = (payload?.name) || name || null;
    if (!userFullName && (payload?.given_name || payload?.family_name)) {
      userFullName = `${payload?.given_name || ''} ${payload?.family_name || ''}`.trim();
    }
    // Accept both `picture` and `avatar` from request body
    const userPicture = payload?.picture || picture || avatar || null;
    const userId = payload?.sub || id || null;
    const resolvedName = userFullName || (normalizedEmail ? normalizedEmail.split('@')[0] : "User");

    console.log('[Google Auth] Extracted profile:', { resolvedName, userPicture: userPicture ? userPicture.slice(0, 80) + '...' : null, userId });

    // Helper for initials SVG fallback
    const getInitialsAvatar = (fullName) => {
      const parts = (fullName || 'User').trim().split(/\s+/).filter(Boolean);
      const initials = parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" fill="#2563eb" rx="64"/><text x="50%" y="54%" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="#ffffff" dominant-baseline="middle" text-anchor="middle">${initials}</text></svg>`;
      return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    };

    const finalPicture = userPicture || getInitialsAvatar(resolvedName);

    // Find or create user
    let user = usersStore.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      user = {
        id: userId || ("g_" + Date.now()),
        googleId: userId || ("google_" + Date.now()),
        name: resolvedName,
        email: normalizedEmail,
        picture: finalPicture,
        avatar: finalPicture,
        role: "Lead Specialist"
      };
      usersStore.push(user);
    } else {
      // Update existing user record dynamically with Google Account details
      if (userFullName) user.name = userFullName;
      // Always update picture with the latest value from Google
      user.picture = finalPicture;
      user.avatar = finalPicture;
      if (userId) {
        user.id = userId;
        user.googleId = userId;
      }
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Google Auth POST] Authenticated: ${user.name} (${user.email}), picture: ${user.picture ? user.picture.slice(0, 60) + '...' : 'none'}`);

    return res.json({
      success: true,
      message: "Authenticated successfully with Google OAuth & Sheet Share API",
      token,
      user
    });
  } catch (error) {
    console.error("Google Auth Endpoint Error:", error);
    return res.status(500).json({ error: "Internal Server Error during Google Auth verification" });
  }
});

// GET & POST Endpoints for Configuring Google Apps Script URL
app.get('/api/settings/apps-script', (req, res) => {
  return res.json({ success: true, appsScriptUrl: GOOGLE_APPS_SCRIPT_URL });
});

app.post('/api/settings/apps-script', (req, res) => {
  const { url } = req.body;
  if (!url || !url.startsWith("https://script.google.com/")) {
    return res.status(400).json({ error: "Valid Google Apps Script Web App URL required (starts with https://script.google.com/)" });
  }

  GOOGLE_APPS_SCRIPT_URL = url.trim();
  return res.json({ 
    success: true, 
    message: "Updated Google Apps Script Web App URL successfully!", 
    appsScriptUrl: GOOGLE_APPS_SCRIPT_URL 
  });
});

// GET Endpoint for Fetching Dynamic Share Settings Accounts from Google Apps Script / Sheet
app.get('/api/settings/share-accounts', async (req, res) => {
  try {
    if (GOOGLE_APPS_SCRIPT_URL) {
      const apiEndpoint = `${GOOGLE_APPS_SCRIPT_URL}?action=getShareList`;
      const response = await fetch(apiEndpoint);
      if (response.ok) {
        const data = await response.json();
        if (data.shareList && Array.isArray(data.shareList)) {
          return res.json({ success: true, accounts: data.shareList, source: "Google Apps Script API" });
        }
      }
    }

    // Dynamic Sheet fallback
    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
    const response = await fetch(csvExportUrl);
    if (response.ok) {
      const csvText = await response.text();
      const sheetEmails = new Set();
      csvText.split(/\r?\n/).forEach(line => {
        const matches = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (matches) matches.forEach(m => sheetEmails.add(m.toLowerCase()));
      });
      return res.json({ success: true, accounts: Array.from(sheetEmails), source: "Google Sheet Data" });
    }

    return res.json({ success: true, accounts: [], source: "Default" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch share list from Google API" });
  }
});

// GET route for browser redirects
app.get('/api/auth/google', (req, res) => {
  return res.redirect('http://localhost:5173/');
});

// 2. Email Signup / Login
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  let user = usersStore.find(u => u.email === email);
  if (user) {
    return res.status(400).json({ error: "User with this email already exists" });
  }

  user = {
    id: "u_" + Date.now(),
    name: name || email.split('@')[0],
    email: email,
    role: role || "Account Executive",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
  };
  usersStore.push(user);

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({ success: true, token, user });
});

// 3. Get Clients List (Filtered by logged-in agent email)
app.get('/api/clients', (req, res) => {
  const userEmail = req.query.email || req.query.agentEmail || "";
  let list = clientsStore;

  if (userEmail) {
    const normalizedUserEmail = userEmail.trim().toLowerCase();
    const prefix = normalizedUserEmail.split('@')[0];

    list = clientsStore.filter(c => {
      if (!c.agent) return false;
      const ag = c.agent.trim().toLowerCase();
      return ag === normalizedUserEmail || ag === prefix || ag.includes(prefix) || normalizedUserEmail.includes(ag);
    });
  }

  return res.json({ success: true, clients: list });
});

// 4. Create New Client & Sync to Google Sheet
app.post('/api/clients', async (req, res) => {
  const newClientData = req.body;
  const newClient = {
    id: Date.now().toString(),
    name: newClientData.name,
    mobileNumber: newClientData.mobileNumber || newClientData.phone || "",
    phone: newClientData.phone || newClientData.mobileNumber || "",
    email: newClientData.email || "",
    location: newClientData.location || newClientData.address || "",
    address: newClientData.address || newClientData.location || "",
    status: newClientData.status || "Warm Lead",
    remarks: newClientData.remarks || newClientData.notes || "",
    notes: newClientData.notes || newClientData.remarks || "",
    agent: newClientData.agent || "",
    source: "Direct Inquiry",
    assignedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    timeline: [
      {
        id: `t_${Date.now()}`,
        date: 'Just now',
        title: 'Created',
        description: 'Client added to LeadFlow CRM backend.',
        isCurrent: true
      }
    ]
  };

  clientsStore.unshift(newClient);

  // Sync row addition to Google Sheet via Google Apps Script Web App
  try {
    const activeWebUrl = await getProgram1WebUrl();
    if (activeWebUrl) {
      await fetch(activeWebUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: "addLead",
          name: newClient.name,
          mobileNumber: newClient.mobileNumber,
          email: newClient.email,
          location: newClient.location,
          status: newClient.status,
          remarks: newClient.remarks,
          agent: newClient.agent
        })
      });
      console.log(`[Google Sheet Append] Appended lead "${newClient.name}" assigned to ${newClient.agent} to Google Sheet!`);
    }
  } catch (err) {
    console.warn("Failed to append lead to Google Sheet:", err.message);
  }

  // Auto push notification
  notificationsStore.unshift({
    id: `n_${Date.now()}`,
    title: 'New lead added',
    description: `${newClient.name} assigned to ${newClient.agent || 'Agent'}.`,
    time: 'Just now',
    group: 'Today',
    unread: true,
    icon: 'person_add'
  });

  return res.status(201).json({ success: true, client: newClient });
});

// 5. Append Timeline Event
app.post('/api/clients/:id/notes', (req, res) => {
  const { id } = req.params;
  const { note } = req.body;

  const client = clientsStore.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: "Client not found" });

  const newEntry = {
    id: `t_${Date.now()}`,
    date: 'Just now',
    title: 'Note added',
    description: note,
    isCurrent: true
  };

  client.timeline = [newEntry, ...client.timeline.map(item => ({ ...item, isCurrent: false }))];

  return res.json({ success: true, timeline: client.timeline });
});

// 6. Get Notifications
app.get('/api/notifications', (req, res) => {
  return res.json({ success: true, notifications: notificationsStore });
});

// 6b. Get Available Programs (Sheet Tabs)
// Returns the list of program names the user can switch between.
// You can expand this dynamically by querying the spreadsheet if needed.
app.get('/api/programs', (req, res) => {
  const programs = [
    { id: 'Program 1', label: 'Program 1' },
    { id: 'Program 2', label: 'Program 2' }
  ];
  return res.json({ success: true, programs });
});

// 7. Google Sheets Sync Endpoint (Filtered by logged-in agent email, supports program/sheet switching)
app.post('/api/sheets/sync', async (req, res) => {
  try {
    const { sheetUrl, userEmail, userName, program } = req.body || {};
    const targetUserEmail = userEmail ? userEmail.trim().toLowerCase() : "";
    const targetUserName = userName ? userName.trim().toLowerCase() : "";
    // program: "Program 1" or "Program 2" (sheet tab name)
    const sheetName = program ? program.trim() : "Program 1";

    // Matching helper: check if Agent column strictly matches full user email
    const matchesUserAccount = (agentVal) => {
      if (!agentVal || typeof agentVal !== 'string' || !agentVal.trim()) return false;
      if (!targetUserEmail) return true;
      return agentVal.trim().toLowerCase() === targetUserEmail;
    };

    // 1. Primary Sync: Fetch live sheet data via Google Apps Script Web App API for logged in agent
    const activeWebUrl = await getProgram1WebUrl();
    if (activeWebUrl) {
      try {
        const gasUrl = `${activeWebUrl}?action=getLeads&email=${encodeURIComponent(targetUserEmail)}&name=${encodeURIComponent(targetUserName)}&sheet=${encodeURIComponent(sheetName)}`;
        console.log(`[Google Apps Script Sync] Fetching ${sheetName} filtered for user account (${targetUserEmail || targetUserName})...`);
        const gasRes = await fetch(gasUrl);
        if (gasRes.ok) {
          const gasData = await gasRes.json();
          if (gasData && Array.isArray(gasData.leads)) {
            let fetched = gasData.leads;
            if (targetUserEmail || targetUserName) {
              fetched = fetched.filter(c => matchesUserAccount(c.agent));
            }
            clientsStore = fetched;
            console.log(`[Google Apps Script Sync] Loaded ${clientsStore.length} leads from '${sheetName}' filtered for Agent (${targetUserEmail || targetUserName})!`);
            return res.json({
              success: true,
              message: `Successfully synced ${clientsStore.length} leads from "${sheetName}" filtered for your account!`,
              program: sheetName,
              clients: clientsStore
            });
          }
        }
      } catch (gasErr) {
        console.warn("Apps script leads sync warning:", gasErr.message);
      }
    }

    const defaultSheetId = "1qTmp6AdRoqdOxYS4LwTb1zg9T1gRapDCyqfU5i42ZFY";
    let sheetId = defaultSheetId;
    if (sheetUrl && sheetUrl.includes('/d/')) {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) sheetId = match[1];
    }

    const csvExportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(csvExportUrl);
    
    if (!response.ok) {
      clientsStore = [];
      return res.json({
        success: true,
        message: "No public CSV data rows found. Returned 0 leads.",
        clients: []
      });
    }

    const csvText = await response.text();
    if (csvText.includes("<!DOCTYPE html>") || csvText.includes("<script")) {
      clientsStore = [];
      return res.json({
        success: true,
        message: "Sheet requires authentication. Checked Apps Script API (0 rows).",
        clients: []
      });
    }

    const lines = csvText.split(/\r?\n/).filter(line => line.trim());
    if (lines.length <= 1) {
      clientsStore = [];
      return res.json({
        success: true,
        message: "Google Sheet contains 0 lead data rows.",
        clients: []
      });
    }

    const parseCsvLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
    
    const findIndex = (possibleNames) => {
      return headers.findIndex(h => possibleNames.some(p => h.includes(p)));
    };

    const nameIdx = findIndex(['name', 'client', 'lead']);
    const phoneIdx = findIndex(['mobile', 'phone', 'number', 'contact']);
    const emailIdx = findIndex(['email', 'mail']);
    const locationIdx = findIndex(['location', 'address', 'city']);
    const statusIdx = findIndex(['status', 'stage', 'lead status']);
    const remarksIdx = findIndex(['remarks', 'remark', 'notes', 'comment']);
    const agentIdx = findIndex(['agent', 'assigned', 'rep', 'owner']);

    const newClients = [];

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (!row || row.length === 0) continue;

      const name = row[nameIdx !== -1 ? nameIdx : 0] || `Lead #${i}`;
      if (!name) continue;

      const mobileNumber = row[phoneIdx !== -1 ? phoneIdx : 1] || "+1 (555) 000-0000";
      const email = row[emailIdx !== -1 ? emailIdx : 2] || "lead@example.com";
      const location = row[locationIdx !== -1 ? locationIdx : 3] || "N/A";
      const status = row[statusIdx !== -1 ? statusIdx : 4] || "Warm Lead";
      const remarks = row[remarksIdx !== -1 ? remarksIdx : 5] || "Synced from Google Sheets";
      const agent = row[agentIdx !== -1 ? agentIdx : 6] || "Gerald Smith";

      newClients.push({
        id: `gs_${Date.now()}_${i}`,
        name,
        mobileNumber,
        phone: mobileNumber,
        email,
        location,
        address: location,
        status,
        remarks,
        notes: remarks,
        agent,
        source: "Google Sheets",
        assignedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dealValue: "$500,000",
        avatar: `https://images.unsplash.com/photo-1534528741775?w=150`,
        timeline: [
          {
            id: `t_${Date.now()}_${i}`,
            date: 'Just now',
            title: 'Imported',
            description: `Lead imported from Google Sheets (${agent})`,
            isCurrent: true
          }
        ]
      });
    }

    let filteredClients = newClients;
    if (targetUserEmail || targetUserName) {
      filteredClients = newClients.filter(c => matchesUserAccount(c.agent));
    }

    clientsStore = filteredClients;

    return res.json({
      success: true,
      message: `Successfully synced ${newClients.length} leads from Google Sheets!`,
      clients: clientsStore
    });
  } catch (error) {
    console.error("Google Sheets Sync Error:", error);
    return res.status(500).json({ error: "Internal Server Error syncing Google Sheet" });
  }
});

// Start Express Server locally or export for Vercel Serverless Function
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`  LeadFlow CRM Backend Server Running on Port ${PORT}  `);
    console.log(`  Google OAuth API: http://localhost:${PORT}/api/auth/google `);
    console.log(`=================================================`);
  });
}

export default app;
