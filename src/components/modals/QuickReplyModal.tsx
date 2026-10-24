import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, Mail, Copy, Check, ExternalLink, Loader2, Send } from 'lucide-react';
import { AIReplyResult } from '../../types';

export const QuickReplyModal: React.FC = () => {
  const {
    isQuickReplyModalOpen,
    setIsQuickReplyModalOpen,
    leads,
    settings,
    openReplyGeneratorForLead,
    showToast,
  } = useApp();

  const [leadId, setLeadId] = useState<string>(leads[0]?.id || '');
  const [goal, setGoal] = useState<string>('Book a discovery call');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIReplyResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isQuickReplyModalOpen) return null;

  const selectedLead = leads.find((l) => l.id === leadId) || leads[0];

  const handleGenerate = async () => {
    if (!selectedLead) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: selectedLead.name,
          company: selectedLead.company,
          service: selectedLead.service,
          budget: selectedLead.dealValue ? `$${selectedLead.dealValue}` : '',
          inquiry: selectedLead.inquiry || selectedLead.notes,
          tone: settings.defaultTone || 'Warm & Consultative',
          goal,
          channel: 'email',
          businessName: settings.businessName,
          ownerName: settings.ownerName,
          bookingUrl: settings.bookingUrl,
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        setResult(res.data);
        showToast('success', 'Reply Generated', `Drafted response for ${selectedLead.name}.`);
      } else {
        throw new Error('Failed to generate');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Generation Error', 'Could not generate reply.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('info', 'Copied to Clipboard');
  };

  const handleOpenStudio = () => {
    if (selectedLead) {
      openReplyGeneratorForLead(selectedLead);
      setIsQuickReplyModalOpen(false);
      setResult(null);
    }
  };

  const handleClose = () => {
    setIsQuickReplyModalOpen(false);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-[#111827] rounded-xl shadow-2xl border border-slate-800 max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B101D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Quick AI Reply Generator
              </h3>
              <p className="text-[11px] text-slate-300">Draft a personalized sales reply in 1 click</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {leads.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              No leads currently in workspace. Create a lead first to generate AI replies.
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Select Lead
                </label>
                <select
                  value={leadId}
                  onChange={(e) => {
                    setLeadId(e.target.value);
                    setResult(null);
                  }}
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 font-medium"
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} {l.company ? `(${l.company})` : ''} · {l.service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Objective
                </label>
                <select
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    setResult(null);
                  }}
                  className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                >
                  <option value="Book a discovery call">Book a 15-min discovery call</option>
                  <option value="Send custom quote and pricing">Send pricing & package tiers</option>
                  <option value="Qualify budget and project scope">Qualify budget & timeline</option>
                  <option value="Re-engage cold lead (permission to close file)">
                    Re-engage cold lead (permission to close)
                  </option>
                </select>
              </div>

              {!result ? (
                <div className="pt-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full py-2.5 px-3 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Generating Response with Gemini...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                        Generate AI Reply Now
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="p-2.5 bg-[#0B101D] border border-slate-800 rounded-lg">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-0.5">
                      Subject
                    </span>
                    <p className="font-mono text-xs text-slate-100 font-semibold">{result.subject}</p>
                  </div>

                  <div className="p-3 bg-[#0B101D] border border-slate-800 rounded-lg max-h-48 overflow-y-auto">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
                      Draft Body
                    </span>
                    <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                      {result.emailBody}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={handleOpenStudio}
                      className="text-xs text-violet-400 hover:text-violet-300 font-medium cursor-pointer"
                    >
                      Open in Full Reply Studio →
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 cursor-pointer"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      {selectedLead?.email && (
                        <a
                          href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(result.emailBody)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-600 hover:bg-violet-500 text-white cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
