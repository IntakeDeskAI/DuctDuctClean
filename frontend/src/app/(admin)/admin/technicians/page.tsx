import { createAdminClient } from "@/lib/supabase/admin";
import TechnicianList from "@/components/admin/TechnicianList";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function getTechnicians() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  const { data: techs, error } = await supabase
    .from("technicians")
    .select("*")
    .order("name");

  if (error) {
    console.error("getTechnicians error:", JSON.stringify(error));
    return [];
  }

  // Get today's job counts
  const { data: todayJobs } = await supabase
    .from("job_schedules")
    .select("technician_id")
    .eq("scheduled_date", today)
    .neq("status", "cancelled");

  const jobCounts: Record<string, number> = {};
  if (todayJobs) {
    for (const job of todayJobs) {
      jobCounts[job.technician_id] = (jobCounts[job.technician_id] || 0) + 1;
    }
  }

  return (techs || []).map((t) => ({
    ...t,
    jobs_today: jobCounts[t.id] || 0,
  }));
}

export default async function TechniciansPage() {
  const technicians = await getTechnicians();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Technicians
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your team and their notification preferences.
        </p>
      </div>
      <TechnicianList technicians={technicians} />
    </div>
  );
}
