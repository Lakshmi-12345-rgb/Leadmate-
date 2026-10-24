import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Download,
  Plus,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Building,
  Mail,
  Phone,
  Calendar,
  Clock,
  ArrowUpDown,
  Edit3,
  Trash2,
  AlertCircle,
  RotateCcw,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Lead, LeadStatus, LeadUrgency, LeadSource } from '../../types';

interface LeadsViewProps {
  searchQuery: string;
}

export const LeadsView: React.FC<LeadsViewProps> = ({ searchQuery: globalSearch }) => {
  const {
    leads,
    moveLeadStatus,
    setActiveLeadForDrawer,
    openReplyGeneratorForLead,
    openCreateLeadModal,
    openEditLeadModal,
    setLeadToDelete,
    leadFilterStatus,
    setLeadFilterStatus,
    resetToDemoData,
    showToast,
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('table');
  const [localSearch, setLocalSearch] = useState('');
  const statusFilter = leadFilterStatus;
  const setStatusFilter = setLeadFilterStatus;
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<
    'recent' | 'oldest' | 'followup_soon' | 'followup_late' | 'priority' | 'value' | 'name'
  >('recent');

  const activeSearch = globalSearch || localSearch;

  // Standardized pipeline stages
  const PIPELINE_COLUMNS: {
    id: LeadStatus;
    label: string;
    dotClass: string;
    match: (status: LeadStatus) => boolean;
  }[] = [
    {
      id: 'New',
      label: 'New',
      dotClass: 'bg-sky-400',
      match: (s) => s === 'New' || s === 'New Enquiry',
    },
    {
      id: 'Contacted',
      label: 'Contacted',
      dotClass: 'bg-amber-400',
      match: (s) => s === 'Contacted',
    },
    {
      id: 'Interested',
      label: 'Interested',
      dotClass: 'bg-violet-400',
      match: (s) => s === 'Interested' || s === 'Meeting Scheduled' || s === 'Proposal Sent',
    },
    {
      id: 'Won',
      label: 'Won',
      dotClass: 'bg-emerald-400',
      match: (s) => s === 'Won',
    },
    {
      id: 'Lost',
      label: 'Lost',
      dotClass: 'bg-slate-500',
      match: (s) => s === 'Lost',
    },
  ];

  // Filtering & Sorting
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // 1. Search by name, business/company, email, or phone
        if (activeSearch.trim()) {
          const q = activeSearch.toLowerCase().trim();
          const matches =
            (lead.name && lead.name.toLowerCase().includes(q)) ||
            (lead.company && lead.company.toLowerCase().includes(q)) ||
            (lead.email && lead.email.toLowerCase().includes(q)) ||
            (lead.phone && lead.phone.toLowerCase().includes(q)) ||
            (lead.service && lead.service.toLowerCase().includes(q));
          if (!matches) return false;
        }

        // 2. Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'New') {
            if (lead.status !== 'New' && lead.status !== 'New Enquiry') return false;
          } else if (statusFilter === 'Interested') {
            if (
              lead.status !== 'Interested' &&
              lead.status !== 'Meeting Scheduled' &&
              lead.status !== 'Proposal Sent'
            ) {
              return false;
            }
          } else if (lead.status !== statusFilter) {
            return false;
          }
        }

        // 3. Priority filter
        if (priorityFilter !== 'all') {
          const p = lead.priority || lead.urgency;
          if (p !== priorityFilter) return false;
        }

        // 4. Source filter
        if (sourceFilter !== 'all' && lead.source !== sourceFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'recent') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === 'followup_soon') {
          const dateA = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : Infinity;
          const dateB = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : Infinity;
          return dateA - dateB;
        }
        if (sortBy === 'followup_late') {
          const dateA = a.nextFollowUpDate ? new Date(a.nextFollowUpDate).getTime() : -Infinity;
          const dateB = b.nextFollowUpDate ? new Date(b.nextFollowUpDate).getTime() : -Infinity;
          return dateB - dateA;
        }
        if (sortBy === 'priority') {
          const rank: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
          return (rank[b.priority || b.urgency] || 0) - (rank[a.priority || a.urgency] || 0);
        }
        if (sortBy === 'value') {
          return (b.dealValue || 0) - (a.dealValue || 0);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [leads, activeSearch, statusFilter, priorityFilter, sourceFilter, sortBy]);

  // Reset filters
  const handleResetFilters = () => {
    setLocalSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSourceFilter('all');
    setSortBy('recent');
  };

  const hasActiveFilters =
    activeSearch.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    sourceFilter !== 'all';

  // Move lead stage
  const handleShiftStage = (leadId: string, currentStatus: LeadStatus, direction: 'prev' | 'next') => {
    const statuses: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Won', 'Lost'];
    // Normalise
    const currentNorm =
      currentStatus === 'New Enquiry'
        ? 'New'
        : currentStatus === 'Meeting Scheduled' || currentStatus === 'Proposal Sent'
        ? 'Interested'
        : currentStatus;

    const currentIndex = statuses.indexOf(currentNorm as LeadStatus);
    const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (targetIndex >= 0 && targetIndex < statuses.length) {
      moveLeadStatus(leadId, statuses[targetIndex]);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Business / Company',
      'Email',
      'Phone',
      'Source',
      'Service Requested',
      'Status',
      'Priority',
      'Deal Value ($)',
      'Next Follow-up Date',
      'Date Created',
      'Last Updated',
      'Notes',
    ];
    const rows = filteredLeads.map((l) => [
      `"${l.name || ''}"`,
      `"${l.company || ''}"`,
      `"${l.email || ''}"`,
      `"${l.phone || ''}"`,
      `"${l.source || ''}"`,
      `"${l.service || ''}"`,
      `"${l.status || ''}"`,
      `"${l.priority || l.urgency || ''}"`,
      l.dealValue || 0,
      `"${l.nextFollowUpDate || ''}"`,
      `"${l.createdAt || ''}"`,
      `"${l.updatedAt || l.lastContactDate || ''}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadmate-leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'CSV Exported', `Exported ${filteredLeads.length} leads.`);
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'High') {
      return (
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-900/60">
          High
        </span>
      );
    }
    if (priority === 'Medium') {
      return (
        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-900/60">
          Medium
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
        Low
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
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
        className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
          map[status] || 'text-slate-400 bg-slate-800'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Leads & Pipeline</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/50">
              {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage inbound enquiries, track stages, and follow up with potential customers
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View mode toggle */}
          <div className="flex items-center bg-[#111827] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-violet-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded text-xs transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-violet-600 text-white font-medium shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={filteredLeads.length === 0}
            className="p-2 text-xs font-medium text-slate-300 hover:text-white bg-[#111827] hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
            title="Export filtered leads to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={openCreateLeadModal}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shadow-violet-950/40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#111827] border border-slate-800 rounded-xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search by name, business, email, phone */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search by name, company, email, or phone..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          {/* Priority filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Source filter */}
          <div>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-[#0F172A] border border-slate-700/80 rounded-lg text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="all">All Sources</option>
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

        {/* Secondary Bar: Sort & Filter Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-1 px-2 text-[11px] bg-[#0F172A] border border-slate-700/80 rounded-md text-slate-300 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="recent">Created: Newest First</option>
              <option value="oldest">Created: Oldest First</option>
              <option value="followup_soon">Follow-up: Soonest First</option>
              <option value="followup_late">Follow-up: Furthest First</option>
              <option value="priority">Priority: High to Low</option>
              <option value="value">Deal Value: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Empty States or Views */}
      {leads.length === 0 ? (
        /* Workspace Empty State */
        <div className="p-12 bg-[#111827]/80 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center mx-auto">
            <Plus className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Leads in Pipeline</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your sales database is currently empty. Add a new lead manually with custom contact details and follow-up tasks, or load our realistic sample workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={openCreateLeadModal}
              className="px-4 py-2 text-xs font-medium text-white bg-violet-600 hover:bg-violet-500 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Add First Lead
            </button>
            <button
              onClick={resetToDemoData}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Load Sample Leads
            </button>
          </div>
        </div>
      ) : filteredLeads.length === 0 ? (
        /* Filter / Search Yielded 0 Leads */
        <div className="p-10 bg-[#111827]/80 rounded-2xl border border-slate-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-sm font-semibold text-white">No matching leads found</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We couldn't find any leads matching your active search query or selected filter criteria.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-3 py-1.5 text-xs font-medium text-violet-400 hover:text-violet-300 bg-violet-950/40 hover:bg-violet-950/60 border border-violet-800/50 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear Search & Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-[#111827] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0B101D] text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Contact & Business</th>
                  <th className="py-3 px-3">Service / Request</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Est. Value</th>
                  <th className="py-3 px-3">Next Follow-Up</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLeads.map((lead) => {
                  const priority = lead.priority || lead.urgency || 'Medium';
                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-[#131D31]/50 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <button
                            onClick={() => setActiveLeadForDrawer(lead)}
                            className="font-semibold text-slate-100 hover:text-violet-400 transition-colors text-left cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{lead.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800/90 text-slate-400 border border-slate-700/80">
                              {lead.source}
                            </span>
                          </button>
                          {lead.company && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Building className="w-3 h-3 text-slate-500" />
                              {lead.company}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                            {lead.email && (
                              <a
                                href={`mailto:${lead.email}`}
                                className="hover:text-slate-200 flex items-center gap-1"
                              >
                                <Mail className="w-2.5 h-2.5 text-violet-400" />
                                {lead.email}
                              </a>
                            )}
                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                className="hover:text-slate-200 flex items-center gap-1"
                              >
                                <Phone className="w-2.5 h-2.5 text-violet-400" />
                                {lead.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3 max-w-[180px]">
                        <p className="font-medium text-slate-200 truncate">{lead.service}</p>
                        {lead.notes && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5" title={lead.notes}>
                            {lead.notes}
                          </p>
                        )}
                      </td>

                      {/* Pipeline Status with Inline Dropdown */}
                      <td className="py-3 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) => moveLeadStatus(lead.id, e.target.value as LeadStatus)}
                          className="text-[11px] font-medium py-1 px-2 rounded-md bg-[#0F172A] border border-slate-700 text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                          title="Change status without recreating record"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-3">{getPriorityBadge(priority)}</td>

                      {/* Deal Value */}
                      <td className="py-3 px-3 font-mono text-slate-200 font-medium">
                        ${(lead.dealValue || 0).toLocaleString()}
                      </td>

                      {/* Next Follow-Up */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-300">
                        {lead.nextFollowUpDate ? (
                          <span className="flex items-center gap-1 text-violet-300">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.nextFollowUpDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">—</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openReplyGeneratorForLead(lead)}
                            className="p-1.5 text-slate-400 hover:text-violet-300 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Generate AI Reply"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditLeadModal(lead)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Edit Lead"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {PIPELINE_COLUMNS.map((col) => {
            const colLeads = filteredLeads.filter((l) => col.match(l.status));
            const colValue = colLeads.reduce((sum, l) => sum + (l.dealValue || 0), 0);

            return (
              <div
                key={col.id}
                className="bg-[#111827]/70 border border-slate-800 rounded-xl p-3 space-y-3 min-h-[300px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotClass}`} />
                    <span className="font-semibold text-xs text-white">{col.label}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {colLeads.length}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    ${colValue.toLocaleString()}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 flex-1">
                  {colLeads.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-slate-500 italic border border-dashed border-slate-800/70 rounded-lg">
                      No leads in this stage
                    </div>
                  ) : (
                    colLeads.map((lead) => {
                      const priority = lead.priority || lead.urgency || 'Medium';
                      return (
                        <div
                          key={lead.id}
                          className="p-3 bg-[#0F172A] hover:bg-[#131D31] border border-slate-800 hover:border-slate-700/80 rounded-lg transition-all group space-y-2 shadow-xs"
                        >
                          {/* Card top */}
                          <div className="flex items-start justify-between gap-1.5">
                            <div>
                              <button
                                onClick={() => setActiveLeadForDrawer(lead)}
                                className="font-semibold text-xs text-white hover:text-violet-300 text-left cursor-pointer line-clamp-1"
                              >
                                {lead.name}
                              </button>
                              {lead.company && (
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 line-clamp-1">
                                  <Building className="w-3 h-3 text-slate-500 shrink-0" />
                                  {lead.company}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => openEditLeadModal(lead)}
                                className="p-1 text-slate-500 hover:text-white rounded transition-colors cursor-pointer"
                                title="Edit Lead"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setLeadToDelete(lead)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors cursor-pointer"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Service and value */}
                          <div className="flex items-center justify-between text-[11px] pt-1">
                            <span className="text-slate-300 truncate max-w-[120px]">{lead.service}</span>
                            <span className="font-mono font-medium text-slate-200">
                              ${(lead.dealValue || 0).toLocaleString()}
                            </span>
                          </div>

                          {/* Badges & Next follow-up */}
                          <div className="flex items-center justify-between pt-1 text-[10px]">
                            {getPriorityBadge(priority)}

                            {lead.nextFollowUpDate && (
                              <span className="font-mono text-violet-300 flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" />
                                {new Date(lead.nextFollowUpDate).toLocaleDateString([], {
                                  month: 'numeric',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </div>

                          {/* Stage shift arrows */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                            <button
                              onClick={() => handleShiftStage(lead.id, lead.status, 'prev')}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Move to previous stage"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => openReplyGeneratorForLead(lead)}
                              className="text-[10px] text-violet-400 hover:text-violet-300 font-medium cursor-pointer flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> AI Reply
                            </button>
                            <button
                              onClick={() => handleShiftStage(lead.id, lead.status, 'next')}
                              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
                              title="Move to next stage"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
