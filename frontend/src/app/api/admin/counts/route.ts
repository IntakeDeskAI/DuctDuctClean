import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// GET /api/admin/counts — lightweight endpoint for sidebar badges
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const [leadsResult, callsResult, emailsResult, schedulesResult, techsResult] =
    await Promise.all([
      // New leads (not yet contacted)
      supabase
        .from("contact_submissions")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),

      // Recent calls (last 24h)
      supabase
        .from("call_logs")
        .select("*", { count: "exact", head: true })
        .gte(
          "created_at",
          new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        ),

      // Emails sent today
      supabase
        .from("email_logs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today + "T00:00:00"),

      // Today's scheduled jobs
      supabase
        .from("job_schedules")
        .select("*", { count: "exact", head: true })
        .eq("scheduled_date", today)
        .neq("status", "cancelled"),

      // Active technicians
      supabase
        .from("technicians")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  return NextResponse.json({
    leads: leadsResult.count || 0,
    calls: callsResult.count || 0,
    emails: emailsResult.count || 0,
    schedules: schedulesResult.count || 0,
    technicians: techsResult.count || 0,
  });
}
