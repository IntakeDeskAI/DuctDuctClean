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

export function GENERATE_BLOG_POST_PROMPT(existingSlugs: string[]) {
  const today = new Date().toISOString().split("T")[0];

  return `You are an SEO content writer for DuctDuctClean, a professional air duct cleaning company in Idaho Falls, Idaho.

${businessContext}

Existing blog post slugs (DO NOT repeat these topics):
${existingSlugs.map((s) => `- ${s}`).join("\n")}

Generate a new blog post as a JSON object with this exact structure:
{
  "slug": "url-friendly-slug-with-dashes",
  "title": "SEO-Optimized Title (under 60 chars)",
  "excerpt": "Compelling 1-2 sentence summary for the blog card",
  "category": "One of: Air Quality, Safety, Health & Wellness, HVAC Tips, Seasonal, Energy Efficiency",
  "author": "DuctDuctClean Team",
  "publishedAt": "${today}",
  "readTime": 5,
  "metaDescription": "SEO meta description under 160 characters",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "sections": [
    { "heading": "Section Title", "content": "Paragraph text (150-250 words)..." },
    { "heading": "Section Title", "content": "Intro text...", "list": ["item1", "item2", "item3"] }
  ]
}

Requirements:
- Write 4-6 sections with substantial content (150-250 words per section)
- Include at least 2 sections with bullet point lists
- Focus on topics relevant to Idaho Falls / Eastern Idaho homeowners
- Include local references (Idaho Falls, Ammon, Rexburg, Eastern Idaho climate)
- Use natural language, avoid keyword stuffing
- The final section should include a soft CTA mentioning DuctDuctClean services
- Return ONLY valid JSON, no markdown fences or extra text`;
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

// ===========================
// Marketing Hub Prompts
// ===========================

const toneInstructions: Record<string, string> = {
  professional: "Use a professional, trustworthy tone. Polished but approachable.",
  friendly: "Use a warm, conversational, neighborly tone. Like talking to a friend.",
  urgent: "Create urgency with time-sensitive language. Limited time, act now, don't miss out.",
  seasonal: "Tie into the current season and weather. Reference local conditions in Idaho Falls.",
};

export function SMS_TEMPLATE_PROMPT(serviceType: string, tone: string) {
  return `Generate 3 SMS marketing messages for DuctDuctClean's ${serviceType.replace("-", " ")} service.

${businessContext}

Tone: ${toneInstructions[tone] || toneInstructions.professional}

Rules:
- Each message MUST be under 160 characters (this is critical for SMS)
- Include a clear call-to-action (call, text, or visit website)
- Use the phone number (208) 470-8020
- Make each message different in approach (one benefit-focused, one seasonal, one offer-based)
- Number each message 1, 2, 3
- Do NOT use hashtags`;
}

export function SEASONAL_PROMO_PROMPT(season: string, serviceType: string, tone: string) {
  return `Generate a complete seasonal marketing promotion for DuctDuctClean.

${businessContext}

Season: ${season}
Service Focus: ${serviceType.replace("-", " ")}
Tone: ${toneInstructions[tone] || toneInstructions.seasonal}

Generate ALL of the following:

1. EMAIL VERSION:
- Subject line (under 50 chars)
- Body (150-200 words) with seasonal hook, service benefits, clear CTA

2. SMS VERSION:
- One text message under 160 characters

3. SOCIAL POST:
- Facebook/Instagram post (100-150 words with 5 relevant hashtags)

Make everything cohesive — same promotion, same seasonal angle, adapted per channel.
Reference Idaho Falls weather and local conditions for the ${season} season.`;
}

export function REVIEW_RESPONSE_PROMPT(reviewType: "positive" | "negative", reviewText?: string) {
  return `Generate a professional response to a ${reviewType} Google review for DuctDuctClean.

${businessContext}

Review type: ${reviewType}
${reviewText ? `Review text: "${reviewText}"` : "Generate a generic template response."}

Guidelines:
- Keep the response under 100 words
- ${reviewType === "positive" ? "Thank them warmly, mention their specific service if possible, invite them to refer friends" : "Apologize sincerely, acknowledge the issue, offer to make it right, provide contact info for the owner"}
- Sound genuine and human, not corporate
- Sign off as "The DuctDuctClean Team"
- ${reviewType === "negative" ? "Do NOT be defensive. Be empathetic and solution-oriented." : "Express genuine gratitude."}`;
}

export function GOOGLE_BUSINESS_POST_PROMPT(topic: string | undefined, tone: string) {
  return `Generate a Google Business Profile post for DuctDuctClean.

${businessContext}

${topic ? `Topic: ${topic}` : "Choose a compelling topic (service highlight, seasonal tip, or customer benefit)."}
Tone: ${toneInstructions[tone] || toneInstructions.professional}

Requirements:
- 80-100 words (Google Business posts should be concise)
- Include relevant local keywords (Idaho Falls, Eastern Idaho)
- Include a call-to-action (call, book online, get a quote)
- Professional but personable
- Do NOT use hashtags (not supported on Google Business)
- Include the phone number when mentioning contact`;
}

export function CAMPAIGN_CONTENT_PROMPT(campaignType: string, audience: string, tone: string) {
  return `Generate marketing campaign content for DuctDuctClean.

${businessContext}

Campaign type: ${campaignType}
Target audience: ${audience}
Tone: ${toneInstructions[tone] || toneInstructions.professional}

Generate:

1. EMAIL:
- Subject line (compelling, under 50 chars)
- Email body (200-250 words)
- Clear call-to-action

2. SMS (if applicable):
- Text message under 160 characters

The content should be ready to send to ${audience === "all_customers" ? "existing customers" : audience === "new_leads" ? "new leads who haven't converted" : audience === "converted_only" ? "past customers" : "all contacts"}.

Make it compelling and actionable. Include specific DuctDuctClean service details.`;
}

export function WEEKLY_SOCIAL_POSTS_PROMPT(platforms: string[]) {
  return `Generate a week's worth of social media content for DuctDuctClean.

${businessContext}

Create 3 distinct posts for these platforms: ${platforms.join(", ")}

For each post:
1. Specify which platform it's for
2. Write the post content following platform-specific best practices:
   - Facebook: conversational, 1-2 paragraphs, CTA
   - Instagram: engaging caption with 8-10 relevant hashtags
   - Google Business: professional, 80-100 words, local SEO keywords

3. Suggest the best day/time to post

Make each post about a different angle:
- Post 1: Educational tip (air quality, HVAC maintenance)
- Post 2: Service highlight or seasonal promotion
- Post 3: Community/local engagement (Idaho Falls pride, local events)

Keep it authentic, not salesy.`;
}

export function COUPON_DESCRIPTION_PROMPT(discountType: string, discountValue: number, serviceType?: string) {
  return `Write a short, compelling promotional description for this DuctDuctClean coupon:

Discount: ${discountType === "percentage" ? `${discountValue}% off` : `$${discountValue} off`}
${serviceType ? `Service: ${serviceType.replace("-", " ")}` : "Applicable to all services"}

Write 2-3 sentences that:
- Highlight the savings
- Create urgency
- Mention the service benefit
- Sound professional but exciting

Keep it under 50 words total.`;
}
