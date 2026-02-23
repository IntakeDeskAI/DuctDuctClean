import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// PATCH /api/admin/schedules/[id] — update a schedule
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const allowedFields = [
    "technician_id", "scheduled_date", "scheduled_time",
    "estimated_duration", "status", "notification_status",
    "notify_at", "notes",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_schedules")
    .update(updates)
    .eq("id", id)
    .select("*, technician:technicians(*), lead:contact_submissions(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
