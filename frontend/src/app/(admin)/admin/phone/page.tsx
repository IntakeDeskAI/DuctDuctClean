import { createAdminClient } from "@/lib/supabase/admin";
import PhoneDashboard from "@/components/admin/PhoneDashboard";
import type { CallLog } from "@/types";

export const dynamic = "force-dynamic";

async function getCallLogs(): Promise<CallLog[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("call_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("getCallLogs error:", error);
    return [];
  }
  return (data as CallLog[]) || [];
}

export default async function PhonePage() {
  const calls = await getCallLogs();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Phone Agent
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          AI-powered phone agent via Bland.ai — view call history and manage
          settings.
        </p>
      </div>
      <PhoneDashboard calls={calls} />
    </div>
  );
}
