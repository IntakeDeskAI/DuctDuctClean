import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  // Auth check
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (!session?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date();

  // Date ranges
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  try {
    const [
      allLeadsResult,
      thisMonthLeadsResult,
      lastMonthLeadsResult,
      todayLeadsResult,
      last7DaysLeadsResult,
      emailsThisMonthResult,
      emailsLastMonthResult,
      callsThisMonthResult,
      callsLastMonthResult,
      schedulesResult,
      dailyLeadsResult,
    ] = await Promise.all([
      // All leads
      supabase
        .from("contact_submissions")
        .select("id, status, service_type, source, referral_source, revenue, completed_at, created_at"),

      // This month leads
      supabase
        .from("contact_submissions")
        .select("id, status, service_type, source, referral_source, created_at")
        .gte("created_at", thisMonthStart.toISOString()),

      // Last month leads
      supabase
        .from("contact_submissions")
        .select("id, status, service_type, created_at")
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString()),

      // Today's leads
      supabase
        .from("contact_submissions")
        .select("id", { count: "exact", head: true })
        .gte("created_at", today.toISOString()),

      // Last 7 days leads
      supabase
        .from("contact_submissions")
        .select("id, created_at")
        .gte("created_at", sevenDaysAgo.toISOString()),

      // Emails this month
      supabase
        .from("email_logs")
        .select("id, status", { count: "exact" })
        .gte("created_at", thisMonthStart.toISOString()),

      // Emails last month
      supabase
        .from("email_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString()),

      // Calls this month
      supabase
        .from("call_logs")
        .select("id, status, duration_seconds")
        .gte("created_at", thisMonthStart.toISOString()),

      // Calls last month
      supabase
        .from("call_logs")
        .select("id", { count: "exact", head: true })
        .gte("created_at", lastMonthStart.toISOString())
        .lte("created_at", lastMonthEnd.toISOString()),

      // Scheduled jobs
      supabase
        .from("job_schedules")
        .select("id, status, scheduled_date")
        .gte("scheduled_date", thisMonthStart.toISOString().split("T")[0]),

      // Daily leads (last 30 days for sparkline)
      supabase
        .from("contact_submissions")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: true }),
    ]);

    const allLeads = allLeadsResult.data || [];
    const thisMonthLeads = thisMonthLeadsResult.data || [];
    const lastMonthLeads = lastMonthLeadsResult.data || [];
    const last7DaysLeads = last7DaysLeadsResult.data || [];
    const callsThisMonth = callsThisMonthResult.data || [];
    const schedules = schedulesResult.data || [];
    const dailyLeadsRaw = dailyLeadsResult.data || [];

    // --- Calculate metrics ---

    // Conversion rates
    const thisMonthConverted = thisMonthLeads.filter(l => l.status === "converted").length;
    const lastMonthConverted = lastMonthLeads.filter(l => l.status === "converted").length;
    const thisMonthConvRate = thisMonthLeads.length > 0
      ? Math.round((thisMonthConverted / thisMonthLeads.length) * 100)
      : 0;
    const lastMonthConvRate = lastMonthLeads.length > 0
      ? Math.round((lastMonthConverted / lastMonthLeads.length) * 100)
      : 0;

    // Revenue
    const revenueThisMonth = allLeads
      .filter(l => l.status === "converted" && l.completed_at && new Date(l.completed_at) >= thisMonthStart)
      .reduce((sum, l) => sum + (l.revenue || 0), 0);
    const revenueLastMonth = allLeads
      .filter(l => l.status === "converted" && l.completed_at &&
        new Date(l.completed_at) >= lastMonthStart && new Date(l.completed_at) <= lastMonthEnd)
      .reduce((sum, l) => sum + (l.revenue || 0), 0);

    // Service type breakdown
    const serviceBreakdown: Record<string, number> = {};
    thisMonthLeads.forEach(l => {
      const svc = l.service_type || "other";
      serviceBreakdown[svc] = (serviceBreakdown[svc] || 0) + 1;
    });

    // Source breakdown
    const sourceBreakdown: Record<string, number> = {};
    thisMonthLeads.forEach(l => {
      const src = l.referral_source ? "referral" : (l as { source?: string }).source === "phone" ? "phone" : "website";
      sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
    });

    // Status breakdown (funnel)
    const statusBreakdown: Record<string, number> = {};
    allLeads.forEach(l => {
      statusBreakdown[l.status] = (statusBreakdown[l.status] || 0) + 1;
    });

    // Daily leads for chart (last 30 days)
    const dailyLeads: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyLeads[key] = 0;
    }
    dailyLeadsRaw.forEach(l => {
      const key = new Date(l.created_at).toISOString().split("T")[0];
      if (dailyLeads[key] !== undefined) {
        dailyLeads[key]++;
      }
    });

    // Weekly leads for chart (last 7 days)
    const weeklyLeads: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      weeklyLeads[key] = 0;
    }
    last7DaysLeads.forEach(l => {
      const key = new Date(l.created_at).toISOString().split("T")[0];
      if (weeklyLeads[key] !== undefined) {
        weeklyLeads[key]++;
      }
    });

    // Call stats
    const completedCalls = callsThisMonth.filter(c => c.status === "completed");
    const avgCallDuration = completedCalls.length > 0
      ? Math.round(completedCalls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) / completedCalls.length)
      : 0;

    // Jobs this month
    const completedJobs = schedules.filter(s => s.status === "completed").length;
    const scheduledJobs = schedules.filter(s => s.status === "scheduled" || s.status === "confirmed").length;

    return NextResponse.json({
      overview: {
        totalLeads: allLeads.length,
        leadsThisMonth: thisMonthLeads.length,
        leadsLastMonth: lastMonthLeads.length,
        leadsToday: todayLeadsResult.count || 0,
        conversionRateThisMonth: thisMonthConvRate,
        conversionRateLastMonth: lastMonthConvRate,
        revenueThisMonth,
        revenueLastMonth,
        emailsThisMonth: emailsThisMonthResult.count || 0,
        emailsLastMonth: emailsLastMonthResult.count || 0,
        callsThisMonth: callsThisMonth.length,
        callsLastMonth: callsLastMonthResult.count || 0,
        avgCallDuration,
        completedJobs,
        scheduledJobs,
      },
      funnel: statusBreakdown,
      services: serviceBreakdown,
      sources: sourceBreakdown,
      dailyLeads,
      weeklyLeads,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
