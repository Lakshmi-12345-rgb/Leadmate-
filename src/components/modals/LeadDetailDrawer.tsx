import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Mail,
  Phone,
  Building,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit3,
  Loader2,
  Trophy,
  Ban,
  Clock,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { LeadStatus } from '../../types';

export const LeadDetailDrawer: React.FC = () => {
  const {
    activeLeadForDrawer,
    setActiveLeadForDrawer,
    moveLeadStatus,
    updateLead,
    setLeadToDelete,
    openEditLeadModal,
    qualifyLeadWithAI,
    openReplyGeneratorForLead,
    setIsFollowUpModalOpen,
    setActiveFollowUpForModal,
    showToast,
  } = useApp();

  const [isScoringLoading, setIsScoringLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [noteType, setNoteType] = useState<'note' | 'call' | 'email' | 'meeting'>('note');

  if (!activeLeadForDrawer) return null;
  const lead = activeLeadForDrawer;

  const handleStatusChange = (newStatus: LeadStatus) => {
    moveLeadStatus(lead.id, newStatus);
  };

  const handleQualify = async () => {
    setIsScoringLoading(true);
    await qualifyLeadWithAI(lead.id);
    setIsScoringLoading(false);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const event = {
      id: `t-${Date.now()}`,
      type: noteType,
      title:
        noteType === 'call'
          ? 'Phone Call Logged'
          : noteType === 'email'
          ? 'Email Sent'
          : noteType === 'meeting'
          ? 'Meeting Held'
          : 'Internal Note',
      content: newNoteText.trim(),
      timestamp: new Date().toISOString(),
    };

    updateLead(lead.id, {
      lastContactDate: new Date().toISOString(),
      timeline: [event, ...(lead.timeline || [])],
    });

    setNewNoteText('');
    showToast('success', 'Logged', 'Activity added to lead timeline.');
  };

  const handleScheduleFollowUp = () => {
    setActiveFollowUpForModal({
      id: '',
      leadId: lead.id,
      leadName: lead.name,
      leadCompany: lead.company || '',
      title: `Follow up with ${lead.name}`,
      channel: lead.phone ? 'phone' : 'email',
      dueDate: lead.nextFollowUpDate || new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0],
      dueTime: '10:00 AM',
      status: 'pending',
      priority: (lead.urgency || lead.priority) === 'High' ? 'high' : 'medium',
      suggestedMessage: `Hi ${lead.name}, checking in regarding ${lead.service}.`,
    });
    setIsFollowUpModalOpen(true);
  };

  const priorityLabel = lead.priority || lead.urgency || 'Medium';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0B0F19] h-full shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 border-l border-slate-800 overflow-hidden">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 bg-[#0E1524] flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {lead.source}
              </span>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                  priorityLabel === 'High'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                    : priorityLabel === 'Medium'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-900/60'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                Priority: {priorityLabel}
              </span>
              <span
                className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded ${
                  lead.scoreTier === 'Hot'
                    ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60'
                    : lead.scoreTier === 'Warm'
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-900/60'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                AI Score: {lead.score}/100 ({lead.scoreTier})
              </span>
            </div>
            <h2 className="text-lg font-bold text-white">{lead.name}</h2>
            {lead.company && (
              <p className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {lead.company}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Status Selector */}
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
              className="text-xs font-medium py-1.5 px-2.5 rounded-lg border border-slate-700/80 bg-[#0F172A] text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
              title="Change pipeline stage without recreating record"
            >
              <option value="New">New</option>
              <option value="New Enquiry">New Enquiry</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Meeting Scheduled">Meeting Scheduled</option>
              <option value="Proposal Sent">Proposal Sent</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>

            <button
              onClick={() => setActiveLeadForDrawer(null)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-3 px-4 bg-[#111827] border-b border-slate-800 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              openReplyGeneratorForLead(lead);
              setActiveLeadForDrawer(null);
            }}
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-200" />
            Draft AI Reply
          </button>

          <button
            onClick={handleScheduleFollowUp}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Follow-up
          </button>

          {lead.status !== 'Won' && (
            <button
              onClick={() => handleStatusChange('Won')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 rounded-lg cursor-pointer"
              title="Mark as Won"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              Won
            </button>
          )}

          {lead.status !== 'Lost' && (
            <button
              onClick={() => handleStatusChange('Lost')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg cursor-pointer"
              title="Mark as Lost"
            >
              <Ban className="w-3.5 h-3.5 text-slate-500" />
              Lost
            </button>
          )}

          {/* Edit button */}
          <button
            onClick={() => openEditLeadModal(lead)}
            className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit Lead Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Delete button triggering confirmation modal */}
          <button
            onClick={() => setLeadToDelete(lead)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Delete Lead"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Key Metrics & Dates Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 bg-[#111827] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Deal Value
              </span>
              <p className="text-sm font-bold font-mono text-white mt-0.5 tabular-nums">
                ${(lead.dealValue || 0).toLocaleString()}
              </p>
            </div>

            <div className="p-2.5 bg-[#111827] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Priority
              </span>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{priorityLabel}</p>
            </div>

            <div className="p-2.5 bg-[#111827] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Status
              </span>
              <p className="text-xs font-medium text-slate-200 mt-0.5">{lead.status}</p>
            </div>

            <div className="p-2.5 bg-[#111827] border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase font-mono block">
                Next Follow-Up
              </span>
              <p className="text-xs font-medium text-violet-300 mt-0.5 font-mono">
                {lead.nextFollowUpDate
                  ? new Date(lead.nextFollowUpDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'None scheduled'}
              </p>
            </div>
          </div>

          {/* Creation & Last Updated Timestamps */}
          <div className="p-2.5 bg-[#0F172A]/70 border border-slate-800/80 rounded-lg flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Created:</span>
              <strong className="text-slate-300 font-mono">
                {new Date(lead.createdAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span>Last updated:</span>
              <strong className="text-slate-300 font-mono">
                {lead.updatedAt
                  ? new Date(lead.updatedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : new Date(lead.lastContactDate || lead.createdAt).toLocaleDateString()}
              </strong>
            </span>
          </div>

          {/* Contact Details & Service Requested */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Contact & Requested Service
            </h4>
            <div className="p-3 bg-[#111827] border border-slate-800 rounded-lg space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F172A] text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-violet-400" />
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No email provided</span>
                )}

                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F172A] text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-violet-400" />
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500 italic">No phone provided</span>
                )}
              </div>

              <div>
                <span className="text-[10px] text-slate-500 uppercase font-mono block">
                  Service / Interest:
                </span>
                <p className="text-xs text-slate-200 font-medium mt-0.5">{lead.service}</p>
              </div>

              {lead.tags && lead.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-800">
                  <Tag className="w-3 h-3 text-slate-500" />
                  {lead.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-slate-800 border border-slate-700/80 rounded text-[10px] text-slate-300 font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {lead.inquiry && (
              <div className="p-3 bg-[#0D1322] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Customer Message / Inquiry:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{lead.inquiry}"</p>
              </div>
            )}

            {lead.notes && (
              <div className="p-3 bg-[#111827] border border-slate-800 rounded-lg">
                <span className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                  Internal Notes:
                </span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          {/* AI Qualification & Strategy */}
          <div className="p-4 rounded-xl bg-[#0F172A] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-semibold text-white uppercase tracking-wider text-[11px]">
                  AI Qualification
                </span>
              </div>
              <button
                onClick={handleQualify}
                disabled={isScoringLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 rounded transition-colors cursor-pointer disabled:opacity-50"
              >
                {isScoringLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>Re-Score with AI</>
                )}
              </button>
            </div>

            {lead.aiAnalysis ? (
              <div className="space-y-3 text-xs">
                <p className="text-slate-300 leading-relaxed bg-[#0B101D] p-2.5 rounded-lg border border-slate-850">
                  {lead.aiAnalysis.intentSummary}
                </p>

                {lead.aiAnalysis.buyingSignals && lead.aiAnalysis.buyingSignals.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-emerald-400 uppercase block mb-1">
                      Buying Signals
                    </span>
                    <ul className="space-y-1">
                      {lead.aiAnalysis.buyingSignals.map((sig, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lead.aiAnalysis.potentialRisks && lead.aiAnalysis.potentialRisks.length > 0 && (
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-amber-400 uppercase block mb-1">
                      Items to Clarify
                    </span>
                    <ul className="space-y-1">
                      {lead.aiAnalysis.potentialRisks.map((risk, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {lead.aiAnalysis.recommendedAction && (
                  <div className="p-2.5 bg-[#0B101D] border border-slate-850 rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-violet-400 block font-semibold">
                      Recommended Next Step
                    </span>
                    <p className="text-slate-200 text-xs mt-0.5">
                      {lead.aiAnalysis.recommendedAction}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-[11px] text-slate-400 mb-2">No qualification score yet.</p>
                <button
                  onClick={handleQualify}
                  disabled={isScoringLoading}
                  className="px-3 py-1 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
                >
                  Run Instant Qualification
                </button>
              </div>
            )}
          </div>

          {/* Activity Timeline & Note Logging */}
          <div className="space-y-2.5">
            <h4 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Activity History</span>
              <span className="font-mono text-slate-500">{lead.timeline?.length || 0} events</span>
            </h4>

            {/* Note logging form */}
            <form onSubmit={handleAddNote} className="p-2.5 bg-[#111827] border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value as any)}
                  className="text-xs bg-[#0F172A] border border-slate-700/80 rounded py-1 px-2 text-slate-300"
                >
                  <option value="note">Internal Note</option>
                  <option value="call">Phone Call</option>
                  <option value="email">Email Sent</option>
                  <option value="meeting">Meeting</option>
                </select>
                <span className="text-[10px] text-slate-500">Record touchpoint</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Record summary of conversation or note..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="flex-1 p-1.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <button
                  type="submit"
                  disabled={!newNoteText.trim()}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Log
                </button>
              </div>
            </form>

            {/* Timeline Events */}
            <div className="space-y-2 pl-3 border-l border-slate-800">
              {(lead.timeline || []).map((event) => (
                <div key={event.id} className="relative group pl-3">
                  <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-[#0B0F19]"></div>
                  <div className="p-2.5 bg-[#111827] border border-slate-800/80 rounded-lg">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200">{event.title}</span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        {new Date(event.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {event.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
