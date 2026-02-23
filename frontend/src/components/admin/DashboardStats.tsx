import { Users, UserPlus, MessageSquare, TrendingUp } from "lucide-react";
import type { ContactSubmission } from "@/types";

interface DashboardStatsProps {
  leads: ContactSubmission[];
}

export default function DashboardStats({ leads }: DashboardStatsProps) {
  const total = leads.length;
  const newCount = leads.filter((l) => l.status === "new").length;
  const contactedCount = leads.filter((l) => l.status === "contacted").length;
  const convertedCount = leads.filter((l) => l.status === "converted").length;

  const stats = [
    {
      label: "Total Leads",
      value: total,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "New",
      value: newCount,
      icon: UserPlus,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Contacted",
      value: contactedCount,
      icon: MessageSquare,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Converted",
      value: convertedCount,
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
