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

  const [leadsResult, schedulesResult, techsResult] = await Promise.all([
    // New leads (not yet contacted)
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("status", "new"),

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
    schedules: schedulesResult.count || 0,
    technicians: techsResult.count || 0,
  });
}
