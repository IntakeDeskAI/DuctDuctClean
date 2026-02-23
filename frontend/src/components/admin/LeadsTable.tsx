"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, DollarSign, Calendar } from "lucide-react";
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
  const [view, setView] = useState<"leads" | "customers">("leads");

  const isCustomerView = view === "customers";
  const customers = leads.filter(
    (l) => l.status === "converted" && l.completed_at
  );

  const filtered = isCustomerView
    ? customers
    : activeTab === "all"
      ? leads
      : leads.filter((l) => l.status === activeTab);

  return (
    <div>
      {/* View Toggle */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView("leads")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "leads"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All Leads
          </button>
          <button
            onClick={() => setView("customers")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              view === "customers"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Customers ({customers.length})
          </button>
        </div>
      </div>

      {/* Status Tabs (leads view only) */}
      {!isCustomerView && (
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
      )}

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
                {isCustomerView ? (
                  <>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Revenue
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Completed
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Days Since
                    </th>
                  </>
                ) : (
                  <>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Status
                    </th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                      Date
                    </th>
                  </>
                )}
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isCustomerView ? 7 : 6}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    {isCustomerView
                      ? "No completed customers yet."
                      : "No leads found."}
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </p>
                      {lead.referral_code && isCustomerView && (
                        <p className="text-xs text-purple-600 font-medium mt-0.5">
                          {lead.referral_code}
                        </p>
                      )}
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
                    {isCustomerView ? (
                      <>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                            <DollarSign className="h-3.5 w-3.5" />
                            {(lead.revenue || 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {lead.completed_at
                              ? formatDate(lead.completed_at)
                              : "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">
                            {lead.completed_at
                              ? `${Math.floor(
                                  (Date.now() -
                                    new Date(lead.completed_at).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                )} days`
                              : "—"}
                          </p>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4">
                          <Badge status={lead.status} />
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-500">
                            {formatDate(lead.created_at)}
                          </p>
                        </td>
                      </>
                    )}
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
