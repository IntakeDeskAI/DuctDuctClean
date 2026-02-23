"use client";

import { useState } from "react";
import {
  Mail,
  Share2,
  BookOpen,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { streamFetch } from "@/lib/ai/stream-client";

type Tab = "email" | "social" | "blog";

const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
  { key: "email", label: "Email Templates", icon: Mail },
  { key: "social", label: "Social Posts", icon: Share2 },
  { key: "blog", label: "Blog Ideas", icon: BookOpen },
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

export default function MarketingTools() {
  const [activeTab, setActiveTab] = useState<Tab>("email");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email tab state
  const [serviceType, setServiceType] = useState("residential");

  // Social tab state
  const [platform, setPlatform] = useState("facebook");
  const [topic, setTopic] = useState("");

  async function generate(body: Record<string, unknown>) {
    setLoading(true);
    setResult("");

    try {
      await streamFetch("/api/admin/ai", body, (chunk) => {
        setResult((prev) => prev + chunk);
      });
    } catch {
      setResult("Failed to generate content. Please try again.");
    }

    setLoading(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setResult("");
              }}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Email Tab */}
      {activeTab === "email" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Generate Email Template
          </h3>
          <div className="mb-4">
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
          <button
            onClick={() =>
              generate({ action: "email_template", serviceType })
            }
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Generate Template
          </button>
        </div>
      )}

      {/* Social Tab */}
      {activeTab === "social" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Generate Social Post
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="flex gap-2">
              {platforms.map((p) => (
                <button
                  key={p.value}
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
          <div className="mb-4">
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
          <button
            onClick={() =>
              generate({
                action: "social_post",
                platform,
                topic: topic || undefined,
              })
            }
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            Generate Post
          </button>
        </div>
      )}

      {/* Blog Tab */}
      {activeTab === "blog" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Generate Blog Topic Ideas
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Generate SEO-optimized blog topics tailored to DuctDuctClean&apos;s
            services and the Idaho Falls market.
          </p>
          <button
            onClick={() => generate({ action: "blog_ideas" })}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <BookOpen className="h-4 w-4" />
            )}
            Generate Topics
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="relative mt-6">
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
            {result}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
