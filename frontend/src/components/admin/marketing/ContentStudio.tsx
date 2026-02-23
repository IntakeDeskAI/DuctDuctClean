"use client";

import { useState, useCallback } from "react";
import {
  Mail,
  Share2,
  MessageSquare,
  BookOpen,
  Snowflake,
  Star,
  Globe,
  Loader2,
  Copy,
  Check,
  Search,
  Trash2,
  Sparkles,
  Save,
  Heart,
} from "lucide-react";
import { streamFetch } from "@/lib/ai/stream-client";
import { formatDate } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ContentLibraryItem {
  id: string;
  type:
    | "email"
    | "social"
    | "sms"
    | "promo"
    | "blog_idea"
    | "review_response"
    | "google_post";
  platform: string | null;
  tone: "professional" | "friendly" | "urgent" | "seasonal";
  title: string | null;
  content: string;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
}

interface ContentStudioProps {
  savedContent: ContentLibraryItem[];
}

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

type ContentType =
  | "email"
  | "social"
  | "sms"
  | "blog"
  | "seasonal"
  | "review"
  | "google";

type Tone = "professional" | "friendly" | "urgent" | "seasonal";

const contentTypes: { key: ContentType; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "Email Template", icon: Mail },
  { key: "social", label: "Social Post", icon: Share2 },
  { key: "sms", label: "SMS Template", icon: MessageSquare },
  { key: "blog", label: "Blog Ideas", icon: BookOpen },
  { key: "seasonal", label: "Seasonal Promo", icon: Snowflake },
  { key: "review", label: "Review Response", icon: Star },
  { key: "google", label: "Google Business Post", icon: Globe },
];

const tones: { key: Tone; label: string }[] = [
  { key: "professional", label: "Professional" },
  { key: "friendly", label: "Friendly" },
  { key: "urgent", label: "Urgent" },
  { key: "seasonal", label: "Seasonal" },
];

const serviceTypes = [
  { value: "residential", label: "Residential Duct Cleaning" },
  { value: "commercial", label: "Commercial HVAC Cleaning" },
  { value: "dryer-vent", label: "Dryer Vent Cleaning" },
  { value: "window-washing", label: "Window Washing" },
];

const platforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "google-business", label: "Google Business" },
];

const seasons = [
  { value: "spring", label: "Spring" },
  { value: "summer", label: "Summer" },
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
];

type LibraryFilter =
  | "all"
  | "email"
  | "social"
  | "sms"
  | "promo"
  | "blog_idea"
  | "review_response"
  | "google_post";

const libraryFilters: { key: LibraryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "email", label: "Email" },
  { key: "social", label: "Social" },
  { key: "sms", label: "SMS" },
  { key: "promo", label: "Promo" },
  { key: "blog_idea", label: "Blog" },
  { key: "review_response", label: "Review" },
  { key: "google_post", label: "Google" },
];

const typeBadgeColors: Record<ContentLibraryItem["type"], string> = {
  email: "bg-blue-100 text-blue-700",
  social: "bg-purple-100 text-purple-700",
  sms: "bg-green-100 text-green-700",
  promo: "bg-orange-100 text-orange-700",
  blog_idea: "bg-amber-100 text-amber-700",
  review_response: "bg-rose-100 text-rose-700",
  google_post: "bg-cyan-100 text-cyan-700",
};

const typeLabelMap: Record<ContentLibraryItem["type"], string> = {
  email: "Email",
  social: "Social",
  sms: "SMS",
  promo: "Promo",
  blog_idea: "Blog",
  review_response: "Review",
  google_post: "Google",
};

const toneBadgeColors: Record<Tone, string> = {
  professional: "bg-slate-100 text-slate-700",
  friendly: "bg-emerald-100 text-emerald-700",
  urgent: "bg-red-100 text-red-700",
  seasonal: "bg-amber-100 text-amber-700",
};

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function contentTypeToLibraryType(ct: ContentType): ContentLibraryItem["type"] {
  const map: Record<ContentType, ContentLibraryItem["type"]> = {
    email: "email",
    social: "social",
    sms: "sms",
    blog: "blog_idea",
    seasonal: "promo",
    review: "review_response",
    google: "google_post",
  };
  return map[ct];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ContentStudio({ savedContent }: ContentStudioProps) {
  // --- Generator state ---
  const [activeType, setActiveType] = useState<ContentType>("email");
  const [tone, setTone] = useState<Tone>("professional");
  const [result, setResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Per-type form state
  const [serviceType, setServiceType] = useState("residential");
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic] = useState("");
  const [season, setSeason] = useState("spring");
  const [reviewType, setReviewType] = useState<"positive" | "negative">(
    "positive"
  );
  const [reviewText, setReviewText] = useState("");

  // --- Library state ---
  const [library, setLibrary] = useState<ContentLibraryItem[]>(savedContent);
  const [libraryFilter, setLibraryFilter] = useState<LibraryFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  /* ---------------------------------------------------------------------- */
  /*  Generate                                                              */
  /* ---------------------------------------------------------------------- */

  const generate = useCallback(async () => {
    setGenerating(true);
    setResult("");
    setSaved(false);

    let body: Record<string, unknown>;

    switch (activeType) {
      case "email":
        body = { action: "email_template", serviceType, tone };
        break;
      case "social":
        body = {
          action: "social_post",
          platform,
          topic: topic || undefined,
          tone,
        };
        break;
      case "sms":
        body = { action: "sms_template", serviceType, tone };
        break;
      case "blog":
        body = { action: "blog_ideas" };
        break;
      case "seasonal":
        body = { action: "seasonal_promo", season, serviceType, tone };
        break;
      case "review":
        body = {
          action: "review_response",
          reviewType,
          reviewText: reviewText || undefined,
        };
        break;
      case "google":
        body = {
          action: "google_business_post",
          topic: topic || undefined,
          tone,
        };
        break;
    }

    try {
      await streamFetch("/api/admin/ai", body, (chunk) => {
        setResult((prev) => prev + chunk);
      });
    } catch {
      setResult("Failed to generate content. Please try again.");
    }

    setGenerating(false);
  }, [
    activeType,
    tone,
    serviceType,
    platform,
    topic,
    season,
    reviewType,
    reviewText,
  ]);

  /* ---------------------------------------------------------------------- */
  /*  Copy / Save                                                           */
  /* ---------------------------------------------------------------------- */

  async function handleCopyResult() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveToLibrary() {
    if (!result || saving) return;
    setSaving(true);

    try {
      const res = await fetch("/api/admin/marketing/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: contentTypeToLibraryType(activeType),
          platform: activeType === "social" ? platform : null,
          tone,
          title: null,
          content: result,
        }),
      });

      if (!res.ok) throw new Error("Save failed");

      const item: ContentLibraryItem = await res.json();
      setLibrary((prev) => [item, ...prev]);
      setSaved(true);
    } catch {
      // Silently fail -- user can try again
    }

    setSaving(false);
  }

  /* ---------------------------------------------------------------------- */
  /*  Library actions                                                       */
  /* ---------------------------------------------------------------------- */

  async function handleToggleFavorite(item: ContentLibraryItem) {
    const updated = !item.is_favorite;

    // Optimistic update
    setLibrary((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_favorite: updated } : i))
    );

    try {
      await fetch("/api/admin/marketing/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, is_favorite: updated }),
      });
    } catch {
      // Revert on failure
      setLibrary((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, is_favorite: !updated } : i
        )
      );
    }
  }

  async function handleDelete(id: string) {
    const previous = library;

    // Optimistic removal
    setLibrary((prev) => prev.filter((i) => i.id !== id));

    try {
      const res = await fetch("/api/admin/marketing/content", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setLibrary(previous);
    }
  }

  async function handleCopyCard(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedCardId(id);
    setTimeout(() => setCopiedCardId(null), 2000);
  }

  /* ---------------------------------------------------------------------- */
  /*  Filtered library                                                      */
  /* ---------------------------------------------------------------------- */

  const filteredLibrary = library.filter((item) => {
    if (libraryFilter !== "all" && item.type !== libraryFilter) return false;
    if (showFavoritesOnly && !item.is_favorite) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesContent = item.content.toLowerCase().includes(q);
      const matchesTitle = item.title?.toLowerCase().includes(q);
      const matchesTags = item.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchesContent && !matchesTitle && !matchesTags) return false;
    }
    return true;
  });

  /* ---------------------------------------------------------------------- */
  /*  Render helpers                                                        */
  /* ---------------------------------------------------------------------- */

  function renderTypeForm() {
    switch (activeType) {
      case "email":
      case "sms":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            >
              {serviceTypes.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "social":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform
              </label>
              <div className="flex gap-2">
                {platforms.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlatform(p.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      platform === p.value
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic (optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Spring cleaning special, Indoor air quality tips..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              />
            </div>
          </div>
        );

      case "blog":
        return (
          <p className="text-sm text-gray-500">
            Generate SEO-optimized blog topic ideas tailored to
            DuctDuctClean&apos;s services and the Idaho Falls market.
          </p>
        );

      case "seasonal":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              >
                {seasons.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
              >
                {serviceTypes.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Type
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewType("positive")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reviewType === "positive"
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Positive
                </button>
                <button
                  type="button"
                  onClick={() => setReviewType("negative")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    reviewType === "negative"
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Negative
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Review Text (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder="Paste the customer review here to generate a tailored response..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors resize-none"
              />
            </div>
          </div>
        );

      case "google":
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Topic (optional)
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Holiday hours, New service announcement, Before & after showcase..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>
        );
    }
  }

  /* ---------------------------------------------------------------------- */
  /*  Main render                                                           */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/*  SECTION 1 : AI Content Generator                                */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">
            AI Content Generator
          </h2>
        </div>

        {/* Content type pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {contentTypes.map((ct) => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.key}
                type="button"
                onClick={() => {
                  setActiveType(ct.key);
                  setResult("");
                  setSaved(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeType === ct.key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {ct.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic form */}
        <div className="mb-6">{renderTypeForm()}</div>

        {/* Tone selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTone(t.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tone === t.key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : "Generate Content"}
        </button>

        {/* Streaming result display */}
        {result && (
          <div className="mt-6">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {result}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleCopyResult}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleSaveToLibrary}
                disabled={saving || saved}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : saved ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? "Saving..." : saved ? "Saved" : "Save to Library"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  SECTION 2 : Saved Content Library                               */}
      {/* ================================================================ */}
      <div>
        <div className="border-t border-gray-200 mb-8" />

        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">Content Library</h2>
          <span className="ml-auto text-sm text-gray-500">
            {filteredLibrary.length}{" "}
            {filteredLibrary.length === 1 ? "item" : "items"}
          </span>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Type filter pills */}
          <div className="flex flex-wrap gap-1.5">
            {libraryFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setLibraryFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  libraryFilter === f.key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 sm:ml-auto">
            {/* Search input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search content..."
                className="rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors w-48"
              />
            </div>

            {/* Favorites toggle */}
            <button
              type="button"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                showFavoritesOnly
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Show favorites only"
            >
              <Heart
                className={`h-4 w-4 ${showFavoritesOnly ? "fill-amber-500" : ""}`}
              />
              Favorites
            </button>
          </div>
        </div>

        {/* Content grid */}
        {filteredLibrary.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {library.length === 0
                ? "No saved content yet"
                : "No content matches your filters"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {library.length === 0
                ? "Generate content above and save it to build your library."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredLibrary.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col"
              >
                {/* Card header: badges + actions */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${typeBadgeColors[item.type]}`}
                    >
                      {typeLabelMap[item.type]}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneBadgeColors[item.tone]}`}
                    >
                      {item.tone}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(item)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 hover:bg-amber-50 transition-colors"
                      title={
                        item.is_favorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${
                          item.is_favorite
                            ? "fill-amber-400 text-amber-400"
                            : ""
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCopyCard(item.content, item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Copy content"
                    >
                      {copiedCardId === item.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Title or content preview */}
                <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                  {item.title || item.content.slice(0, 80)}
                </p>
                {item.title && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {item.content.slice(0, 120)}
                    {item.content.length > 120 ? "..." : ""}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {formatDate(item.created_at)}
                  </span>
                  {item.tags.length > 0 && (
                    <div className="flex gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
