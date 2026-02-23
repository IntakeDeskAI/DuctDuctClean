"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Phone,
  Mail,
  Globe,
  Share2,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CalendarCheck,
  Eye,
  MousePointerClick,
  MessageSquare,
  RefreshCw,
  Minus,
} from "lucide-react";

interface AnalyticsData {
  overview: {
    totalLeads: number;
    leadsThisMonth: number;
    leadsLastMonth: number;
    leadsToday: number;
    conversionRateThisMonth: number;
    conversionRateLastMonth: number;
    revenueThisMonth: number;
    revenueLastMonth: number;
    emailsThisMonth: number;
    emailsLastMonth: number;
    callsThisMonth: number;
    callsLastMonth: number;
    avgCallDuration: number;
    completedJobs: number;
    scheduledJobs: number;
  };
  funnel: Record<string, number>;
  services: Record<string, number>;
  sources: Record<string, number>;
  dailyLeads: Record<string, number>;
  weeklyLeads: Record<string, number>;
}

function TrendBadge({ current, previous, suffix = "" }: { current: number; previous: number; suffix?: string }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-gray-400">—</span>;
  if (previous === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-green-600">
      <ArrowUpRight className="h-3 w-3" />New
    </span>
  );
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500">
      <Minus className="h-3 w-3" />0%{suffix}
    </span>
  );
  const isUp = change > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isUp ? "text-green-600" : "text-red-500"}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(change)}%{suffix}
    </span>
  );
}

function MiniChart({ data, color = "bg-brand-500" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[2px] h-10">
      {data.map((val, i) => (
        <div
          key={i}
          className={`flex-1 ${color} rounded-t-sm opacity-70 hover:opacity-100 transition-opacity min-w-[3px]`}
          style={{ height: `${Math.max((val / max) * 100, val > 0 ? 8 : 2)}%` }}
          title={`${val}`}
        />
      ))}
    </div>
  );
}

function SparkBar({ data, labels }: { data: number[]; labels: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((val, i) => {
        const dayLabel = labels[i];
        const shortDay = new Date(dayLabel + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-500 font-medium">{val > 0 ? val : ""}</span>
            <div
              className="w-full bg-brand-500 rounded-t-sm hover:bg-brand-600 transition-colors cursor-default"
              style={{ height: `${Math.max((val / max) * 100, val > 0 ? 10 : 3)}%` }}
            />
            <span className="text-[10px] text-gray-400">{shortDay}</span>
          </div>
        );
      })}
    </div>
  );
}

const SERVICE_LABELS: Record<string, string> = {
  "residential-duct": "Residential Ducts",
  "commercial-duct": "Commercial Ducts",
  "dryer-vent": "Dryer Vent",
  "window-washing": "Window Washing",
  other: "Other",
};

const SERVICE_COLORS: Record<string, string> = {
  "residential-duct": "bg-blue-500",
  "commercial-duct": "bg-indigo-500",
  "dryer-vent": "bg-orange-500",
  "window-washing": "bg-cyan-500",
  other: "bg-gray-400",
};

const FUNNEL_CONFIG: { key: string; label: string; color: string }[] = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { key: "quoted", label: "Quoted", color: "bg-orange-500" },
  { key: "converted", label: "Converted", color: "bg-green-500" },
  { key: "closed", label: "Closed", color: "bg-gray-400" },
];

const SOURCE_CONFIG: { key: string; label: string; icon: typeof Globe; color: string }[] = [
  { key: "website", label: "Website", icon: Globe, color: "bg-blue-500" },
  { key: "phone", label: "Phone", icon: Phone, color: "bg-green-500" },
  { key: "referral", label: "Referral", icon: Share2, color: "bg-purple-500" },
];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to load analytics");
      const json = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
              <div className="h-7 bg-gray-200 rounded w-20 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-28" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
              <div className="h-32 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-8 text-center">
        <p className="text-sm text-red-600">{error || "Failed to load analytics"}</p>
        <button
          onClick={fetchData}
          className="mt-3 text-sm font-medium text-red-700 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  const { overview, funnel, services, sources, dailyLeads, weeklyLeads } = data;

  const dailyValues = Object.values(dailyLeads);
  const weeklyLabels = Object.keys(weeklyLeads);
  const weeklyValues = Object.values(weeklyLeads);

  const totalServices = Object.values(services).reduce((a, b) => a + b, 0);
  const maxFunnel = Math.max(...Object.values(funnel), 1);
  const totalSources = Object.values(sources).reduce((a, b) => a + b, 0);

  const statCards = [
    {
      label: "Leads This Month",
      value: String(overview.leadsThisMonth),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      previous: overview.leadsLastMonth,
      suffix: " vs last month",
      sub: `${overview.leadsToday} today`,
    },
    {
      label: "Conversion Rate",
      value: `${overview.conversionRateThisMonth}%`,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
      previous: overview.conversionRateLastMonth,
      suffix: " vs last month",
      sub: `${overview.totalLeads} total leads`,
    },
    {
      label: "Revenue This Month",
      value: `$${overview.revenueThisMonth.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
      previous: overview.revenueLastMonth,
      suffix: " vs last month",
      sub: `$${overview.revenueLastMonth.toLocaleString()} last month`,
    },
    {
      label: "Engagement",
      value: String(overview.callsThisMonth + overview.emailsThisMonth),
      icon: Activity,
      color: "bg-purple-100 text-purple-600",
      previous: overview.callsLastMonth + overview.emailsLastMonth,
      suffix: " vs last month",
      sub: `${overview.callsThisMonth} calls · ${overview.emailsThisMonth} emails`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-brand-100 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-brand-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Site Analytics</h2>
            {lastUpdated && (
              <p className="text-xs text-gray-400">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendBadge
                  current={stat.label === "Conversion Rate" ? overview.conversionRateThisMonth : stat.label === "Revenue This Month" ? overview.revenueThisMonth : stat.label === "Leads This Month" ? overview.leadsThisMonth : overview.callsThisMonth + overview.emailsThisMonth}
                  previous={stat.previous}
                  suffix={stat.suffix}
                />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Weekly Leads + 30-day sparkline */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Leads Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">Leads This Week</h3>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          <SparkBar data={weeklyValues} labels={weeklyLabels} />
        </div>

        {/* 30-Day Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">30-Day Trend</h3>
            <span className="text-xs text-gray-400">
              {dailyValues.reduce((a, b) => a + b, 0)} total leads
            </span>
          </div>
          <div className="mt-2">
            <MiniChart data={dailyValues} color="bg-brand-500" />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Funnel + Sources */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lead Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Pipeline</h3>
          <div className="space-y-3">
            {FUNNEL_CONFIG.map((stage) => {
              const count = funnel[stage.key] || 0;
              return (
                <div key={stage.key} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">{stage.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full flex items-center justify-end pr-2 transition-all duration-500`}
                      style={{ width: `${Math.max((count / maxFunnel) * 100, count > 0 ? 15 : 0)}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-semibold text-white">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Lead Sources (This Month)</h3>
          <div className="space-y-4">
            {SOURCE_CONFIG.map((source) => {
              const Icon = source.icon;
              const count = sources[source.key] || 0;
              const pct = totalSources > 0 ? Math.round((count / totalSources) * 100) : 0;
              return (
                <div key={source.key} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-xs text-gray-600 w-16">{source.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full ${source.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max((count / Math.max(...Object.values(sources), 1)) * 100, count > 0 ? 10 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-16 text-right">
                    {count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Charts Row 3: Services + Engagement */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Services Requested (This Month)</h3>
          {totalServices === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No leads this month yet</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(services)
                .sort(([, a], [, b]) => b - a)
                .map(([svc, count]) => {
                  const pct = Math.round((count / totalServices) * 100);
                  return (
                    <div key={svc} className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${SERVICE_COLORS[svc] || "bg-gray-400"} flex-shrink-0`} />
                      <span className="text-xs text-gray-600 flex-1 truncate">
                        {SERVICE_LABELS[svc] || svc.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                      </span>
                      <span className="text-xs font-medium text-gray-700">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Engagement & Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Activity Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-green-500" />
                <span className="text-xs text-gray-500">Calls</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{overview.callsThisMonth}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                Avg {Math.floor(overview.avgCallDuration / 60)}m {overview.avgCallDuration % 60}s
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <span className="text-xs text-gray-500">Emails</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{overview.emailsThisMonth}</p>
              <TrendBadge current={overview.emailsThisMonth} previous={overview.emailsLastMonth} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="h-4 w-4 text-orange-500" />
                <span className="text-xs text-gray-500">Jobs Done</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{overview.completedJobs}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {overview.scheduledJobs} upcoming
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-xs text-gray-500">Avg Revenue</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                ${overview.leadsThisMonth > 0 && overview.conversionRateThisMonth > 0
                  ? Math.round(overview.revenueThisMonth / Math.max(1, Math.round(overview.leadsThisMonth * overview.conversionRateThisMonth / 100))).toLocaleString()
                  : "0"}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">Per conversion</p>
            </div>
          </div>
        </div>
      </div>

      {/* PostHog Attribution */}
      <div className="bg-brand-50 rounded-xl border border-brand-100 p-5">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-brand-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-brand-900">Website Visitor Tracking Active</h3>
            <p className="text-xs text-brand-600 mt-1">
              PostHog is tracking pageviews, phone clicks, form submissions, and chat interactions.
              For detailed visitor analytics, session recordings, and heatmaps, visit your{" "}
              <a
                href="https://us.posthog.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium hover:text-brand-800"
              >
                PostHog dashboard
              </a>.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-white rounded-full px-3 py-1 border border-brand-200">
                <Eye className="h-3 w-3" /> Pageviews
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-white rounded-full px-3 py-1 border border-brand-200">
                <MousePointerClick className="h-3 w-3" /> Phone Clicks
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-white rounded-full px-3 py-1 border border-brand-200">
                <Users className="h-3 w-3" /> Form Submissions
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-white rounded-full px-3 py-1 border border-brand-200">
                <MessageSquare className="h-3 w-3" /> Chat Events
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
