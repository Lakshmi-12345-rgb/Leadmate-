import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus, Edit3, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { LeadSource, LeadStatus, LeadUrgency } from '../../types';

export const LeadModal: React.FC = () => {
  const {
    isNewLeadModalOpen,
    setIsNewLeadModalOpen,
    leadToEdit,
    setLeadToEdit,
    setIsSmartIntakeModalOpen,
    addLead,
    updateLead,
    leads,
    settings,
  } = useApp();

  const isEditMode = Boolean(leadToEdit);

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [dealValue, setDealValue] = useState('3500');
  const [urgency, setUrgency] = useState<LeadUrgency>('Medium');
  const [source, setSource] = useState<LeadSource>('Website Form');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [notes, setNotes] = useState('');
  const [inquiry, setInquiry] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Inbound']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    duplicate?: string;
  }>({});

  // Reset or pre-populate on open
  useEffect(() => {
    if (!isNewLeadModalOpen) return;

    if (leadToEdit) {
      setName(leadToEdit.name || '');
      setCompany(leadToEdit.company || '');
      setEmail(leadToEdit.email || '');
      setPhone(leadToEdit.phone || '');
      setService(leadToEdit.service || settings.services[0] || 'Custom Website Redesign');
      setDealValue(leadToEdit.dealValue?.toString() || '0');
      setUrgency(leadToEdit.urgency || leadToEdit.priority || 'Medium');
      setSource(leadToEdit.source || 'Website Form');
      setStatus(leadToEdit.status || 'New');
      setNotes(leadToEdit.notes || '');
      setInquiry(leadToEdit.inquiry || '');
      setNextFollowUpDate(leadToEdit.nextFollowUpDate || '');
      setTags(leadToEdit.tags && leadToEdit.tags.length > 0 ? leadToEdit.tags : ['Inbound']);
      setErrors({});
    } else {
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setService(settings.services[0] || 'Custom Website Redesign');
      setDealValue('3500');
      setUrgency('Medium');
      setSource('Website Form');
      setStatus('New');
      setNotes('');
      setInquiry('');
      // Default next follow-up to tomorrow
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0];
      setNextFollowUpDate(tomorrow);
      setTags(['Inbound']);
      setErrors({});
    }
  }, [isNewLeadModalOpen, leadToEdit, settings]);

  if (!isNewLeadModalOpen) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; phone?: string; duplicate?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Full name or business name is required.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address (e.g. name@domain.com).';
      }
    }

    if (phone.trim() && phone.trim().length < 6) {
      newErrors.phone = 'Phone number should be at least 6 characters.';
    }

    // Check duplicate email or name+company for other records
    if (!isEditMode) {
      const duplicateByEmail = email.trim()
        ? leads.find((l) => l.email && l.email.toLowerCase() === email.trim().toLowerCase())
        : null;

      if (duplicateByEmail) {
        newErrors.duplicate = `A lead with email "${email.trim()}" already exists (${duplicateByEmail.name}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (isEditMode && leadToEdit) {
        updateLead(leadToEdit.id, {
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service,
          dealValue: Number(dealValue) || 0,
          urgency,
          priority: urgency,
          source,
          status,
          notes: notes.trim(),
          inquiry: inquiry.trim() || notes.trim(),
          nextFollowUpDate: nextFollowUpDate || undefined,
          tags,
        });
      } else {
        addLead({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          service,
          dealValue: Number(dealValue) || 0,
          urgency,
          priority: urgency,
          source,
          status,
          notes: notes.trim(),
          inquiry: inquiry.trim() || notes.trim(),
          nextFollowUpDate: nextFollowUpDate || undefined,
          tags,
        });
      }

      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsNewLeadModalOpen(false);
    setLeadToEdit(null);
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#111827] rounded-xl shadow-2xl border border-slate-800 max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0B101D]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              {isEditMode ? <Edit3 className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-semibold text-xs text-white uppercase tracking-wider">
                {isEditMode ? 'Edit Lead Record' : 'Add New Lead'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEditMode
                  ? 'Update contact info, status, priority, and follow-up notes'
                  : 'Record a new customer enquiry or prospect in your sales pipeline'}
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

        {/* Smart intake trigger (only in create mode) */}
        {!isEditMode && (
          <div className="px-4 py-2 bg-violet-950/20 border-b border-violet-900/40 flex items-center justify-between text-xs">
            <span className="text-violet-300 flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Have raw unformatted enquiry text from an email or contact form?
            </span>
            <button
              type="button"
              onClick={() => {
                handleClose();
                setIsSmartIntakeModalOpen(true);
              }}
              className="text-[11px] font-medium text-violet-400 hover:text-violet-300 underline underline-offset-2 cursor-pointer"
            >
              Paste with AI Intake →
            </button>
          </div>
        )}

        {/* Duplicate warning */}
        {errors.duplicate && (
          <div className="px-4 py-2.5 bg-amber-950/30 border-b border-amber-900/50 flex items-center gap-2 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{errors.duplicate}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Identity & Business */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Full Name or Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Marcus Vance"
                className={`w-full p-2 bg-[#0F172A] border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 ${
                  errors.name ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Business Name <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Vance Plumbing & HVAC"
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Contact Email <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  if (errors.duplicate) setErrors((prev) => ({ ...prev, duplicate: undefined }));
                }}
                placeholder="marcus@vanceplumbing.com"
                className={`w-full p-2 bg-[#0F172A] border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 ${
                  errors.email ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {errors.email && <p className="text-[10px] text-rose-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Phone Number <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="+1 (555) 849-2311"
                className={`w-full p-2 bg-[#0F172A] border rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 ${
                  errors.phone ? 'border-rose-500' : 'border-slate-700/80'
                }`}
              />
              {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone}</p>}
            </div>
          </div>

          {/* Service & Deal value */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-slate-300 mb-1">
                Interest or Service Requested
              </label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              >
                {settings.services.map((s, idx) => (
                  <option key={idx} value={s}>
                    {s}
                  </option>
                ))}
                <option value="Consultation & Strategy">Consultation & Strategy</option>
                <option value="Custom Project Scope">Custom Project Scope</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Est. Deal Value ($)</label>
              <input
                type="number"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="2500"
                min="0"
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono text-slate-200"
              />
            </div>
          </div>

          {/* Pipeline Status, Priority & Source */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Pipeline Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-medium"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Interested">Interested</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Priority</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as LeadUrgency)}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-medium"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Lead Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as LeadSource)}
                className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              >
                <option value="Website Form">Website Form</option>
                <option value="Referral">Referral</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Cold Outreach">Cold Outreach</option>
                <option value="Google Local">Google Local</option>
                <option value="Instagram DM">Instagram DM</option>
                <option value="Phone Call">Phone Call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Next Follow-Up Date */}
          <div>
            <label className="block font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-violet-400" />
              <span>Next Follow-up Date</span>
              <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
              className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200 font-mono"
            />
          </div>

          {/* Customer Inquiry */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">
              Customer Message / Enquiry Text <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              placeholder="What did the prospect ask or describe in their initial message?"
              className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add sales notes, budget qualification, or partner details..."
              className="w-full p-2 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-slate-300 mb-1">Tags</label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Type tag and press Enter (e.g. VIP, Urgent)"
                className="flex-1 p-1.5 bg-[#0F172A] border border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-500 text-slate-200"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg cursor-pointer"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-950/40 border border-violet-800/40 text-[11px] text-violet-300 font-mono"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            {leadToEdit && (
              <span className="text-[10px] text-slate-500 font-mono">
                Created: {new Date(leadToEdit.createdAt).toLocaleDateString()}
                {leadToEdit.updatedAt ? ` · Updated: ${new Date(leadToEdit.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
              </span>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={handleClose}
                className="px-3.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs shadow-violet-950/40"
              >
                {isSubmitting
                  ? 'Saving...'
                  : isEditMode
                  ? 'Save Changes'
                  : 'Add Lead to Pipeline'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
