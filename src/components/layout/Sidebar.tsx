import React from 'react';
import { useApp, ActiveTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Sparkles,
  CalendarClock,
  BarChart3,
  Settings,
  PlusCircle,
  Building2,
  ChevronRight,
  RotateCcw,
  Layers,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    activeTab,
    setActiveTab,
    leads,
    followUps,
    settings,
    setIsSmartIntakeModalOpen,
    setIsNewLeadModalOpen,
    resetToDemoData,
  } = useApp();

  const activeLeadsCount = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const followUpsDueToday = followUps.filter((f) => f.dueDate === todayStr && f.status === 'pending').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; count?: number; countHighlight?: boolean }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'leads',
      label: 'Pipeline & Leads',
      icon: <Users className="w-4 h-4" />,
      count: activeLeadsCount,
    },
    {
      id: 'ai-replies',
      label: 'AI Reply Studio',
      icon: <Sparkles className="w-4 h-4 text-violet-400" />,
    },
    {
      id: 'follow-ups',
      label: 'Follow-ups',
      icon: <CalendarClock className="w-4 h-4" />,
      count: followUpsDueToday > 0 ? followUpsDueToday : undefined,
      countHighlight: followUpsDueToday > 0,
    },
    {
      id: 'analytics',
      label: 'Performance',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (id: ActiveTab) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#090D16] text-slate-300 flex flex-col border-r border-slate-800/80 transition-transform duration-200 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">LeadMate</span>
                <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  AI
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => {
              setIsSmartIntakeModalOpen(true);
              setMobileOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg shadow-xs shadow-violet-950/40 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-violet-200" />
              Smart Intake
            </span>
            <span className="text-[10px] text-violet-200 bg-violet-700/60 px-1.5 py-0.5 rounded font-mono">
              Paste
            </span>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <div className="px-2 pt-2 pb-1.5 text-[10px] font-semibold text-slate-300 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-violet-600/15 text-violet-200 font-semibold border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-violet-400' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.2 rounded ${
                      item.countHighlight
                        ? 'bg-amber-500/20 text-amber-300 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Business Context & Reset */}
        <div className="p-3 border-t border-slate-800/80 space-y-2 bg-[#080C14]">
          <div
            onClick={() => setActiveTab('settings')}
            className="p-2 rounded-lg bg-slate-900/80 hover:bg-slate-850 border border-slate-800 flex items-center justify-between cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">{settings.businessName}</p>
                <p className="text-[10px] text-slate-300 truncate">{settings.ownerName}</p>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          </div>

          <div className="flex items-center justify-between px-1.5 text-[11px] text-slate-300">
            <span>Demo Workspace</span>
            <button
              onClick={() => resetToDemoData()}
              className="text-slate-300 hover:text-violet-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset demo data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
