import AnalyticsDashboard from "@/components/admin/AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Website performance, lead tracking, and business metrics.
        </p>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
