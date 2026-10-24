import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Link,
  Sparkles,
  Save,
  RotateCcw,
  Download,
  Trash2,
} from 'lucide-react';
import { BusinessSettings } from '../../types';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData, exportDataJson } = useApp();

  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [newServiceInput, setNewServiceInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleAddService = () => {
    if (newServiceInput.trim() && !formData.services.includes(newServiceInput.trim())) {
      setFormData({
        ...formData,
        services: [...formData.services, newServiceInput.trim()],
      });
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (serviceToRemove: string) => {
    setFormData({
      ...formData,
      services: formData.services.filter((s) => s !== serviceToRemove),
    });
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="p-4 bg-[#111827]/90 rounded-xl border border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
              Workspace & AI Settings
            </h2>
            <p className="text-[11px] text-slate-300">
              Configure company profile, calendar scheduling link, and core services.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-xs shadow-violet-950/40"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Business Profile */}
        <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3.5">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-3.5 h-3.5 text-violet-400" />
            Company & Sender Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Owner / Sender Name</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Business Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Business Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-300 mb-1">
                Industry & Service Line
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Link className="w-3.5 h-3.5 text-violet-400" />
            Direct Calendar Booking Link
          </h3>
          <p className="text-[11px] text-slate-300">
            This URL is automatically embedded in sales replies to schedule discovery calls.
          </p>

          <input
            type="url"
            value={formData.bookingUrl}
            onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
            placeholder="https://cal.com/your-name/15min"
            className="w-full p-2 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-mono"
          />
        </div>

        {/* Core Services */}
        <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            Core Service Offerings
          </h3>
          <p className="text-[11px] text-slate-300">
            Services used for AI proposal qualification and lead intake matching.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Local SEO Growth Retainer"
              value={newServiceInput}
              onChange={(e) => setNewServiceInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddService();
                }
              }}
              className="flex-1 p-2 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
            />
            <button
              type="button"
              onClick={handleAddService}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer"
            >
              Add
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {formData.services.map((svc, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#0F172A] border border-slate-700 text-slate-200 text-xs"
              >
                <span>{svc}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(svc)}
                  className="text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="p-5 bg-[#111827]/90 rounded-xl border border-slate-800/80 space-y-3.5">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Data Management
          </h3>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-medium text-slate-200">Export All LeadMate Data</p>
              <p className="text-slate-300 text-[11px]">
                Download a JSON backup of leads, follow-ups, and templates.
              </p>
            </div>
            <button
              type="button"
              onClick={exportDataJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export JSON</span>
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-medium text-slate-200">Reset Demonstration Leads</p>
              <p className="text-slate-300 text-[11px]">
                Restores original sample leads and follow-ups.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset workspace to initial demonstration data?')) {
                  resetToDemoData();
                  setFormData(settings);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/60 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Reset Demo</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
