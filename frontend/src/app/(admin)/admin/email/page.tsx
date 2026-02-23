import { createAdminClient } from "@/lib/supabase/admin";
import EmailLog from "@/components/admin/EmailLog";
import type { EmailLog as EmailLogType } from "@/types";

export const dynamic = "force-dynamic";

export default async function EmailPage() {
  let emails: EmailLogType[] = [];

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    emails = (data as EmailLogType[]) || [];
  } catch (error) {
    console.error("Failed to load email logs:", error);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Email
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View sent emails and compose new messages.
        </p>
      </div>

      <EmailLog emails={emails} />
    </div>
  );
}
