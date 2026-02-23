import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { sendSMS } from "@/lib/sms/twilio";
import type { ContactSubmission } from "@/types";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// PATCH /api/admin/marketing/campaigns/[id] — update campaign
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id } = params;

  // If transitioning to "sending", execute the campaign
  if (body.status === "sending") {
    return await executeCampaign(id);
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/marketing/campaigns/[id] — cancel campaign
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .update({ status: "cancelled" })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

async function executeCampaign(campaignId: string) {
  const supabase = createAdminClient();

  // Get the campaign
  const { data: campaign, error: campError } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Set status to sending
  await supabase
    .from("marketing_campaigns")
    .update({ status: "sending" })
    .eq("id", campaignId);

  // Get target audience
  let audienceQuery = supabase
    .from("contact_submissions")
    .select("id, name, email, phone")
    .not("email", "is", null);

  switch (campaign.target_audience) {
    case "converted_only":
      audienceQuery = audienceQuery.eq("status", "converted");
      break;
    case "new_leads":
      audienceQuery = audienceQuery.eq("status", "new");
      break;
    case "all_customers":
      audienceQuery = audienceQuery.in("status", ["converted", "quoted"]);
      break;
    case "all_leads":
    default:
      // No additional filter — get everyone
      break;
  }

  const { data: recipients } = await audienceQuery.limit(500);
  if (!recipients || recipients.length === 0) {
    await supabase
      .from("marketing_campaigns")
      .update({ status: "completed", sent_count: 0 })
      .eq("id", campaignId);
    return NextResponse.json({ sent: 0, message: "No recipients found" });
  }

  let sentCount = 0;
  let deliveredCount = 0;

  for (const recipient of recipients) {
    try {
      // Send email
      if ((campaign.type === "email" || campaign.type === "both") && recipient.email) {
        const result = await sendEmail({
          to: recipient.email,
          toName: recipient.name,
          subject: campaign.subject || campaign.name,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
            <h2 style="color:#1e40af;">${campaign.subject || campaign.name}</h2>
            <div style="color:#374151;line-height:1.6;white-space:pre-wrap;">${campaign.content}</div>
            <hr style="margin:24px 0;border-color:#e5e7eb;">
            <p style="font-size:12px;color:#9ca3af;">DuctDuctClean · Idaho Falls, ID · (208) 470-8020</p>
          </div>`,
          template: "campaign",
          contactSubmissionId: recipient.id,
        });
        if (result.success) {
          sentCount++;
          deliveredCount++;
        }
      }

      // Send SMS
      if ((campaign.type === "sms" || campaign.type === "both") && recipient.phone && campaign.sms_content) {
        const smsResult = await sendSMS({ to: recipient.phone, body: campaign.sms_content });
        if (smsResult.success) {
          sentCount++;
        }
      }
    } catch (err) {
      console.error(`Campaign send error for ${recipient.id}:`, err);
    }
  }

  // Update campaign with results
  const { data: updated } = await supabase
    .from("marketing_campaigns")
    .update({
      status: "completed",
      sent_count: sentCount,
      delivered_count: deliveredCount,
    })
    .eq("id", campaignId)
    .select()
    .single();

  return NextResponse.json(updated);
}
