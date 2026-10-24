import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Lead,
  FollowUp,
  SavedTemplate,
  BusinessSettings,
  NotificationItem,
  LeadStatus,
  AIAnalysis,
} from '../types';
import {
  initialLeads,
  initialFollowUps,
  initialSavedTemplates,
  initialBusinessSettings,
} from '../data/initialData';

export type ActiveTab = 'dashboard' | 'leads' | 'ai-replies' | 'follow-ups' | 'analytics' | 'settings';

interface ToastInfo {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  leads: Lead[];
  followUps: FollowUp[];
  templates: SavedTemplate[];
  settings: BusinessSettings;
  notifications: NotificationItem[];
  selectedLeadForReply: Lead | null;
  setSelectedLeadForReply: (lead: Lead | null) => void;
  activeLeadForDrawer: Lead | null;
  setActiveLeadForDrawer: (lead: Lead | null) => void;
  isNewLeadModalOpen: boolean;
  setIsNewLeadModalOpen: (open: boolean) => void;
  isSmartIntakeModalOpen: boolean;
  setIsSmartIntakeModalOpen: (open: boolean) => void;
  isFollowUpModalOpen: boolean;
  setIsFollowUpModalOpen: (open: boolean) => void;
  activeFollowUpForModal: FollowUp | null;
  setActiveFollowUpForModal: (fu: FollowUp | null) => void;
  isQuickReplyModalOpen: boolean;
  setIsQuickReplyModalOpen: (open: boolean) => void;
  leadFilterStatus: string;
  setLeadFilterStatus: (status: string) => void;
  followUpFilterTab: string;
  setFollowUpFilterTab: (tab: string) => void;
  leadToEdit: Lead | null;
  setLeadToEdit: (lead: Lead | null) => void;
  leadToDelete: Lead | null;
  setLeadToDelete: (lead: Lead | null) => void;
  openCreateLeadModal: () => void;
  openEditLeadModal: (lead: Lead) => void;
  confirmDeleteLead: () => void;
  toast: ToastInfo | null;
  showToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
  
  // Navigation with filters
  openLeadsWithFilter: (status: string) => void;
  openFollowUpsWithTab: (tab: string) => void;

  // Lead operations
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'lastContactDate' | 'timeline' | 'score' | 'scoreTier'> & { id?: string }) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStatus: (id: string, newStatus: LeadStatus) => void;
  qualifyLeadWithAI: (id: string) => Promise<AIAnalysis | null>;
  openReplyGeneratorForLead: (lead: Lead) => void;
  
  // Follow-up operations
  addFollowUp: (followUp: Omit<FollowUp, 'id' | 'status'> & { id?: string }) => void;
  toggleFollowUpComplete: (id: string) => void;
  rescheduleFollowUp: (id: string, newDateOrDays: number | string) => void;
  cancelFollowUp: (id: string) => void;
  deleteFollowUp: (id: string) => void;
  
  // Template operations
  addTemplate: (template: Omit<SavedTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  
  // Settings operations
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  
  // Notification operations
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Utility operations
  resetToDemoData: () => void;
  clearAllLeads: () => void;
  exportDataJson: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Leads
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const stored = localStorage.getItem('leadmate_leads');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading leads from storage:', e);
    }
    return initialLeads;
  });

  // Follow-ups
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    try {
      const stored = localStorage.getItem('leadmate_followups');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading followups from storage:', e);
    }
    return initialFollowUps;
  });

  // Templates
  const [templates, setTemplates] = useState<SavedTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('leadmate_templates');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading templates from storage:', e);
    }
    return initialSavedTemplates;
  });

  // Settings
  const [settings, setSettings] = useState<BusinessSettings>(() => {
    try {
      const stored = localStorage.getItem('leadmate_settings');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading settings from storage:', e);
    }
    return initialBusinessSettings;
  });

  // Filter links
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>('all');
  const [followUpFilterTab, setFollowUpFilterTab] = useState<string>('today');

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'High-Value Lead Received',
      message: 'Siddharth Rao (Zenith FinTech) submitted a $9,200 website enquiry.',
      type: 'lead',
      read: false,
      timestamp: '1 hour ago',
    },
    {
      id: 'notif-2',
      title: 'Follow-up Due Today',
      message: 'Proposal check-in for Chloe Tremblay (Atelier Café) is scheduled.',
      type: 'followup',
      read: false,
      timestamp: '3 hours ago',
    },
  ]);

  // Modals & Navigation state
  const [selectedLeadForReply, setSelectedLeadForReply] = useState<Lead | null>(null);
  const [activeLeadForDrawer, setActiveLeadForDrawer] = useState<Lead | null>(null);
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);
  const [leadToEdit, setLeadToEdit] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isSmartIntakeModalOpen, setIsSmartIntakeModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isQuickReplyModalOpen, setIsQuickReplyModalOpen] = useState(false);
  const [activeFollowUpForModal, setActiveFollowUpForModal] = useState<FollowUp | null>(null);
  const [toast, setToast] = useState<ToastInfo | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('leadmate_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('leadmate_followups', JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem('leadmate_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('leadmate_settings', JSON.stringify(settings));
  }, [settings]);

  const showToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToast({ id, type, title, message });
    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4000);
  };

  const openLeadsWithFilter = (status: string) => {
    setLeadFilterStatus(status);
    setActiveTab('leads');
  };

  const openFollowUpsWithTab = (tab: string) => {
    setFollowUpFilterTab(tab);
    setActiveTab('follow-ups');
  };

  const openCreateLeadModal = () => {
    setLeadToEdit(null);
    setIsNewLeadModalOpen(true);
  };

  const openEditLeadModal = (lead: Lead) => {
    setLeadToEdit(lead);
    setIsNewLeadModalOpen(true);
  };

  const confirmDeleteLead = () => {
    if (leadToDelete) {
      deleteLead(leadToDelete.id);
      setLeadToDelete(null);
    }
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'lastContactDate' | 'timeline' | 'score' | 'scoreTier'> & { id?: string }): Lead => {
    const id = leadData.id || `lead-${Date.now()}`;
    const urgency = leadData.urgency || leadData.priority || 'Medium';
    const calculatedScore = urgency === 'High' ? 85 : urgency === 'Medium' ? 70 : 50;
    const scoreTier = calculatedScore >= 80 ? 'Hot' : calculatedScore >= 60 ? 'Warm' : 'Cool';
    const nowIso = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id,
      urgency,
      priority: urgency,
      score: calculatedScore,
      scoreTier,
      createdAt: nowIso,
      updatedAt: nowIso,
      lastContactDate: nowIso,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: 'note',
          title: 'Lead Created',
          content: `Inquiry received via ${leadData.source || 'Direct Entry'}.`,
          timestamp: nowIso,
        },
      ],
    };

    setLeads((prev) => [newLead, ...prev]);

    // Auto-schedule initial follow-up using provided date or today
    const followUpDate = newLead.nextFollowUpDate || nowIso.split('T')[0];
    const autoFollowUp: FollowUp = {
      id: `fu-${Date.now()}`,
      leadId: newLead.id,
      leadName: newLead.name,
      leadCompany: newLead.company || '',
      title: `Follow up with ${newLead.name}`,
      channel: newLead.phone ? 'phone' : 'email',
      dueDate: followUpDate,
      dueTime: '10:00 AM',
      status: 'pending',
      priority: urgency === 'High' ? 'high' : 'medium',
      suggestedMessage: `Hi ${newLead.name}, thanks for reaching out regarding ${newLead.service || 'our services'}. Would love to discuss your requirements.`,
    };
    setFollowUps((prev) => [autoFollowUp, ...prev]);

    showToast('success', 'Lead Added', `${newLead.name} added to pipeline.`);
    return newLead;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    const nowIso = new Date().toISOString();
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id) {
          const priorityVal = updates.priority || updates.urgency || lead.priority || lead.urgency;
          const auditEvent = {
            id: `t-${Date.now()}`,
            type: 'note' as const,
            title: 'Lead Updated',
            content: updates.status && updates.status !== lead.status
              ? `Status changed to ${updates.status}`
              : 'Lead details updated.',
            timestamp: nowIso,
          };
          const updated: Lead = {
            ...lead,
            ...updates,
            urgency: priorityVal,
            priority: priorityVal,
            updatedAt: nowIso,
            timeline: [auditEvent, ...(lead.timeline || [])],
          };
          if (activeLeadForDrawer?.id === id) {
            setActiveLeadForDrawer(updated);
          }
          return updated;
        }
        return lead;
      })
    );

    // If nextFollowUpDate was updated, update or create pending follow-up
    if (updates.nextFollowUpDate) {
      setFollowUps((prev) => {
        const existing = prev.find((fu) => fu.leadId === id && fu.status === 'pending');
        if (existing) {
          return prev.map((fu) =>
            fu.id === existing.id ? { ...fu, dueDate: updates.nextFollowUpDate! } : fu
          );
        } else {
          const lead = leads.find((l) => l.id === id);
          return [
            {
              id: `fu-${Date.now()}`,
              leadId: id,
              leadName: lead?.name || 'Lead',
              leadCompany: lead?.company || '',
              title: `Follow up with ${lead?.name || 'Lead'}`,
              channel: 'email',
              dueDate: updates.nextFollowUpDate!,
              dueTime: '10:00 AM',
              status: 'pending',
              priority: (updates.priority || updates.urgency || lead?.urgency) === 'High' ? 'high' : 'medium',
            },
            ...prev,
          ];
        }
      });
    }

    showToast('success', 'Lead Updated', 'Changes saved successfully.');
  };

  const deleteLead = (id: string) => {
    const leadToRemove = leads.find((l) => l.id === id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
    setFollowUps((prev) => prev.filter((fu) => fu.leadId !== id));
    if (activeLeadForDrawer?.id === id) {
      setActiveLeadForDrawer(null);
    }
    if (leadToDelete?.id === id) {
      setLeadToDelete(null);
    }
    showToast('info', 'Lead Deleted', `${leadToRemove?.name || 'Lead'} and related tasks removed.`);
  };

  const moveLeadStatus = (id: string, newStatus: LeadStatus) => {
    const nowIso = new Date().toISOString();
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id === id && lead.status !== newStatus) {
          const statusEvent = {
            id: `t-${Date.now()}`,
            type: 'status_change' as const,
            title: `Stage Changed to ${newStatus}`,
            content: `Status updated from ${lead.status} to ${newStatus}.`,
            timestamp: nowIso,
          };
          const updated: Lead = {
            ...lead,
            status: newStatus,
            updatedAt: nowIso,
            lastContactDate: nowIso,
            timeline: [statusEvent, ...lead.timeline],
          };
          if (activeLeadForDrawer?.id === id) {
            setActiveLeadForDrawer(updated);
          }
          return updated;
        }
        return lead;
      })
    );
    showToast('success', 'Stage Updated', `Moved lead to ${newStatus}`);
  };

  const qualifyLeadWithAI = async (id: string): Promise<AIAnalysis | null> => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return null;

    try {
      const response = await fetch('/api/ai/score-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          businessContext: {
            name: settings.businessName,
            services: settings.services.join(', '),
          },
        }),
      });

      const res = await response.json();
      if (res.success && res.data) {
        const analysis: AIAnalysis = {
          ...res.data,
          evaluatedAt: new Date().toISOString(),
        };

        updateLead(id, {
          score: analysis.score,
          scoreTier: analysis.tier,
          aiAnalysis: analysis,
          timeline: [
            {
              id: `t-${Date.now()}`,
              type: 'ai_reply',
              title: `AI Qualification: ${analysis.tier} (${analysis.score}/100)`,
              content: analysis.intentSummary,
              timestamp: new Date().toISOString(),
            },
            ...lead.timeline,
          ],
        });

        showToast('success', 'AI Qualification Complete', `${lead.name} rated as ${analysis.tier} (${analysis.score}/100)`);
        return analysis;
      }
    } catch (err: any) {
      console.error('Failed to qualify lead with AI:', err);
      showToast('error', 'AI Scoring Error', 'Could not complete AI qualification analysis.');
    }
    return null;
  };

  const openReplyGeneratorForLead = (lead: Lead) => {
    setSelectedLeadForReply(lead);
    setActiveTab('ai-replies');
  };

  // Helper to sync lead nextFollowUpDate based on remaining pending tasks
  const syncLeadNextFollowUpDate = (leadId: string, updatedFollowUps: FollowUp[]) => {
    if (!leadId) return;
    const pendingForLead = updatedFollowUps
      .filter((fu) => fu.leadId === leadId && fu.status === 'pending')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const nextDate = pendingForLead[0]?.dueDate || undefined;
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, nextFollowUpDate: nextDate } : l))
    );
  };

  // Follow-up handlers
  const addFollowUp = (data: Omit<FollowUp, 'id' | 'status'> & { id?: string }) => {
    const newFu: FollowUp = {
      ...data,
      id: data.id || `fu-${Date.now()}`,
      status: 'pending',
    };
    const nextList = [newFu, ...followUps];
    setFollowUps(nextList);
    syncLeadNextFollowUpDate(data.leadId, nextList);
    showToast('success', 'Follow-Up Scheduled', `Reminder set for ${data.leadName} on ${data.dueDate}.`);
  };

  const toggleFollowUpComplete = (id: string) => {
    let affectedLeadId = '';
    const nextList = followUps.map((fu) => {
      if (fu.id === id) {
        affectedLeadId = fu.leadId;
        const nextStatus = fu.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') {
          showToast('success', 'Follow-Up Completed', `Marked "${fu.title}" as done.`);
        }
        return {
          ...fu,
          status: nextStatus as any,
          completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
        };
      }
      return fu;
    });
    setFollowUps(nextList);
    if (affectedLeadId) syncLeadNextFollowUpDate(affectedLeadId, nextList);
  };

  const rescheduleFollowUp = (id: string, newDateOrDays: number | string) => {
    const targetDate =
      typeof newDateOrDays === 'number'
        ? new Date(Date.now() + newDateOrDays * 24 * 3600 * 1000).toISOString().split('T')[0]
        : newDateOrDays;

    let affectedLeadId = '';
    const nextList = followUps.map((fu) => {
      if (fu.id === id) {
        affectedLeadId = fu.leadId;
        return { ...fu, dueDate: targetDate, status: 'pending' as const };
      }
      return fu;
    });
    setFollowUps(nextList);
    if (affectedLeadId) syncLeadNextFollowUpDate(affectedLeadId, nextList);
    showToast('info', 'Follow-Up Rescheduled', `Moved to ${targetDate}.`);
  };

  const cancelFollowUp = (id: string) => {
    let affectedLeadId = '';
    const nextList = followUps.map((fu) => {
      if (fu.id === id) {
        affectedLeadId = fu.leadId;
        return { ...fu, status: 'cancelled' as const };
      }
      return fu;
    });
    setFollowUps(nextList);
    if (affectedLeadId) syncLeadNextFollowUpDate(affectedLeadId, nextList);
    showToast('info', 'Follow-Up Cancelled', 'Task has been marked as cancelled.');
  };

  const deleteFollowUp = (id: string) => {
    const fuToDelete = followUps.find((fu) => fu.id === id);
    const nextList = followUps.filter((fu) => fu.id !== id);
    setFollowUps(nextList);
    if (fuToDelete?.leadId) syncLeadNextFollowUpDate(fuToDelete.leadId, nextList);
    showToast('info', 'Follow-Up Deleted');
  };

  // Template handlers
  const addTemplate = (template: Omit<SavedTemplate, 'id'>) => {
    const newTpl: SavedTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
    };
    setTemplates((prev) => [newTpl, ...prev]);
    showToast('success', 'Template Saved', `"${newTpl.title}" added to templates library.`);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast('info', 'Template Removed');
  };

  // Settings
  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('success', 'Settings Saved', 'Business preferences updated.');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Demo Reset & Empty state test
  const resetToDemoData = () => {
    setLeads(initialLeads);
    setFollowUps(initialFollowUps);
    setTemplates(initialSavedTemplates);
    setSettings(initialBusinessSettings);
    localStorage.removeItem('leadmate_leads');
    localStorage.removeItem('leadmate_followups');
    localStorage.removeItem('leadmate_templates');
    localStorage.removeItem('leadmate_settings');
    showToast('success', 'Demo Reset', 'Reloaded fresh sample leads, follow-ups, and agency settings.');
  };

  const clearAllLeads = () => {
    setLeads([]);
    setFollowUps([]);
    localStorage.removeItem('leadmate_leads');
    localStorage.removeItem('leadmate_followups');
    showToast('info', 'Workspace Cleared', 'All leads and follow-ups have been cleared. Empty state active.');
  };

  const exportDataJson = () => {
    const data = {
      leads,
      followUps,
      templates,
      settings,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadmate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Export Complete', 'Downloaded JSON backup of all leads and settings.');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        leads,
        followUps,
        templates,
        settings,
        notifications,
        selectedLeadForReply,
        setSelectedLeadForReply,
        activeLeadForDrawer,
        setActiveLeadForDrawer,
        isNewLeadModalOpen,
        setIsNewLeadModalOpen,
        isSmartIntakeModalOpen,
        setIsSmartIntakeModalOpen,
        isFollowUpModalOpen,
        setIsFollowUpModalOpen,
        isQuickReplyModalOpen,
        setIsQuickReplyModalOpen,
        activeFollowUpForModal,
        setActiveFollowUpForModal,
        leadFilterStatus,
        setLeadFilterStatus,
        followUpFilterTab,
        setFollowUpFilterTab,
        leadToEdit,
        setLeadToEdit,
        leadToDelete,
        setLeadToDelete,
        openCreateLeadModal,
        openEditLeadModal,
        confirmDeleteLead,
        openLeadsWithFilter,
        openFollowUpsWithTab,
        toast,
        showToast,
        addLead,
        updateLead,
        deleteLead,
        moveLeadStatus,
        qualifyLeadWithAI,
        openReplyGeneratorForLead,
        addFollowUp,
        toggleFollowUpComplete,
        rescheduleFollowUp,
        cancelFollowUp,
        deleteFollowUp,
        addTemplate,
        deleteTemplate,
        updateSettings,
        markNotificationRead,
        clearNotifications,
        resetToDemoData,
        clearAllLeads,
        exportDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
