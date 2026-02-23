import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import { techJobNotification } from "@/lib/email/templates";
import { sendSMS } from "@/lib/sms/twilio";
import type { Technician, JobSchedule, ContactSubmission } from "@/types";

const BLAND_API_URL = "https://api.bland.ai/v1";

interface DispatchResult {
  channel: string;
  success: boolean;
  externalId?: string;
  error?: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function getServiceLabel(type: string): string {
  const labels: Record<string, string> = {
    residential: "Residential Duct Cleaning",
    commercial: "Commercial HVAC Vent Cleaning",
    "dryer-vent": "Dryer Vent Cleaning",
    "window-washing": "Window Washing",
  };
  return labels[type] || type.replace("-", " ");
}

// Place an outbound call to the technician via Bland.ai
async function callTechnician(
  tech: Technician,
  lead: ContactSubmission,
  schedule: JobSchedule
): Promise<DispatchResult> {
  if (!process.env.BLAND_API_KEY) {
    return { channel: "bland_call", success: false, error: "Bland API key not configured" };
  }

  const task = `You are calling ${tech.name}, a technician for DuctDuctClean.
You need to notify them about a new job assignment.

Job Details:
- Customer: ${lead.name}
- Service: ${getServiceLabel(lead.service_type)}
- Address: ${lead.address}
- Date: ${formatDate(schedule.scheduled_date)}
- Time: ${formatTime(schedule.scheduled_time)}
- Duration: approximately ${schedule.estimated_duration} minutes

Tell the technician about the job and ask them to confirm they can make it.
If they confirm, thank them and let them know the customer's contact info will be sent via text.
If they can't make it, thank them and let them know we'll find another tech.

Be professional, friendly, and brief.`;

  try {
    const res = await fetch(`${BLAND_API_URL}/calls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.BLAND_API_KEY,
      },
      body: JSON.stringify({
        phone_number: tech.phone,
        task,
        voice: "mason",
        first_sentence: `Hi ${tech.name.split(" ")[0]}, this is DuctDuctClean dispatch calling with a new job assignment for you.`,
        wait_for_greeting: true,
        max_duration: 120,
      }),
    });

    const data = await res.json();
    if (data.call_id) {
      return { channel: "bland_call", success: true, externalId: data.call_id };
    }
    return { channel: "bland_call", success: false, error: JSON.stringify(data) };
  } catch (err) {
    return { channel: "bland_call", success: false, error: String(err) };
  }
}

// Send SMS notification to technician
async function smsTechnician(
  tech: Technician,
  lead: ContactSubmission,
  schedule: JobSchedule
): Promise<DispatchResult> {
  const body = `DuctDuctClean Job Assignment:\n${getServiceLabel(lead.service_type)}\n${lead.address}\n${formatDate(schedule.scheduled_date)} at ${formatTime(schedule.scheduled_time)}\nCustomer: ${lead.name} (${lead.phone})\n\nReply YES to confirm.`;

  const result = await sendSMS({ to: tech.phone, body });
  return {
    channel: "sms",
    success: result.success,
    externalId: result.sid,
    error: result.error,
  };
}

// Send email notification to technician
async function emailTechnician(
  tech: Technician,
  lead: ContactSubmission,
  schedule: JobSchedule
): Promise<DispatchResult> {
  if (!tech.email) {
    return { channel: "email", success: false, error: "No email on file" };
  }

  const template = techJobNotification(tech, lead, schedule);
  const result = await sendEmail({
    to: tech.email,
    toName: tech.name,
    subject: template.subject,
    html: template.html,
    template: "tech_job_notification",
  });

  return {
    channel: "email",
    success: result.success,
    externalId: result.resendId,
    error: result.error,
  };
}

// Main dispatch function — sends notifications based on tech preference
export async function notifyTechnician(
  schedule: JobSchedule,
  tech: Technician,
  lead: ContactSubmission
): Promise<DispatchResult[]> {
  const supabase = createAdminClient();
  const results: DispatchResult[] = [];

  // Determine which channels to use
  let channels: string[];
  switch (tech.notification_preference) {
    case "all":
      channels = ["bland_call", "sms", "email"];
      break;
    case "phone":
      channels = ["bland_call"];
      break;
    case "sms":
      channels = ["sms"];
      break;
    case "email":
      channels = ["email"];
      break;
    default:
      channels = ["email"];
  }

  // Send all notifications in parallel
  const promises = channels.map(async (channel) => {
    let result: DispatchResult;
    switch (channel) {
      case "bland_call":
        result = await callTechnician(tech, lead, schedule);
        break;
      case "sms":
        result = await smsTechnician(tech, lead, schedule);
        break;
      case "email":
        result = await emailTechnician(tech, lead, schedule);
        break;
      default:
        result = { channel, success: false, error: "Unknown channel" };
    }

    // Log the notification
    await supabase.from("tech_notifications").insert({
      job_schedule_id: schedule.id,
      technician_id: tech.id,
      channel: result.channel,
      status: result.success ? "sent" : "failed",
      external_id: result.externalId || null,
      response: result.error || null,
    });

    return result;
  });

  const settled = await Promise.allSettled(promises);
  for (const s of settled) {
    if (s.status === "fulfilled") {
      results.push(s.value);
    }
  }

  // Update job schedule notification status
  const anySuccess = results.some((r) => r.success);
  const primaryChannel = results.find((r) => r.success)?.channel;
  let notificationStatus = "failed";
  if (primaryChannel === "bland_call") notificationStatus = "calling";
  else if (primaryChannel === "sms") notificationStatus = "sms_sent";
  else if (primaryChannel === "email") notificationStatus = "emailed";

  if (anySuccess) {
    await supabase
      .from("job_schedules")
      .update({
        notification_status: notificationStatus,
        status: "notified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", schedule.id);
  } else {
    await supabase
      .from("job_schedules")
      .update({
        notification_status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", schedule.id);
  }

  return results;
}
