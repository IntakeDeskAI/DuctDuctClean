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
} from "lucide-react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
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
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes }),
    });

    if (res.ok) {
      router.refresh();
    }
    setSaving(false);
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
          </div>
        </div>
      </div>

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

        {/* Status + Notes */}
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

          <div className="mb-6">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Internal Notes
            </label>
            <textarea
              id="notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this lead..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
