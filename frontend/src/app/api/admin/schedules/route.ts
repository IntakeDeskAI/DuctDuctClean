import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyTechnician } from "@/lib/notifications/dispatch";
import { cookies } from "next/headers";
import type { Technician, ContactSubmission, JobSchedule } from "@/types";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// GET /api/admin/schedules — list schedules with optional filters
export async function GET(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const techId = searchParams.get("technician_id");
  const status = searchParams.get("status");

  const supabase = createAdminClient();
  let query = supabase
    .from("job_schedules")
    .select("*, technician:technicians(*), lead:contact_submissions(*)")
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true });

  if (startDate) query = query.gte("scheduled_date", startDate);
  if (endDate) query = query.lte("scheduled_date", endDate);
  if (techId) query = query.eq("technician_id", techId);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/admin/schedules — create a job schedule and optionally notify
export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    contact_submission_id,
    technician_id,
    scheduled_date,
    scheduled_time,
    estimated_duration,
    notes,
    notify_now,
  } = body;

  if (!contact_submission_id || !technician_id || !scheduled_date || !scheduled_time) {
    return NextResponse.json(
      { error: "contact_submission_id, technician_id, scheduled_date, and scheduled_time are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  // Check tech availability (max jobs per day)
  const { data: tech } = await supabase
    .from("technicians")
    .select("*")
    .eq("id", technician_id)
    .single();

  if (!tech) {
    return NextResponse.json({ error: "Technician not found" }, { status: 404 });
  }

  const { count } = await supabase
    .from("job_schedules")
    .select("*", { count: "exact", head: true })
    .eq("technician_id", technician_id)
    .eq("scheduled_date", scheduled_date)
    .neq("status", "cancelled");

  if ((count || 0) >= tech.max_jobs_per_day) {
    return NextResponse.json(
      { error: `${tech.name} already has ${count} jobs on ${scheduled_date} (max: ${tech.max_jobs_per_day})` },
      { status: 409 }
    );
  }

  // Create the schedule
  const { data: schedule, error } = await supabase
    .from("job_schedules")
    .insert({
      contact_submission_id,
      technician_id,
      scheduled_date,
      scheduled_time,
      estimated_duration: estimated_duration || 120,
      notes: notes || null,
      status: "scheduled",
      notification_status: notify_now ? "pending" : "pending",
      notify_at: notify_now ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If notify_now, trigger notification immediately
  if (notify_now && schedule) {
    const { data: lead } = await supabase
      .from("contact_submissions")
      .select("*")
      .eq("id", contact_submission_id)
      .single();

    if (lead) {
      // Fire and forget — don't block the response
      notifyTechnician(
        schedule as JobSchedule,
        tech as Technician,
        lead as ContactSubmission
      ).catch((err) => console.error("Notification dispatch error:", err));
    }
  }

  return NextResponse.json(schedule, { status: 201 });
}
