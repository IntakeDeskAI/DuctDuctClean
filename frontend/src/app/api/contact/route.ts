import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validations/contact";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import {
  thankYouCustomer,
  newLeadAdminNotification,
} from "@/lib/email/templates";
import { getSetting } from "@/lib/supabase/settings";
import { lookupReferralCode } from "@/lib/referral";
import type { ContactSubmission } from "@/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check referral code if provided
    let referralSource: string | null = null;
    if (result.data.referralCode) {
      const ref = await lookupReferralCode(result.data.referralCode);
      if (ref.valid) {
        referralSource = `referral_${result.data.referralCode.toUpperCase()}`;
      }
    }

    const { data: lead, error } = await supabase
      .from("contact_submissions")
      .insert({
        name: result.data.name,
        email: result.data.email,
        phone: result.data.phone,
        address: result.data.address,
        service_type: result.data.serviceType,
        message: result.data.message || null,
        source: "website",
        referral_source: referralSource,
      })
      .select()
      .single();

    if (error || !lead) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit. Please try again." },
        { status: 500 }
      );
    }

    // Fire-and-forget: send automated emails
    const typedLead = lead as ContactSubmission;
    triggerAutomations(typedLead, supabase).catch((err) =>
      console.error("Automation error:", err)
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

async function triggerAutomations(
  lead: ContactSubmission,
  supabase: ReturnType<typeof createAdminClient>
) {
  const automations = await getSetting<{
    auto_thank_you_email: boolean;
    auto_follow_up_1h: boolean;
  }>("automations");

  const notifications = await getSetting<{
    email_on_new_lead: boolean;
    admin_email: string;
  }>("notifications");

  // 1. Thank-you email to customer
  if (automations?.auto_thank_you_email && lead.email) {
    const template = thankYouCustomer(lead);
    await sendEmail({
      to: lead.email,
      toName: lead.name,
      subject: template.subject,
      html: template.html,
      template: "thank_you",
      contactSubmissionId: lead.id,
    });

    await supabase.from("automation_runs").insert({
      contact_submission_id: lead.id,
      automation_type: "thank_you",
      status: "completed",
    });
  }

  // 2. Admin notification
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

  // 3. Schedule 1-hour follow-up
  if (automations?.auto_follow_up_1h && lead.email) {
    const scheduledFor = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await supabase.from("automation_runs").upsert(
      {
        contact_submission_id: lead.id,
        automation_type: "follow_up_1h",
        status: "pending",
        scheduled_for: scheduledFor,
        executed_at: null,
      },
      { onConflict: "contact_submission_id,automation_type", ignoreDuplicates: true }
    );
  }
}
