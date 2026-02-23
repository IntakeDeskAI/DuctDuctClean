import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyTechnician } from "@/lib/notifications/dispatch";
import type { Technician, ContactSubmission, JobSchedule } from "@/types";

// GET /api/cron/tech-notifications
// Processes pending notifications and sends reminders
export async function GET(request: NextRequest) {
  // Verify cron secret or Vercel cron header
  const authHeader = request.headers.get("authorization");
  const isVercelCron = request.headers.get("x-vercel-cron") === "true";

  if (!isVercelCron && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  let processed = 0;
  let reminders = 0;

  // 1. Process pending notifications where notify_at <= now
  const { data: pendingSchedules } = await supabase
    .from("job_schedules")
    .select("*, technician:technicians(*), lead:contact_submissions(*)")
    .eq("notification_status", "pending")
    .lte("notify_at", now)
    .neq("status", "cancelled")
    .limit(20);

  if (pendingSchedules) {
    for (const schedule of pendingSchedules) {
      if (schedule.technician && schedule.lead) {
        try {
          await notifyTechnician(
            schedule as unknown as JobSchedule,
            schedule.technician as Technician,
            schedule.lead as ContactSubmission
          );
          processed++;
        } catch (err) {
          console.error(`Failed to notify for schedule ${schedule.id}:`, err);
        }
      }
    }
  }

  // 2. Send 24h reminders for upcoming jobs
  const tomorrow = new Date();
  tomorrow.setHours(tomorrow.getHours() + 24);
  const tomorrowDate = tomorrow.toISOString().split("T")[0];

  const { data: upcomingJobs } = await supabase
    .from("job_schedules")
    .select("*, technician:technicians(*), lead:contact_submissions(*)")
    .eq("scheduled_date", tomorrowDate)
    .in("status", ["scheduled", "notified", "confirmed"])
    .not("notification_status", "eq", "failed");

  if (upcomingJobs) {
    for (const job of upcomingJobs) {
      // Check if a reminder was already sent today
      const { count } = await supabase
        .from("tech_notifications")
        .select("*", { count: "exact", head: true })
        .eq("job_schedule_id", job.id)
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString());

      if ((count || 0) === 0 && job.technician) {
        // Send a reminder SMS
        try {
          const { sendSMS } = await import("@/lib/sms/twilio");
          const scheduledDate = new Date(job.scheduled_date + "T00:00:00");
          const dateStr = scheduledDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          });

          const [hours, minutes] = job.scheduled_time.split(":");
          const h = parseInt(hours);
          const ampm = h >= 12 ? "PM" : "AM";
          const h12 = h % 12 || 12;
          const timeStr = `${h12}:${minutes} ${ampm}`;

          await sendSMS({
            to: job.technician.phone,
            body: `DuctDuctClean Reminder: You have a job tomorrow (${dateStr}) at ${timeStr}. ${job.lead?.address || ""}. Customer: ${job.lead?.name || ""}.`,
          });

          await supabase.from("tech_notifications").insert({
            job_schedule_id: job.id,
            technician_id: job.technician.id,
            channel: "sms",
            status: "sent",
            response: "24h_reminder",
          });

          reminders++;
        } catch (err) {
          console.error(`Failed to send reminder for job ${job.id}:`, err);
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    reminders,
    timestamp: now,
  });
}
