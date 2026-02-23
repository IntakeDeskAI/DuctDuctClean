"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";
import type { Technician } from "@/types";

const serviceOptions = [
  { value: "residential", label: "Residential Duct Cleaning" },
  { value: "commercial", label: "Commercial HVAC Vent Cleaning" },
  { value: "dryer-vent", label: "Dryer Vent Cleaning" },
  { value: "window-washing", label: "Window Washing" },
];

const notifOptions = [
  { value: "all", label: "All Channels", description: "Phone call + SMS + Email" },
  { value: "phone", label: "Phone Call", description: "Bland AI call only" },
  { value: "sms", label: "SMS", description: "Text message only" },
  { value: "email", label: "Email", description: "Email only" },
];

const colorOptions = [
  "#3B82F6", "#EF4444", "#10B981", "#F59E0B",
  "#8B5CF6", "#EC4899", "#06B6D4", "#F97316",
];

interface TechnicianFormProps {
  technician: Technician | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TechnicianForm({
  technician,
  onClose,
  onSaved,
}: TechnicianFormProps) {
  const isEdit = Boolean(technician);
  const [name, setName] = useState(technician?.name || "");
  const [phone, setPhone] = useState(technician?.phone || "");
  const [email, setEmail] = useState(technician?.email || "");
  const [services, setServices] = useState<string[]>(
    technician?.services || ["residential"]
  );
  const [maxJobs, setMaxJobs] = useState(
    technician?.max_jobs_per_day?.toString() || "4"
  );
  const [notifPref, setNotifPref] = useState(
    technician?.notification_preference || "all"
  );
  const [color, setColor] = useState(technician?.color || "#3B82F6");
  const [isActive, setIsActive] = useState(technician?.is_active ?? true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function toggleService(value: string) {
    setServices((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || services.length === 0) return;

    setSaving(true);
    const payload = {
      name,
      phone,
      email: email || null,
      services,
      max_jobs_per_day: parseInt(maxJobs) || 4,
      notification_preference: notifPref,
      color,
      is_active: isActive,
    };

    const url = isEdit
      ? `/api/admin/technicians/${technician!.id}`
      : "/api/admin/technicians";

    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      onSaved();
    } else {
      const err = await res.json();
      alert(err.error || "Failed to save technician");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!technician) return;
    if (!confirm(`Deactivate ${technician.name}? They won't appear in scheduling.`)) return;

    setDeleting(true);
    const res = await fetch(`/api/admin/technicians/${technician.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      onSaved();
    }
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            {isEdit ? "Edit Technician" : "Add Technician"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &#10005;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="John Smith"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+12085551234"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              Include country code, e.g. +1208...
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Services *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {serviceOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    services.includes(opt.value)
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={services.includes(opt.value)}
                    onChange={() => toggleService(opt.value)}
                    className="rounded border-gray-300 text-brand-600"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Max Jobs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Jobs Per Day
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxJobs}
              onChange={(e) => setMaxJobs(e.target.value)}
              className="w-24 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none"
            />
          </div>

          {/* Notification Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Preference
            </label>
            <div className="space-y-2">
              {notifOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    notifPref === opt.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="notifPref"
                    value={opt.value}
                    checked={notifPref === opt.value}
                    onChange={(e) => setNotifPref(e.target.value as "all" | "phone" | "sms" | "email")}
                    className="text-brand-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calendar Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full transition-all ${
                    color === c
                      ? "ring-2 ring-offset-2 ring-brand-500 scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Active Toggle (edit only) */}
          {isEdit && (
            <div className="flex items-center justify-between py-3 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Active</p>
                <p className="text-xs text-gray-500">
                  Inactive techs won&apos;t appear in scheduling
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  isActive ? "bg-brand-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Deactivate
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
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name || !phone || services.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Update" : "Add Technician"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
