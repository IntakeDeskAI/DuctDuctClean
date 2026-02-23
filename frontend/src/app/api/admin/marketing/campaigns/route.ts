import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}

// GET /api/admin/marketing/campaigns — list campaigns
export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}

// POST /api/admin/marketing/campaigns — create campaign
export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, type, target_audience, subject, content, sms_content, scheduled_for, status } = body;

  if (!name || !type || !content) {
    return NextResponse.json(
      { error: "name, type, and content are required" },
      { status: 400 }
    );
  }

  const campaignStatus = status || (scheduled_for ? "scheduled" : "draft");

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("marketing_campaigns")
    .insert({
      name,
      type,
      status: campaignStatus,
      target_audience: target_audience || "all_customers",
      subject: subject || null,
      content,
      sms_content: sms_content || null,
      scheduled_for: scheduled_for || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
