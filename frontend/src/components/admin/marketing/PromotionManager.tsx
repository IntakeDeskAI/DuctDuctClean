"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Tag,
  ShoppingCart,
  DollarSign,
  Clock,
  Copy,
  Check,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";
import { streamFetch } from "@/lib/ai/stream-client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MarketingCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  service_type: string | null;
  expires_at: string | null;
  is_active: boolean;
  revenue_generated: number;
  created_at: string;
  updated_at: string;
}

interface PromotionManagerProps {
  coupons: MarketingCoupon[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SERVICE_OPTIONS = [
  { value: "", label: "All Services" },
  { value: "residential", label: "Residential Ducts" },
  { value: "commercial", label: "Commercial" },
  { value: "dryer-vent", label: "Dryer Vent" },
  { value: "window-washing", label: "Window Washing" },
] as const;

interface QuickPreset {
  label: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
}

const QUICK_PRESETS: QuickPreset[] = [
  { label: "10% Off", discountType: "percentage", discountValue: 10 },
  { label: "15% Off", discountType: "percentage", discountValue: 15 },
  { label: "$25 Off", discountType: "fixed", discountValue: 25 },
  { label: "$50 Off", discountType: "fixed", discountValue: 50 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 6; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `DUCT-${random}`;
}

function isExpired(coupon: MarketingCoupon): boolean {
  if (!coupon.expires_at) return false;
  return new Date(coupon.expires_at) < new Date();
}

function isExpiringSoon(coupon: MarketingCoupon): boolean {
  if (!coupon.expires_at) return false;
  const expiresAt = new Date(coupon.expires_at);
  const now = new Date();
  if (expiresAt <= now) return false;
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return expiresAt.getTime() - now.getTime() <= sevenDays;
}

function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDiscount(coupon: MarketingCoupon): string {
  if (coupon.discount_type === "percentage") {
    return `${coupon.discount_value}% off`;
  }
  return `$${coupon.discount_value} off`;
}

function formatExpiration(expiresAt: string): string {
  return new Date(expiresAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function serviceLabel(serviceType: string | null): string {
  if (!serviceType) return "";
  const match = SERVICE_OPTIONS.find((s) => s.value === serviceType);
  return match ? match.label : serviceType;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function PromotionManager({ coupons: initialCoupons }: PromotionManagerProps) {
  const [coupons, setCoupons] = useState<MarketingCoupon[]>(initialCoupons);
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formServiceType, setFormServiceType] = useState("");
  const [formMaxUses, setFormMaxUses] = useState("");
  const [formExpiresAt, setFormExpiresAt] = useState("");
  const [formDescription, setFormDescription] = useState("");

  // Loading states
  const [creating, setCreating] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---- Computed stats ---- */

  const stats = useMemo(() => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeCoupons = coupons.filter(
      (c) => c.is_active && !isExpired(c)
    ).length;

    const totalRedeemed = coupons.reduce((sum, c) => sum + c.current_uses, 0);

    const revenueGenerated = coupons.reduce(
      (sum, c) => sum + c.revenue_generated,
      0
    );

    const expiringSoon = coupons.filter(
      (c) =>
        c.is_active &&
        c.expires_at &&
        new Date(c.expires_at) > now &&
        new Date(c.expires_at) <= sevenDaysFromNow
    ).length;

    return { activeCoupons, totalRedeemed, revenueGenerated, expiringSoon };
  }, [coupons]);

  const statCards = [
    {
      label: "Active Coupons",
      value: String(stats.activeCoupons),
      icon: Tag,
      color: "bg-brand-100 text-brand-600",
    },
    {
      label: "Total Redeemed",
      value: String(stats.totalRedeemed),
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Revenue Generated",
      value: formatCurrency(stats.revenueGenerated),
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Expiring Soon",
      value: String(stats.expiringSoon),
      icon: Clock,
      color: "bg-red-100 text-red-600",
    },
  ];

  /* ---- Filtered lists ---- */

  const filteredCoupons = useMemo(() => {
    if (activeTab === "active") {
      return coupons.filter((c) => c.is_active && !isExpired(c));
    }
    return coupons.filter((c) => !c.is_active || isExpired(c));
  }, [coupons, activeTab]);

  /* ---- Form actions ---- */

  function resetForm() {
    setFormCode("");
    setFormDiscountType("percentage");
    setFormDiscountValue("");
    setFormServiceType("");
    setFormMaxUses("");
    setFormExpiresAt("");
    setFormDescription("");
  }

  function openForm(preset?: QuickPreset) {
    resetForm();
    if (preset) {
      setFormDiscountType(preset.discountType);
      setFormDiscountValue(String(preset.discountValue));
    }
    setFormCode(generateCode());
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleGenerateDescription() {
    if (!formDiscountValue) return;
    setGeneratingDescription(true);
    setFormDescription("");
    try {
      await streamFetch(
        "/api/admin/ai",
        {
          action: "coupon_description",
          discountType: formDiscountType,
          discountValue: Number(formDiscountValue),
          serviceType: formServiceType || "all",
        },
        (chunk) => {
          setFormDescription((prev) => prev + chunk);
        }
      );
    } catch {
      setFormDescription("Failed to generate description. Please try again.");
    }
    setGeneratingDescription(false);
  }

  async function handleCreate() {
    if (!formCode || !formDiscountValue) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/marketing/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: formCode.toUpperCase(),
          discount_type: formDiscountType,
          discount_value: Number(formDiscountValue),
          service_type: formServiceType || null,
          max_uses: formMaxUses ? Number(formMaxUses) : null,
          expires_at: formExpiresAt || null,
          description: formDescription || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to create coupon");

      const newCoupon: MarketingCoupon = await res.json();
      setCoupons((prev) => [newCoupon, ...prev]);
      closeForm();
    } catch {
      // Error is surfaced by the form remaining open
    }

    setCreating(false);
  }

  /* ---- Coupon actions ---- */

  const handleToggle = useCallback(async (coupon: MarketingCoupon) => {
    setTogglingId(coupon.id);
    try {
      const res = await fetch("/api/admin/marketing/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, is_active: !coupon.is_active }),
      });

      if (!res.ok) throw new Error("Failed to update coupon");

      setCoupons((prev) =>
        prev.map((c) =>
          c.id === coupon.id ? { ...c, is_active: !c.is_active } : c
        )
      );
    } catch {
      // Silently fail; state not changed
    }
    setTogglingId(null);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch("/api/admin/marketing/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed to delete coupon");

      setCoupons((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // Silently fail
    }
    setDeletingId(null);
  }, []);

  async function handleCopyCode(code: string, id: string) {
    await navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  /* ---- Render ---- */

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
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

      {/* Quick Create Buttons */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Quick Create
        </h3>
        <div className="flex flex-wrap gap-2">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.label}
              onClick={() => openForm(preset)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Tag className="h-3.5 w-3.5" />
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => openForm()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Custom
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">
              Create New Coupon
            </h3>
            <button
              onClick={closeForm}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="DUCT-XXXXXX"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono tracking-wider text-gray-900 uppercase focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setFormCode(generateCode())}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
                  title="Auto-generate code"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormDiscountType("percentage")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    formDiscountType === "percentage"
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setFormDiscountType("fixed")}
                  className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                    formDiscountType === "fixed"
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Fixed ($)
                </button>
              </div>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Discount Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                  {formDiscountType === "fixed" ? "$" : "%"}
                </span>
                <input
                  type="number"
                  value={formDiscountValue}
                  onChange={(e) => setFormDiscountValue(e.target.value)}
                  placeholder={formDiscountType === "fixed" ? "25" : "10"}
                  min="0"
                  className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Service Type
              </label>
              <select
                value={formServiceType}
                onChange={(e) => setFormServiceType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              >
                {SERVICE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Uses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max Uses
              </label>
              <input
                type="number"
                value={formMaxUses}
                onChange={(e) => setFormMaxUses(e.target.value)}
                placeholder="Unlimited"
                min="1"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              />
            </div>

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Expiration Date
              </label>
              <input
                type="date"
                value={formExpiresAt}
                onChange={(e) => setFormExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={generatingDescription || !formDiscountValue}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {generatingDescription ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                Generate with AI
              </button>
            </div>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={3}
              placeholder="A short promotional description for this coupon..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !formCode || !formDiscountValue}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Coupon
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Active
          <span className="ml-1.5 text-xs text-gray-400">
            ({coupons.filter((c) => c.is_active && !isExpired(c)).length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("expired")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            activeTab === "expired"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Expired
          <span className="ml-1.5 text-xs text-gray-400">
            ({coupons.filter((c) => !c.is_active || isExpired(c)).length})
          </span>
        </button>
      </div>

      {/* Coupon List */}
      {filteredCoupons.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">
            {activeTab === "active"
              ? "No active coupons. Create one above to get started."
              : "No expired coupons."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon);
            const expiringSoon = isExpiringSoon(coupon);
            const usagePercent =
              coupon.max_uses !== null && coupon.max_uses > 0
                ? Math.min(
                    Math.round((coupon.current_uses / coupon.max_uses) * 100),
                    100
                  )
                : null;

            return (
              <div
                key={coupon.id}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Code & details */}
                  <div className="flex-1 min-w-0">
                    {/* Code row */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-lg font-bold tracking-wider text-gray-900">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(coupon.code, coupon.id)}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors"
                        title="Copy code"
                      >
                        {copiedId === coupon.id ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      {/* Discount badge */}
                      <span className="inline-flex items-center rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                        {formatDiscount(coupon)}
                      </span>
                      {/* Service badge */}
                      {coupon.service_type && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          {serviceLabel(coupon.service_type)}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {coupon.description && (
                      <p className="text-sm text-gray-500 mb-3">
                        {coupon.description}
                      </p>
                    )}

                    {/* Metadata row */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                      {/* Usage */}
                      <div className="flex items-center gap-2">
                        <span>
                          {coupon.current_uses}
                          {coupon.max_uses !== null
                            ? ` / ${coupon.max_uses} used`
                            : " used"}
                        </span>
                        {coupon.max_uses === null && (
                          <span className="text-gray-400">(Unlimited)</span>
                        )}
                      </div>

                      {/* Revenue */}
                      <span>
                        Revenue:{" "}
                        <span className="font-medium text-gray-700">
                          {formatCurrency(coupon.revenue_generated)}
                        </span>
                      </span>

                      {/* Expiration */}
                      {coupon.expires_at && (
                        <span className="flex items-center gap-1">
                          {expired ? (
                            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                              Expired
                            </span>
                          ) : expiringSoon ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                              <AlertTriangle className="h-3 w-3" />
                              Expiring soon!
                            </span>
                          ) : (
                            <span>
                              Expires {formatExpiration(coupon.expires_at)}
                            </span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Usage progress bar */}
                    {usagePercent !== null && (
                      <div className="mt-3 w-full max-w-xs">
                        <div className="bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-brand-500 rounded-full h-2 transition-all duration-300"
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(coupon)}
                      disabled={togglingId === coupon.id}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                        coupon.is_active ? "bg-brand-600" : "bg-gray-300"
                      }`}
                      role="switch"
                      aria-checked={coupon.is_active}
                      aria-label={
                        coupon.is_active
                          ? "Deactivate coupon"
                          : "Activate coupon"
                      }
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          coupon.is_active ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      disabled={deletingId === coupon.id}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete coupon"
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
