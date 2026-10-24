import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Plus,
  Sparkles,
  Bell,
  Search,
  X,
  ChevronRight,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileMenu,
  searchQuery,
  setSearchQuery,
}) => {
  const {
    activeTab,
    openCreateLeadModal,
    setIsSmartIntakeModalOpen,
    notifications,
    markNotificationRead,
    clearNotifications,
    settings,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const sectionMeta: Record<string, { label: string; desc: string }> = {
    dashboard: {
      label: 'Dashboard',
      desc: `Sales overview for ${settings.businessName}`,
    },
    leads: {
      label: 'Pipeline & Leads',
      desc: 'Opportunity tracking across pipeline stages',
    },
    'ai-replies': {
      label: 'AI Reply Studio',
      desc: 'Personalized sales responses and quote generators',
    },
    'follow-ups': {
      label: 'Follow-ups Cadence',
      desc: 'Multi-channel scheduled prospect touchpoints',
    },
    analytics: {
      label: 'Performance Analytics',
      desc: 'Pipeline conversion velocity and channel metrics',
    },
    settings: {
      label: 'Settings',
      desc: 'Workspace profile, calendar link, and core services',
    },
  };

  const current = sectionMeta[activeTab] || {
    label: 'LeadMate AI',
    desc: 'Sales Assistant for Small Business',
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-2.5 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumb / Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 -ml-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>LeadMate</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-semibold text-slate-100">{current.label}</span>
            </div>
            <p className="text-[11px] text-slate-300 hidden sm:block truncate mt-0.5">
              {current.desc}
            </p>
          </div>
        </div>

        {/* Center: Search Field */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads, services, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#0F172A] hover:bg-[#131D33] focus:bg-[#0F172A] text-slate-200 placeholder-slate-400 border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Primary actions & Notifications */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Smart Intake Secondary Button */}
          <button
            onClick={() => setIsSmartIntakeModalOpen(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            title="Paste raw text or inquiry email"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Smart Intake</span>
          </button>

          {/* New Lead Primary Button */}
          <button
            onClick={openCreateLeadModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-xs shadow-violet-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Lead</span>
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg relative transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-400 rounded-full"></span>
              )}
            </button>

            {isNotifOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setIsNotifOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#0F172A] rounded-xl shadow-2xl border border-slate-800 py-2 z-40 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-mono bg-violet-500/20 text-violet-300 px-1.5 py-0.2 rounded">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        className="text-[11px] text-slate-300 hover:text-violet-300 cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-850">
                    {notifications.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-300">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-3 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                            !n.read ? 'bg-violet-950/20' : ''
                          }`}
                        >
                          <p className="text-xs font-medium text-slate-200 truncate">{n.title}</p>
                          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] font-mono text-slate-300 mt-1 block">
                            {n.timestamp}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search input */}
      <div className="mt-2.5 md:hidden">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads, services, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-[#0F172A] text-slate-200 placeholder-slate-400 border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
