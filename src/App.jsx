import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Navbar } from './components/Navbar';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { DashboardView } from './views/DashboardView';
import { ClientsView } from './views/ClientsView';
import { ClientDetailsView } from './views/ClientDetailsView';
import { AddClientView } from './views/AddClientView';
import { AlertsView } from './views/AlertsView';
import { SettingsView } from './views/SettingsView';
import { SignupView } from './views/SignupView';

const MainContent = () => {
  const { activeTab, isAuthenticated } = useCRM();

  if (!isAuthenticated || activeTab === 'signup') {
    return <SignupView />;
  }

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'clients':
      return <ClientsView />;
    case 'client_details':
      return <ClientDetailsView />;
    case 'add':
      return <AddClientView />;
    case 'alerts':
      return <AlertsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};

const AppContainer = () => {
  const { activeTab, isAuthenticated } = useCRM();
  const showNav = isAuthenticated && activeTab !== 'signup';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background dark:bg-[#111416] text-on-background dark:text-gray-100 flex flex-col font-body-md transition-colors duration-200">
      {showNav && <Navbar />}
      <MainContent />
      {showNav && <GlobalSearchModal />}
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <AppContainer />
    </CRMProvider>
  );
}
