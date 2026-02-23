"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Wrench,
  UserCheck,
  UserX,
} from "lucide-react";
import TechnicianForm from "@/components/admin/TechnicianForm";
import type { Technician } from "@/types";

interface TechnicianWithJobs extends Technician {
  jobs_today: number;
}

const serviceLabels: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  "dryer-vent": "Dryer Vent",
  "window-washing": "Window Washing",
};

const notifIcons: Record<string, React.ReactNode> = {
  all: <span className="flex items-center gap-1"><Phone className="h-3 w-3" /><MessageSquare className="h-3 w-3" /><Mail className="h-3 w-3" /></span>,
  phone: <Phone className="h-3 w-3" />,
  sms: <MessageSquare className="h-3 w-3" />,
  email: <Mail className="h-3 w-3" />,
};

export default function TechnicianList({
  technicians: initialTechnicians,
}: {
  technicians: TechnicianWithJobs[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editingTech, setEditingTech] = useState<Technician | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const filtered = showInactive
    ? initialTechnicians
    : initialTechnicians.filter((t) => t.is_active);

  function handleSaved() {
    setShowForm(false);
    setEditingTech(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {filtered.length} technician{filtered.length !== 1 ? "s" : ""}
          </span>
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Show inactive
          </label>
        </div>
        <button
          onClick={() => {
            setEditingTech(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Technician
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Wrench className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No technicians yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Add your first technician to start scheduling jobs
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tech) => (
            <button
              key={tech.id}
              onClick={() => {
                setEditingTech(tech);
                setShowForm(true);
              }}
              className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-brand-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: tech.color }}
                >
                  {tech.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {tech.name}
                    </h3>
                    {tech.is_active ? (
                      <UserCheck className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    ) : (
                      <UserX className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{tech.phone}</p>
                </div>
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {tech.services.map((s) => (
                  <span
                    key={s}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                  >
                    {serviceLabels[s] || s}
                  </span>
                ))}
              </div>

              {/* Footer stats */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  {notifIcons[tech.notification_preference]}
                  <span className="capitalize">
                    {tech.notification_preference === "all"
                      ? "All channels"
                      : tech.notification_preference}
                  </span>
                </div>
                <div className="text-xs">
                  <span
                    className={`font-semibold ${
                      tech.jobs_today >= tech.max_jobs_per_day
                        ? "text-red-600"
                        : "text-gray-900"
                    }`}
                  >
                    {tech.jobs_today}
                  </span>
                  <span className="text-gray-400">
                    /{tech.max_jobs_per_day} today
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <TechnicianForm
          technician={editingTech}
          onClose={() => {
            setShowForm(false);
            setEditingTech(null);
          }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
