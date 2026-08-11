import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { InfoModal } from '../components/InfoModal';
import { getInitialsAvatar } from '../utils/avatar';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "923401436308-7slk60pvog0sg8mh0um5c21mov1kempd.apps.googleusercontent.com";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' ? "http://localhost:5050" : window.location.origin);

// Helper: Extract JSON payload from Google ID Token JWT
const parseGoogleIdToken = (idToken) => {
  if (!idToken || typeof idToken !== 'string') return null;
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const SignupView = () => {
  const { loginWithUser, setActiveTab } = useCRM();

  const [infoModalType, setInfoModalType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [manualEmail, setManualEmail] = useState('');
  const [manualName, setManualName] = useState('');

  // Handle Google OAuth Credential or Email verification
  const handleGoogleCredentialResponse = async (credentialToken, directEmail, googleUserInfo = null) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      let extractedName = googleUserInfo?.name;
      let extractedPicture = googleUserInfo?.picture || googleUserInfo?.avatar;
      let extractedEmail = directEmail || googleUserInfo?.email;
      let extractedId = googleUserInfo?.sub || googleUserInfo?.id;

      if (credentialToken) {
        const decoded = parseGoogleIdToken(credentialToken);
        if (decoded) {
          if (decoded.name) extractedName = decoded.name;
          if (decoded.picture) extractedPicture = decoded.picture;
          if (decoded.email) extractedEmail = decoded.email;
          if (decoded.sub) extractedId = decoded.sub;
        }
      }

      // Debug: log exactly what Google returned
      console.log("[Google Auth] Raw Google profile received:", googleUserInfo);
      console.log("[Google Auth] Extracted - name:", extractedName, "| email:", extractedEmail, "| picture:", extractedPicture, "| id:", extractedId);

      const payloadBody = {
        credential: credentialToken || undefined,
        email: extractedEmail,
        name: extractedName || manualName.trim() || undefined,
        picture: extractedPicture,
        avatar: extractedPicture,
        id: extractedId
      };

      const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadBody)
      });

      const data = await res.json();
      console.log("[Google Auth] Server response data.user:", data.user);

      if (res.ok && data.success && data.user) {
        setShowEmailModal(false);

        // Build the authenticated user object from the direct Google profile data.
        // The client-side values (from Google UserInfo API) are authoritative.
        // Fall back to server data only if the client didn't receive them.
        const resolvedName = extractedName || data.user.name || (extractedEmail ? extractedEmail.split('@')[0] : "User");
        const resolvedPicture = extractedPicture || data.user.picture || data.user.avatar || getInitialsAvatar(resolvedName);
        const resolvedEmail = extractedEmail || data.user.email;
        const resolvedId = extractedId || data.user.id || ("g_" + Date.now());

        const googleUser = {
          id: resolvedId,
          name: resolvedName,
          email: resolvedEmail,
          picture: resolvedPicture,
          avatar: resolvedPicture,
          role: data.user.role || "Lead Specialist"
        };

        console.log("[Google Auth] Final user object being stored:", googleUser);
        console.log("[Google Auth] User name:", googleUser.name);
        console.log("[Google Auth] User email:", googleUser.email);
        console.log("[Google Auth] User picture:", googleUser.picture);

        loginWithUser(googleUser, data.token);
        setActiveTab('dashboard');
      } else {
        setErrorMessage(data.error || "Access Denied: Your Google account is not listed in the Google Sheet share settings.");
      }
    } catch (err) {
      console.error("Backend auth call error:", err);
      setErrorMessage("Unable to connect to authentication server. Please verify your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (GOOGLE_CLIENT_ID && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => handleGoogleCredentialResponse(response.credential)
        });
      } catch (e) {
        console.warn("Google SDK init warning:", e);
      }
    }
  }, []);

  const handleManualEmailSubmit = (e) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;
    handleGoogleCredentialResponse(null, manualEmail.trim(), { name: manualName.trim() });
  };

  // Triggers native Google Account Chooser popup
  const handleGoogleBtnClick = () => {
    setIsLoading(true);
    setErrorMessage('');

    // 1. Primary: Launch native Google Account Chooser popup via Google OAuth2 Token Client
    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const userInfo = await userInfoRes.json();
                if (userInfo && userInfo.email) {
                  handleGoogleCredentialResponse(null, userInfo.email, userInfo);
                  return;
                }
              } catch (err) {
                console.warn("Userinfo fetch error:", err);
              }
            }
            setIsLoading(false);
          }
        });
        client.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (e) {
        console.warn("Google OAuth2 popup init warning:", e);
      }
    }

    // 2. Fallback: Native Google One-Tap / ID Token prompt
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setIsLoading(false);
            setShowEmailModal(true);
          }
        });
        return;
      } catch (e) {
        console.warn("Google ID prompt error:", e);
      }
    }

    setIsLoading(false);
    setShowEmailModal(true);
  };

  return (
    <div className="bg-surface dark:bg-[#111416] text-on-surface dark:text-gray-100 min-h-screen flex flex-col items-center justify-center px-4 py-6 transition-colors duration-200">
      {/* Transactional Main Container */}
      <main className="w-full max-w-md min-w-0 flex flex-col items-center flex-grow justify-center space-y-lg py-8 animate-in fade-in duration-300">
        
        {/* Header Section */}
        <header className="text-center flex flex-col items-center">
          <img 
            src="/logo.png" 
            alt="LeadFlow CRM Logo" 
            className="w-20 h-20 mb-md object-contain drop-shadow-md"
          />
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-white font-bold mb-xs">
            LeadFlow CRM
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-gray-400">
            Enterprise Client Management & Operations
          </p>
        </header>

        {/* Hero Banner */}
        <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-container dark:bg-white/5 border border-surface-variant/40 dark:border-white/10 shadow-soft flex items-center justify-center group">
          <img 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            alt="CRM Dashboard Analytics"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDI2EemE1WS_aGtv-cDZ5HDVTVjj0VCr1jtvA3pPcrM9h8DPj1IjYfTG3k5-Lf6uSp3AeDfdTg6iiQ5NxKkPstwoiXPmcQbA61O57AYlWz0ckrxvxouxe8v4mnMtyjWVrHGHJUnufUqcdseI0lfGPKhdACCsGoDIWz0y5lZ2W2KZ3wjzjziYNgGuGmMUFSs0TbzC8GoFmVaQI0wx-scKAp2ByWhrmmPtEDixQbuAZWUUSWPBzXCbxz" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
          <span className="absolute bottom-3 left-4 text-xs font-semibold text-white/95 drop-shadow flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-emerald-400">verified_user</span>
            Live Google Workspace Authorization
          </span>
        </div>

        {/* Error Feedback Card */}
        {errorMessage && (
          <div className="w-full p-4 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-800/80 text-red-900 dark:text-red-200 text-xs font-semibold rounded-2xl text-center space-y-1 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-red-700 dark:text-red-300 font-bold">
              <span className="material-symbols-outlined text-base">gpp_bad</span>
              <span>Authorization Failed</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">{errorMessage}</p>
          </div>
        )}

        {/* Action Section */}
        <section className="w-full flex flex-col items-center space-y-md">
          {/* Security Badge */}
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 rounded-full text-[11px] font-semibold text-center">
            <span className="material-symbols-outlined text-xs shrink-0">shield_lock</span>
            <span>Access Restricted to Google Accounts on Share List</span>
          </div>

          {/* Primary Continue with Google Button */}
          <button 
            onClick={handleGoogleBtnClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-md bg-white dark:bg-[#1e2225] border border-outline-variant dark:border-white/20 rounded-full py-3.5 px-6 hover:bg-surface-container-lowest dark:hover:bg-white/10 transition-all shadow-sm text-on-surface dark:text-white font-button text-button group cursor-pointer disabled:opacity-50"
          >
            <svg height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"></path>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"></path>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"></path>
              <path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571c.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"></path>
            </svg>
            <span className="font-semibold text-sm">
              {isLoading ? 'Connecting to Google Accounts...' : 'Continue with Google'}
            </span>
          </button>

          <p className="font-body-md text-xs text-on-surface-variant dark:text-gray-400 text-center max-w-sm pt-1">
            Real-time permission audit powered by Google Drive API.
          </p>
        </section>
      </main>

      {/* Fallback Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-[#1e2225] border border-surface-variant dark:border-white/10 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-surface-variant/40 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-xl bg-primary-container/10 flex items-center justify-center text-primary dark:text-primary-fixed">
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                </span>
                <div>
                  <h3 className="font-bold text-base text-on-surface dark:text-white">
                    Google Account Verification
                  </h3>
                  <p className="text-[11px] text-on-surface-variant dark:text-gray-400">
                    Verify Share Settings Permission
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white p-1 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <p className="text-xs text-on-surface-variant dark:text-gray-300 leading-relaxed">
              Enter your Google Account email address below to verify if your account is listed in the Google Sheet share permissions:
            </p>

            <form onSubmit={handleManualEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-gray-200 mb-1.5">
                  Full Name (Optional)
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">person</span>
                  <input
                    type="text"
                    placeholder="e.g. Gerald De Lima"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary text-on-surface dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface dark:text-gray-200 mb-1.5">
                  Google Email Address *
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">mail</span>
                  <input
                    type="email"
                    required
                    placeholder="user@gmail.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-surface-container-lowest dark:bg-white/5 border border-surface-variant dark:border-white/10 rounded-xl text-sm outline-none focus:border-primary text-on-surface dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-on-surface-variant dark:text-gray-400 hover:bg-surface-container rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-primary-container text-on-primary font-semibold text-xs rounded-xl shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      Checking Permission...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">lock_open</span>
                      Verify & Sign In
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full text-center pb-lg flex flex-col items-center space-y-xs">
        <p className="font-label-md text-label-md text-outline dark:text-gray-500">Version 1.0</p>
        <div className="flex space-x-md font-label-md text-label-md text-primary dark:text-primary-fixed">
          <button 
            onClick={() => setInfoModalType('privacy')}
            className="hover:underline cursor-pointer"
          >
            Privacy Policy
          </button>
          <span className="text-outline-variant dark:text-gray-600">•</span>
          <button 
            onClick={() => setInfoModalType('terms')}
            className="hover:underline cursor-pointer"
          >
            Terms of Service
          </button>
        </div>
      </footer>

      <InfoModal
        type={infoModalType}
        isOpen={!!infoModalType}
        onClose={() => setInfoModalType(null)}
      />
    </div>
  );
};
