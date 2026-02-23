"use client";

import { useState, useCallback } from "react";
import {
  Target,
  Mail,
  MessageSquare,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  Sparkles,
  Loader2,
  Copy,
  Send,
  Pencil,
  X,
  Eye,
} from "lucide-react";
import { streamFetch } from "@/lib/ai/stream-client";
import { formatDate } from "@/lib/utils";
import type { MarketingCampaign } from "@/types";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

type CampaignStatus = MarketingCampaign["status"];
type CampaignType = MarketingCampaign["type"];

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const TYPE_STYLES: Record<CampaignType, string> = {
  email: "bg-blue-100 text-blue-700",
  sms: "bg-purple-100 text-purple-700",
  both: "bg-indigo-100 text-indigo-700",
};

const TYPE_LABELS: Record<CampaignType, string> = {
  email: "Email",
  sms: "SMS",
  both: "Both",
};

const AUDIENCE_LABELS: Record<string, string> = {
  all_customers: "All Customers",
  all_leads: "All Leads",
  new_leads: "New Leads",
  converted_only: "Past Customers",
  custom: "Custom",
};

const STATUS_FILTERS: { id: CampaignStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "scheduled", label: "Scheduled" },
  { id: "sending", label: "Sending" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
];

const TONES = ["Professional", "Friendly", "Urgent", "Seasonal"] as const;
type Tone = (typeof TONES)[number];

const AUDIENCES = [
  { value: "all_customers", label: "All Customers" },
  { value: "all_leads", label: "All Leads" },
  { value: "new_leads", label: "New Leads" },
  { value: "converted_only", label: "Past Customers" },
];

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface CampaignManagerProps {
  campaigns: MarketingCampaign[];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function CampaignManager({ campaigns: initialCampaigns }: CampaignManagerProps) {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>(initialCampaigns);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  /* ---- Derived data ---- */
  const totalCampaigns = campaigns.length;
  const activeScheduled = campaigns.filter(
    (c) => c.status === "scheduled" || c.status === "sending"
  ).length;
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent_count, 0);

  const filtered =
    statusFilter === "all"
      ? campaigns
      : campaigns.filter((c) => c.status === statusFilter);

  /* ---- Handlers ---- */
  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleDuplicate(campaign: MarketingCampaign) {
    const duplicate: MarketingCampaign = {
      ...campaign,
      id: `temp-${Date.now()}`,
      name: `${campaign.name} (Copy)`,
      status: "draft",
      sent_count: 0,
      delivered_count: 0,
      opened_count: 0,
      clicked_count: 0,
      converted_count: 0,
      scheduled_for: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCampaigns((prev) => [duplicate, ...prev]);
  }

  async function handleCancel(campaignId: string) {
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId ? { ...c, status: "cancelled" as const, updated_at: new Date().toISOString() } : c
      )
    );
  }

  function handleCampaignCreated(campaign: MarketingCampaign) {
    setCampaigns((prev) => [campaign, ...prev]);
    setShowCreate(false);
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalCampaigns}</p>
          <p className="text-sm text-gray-500">Total Campaigns</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeScheduled}</p>
          <p className="text-sm text-gray-500">Active / Scheduled</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <Send className="h-5 w-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalSent.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Sent</p>
        </div>
      </div>

      {/* Filter Pills + Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.id
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex-shrink-0"
        >
          {showCreate ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showCreate ? "Close" : "Create Campaign"}
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <CreateCampaignForm
          onCreated={handleCampaignCreated}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {/* Campaign List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">No campaigns found</h3>
          <p className="text-xs text-gray-500">
            {statusFilter === "all"
              ? "Create your first marketing campaign to get started."
              : `No campaigns with status "${statusFilter}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              expanded={expandedId === campaign.id}
              onToggle={() => handleToggleExpand(campaign.id)}
              onDuplicate={() => handleDuplicate(campaign)}
              onCancel={() => handleCancel(campaign.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Campaign Card                                                              */
/* -------------------------------------------------------------------------- */

function CampaignCard({
  campaign,
  expanded,
  onToggle,
  onDuplicate,
  onCancel,
}: {
  campaign: MarketingCampaign;
  expanded: boolean;
  onToggle: () => void;
  onDuplicate: () => void;
  onCancel: () => void;
}) {
  const openRate =
    campaign.delivered_count > 0
      ? Math.round((campaign.opened_count / campaign.delivered_count) * 100)
      : 0;
  const clickRate =
    campaign.opened_count > 0
      ? Math.round((campaign.clicked_count / campaign.opened_count) * 100)
      : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900 truncate">
              {campaign.name}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_STYLES[campaign.type]}`}
            >
              {campaign.type === "email" && <Mail className="h-3 w-3" />}
              {campaign.type === "sms" && <MessageSquare className="h-3 w-3" />}
              {campaign.type === "both" && <Mail className="h-3 w-3" />}
              {TYPE_LABELS[campaign.type]}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[campaign.status]}`}
            >
              {campaign.status}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              {AUDIENCE_LABELS[campaign.target_audience] || campaign.target_audience}
            </span>
            {campaign.scheduled_for && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(campaign.scheduled_for)}
              </span>
            )}
            {campaign.sent_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <Send className="h-3 w-3" />
                {campaign.sent_count.toLocaleString()} sent
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-5 border-t border-gray-100">
          {/* Content preview */}
          {campaign.content && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Content Preview</p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {campaign.subject && (
                  <p className="font-semibold mb-2">Subject: {campaign.subject}</p>
                )}
                {campaign.content}
              </div>
            </div>
          )}
          {campaign.sms_content && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 mb-1">SMS Content</p>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                {campaign.sms_content}
              </div>
            </div>
          )}

          {/* Detailed stats */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
            <StatCell label="Sent" value={campaign.sent_count} />
            <StatCell label="Delivered" value={campaign.delivered_count} />
            <StatCell
              label="Opened"
              value={campaign.opened_count}
              sub={openRate > 0 ? `${openRate}%` : undefined}
            />
            <StatCell
              label="Clicked"
              value={campaign.clicked_count}
              sub={clickRate > 0 ? `${clickRate}%` : undefined}
            />
            <StatCell label="Converted" value={campaign.converted_count} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </button>
            {campaign.status === "scheduled" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <p className="text-lg font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-xs text-gray-500">
        {label}
        {sub && <span className="ml-1 text-green-600">({sub})</span>}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Create Campaign Form                                                       */
/* -------------------------------------------------------------------------- */

function CreateCampaignForm({
  onCreated,
  onCancel,
}: {
  onCreated: (campaign: MarketingCampaign) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CampaignType>("email");
  const [audience, setAudience] = useState("all_customers");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [smsContent, setSmsContent] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [sendNow, setSendNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [creating, setCreating] = useState(false);
  const [generatingEmail, setGeneratingEmail] = useState(false);
  const [generatingSms, setGeneratingSms] = useState(false);

  const showEmail = type === "email" || type === "both";
  const showSms = type === "sms" || type === "both";
  const smsLength = smsContent.length;
  const smsOverLimit = smsLength > 160;

  const canSubmit =
    name.trim() &&
    (showEmail ? content.trim() : true) &&
    (showSms ? smsContent.trim() && !smsOverLimit : true) &&
    (!sendNow ? scheduledDate && scheduledTime : true);

  const generateContent = useCallback(
    async (target: "email" | "sms") => {
      const setter = target === "email" ? setContent : setSmsContent;
      const setLoading = target === "email" ? setGeneratingEmail : setGeneratingSms;

      setLoading(true);
      setter("");

      try {
        await streamFetch(
          "/api/admin/ai",
          {
            action: "campaign_content",
            campaignType: target,
            audience,
            tone: tone.toLowerCase(),
          },
          (chunk) => {
            setter((prev) => prev + chunk);
          }
        );
      } catch {
        setter("Failed to generate content. Please try again.");
      }

      setLoading(false);
    },
    [audience, tone]
  );

  async function handleCreate() {
    if (!canSubmit) return;
    setCreating(true);

    try {
      const scheduledFor =
        !sendNow && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : null;

      const res = await fetch("/api/admin/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          type,
          target_audience: audience,
          subject: showEmail ? subject.trim() || null : null,
          content: showEmail ? content.trim() : "",
          sms_content: showSms ? smsContent.trim() : null,
          scheduled_for: scheduledFor,
          status: sendNow ? "sending" : "scheduled",
        }),
      });

      if (!res.ok) throw new Error("Failed to create campaign");

      const data = await res.json();
      onCreated(data);
    } catch {
      // Keep form open so user can retry
    }

    setCreating(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h3 className="text-lg font-bold text-gray-900">New Campaign</h3>

      {/* Campaign name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Campaign Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Spring Cleaning Special"
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
        />
      </div>

      {/* Type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Campaign Type
        </label>
        <div className="flex gap-2">
          {(["email", "sms", "both"] as CampaignType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === t
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t === "email" && <Mail className="h-4 w-4" />}
              {t === "sms" && <MessageSquare className="h-4 w-4" />}
              {t === "both" && (
                <>
                  <Mail className="h-4 w-4" />
                  <MessageSquare className="h-4 w-4" />
                </>
              )}
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Target audience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Target Audience
        </label>
        <select
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
        >
          {AUDIENCES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      {/* Email fields */}
      {showEmail && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Line
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">
                Email Content
              </label>
              <button
                onClick={() => generateContent("email")}
                disabled={generatingEmail}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 transition-colors"
              >
                {generatingEmail ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate with AI
              </button>
            </div>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your email content..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>
        </div>
      )}

      {/* SMS fields */}
      {showSms && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              SMS Content
            </label>
            <button
              onClick={() => generateContent("sms")}
              disabled={generatingSms}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 transition-colors"
            >
              {generatingSms ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              Generate with AI
            </button>
          </div>
          <textarea
            rows={3}
            value={smsContent}
            onChange={(e) => setSmsContent(e.target.value)}
            placeholder="Write your SMS message..."
            maxLength={200}
            className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-900 focus:ring-2 outline-none transition-colors ${
              smsOverLimit
                ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-brand-500 focus:ring-brand-500/20"
            }`}
          />
          <p
            className={`text-xs mt-1 text-right ${
              smsOverLimit ? "text-red-500 font-medium" : "text-gray-400"
            }`}
          >
            {smsLength}/160 characters
          </p>
        </div>
      )}

      {/* Tone selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tone
        </label>
        <div className="flex gap-2 flex-wrap">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tone === t
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schedule
        </label>
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setSendNow(true)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              sendNow
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Send Now
          </button>
          <button
            onClick={() => setSendNow(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !sendNow
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Schedule
          </button>
        </div>
        {!sendNow && (
          <div className="flex gap-3">
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>
        )}
      </div>

      {/* Preview */}
      {(content.trim() || smsContent.trim()) && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Eye className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Preview</span>
          </div>
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-3 max-h-56 overflow-y-auto">
            {showEmail && content.trim() && (
              <div>
                {subject && (
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {subject}
                  </p>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {content}
                </p>
              </div>
            )}
            {showEmail && showSms && content.trim() && smsContent.trim() && (
              <hr className="border-gray-200" />
            )}
            {showSms && smsContent.trim() && (
              <div>
                <p className="text-xs font-medium text-purple-600 mb-1">SMS</p>
                <p className="text-sm text-gray-700">{smsContent}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleCreate}
          disabled={!canSubmit || creating}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Create Campaign
        </button>
      </div>
    </div>
  );
}
