import { createAdminClient } from "@/lib/supabase/admin";

export function generateReferralCode(name: string): string {
  const firstName = name.split(" ")[0].toUpperCase().substring(0, 5);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DUCT-${firstName}-${random}`;
}

export async function lookupReferralCode(
  code: string
): Promise<{ valid: boolean; referrerName?: string }> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("contact_submissions")
    .select("name")
    .eq("referral_code", code.toUpperCase())
    .single();

  if (data) {
    return { valid: true, referrerName: data.name };
  }
  return { valid: false };
}

export async function assignReferralCode(
  contactSubmissionId: string,
  name: string
): Promise<string> {
  const supabase = createAdminClient();
  const code = generateReferralCode(name);

  const { error } = await supabase
    .from("contact_submissions")
    .update({ referral_code: code })
    .eq("id", contactSubmissionId);

  if (error) {
    console.error("Failed to assign referral code:", error);
    // Try with a different code if unique constraint fails
    const retryCode = generateReferralCode(name);
    await supabase
      .from("contact_submissions")
      .update({ referral_code: retryCode })
      .eq("id", contactSubmissionId);
    return retryCode;
  }

  return code;
}
