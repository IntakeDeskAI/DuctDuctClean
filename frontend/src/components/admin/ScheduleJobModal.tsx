"use client";

import { useState } from "react";
import { Loader2, Bell, BellOff, Calendar, Clock, User, Wrench } from "lucide-react";
import type { Technician, ContactSubmission } from "@/types";

interface LeadOption {
  id: string;
  name: string;
  service_type: string;
  address: string;
  phone: string;
  email: string;
}

interface ExistingSchedule {
  id: string;
  contact_submission_id: string;
  technician_id: string;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration: number;
  status: string;
  notification_status: string;
  notes: string | null;
  technician?: Technician;
  lead?: ContactSubmission;
}

const serviceLabels: Record<string, string> = {
  residential: "Residential Duct Cleaning",
  commercial: "Commercial HVAC Vent Cleaning",
  "dryer-vent": "Dryer Vent Cleaning",
  "window-washing": "Window Washing",
};

interface ScheduleJobModalProps {
  technicians: Technician[];
  leads: LeadOption[];
  defaultDate: string;
  existingSchedule: ExistingSchedule | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ScheduleJobModal({
  technicians,
  leads,
  defaultDate,
  existingSchedule,
  onClose,
  onSaved,
}: ScheduleJobModalProps) {
  const isEdit = Boolean(existingSchedule);

  const [leadId, setLeadId] = useState(
    existingSchedule?.contact_submission_id || ""
  );
  const [techId, setTechId] = useState(
    existingSchedule?.technician_id || ""
  );
  const [date, setDate] = useState(
    existingSchedule?.scheduled_date || defaultDate
  );
  const [time, setTime] = useState(
    existingSchedule?.scheduled_time || "09:00"
  );
  const [duration, setDuration] = useState(
    existingSchedule?.estimated_duration?.toString() || "120"
  );
  const [notes, setNotes] = useState(existingSchedule?.notes || "");
  const [notifyNow, setNotifyNow] = useState(!isEdit);
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");

  const filteredLeads = leadSearch
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(leadSearch.toLowerCase()) ||
          l.address.toLowerCase().includes(leadSearch.toLowerCase())
      )
    : leads;

  const selectedLead = leads.find((l) => l.id === leadId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!leadId || !techId || !date || !time) return;

    setSaving(true);

    if (isEdit) {
      // Update existing schedule
      const res = await fetch(`/api/admin/schedules/${existingSchedule!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technician_id: techId,
          scheduled_date: date,
          scheduled_time: time,
          estimated_duration: parseInt(duration) || 120,
          notes: notes || null,
        }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update schedule");
      }
    } else {
      // Create new schedule
      const res = await fetch("/api/admin/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_submission_id: leadId,
          technician_id: techId,
          scheduled_date: date,
          scheduled_time: time,
          estimated_duration: parseInt(duration) || 120,
          notes: notes || null,
          notify_now: notifyNow,
        }),
      });

      if (res.ok) {
        onSaved();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to schedule job");
      }
    }
    setSaving(false);
  }

  async function handleCancel() {
    if (!existingSchedule) return;
    if (!confirm("Cancel this job? The technician will not be notified of the cancellation.")) return;

    setCancelling(true);
    const res = await fetch(`/api/admin/schedules/${existingSchedule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" }),
    });

    if (res.ok) {
      onSaved();
    }
    setCancelling(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Job" : "Schedule Job"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Lead Selection */}
          {!isEdit ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Customer / Lead *
              </label>
              <input
                type="text"
                placeholder="Search by name or address..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm mb-2 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
              <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredLeads.length === 0 ? (
                  <p className="text-sm text-gray-400 p-3 text-center">
                    No leads found
                  </p>
                ) : (
                  filteredLeads.map((lead) => (
                    <button
                      key={lead.id}
                      type="button"
                      onClick={() => {
                        setLeadId(lead.id);
                        setLeadSearch("");
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors ${
                        leadId === lead.id ? "bg-brand-50" : ""
                      }`}
                    >
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">
                        {serviceLabels[lead.service_type] || lead.service_type}{" "}
                        &middot; {lead.address}
                      </p>
                    </button>
                  ))
                )}
              </div>
              {selectedLead && (
                <div className="mt-2 p-3 bg-brand-50 rounded-lg">
                  <p className="text-sm font-medium text-brand-900">
                    {selectedLead.name}
                  </p>
                  <p className="text-xs text-brand-700">
                    {serviceLabels[selectedLead.service_type] ||
                      selectedLead.service_type}{" "}
                    &middot; {selectedLead.address}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {existingSchedule?.lead?.name}
              </p>
              <p className="text-xs text-gray-500">
                {serviceLabels[existingSchedule?.lead?.service_type || ""] ||
                  existingSchedule?.lead?.service_type}{" "}
                &middot; {existingSchedule?.lead?.address}
              </p>
            </div>
          )}

          {/* Technician */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Wrench className="h-4 w-4 inline mr-1" />
              Assign Technician *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {technicians.map((tech) => (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => setTechId(tech.id)}
                  className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-colors ${
                    techId === tech.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ backgroundColor: tech.color }}
                  >
                    {tech.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {tech.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tech.notification_preference === "all"
                        ? "All channels"
                        : tech.notification_preference}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="h-4 w-4 inline mr-1" />
                Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            >
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="150">2.5 hours</option>
              <option value="180">3 hours</option>
              <option value="240">4 hours</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          {/* Notify Toggle (create only) */}
          {!isEdit && (
            <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
              <div className="flex items-center gap-3">
                {notifyNow ? (
                  <Bell className="h-5 w-5 text-brand-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {notifyNow ? "Notify Immediately" : "Schedule Only"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {notifyNow
                      ? "Technician will be notified via their preferred channels now"
                      : "No notification sent — you can notify later"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={notifyNow}
                onClick={() => setNotifyNow(!notifyNow)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  notifyNow ? "bg-brand-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
                    notifyNow ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Edit: Status info */}
          {isEdit && existingSchedule && (
            <div className="flex items-center gap-4 py-3 bg-gray-50 rounded-lg px-4">
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {existingSchedule.status.replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Notification</p>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {existingSchedule.notification_status.replace("_", " ")}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEdit ? (
              <button
                type="button"
                onClick={handleCancel}
                disabled={
                  cancelling || existingSchedule?.status === "cancelled"
                }
                className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Cancel Job"
                )}
              </button>
            ) : (
              <div />
            )}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={saving || !leadId || !techId || !date || !time}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit
                  ? "Update"
                  : notifyNow
                  ? "Schedule & Notify"
                  : "Schedule"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
