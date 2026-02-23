import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/resend";
import {
  followUp1Hour,
  reviewRequest,
  reEngagement,
  referralInvite,
} from "@/lib/email/templates";
import { getSetting } from "@/lib/supabase/settings";
import { assignReferralCode } from "@/lib/referral";
import type { ContactSubmission } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const results = {
    follow_ups: 0,
    review_requests: 0,
    reengagement: 0,
    referrals: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // ── 1. Process pending scheduled automations ──
    const { data: pendingRuns } = await supabase
      .from("automation_runs")
      .select("*, contact_submissions(*)")
      .eq("status", "pending")
      .lte("scheduled_for", new Date().toISOString())
      .limit(50);

    for (const run of pendingRuns || []) {
      const lead = run.contact_submissions as ContactSubmission | null;
      if (!lead) {
        await supabase
          .from("automation_runs")
          .update({ status: "skipped", executed_at: new Date().toISOString() })
          .eq("id", run.id);
        results.skipped++;
        continue;
      }

      try {
        if (run.automation_type === "follow_up_1h") {
          // Skip if lead has already been contacted
          if (lead.status !== "new" || !lead.email) {
            await supabase
              .from("automation_runs")
              .update({ status: "skipped", executed_at: new Date().toISOString() })
              .eq("id", run.id);
            results.skipped++;
            continue;
          }

          const template = followUp1Hour(lead);
          const emailResult = await sendEmail({
            to: lead.email,
            toName: lead.name,
            subject: template.subject,
            html: template.html,
            template: "follow_up_1h",
            contactSubmissionId: lead.id,
          });

          await supabase
            .from("automation_runs")
            .update({
              status: emailResult.success ? "completed" : "failed",
              executed_at: new Date().toISOString(),
            })
            .eq("id", run.id);
          results.follow_ups++;
        }

        if (run.automation_type === "review_request") {
          if (!lead.email) {
            await supabase
              .from("automation_runs")
              .update({ status: "skipped", executed_at: new Date().toISOString() })
              .eq("id", run.id);
            results.skipped++;
            continue;
          }

          const googleReview = await getSetting<{ url: string; enabled: boolean }>(
            "google_review"
          );

          if (!googleReview?.enabled || !googleReview?.url) {
            await supabase
              .from("automation_runs")
              .update({ status: "skipped", executed_at: new Date().toISOString() })
              .eq("id", run.id);
            results.skipped++;
            continue;
          }

          const template = reviewRequest(lead, googleReview.url);
          await sendEmail({
            to: lead.email,
            toName: lead.name,
            subject: template.subject,
            html: template.html,
            template: "review_request",
            contactSubmissionId: lead.id,
          });

          await supabase
            .from("automation_runs")
            .update({ status: "completed", executed_at: new Date().toISOString() })
            .eq("id", run.id);
          results.review_requests++;
        }

        if (run.automation_type === "referral_invite") {
          if (!lead.email) {
            await supabase
              .from("automation_runs")
              .update({ status: "skipped", executed_at: new Date().toISOString() })
              .eq("id", run.id);
            results.skipped++;
            continue;
          }

          const referralSettings = await getSetting<{
            enabled: boolean;
            reward_description: string;
          }>("referral_program");

          if (!referralSettings?.enabled) {
            await supabase
              .from("automation_runs")
              .update({ status: "skipped", executed_at: new Date().toISOString() })
              .eq("id", run.id);
            results.skipped++;
            continue;
          }

          // Assign referral code if not already assigned
          let code = lead.referral_code;
          if (!code) {
            code = await assignReferralCode(lead.id, lead.name);
          }

          const template = referralInvite(
            lead,
            code,
            referralSettings.reward_description
          );
          await sendEmail({
            to: lead.email,
            toName: lead.name,
            subject: template.subject,
            html: template.html,
            template: "referral_invite",
            contactSubmissionId: lead.id,
          });

          await supabase
            .from("automation_runs")
            .update({ status: "completed", executed_at: new Date().toISOString() })
            .eq("id", run.id);
          results.referrals++;
        }
      } catch (err) {
        console.error(`Automation error for run ${run.id}:`, err);
        await supabase
          .from("automation_runs")
          .update({ status: "failed", executed_at: new Date().toISOString() })
          .eq("id", run.id);
        results.errors++;
      }
    }

    // ── 2. Re-engagement: find customers due for follow-up ──
    const automations = await getSetting<{ auto_reengagement_12m: boolean }>(
      "automations"
    );

    if (automations?.auto_reengagement_12m) {
      const milestones = [
        { months: 6, type: "reengagement_6m" },
        { months: 12, type: "reengagement_12m" },
        { months: 18, type: "reengagement_18m" },
      ];

      for (const milestone of milestones) {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - milestone.months);
        const cutoffStart = new Date(cutoffDate);
        cutoffStart.setDate(cutoffStart.getDate() - 7); // 1-week window

        const { data: customers } = await supabase
          .from("contact_submissions")
          .select("*")
          .eq("status", "converted")
          .not("completed_at", "is", null)
          .not("email", "eq", "")
          .lte("completed_at", cutoffDate.toISOString())
          .gte("completed_at", cutoffStart.toISOString())
          .limit(20);

        for (const customer of customers || []) {
          // Check if already sent
          const { data: existing } = await supabase
            .from("automation_runs")
            .select("id")
            .eq("contact_submission_id", customer.id)
            .eq("automation_type", milestone.type)
            .single();

          if (existing) continue;

          const template = reEngagement(
            customer as ContactSubmission,
            milestone.months
          );
          const emailResult = await sendEmail({
            to: customer.email,
            toName: customer.name,
            subject: template.subject,
            html: template.html,
            template: milestone.type,
            contactSubmissionId: customer.id,
          });

          await supabase.from("automation_runs").upsert(
            {
              contact_submission_id: customer.id,
              automation_type: milestone.type,
              status: emailResult.success ? "completed" : "failed",
              executed_at: new Date().toISOString(),
            },
            { onConflict: "contact_submission_id,automation_type", ignoreDuplicates: true }
          );

          results.reengagement++;
        }
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error("Automation cron error:", error);
    return NextResponse.json(
      { error: "Automation cron failed", details: String(error) },
      { status: 500 }
    );
  }
}
