import { getAllSettings } from "@/lib/supabase/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings: Record<string, Record<string, unknown>> = {};

  try {
    settings = (await getAllSettings()) as Record<
      string,
      Record<string, unknown>
    >;
  } catch (error) {
    console.error("Failed to load settings:", error);
    // Provide defaults if settings table doesn't exist yet
    settings = {
      business_info: {
        name: "DuctDuctClean",
        phone: "(208) 470-8020",
        email: "",
        address: "Idaho Falls, ID",
        hours: "Mon-Sat 8am-6pm",
      },
      email_config: {
        from_name: "DuctDuctClean",
        from_email: "hello@ductductclean.com",
        reply_to: "",
      },
      notifications: {
        admin_email: "",
        email_on_new_lead: true,
      },
      automations: {
        auto_thank_you_email: true,
        auto_follow_up_1h: true,
        auto_review_request: true,
        auto_reengagement_12m: false,
      },
      google_review: {
        url: "",
      },
      referral_program: {
        enabled: false,
        reward_description: "$25 off their first service",
      },
    };
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your business configuration, email, and automations.
        </p>
      </div>

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
