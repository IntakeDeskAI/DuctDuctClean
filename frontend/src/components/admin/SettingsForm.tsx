"use client";

import { useState } from "react";
import {
  Building2,
  Mail,
  Bell,
  Zap,
  Star,
  Loader2,
  CheckCircle2,
  Send,
} from "lucide-react";

interface SettingsFormProps {
  initialSettings: Record<string, Record<string, unknown>>;
}

const tabs = [
  { id: "business_info", label: "Business Info", icon: Building2 },
  { id: "email_config", label: "Email", icon: Mail },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "automations", label: "Automations", icon: Zap },
  { id: "reviews_referrals", label: "Reviews & Referrals", icon: Star },
];

export default function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState("business_info");
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  function updateField(section: string, field: string, value: unknown) {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  }

  async function handleSave(section: string) {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: section, value: settings[section] }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  async function handleTestEmail() {
    setTestingEmail(true);
    const adminEmail = (settings.notifications as Record<string, unknown>)?.admin_email as string;
    if (!adminEmail) {
      alert("Please set an admin email address first.");
      setTestingEmail(false);
      return;
    }
    await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: adminEmail,
        toName: "Admin",
        subject: "DuctDuctClean - Test Email",
        body: "This is a test email from your DuctDuctClean admin dashboard. If you're seeing this, your email integration is working correctly!",
      }),
    });
    setTestingEmail(false);
    alert("Test email sent! Check your inbox.");
  }

  const sectionData = settings[activeTab] || {};

  return (
    <div className="grid lg:grid-cols-[240px_1fr] gap-6">
      {/* Sidebar Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 h-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-brand-50 text-brand-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {activeTab === "business_info" && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Business Information
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Basic information about your business used across the platform.
            </p>
            <div className="space-y-4">
              <Field
                label="Business Name"
                value={(sectionData.name as string) || ""}
                onChange={(v) => updateField("business_info", "name", v)}
              />
              <Field
                label="Phone"
                value={(sectionData.phone as string) || ""}
                onChange={(v) => updateField("business_info", "phone", v)}
              />
              <Field
                label="Email"
                type="email"
                value={(sectionData.email as string) || ""}
                onChange={(v) => updateField("business_info", "email", v)}
              />
              <Field
                label="Address"
                value={(sectionData.address as string) || ""}
                onChange={(v) => updateField("business_info", "address", v)}
              />
              <Field
                label="Business Hours"
                value={(sectionData.hours as string) || ""}
                onChange={(v) => updateField("business_info", "hours", v)}
              />
            </div>
          </div>
        )}

        {activeTab === "email_config" && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Email Configuration
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Configure how emails are sent from your dashboard.
            </p>
            <div className="space-y-4">
              <Field
                label="From Name"
                value={(sectionData.from_name as string) || ""}
                onChange={(v) => updateField("email_config", "from_name", v)}
                placeholder="DuctDuctClean"
              />
              <Field
                label="From Email"
                type="email"
                value={(sectionData.from_email as string) || ""}
                onChange={(v) => updateField("email_config", "from_email", v)}
                placeholder="hello@ductductclean.com"
              />
              <Field
                label="Reply-To Email"
                type="email"
                value={(sectionData.reply_to as string) || ""}
                onChange={(v) => updateField("email_config", "reply_to", v)}
                placeholder="owner@ductductclean.com"
              />
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleTestEmail}
                disabled={testingEmail}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {testingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Send Test Email
              </button>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Notification Settings
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Control when and where you receive notifications.
            </p>
            <div className="space-y-4">
              <Field
                label="Admin Email"
                type="email"
                value={(sectionData.admin_email as string) || ""}
                onChange={(v) => updateField("notifications", "admin_email", v)}
                placeholder="owner@ductductclean.com"
                hint="Receives new lead notifications and system alerts"
              />
              <Toggle
                label="Email on New Lead"
                description="Get an email notification when a new lead comes in via the website or phone"
                checked={Boolean(sectionData.email_on_new_lead)}
                onChange={(v) =>
                  updateField("notifications", "email_on_new_lead", v)
                }
              />
            </div>
          </div>
        )}

        {activeTab === "automations" && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Automation Settings
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Configure automated email sequences for leads and customers.
            </p>
            <div className="space-y-5">
              <Toggle
                label="Auto Thank-You Email"
                description="Automatically send a thank-you email when a new lead submits the contact form"
                checked={Boolean(sectionData.auto_thank_you_email)}
                onChange={(v) =>
                  updateField("automations", "auto_thank_you_email", v)
                }
              />
              <Toggle
                label="1-Hour Follow-Up"
                description="Send a follow-up email if a new lead hasn't been contacted within 1 hour"
                checked={Boolean(sectionData.auto_follow_up_1h)}
                onChange={(v) =>
                  updateField("automations", "auto_follow_up_1h", v)
                }
              />
              <Toggle
                label="Review Request"
                description="Automatically ask for a Google review 2 hours after marking a job as completed"
                checked={Boolean(sectionData.auto_review_request)}
                onChange={(v) =>
                  updateField("automations", "auto_review_request", v)
                }
              />
              <Toggle
                label="Re-Engagement (12 months)"
                description="Send a re-engagement email to past customers 12 months after their service"
                checked={Boolean(sectionData.auto_reengagement_12m)}
                onChange={(v) =>
                  updateField("automations", "auto_reengagement_12m", v)
                }
              />
            </div>
          </div>
        )}

        {activeTab === "reviews_referrals" && (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Reviews & Referral Program
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Configure Google Review requests and customer referral codes.
            </p>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Google Reviews
                </h4>
                <Field
                  label="Google Review URL"
                  value={
                    ((settings.google_review || {}) as Record<string, unknown>)
                      .url as string || ""
                  }
                  onChange={(v) => updateField("google_review", "url", v)}
                  placeholder="https://g.page/r/your-business/review"
                  hint="Paste your Google Business review link"
                />
              </div>
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">
                  Referral Program
                </h4>
                <div className="space-y-4">
                  <Toggle
                    label="Enable Referral Program"
                    description="Generate unique referral codes for converted customers and send referral invite emails"
                    checked={Boolean(
                      ((settings.referral_program || {}) as Record<string, unknown>)
                        .enabled
                    )}
                    onChange={(v) =>
                      updateField("referral_program", "enabled", v)
                    }
                  />
                  <Field
                    label="Reward Description"
                    value={
                      ((settings.referral_program || {}) as Record<string, unknown>)
                        .reward_description as string || ""
                    }
                    onChange={(v) =>
                      updateField("referral_program", "reward_description", v)
                    }
                    placeholder="$25 off their first service"
                    hint="What do referrers and their friends get?"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-3">
          <button
            onClick={() => {
              // Save the active section, plus google_review and referral_program if on that tab
              if (activeTab === "reviews_referrals") {
                Promise.all([
                  handleSave("google_review"),
                  handleSave("referral_program"),
                ]);
              } else {
                handleSave(activeTab);
              }
            }}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : saved ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
      />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
          checked ? "bg-brand-600" : "bg-gray-200"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}
