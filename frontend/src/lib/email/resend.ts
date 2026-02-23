import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/supabase/settings";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY || "re_placeholder");
  }
  return _resend;
}

interface EmailConfig {
  from_name: string;
  from_email: string;
  reply_to: string;
}

interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  template: string;
  contactSubmissionId?: string;
  metadata?: Record<string, unknown>;
}

export async function sendEmail(options: SendEmailOptions): Promise<{
  success: boolean;
  resendId?: string;
  error?: string;
}> {
  const supabase = createAdminClient();

  // Get email config from settings
  const emailConfig = await getSetting<EmailConfig>("email_config");
  const fromName = emailConfig?.from_name || "DuctDuctClean";
  const fromEmail = emailConfig?.from_email || "info@ductductclean.com";
  const replyTo = emailConfig?.reply_to || fromEmail;

  // Use Resend's onboarding address until domain is verified
  const from = process.env.RESEND_FROM_EMAIL || `${fromName} <onboarding@resend.dev>`;

  try {
    const { data, error } = await getResend().emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: replyTo,
    });

    if (error) {
      console.error("Resend error:", error);

      // Log failed email
      await supabase.from("email_logs").insert({
        to_email: options.to,
        to_name: options.toName || null,
        from_email: fromEmail,
        subject: options.subject,
        template: options.template,
        body_preview: options.html.replace(/<[^>]+>/g, "").substring(0, 200),
        status: "failed",
        contact_submission_id: options.contactSubmissionId || null,
        metadata: { ...options.metadata, error: error.message },
      });

      return { success: false, error: error.message };
    }

    // Log successful email
    await supabase.from("email_logs").insert({
      to_email: options.to,
      to_name: options.toName || null,
      from_email: fromEmail,
      subject: options.subject,
      template: options.template,
      body_preview: options.html.replace(/<[^>]+>/g, "").substring(0, 200),
      resend_id: data?.id || null,
      status: "sent",
      contact_submission_id: options.contactSubmissionId || null,
      metadata: options.metadata || {},
    });

    // Update last_email_sent_at on the contact submission
    if (options.contactSubmissionId) {
      await supabase
        .from("contact_submissions")
        .update({ last_email_sent_at: new Date().toISOString() })
        .eq("id", options.contactSubmissionId);
    }

    return { success: true, resendId: data?.id };
  } catch (err) {
    console.error("Email send error:", err);

    // Log failed email
    await supabase.from("email_logs").insert({
      to_email: options.to,
      to_name: options.toName || null,
      from_email: fromEmail,
      subject: options.subject,
      template: options.template,
      body_preview: options.html.replace(/<[^>]+>/g, "").substring(0, 200),
      status: "failed",
      contact_submission_id: options.contactSubmissionId || null,
      metadata: { ...options.metadata, error: String(err) },
    });

    return { success: false, error: String(err) };
  }
}
