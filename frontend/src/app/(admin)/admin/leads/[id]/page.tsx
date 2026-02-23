import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import LeadDetail from "@/components/admin/LeadDetail";
import type { ContactSubmission } from "@/types";

export const dynamic = "force-dynamic";

async function getLead(id: string): Promise<ContactSubmission | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", id)
    .single();
  return data as ContactSubmission | null;
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lead = await getLead(params.id);
  if (!lead) notFound();

  return <LeadDetail lead={lead} />;
}
