export type LeadStatus =
  | 'New'
  | 'New Enquiry'
  | 'Contacted'
  | 'Interested'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Won'
  | 'Lost';

export type LeadUrgency = 'High' | 'Medium' | 'Low';
export type LeadPriority = LeadUrgency;

export type LeadSource =
  | 'Website Form'
  | 'Google Local'
  | 'Instagram DM'
  | 'Referral'
  | 'LinkedIn'
  | 'Cold Outreach'
  | 'WhatsApp'
  | 'Phone Call'
  | 'Other';

export interface TimelineEvent {
  id: string;
  type: 'note' | 'email' | 'call' | 'status_change' | 'meeting' | 'ai_reply';
  title: string;
  content: string;
  timestamp: string;
}

export interface AIAnalysis {
  score: number;
  tier: 'Hot' | 'Warm' | 'Cool';
  intentSummary: string;
  buyingSignals: string[];
  potentialRisks: string[];
  recommendedAction: string;
  suggestedBudgetGuidance?: string;
  evaluatedAt?: string;
}

export interface Lead {
  id: string;
  name: string; // Full name or business name
  email?: string;
  phone?: string;
  company?: string; // Business name
  source: LeadSource;
  status: LeadStatus;
  dealValue: number;
  service: string; // Interest or service requested
  urgency: LeadUrgency; // Priority: Low, Medium, High
  priority?: LeadUrgency;
  score: number;
  scoreTier: 'Hot' | 'Warm' | 'Cool';
  notes: string;
  inquiry?: string;
  createdAt: string; // Date created
  updatedAt?: string; // Date last updated
  lastContactDate: string;
  nextFollowUpDate?: string; // Next follow-up date, optional
  tags: string[];
  aiAnalysis?: AIAnalysis;
  timeline: TimelineEvent[];
}

export type FollowUpStatus = 'pending' | 'completed' | 'cancelled' | 'overdue';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName: string;
  leadCompany: string;
  title: string;
  channel: 'email' | 'phone' | 'whatsapp' | 'meeting';
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  status: FollowUpStatus;
  priority: 'high' | 'medium' | 'low';
  suggestedMessage?: string;
  notes?: string;
  completedAt?: string;
}

export interface SavedTemplate {
  id: string;
  title: string;
  tone: string;
  goal: string;
  channel: string;
  subject: string;
  content: string;
  tags: string[];
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  industry: string;
  bookingUrl: string;
  targetClientele: string;
  defaultTone: string;
  services: string[];
  currency: string;
  slaHours: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'lead' | 'followup' | 'ai' | 'deal';
  read: boolean;
  timestamp: string;
}

export interface AIReplyResult {
  subject: string;
  emailBody: string;
  shortSnippet: string;
  nextActionAdvice: string;
  keyTalkingPoints?: string[];
}

export type ReplyObjective =
  | 'answer_question'
  | 'follow_up'
  | 'handle_objection'
  | 'share_quotation'
  | 're_engage';

export type ReplyTone = 'friendly' | 'professional' | 'concise' | 'persuasive';

export interface DraftReply {
  id: 'friendly' | 'professional' | 'persuasive';
  tone: string;
  label: string;
  description: string;
  subject: string;
  body: string;
  recommendedNextStep: string;
}

export interface MultiDraftReplyResponse {
  isLiveAI: boolean;
  model: string;
  drafts: DraftReply[];
  tacticalAdvice?: string;
  missingFactsNoticed?: string[];
}

export interface PerformanceAudit {
  healthScore: number;
  summary: string;
  strengths: string[];
  recommendations: Array<{
    title: string;
    impact: 'High' | 'Medium' | 'Low';
    description: string;
  }>;
}
