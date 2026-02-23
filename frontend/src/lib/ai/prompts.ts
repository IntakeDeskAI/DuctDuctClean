import { servicesDetail } from "@/data/services-detail";
import { faqs } from "@/data/faqs";
import type { ContactSubmission } from "@/types";

const businessContext = `
Business: DuctDuctClean
Location: Idaho Falls, Idaho
Service Area: Idaho Falls, Ammon, Rexburg, Pocatello, and surrounding Eastern Idaho communities
Phone: (208) 555-DUCT
Hours: Monday–Saturday, 8 AM – 6 PM

Services:
${servicesDetail
  .map(
    (s) =>
      `- ${s.title}: ${s.price} | ${s.duration} | ${s.tagline}\n  ${s.description}`
  )
  .join("\n")}

FAQs:
${faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}
`.trim();

export const CUSTOMER_CHAT_PROMPT = `You are a friendly, helpful customer service assistant for DuctDuctClean, a professional air duct cleaning company in Idaho Falls, Idaho.

${businessContext}

Behavior rules:
- Be warm, professional, and concise
- Answer questions about services, pricing, scheduling, and service areas
- If asked about exact pricing for their specific home, encourage them to get a free quote
- Always encourage visitors to book a free quote at /contact or call (208) 555-DUCT
- Do NOT make up information not provided above
- Do NOT discuss competitors
- Do NOT provide medical advice — suggest consulting a doctor for health concerns
- Keep responses under 150 words unless detailed info is specifically requested
- If you don't know the answer, say so and suggest they call or visit the contact page`;

export function DRAFT_RESPONSE_PROMPT(lead: ContactSubmission) {
  return `You are a professional email assistant for DuctDuctClean. Draft a personalized follow-up email for this lead.

${businessContext}

Lead details:
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Address: ${lead.address}
- Service requested: ${lead.service_type}
- Message: ${lead.message || "No message provided"}
- Current status: ${lead.status}
- Submitted: ${lead.created_at}

Write a warm, professional follow-up email that:
- Addresses them by first name
- References their specific service interest
- Provides relevant pricing/timing info
- Includes a clear call-to-action (schedule a visit or call)
- Signs off as the DuctDuctClean team
- Keep it concise (under 200 words)`;
}

export function SUMMARIZE_LEAD_PROMPT(lead: ContactSubmission) {
  return `Summarize this lead in 2-3 sentences for a busy business owner.

Lead:
- Name: ${lead.name}
- Email: ${lead.email}
- Phone: ${lead.phone}
- Address: ${lead.address}
- Service: ${lead.service_type}
- Message: ${lead.message || "None"}
- Status: ${lead.status}
- Date: ${lead.created_at}
${lead.notes ? `- Notes: ${lead.notes}` : ""}

Provide a quick summary including: who they are, what they want, and any notable details.`;
}

export function SUGGEST_NEXT_STEPS_PROMPT(lead: ContactSubmission) {
  return `You are a business advisor for DuctDuctClean, an air duct cleaning company. Suggest 3-5 actionable next steps for this lead.

${businessContext}

Lead:
- Name: ${lead.name}
- Service: ${lead.service_type}
- Status: ${lead.status}
- Message: ${lead.message || "None"}
- Date submitted: ${lead.created_at}
${lead.notes ? `- Internal notes: ${lead.notes}` : ""}

Based on their status and request, provide specific, actionable next steps. Consider timing, service type, and any follow-up needed.`;
}

export function EMAIL_TEMPLATE_PROMPT(serviceType: string) {
  const service = servicesDetail.find(
    (s) => s.slug === serviceType || s.title.toLowerCase().includes(serviceType.toLowerCase())
  );

  return `Generate a professional follow-up email template for DuctDuctClean's ${service?.title || serviceType} service.

${service ? `Service details:\n- Price: ${service.price}\n- Duration: ${service.duration}\n- Includes: ${service.included.join(", ")}` : ""}

The email should:
- Have a compelling subject line
- Be warm and professional
- Highlight the value/benefits of the service
- Include a clear call-to-action
- Be under 200 words
- Include placeholders like [Customer Name], [Date], etc.`;
}

export function SOCIAL_POST_PROMPT(platform: string, topic?: string) {
  const platformGuidelines: Record<string, string> = {
    facebook:
      "Write for Facebook: conversational tone, can be 1-3 paragraphs, include a call-to-action. Use emojis sparingly.",
    instagram:
      "Write for Instagram: engaging caption, use relevant hashtags (8-15), include emojis, encourage engagement. Keep main text under 150 words.",
    "google-business":
      "Write for Google Business Profile: professional tone, highlight local presence in Idaho Falls, include service keywords for SEO. Keep under 100 words.",
  };

  return `Generate a social media post for DuctDuctClean, a professional duct cleaning company in Idaho Falls, Idaho.

${businessContext}

Platform: ${platform}
${platformGuidelines[platform] || "Write a professional social media post."}
${topic ? `Topic/angle: ${topic}` : "Choose an engaging topic related to the business (seasonal tips, service benefits, customer satisfaction, etc.)"}

Make it authentic and engaging. Do NOT sound overly salesy.`;
}

export const BLOG_IDEAS_PROMPT = `Generate 5 SEO-optimized blog topic ideas for DuctDuctClean, an air duct cleaning company in Idaho Falls, Idaho.

${businessContext}

For each topic provide:
1. Title (SEO-friendly, under 60 chars)
2. Target keyword
3. Brief description (1-2 sentences about what the article should cover)
4. Why it matters for the local Idaho Falls audience

Focus on topics that:
- Address common customer questions
- Are relevant to Eastern Idaho's climate and conditions
- Have good search volume potential
- Position DuctDuctClean as the local expert`;
