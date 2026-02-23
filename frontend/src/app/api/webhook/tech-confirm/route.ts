import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/webhook/tech-confirm?schedule=...&tech=...&action=confirm
// Handles email click confirmations from technicians
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scheduleId = searchParams.get("schedule");
  const techId = searchParams.get("tech");
  const action = searchParams.get("action");

  if (!scheduleId || !techId || action !== "confirm") {
    return new NextResponse(
      confirmPage("Invalid Link", "This confirmation link is invalid or expired.", false),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  const supabase = createAdminClient();

  // Verify the schedule exists and belongs to this tech
  const { data: schedule } = await supabase
    .from("job_schedules")
    .select("*, technician:technicians(*)")
    .eq("id", scheduleId)
    .eq("technician_id", techId)
    .single();

  if (!schedule) {
    return new NextResponse(
      confirmPage("Not Found", "This job schedule was not found.", false),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (schedule.notification_status === "confirmed") {
    return new NextResponse(
      confirmPage("Already Confirmed", `This job is already confirmed. See you on ${schedule.scheduled_date}!`, true),
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Update the schedule
  await supabase
    .from("job_schedules")
    .update({
      notification_status: "confirmed",
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", scheduleId);

  // Log the confirmation
  await supabase.from("tech_notifications").insert({
    job_schedule_id: scheduleId,
    technician_id: techId,
    channel: "email",
    status: "confirmed",
    response: "email_click_confirm",
  });

  const techName = schedule.technician?.name?.split(" ")[0] || "Tech";

  return new NextResponse(
    confirmPage(
      "Job Confirmed!",
      `Thanks ${techName}! You've confirmed your job on ${schedule.scheduled_date} at ${schedule.scheduled_time}. We'll send you a reminder before the job.`,
      true
    ),
    { headers: { "Content-Type": "text/html" } }
  );
}

// POST /api/webhook/tech-confirm — handles Twilio SMS webhook (tech replies YES)
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body = (formData.get("Body") as string || "").trim().toUpperCase();
  const from = (formData.get("From") as string || "").trim();

  if (!from) {
    return new NextResponse("<Response></Response>", {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const supabase = createAdminClient();

  // Only process YES / CONFIRM replies
  if (body === "YES" || body === "CONFIRM" || body === "Y") {
    // Find the most recent pending/notified schedule for this tech's phone
    const { data: tech } = await supabase
      .from("technicians")
      .select("id")
      .eq("phone", from)
      .single();

    if (tech) {
      const { data: schedule } = await supabase
        .from("job_schedules")
        .select("id")
        .eq("technician_id", tech.id)
        .in("status", ["scheduled", "notified"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (schedule) {
        await supabase
          .from("job_schedules")
          .update({
            notification_status: "confirmed",
            status: "confirmed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", schedule.id);

        await supabase.from("tech_notifications").insert({
          job_schedule_id: schedule.id,
          technician_id: tech.id,
          channel: "sms",
          status: "confirmed",
          response: `sms_reply: ${body}`,
        });

        // Reply to the tech
        return new NextResponse(
          `<Response><Message>Confirmed! You're all set for the job. We'll send a reminder before your appointment.</Message></Response>`,
          { headers: { "Content-Type": "text/xml" } }
        );
      }
    }
  }

  return new NextResponse(
    `<Response><Message>DuctDuctClean Dispatch: Reply YES to confirm your next job, or call (208) 470-8020 for help.</Message></Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

function confirmPage(title: string, message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} - DuctDuctClean</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 40px 20px; background: #f3f4f6; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
    .card { background: white; border-radius: 16px; padding: 40px; max-width: 420px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; color: #111827; margin: 0 0 12px; }
    p { font-size: 15px; color: #6b7280; line-height: 1.6; margin: 0; }
    .brand { margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 13px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? "&#9989;" : "&#10060;"}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <div class="brand">DuctDuctClean Dispatch</div>
  </div>
</body>
</html>`;
}
