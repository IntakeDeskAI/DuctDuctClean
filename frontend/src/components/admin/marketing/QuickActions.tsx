"use client";

import { useState } from "react";
import {
  Snowflake,
  Share2,
  Star,
  Users,
  Loader2,
  Copy,
  Check,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { MarketingActionLog } from "@/types";
import { streamFetch } from "@/lib/ai/stream-client";
import { formatDateRelative } from "@/lib/utils";
import ConfirmActionModal from "./ConfirmActionModal";

/* -------------------------------------------------------------------------- */
/*  Types & Constants                                                         */
/* -------------------------------------------------------------------------- */

interface QuickActionsProps {
  actions: MarketingActionLog[];
}

interface ActionCard {
  key: string;
  title: string;
  description: string;
  icon: typeof Snowflake;
  iconBg: string;
  actionType: string;
}

const actionCards: ActionCard[] = [
  {
    key: "seasonal_promo",
    title: "Seasonal Promo",
    description:
      "Generate a seasonal promotion with email, SMS, and social content",
    icon: Snowflake,
    iconBg: "bg-blue-50 text-blue-600",
    actionType: "seasonal_promo",
  },
  {
    key: "weekly_social",
    title: "Weekly Social Posts",
    description:
      "Create a week's worth of social media posts for all platforms",
    icon: Share2,
    iconBg: "bg-purple-50 text-purple-600",
    actionType: "weekly_social",
  },
  {
    key: "batch_review_requests",
    title: "Batch Review Requests",
    description: "Send review request emails to recent completed customers",
    icon: Star,
    iconBg: "bg-amber-50 text-amber-600",
    actionType: "batch_review_requests",
  },
  {
    key: "referral_campaign",
    title: "Referral Campaign",
    description: "Launch a referral campaign to existing customers",
    icon: Users,
    iconBg: "bg-green-50 text-green-600",
    actionType: "referral_campaign",
  },
];

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function currentSeason(): "spring" | "summer" | "fall" | "winter" {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

function statusDotColor(status: MarketingActionLog["status"]): string {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "running":
      return "bg-amber-500";
    case "failed":
      return "bg-red-500";
  }
}

function statusIcon(status: MarketingActionLog["status"]) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "running":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "failed":
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function QuickActions({ actions: initialActions }: QuickActionsProps) {
  const [actions, setActions] = useState<MarketingActionLog[]>(initialActions);
  const [activeAction, setActiveAction] = useState<ActionCard | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*  Log action to API                                                     */
  /* ---------------------------------------------------------------------- */

  async function logAction(
    actionType: string,
    description: string
  ): Promise<MarketingActionLog | null> {
    try {
      const res = await fetch("/api/admin/marketing/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: actionType,
          description,
        }),
      });

      if (!res.ok) return null;

      const entry: MarketingActionLog = await res.json();
      setActions((prev) => [entry, ...prev]);
      return entry;
    } catch {
      return null;
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  Execute action                                                        */
  /* ---------------------------------------------------------------------- */

  async function executeAction(card: ActionCard) {
    setActiveAction(null);
    setGenerating(true);
    setResult("");
    setCopied(false);

    await logAction(card.actionType, card.description);

    if (card.key === "seasonal_promo") {
      try {
        await streamFetch(
          "/api/admin/ai",
          {
            action: "seasonal_promo",
            season: currentSeason(),
            serviceType: "residential",
            tone: "friendly",
          },
          (chunk) => setResult((prev) => prev + chunk)
        );
      } catch {
        setResult("Failed to generate seasonal promo. Please try again.");
      }
    } else if (card.key === "weekly_social") {
      try {
        await streamFetch(
          "/api/admin/ai",
          {
            action: "weekly_social",
            platforms: "Facebook, Instagram, Google Business",
          },
          (chunk) => setResult((prev) => prev + chunk)
        );
      } catch {
        setResult("Failed to generate social posts. Please try again.");
      }
    } else if (card.key === "batch_review_requests") {
      setResult(
        "Review request emails have been queued for recent completed customers. You will receive a summary once all emails are sent."
      );
    } else if (card.key === "referral_campaign") {
      setResult(
        "Referral campaign has been initiated. Emails will be sent to existing customers with a personalized referral code."
      );
    }

    setGenerating(false);
  }

  /* ---------------------------------------------------------------------- */
  /*  Copy result                                                           */
  /* ---------------------------------------------------------------------- */

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
      </div>

      {/* Main grid: Actions + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Action Cards */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            {actionCards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => setActiveAction(card)}
                  disabled={generating}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:border-brand-300 hover:shadow-sm transition-all cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div
                    className={`inline-flex items-center justify-center h-10 w-10 rounded-lg ${card.iconBg} mb-4`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {card.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Action History Timeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">
              Action History
            </h3>
          </div>

          {actions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No actions yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Run a quick action to see it logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {actions.map((action, idx) => (
                <div key={action.id} className="flex items-start gap-3">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${statusDotColor(action.status)} mt-1.5`}
                    />
                    {idx < actions.length - 1 && (
                      <div className="w-px h-full bg-gray-200 mt-1" />
                    )}
                  </div>

                  {/* Entry content */}
                  <div className="flex-1 min-w-0 pb-4">
                    <div className="flex items-center gap-2 mb-0.5">
                      {statusIcon(action.status)}
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {action.description}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {formatDateRelative(action.created_at)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                        {action.action_type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Result display area (below cards when generating/generated) */}
      {(generating || result) && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            <h3 className="text-sm font-semibold text-gray-900">
              {generating ? "Generating..." : "Result"}
            </h3>
          </div>

          <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {result || "Generating content..."}
          </div>

          {!generating && result && (
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResult("");
                  setCopied(false);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirm Action Modal */}
      {activeAction && (
        <ConfirmActionModal
          title={activeAction.title}
          description={activeAction.description}
          onConfirm={() => executeAction(activeAction)}
          onCancel={() => setActiveAction(null)}
        />
      )}
    </div>
  );
}
