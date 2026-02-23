"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, Phone, Mail, CalendarDays, HardHat, Megaphone, BookOpen, Settings, LogOut, BarChart3 } from "lucide-react";

type BadgeKey = "leads" | "calls" | "emails" | "schedules" | "technicians";

const navItems: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badgeKey?: BadgeKey;
}[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Leads", href: "/admin/leads", icon: Users, badgeKey: "leads" },
  { label: "Schedule", href: "/admin/schedule", icon: CalendarDays, badgeKey: "schedules" },
  { label: "Technicians", href: "/admin/technicians", icon: HardHat, badgeKey: "technicians" },
  { label: "Phone", href: "/admin/phone", icon: Phone },
  { label: "Email", href: "/admin/email", icon: Mail },
  { label: "Marketing", href: "/admin/marketing", icon: Megaphone },
  { label: "Blog", href: "/admin/blog", icon: BookOpen },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/admin/counts");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch {
        // silently fail
      }
    }
    fetchCounts();
    // Refresh counts every 60 seconds
    const interval = setInterval(fetchCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 bg-brand-950 min-h-screen flex flex-col">
      <div className="p-6 border-b border-brand-800">
        <Link href="/admin" className="text-lg font-bold font-display text-white">
          DuctDuctClean
        </Link>
        <p className="text-xs text-brand-400 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const count = item.badgeKey ? counts[item.badgeKey] : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-800 text-white"
                  : "text-brand-300 hover:bg-brand-900 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="flex-1">{item.label}</span>
              {count !== undefined && count > 0 && (
                <span
                  className={`min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-semibold px-1.5 ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : item.badgeKey === "leads"
                      ? "bg-red-500/90 text-white"
                      : "bg-brand-800 text-brand-200"
                  }`}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-brand-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-brand-300 hover:bg-brand-900 hover:text-white transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
