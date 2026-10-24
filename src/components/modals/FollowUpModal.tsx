import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, CalendarClock, Mail, Phone, MessageSquare, Video, Plus, AlertCircle } from 'lucide-react';

export const FollowUpModal: React.FC = () => {
  const {
    isFollowUpModalOpen,
    setIsFollowUpModalOpen,
    activeFollowUpForModal,
    setActiveFollowUpForModal,
    leads,
    addFollowUp,
    openCreateLeadModal,
    showToast,
  } = useApp();

  const [leadId, setLeadId] = useState('');
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState<'email' | 'phone' | 'whatsapp' | 'meeting'>('email');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [dueTime, setDueTime] = useState('11:00 AM');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [suggestedMessage, setSuggestedMessage] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    if (activeFollowUpForModal) {
      setLeadId(activeFollowUpForModal.leadId || (leads[0]?.id || ''));
      setTitle(activeFollowUpForModal.title || '');
      setChannel(activeFollowUpForModal.channel || 'email');
      setDueDate(activeFollowUpForModal.dueDate || new Date().toISOString().split('T')[0]);
      setDueTime(activeFollowUpForModal.dueTime || '11:00 AM');
      setPriority(activeFollowUpForModal.priority || 'high');
      setSuggestedMessage(activeFollowUpForModal.suggestedMessage || '');
      setTitleError(null);
    } else if (leads.length > 0) {
      setLeadId(leads[0].id);
      setTitle(`Follow up with ${leads[0].name}`);
      setTitleError(null);
    }
  }, [activeFollowUpForModal, leads, isFollowUpModalOpen]);

  if (!isFollowUpModalOpen) return null;

  const handleLeadChange = (selectedId: string) => {
    setLeadId(selectedId);
    const selected = leads.find((l) => l.id === selectedId);
    if (selected) {
      setTitle(`Check-in regarding ${selected.service} with ${selected.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Please provide a title or description for this follow-up.');
      return;
    }

    const selectedLead = leads.find((l) => l.id === leadId) || leads[0];
    if (!selectedLead) {
      showToast('error', 'No Lead Selected', 'Please create or select a lead first.');
      return;
    }

    addFollowUp({
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      leadCompany: selectedLead.company || '',
      title: title.trim(),
      channel,
      dueDate,
      dueTime,
      priority,
      suggestedMessage: suggestedMessage.trim(),
    });

    handleClose();
  };

  const handleClose = () => {
    setActiveFollowUpForModal(null);
    setIsFollowUpModalOpen(false);
    setTitleError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#111827] rounded-xl shadow-2xl border border-slate-800 max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B101D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <CalendarClock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Schedule Follow-Up Task
              </h3>
              <p className="text-[11px] text-slate-400">Set timed outreach touchpoint for a lead</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {leads.length === 0 ? (
          <div className="p-6 text-center space-y-3 text-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <h4 className="font-semibold text-white">No Leads in Pipeline</h4>
            <p className="text-slate-400 max-w-xs mx-auto leading-relaxed">
              Follow-ups must be linked to an existing prospect. Create your first lead to schedule reminders.
            </p>
            <button
              onClick={() => {
                handleClose();
                openCreateLeadModal();
              }}
              className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
            >
              Add Lead First
            </button>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Target Lead */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Select Opportunity <span className="text-rose-400">*</span>
              </label>
              <select
                value={leadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.company ? `(${l.company})` : ''} · {l.service} [{l.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Follow-up Title */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Task Description / Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (titleError) setTitleError(null);
                }}
                placeholder="e.g. Day 3 Proposal follow-up check-in"
                className={`w-full p-2 bg-[#0F172A] border rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                  titleError ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {titleError && <p className="text-[10px] text-rose-400 mt-1">{titleError}</p>}
            </div>

            {/* Channel Selector */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">Outreach Channel</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'email', label: 'Email', icon: <Mail className="w-3 h-3" /> },
                  { id: 'phone', label: 'Phone', icon: <Phone className="w-3 h-3" /> },
                  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageSquare className="w-3 h-3" /> },
                  { id: 'meeting', label: 'Meeting', icon: <Video className="w-3 h-3" /> },
                ].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setChannel(c.id as any)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      channel === c.id
                        ? 'bg-violet-600/20 border-violet-500/50 text-violet-200'
                        : 'bg-[#0F172A] border-slate-700/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {c.icon}
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-300 mb-1">Time (Optional)</label>
                <select
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                >
                  <option value="09:00 AM">09:00 AM (Morning)</option>
                  <option value="11:00 AM">11:00 AM (Late Morning)</option>
                  <option value="02:00 PM">02:00 PM (Afternoon)</option>
                  <option value="04:30 PM">04:30 PM (End of Day)</option>
                  <option value="All Day">All Day / Any Time</option>
                </select>
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">Priority</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'high', label: 'High Priority', color: 'text-rose-400' },
                  { id: 'medium', label: 'Medium', color: 'text-amber-400' },
                  { id: 'low', label: 'Low', color: 'text-slate-400' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as any)}
                    className={`py-1.5 px-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      priority === p.id
                        ? 'border-violet-500/60 bg-violet-600/20 text-violet-200 font-semibold'
                        : 'border-slate-750 bg-[#0F172A] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Script / Talking Points */}
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Talking Points / Notes <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={suggestedMessage}
                onChange={(e) => setSuggestedMessage(e.target.value)}
                placeholder="What specifically should be touched upon in this check-in?"
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-xs shadow-violet-950/40"
              >
                Schedule Follow-Up
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
