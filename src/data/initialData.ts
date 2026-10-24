import { Lead, FollowUp, SavedTemplate, BusinessSettings } from '../types';

export const initialBusinessSettings: BusinessSettings = {
  businessName: 'Apex Growth Studio',
  ownerName: 'Sarah Jenkins',
  email: 'sarah@apexgrowth.io',
  phone: '+1 (555) 234-5678',
  industry: 'Digital Marketing & Web Agency',
  bookingUrl: 'https://cal.com/apex-growth/discovery-15m',
  targetClientele: 'Local service businesses, e-commerce brands, and professional services',
  defaultTone: 'Warm & Consultative',
  services: [
    'Custom Website Redesign',
    'Local SEO & Google Ads',
    'Lead Funnel Optimization',
    'Monthly Growth Retainer',
    'Brand Identity & Content'
  ],
  currency: 'USD',
  slaHours: 2,
};

export const initialLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Marcus Vance',
    email: 'marcus@vanceplumbing.com',
    phone: '+1 (555) 849-2311',
    company: 'Vance Plumbing & HVAC',
    source: 'Website Form',
    status: 'New Enquiry',
    dealValue: 3800,
    service: 'Custom Website Redesign',
    urgency: 'High',
    score: 88,
    scoreTier: 'Hot',
    notes: 'Looking to replace their 7-year-old WordPress site before spring season. Want mobile emergency booking button and local SEO ranking boost.',
    inquiry: 'Hi Sarah, our current site is super slow and doesn’t get us emergency service calls. We want a modern redesign with online booking ready in 4 weeks. What is your turnaround and pricing?',
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 mins ago
    lastContactDate: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    tags: ['Hot Lead', 'Urgent 4-Week Deadline', 'Commercial & Residential'],
    aiAnalysis: {
      score: 88,
      tier: 'Hot',
      intentSummary: 'High buying intent with immediate cash flow need and clear 4-week timeline before seasonal peak.',
      buyingSignals: [
        'Explicit 4-week deadline before busy season',
        'Specific feature requests (online booking, mobile speed)',
        'Decision maker reached out directly'
      ],
      potentialRisks: ['Tight deadline requires clear scope sign-off on Day 1'],
      recommendedAction: 'Call immediately and send customized proposal with fast-track delivery guarantee.',
      suggestedBudgetGuidance: '$3,500 - $4,800'
    },
    timeline: [
      {
        id: 't-1',
        type: 'note',
        title: 'Inbound Web Form Received',
        content: 'Customer submitted form on /quote page requesting fast turnaround.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-2',
    name: 'Elena Rostova',
    email: 'elena@novabotanica.co',
    phone: '+1 (555) 492-7710',
    company: 'Nova Botanica Skincare',
    source: 'Instagram DM',
    status: 'Contacted',
    dealValue: 5200,
    service: 'Lead Funnel Optimization',
    urgency: 'Medium',
    score: 76,
    scoreTier: 'Warm',
    notes: 'Organic skincare DTC brand. Generating traffic from TikTok/IG but Shopify conversion rate is only 1.2%.',
    inquiry: 'Saw your case study on Instagram! We are spending $4k/mo on ads but our checkout dropoff is brutal. Can you audit our funnel?',
    createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    tags: ['E-Commerce', 'Shopify', 'High Ad Spend'],
    aiAnalysis: {
      score: 76,
      tier: 'Warm',
      intentSummary: 'Strong pain point around wasted ad spend. Motivated by immediate ROI if conversion rate lifts by even 0.8%.',
      buyingSignals: ['Already spending $4k/month on paid ads', 'Explicit pain point with checkout drop-off'],
      potentialRisks: ['Needs to see ecommerce proof of concept'],
      recommendedAction: 'Offer a complimentary 5-minute video teardown of their mobile product page to build undeniable trust.',
      suggestedBudgetGuidance: '$4,500 - $6,500'
    },
    timeline: [
      {
        id: 't-2a',
        type: 'email',
        title: 'First Reply Sent',
        content: 'Sent initial response with discovery scheduling link.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-3',
    name: 'David Chen',
    email: 'dchen@chenlawoffice.com',
    phone: '+1 (555) 312-9904',
    company: 'Chen & Partners Legal',
    source: 'Google Local',
    status: 'Meeting Scheduled',
    dealValue: 7500,
    service: 'Local SEO & Google Ads',
    urgency: 'High',
    score: 92,
    scoreTier: 'Hot',
    notes: 'Personal injury & estate planning firm looking to dominate local 3-pack search in metropolitan area.',
    inquiry: 'We need to scale our qualified client inquiries. Current agency delivered zero reports. Discovery call booked for tomorrow 2 PM.',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    tags: ['Legal Sector', 'High LTV', 'Frustrated with Prior Agency'],
    aiAnalysis: {
      score: 92,
      tier: 'Hot',
      intentSummary: 'High-value enterprise lead actively switching from an underperforming agency. Exceptional budget capacity.',
      buyingSignals: ['Scheduled discovery call quickly', 'Substantial retainer budget', 'Legal case values are high'],
      potentialRisks: ['Expects strict transparent reporting and KPI tracking'],
      recommendedAction: 'Prepare competitor audit presentation showing local search gap before tomorrow 2 PM call.',
      suggestedBudgetGuidance: '$2,500/mo retainer ($7,500 initial 3-month)'
    },
    timeline: [
      {
        id: 't-3a',
        type: 'meeting',
        title: 'Discovery Meeting Scheduled',
        content: 'Confirmed video call for tomorrow at 2:00 PM EST via Cal.com.',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-4',
    name: 'Chloe Tremblay',
    email: 'chloe@montrealcafe.ca',
    phone: '+1 (555) 761-4421',
    company: 'Atelier Café & Bakery',
    source: 'Referral',
    status: 'Proposal Sent',
    dealValue: 4200,
    service: 'Brand Identity & Content',
    urgency: 'Medium',
    score: 82,
    scoreTier: 'Hot',
    notes: 'Opening 2nd location. Referred by Sophie at Bloom Studio. Sent comprehensive branding & menu design proposal 3 days ago.',
    inquiry: 'Sophie told me you worked wonders on their rebrand. We need branding, signage, and launch photography package for our new downtown spot.',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    tags: ['Referred Client', 'Hospitality', 'Expansion'],
    aiAnalysis: {
      score: 82,
      tier: 'Hot',
      intentSummary: 'Warm referral with pre-established trust. Proposal sent 3 days ago requires proactive follow-up today.',
      buyingSignals: ['Trusted word-of-mouth referral', 'Physical lease signed for new location'],
      potentialRisks: ['3 days without response after proposal delivery'],
      recommendedAction: 'Send gentle value check-in asking if the board had questions regarding the tiered milestone options.',
      suggestedBudgetGuidance: '$4,000 - $4,800'
    },
    timeline: [
      {
        id: 't-4a',
        type: 'status_change',
        title: 'Proposal Delivered',
        content: 'Sent interactive proposal deck with 3 package tiers.',
        timestamp: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-5',
    name: 'Julian Sterling',
    email: 'jsterling@aerofitgyms.com',
    phone: '+1 (555) 902-1823',
    company: 'AeroFit Performance Club',
    source: 'LinkedIn',
    status: 'Won',
    dealValue: 6000,
    service: 'Monthly Growth Retainer',
    urgency: 'High',
    score: 95,
    scoreTier: 'Hot',
    notes: 'Signed 6-month contract for full-funnel lead generation and weekly ad creative testing. First invoice paid.',
    inquiry: 'We need 80 new trial members per month across our two luxury gym locations.',
    createdAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    tags: ['Closed Won', 'Fitness/Wellness', 'Retainer'],
    timeline: [
      {
        id: 't-5a',
        type: 'status_change',
        title: 'Contract Signed & Paid',
        content: 'Deposit received. Onboarding kickoff scheduled.',
        timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-6',
    name: 'Tanya Morales',
    email: 'tanya@artisanclay.studio',
    phone: '+1 (555) 674-3209',
    company: 'Artisan Clay Ceramics',
    source: 'Instagram DM',
    status: 'Lost',
    dealValue: 1800,
    service: 'Custom Website Redesign',
    urgency: 'Low',
    score: 38,
    scoreTier: 'Cool',
    notes: 'Solo ceramicist. Budget was under $500. Advised her to start on Squarespace or Shopify starter template for now.',
    inquiry: 'Can you build an online shop for my pottery? My total budget is $400.',
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
    tags: ['Budget Mismatch', 'Solo Creator'],
    timeline: [
      {
        id: 't-6a',
        type: 'note',
        title: 'Polite Referral to DIY Tools',
        content: 'Explained agency minimums and provided link to free Shopify starter templates.',
        timestamp: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-7',
    name: 'Brian Gallagher',
    email: 'bgallagher@apexrealty.org',
    phone: '+1 (555) 554-1290',
    company: 'Gallagher Commercial Realty',
    source: 'Cold Outreach',
    status: 'Contacted',
    dealValue: 4500,
    service: 'Lead Funnel Optimization',
    urgency: 'Medium',
    score: 68,
    scoreTier: 'Warm',
    notes: 'Commercial broker seeking automated listing lead capture system and instant WhatsApp notifications for agents.',
    inquiry: 'Received your cold email. Interested in how your automated lead capture connects to Salesforce. Are you open for a call?',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    tags: ['Real Estate', 'CRM Integration'],
    timeline: [
      {
        id: 't-7a',
        type: 'email',
        title: 'Sent Availability',
        content: 'Replied with calendar link and overview of Salesforce webhook connectors.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      }
    ]
  },
  {
    id: 'lead-8',
    name: 'Siddharth Rao',
    email: 'sid@zenithfintech.io',
    phone: '+1 (555) 882-9011',
    company: 'Zenith FinTech',
    source: 'Website Form',
    status: 'New Enquiry',
    dealValue: 9200,
    service: 'Custom Website Redesign',
    urgency: 'High',
    score: 91,
    scoreTier: 'Hot',
    notes: 'Series-A backed B2B SaaS startup preparing for public product launch. Needs high-converting landing pages with interactive ROI calculator.',
    inquiry: 'We are relaunching our product in 6 weeks and need a world-class marketing website built on React/Next.js. Need high fidelity Figma design to code.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    lastContactDate: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    tags: ['SaaS', 'High Budget', 'Tech Startup', 'Series A'],
    aiAnalysis: {
      score: 91,
      tier: 'Hot',
      intentSummary: 'Venture-backed startup with ample budget and hard launch deadline. High probability of closing if technical competence is demonstrated.',
      buyingSignals: ['Funded startup', 'Clear technical requirements', 'Immediate project kickoff ready'],
      potentialRisks: ['Demanding QA standards and tight sprint schedule'],
      recommendedAction: 'Send immediate high-touch reply citing similar modern SaaS portfolio work with immediate calendar invite.',
      suggestedBudgetGuidance: '$8,500 - $12,000'
    },
    timeline: [
      {
        id: 't-8a',
        type: 'note',
        title: 'New Enterprise Form Submission',
        content: 'Detected Series-A company profile.',
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      }
    ]
  }
];

export const initialFollowUps: FollowUp[] = [
  {
    id: 'fu-1',
    leadId: 'lead-4',
    leadName: 'Chloe Tremblay',
    leadCompany: 'Atelier Café & Bakery',
    title: 'Follow-up on Branding Proposal (Day 3 Check-in)',
    channel: 'email',
    dueDate: new Date().toISOString().split('T')[0], // TODAY
    dueTime: '11:00 AM',
    status: 'pending',
    priority: 'high',
    suggestedMessage: 'Hi Chloe, hope you are having a wonderful week! Just wanted to see if you had a chance to review the proposal for Atelier Café’s new location, or if you needed any adjustments on the package tiers.',
    notes: 'Referred by Sophie. Keep tone friendly and consultative.'
  },
  {
    id: 'fu-2',
    leadId: 'lead-1',
    leadName: 'Marcus Vance',
    leadCompany: 'Vance Plumbing & HVAC',
    title: 'Urgent 1st Contact: Call & Send Booking Link',
    channel: 'phone',
    dueDate: new Date().toISOString().split('T')[0], // TODAY
    dueTime: '02:30 PM',
    status: 'pending',
    priority: 'high',
    suggestedMessage: 'Hi Marcus, calling regarding your urgent 4-week website redesign enquiry! Left quick voicemail and texted calendar link.',
    notes: 'Needs site live in 4 weeks before busy spring season.'
  },
  {
    id: 'fu-3',
    leadId: 'lead-2',
    leadName: 'Elena Rostova',
    leadCompany: 'Nova Botanica Skincare',
    title: 'Send 5-Minute Checkout Teardown Video',
    channel: 'whatsapp',
    dueDate: new Date().toISOString().split('T')[0], // TODAY
    dueTime: '04:00 PM',
    status: 'pending',
    priority: 'medium',
    suggestedMessage: 'Hi Elena! Recorded a quick 3-minute video breakdown of 2 simple tweaks on your product page that could immediately reduce mobile cart abandonment. Mind if I send the Loom link over?',
    notes: 'Video touches convert 3x higher on e-comm owners.'
  },
  {
    id: 'fu-4',
    leadId: 'lead-7',
    leadName: 'Brian Gallagher',
    leadCompany: 'Gallagher Commercial Realty',
    title: 'Re-engage Brian with Salesforce Case Study',
    channel: 'email',
    dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split('T')[0], // TOMORROW
    dueTime: '10:00 AM',
    status: 'pending',
    priority: 'medium',
    suggestedMessage: 'Hi Brian, wanted to send over a one-page summary of how we automated lead routing into CRM for another commercial real estate group last month.',
    notes: 'Interested in automation and webhook connectors.'
  },
  {
    id: 'fu-5',
    leadId: 'lead-3',
    leadName: 'David Chen',
    leadCompany: 'Chen & Partners Legal',
    title: 'Post-Meeting Recap & Custom Proposal Delivery',
    channel: 'email',
    dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split('T')[0],
    dueTime: '03:00 PM',
    status: 'pending',
    priority: 'high',
    suggestedMessage: 'Hi David, great speaking today. As discussed, attached is our 90-day Local SEO roadmap tailored specifically to your metropolitan practice areas.',
    notes: 'Send immediately following discovery call.'
  }
];

export const initialSavedTemplates: SavedTemplate[] = [
  {
    id: 'tpl-1',
    title: 'Instant Inbound Acknowledgment & 1-Click Booking',
    tone: 'Warm & Consultative',
    goal: 'Book a discovery call',
    channel: 'email',
    subject: 'Quick thoughts on your project - Apex Growth Studio',
    content: `Hi {{name}},\n\nThanks so much for reaching out! I reviewed your note regarding {{service}} for {{company}}.\n\nWe specialize in helping businesses like yours get fast, measurable results. I’d love to learn more about your goals and see if we're the right fit.\n\nAre you free for a brief 15-minute introductory call? You can pick a convenient time directly on my calendar here:\n{{bookingUrl}}\n\nLooking forward to speaking with you!\n\nBest regards,\n{{ownerName}}\n{{businessName}}`,
    tags: ['First Touch', 'High Conversion', 'Scheduling']
  },
  {
    id: 'tpl-2',
    title: 'Proposal Follow-up (Day 3 Polite Check-in)',
    tone: 'Value-Led',
    goal: 'Answer FAQs & close deal',
    channel: 'email',
    subject: 'Checking in on the proposal for {{company}}',
    content: `Hi {{name}},\n\nI hope your week is off to a great start!\n\nI wanted to check in to make sure you received our proposal for {{service}} and see if any questions came up for you or your team.\n\nIf you'd like to make any adjustments to scope or timeline milestones, I'm very happy to fine-tune it.\n\nWould a 5-minute call tomorrow afternoon work to touch base?\n\nWarmly,\n{{ownerName}}`,
    tags: ['Proposal', 'Follow-up', 'Consultative']
  },
  {
    id: 'tpl-3',
    title: 'Polite "Permission to Close File" (The 9-Word Magic Email)',
    tone: 'Direct & Assertive',
    goal: 'Re-engage cold lead',
    channel: 'email',
    subject: 'Closing out your inquiry regarding {{service}}',
    content: `Hi {{name}},\n\nI haven't heard back, so I assume your priorities have shifted or you've decided to put {{service}} on hold for now—which is completely fine!\n\nShould I close out your inquiry file for now, or is this still on your roadmap for next month?\n\nBest,\n{{ownerName}}`,
    tags: ['Breakup Email', 'High Response Rate', 'Cold Re-engagement']
  },
  {
    id: 'tpl-4',
    title: 'WhatsApp / SMS Casual Ping',
    tone: 'Friendly Casual',
    goal: 'Book a discovery call',
    channel: 'whatsapp',
    subject: 'Quick ping',
    content: `Hi {{name}}! {{ownerName}} from {{businessName}} here. Hope your day is going well! Just pinging you quickly to see if you had 10 mins to chat about {{service}} this week? You can pick a slot here: {{bookingUrl}}`,
    tags: ['Mobile', 'SMS', 'WhatsApp']
  }
];
