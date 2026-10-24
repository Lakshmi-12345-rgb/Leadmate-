import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  DollarSign,
  CalendarClock,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  ChevronRight,
  Building,
  Target,
  Plus,
  PlusCircle,
  RotateCcw,
  Trash2,
  Calendar,
  Layers,
  ArrowUpRight,
  Check,
} from 'lucide-react';
import { LeadStatus, Lead } from '../../types';

interface DashboardViewProps {
  searchQuery: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ searchQuery }) => {
  const {
    leads,
    followUps,
    settings,
    setActiveTab,
    setActiveLeadForDrawer,
    openReplyGeneratorForLead,
    setIsSmartIntakeModalOpen,
    openCreateLeadModal,
    setIsQuickReplyModalOpen,
    openLeadsWithFilter,
    openFollowUpsWithTab,
    toggleFollowUpComplete,
    rescheduleFollowUp,
    resetToDemoData,
    clearAllLeads,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Core Calculated Metrics (from actual lead data)
  const totalLeadsCount = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New' || l.status === 'New Enquiry');
  const convertedLeads = leads.filter((l) => l.status === 'Won');
  const wonValue = convertedLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

  // Prevent deleted leads from leaving broken follow-up references
  const leadIdsSet = useMemo(() => new Set(leads.map((l) => l.id)), [leads]);
  const validFollowUps = useMemo(() => followUps.filter((f) => leadIdsSet.has(f.leadId)), [followUps, leadIdsSet]);

  // Leads requiring follow-up: leads that have pending follow-ups
  const pendingFollowUps = validFollowUps.filter((f) => f.status === 'pending');
  const overdueFollowUps = pendingFollowUps.filter((f) => f.dueDate < todayStr);
  const todayFollowUps = pendingFollowUps.filter((f) => f.dueDate === todayStr);
  const leadsNeedingFollowUpIds = new Set(pendingFollowUps.map((f) => f.leadId));

  const leadsRequiringFollowUpCount = leads.filter(
    (l) =>
      leadsNeedingFollowUpIds.has(l.id) ||
      l.status === 'Proposal Sent' ||
      l.status === 'Interested' ||
      l.status === 'New' ||
      l.status === 'New Enquiry'
  ).length;

  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const totalDecided = convertedLeads.length + leads.filter((l) => l.status === 'Lost').length;
  const winRate = totalDecided > 0 ? Math.round((convertedLeads.length / totalDecided) * 100) : 0;

  // Upcoming and today's follow-ups
  const upcomingFollowUps = pendingFollowUps
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  // Pipeline Stage Distribution: New, Contacted, Interested, Won, Lost
  const stages: {
    label: string;
    filterKey: string;
    color: string;
    match: (s: LeadStatus) => boolean;
  }[] = [
    { label: 'New', filterKey: 'New', color: 'bg-sky-400', match: (s) => s === 'New' || s === 'New Enquiry' },
    { label: 'Contacted', filterKey: 'Contacted', color: 'bg-amber-400', match: (s) => s === 'Contacted' },
    {
      label: 'Interested',
      filterKey: 'Interested',
      color: 'bg-violet-400',
      match: (s) => s === 'Interested' || s === 'Meeting Scheduled' || s === 'Proposal Sent',
    },
    { label: 'Won', filterKey: 'Won', color: 'bg-emerald-400', match: (s) => s === 'Won' },
    { label: 'Lost', filterKey: 'Lost', color: 'bg-slate-500', match: (s) => s === 'Lost' },
  ];

  const stageCounts = stages.map((st) => ({
    ...st,
    count: leads.filter((l) => st.match(l.status)).length,
    value: leads
      .filter((l) => st.match(l.status))
      .reduce((sum, l) => sum + (l.dealValue || 0), 0),
  }));

  // Recent Activity Feed: aggregate latest events from all leads
  const recentActivity = useMemo(() => {
    const events: Array<{
      id: string;
      lead: Lead;
      title: string;
      content: string;
      timestamp: string;
      type: string;
    }> = [];

    leads.forEach((l) => {
      (l.timeline || []).forEach((item) => {
        events.push({
          id: `${l.id}-${item.id}`,
          lead: l,
          title: item.title,
          content: item.content,
          timestamp: item.timestamp,
          type: item.type,
        });
      });
    });

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [leads]);

  // Lead creation and conversion trend chart data (past 7 days)
  const trendData = useMemo(() => {
    const days: { label: string; dateStr: string; created: number; converted: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      const created = leads.filter((l) => (l.createdAt || '').startsWith(dateStr)).length;
      const converted = leads.filter(
        (l) => l.status === 'Won' && (l.lastContactDate || l.createdAt || '').startsWith(dateStr)
      ).length;

      days.push({ label, dateStr, created, converted });
    }

    return days;
  }, [leads]);

  const maxTrendVal = Math.max(
    ...trendData.map((d) => Math.max(d.created, d.converted)),
    3
  );

  // Top proactive recommendation lead
  const topPriorityLead =
    leads.find((l) => l.status === 'Proposal Sent') ||
    leads.find((l) => l.scoreTier === 'Hot') ||
    leads[0];

  return (
    <div className="space-y-6">
      {/* Workspace Demo Status & Quick Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-slate-200">
            {leads.length > 0 ? 'Live Workspace Active' : 'New Workspace'}
          </span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">
            {leads.length > 0
              ? `${leads.length} total opportunities in database`
              : 'No leads currently stored'}
          </span>
        </div>

        {/* Quick Demo Utilities */}
        <div className="flex items-center gap-2">
          {leads.length > 0 ? (
            <button
              onClick={() => {
                if (confirm('Clear all leads to preview new user empty states?')) {
                  clearAllLeads();
                }
              }}
              className="px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors flex items-center gap-1 cursor-pointer"
              title="Clear all leads to view empty states"
            >
              <Trash2 className="w-3 h-3 text-slate-500" />
              Test Empty State
            </button>
          ) : (
            <button
              onClick={resetToDemoData}
              className="px-2.5 py-1 text-[11px] font-mono text-violet-300 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Load Sample Demo Leads
            </button>
          )}

          <button
            onClick={() => setIsSmartIntakeModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
            AI Intake
          </button>

          <button
            onClick={() => setIsQuickReplyModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded transition-colors flex items-center gap-1 cursor-pointer"
            title="Quick action to generate an AI reply"
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
            Quick AI Reply
          </button>

          <button
            onClick={openCreateLeadModal}
            className="px-3 py-1 text-[11px] font-medium text-white bg-violet-600 hover:bg-violet-500 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shadow-violet-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Empty State for New Users */}
      {leads.length === 0 ? (
        <div className="p-8 sm:p-12 bg-[#111827]/90 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">Welcome to LeadMate AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your business dashboard is currently empty. Add your first customer enquiry, paste raw email text with AI Smart Intake, or load our realistic demo dataset.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              onClick={openCreateLeadModal}
              className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Add First Lead Manually
            </button>
            <button
              onClick={() => setIsSmartIntakeModalOpen(true)}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Paste Email with AI Intake
            </button>
            <button
              onClick={resetToDemoData}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Load Demo Workspace
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top 4 Business KPI Cards (Clickable to filtered views) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Total Leads */}
            <div
              onClick={() => openLeadsWithFilter('all')}
              className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80 hover:border-slate-700 hover:bg-[#141E30] transition-all cursor-pointer group"
              title="Click to view all leads"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Total Leads</span>
                <Users className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 transition-colors" />
              </div>
              <p className="text-2xl font-bold font-mono text-white mt-1.5 tabular-nums">
                {totalLeadsCount}
              </p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Across all stages</span>
                <span className="text-violet-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  View <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* 2. New Leads */}
            <div
              onClick={() => openLeadsWithFilter('New Enquiry')}
              className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80 hover:border-sky-800/70 hover:bg-[#141E30] transition-all cursor-pointer group"
              title="Click to filter by New Enquiries"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>New Leads</span>
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              </div>
              <p className="text-2xl font-bold font-mono text-sky-400 mt-1.5 tabular-nums">
                {newLeads.length}
              </p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>Awaiting first contact</span>
                <span className="text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Filter <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* 3. Leads Requiring Follow-Up */}
            <div
              onClick={() => openFollowUpsWithTab('today')}
              className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80 hover:border-amber-800/70 hover:bg-[#141E30] transition-all cursor-pointer group"
              title="Click to view scheduled follow-ups"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Requires Follow-Up</span>
                <CalendarClock className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-amber-400 mt-1.5 tabular-nums">
                {leadsRequiringFollowUpCount}
              </p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>
                  {overdueFollowUps.length > 0 ? (
                    <span className="text-rose-400 font-semibold">{overdueFollowUps.length} overdue</span>
                  ) : todayFollowUps.length > 0 ? (
                    <span className="text-amber-400 font-semibold">{todayFollowUps.length} due today</span>
                  ) : (
                    `${pendingFollowUps.length} pending tasks`
                  )}
                </span>
                <span className="text-amber-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Cadence <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* 4. Converted Leads */}
            <div
              onClick={() => openLeadsWithFilter('Won')}
              className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80 hover:border-emerald-800/70 hover:bg-[#141E30] transition-all cursor-pointer group"
              title="Click to view Won deals"
            >
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Converted Leads</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold font-mono text-emerald-400 mt-1.5 tabular-nums">
                {convertedLeads.length}
              </p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                <span>${wonValue.toLocaleString()} won ({winRate}%)</span>
                <span className="text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Won <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick AI Action Card for Top Priority Lead */}
          {topPriorityLead && (
            <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 text-violet-400 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-violet-300">
                      Quick Sales Assistant Action
                    </span>
                    <span className="text-[10px] text-slate-500">·</span>
                    <span className="text-[10px] font-mono text-slate-400">Priority Opportunity</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-100 mt-0.5">
                    {topPriorityLead.status === 'Proposal Sent'
                      ? `Follow up on proposal sent to ${topPriorityLead.name} (${topPriorityLead.company || 'Client'})`
                      : `Fast-track response for ${topPriorityLead.name} · ${topPriorityLead.service}`}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed max-w-2xl line-clamp-1">
                    {topPriorityLead.inquiry || topPriorityLead.notes || 'Inquired about services. Deal value $' + topPriorityLead.dealValue}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => openReplyGeneratorForLead(topPriorityLead)}
                  className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                  <span>Generate AI Reply</span>
                </button>
                <button
                  onClick={() => setActiveLeadForDrawer(topPriorityLead)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  View Lead
                </button>
              </div>
            </div>
          )}

          {/* Lead Creation and Conversion Trends Chart */}
          <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  Lead Creation & Conversion Trends (Past 7 Days)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Calculated dynamically from real lead timestamps and stage history
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-violet-500"></span>
                  <span className="text-slate-300 text-[11px]">New Inquiries</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400"></span>
                  <span className="text-slate-300 text-[11px]">Converted Deals</span>
                </div>
              </div>
            </div>

            {/* Trend Bars Plot */}
            <div className="pt-2">
              <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 border-b border-slate-800 pb-2">
                {trendData.map((d, idx) => {
                  const createdHeightPct = Math.round((d.created / maxTrendVal) * 100);
                  const convertedHeightPct = Math.round((d.converted / maxTrendVal) * 100);

                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full max-w-[48px] flex items-end justify-center gap-1 h-28 relative">
                        {/* Tooltip on hover */}
                        <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-700 text-[10px] text-slate-200 px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10 font-mono">
                          {d.created} in / {d.converted} won
                        </div>

                        {/* Bar 1: Created */}
                        <div
                          className="w-1/2 bg-violet-600/80 group-hover:bg-violet-500 rounded-t transition-all"
                          style={{
                            height: `${Math.max(createdHeightPct, d.created > 0 ? 12 : 4)}%`,
                          }}
                          title={`${d.created} created`}
                        />

                        {/* Bar 2: Converted */}
                        <div
                          className="w-1/2 bg-emerald-500/80 group-hover:bg-emerald-400 rounded-t transition-all"
                          style={{
                            height: `${Math.max(convertedHeightPct, d.converted > 0 ? 12 : 4)}%`,
                          }}
                          title={`${d.converted} converted`}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 text-center truncate w-full">
                        {d.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-slate-500">
                <span>Total Active Pipeline: ${pipelineValue.toLocaleString()}</span>
                <span>Conversion Velocity: {winRate}% win rate</span>
              </div>
            </div>
          </div>

          {/* Dual Column Layout: Pipeline Summary & Follow-Ups / Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (2 Cols): Pipeline Summary & Upcoming Follow-ups */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lead Pipeline Summary (Clickable stages) */}
              <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      Lead Pipeline Summary
                    </h3>
                  </div>
                  <button
                    onClick={() => openLeadsWithFilter('all')}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pipeline Board</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {stageCounts.map((st, idx) => {
                    const pct = leads.length > 0 ? Math.round((st.count / leads.length) * 100) : 0;
                    return (
                      <div
                        key={idx}
                        onClick={() => openLeadsWithFilter(st.filterKey)}
                        className="p-2.5 bg-[#0D1322] hover:bg-[#131D33] rounded-lg border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer group space-y-1.5"
                        title={`Click to filter leads by ${st.label}`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${st.color}`}></span>
                            <span className="font-medium text-slate-200 group-hover:text-violet-300 transition-colors">
                              {st.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 font-mono text-[11px] tabular-nums">
                            <span className="text-slate-300 font-semibold">{st.count} leads</span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-200 font-medium">${st.value.toLocaleString()}</span>
                            <span className="text-slate-500">({pct}%)</span>
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${st.color} transition-all duration-300 rounded-full`}
                            style={{ width: `${Math.max(pct, st.count > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Upcoming Follow-ups List */}
              <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      Upcoming Sales Follow-Ups
                    </h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {pendingFollowUps.length} pending
                    </span>
                  </div>
                  <button
                    onClick={() => openFollowUpsWithTab('today')}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <span>Follow-ups Cadence</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {upcomingFollowUps.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500/80 mx-auto mb-1.5" />
                    <p className="font-medium text-slate-300">All follow-ups complete!</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      No scheduled outreach currently pending.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {upcomingFollowUps.map((fu) => {
                      const targetLead = leads.find((l) => l.id === fu.leadId);
                      const isToday = fu.dueDate === todayStr;

                      return (
                        <div
                          key={fu.id}
                          className="p-3 bg-[#0D1322] hover:bg-[#131D33] rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => toggleFollowUpComplete(fu.id)}
                              className="w-4 h-4 rounded border border-slate-600 hover:border-violet-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title="Mark as completed"
                            >
                              {fu.status === 'completed' && <Check className="w-3 h-3 text-emerald-400" />}
                            </button>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-medium text-slate-200 truncate">
                                  {fu.title}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 capitalize">
                                  {fu.channel}
                                </span>
                                {isToday && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950/60 text-amber-300 border border-amber-900/60">
                                    Due Today
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {fu.leadName} {fu.leadCompany ? `(${fu.leadCompany})` : ''} · Due {fu.dueDate}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {targetLead && (
                              <button
                                onClick={() => openReplyGeneratorForLead(targetLead)}
                                className="px-2 py-1 text-[11px] font-medium text-violet-300 bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                title="Draft reply for this lead"
                              >
                                <Sparkles className="w-3 h-3 text-violet-400" />
                                Reply
                              </button>
                            )}
                            <button
                              onClick={() => rescheduleFollowUp(fu.id, 2)}
                              className="px-2 py-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Reschedule +2 days"
                            >
                              +2d
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (1 Col): Recent Lead Activity & Quick Links */}
            <div className="space-y-6">
              {/* Recent Lead Activity Feed */}
              <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
                      Recent Lead Activity
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Live stream</span>
                </div>

                {recentActivity.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No recent activity recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentActivity.map((act) => (
                      <div
                        key={act.id}
                        onClick={() => setActiveLeadForDrawer(act.lead)}
                        className="p-2.5 bg-[#0D1322] hover:bg-[#131D33] rounded-lg border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                            {act.lead.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">
                            {new Date(act.timestamp).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-slate-300 mt-0.5 truncate">
                          {act.title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 leading-normal">
                          {act.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fast Action Shortcuts */}
              <div className="p-5 bg-[#0D1322] rounded-xl border border-slate-800 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Sales Shortcuts
                </h4>

                <button
                  onClick={openCreateLeadModal}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs text-slate-200 font-medium">Add Opportunity</span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <button
                  onClick={() => setIsQuickReplyModalOpen(true)}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs text-slate-200 font-medium">AI Quick Reply</span>
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-left p-2.5 rounded-lg bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 transition-colors cursor-pointer flex items-center justify-between"
                >
                  <span className="text-xs text-slate-200 font-medium">Full Analytics Report</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
