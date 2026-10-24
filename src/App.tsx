/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/common/Toast';
import { LeadModal } from './components/modals/LeadModal';
import { SmartIntakeModal } from './components/modals/SmartIntakeModal';
import { LeadDetailDrawer } from './components/modals/LeadDetailDrawer';
import { FollowUpModal } from './components/modals/FollowUpModal';
import { QuickReplyModal } from './components/modals/QuickReplyModal';
import { DeleteLeadModal } from './components/modals/DeleteLeadModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { LeadsView } from './components/leads/LeadsView';
import { AIReplyGeneratorView } from './components/ai/AIReplyGeneratorView';
import { FollowUpsView } from './components/followups/FollowUpsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-60 flex flex-col min-w-0 min-h-screen">
        {/* Sticky Header */}
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {activeTab === 'dashboard' && <DashboardView searchQuery={searchQuery} />}
          {activeTab === 'leads' && <LeadsView searchQuery={searchQuery} />}
          {activeTab === 'ai-replies' && <AIReplyGeneratorView />}
          {activeTab === 'follow-ups' && <FollowUpsView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <LeadModal />
      <DeleteLeadModal />
      <SmartIntakeModal />
      <LeadDetailDrawer />
      <FollowUpModal />
      <QuickReplyModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
