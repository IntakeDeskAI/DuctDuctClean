import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// GET /api/admin/technicians — list all technicians with today's job count
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Get all technicians
  const { data: techs, error } = await supabase
    .from("technicians")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Get today's job counts per tech
  const { data: todayJobs } = await supabase
    .from("job_schedules")
    .select("technician_id")
    .eq("scheduled_date", today)
    .neq("status", "cancelled");

  const jobCounts: Record<string, number> = {};
  if (todayJobs) {
    for (const job of todayJobs) {
      jobCounts[job.technician_id] = (jobCounts[job.technician_id] || 0) + 1;
    }
  }

  const technicians = (techs || []).map((t) => ({
    ...t,
    jobs_today: jobCounts[t.id] || 0,
  }));

  return NextResponse.json(technicians);
}

// POST /api/admin/technicians — create a new technician
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, phone, email, services, max_jobs_per_day, notification_preference, color } = body;

  if (!name || !phone) {
    return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("technicians")
    .insert({
      name,
      phone,
      email: email || null,
      services: services || ["residential"],
      max_jobs_per_day: max_jobs_per_day || 4,
      notification_preference: notification_preference || "all",
      color: color || "#3B82F6",
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
