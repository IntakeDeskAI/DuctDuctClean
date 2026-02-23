import { createAdminClient } from "@/lib/supabase/admin";
import LeadsTable from "@/components/admin/LeadsTable";
import type { ContactSubmission } from "@/types";

export const dynamic = "force-dynamic";

async function getLeads(): Promise<ContactSubmission[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as ContactSubmission[]) || [];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Leads
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage all contact form submissions.
        </p>
      </div>

      <LeadsTable leads={leads} />
    </div>
  );
}
