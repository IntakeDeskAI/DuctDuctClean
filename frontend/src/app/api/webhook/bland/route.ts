import { NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { newLeadAdminNotification } from "@/lib/email/templates";
import { getSetting } from "@/lib/supabase/settings";
import type { ContactSubmission } from "@/types";

function verifyWebhookSignature(
  secret: string,
  body: unknown,
  signature: string
): boolean {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(body))
    .digest("hex");
  return expected === signature;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Verify Bland.ai HMAC-SHA256 webhook signature
    const signature = request.headers.get("x-webhook-signature");
    const webhookSecret = process.env.BLAND_WEBHOOK_SECRET;

    if (webhookSecret && signature) {
      if (!verifyWebhookSignature(webhookSecret, body, signature)) {
        console.error("Webhook signature verification failed");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    } else if (webhookSecret && !signature) {
      console.error("Missing X-Webhook-Signature header");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    const {
      call_id,
      from: callerPhone,
      duration,
      concatenated_transcript: transcript,
      recording_url,
      analysis,
      status: callStatus,
      transferred,
    } = body;

    if (!call_id) {
      return NextResponse.json({ error: "Missing call_id" }, { status: 400 });
    }

    // Parse analysis results
    const callerName = analysis?.caller_name || null;
    const serviceInterested = analysis?.service_interested || null;
    const callerIntent = analysis?.caller_intent || null;
    const callerAddress = analysis?.caller_address || null;
    const summary = analysis?.summary || null;

    // 1. Upsert call log (idempotent on bland_call_id)
    const { data: callLog, error: callError } = await supabase
      .from("call_logs")
      .upsert(
        {
          bland_call_id: call_id,
          phone_number: callerPhone || "unknown",
          direction: "inbound",
          status: transferred
            ? "transferred"
            : callStatus || "completed",
          duration_seconds: duration ? Math.round(duration) : null,
          transcript: transcript || null,
          recording_url: recording_url || null,
          summary,
          analysis: analysis || null,
          caller_name: callerName,
          caller_intent: callerIntent,
          service_interested: serviceInterested,
          transferred: transferred || false,
        },
        { onConflict: "bland_call_id" }
      )
      .select()
      .single();

    if (callError) {
      console.error("Failed to insert call log:", callError);
      return NextResponse.json(
        { error: "Failed to log call" },
        { status: 500 }
      );
    }

    // 2. Create a lead if we have a caller name
    if (callerName && callerPhone) {
      const { data: lead, error: leadError } = await supabase
        .from("contact_submissions")
        .insert({
          name: callerName,
          email: "",
          phone: callerPhone,
          address: callerAddress || "",
          service_type: serviceInterested || "general-inquiry",
          message:
            summary ||
            `Phone call (${Math.round((duration || 0) / 60)} min)`,
          source: "phone",
        })
        .select()
        .single();

      if (lead && !leadError) {
        await supabase
          .from("call_logs")
          .update({ contact_submission_id: lead.id })
          .eq("id", callLog.id);

        // Send admin notification email (fire-and-forget)
        notifyAdmin(lead as ContactSubmission).catch((err) =>
          console.error("Admin notification error:", err)
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

async function notifyAdmin(lead: ContactSubmission) {
  const notifications = await getSetting<{
    email_on_new_lead: boolean;
    admin_email: string;
  }>("notifications");

  const adminEmail =
    notifications?.admin_email || process.env.ADMIN_NOTIFICATION_EMAIL;

  if (notifications?.email_on_new_lead && adminEmail) {
    const template = newLeadAdminNotification(lead);
    await sendEmail({
      to: adminEmail,
      subject: template.subject,
      html: template.html,
      template: "new_lead_admin",
      contactSubmissionId: lead.id,
    });
  }
}
