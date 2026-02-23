import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// PATCH /api/admin/technicians/[id] — update technician
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
    "name", "phone", "email", "services", "max_jobs_per_day",
    "notification_preference", "is_active", "color",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("technicians")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE /api/admin/technicians/[id] — soft-delete (set is_active=false)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("technicians")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
