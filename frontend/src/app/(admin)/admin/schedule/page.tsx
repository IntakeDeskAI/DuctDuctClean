import { createAdminClient } from "@/lib/supabase/admin";
import ScheduleCalendar from "@/components/admin/ScheduleCalendar";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

async function getWeekData() {
  const supabase = createAdminClient();

  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startDate = monday.toISOString().split("T")[0];
  const endDate = sunday.toISOString().split("T")[0];

  const [schedulesResult, techsResult, leadsResult] = await Promise.all([
    supabase
      .from("job_schedules")
      .select("*, technician:technicians(*), lead:contact_submissions(*)")
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .neq("status", "cancelled")
      .order("scheduled_date")
      .order("scheduled_time"),
    supabase
      .from("technicians")
      .select("*")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("contact_submissions")
      .select("id, name, service_type, address, phone, email")
      .in("status", ["new", "contacted", "quoted"])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return {
    schedules: schedulesResult.data || [],
    technicians: techsResult.data || [],
    leads: leadsResult.data || [],
    weekStart: startDate,
  };
}

export default async function SchedulePage() {
  const { schedules, technicians, leads, weekStart } = await getWeekData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Schedule
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage job assignments for your team.
        </p>
      </div>
      <ScheduleCalendar
        initialSchedules={schedules}
        technicians={technicians}
        leads={leads}
        weekStart={weekStart}
      />
    </div>
  );
}
