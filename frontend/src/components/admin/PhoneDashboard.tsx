"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  Clock,
  Users,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";
import type { CallLog } from "@/types";
import { formatDate } from "@/lib/utils";

interface PhoneDashboardProps {
  calls: CallLog[];
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
}

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  transferred: "bg-blue-100 text-blue-700",
  voicemail: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  no_answer: "bg-gray-100 text-gray-600",
};

export default function PhoneDashboard({ calls }: PhoneDashboardProps) {
  const router = useRouter();
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [configuring, setConfiguring] = useState(false);
  const [setupResult, setSetupResult] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  // Stats
  const totalCalls = calls.length;
  const avgDuration =
    totalCalls > 0
      ? Math.round(
          calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0) /
            totalCalls
        )
      : 0;
  const leadsGenerated = calls.filter(
    (c) => c.contact_submission_id
  ).length;

  async function handlePurchase() {
    setPurchasing(true);
    setSetupResult(null);
    try {
      const res = await fetch("/api/admin/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purchase_number", area_code: "208" }),
      });
      const data = await res.json();
      if (data.phone_number) {
        setPhoneNumber(data.phone_number);
        setSetupResult(`Number purchased: ${data.phone_number}`);
      } else {
        setSetupResult(
          `Error: ${data.message || data.error || JSON.stringify(data)}`
        );
      }
    } catch (err) {
      setSetupResult(`Error: ${String(err)}`);
    }
    setPurchasing(false);
  }

  async function handleConfigure() {
    if (!phoneNumber) {
      setSetupResult("Enter the phone number first");
      return;
    }
    setConfiguring(true);
    setSetupResult(null);
    try {
      const res = await fetch("/api/admin/phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "configure_agent",
          phone_number: phoneNumber,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setSetupResult("Agent configured successfully!");
        router.refresh();
      } else {
        setSetupResult(
          `Error: ${data.message || data.error || JSON.stringify(data)}`
        );
      }
    } catch (err) {
      setSetupResult(`Error: ${String(err)}`);
    }
    setConfiguring(false);
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Phone className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalCalls}</p>
              <p className="text-xs text-gray-500">Total Calls</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-accent-50 flex items-center justify-center">
              <Clock className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(avgDuration)}
              </p>
              <p className="text-xs text-gray-500">Avg Duration</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {leadsGenerated}
              </p>
              <p className="text-xs text-gray-500">Leads Generated</p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Agent Setup
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <button
            onClick={handlePurchase}
            disabled={purchasing}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {purchasing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Phone className="h-4 w-4" />
            )}
            Buy 208 Number ($15/mo)
          </button>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+12081234567"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none w-44"
            />
            <button
              onClick={handleConfigure}
              disabled={configuring || !phoneNumber}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {configuring ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Configure Agent
            </button>
          </div>
        </div>
        {setupResult && (
          <p className="mt-3 text-sm text-gray-700">{setupResult}</p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          Purchase a 208 area code number, then configure the AI agent. Only
          needed once.
        </p>
      </div>

      {/* Call History */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Call History</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Date
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Caller
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Duration
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Service
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {calls.map((call) => (
              <>
                <tr key={call.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(call.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {call.caller_name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {call.phone_number}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDuration(call.duration_seconds)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 capitalize">
                    {call.service_interested || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        statusColors[call.status] || statusColors.completed
                      }`}
                    >
                      {call.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        setExpandedCall(
                          expandedCall === call.id ? null : call.id
                        )
                      }
                      className="text-sm text-brand-600 hover:text-brand-800 font-medium inline-flex items-center gap-1"
                    >
                      {expandedCall === call.id ? (
                        <>
                          Hide <ChevronUp className="h-3 w-3" />
                        </>
                      ) : (
                        <>
                          View <ChevronDown className="h-3 w-3" />
                        </>
                      )}
                    </button>
                  </td>
                </tr>
                {expandedCall === call.id && (
                  <tr key={`${call.id}-detail`}>
                    <td colSpan={6} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-3">
                        {call.summary && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Summary
                            </p>
                            <p className="text-sm text-gray-700">
                              {call.summary}
                            </p>
                          </div>
                        )}
                        {call.transcript && (
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                              Transcript
                            </p>
                            <div className="bg-white rounded-lg border border-gray-200 p-4 text-sm text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap">
                              {call.transcript}
                            </div>
                          </div>
                        )}
                        {call.contact_submission_id && (
                          <a
                            href={`/admin/leads/${call.contact_submission_id}`}
                            className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-800 font-medium"
                          >
                            View Lead <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {calls.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-sm text-gray-500"
                >
                  No calls yet. Set up your phone agent above to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
