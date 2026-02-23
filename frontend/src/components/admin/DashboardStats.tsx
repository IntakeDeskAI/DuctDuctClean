"use client";

import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  Phone,
  Globe,
  Share2,
} from "lucide-react";
import Link from "next/link";
import type { ContactSubmission } from "@/types";
import { formatPhone } from "@/lib/utils";

interface DashboardStatsProps {
  leads: ContactSubmission[];
  emailsSentThisMonth?: number;
  callsThisMonth?: number;
}

export default function DashboardStats({
  leads,
  emailsSentThisMonth = 0,
  callsThisMonth = 0,
}: DashboardStatsProps) {
  const total = leads.length;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = leads.filter(
    (l) => new Date(l.created_at) >= monthStart
  ).length;

  const convertedCount = leads.filter((l) => l.status === "converted").length;
  const conversionRate =
    total > 0 ? Math.round((convertedCount / total) * 100) : 0;

  const revenueThisMonth = leads
    .filter(
      (l) =>
        l.status === "converted" &&
        l.completed_at &&
        new Date(l.completed_at) >= monthStart
    )
    .reduce((sum, l) => sum + (l.revenue || 0), 0);

  // Funnel data
  const funnel = [
    { label: "New", count: leads.filter((l) => l.status === "new").length, color: "bg-blue-500" },
    { label: "Contacted", count: leads.filter((l) => l.status === "contacted").length, color: "bg-yellow-500" },
    { label: "Quoted", count: leads.filter((l) => l.status === "quoted").length, color: "bg-orange-500" },
    { label: "Converted", count: convertedCount, color: "bg-green-500" },
    { label: "Closed", count: leads.filter((l) => l.status === "closed").length, color: "bg-gray-400" },
  ];
  const maxFunnel = Math.max(...funnel.map((f) => f.count), 1);

  // Source breakdown
  const sources = leads.reduce(
    (acc, l) => {
      const src = l.referral_source ? "referral" : l.source === "phone" ? "phone" : "website";
      acc[src] = (acc[src] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const sourceData = [
    { label: "Website", count: sources.website || 0, icon: Globe, color: "bg-blue-500" },
    { label: "Phone", count: sources.phone || 0, icon: Phone, color: "bg-green-500" },
    { label: "Referral", count: sources.referral || 0, icon: Share2, color: "bg-purple-500" },
  ];
  const maxSource = Math.max(...sourceData.map((s) => s.count), 1);

  // Leads needing follow-up
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const needsFollowUp = leads.filter(
    (l) => l.status === "new" && new Date(l.created_at) < oneHourAgo
  );

  const stats = [
    { label: "Total Leads", value: String(total), icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "New This Month", value: String(newThisMonth), icon: UserPlus, color: "bg-green-100 text-green-600" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: TrendingUp, color: "bg-purple-100 text-purple-600" },
    { label: "Revenue This Month", value: `$${revenueThisMonth.toLocaleString()}`, icon: DollarSign, color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Pipeline</h3>
          <div className="space-y-3">
            {funnel.map((stage) => (
              <div key={stage.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20">{stage.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                    style={{ width: `${Math.max((stage.count / maxFunnel) * 100, stage.count > 0 ? 15 : 0)}%` }}
                  >
                    {stage.count > 0 && (
                      <span className="text-xs font-semibold text-white">{stage.count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Sources</h3>
          <div className="space-y-4">
            {sourceData.map((source) => {
              const Icon = source.icon;
              const pct = total > 0 ? Math.round((source.count / total) * 100) : 0;
              return (
                <div key={source.label} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 w-16">{source.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full ${source.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max((source.count / maxSource) * 100, source.count > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-16 text-right">
                    {source.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-4 text-xs text-gray-500">
            <span>{emailsSentThisMonth} emails this month</span>
            <span>{callsThisMonth} calls this month</span>
          </div>
        </div>
      </div>

      {/* Needs Follow-Up */}
      {needsFollowUp.length > 0 && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <h3 className="text-sm font-semibold text-yellow-800 mb-3">
            Needs Follow-Up ({needsFollowUp.length})
          </h3>
          <div className="space-y-2">
            {needsFollowUp.slice(0, 5).map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="flex items-center justify-between bg-white rounded-lg px-4 py-3 border border-yellow-100 hover:border-yellow-300 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                  <p className="text-xs text-gray-500">{lead.service_type.replace("-", " ")}</p>
                </div>
                <a
                  href={`tel:${lead.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  {formatPhone(lead.phone)}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
