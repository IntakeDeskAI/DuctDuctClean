import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { streamChatCompletion } from "@/lib/ai/provider";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  DRAFT_RESPONSE_PROMPT,
  SUMMARIZE_LEAD_PROMPT,
  SUGGEST_NEXT_STEPS_PROMPT,
  EMAIL_TEMPLATE_PROMPT,
  SOCIAL_POST_PROMPT,
  BLOG_IDEAS_PROMPT,
  SMS_TEMPLATE_PROMPT,
  SEASONAL_PROMO_PROMPT,
  REVIEW_RESPONSE_PROMPT,
  GOOGLE_BUSINESS_POST_PROMPT,
  CAMPAIGN_CONTENT_PROMPT,
  WEEKLY_SOCIAL_POSTS_PROMPT,
  COUPON_DESCRIPTION_PROMPT,
} from "@/lib/ai/prompts";
import type { ContactSubmission } from "@/types";

function checkAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

async function getLeadById(id: string): Promise<ContactSubmission | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function POST(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, leadId, serviceType, platform, topic, customInstructions,
      tone, season, reviewType, reviewText, campaignType, audience,
      platforms, discountType, discountValue } = body;

    let prompt: string;

    switch (action) {
      case "draft_response": {
        if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
        const lead = await getLeadById(leadId);
        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        prompt = DRAFT_RESPONSE_PROMPT(lead);
        break;
      }
      case "summarize": {
        if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
        const lead = await getLeadById(leadId);
        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        prompt = SUMMARIZE_LEAD_PROMPT(lead);
        break;
      }
      case "suggest_next_steps": {
        if (!leadId) return NextResponse.json({ error: "leadId required" }, { status: 400 });
        const lead = await getLeadById(leadId);
        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        prompt = SUGGEST_NEXT_STEPS_PROMPT(lead);
        break;
      }
      case "email_template": {
        if (!serviceType) return NextResponse.json({ error: "serviceType required" }, { status: 400 });
        prompt = EMAIL_TEMPLATE_PROMPT(serviceType);
        break;
      }
      case "social_post": {
        if (!platform) return NextResponse.json({ error: "platform required" }, { status: 400 });
        prompt = SOCIAL_POST_PROMPT(platform, topic);
        break;
      }
      case "blog_ideas": {
        prompt = BLOG_IDEAS_PROMPT;
        break;
      }
      case "sms_template": {
        prompt = SMS_TEMPLATE_PROMPT(serviceType || "residential", tone || "professional");
        break;
      }
      case "seasonal_promo": {
        prompt = SEASONAL_PROMO_PROMPT(season || "winter", serviceType || "residential", tone || "seasonal");
        break;
      }
      case "review_response": {
        prompt = REVIEW_RESPONSE_PROMPT(reviewType || "positive", reviewText);
        break;
      }
      case "google_business_post": {
        prompt = GOOGLE_BUSINESS_POST_PROMPT(topic, tone || "professional");
        break;
      }
      case "campaign_content": {
        prompt = CAMPAIGN_CONTENT_PROMPT(campaignType || "email", audience || "all_customers", tone || "professional");
        break;
      }
      case "weekly_social_posts": {
        prompt = WEEKLY_SOCIAL_POSTS_PROMPT(platforms || ["facebook", "instagram", "google-business"]);
        break;
      }
      case "coupon_description": {
        prompt = COUPON_DESCRIPTION_PROMPT(discountType || "percentage", discountValue || 10, serviceType);
        break;
      }
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (customInstructions) {
      prompt += `\n\nAdditional instructions: ${customInstructions}`;
    }

    const stream = await streamChatCompletion({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: "Generate the content now." },
      ],
      model: "admin",
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
