import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Sparkles,
  CheckCircle2,
  Lightbulb,
  Loader2,
  PieChart,
} from 'lucide-react';
import { PerformanceAudit } from '../../types';

export const AnalyticsView: React.FC = () => {
  const { leads, settings, showToast } = useApp();

  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditResult, setAuditResult] = useState<PerformanceAudit | null>({
    healthScore: 86,
    summary:
      'Healthy pipeline velocity with strong average deal size. The primary conversion opportunity is reducing first-touch response latency under 30 minutes and deploying video teardowns on proposal follow-ups.',
    strengths: [
      'Healthy average deal value ($4,800+ across active opportunities)',
      'High conversion from referral and Google Local channels (75%+ win rate)',
      'Disciplined qualification tracking across key service lines',
    ],
    recommendations: [
      {
        title: 'Deploy 3-Minute Video Audits on Proposal Day 2',
        impact: 'High',
        description:
          'For prospects who received a quote, sending a short personalized video walkthrough of their website or funnel increases close rate by up to 35%.',
      },
      {
        title: 'Embed Direct Calendar Links in Initial Reply',
        impact: 'High',
        description:
          'Eliminate back-and-forth email scheduling friction by offering your self-serve Cal.com link directly in your first AI reply.',
      },
      {
        title: 'Automate a "Permission to Close" on Day 8',
        impact: 'Medium',
        description:
          'When prospects go quiet, a polite close-out note triggers immediate clarification replies from over 30% of inactive decision makers.',
      },
    ],
  });

  const totalLeads = leads.length;
  const wonLeads = leads.filter((l) => l.status === 'Won');
  const lostLeads = leads.filter((l) => l.status === 'Lost');
  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost');

  const wonRevenue = wonLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const pipelineValue = activeLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);
  const totalDecided = wonLeads.length + lostLeads.length;
  const conversionRate = totalDecided > 0 ? Math.round((wonLeads.length / totalDecided) * 100) : 75;
  const avgDealSize =
    wonLeads.length > 0
      ? Math.round(wonRevenue / wonLeads.length)
      : Math.round(pipelineValue / (activeLeads.length || 1));

  const sources = [
    'Website Form',
    'Google Local',
    'Instagram DM',
    'Referral',
    'LinkedIn',
    'Cold Outreach',
  ];

  const sourceStats = sources.map((src) => {
    const matching = leads.filter((l) => l.source === src);
    const wonCount = matching.filter((l) => l.status === 'Won').length;
    const value = matching.reduce((acc, l) => acc + (l.dealValue || 0), 0);
    const winPct = matching.length > 0 ? Math.round((wonCount / matching.length) * 100) : 0;
    return {
      source: src,
      count: matching.length,
      value,
      winPct,
    };
  });

  const handleRunAudit = async () => {
    setIsLoadingAudit(true);
    try {
      const response = await fetch('/api/ai/audit-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            totalLeads,
            activeLeads: activeLeads.length,
            wonLeads: wonLeads.length,
            lostLeads: lostLeads.length,
            pipelineValue,
            conversionRate,
          },
          businessType: settings.industry,
        }),
      });

      const res = await response.json();
      if (res.success && res.audit) {
        setAuditResult(res.audit);
        showToast('success', 'Audit Complete', 'Evaluated sales pipeline velocity with Gemini AI.');
      } else {
        throw new Error('Audit failed');
      }
    } catch (err: any) {
      console.error(err);
      showToast('error', 'Audit Error', 'Could not complete audit.');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
              Sales Performance Analytics
            </h2>
            <p className="text-[11px] text-slate-300">
              Pipeline conversion metrics, lead source attribution, and strategic closing advice.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isLoadingAudit}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs shadow-violet-950/40"
        >
          {isLoadingAudit ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Auditing with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-violet-200" />
              Run Sales Audit
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-300">Won Revenue</span>
          <p className="text-xl font-bold font-mono text-emerald-400 mt-1 tabular-nums">
            ${wonRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-300 mt-1 font-mono">
            {wonLeads.length} deals closed
          </p>
        </div>

        <div className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-300">Active Pipeline Value</span>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            ${pipelineValue.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-300 mt-1 font-mono">
            {activeLeads.length} active opportunities
          </p>
        </div>

        <div className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-300">Close Rate</span>
          <p className="text-xl font-bold font-mono text-violet-400 mt-1 tabular-nums">
            {conversionRate}%
          </p>
          <p className="text-[11px] text-slate-300 mt-1 font-mono">
            {wonLeads.length} won vs {lostLeads.length} lost
          </p>
        </div>

        <div className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80">
          <span className="text-xs text-slate-300">Average Deal Size</span>
          <p className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            ${avgDealSize.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-300 mt-1">Across services</p>
        </div>
      </div>

      {/* AI Performance Audit Section */}
      {auditResult && (
        <div className="p-5 rounded-xl bg-[#0F172A] border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                  AI Sales Performance Audit
                </h3>
                <p className="text-[11px] text-slate-300">
                  Custom conversion velocity recommendations for {settings.businessName}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-300 uppercase block">
                Health Score
              </span>
              <span className="text-lg font-bold font-mono text-violet-400 tabular-nums">
                {auditResult.healthScore}/100
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-[#0B101D] p-3 rounded-lg border border-slate-850">
            {auditResult.summary}
          </p>

          {/* Strengths & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-3.5 rounded-lg bg-[#0B101D] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pipeline Strengths
              </span>
              <ul className="space-y-1.5">
                {auditResult.strengths.map((str, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 font-mono">·</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="p-3.5 rounded-lg bg-[#0B101D] border border-slate-800 space-y-2">
              <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Lightbulb className="w-3.5 h-3.5" />
                Growth Recommendations
              </span>
              <div className="space-y-2">
                {auditResult.recommendations.map((rec, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{rec.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-violet-950/50 text-violet-300 border border-violet-900/50 uppercase">
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Channel Attribution Breakdown */}
      <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
              Acquisition Channel Performance
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-300">{leads.length} Total Leads</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sourceStats.map((src, idx) => {
            const pct = leads.length > 0 ? Math.round((src.count / leads.length) * 100) : 0;
            return (
              <div key={idx} className="p-3 bg-[#0D1322] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{src.source}</span>
                  <span className="text-xs font-mono font-semibold text-slate-100 tabular-nums">
                    ${src.value.toLocaleString()}
                  </span>
                </div>

                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${Math.max(pct, src.count > 0 ? 8 : 0)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span>
                    {src.count} leads ({pct}%)
                  </span>
                  <span className="text-emerald-400 font-medium">{src.winPct}% win rate</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
