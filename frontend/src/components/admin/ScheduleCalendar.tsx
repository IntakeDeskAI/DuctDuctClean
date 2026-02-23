"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import ScheduleJobModal from "@/components/admin/ScheduleJobModal";
import type { Technician, ContactSubmission } from "@/types";

interface ScheduleWithRelations {
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

interface LeadOption {
  id: string;
  name: string;
  service_type: string;
  address: string;
  phone: string;
  email: string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  notified: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  in_progress: "bg-purple-100 text-purple-700",
  completed: "bg-gray-100 text-gray-600",
};

const notifStatusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-3 w-3 text-gray-400" />,
  calling: <Phone className="h-3 w-3 text-yellow-500 animate-pulse" />,
  sms_sent: <CheckCircle2 className="h-3 w-3 text-blue-500" />,
  emailed: <CheckCircle2 className="h-3 w-3 text-blue-500" />,
  confirmed: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  failed: <AlertCircle className="h-3 w-3 text-red-500" />,
};

const serviceLabels: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  "dryer-vent": "Dryer Vent",
  "window-washing": "Windows",
};

function getWeekDays(startDateStr: string): Date[] {
  const start = new Date(startDateStr + "T00:00:00");
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

export default function ScheduleCalendar({
  initialSchedules,
  technicians,
  leads,
  weekStart,
}: {
  initialSchedules: ScheduleWithRelations[];
  technicians: Technician[];
  leads: LeadOption[];
  weekStart: string;
}) {
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState(weekStart);
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] =
    useState<ScheduleWithRelations | null>(null);
  const [loading, setLoading] = useState(false);

  const days = getWeekDays(currentWeekStart);
  const today = new Date().toISOString().split("T")[0];

  async function navigateWeek(direction: number) {
    const start = new Date(currentWeekStart + "T00:00:00");
    start.setDate(start.getDate() + direction * 7);
    const newStart = start.toISOString().split("T")[0];
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const newEnd = end.toISOString().split("T")[0];

    setLoading(true);
    setCurrentWeekStart(newStart);

    try {
      const res = await fetch(
        `/api/admin/schedules?start=${newStart}&end=${newEnd}`
      );
      if (res.ok) {
        const data = await res.json();
        setSchedules(data);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
    setLoading(false);
  }

  function getSchedulesForDay(dateStr: string): ScheduleWithRelations[] {
    return schedules
      .filter((s) => s.scheduled_date === dateStr)
      .sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
  }

  function handleDayClick(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedSchedule(null);
    setShowModal(true);
  }

  function handleScheduleClick(
    e: React.MouseEvent,
    schedule: ScheduleWithRelations
  ) {
    e.stopPropagation();
    setSelectedSchedule(schedule);
    setSelectedDate(schedule.scheduled_date);
    setShowModal(true);
  }

  function handleJobCreated() {
    setShowModal(false);
    setSelectedSchedule(null);
    router.refresh();
    // Refetch current week
    navigateWeek(0);
  }

  const weekLabel = (() => {
    const start = days[0];
    const end = days[6];
    const startMonth = start.toLocaleDateString("en-US", { month: "short" });
    const endMonth = end.toLocaleDateString("en-US", { month: "short" });
    const year = start.getFullYear();
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${year}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${year}`;
  })();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 min-w-[220px] text-center">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin inline" />
            ) : (
              weekLabel
            )}
          </h2>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={() => {
              const now = new Date();
              const dayOfWeek = now.getDay();
              const monday = new Date(now);
              monday.setDate(
                now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
              );
              setCurrentWeekStart(monday.toISOString().split("T")[0]);
              navigateWeek(0);
            }}
            className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => {
            setSelectedDate(today);
            setSelectedSchedule(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Schedule Job
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
        {/* Day Headers */}
        {days.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const isToday = dateStr === today;
          return (
            <div
              key={dateStr + "-header"}
              className={`bg-gray-50 px-3 py-2 text-center ${
                isToday ? "bg-brand-50" : ""
              }`}
            >
              <p className="text-xs font-medium text-gray-500 uppercase">
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </p>
              <p
                className={`text-lg font-semibold ${
                  isToday ? "text-brand-600" : "text-gray-900"
                }`}
              >
                {day.getDate()}
              </p>
            </div>
          );
        })}

        {/* Day Cells */}
        {days.map((day) => {
          const dateStr = day.toISOString().split("T")[0];
          const daySchedules = getSchedulesForDay(dateStr);
          const isToday = dateStr === today;
          const isPast = dateStr < today;

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className={`bg-white min-h-[140px] p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                isToday ? "bg-blue-50/30" : ""
              } ${isPast ? "opacity-60" : ""}`}
            >
              <div className="space-y-1.5">
                {daySchedules.map((schedule) => (
                  <button
                    key={schedule.id}
                    onClick={(e) => handleScheduleClick(e, schedule)}
                    className="w-full text-left rounded-lg p-2 transition-all hover:shadow-sm"
                    style={{
                      backgroundColor:
                        (schedule.technician?.color || "#3B82F6") + "15",
                      borderLeft: `3px solid ${
                        schedule.technician?.color || "#3B82F6"
                      }`,
                    }}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-xs font-semibold text-gray-900">
                        {formatTime(schedule.scheduled_time)}
                      </span>
                      {notifStatusIcons[schedule.notification_status]}
                    </div>
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {serviceLabels[schedule.lead?.service_type || ""] ||
                        schedule.lead?.service_type}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {schedule.lead?.name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {schedule.technician?.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
        <span className="font-medium text-gray-700">Status:</span>
        {Object.entries(statusColors).map(([status, classes]) => (
          <span
            key={status}
            className={`px-2 py-0.5 rounded-full capitalize ${classes}`}
          >
            {status.replace("_", " ")}
          </span>
        ))}
      </div>

      {/* Today's Detail View */}
      {getSchedulesForDay(today).length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Today&apos;s Jobs
          </h3>
          <div className="space-y-3">
            {getSchedulesForDay(today).map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4"
              >
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{
                    backgroundColor: schedule.technician?.color || "#3B82F6",
                  }}
                >
                  {schedule.technician?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatTime(schedule.scheduled_time)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        statusColors[schedule.status] || "bg-gray-100"
                      }`}
                    >
                      {schedule.status.replace("_", " ")}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {notifStatusIcons[schedule.notification_status]}
                      {schedule.notification_status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-0.5">
                    {serviceLabels[schedule.lead?.service_type || ""] ||
                      schedule.lead?.service_type}{" "}
                    &mdash; {schedule.technician?.name}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {schedule.lead?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {schedule.lead?.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {schedule.estimated_duration}min
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <ScheduleJobModal
          technicians={technicians}
          leads={leads}
          defaultDate={selectedDate || today}
          existingSchedule={selectedSchedule}
          onClose={() => {
            setShowModal(false);
            setSelectedSchedule(null);
          }}
          onSaved={handleJobCreated}
        />
      )}
    </div>
  );
}
