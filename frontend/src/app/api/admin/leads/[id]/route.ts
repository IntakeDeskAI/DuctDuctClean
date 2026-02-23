import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSetting } from "@/lib/supabase/settings";
import { assignReferralCode } from "@/lib/referral";

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.status) {
      const validStatuses = ["new", "contacted", "quoted", "converted", "closed"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.notes !== undefined) {
      updates.notes = body.notes;
    }

    if (body.revenue !== undefined) {
      updates.revenue = body.revenue;
    }

    if (body.completed_at !== undefined) {
      updates.completed_at = body.completed_at;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("contact_submissions")
      .update(updates)
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    // If lead was just marked completed, schedule review + referral automations
    if (body.completed_at && data) {
      schedulePostCompletionAutomations(data.id, data.name, supabase).catch(
        (err) => console.error("Post-completion automation error:", err)
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

async function schedulePostCompletionAutomations(
  leadId: string,
  leadName: string,
  supabase: ReturnType<typeof createAdminClient>
) {
  const automations = await getSetting<{ auto_review_request: boolean }>(
    "automations"
  );

  if (automations?.auto_review_request) {
    const scheduledFor = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    await supabase.from("automation_runs").upsert(
      {
        contact_submission_id: leadId,
        automation_type: "review_request",
        status: "pending",
        scheduled_for: scheduledFor,
        executed_at: null,
      },
      { onConflict: "contact_submission_id,automation_type", ignoreDuplicates: true }
    );
  }

  const referralSettings = await getSetting<{ enabled: boolean }>("referral_program");
  if (referralSettings?.enabled) {
    await assignReferralCode(leadId, leadName);
    const scheduledFor = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    await supabase.from("automation_runs").upsert(
      {
        contact_submission_id: leadId,
        automation_type: "referral_invite",
        status: "pending",
        scheduled_for: scheduledFor,
        executed_at: null,
      },
      { onConflict: "contact_submission_id,automation_type", ignoreDuplicates: true }
    );
  }
}
