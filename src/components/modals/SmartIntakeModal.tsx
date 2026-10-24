import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, X, Loader2, CheckCircle2 } from 'lucide-react';
import { LeadSource, LeadUrgency } from '../../types';

export const SmartIntakeModal: React.FC = () => {
  const { isSmartIntakeModalOpen, setIsSmartIntakeModalOpen, addLead, showToast } = useApp();

  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedLead, setExtractedLead] = useState<any | null>(null);

  if (!isSmartIntakeModalOpen) return null;

  const sampleMessages = [
    {
      label: 'Sample Website Email',
      text: `From: James Wilson <james@wilsonbakery.com>
Phone: (555) 789-1234
Company: Wilson Artisan Bakery
Subject: Need eCommerce ordering by next month!

Hi Sarah, we run a local artisan bakery and our current website doesn't support online pre-orders. We need a Shopify setup before our holiday season starts in 4 weeks. We have around $3,500 budgeted for this. Can we set up a call this week?`,
    },
    {
      label: 'Sample Instagram DM',
      text: `Hey! This is Sarah from CleanEdge Dental. Our clinic wants to run Google ads and local SEO because a new competitor just opened up down the street. Need to attract at least 25 new patients a month. Can you send over your packages and pricing?`,
    },
    {
      label: 'Sample Contact Form Dump',
      text: `Name: Mateo Garcia
Company: Garcia Logistics LLC
Email: mateo@garcialogistics.com
Phone: +1 555-901-4432
Message: Looking for custom lead funnel optimization and CRM setup. Urgent project, timeline 2-3 weeks, estimated budget around $6,000. Looking to speak with someone tomorrow.`,
    },
  ];

  const handleExtract = async () => {
    if (!rawText.trim()) {
      showToast('error', 'Input Required', 'Please paste enquiry text to extract.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/extract-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      const res = await response.json();
      if (res.success && res.lead) {
        setExtractedLead(res.lead);
        showToast('success', 'Details Parsed', 'AI extracted opportunity fields.');
      } else {
        throw new Error(res.error || 'Failed to extract');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Extraction Failed', 'Could not parse text.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToPipeline = () => {
    if (!extractedLead) return;

    addLead({
      name: extractedLead.name || 'New Prospect',
      email: extractedLead.email || '',
      phone: extractedLead.phone || '',
      company: extractedLead.company || '',
      service: extractedLead.service || 'Consulting',
      dealValue: Number(extractedLead.dealValue) || 2500,
      urgency: (extractedLead.urgency as LeadUrgency) || 'Medium',
      source: (extractedLead.source as LeadSource) || 'Website Form',
      status: 'New Enquiry',
      notes: extractedLead.notes || rawText.slice(0, 250),
      inquiry: rawText,
      tags: ['Smart Intake', extractedLead.urgency === 'High' ? 'High Priority' : 'Inbound'],
    });

    setExtractedLead(null);
    setRawText('');
    setIsSmartIntakeModalOpen(false);
  };

  const handleClose = () => {
    setExtractedLead(null);
    setRawText('');
    setIsSmartIntakeModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-[#111827] rounded-xl shadow-2xl border border-slate-800 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B101D]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                Smart AI Lead Intake
              </h3>
              <p className="text-[11px] text-slate-300">
                Paste any unstructured customer message or email. Gemini parses fields automatically.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {!extractedLead ? (
            <>
              {/* Sample Buttons */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1.5">
                  Try a test sample:
                </label>
                <div className="flex flex-wrap gap-2">
                  {sampleMessages.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawText(sample.text)}
                      className="text-[11px] px-2.5 py-1 rounded-md bg-[#0F172A] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 font-medium transition-colors cursor-pointer"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Paste enquiry email, DM, or contact form message:
                </label>
                <textarea
                  rows={8}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste raw customer message here..."
                  className="w-full p-3 text-xs font-mono bg-[#0B101D] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtract}
                  disabled={isLoading || !rawText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing with Gemini AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                      Extract Lead Details
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Extracted Preview */
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/60 rounded-lg flex items-center gap-2 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>AI extracted the following parameters. Review and confirm:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] font-medium text-slate-300">Prospect Name</label>
                  <input
                    type="text"
                    value={extractedLead.name || ''}
                    onChange={(e) => setExtractedLead({ ...extractedLead, name: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Company</label>
                  <input
                    type="text"
                    value={extractedLead.company || ''}
                    onChange={(e) => setExtractedLead({ ...extractedLead, company: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Email Address</label>
                  <input
                    type="email"
                    value={extractedLead.email || ''}
                    onChange={(e) => setExtractedLead({ ...extractedLead, email: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={extractedLead.phone || ''}
                    onChange={(e) => setExtractedLead({ ...extractedLead, phone: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Service Needed</label>
                  <input
                    type="text"
                    value={extractedLead.service || ''}
                    onChange={(e) => setExtractedLead({ ...extractedLead, service: e.target.value })}
                    className="w-full mt-1 p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-100 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-300">Estimated Deal Value ($)</label>
                  <input
                    type="number"
                    value={extractedLead.dealValue || 0}
                    onChange={(e) =>
                      setExtractedLead({ ...extractedLead, dealValue: Number(e.target.value) })
                    }
                    className="w-full mt-1 p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-100 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-300">Extracted Notes & Pain Points</label>
                <textarea
                  rows={2}
                  value={extractedLead.notes || ''}
                  onChange={(e) => setExtractedLead({ ...extractedLead, notes: e.target.value })}
                  className="w-full mt-1 p-2 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setExtractedLead(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  ← Back to input
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveToPipeline}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirm & Add to Pipeline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
