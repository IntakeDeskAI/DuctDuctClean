import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import DashboardStats from "@/components/admin/DashboardStats";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { ContactSubmission } from "@/types";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [leadsResult, emailsResult, callsResult] = await Promise.all([
    supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("email_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString()),
    supabase
      .from("call_logs")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart.toISOString()),
  ]);

  return {
    leads: (leadsResult.data as ContactSubmission[]) || [],
    emailsSentThisMonth: emailsResult.count || 0,
    callsThisMonth: callsResult.count || 0,
  };
}

export default async function AdminDashboardPage() {
  const { leads, emailsSentThisMonth, callsThisMonth } =
    await getDashboardData();
  const recentLeads = leads.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back. Here&apos;s what&apos;s happening.
          </p>
        </div>
      </div>

      <DashboardStats
        leads={leads}
        emailsSentThisMonth={emailsSentThisMonth}
        callsThisMonth={callsThisMonth}
      />

      {/* Recent Leads */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Leads</h2>
          <Link
            href="/admin/leads"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {recentLeads.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No leads yet. They&apos;ll appear here when customers submit the
              contact form.
            </div>
          ) : (
            recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-600">
                      {lead.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {lead.service_type.replace("-", " ")} &middot;{" "}
                      {formatDate(lead.created_at)}
                    </p>
                  </div>
                </div>
                <Badge status={lead.status} />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
