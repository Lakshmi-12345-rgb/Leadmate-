import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Copy,
  Check,
  Mail,
  Send,
  Loader2,
  ExternalLink,
  Save,
  CheckCircle2,
  Lightbulb,
  Bookmark,
  RotateCcw,
  AlertTriangle,
  Info,
  ShieldCheck,
  Building,
  User,
  Sliders,
  FileText,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { DraftReply, MultiDraftReplyResponse, SavedTemplate, Lead } from '../../types';

export const AIReplyGeneratorView: React.FC = () => {
  const {
    leads,
    selectedLeadForReply,
    setSelectedLeadForReply,
    settings,
    templates,
    addTemplate,
    updateLead,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'studio' | 'templates'>('studio');

  // Lead Association
  const [selectedLeadId, setSelectedLeadId] = useState<string>(
    selectedLeadForReply?.id || (leads[0]?.id || '')
  );

  // Form Fields
  const [customerMessage, setCustomerMessage] = useState('');
  const [businessType, setBusinessType] = useState(settings.industry || 'Digital Marketing & Web Agency');
  const [service, setService] = useState(settings.services[0] || 'Custom Website Redesign');
  const [objective, setObjective] = useState<string>('answer_question');
  const [tone, setTone] = useState<string>('professional');
  const [factualDetails, setFactualDetails] = useState('');
  const [leadName, setLeadName] = useState('');
  const [leadCompany, setLeadCompany] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [includeBookingLink, setIncludeBookingLink] = useState(true);

  // Generation State
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<MultiDraftReplyResponse | null>(null);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState<number>(0);
  const [editableDrafts, setEditableDrafts] = useState<DraftReply[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedToLeadIndex, setSavedToLeadIndex] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Pre-fill when selectedLeadForReply or selectedLeadId changes
  useEffect(() => {
    if (selectedLeadForReply) {
      setSelectedLeadId(selectedLeadForReply.id);
      populateFromLead(selectedLeadForReply);
    } else if (selectedLeadId) {
      const found = leads.find((l) => l.id === selectedLeadId);
      if (found) {
        populateFromLead(found);
      }
    }
  }, [selectedLeadId, selectedLeadForReply, leads]);

  const populateFromLead = (lead: Lead) => {
    setLeadName(lead.name || '');
    setLeadCompany(lead.company || '');
    setLeadEmail(lead.email || '');
    setService(lead.service || settings.services[0] || '');
    if (lead.inquiry || lead.notes) {
      setCustomerMessage(lead.inquiry || lead.notes || '');
    }
    // Set realistic objective based on lead status and follow-up cadence
    if (lead.nextFollowUpDate || lead.status === 'Proposal Sent' || lead.status === 'Contacted' || lead.status === 'Interested') {
      setObjective('follow_up');
    } else if (lead.status === 'Lost') {
      setObjective('re_engage');
    } else {
      setObjective('answer_question');
    }
  };

  const handleSelectLead = (id: string) => {
    setSelectedLeadId(id);
    if (!id) {
      setSelectedLeadForReply(null);
      return;
    }
    const chosen = leads.find((l) => l.id === id);
    if (chosen) {
      setSelectedLeadForReply(chosen);
      populateFromLead(chosen);
    }
  };

  // Sample prompt presets for quick evaluation
  const handleApplyPreset = (presetType: 'pricing' | 'objection' | 'followup' | 'reengage') => {
    if (presetType === 'pricing') {
      setCustomerMessage(
        'Hi, could you send over your pricing and estimated timeline for a new company website? We need around 5 pages and want to know how soon you can start.'
      );
      setObjective('share_quotation');
      setFactualDetails(
        '5-page website package is $2,800. Estimated turnaround is 3 weeks. Available to start next Monday with 50% deposit.'
      );
    } else if (presetType === 'objection') {
      setCustomerMessage(
        'Thanks for the quote, but your price is higher than another freelancer we spoke to. Can you do a 30% discount or match their price?'
      );
      setObjective('handle_objection');
      setFactualDetails(
        'We do not discount rates because our service includes custom UX design, SEO setup, and 60 days of post-launch technical support. We can reduce scope or offer a 3-month split payment plan.'
      );
    } else if (presetType === 'followup') {
      setCustomerMessage(
        'We reviewed your proposal last Tuesday and were discussing it internally with our director.'
      );
      setObjective('follow_up');
      setFactualDetails(
        'Proposal validity is 14 days. Project kickoff slot for next month is held until Friday.'
      );
    } else {
      setCustomerMessage(
        'Sorry for going silent last month! Things got chaotic with our office relocation.'
      );
      setObjective('re_engage');
      setFactualDetails(
        'New schedule opening in November. Happy to pick up where we left off.'
      );
    }
    setFormError(null);
  };

  // Main Generation Action
  const handleGenerate = async (overrideInstructions?: string) => {
    if (!customerMessage.trim()) {
      setFormError('Please enter the customer\'s message or select an enquiry preset.');
      return;
    }
    setFormError(null);
    setIsLoading(true);
    setSavedToLeadIndex(null);

    try {
      const response = await fetch('/api/ai/generate-replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerMessage: customerMessage.trim(),
          businessType: businessType.trim(),
          service: service.trim(),
          objective,
          tone,
          factualDetails: factualDetails.trim(),
          leadName: leadName.trim() || 'Prospect',
          company: leadCompany.trim(),
          businessName: settings.businessName,
          ownerName: settings.ownerName,
          bookingUrl: includeBookingLink ? settings.bookingUrl : '',
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setGeneratedData({
          isLiveAI: res.isLiveAI,
          model: res.model,
          drafts: res.data.drafts || [],
          tacticalAdvice: res.data.tacticalAdvice,
          missingFactsNoticed: res.data.missingFactsNoticed,
        });
        setEditableDrafts(res.data.drafts || []);
        setSelectedDraftIndex(0);
        showToast(
          'success',
          res.isLiveAI ? '3 AI Drafts Generated' : '3 Draft Replies Generated (Demo Mode)',
          `Generated Friendly, Professional, and Persuasive replies.`
        );
      } else {
        throw new Error(res.error || 'Failed to generate replies');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      showToast('error', 'Generation Failed', err.message || 'Could not contact AI service.');
    } finally {
      setIsLoading(false);
    }
  };

  // Update draft content live in editable state
  const handleUpdateDraft = (index: number, field: 'subject' | 'body', value: string) => {
    setEditableDrafts((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  // Copy Draft
  const handleCopyDraft = (index: number) => {
    const draft = editableDrafts[index];
    if (!draft) return;
    const fullText = `Subject: ${draft.subject}\n\n${draft.body}`;
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
    showToast('info', 'Copied to Clipboard', `Draft (${draft.label}) copied with subject and body.`);
  };

  // Save to Lead Activity History
  const handleSaveToLead = (index: number) => {
    const draft = editableDrafts[index];
    const targetLead = leads.find((l) => l.id === selectedLeadId);

    if (!targetLead) {
      showToast('error', 'No Lead Associated', 'Please select a lead in the left panel to associate this message.');
      return;
    }

    if (!draft) return;

    const nowIso = new Date().toISOString();
    const event = {
      id: `t-${Date.now()}`,
      type: 'email' as const,
      title: `AI Reply Drafted (${draft.label}): ${draft.subject}`,
      content: draft.body,
      timestamp: nowIso,
    };

    const nextStatus =
      targetLead.status === 'New' || targetLead.status === 'New Enquiry'
        ? 'Contacted'
        : targetLead.status;

    updateLead(targetLead.id, {
      status: nextStatus,
      lastContactDate: nowIso,
      updatedAt: nowIso,
      timeline: [event, ...(targetLead.timeline || [])],
    });

    setSavedToLeadIndex(index);
    showToast('success', 'Saved to Lead Activity', `Logged reply to ${targetLead.name}'s timeline.`);
  };

  // Save as Reusable Template
  const handleSaveAsTemplate = (index: number) => {
    const draft = editableDrafts[index];
    if (!draft) return;

    addTemplate({
      title: `${draft.label}: ${service}`,
      tone: draft.tone,
      goal: objective,
      channel: 'email',
      subject: draft.subject,
      content: draft.body,
      tags: [draft.id, service],
    });

    showToast('success', 'Template Saved', 'Saved draft to your Reusable Templates library.');
  };

  // Active Draft to render
  const activeDraft = editableDrafts[selectedDraftIndex] || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">AI Reply Generator</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-violet-400" />
              3 Distinct Styles
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Craft authentic, professional responses to customer enquiries without hallucinated prices or false claims.
          </p>
        </div>

        {/* Studio / Templates Tab Toggle */}
        <div className="flex items-center bg-[#111827] border border-slate-800 rounded-lg p-0.5">
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              activeTab === 'studio'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reply Studio
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'templates'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Templates ({templates.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        /* Saved Templates Library */
        <div className="space-y-4">
          <div className="p-4 bg-[#111827] border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Saved Reply Templates</h3>
              <p className="text-xs text-slate-400">Quickly reuse approved sales responses and quotations</p>
            </div>
            <button
              onClick={() => setActiveTab('studio')}
              className="px-3 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
            >
              Open Studio
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl space-y-2.5 flex flex-col justify-between transition-colors"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-950/40 text-violet-300 border border-violet-800/40">
                      {tpl.tone}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{tpl.channel}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{tpl.title}</h4>
                  <p className="text-[11px] font-medium text-slate-300 line-clamp-1">
                    Subject: {tpl.subject}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-line bg-[#0F172A] p-2 rounded-lg border border-slate-850">
                    {tpl.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${tpl.subject}\n\n${tpl.content}`);
                      showToast('info', 'Template Copied');
                    }}
                    className="text-xs text-slate-300 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setCustomerMessage(tpl.content);
                      setTone(tpl.tone);
                      setActiveTab('studio');
                    }}
                    className="text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                  >
                    Load into Studio →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Studio Grid: Input Form (Left) & 3 Drafts (Right) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Input Form (5 Cols) */}
          <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  Enquiry & Strategy Form
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Step 1 of 2</span>
            </div>

            {/* Associate with Lead */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Associate with Lead</span>
                <span className="text-slate-500 font-normal text-[10px]">Optional</span>
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
              >
                <option value="">-- No associated lead (Manual Inquiry) --</option>
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} {l.company ? `(${l.company})` : ''} · {l.service} [{l.status}]
                  </option>
                ))}
              </select>
            </div>

            {/* Customer's Original Message (Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300">
                  Customer's Original Message <span className="text-rose-400">*</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {customerMessage.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={customerMessage}
                onChange={(e) => {
                  setCustomerMessage(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="Paste the customer's raw email, contact form message, or DM inquiry here..."
                className={`w-full p-2.5 bg-[#0F172A] border rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed ${
                  formError ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {formError && <p className="text-[10px] text-rose-400 mt-1">{formError}</p>}

              {/* Quick Sample Inquiry Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1.5 text-[10px]">
                <span className="text-slate-500">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('pricing')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
                >
                  Pricing & Timeline
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('objection')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
                >
                  Price Objection
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('followup')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
                >
                  Follow-up
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('reengage')}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
                >
                  Re-engage Cold
                </button>
              </div>
            </div>

            {/* Business Type & Service Offered */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Business Type
                </label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="e.g. Digital Marketing Agency"
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Product / Service Offered
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Custom Website Redesign"
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            </div>

            {/* Reply Objective & Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Reply Objective
                </label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
                >
                  <option value="answer_question">Answer a question</option>
                  <option value="follow_up">Follow up</option>
                  <option value="handle_objection">Handle an objection</option>
                  <option value="share_quotation">Share a quotation</option>
                  <option value="re_engage">Re-engage a lead</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Primary Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="concise">Concise</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </div>
            </div>

            {/* Optional Factual Details with Anti-hallucination notice */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-medium text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Optional Factual Details</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Anti-Hallucination</span>
              </div>
              <textarea
                rows={2}
                value={factualDetails}
                onChange={(e) => setFactualDetails(e.target.value)}
                placeholder="e.g. Package is $2,800; 3-week turnaround; includes 3 revision rounds; available to start next Monday"
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
              <p className="text-[10px] text-slate-400 mt-1 flex items-start gap-1 leading-normal">
                <Info className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  Our AI never fabricates prices, discounts, or delivery dates. Unspecified details will be rendered as safe editable placeholders like <code className="text-violet-300">[Insert Price]</code>.
                </span>
              </p>
            </div>

            {/* Booking Link checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="bookingLinkCheck"
                checked={includeBookingLink}
                onChange={(e) => setIncludeBookingLink(e.target.checked)}
                className="rounded border-slate-700 text-violet-600 focus:ring-violet-500"
              />
              <label htmlFor="bookingLinkCheck" className="text-xs text-slate-300 cursor-pointer">
                Include scheduling calendar link ({settings.bookingUrl ? 'cal.com' : 'default'})
              </label>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={() => handleGenerate()}
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-violet-950/50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-violet-200" />
                  <span>Generating 3 Draft Replies with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-violet-200" />
                  <span>Generate 3 Distinct Draft Replies</span>
                </>
              )}
            </button>
          </div>

          {/* RIGHT COLUMN: 3 Drafts Display & Editor (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* AI Status / Environment Badge */}
            {generatedData && (
              <div
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  generatedData.isLiveAI
                    ? 'bg-violet-950/20 border-violet-800/40 text-violet-200'
                    : 'bg-amber-950/30 border-amber-800/50 text-amber-200'
                }`}
              >
                {generatedData.isLiveAI ? (
                  <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[11px] uppercase tracking-wider font-mono">
                      {generatedData.isLiveAI
                        ? 'Live Gemini 3.8 Flash Active'
                        : 'Demo Mode (Simulated Response)'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {generatedData.isLiveAI ? 'Model: gemini-3.8-flash' : 'Simulated Response'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                    {generatedData.isLiveAI
                      ? 'Responses generated using Google GenAI with strict anti-hallucination and zero-pressure rules.'
                      : 'Live Gemini API key is not configured in this environment. Showing calibrated, anti-hallucination sales templates. Set GEMINI_API_KEY in secrets to activate real-time generation.'}
                  </p>
                </div>
              </div>
            )}

            {/* When Generated: Segmented 3-Style Selector */}
            {editableDrafts.length > 0 ? (
              <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-0">
                {/* 3 Draft Tabs */}
                <div className="grid grid-cols-3 border-b border-slate-800 bg-[#0E1524]">
                  {editableDrafts.map((d, idx) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDraftIndex(idx)}
                      className={`p-3 text-left transition-colors cursor-pointer border-r border-slate-800 last:border-r-0 ${
                        selectedDraftIndex === idx
                          ? 'bg-[#111827] text-white border-b-2 border-b-violet-500 font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            idx === 0
                              ? 'bg-sky-400'
                              : idx === 1
                              ? 'bg-amber-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                        <span className="truncate">{d.label}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 hidden sm:block">
                        {d.description}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Active Draft Editor & Actions */}
                {activeDraft && (
                  <div className="p-4 sm:p-5 space-y-4">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-200">
                          {activeDraft.label}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {activeDraft.tone}
                        </span>
                      </div>

                      {/* Placeholder detector badge */}
                      {activeDraft.body.includes('[Insert') && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-900/50 flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
                          Contains [Insert ...] placeholders to review
                        </span>
                      )}
                    </div>

                    {/* Editable Subject */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Subject Line (Editable)
                      </label>
                      <input
                        type="text"
                        value={activeDraft.subject}
                        onChange={(e) =>
                          handleUpdateDraft(selectedDraftIndex, 'subject', e.target.value)
                        }
                        className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                      />
                    </div>

                    {/* Editable Body */}
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                        Email Message Body (Editable)
                      </label>
                      <textarea
                        rows={11}
                        value={activeDraft.body}
                        onChange={(e) =>
                          handleUpdateDraft(selectedDraftIndex, 'body', e.target.value)
                        }
                        className="w-full p-3 bg-[#0F172A] border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
                      />
                    </div>

                    {/* Recommended Next Step Callout */}
                    {activeDraft.recommendedNextStep && (
                      <div className="p-3 bg-[#0D1322] border border-slate-800 rounded-lg flex items-start gap-2 text-xs">
                        <Clock className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-slate-300 text-[11px]">
                            Recommended Next Step:
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {activeDraft.recommendedNextStep}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Primary Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        {/* Copy button */}
                        <button
                          onClick={() => handleCopyDraft(selectedDraftIndex)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
                        >
                          {copiedIndex === selectedDraftIndex ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Draft</span>
                            </>
                          )}
                        </button>

                        {/* Save to Lead Activity History */}
                        <button
                          onClick={() => handleSaveToLead(selectedDraftIndex)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                            savedToLeadIndex === selectedDraftIndex
                              ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/80'
                              : 'bg-violet-600 hover:bg-violet-500 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            {savedToLeadIndex === selectedDraftIndex
                              ? 'Saved to Lead Activity'
                              : 'Save to Lead Activity'}
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Mail Client */}
                        {leadEmail && (
                          <a
                            href={`mailto:${leadEmail}?subject=${encodeURIComponent(
                              activeDraft.subject
                            )}&body=${encodeURIComponent(activeDraft.body)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#0F172A] border border-slate-700/80 rounded-lg transition-colors"
                            title="Open in default mail app"
                          >
                            <ExternalLink className="w-3 h-3 text-slate-400" />
                            <span>Mail App</span>
                          </a>
                        )}

                        {/* Save as Template */}
                        <button
                          onClick={() => handleSaveAsTemplate(selectedDraftIndex)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Save this draft as a reusable template"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Save Template</span>
                        </button>

                        {/* Regenerate */}
                        <button
                          onClick={() => handleGenerate()}
                          disabled={isLoading}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:text-violet-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Regenerate all 3 drafts"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              /* Loading State */
              <div className="p-12 bg-[#111827] rounded-xl border border-slate-800 text-center space-y-4 animate-in fade-in duration-150">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">
                    Crafting 3 Distinct Reply Styles
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Analyzing customer message, respecting factual constraints, and generating Friendly, Professional, and Persuasive drafts...
                  </p>
                </div>
                <div className="flex justify-center items-center gap-2 text-[10px] font-mono text-slate-500 pt-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
                  <span>Enforcing anti-hallucination rules</span>
                </div>
              </div>
            ) : (
              /* Empty State */
              <div className="p-12 bg-[#111827]/70 rounded-xl border border-dashed border-slate-800 text-center space-y-4">
                <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/80 text-violet-400 flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6 text-violet-400" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <h4 className="text-sm font-semibold text-white">Ready to Generate Draft Replies</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Paste a customer's message on the left or click one of our quick presets (Pricing & Timeline, Objection, or Re-engagement) to generate 3 tailored response styles.
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap justify-center gap-2">
                  <button
                    onClick={() => handleApplyPreset('pricing')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg cursor-pointer"
                  >
                    Try "Pricing & Timeline" Preset
                  </button>
                  <button
                    onClick={() => handleApplyPreset('objection')}
                    className="px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg cursor-pointer"
                  >
                    Try "Price Objection" Preset
                  </button>
                </div>
              </div>
            )}

            {/* Strategic Advice Callout if available */}
            {generatedData?.tacticalAdvice && (
              <div className="p-4 bg-[#0D1322] border border-slate-800 rounded-xl flex items-start gap-3">
                <Lightbulb className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">Sales Tactical Guidance</h5>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {generatedData.tacticalAdvice}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
