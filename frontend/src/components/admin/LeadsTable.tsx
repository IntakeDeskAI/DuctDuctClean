"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import Badge from "@/components/ui/Badge";
import type { ContactSubmission } from "@/types";
import { formatDate } from "@/lib/utils";
import { formatPhone } from "@/lib/utils";

const statusTabs = ["all", "new", "contacted", "quoted", "converted", "closed"];

interface LeadsTableProps {
  leads: ContactSubmission[];
}

export default function LeadsTable({ leads }: LeadsTableProps) {
  const [activeTab, setActiveTab] = useState("all");

  const filtered =
    activeTab === "all"
      ? leads
      : leads.filter((l) => l.status === activeTab);

  return (
    <div>
      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize whitespace-nowrap transition-colors ${
              activeTab === tab
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}{" "}
            <span className="text-xs">
              ({tab === "all" ? leads.length : leads.filter((l) => l.status === tab).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Name
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Contact
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Service
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No leads found.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{lead.email}</p>
                      <p className="text-xs text-gray-500">
                        {formatPhone(lead.phone)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 capitalize">
                        {lead.service_type.replace("-", " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge status={lead.status} />
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500">
                        {formatDate(lead.created_at)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
