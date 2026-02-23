"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Wrench,
  Calendar,
  MessageSquare,
  Loader2,
  DollarSign,
  CheckCircle2,
  Share2,
  Send,
  CalendarPlus,
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import AIAssistantPanel from "@/components/admin/AIAssistantPanel";
import type { ContactSubmission } from "@/types";
import { formatDate } from "@/lib/utils";
import { formatPhone } from "@/lib/utils";

const statuses = ["new", "contacted", "quoted", "converted", "closed"];

interface LeadDetailProps {
  lead: ContactSubmission;
}

export default function LeadDetail({ lead }: LeadDetailProps) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [notes, setNotes] = useState(lead.notes || "");
  const [revenue, setRevenue] = useState(lead.revenue?.toString() || "");
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  async function handleSave() {
    setSaving(true);
    const payload: Record<string, unknown> = { status, notes };
    if (revenue) {
      payload.revenue = parseFloat(revenue);
    }
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
  }

  async function handleMarkCompleted() {
    if (!revenue || parseFloat(revenue) <= 0) {
      alert("Please enter the revenue amount before marking as completed.");
      return;
    }
    setCompleting(true);
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "converted",
        completed_at: new Date().toISOString(),
        revenue: parseFloat(revenue),
        notes,
      }),
    });

    if (res.ok) {
      setStatus("converted");
      router.refresh();
    }
    setCompleting(false);
  }

  const infoItems = [
    { icon: User, label: "Name", value: lead.name },
    { icon: Mail, label: "Email", value: lead.email, href: `mailto:${lead.email}` },
    { icon: Phone, label: "Phone", value: formatPhone(lead.phone), href: `tel:${lead.phone}` },
    { icon: MapPin, label: "Address", value: lead.address },
    {
      icon: Wrench,
      label: "Service",
      value: lead.service_type.replace("-", " "),
    },
    { icon: Calendar, label: "Submitted", value: formatDate(lead.created_at) },
  ];

  return (
    <div>
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Leads
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">
            {lead.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge status={lead.status} />
            <span className="text-sm text-gray-500">
              {formatDate(lead.created_at)}
            </span>
            {lead.referral_source && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                <Share2 className="h-3 w-3" />
                Referral
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/schedule?lead=${lead.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <CalendarPlus className="h-4 w-4" />
            Schedule Job
          </Link>
          <button
            onClick={() => setShowEmailModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <Send className="h-4 w-4" />
            Send Email
          </button>
        </div>
      </div>

      {/* Completion Banner */}
      {lead.completed_at && (
        <div className="mb-6 bg-green-50 rounded-xl border border-green-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h3 className="text-sm font-semibold text-green-800">
              Job Completed
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 mt-3">
            <div>
              <p className="text-xs text-green-600">Completed</p>
              <p className="text-sm font-medium text-green-900">
                {formatDate(lead.completed_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-green-600">Revenue</p>
              <p className="text-sm font-medium text-green-900">
                ${(lead.revenue || 0).toLocaleString()}
              </p>
            </div>
            {lead.referral_code && (
              <div>
                <p className="text-xs text-green-600">Referral Code</p>
                <p className="text-sm font-bold text-green-900 tracking-wide">
                  {lead.referral_code}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Contact Information
          </h2>
          <div className="space-y-4">
            {infoItems.map((item) => {
              const Icon = item.icon;
              const content = (
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 capitalize">
                      {item.value}
                    </p>
                  </div>
                </div>
              );
              if ("href" in item && item.href) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors"
                  >
                    {content}
                  </a>
                );
              }
              return <div key={item.label}>{content}</div>;
            })}
          </div>

          {lead.message && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <p className="text-xs text-gray-500">Message</p>
              </div>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                {lead.message}
              </p>
            </div>
          )}
        </div>

        {/* Status + Notes + Revenue */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Update Lead
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s as ContactSubmission["status"])}
                  className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                    status === s
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Revenue Input */}
          <div className="mb-6">
            <label
              htmlFor="revenue"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Revenue
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="revenue"
                type="number"
                min="0"
                step="0.01"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Internal Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
            {!lead.completed_at && (
              <button
                onClick={handleMarkCompleted}
                disabled={completing}
                className="rounded-lg bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {completing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Complete
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <AIAssistantPanel lead={lead} />

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          lead={lead}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
}

function EmailModal({
  lead,
  onClose,
}: {
  lead: ContactSubmission;
  onClose: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSend() {
    if (!subject || !body) return;
    setSending(true);
    const res = await fetch("/api/admin/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: lead.email,
        toName: lead.name,
        subject,
        body,
        contactSubmissionId: lead.id,
      }),
    });
    if (res.ok) {
      setSent(true);
      setTimeout(onClose, 1500);
    }
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Email {lead.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To
            </label>
            <p className="text-sm text-gray-500">{lead.email}</p>
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
              rows={6}
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
            disabled={sending || sent || !subject || !body}
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
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
