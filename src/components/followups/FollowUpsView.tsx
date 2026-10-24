import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarClock,
  Plus,
  Sparkles,
  Clock,
  Mail,
  Phone,
  MessageSquare,
  Video,
  Filter,
  Check,
  Trash2,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  User,
  ArrowUpDown,
  Search,
  ExternalLink,
  Ban,
  ChevronRight,
  Info,
} from 'lucide-react';
import { FollowUp, FollowUpStatus, Lead } from '../../types';

export const FollowUpsView: React.FC = () => {
  const {
    followUps,
    leads,
    toggleFollowUpComplete,
    rescheduleFollowUp,
    cancelFollowUp,
    deleteFollowUp,
    addFollowUp,
    openReplyGeneratorForLead,
    setActiveLeadForDrawer,
    setIsFollowUpModalOpen,
    followUpFilterTab,
    setFollowUpFilterTab,
    settings,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLeadFilter, setSelectedLeadFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_asc' | 'date_desc' | 'priority' | 'lead_name'>('date_asc');
  const [rescheduleMenuId, setRescheduleMenuId] = useState<string | null>(null);
  const [customRescheduleDate, setCustomRescheduleDate] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Prevent deleted leads from leaving broken references:
  // Map leads by id for fast lookups and clean reference integrity
  const leadsMap = useMemo(() => {
    const map = new Map<string, Lead>();
    leads.forEach((l) => map.set(l.id, l));
    return map;
  }, [leads]);

  // Tab counts based on real dates & status
  const overdueCount = followUps.filter(
    (f) => f.status === 'pending' && f.dueDate < todayStr && leadsMap.has(f.leadId)
  ).length;

  const todayCount = followUps.filter(
    (f) => f.status === 'pending' && f.dueDate === todayStr && leadsMap.has(f.leadId)
  ).length;

  const upcomingCount = followUps.filter(
    (f) => f.status === 'pending' && f.dueDate > todayStr && leadsMap.has(f.leadId)
  ).length;

  const completedCount = followUps.filter(
    (f) => f.status === 'completed' && leadsMap.has(f.leadId)
  ).length;

  const cancelledCount = followUps.filter(
    (f) => f.status === 'cancelled' && leadsMap.has(f.leadId)
  ).length;

  // Filtered and Sorted list
  const filteredFollowUps = useMemo(() => {
    return followUps
      .filter((fu) => {
        // Enforce lead reference integrity: if lead is deleted, skip or hide
        const associatedLead = leadsMap.get(fu.leadId);
        if (!associatedLead) return false;

        // 1. Tab status filter
        if (followUpFilterTab === 'overdue') {
          if (fu.status !== 'pending' || fu.dueDate >= todayStr) return false;
        } else if (followUpFilterTab === 'today') {
          if (fu.status !== 'pending' || fu.dueDate !== todayStr) return false;
        } else if (followUpFilterTab === 'upcoming') {
          if (fu.status !== 'pending' || fu.dueDate <= todayStr) return false;
        } else if (followUpFilterTab === 'completed') {
          if (fu.status !== 'completed') return false;
        } else if (followUpFilterTab === 'cancelled') {
          if (fu.status !== 'cancelled') return false;
        }

        // 2. Specific Lead Filter
        if (selectedLeadFilter !== 'all' && fu.leadId !== selectedLeadFilter) {
          return false;
        }

        // 3. Channel filter
        if (channelFilter !== 'all' && fu.channel !== channelFilter) {
          return false;
        }

        // 4. Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matches =
            fu.title.toLowerCase().includes(q) ||
            fu.leadName.toLowerCase().includes(q) ||
            (fu.leadCompany && fu.leadCompany.toLowerCase().includes(q)) ||
            (fu.notes && fu.notes.toLowerCase().includes(q)) ||
            (fu.suggestedMessage && fu.suggestedMessage.toLowerCase().includes(q));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date_asc') {
          return a.dueDate.localeCompare(b.dueDate);
        }
        if (sortBy === 'date_desc') {
          return b.dueDate.localeCompare(a.dueDate);
        }
        if (sortBy === 'priority') {
          const rank = { high: 3, medium: 2, low: 1 };
          return (rank[b.priority] || 0) - (rank[a.priority] || 0);
        }
        if (sortBy === 'lead_name') {
          return a.leadName.localeCompare(b.leadName);
        }
        return 0;
      });
  }, [
    followUps,
    leadsMap,
    followUpFilterTab,
    selectedLeadFilter,
    channelFilter,
    searchQuery,
    sortBy,
    todayStr,
  ]);

  const getChannelIcon = (ch?: string) => {
    if (ch === 'whatsapp') return <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />;
    if (ch === 'phone') return <Phone className="w-3.5 h-3.5 text-sky-400" />;
    if (ch === 'meeting') return <Video className="w-3.5 h-3.5 text-violet-400" />;
    return <Mail className="w-3.5 h-3.5 text-indigo-400" />;
  };

  const getLeadStatusBadge = (status?: string) => {
    if (!status) return null;
    const map: Record<string, string> = {
      New: 'text-sky-300 bg-sky-950/50 border-sky-800/50',
      'New Enquiry': 'text-sky-300 bg-sky-950/50 border-sky-800/50',
      Contacted: 'text-amber-300 bg-amber-950/50 border-amber-800/50',
      Interested: 'text-violet-300 bg-violet-950/50 border-violet-800/50',
      'Meeting Scheduled': 'text-violet-300 bg-violet-950/50 border-violet-800/50',
      'Proposal Sent': 'text-indigo-300 bg-indigo-950/50 border-indigo-800/50',
      Won: 'text-emerald-300 bg-emerald-950/50 border-emerald-800/50',
      Lost: 'text-slate-400 bg-slate-800/50 border-slate-700/50',
    };
    return (
      <span
        className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border ${
          map[status] || 'text-slate-400 bg-slate-800 border-slate-700'
        }`}
      >
        {status}
      </span>
    );
  };

  const getDueDateLabel = (dueDate: string, dueTime?: string) => {
    if (dueDate < todayStr) {
      const daysAgo = Math.round(
        (new Date(todayStr).getTime() - new Date(dueDate).getTime()) / (24 * 3600 * 1000)
      );
      return (
        <span className="text-rose-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
          <AlertCircle className="w-3 h-3 text-rose-400" />
          Overdue by {daysAgo} {daysAgo === 1 ? 'day' : 'days'} ({new Date(dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })})
        </span>
      );
    }
    if (dueDate === todayStr) {
      return (
        <span className="text-amber-400 font-semibold flex items-center gap-1 font-mono text-[11px]">
          <Clock className="w-3 h-3 text-amber-400" />
          Due Today {dueTime ? `· ${dueTime}` : ''}
        </span>
      );
    }
    return (
      <span className="text-slate-300 font-medium flex items-center gap-1 font-mono text-[11px]">
        <Calendar className="w-3 h-3 text-slate-500" />
        {new Date(dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })} {dueTime ? `· ${dueTime}` : ''}
      </span>
    );
  };

  const handleApplyCustomReschedule = (fuId: string) => {
    if (!customRescheduleDate) return;
    rescheduleFollowUp(fuId, customRescheduleDate);
    setRescheduleMenuId(null);
    setCustomRescheduleDate('');
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Stats Overview */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Follow-up Cadence</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/50">
              {followUps.filter((f) => f.status === 'pending' && leadsMap.has(f.leadId)).length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize scheduled outreach touchpoints, prevent dropped leads, and draft replies with 1-click AI
          </p>
        </div>

        <button
          onClick={() => setIsFollowUpModalOpen(true)}
          className="px-3.5 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs shadow-violet-950/40"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule Follow-Up</span>
        </button>
      </div>

      {/* In-app reminder disclaimer banner */}
      <div className="p-3 bg-[#111827] border border-slate-800/80 rounded-xl flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            <strong className="text-slate-300">In-App Follow-up Tracker:</strong> Automatic email/WhatsApp dispatch requires external SMTP/Twilio configuration. Use <strong>"AI Reply"</strong> to draft your response and send via your preferred email client.
          </span>
        </div>
      </div>

      {/* Filter Tabs: Overdue, Today, Upcoming, Completed, All */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
        {[
          {
            id: 'overdue',
            label: 'Overdue',
            count: overdueCount,
            color: 'text-rose-400',
            border: 'border-rose-900/50',
            bg: 'bg-rose-950/20',
          },
          {
            id: 'today',
            label: 'Due Today',
            count: todayCount,
            color: 'text-amber-400',
            border: 'border-amber-900/50',
            bg: 'bg-amber-950/20',
          },
          {
            id: 'upcoming',
            label: 'Upcoming',
            count: upcomingCount,
            color: 'text-violet-400',
            border: 'border-violet-900/50',
            bg: 'bg-violet-950/20',
          },
          {
            id: 'completed',
            label: 'Completed',
            count: completedCount,
            color: 'text-emerald-400',
            border: 'border-emerald-900/50',
            bg: 'bg-emerald-950/20',
          },
          {
            id: 'all',
            label: 'All Tasks',
            count: followUps.filter((f) => leadsMap.has(f.leadId)).length,
            color: 'text-slate-300',
            border: 'border-slate-800',
            bg: 'bg-[#111827]',
          },
        ].map((tab) => {
          const isActive = followUpFilterTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFollowUpFilterTab(tab.id as any)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? `${tab.bg} ${tab.border} ring-1 ring-violet-500/50 shadow-xs`
                  : 'bg-[#111827]/70 border-slate-800/80 hover:bg-[#111827] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-semibold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                  {tab.label}
                </span>
                <span className={`font-mono text-sm font-bold ${tab.color}`}>
                  {tab.count}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1">
                {tab.id === 'overdue' && 'Action required'}
                {tab.id === 'today' && 'Scheduled for today'}
                {tab.id === 'upcoming' && 'Scheduled future'}
                {tab.id === 'completed' && 'Logged & completed'}
                {tab.id === 'all' && 'Total in-app tasks'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search task title or lead */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reminder, prospect, notes..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Filter by Task Status */}
          <div>
            <select
              value={followUpFilterTab}
              onChange={(e) => setFollowUpFilterTab(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
            >
              <option value="all">All Task Statuses ({followUps.filter((f) => leadsMap.has(f.leadId)).length})</option>
              <option value="overdue">Overdue ({overdueCount})</option>
              <option value="today">Due Today ({todayCount})</option>
              <option value="upcoming">Upcoming ({upcomingCount})</option>
              <option value="completed">Completed ({completedCount})</option>
              <option value="cancelled">Cancelled ({cancelledCount})</option>
            </select>
          </div>

          {/* Filter by Lead */}
          <div>
            <select
              value={selectedLeadFilter}
              onChange={(e) => setSelectedLeadFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Associated Leads ({leads.length})</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} {l.company ? `(${l.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="date_asc">Date: Soonest First</option>
              <option value="date_desc">Date: Furthest First</option>
              <option value="priority">Priority: High to Low</option>
              <option value="lead_name">Lead: A to Z</option>
            </select>
          </div>
        </div>

        {/* Channel Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-medium">Channel:</span>
            {['all', 'email', 'phone', 'whatsapp', 'meeting'].map((ch) => (
              <button
                key={ch}
                onClick={() => setChannelFilter(ch)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  channelFilter === ch
                    ? 'bg-violet-600 text-white font-semibold'
                    : 'bg-[#0F172A] text-slate-400 hover:text-slate-200 border border-slate-700/80'
                }`}
              >
                {ch.toUpperCase()}
              </button>
            ))}
          </div>

          {(searchQuery || selectedLeadFilter !== 'all' || channelFilter !== 'all' || followUpFilterTab !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLeadFilter('all');
                setChannelFilter('all');
                setFollowUpFilterTab('all');
              }}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List / Empty States */}
      {leads.length === 0 ? (
        /* No leads in workspace */
        <div className="p-12 bg-[#111827]/80 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Leads to Follow Up With</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Follow-ups are linked directly to your customer enquiries. Create a lead first to schedule structured outreach touchpoints.
            </p>
          </div>
        </div>
      ) : filteredFollowUps.length === 0 ? (
        /* Empty matching current tab / filter */
        <div className="p-10 bg-[#111827]/70 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-white">No follow-ups found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {followUpFilterTab === 'overdue' && 'Great job! You have zero overdue follow-up tasks.'}
              {followUpFilterTab === 'today' && 'No follow-up reminders scheduled for today.'}
              {followUpFilterTab === 'upcoming' && 'No upcoming follow-ups scheduled for future dates.'}
              {followUpFilterTab === 'completed' && 'No completed tasks yet. Mark tasks done as you reach out.'}
              {followUpFilterTab === 'all' && 'No follow-up tasks match your active search or lead filters.'}
            </p>
          </div>
          <button
            onClick={() => setIsFollowUpModalOpen(true)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Follow-up
          </button>
        </div>
      ) : (
        /* Follow-Up Card Stream */
        <div className="space-y-3">
          {filteredFollowUps.map((task) => {
            const associatedLead = leadsMap.get(task.leadId);
            const isCompleted = task.status === 'completed';
            const isCancelled = task.status === 'cancelled';
            const isOverdue = task.status === 'pending' && task.dueDate < todayStr;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-[#0E1524]/60 border-slate-850 opacity-70'
                    : isCancelled
                    ? 'bg-[#0E1524]/40 border-slate-850 opacity-50'
                    : isOverdue
                    ? 'bg-[#14121F] border-rose-900/40 hover:border-rose-700/60 shadow-xs'
                    : 'bg-[#111827] border-slate-800 hover:border-slate-750 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Checkbox + Title + Lead Info */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Toggle Completion Checkbox */}
                    <button
                      onClick={() => toggleFollowUpComplete(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-slate-600 hover:border-violet-400 bg-[#0F172A]'
                      }`}
                      title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* Title & Priority Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-semibold text-xs text-white ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            task.priority === 'high'
                              ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                              : task.priority === 'medium'
                              ? 'bg-amber-950/60 text-amber-300 border border-amber-900/60'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {task.priority.toUpperCase()}
                        </span>

                        {/* Channel Badge */}
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 flex items-center gap-1 border border-slate-700">
                          {getChannelIcon(task.channel)}
                          <span>{task.channel}</span>
                        </span>

                        {isCancelled && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            CANCELLED
                          </span>
                        )}
                      </div>

                      {/* Associated Lead details with current pipeline stage */}
                      <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                        <button
                          onClick={() => associatedLead && setActiveLeadForDrawer(associatedLead)}
                          className="font-medium text-slate-200 hover:text-violet-300 flex items-center gap-1 cursor-pointer transition-colors"
                          title="Click to view lead drawer"
                        >
                          <User className="w-3 h-3 text-slate-500" />
                          <span>{task.leadName}</span>
                        </button>

                        {task.leadCompany && (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Building className="w-3 h-3 text-slate-500" />
                            {task.leadCompany}
                          </span>
                        )}

                        {/* Current Lead Pipeline Status */}
                        {associatedLead && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-600">·</span>
                            <span className="text-[11px] text-slate-400">Stage:</span>
                            {getLeadStatusBadge(associatedLead.status)}
                          </div>
                        )}
                      </div>

                      {/* Notes / Talking Points */}
                      {(task.suggestedMessage || task.notes) && (
                        <p className="text-[11px] text-slate-400 mt-1 italic bg-[#0F172A]/70 p-2 rounded-lg border border-slate-800/80 max-w-2xl leading-relaxed">
                          "{task.suggestedMessage || task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Due Date & Quick Actions */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0 self-start sm:self-center">
                    {/* Due Date Indicator */}
                    <div>{getDueDateLabel(task.dueDate, task.dueTime)}</div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* AI Reply Generator Quick Action */}
                      {associatedLead && (
                        <button
                          onClick={() => openReplyGeneratorForLead(associatedLead)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-violet-600/15 hover:bg-violet-600/25 text-violet-300 border border-violet-500/30 transition-colors cursor-pointer"
                          title="Draft tailored AI follow-up message"
                        >
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span>AI Reply</span>
                        </button>
                      )}

                      {/* Quick Reschedule Menu */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setRescheduleMenuId(rescheduleMenuId === task.id ? null : task.id)
                          }
                          className="px-2 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/80 transition-colors cursor-pointer"
                          title="Reschedule task"
                        >
                          Reschedule
                        </button>

                        {/* Reschedule Dropdown */}
                        {rescheduleMenuId === task.id && (
                          <>
                            <div
                              className="fixed inset-0 z-30"
                              onClick={() => setRescheduleMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-52 bg-[#0F172A] border border-slate-800 rounded-xl shadow-2xl p-2 z-40 space-y-1 text-xs animate-in zoom-in-95 duration-100">
                              <span className="text-[10px] font-mono uppercase text-slate-500 px-2 block py-1">
                                Quick Reschedule
                              </span>
                              <button
                                onClick={() => {
                                  rescheduleFollowUp(task.id, 1);
                                  setRescheduleMenuId(null);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                              >
                                Tomorrow (+1 Day)
                              </button>
                              <button
                                onClick={() => {
                                  rescheduleFollowUp(task.id, 2);
                                  setRescheduleMenuId(null);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                              >
                                In 2 Days
                              </button>
                              <button
                                onClick={() => {
                                  rescheduleFollowUp(task.id, 7);
                                  setRescheduleMenuId(null);
                                }}
                                className="w-full text-left px-2 py-1.5 rounded hover:bg-slate-800 text-slate-200 transition-colors cursor-pointer"
                              >
                                Next Week (+7 Days)
                              </button>

                              <div className="pt-1 border-t border-slate-800">
                                <span className="text-[10px] font-mono text-slate-500 px-2 block mb-1">
                                  Custom Date
                                </span>
                                <div className="flex items-center gap-1 px-1">
                                  <input
                                    type="date"
                                    value={customRescheduleDate}
                                    onChange={(e) => setCustomRescheduleDate(e.target.value)}
                                    className="p-1 text-[11px] bg-[#111827] border border-slate-700 rounded text-slate-200 w-full font-mono"
                                  />
                                  <button
                                    onClick={() => handleApplyCustomReschedule(task.id)}
                                    disabled={!customRescheduleDate}
                                    className="px-2 py-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white rounded text-[11px] cursor-pointer"
                                  >
                                    Set
                                  </button>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Cancel Task */}
                      {!isCancelled && !isCompleted && (
                        <button
                          onClick={() => cancelFollowUp(task.id)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Cancel this reminder"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete Task */}
                      <button
                        onClick={() => deleteFollowUp(task.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Delete this reminder permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
