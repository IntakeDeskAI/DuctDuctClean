"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
} from "lucide-react";
import type { EmailLog as EmailLogType } from "@/types";
import { formatDate } from "@/lib/utils";

const templateLabels: Record<string, string> = {
  new_lead_admin: "Admin Notification",
  thank_you: "Thank You",
  follow_up_1h: "1h Follow-Up",
  quote_follow_up: "Quote Follow-Up",
  review_request: "Review Request",
  re_engagement: "Re-Engagement",
  referral_invite: "Referral Invite",
  manual: "Manual",
};

const filterTabs = [
  { id: "all", label: "All" },
  { id: "new_lead_admin", label: "Notifications" },
  { id: "thank_you", label: "Thank You" },
  { id: "follow_up", label: "Follow-Ups" },
  { id: "review_request", label: "Reviews" },
  { id: "re_engagement", label: "Re-Engagement" },
  { id: "manual", label: "Manual" },
];

interface EmailLogProps {
  emails: EmailLogType[];
}

export default function EmailLog({ emails }: EmailLogProps) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);

  const filtered =
    activeFilter === "all"
      ? emails
      : activeFilter === "follow_up"
        ? emails.filter(
            (e) =>
              e.template === "follow_up_1h" ||
              e.template === "quote_follow_up"
          )
        : emails.filter((e) => e.template === activeFilter);

  const statusIcon = (status: string) => {
    switch (status) {
      case "sent":
      case "delivered":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "bounced":
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tab.id
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors flex-shrink-0 ml-4"
        >
          <Plus className="h-4 w-4" />
          Compose
        </button>
      </div>

      {/* Email Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              No emails yet
            </h3>
            <p className="text-xs text-gray-500">
              Emails will appear here as they are sent automatically or
              manually.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((email) => (
              <div key={email.id}>
                <button
                  onClick={() =>
                    setExpandedId(
                      expandedId === email.id ? null : email.id
                    )
                  }
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {statusIcon(email.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {email.subject}
                      </p>
                      <span className="flex-shrink-0 text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {templateLabels[email.template] || email.template}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      To: {email.to_name ? `${email.to_name} <${email.to_email}>` : email.to_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {formatDate(email.created_at)}
                    </span>
                    {expandedId === email.id ? (
                      <ChevronUp className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedId === email.id && (
                  <div className="px-6 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                        <div>
                          <span className="text-gray-500">Status:</span>{" "}
                          <span className="font-medium text-gray-700 capitalize">
                            {email.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">From:</span>{" "}
                          <span className="font-medium text-gray-700">
                            {email.from_email}
                          </span>
                        </div>
                        {email.resend_id && (
                          <div>
                            <span className="text-gray-500">Resend ID:</span>{" "}
                            <span className="font-mono text-gray-700">
                              {email.resend_id}
                            </span>
                          </div>
                        )}
                      </div>
                      {email.body_preview && (
                        <div className="border-t border-gray-200 pt-3 mt-3">
                          <p className="text-xs text-gray-500 mb-1">
                            Preview:
                          </p>
                          <p className="text-sm text-gray-700">
                            {email.body_preview}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <ComposeModal onClose={() => setShowCompose(false)} />
      )}
    </div>
  );
}

function ComposeModal({ onClose }: { onClose: () => void }) {
  const [to, setTo] = useState("");
  const [toName, setToName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!to || !subject || !body) return;
    setSending(true);
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, toName: toName || undefined, subject, body }),
    });
    if (res.ok) {
      setSent(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Compose Email</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Email
              </label>
              <input
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="customer@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (optional)
              </label>
              <input
                type="text"
                value={toName}
                onChange={(e) => setToName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={8}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent || !to || !subject || !body}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {sent ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Sent!
              </>
            ) : sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
