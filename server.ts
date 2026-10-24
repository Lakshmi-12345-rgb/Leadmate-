import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to safely parse JSON from AI response
function extractJsonFromText(text: string) {
  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fallback below
      }
    }
    return null;
  }
}

// 1. Generate Smart Reply
app.post('/api/ai/generate-reply', async (req, res) => {
  try {
    const {
      leadName = 'Potential Client',
      leadEmail = '',
      company = '',
      inquiry = '',
      service = 'Services',
      budget = '',
      tone = 'Warm & Consultative',
      goal = 'Book a discovery call',
      channel = 'email',
      customInstructions = '',
      businessName = 'Our Agency',
      ownerName = 'Alex',
      bookingUrl = 'https://cal.com/booking',
    } = req.body;

    let responseData = null;

    if (aiClient) {
      const prompt = `You are an elite sales consultant & copywriting assistant for small businesses and agencies.
Generate a high-converting, personalized sales reply.

Context:
- Business: ${businessName} (Sender: ${ownerName}, Booking Link: ${bookingUrl})
- Lead Name: ${leadName}
- Lead Company: ${company || 'N/A'}
- Service Interested In: ${service}
- Estimated Budget: ${budget || 'Not specified'}
- Original Inquiry / Message from lead: "${inquiry || 'I would like more information on your services and pricing.'}"
- Tone: ${tone}
- Primary Goal of this message: ${goal}
- Communication Channel: ${channel}
- Custom Instructions: ${customInstructions || 'None'}

Return ONLY valid JSON matching this structure:
{
  "subject": "Compelling, non-spammy subject line with lead name or company",
  "emailBody": "Full email message body formatted cleanly with line breaks, warm greeting, addressing their specific need, showing expertise, and clear call to action.",
  "shortSnippet": "Short 2-3 sentence version suitable for WhatsApp, SMS, or LinkedIn DM.",
  "nextActionAdvice": "Specific tactical advice for the business owner on what to do next to close this deal.",
  "keyTalkingPoints": ["Point 1 tailored to their inquiry", "Point 2 to build trust", "Point 3 addressing urgency or ROI"]
}`;

      try {
        const aiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          responseData = extractJsonFromText(aiResponse.text);
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call warning, falling back to smart dynamic generator:', geminiError?.message || geminiError);
      }
    }

    // Dynamic smart fallback if API key is not present or rate limited
    if (!responseData) {
      const isCallGoal = goal.toLowerCase().includes('call') || goal.toLowerCase().includes('discovery');
      const isPricingGoal = goal.toLowerCase().includes('quote') || goal.toLowerCase().includes('pricing');
      
      const cta = isCallGoal
        ? `Are you free for a brief 15-minute introductory call this week? You can pick a convenient time directly on my calendar here: ${bookingUrl}`
        : isPricingGoal
        ? `I have put together an outline of our ${service} options tailored to your project. Would tomorrow afternoon or Thursday morning work best for a quick 10-minute walkthrough?`
        : `Let me know if this aligns with your expectations, and we can take the next steps right away.`;

      responseData = {
        subject: `Quick thoughts on ${service} for ${leadName} - ${businessName}`,
        emailBody: `Hi ${leadName},\n\nThanks so much for reaching out regarding ${service}. I reviewed your inquiry regarding "${inquiry.slice(0, 80) || 'your project'}" and would love to help you achieve your goals.\n\nAt ${businessName}, we specialize in helping businesses like yours get fast, predictable results without unnecessary complexity.\n\n${cta}\n\nLooking forward to speaking with you!\n\nBest regards,\n${ownerName}\n${businessName}`,
        shortSnippet: `Hi ${leadName}! Thanks for your inquiry about ${service}. I'd love to share how we can help. Grab a quick 15-min chat here: ${bookingUrl} - ${ownerName}`,
        nextActionAdvice: `Send this reply within 2 hours of enquiry. If no response by Day 2, send a quick text message or WhatsApp follow-up.`,
        keyTalkingPoints: [
          `Highlight experience specifically in ${service}`,
          `Reference their specific challenge to show active listening`,
          `Remove friction with a direct 1-click scheduling link`
        ]
      };
    }

    return res.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('Error generating reply:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate reply' });
  }
});

// Multi-Draft AI Reply Generator (3 distinct styles: Friendly, Professional, Persuasive)
app.post('/api/ai/generate-replies', async (req, res) => {
  try {
    const {
      customerMessage = '',
      businessType = 'Small Business',
      service = 'General Services',
      objective = 'answer_question',
      tone = 'professional',
      factualDetails = '',
      leadName = 'Customer',
      company = '',
      businessName = 'Our Company',
      ownerName = 'Alex',
      bookingUrl = '',
    } = req.body;

    const objectiveLabels: Record<string, string> = {
      answer_question: 'Answer a question directly and clearly',
      follow_up: 'Follow up on a prior conversation or quote',
      handle_objection: 'Address a hesitation, price question, or scope concern respectfully',
      share_quotation: 'Share or explain pricing, package tiers, and estimate details',
      re_engage: 'Re-engage a cold or quiet lead without being annoying',
    };

    const targetObjective = objectiveLabels[objective] || objective;

    let responseData: any = null;
    let isLiveAI = false;

    if (aiClient && customerMessage) {
      const prompt = `You are an expert sales communication and customer success copywriter for small businesses and agencies.
A customer has sent an enquiry. You must generate THREE distinct draft email replies with different communication styles:
1. Friendly and conversational (warm, engaging, human, authentic)
2. Professional and concise (direct, executive, crisp, respects reader's time)
3. Persuasive but respectful (compelling value proposition, addresses concerns, confident ROI focus, zero pressure)

Context:
- Customer Name: ${leadName || 'Customer'}
- Customer Company: ${company || 'N/A'}
- Customer Original Message: "${customerMessage}"
- Business Type: ${businessType}
- Product or Service Offered: ${service}
- Reply Objective: ${targetObjective}
- User's Preferred Primary Tone: ${tone}
- Verified Factual Details to Include: ${factualDetails ? `"${factualDetails}"` : 'None provided'}
- Sender Business: ${businessName}
- Sender Name: ${ownerName}
- Booking Link (optional): ${bookingUrl || 'N/A'}

STRICT ANTI-HALLUCINATION & ETHICAL RULES:
1. NEVER invent unstated prices, discounts, delivery dates, turnaround commitments, product availability, or company policies unless explicitly stated in "Verified Factual Details".
2. If the response requires prices, dates, or timelines that were NOT provided, you MUST use clearly marked placeholders like [Insert Price], [Insert Timeline], [Insert Available Date].
3. Strictly avoid false urgency (e.g. "only 1 spot left today!"), deceptive claims, aggressive guilt-trips, or spam-like phrasing. Keep communication helpful, consultative, and respectful.
4. Each draft must feel complete and ready to send after reviewing placeholders.

Return ONLY valid JSON matching this exact structure:
{
  "drafts": [
    {
      "id": "friendly",
      "tone": "Friendly and conversational",
      "label": "Friendly & Conversational",
      "description": "Warm and approachable tone focused on connection",
      "subject": "Clear, appealing subject line",
      "body": "Full message with greeting, body paragraphs, call to action, and sign-off",
      "recommendedNextStep": "Brief tip on follow-up timing or delivery"
    },
    {
      "id": "professional",
      "tone": "Professional and concise",
      "label": "Professional & Concise",
      "description": "Direct, executive tone respecting their time",
      "subject": "Clear, professional subject line",
      "body": "Full message with greeting, concise body, clear bullet points if helpful, call to action, and sign-off",
      "recommendedNextStep": "Brief tip on follow-up timing"
    },
    {
      "id": "persuasive",
      "tone": "Persuasive but respectful",
      "label": "Persuasive & Respectful",
      "description": "Strong value proposition and confidence with zero pressure",
      "subject": "Value-oriented subject line",
      "body": "Full message emphasizing outcomes, solving their problem, addressing friction, call to action, and sign-off",
      "recommendedNextStep": "Brief tip on follow-up timing"
    }
  ],
  "tacticalAdvice": "Specific strategic insight on closing or guiding this customer.",
  "missingFactsNoticed": ["Any missing info like exact budget, timeline, or scope specifications"]
}`;

      try {
        const aiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = extractJsonFromText(aiResponse.text);
          if (parsed && Array.isArray(parsed.drafts) && parsed.drafts.length === 3) {
            responseData = parsed;
            isLiveAI = true;
          }
        }
      } catch (geminiError: any) {
        console.warn('Gemini generate-replies warning, using calibrated demo fallback:', geminiError?.message || geminiError);
      }
    }

    // Dynamic calibrated fallback if API key is not configured or offline
    if (!responseData) {
      const factsText = factualDetails ? `\n\nTo share a few specific details: ${factualDetails}` : '';
      const ctaLink = bookingUrl ? ` Feel free to pick a convenient 15-minute slot on my calendar here: ${bookingUrl}` : '';

      responseData = {
        drafts: [
          {
            id: 'friendly',
            tone: 'Friendly and conversational',
            label: 'Friendly & Conversational',
            description: 'Warm and approachable tone focused on personal connection',
            subject: `Hi ${leadName} - quick note regarding ${service}`,
            body: `Hi ${leadName},\n\nThanks so much for reaching out! It was great to hear from you regarding ${service}.\n\nI took a look at your note ("${customerMessage.slice(0, 100)}${customerMessage.length > 100 ? '...' : ''}"). We would love to help you with this.${factsText}\n\nWould you be open to a quick, casual chat sometime this week to walk through your thoughts?${ctaLink}\n\nLooking forward to connecting!\n\nWarmly,\n${ownerName}\n${businessName}`,
            recommendedNextStep: 'Send within 2 hours of inquiry. If no response after 48 hours, send a gentle 1-sentence check-in.',
          },
          {
            id: 'professional',
            tone: 'Professional and concise',
            label: 'Professional & Concise',
            description: 'Direct, polished tone respecting the recipient’s busy schedule',
            subject: `${service} Enquiry - ${businessName}`,
            body: `Hello ${leadName},\n\nThank you for contacting ${businessName} regarding ${service}.\n\nIn response to your inquiry regarding ${customerMessage.slice(0, 80) || service}:${factsText || '\n• Scope & deliverables: [Insert Deliverables]\n• Estimated turnaround: [Insert Turnaround]\n• Pricing: [Insert Price]'}\n\nPlease let me know if you would like to proceed or if you have any questions.${ctaLink}\n\nBest regards,\n${ownerName}\n${businessName}`,
            recommendedNextStep: 'Ideal for busy founders and executives who prefer straightforward bullet points.',
          },
          {
            id: 'persuasive',
            tone: 'Persuasive but respectful',
            label: 'Persuasive & Respectful',
            description: 'Compelling value proposition focused on client outcome with zero pressure',
            subject: `Achieving your goals with ${service} - ${leadName}`,
            body: `Hi ${leadName},\n\nI really appreciate you getting in touch. Addressing "${customerMessage.slice(0, 90)}${customerMessage.length > 90 ? '...' : ''}" is exactly where we deliver the highest impact for our clients at ${businessName}.\n\nRather than a generic solution, our approach to ${service} is designed to give you predictable results without unnecessary back-and-forth.${factsText}\n\nThere is no obligation at all, but I would be glad to share how other clients have tackled similar challenges and see if this is the right fit for you.${ctaLink}\n\nDoes [Insert Day of Week] afternoon work for a brief 15-minute call?\n\nSincerely,\n${ownerName}\n${businessName}`,
            recommendedNextStep: 'Best when the lead is comparing multiple vendors or needs clear differentiation.',
          },
        ],
        tacticalAdvice: 'Respond promptly while their inquiry is fresh. If you do not have an exact price yet, schedule a 15-minute discovery call to scope requirements before quoting.',
        missingFactsNoticed: factualDetails ? [] : ['Exact budget or pricing package', 'Target project start or completion date', 'Specific technical or deliverable constraints'],
      };
    }

    return res.json({
      success: true,
      isLiveAI,
      model: isLiveAI ? 'gemini-3.8-flash' : 'Demo Mode (Simulated Response)',
      data: responseData,
    });
  } catch (error: any) {
    console.error('Error generating multi-draft replies:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate replies' });
  }
});

// 2. Score & Qualify Lead
app.post('/api/ai/score-lead', async (req, res) => {
  try {
    const { lead, businessContext = {} } = req.body;
    let responseData = null;

    if (aiClient && lead) {
      const prompt = `You are a sales qualification specialist for small businesses and consultants.
Analyze this inbound lead and calculate an AI Lead Score from 1 to 100, classify priority tier (Hot, Warm, or Cool), and give actionable sales advice.

Lead Data:
- Name: ${lead.name}
- Company: ${lead.company || 'N/A'}
- Service Requested: ${lead.service || 'General inquiry'}
- Budget: ${lead.dealValue ? `$${lead.dealValue}` : 'Not provided'}
- Source: ${lead.source || 'Website'}
- Urgency: ${lead.urgency || 'Medium'}
- Message / Notes: "${lead.notes || lead.inquiry || 'Inquired about services'}"

Business Context:
- Business: ${businessContext.name || 'Small Service Business'}
- Target Services: ${businessContext.services || 'Design, Marketing, Development, Consulting'}

Return ONLY valid JSON matching this schema:
{
  "score": 85,
  "tier": "Hot",
  "intentSummary": "Brief 1-2 sentence assessment of their buying readiness and genuine intent.",
  "buyingSignals": ["Signal 1", "Signal 2"],
  "potentialRisks": ["Risk or missing qualification point"],
  "recommendedAction": "Immediate specific next step the salesperson should take.",
  "suggestedBudgetGuidance": "Estimated realistic project budget range or pricing tip"
}`;

      try {
        const aiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          responseData = extractJsonFromText(aiResponse.text);
        }
      } catch (err: any) {
        console.warn('Gemini qualification warning:', err?.message || err);
      }
    }

    if (!responseData) {
      // Deterministic scoring fallback
      let calculatedScore = 65;
      const notes = (lead?.notes || '').toLowerCase();
      const value = Number(lead?.dealValue) || 0;
      
      if (lead?.urgency === 'High') calculatedScore += 15;
      if (value > 2500) calculatedScore += 10;
      if (notes.includes('ready') || notes.includes('asap') || notes.includes('budget') || notes.includes('hire')) calculatedScore += 10;
      if (!lead?.email && !lead?.phone) calculatedScore -= 20;

      calculatedScore = Math.min(98, Math.max(25, calculatedScore));
      const tier = calculatedScore >= 80 ? 'Hot' : calculatedScore >= 55 ? 'Warm' : 'Cool';

      responseData = {
        score: calculatedScore,
        tier,
        intentSummary: `${lead?.name || 'Lead'} exhibits ${tier.toLowerCase()} purchasing readiness with clear focus on ${lead?.service || 'services'}.`,
        buyingSignals: [
          `Explicit requirement for ${lead?.service || 'service'}`,
          lead?.dealValue ? `Specified budget of $${lead.dealValue}` : `Expressed active project need`,
          lead?.urgency === 'High' ? `High timeline urgency stated` : `Direct inbound enquiry channel`
        ],
        potentialRisks: [
          `Need to confirm exact decision maker authorization`,
          `Verify required completion deadline on discovery call`
        ],
        recommendedAction: `Schedule a 15-minute qualification call within 24 hours to secure timeline and deliver customized proposal.`,
        suggestedBudgetGuidance: value > 0 ? `$${value} - $${Math.round(value * 1.35)}` : `$1,500 - $3,500`
      };
    }

    return res.json({ success: true, data: responseData });
  } catch (error: any) {
    console.error('Error qualifying lead:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to qualify lead' });
  }
});

// 3. Smart Follow-Up Cadence Generator
app.post('/api/ai/suggest-followups', async (req, res) => {
  try {
    const { lead, businessContext = {} } = req.body;
    let sequence = null;

    if (aiClient && lead) {
      const prompt = `Create a high-converting 3-step follow-up cadence for this lead who has not replied yet.
Lead: ${lead.name} (${lead.company || 'Individual'}), interested in ${lead.service || 'services'}.
Status: ${lead.status || 'Contacted'}.
Owner: ${businessContext.ownerName || 'Alex'} from ${businessContext.name || 'LeadMate Agency'}.

Return ONLY valid JSON matching this schema:
{
  "sequence": [
    {
      "dayOffset": 2,
      "channel": "email",
      "title": "Gentle Value Touch",
      "suggestedMessage": "Subject: Quick question regarding your inquiry\\n\\nHi ${lead.name},\\n\\nJust checking in to make sure you received my previous message regarding ${lead.service}. I also wanted to share a quick idea...",
      "reasoning": "Keep momentum going without sounding desperate."
    },
    {
      "dayOffset": 4,
      "channel": "whatsapp",
      "title": "Quick Mobile Ping",
      "suggestedMessage": "Hi ${lead.name}, Alex here from ${businessContext.name || 'our team'}. Hope your week is going well! Just pinging you quickly to see if you had 5 mins to chat about ${lead.service}?",
      "reasoning": "High open-rate channel for busy decision makers."
    },
    {
      "dayOffset": 8,
      "channel": "email",
      "title": "Polite Close-the-Loop",
      "suggestedMessage": "Subject: Closing out your inquiry\\n\\nHi ${lead.name},\\n\\nI assume you are either swamped or went in another direction with ${lead.service}. Either way is completely fine! Should I keep your file active or close it out for now?",
      "reasoning": "Triggers fear of missing out and generates 30%+ response rate."
    }
  ]
}`;

      try {
        const aiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          const parsed = extractJsonFromText(aiResponse.text);
          if (parsed && Array.isArray(parsed.sequence)) {
            sequence = parsed.sequence;
          }
        }
      } catch (err: any) {
        console.warn('Gemini follow-up suggestion warning:', err?.message || err);
      }
    }

    if (!sequence) {
      sequence = [
        {
          dayOffset: 2,
          channel: 'email',
          title: 'Day 2 Value Check-in',
          suggestedMessage: `Subject: Quick follow up on ${lead?.service || 'your project'} for ${lead?.name || 'you'}\n\nHi ${lead?.name || 'there'},\n\nHope your week is off to a great start! Just wanted to make sure my previous note didn't get buried in your inbox.\n\nDid you have any questions on how we can help with ${lead?.service || 'your project'}? Let me know if you'd like a quick 10-minute rundown.\n\nBest,\n${businessContext.ownerName || 'Alex'}`,
          reasoning: 'Re-surfaces your email within 48 hours while the inquiry is still fresh.'
        },
        {
          dayOffset: 4,
          channel: 'whatsapp',
          title: 'Day 4 Friendly Mobile Ping',
          suggestedMessage: `Hi ${lead?.name || 'there'}! Alex from ${businessContext.name || 'LeadMate'} checking in quickly regarding ${lead?.service || 'your enquiry'}. Hope you're having a productive week! Did you still want to explore this?`,
          reasoning: 'SMS/WhatsApp messages have an average 98% open rate.'
        },
        {
          dayOffset: 8,
          channel: 'email',
          title: 'Day 8 Permission to Close File',
          suggestedMessage: `Subject: Should I close your file regarding ${lead?.service || 'project'}?\n\nHi ${lead?.name || 'there'},\n\nI haven't heard back, so I assume you're either super busy or timing isn't right just now—no worries at all!\n\nShould I take this off my active radar, or is this still on your roadmap for next month?\n\nBest regards,\n${businessContext.ownerName || 'Alex'}`,
          reasoning: 'The classic "breakup email" that relieves pressure and triggers immediate honest replies.'
        }
      ];
    }

    return res.json({ success: true, sequence });
  } catch (error: any) {
    console.error('Error suggesting followups:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to suggest followups' });
  }
});

// 4. Smart Intake / Raw Lead Extractor
app.post('/api/ai/extract-lead', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || !rawText.trim()) {
      return res.status(400).json({ success: false, error: 'rawText is required' });
    }

    let extractedData = null;

    if (aiClient) {
      const prompt = `You are an AI lead parsing assistant.
Extract structured sales lead information from this unstructured text (which might be an email, contact form dump, SMS, Instagram DM, or voicemail transcription).

Raw text:
"""
${rawText}
"""

Return ONLY valid JSON matching this schema:
{
  "name": "Full name or best guess (e.g. John Smith)",
  "email": "Email address if found, or empty string",
  "phone": "Phone number if found, or empty string",
  "company": "Company or Organization name if mentioned, or empty string",
  "service": "The core service they need (e.g. Website Redesign, SEO, Branding, Custom Software, Consultation)",
  "dealValue": 2500, // Estimated numeric dollar value if mentioned or reasonable estimate based on service, or 0
  "urgency": "High", // "High", "Medium", or "Low" based on tone and deadlines
  "source": "Website Form", // Website Form, Email, Referral, Instagram, LinkedIn, or Direct
  "notes": "Crisp 2-3 sentence summary of their specific problem, goals, and any timeline constraints mentioned."
}`;

      try {
        const aiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          extractedData = extractJsonFromText(aiResponse.text);
        }
      } catch (err: any) {
        console.warn('Gemini extraction warning:', err?.message || err);
      }
    }

    if (!extractedData) {
      // Regex & heuristic fallback
      const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
      const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
      const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);
      
      let candidateName = 'New Inquiry';
      if (lines.length > 0 && lines[0].length < 40 && !lines[0].includes('@')) {
        candidateName = lines[0].replace(/from:|hi|hello|name:/i, '').trim();
      }

      extractedData = {
        name: candidateName || 'New Prospect',
        email: emailMatch ? emailMatch[0] : '',
        phone: phoneMatch ? phoneMatch[0] : '',
        company: '',
        service: rawText.toLowerCase().includes('web') ? 'Website Design' : rawText.toLowerCase().includes('marketing') ? 'Digital Marketing' : 'Consulting Services',
        dealValue: 2000,
        urgency: rawText.toLowerCase().includes('urgent') || rawText.toLowerCase().includes('asap') ? 'High' : 'Medium',
        source: 'Website Form',
        notes: rawText.slice(0, 300)
      };
    }

    return res.json({ success: true, lead: extractedData });
  } catch (error: any) {
    console.error('Error extracting lead:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to extract lead' });
  }
});

// 5. Sales Performance Audit
app.post('/api/ai/audit-performance', async (req, res) => {
  try {
    const { stats, businessType = 'agency/freelancer' } = req.body;
    let audit = null;

    if (aiClient) {
      const prompt = `You are a growth consultant analyzing sales metrics for a small business (${businessType}).
Metrics:
- Total Leads: ${stats.totalLeads}
- Active Pipeline: ${stats.activeLeads}
- Won Deals: ${stats.wonLeads}
- Lost Deals: ${stats.lostLeads}
- Total Pipeline Value: $${stats.pipelineValue}
- Average Conversion Rate: ${stats.conversionRate}%

Provide 3 practical, high-impact strategies to increase their conversion rate this month.
Return ONLY valid JSON matching this schema:
{
  "healthScore": 88,
  "summary": "1-2 sentence executive assessment of their sales velocity.",
  "strengths": ["Key strength observed in their data"],
  "recommendations": [
    {
      "title": "Actionable tactic title",
      "impact": "High",
      "description": "Specific instruction on how to execute this right now."
    },
    {
      "title": "Actionable tactic title 2",
      "impact": "Medium",
      "description": "Specific instruction on how to execute this right now."
    },
    {
      "title": "Actionable tactic title 3",
      "impact": "High",
      "description": "Specific instruction on how to execute this right now."
    }
  ]
}`;

      try {
        const aiResponse = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse.text) {
          audit = extractJsonFromText(aiResponse.text);
        }
      } catch (err: any) {
        console.warn('Gemini audit warning:', err?.message || err);
      }
    }

    if (!audit) {
      audit = {
        healthScore: 82,
        summary: `Strong pipeline momentum with good conversion fundamentals. Key opportunity is reducing lead response time under 15 minutes.`,
        strengths: [`Healthy flow of incoming enquiries`, `Consistent qualification process`],
        recommendations: [
          {
            title: 'Implement Under-15-Minute First Touch',
            impact: 'High',
            description: 'Leads contacted within 15 minutes are 7x more likely to convert. Use the AI Reply Generator to respond immediately.'
          },
          {
            title: 'Add a 3-Touch Follow-Up Cadence',
            impact: 'High',
            description: 'Over 60% of closed sales happen on touches 2 through 4. Never let an enquiry drop after a single email.'
          },
          {
            title: 'Offer Instant Calendar Self-Scheduling',
            impact: 'Medium',
            description: 'Include your direct booking link in every first reply to eliminate back-and-forth scheduling friction.'
          }
        ]
      };
    }

    return res.json({ success: true, audit });
  } catch (error: any) {
    console.error('Error auditing performance:', error);
    return res.status(500).json({ success: false, error: error.message || 'Failed to generate audit' });
  }
});

// Mount Vite or serve static files
async function start() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LeadMate AI server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
