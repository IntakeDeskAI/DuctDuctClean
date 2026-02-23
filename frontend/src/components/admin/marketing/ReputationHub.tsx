"use client";

import { useState } from "react";
import {
  Star,
  Send,
  Sparkles,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { streamFetch } from "@/lib/ai/stream-client";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface ReputationHubProps {
  reviews: {
    total: number;
    average: number;
    distribution: Record<string, number>;
  };
}

type ReviewType = "positive" | "negative";
type Tone = "professional" | "friendly" | "urgent" | "seasonal";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

const TONES: { key: Tone; label: string }[] = [
  { key: "professional", label: "Professional" },
  { key: "friendly", label: "Friendly" },
  { key: "urgent", label: "Urgent" },
  { key: "seasonal", label: "Seasonal" },
];

const STAR_ROWS = ["5", "4", "3", "2", "1"] as const;

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function ReputationHub({ reviews }: ReputationHubProps) {
  // --- Review request state ---
  const [reqEmail, setReqEmail] = useState("");
  const [reqName, setReqName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState("");

  // --- AI response generator state ---
  const [reviewType, setReviewType] = useState<ReviewType>("positive");
  const [reviewText, setReviewText] = useState("");
  const [tone, setTone] = useState<Tone>("professional");
  const [aiResult, setAiResult] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  /* ---------------------------------------------------------------------- */
  /*  Handlers                                                               */
  /* ---------------------------------------------------------------------- */

  async function handleSendRequest() {
    if (!reqEmail.trim() || sending) return;
    setSending(true);
    setSendError("");
    setSent(false);

    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: reqEmail.trim(),
          toName: reqName.trim() || undefined,
          subject: "How was your DuctDuctClean experience?",
          body: "We'd love your feedback! Please leave us a review on Google.",
        }),
      });

      if (!res.ok) throw new Error("Failed to send");
      setSent(true);
      setReqEmail("");
      setReqName("");
    } catch {
      setSendError("Failed to send review request. Please try again.");
    }

    setSending(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setAiResult("");
    setCopied(false);

    try {
      await streamFetch(
        "/api/admin/ai",
        {
          action: "review_response",
          reviewType,
          reviewText: reviewText.trim() || undefined,
          tone,
        },
        (chunk) => {
          setAiResult((prev) => prev + chunk);
        }
      );
    } catch {
      setAiResult("Failed to generate response. Please try again.");
    }

    setGenerating(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(aiResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  /* ---------------------------------------------------------------------- */
  /*  Derived values                                                         */
  /* ---------------------------------------------------------------------- */

  const ratingPercent = (reviews.average / 5) * 100;
  const maxDistCount = Math.max(
    ...STAR_ROWS.map((r) => reviews.distribution[r] ?? 0),
    1
  );

  /* ---------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="space-y-8">
      {/* ================================================================ */}
      {/*  SECTION 1 : Review Stats Overview                               */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Star className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">Review Overview</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: Rating ring + number */}
          <div className="flex flex-col items-center justify-center gap-3">
            {/* Conic gradient progress ring */}
            <div
              className="relative h-32 w-32 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(
                  #7c3aed ${ratingPercent * 3.6}deg,
                  #e5e7eb ${ratingPercent * 3.6}deg 360deg
                )`,
              }}
            >
              <div className="h-24 w-24 rounded-full bg-white flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-gray-900">
                  {reviews.average.toFixed(1)}
                </span>
                <span className="text-xs text-gray-500">out of 5</span>
              </div>
            </div>
            <StarRating rating={reviews.average} />
            <p className="text-sm text-gray-500">
              {reviews.total.toLocaleString()} total reviews
            </p>
          </div>

          {/* Right: Star distribution bars */}
          <div className="flex-1 space-y-3">
            {STAR_ROWS.map((star) => {
              const count = reviews.distribution[star] ?? 0;
              const barPercent =
                maxDistCount > 0 ? (count / maxDistCount) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-8 text-right">
                    {star}
                  </span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-brand-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10 text-right tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/*  SECTION 2 : Quick Send Review Request                           */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Send className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Send Review Request
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Send a quick email to a customer asking them to leave a review on
          Google.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={reqEmail}
              onChange={(e) => {
                setReqEmail(e.target.value);
                setSent(false);
                setSendError("");
              }}
              placeholder="customer@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              placeholder="John Smith"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={!reqEmail.trim() || sending}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {sending ? "Sending..." : "Send Review Request"}
          </button>

          {sent && (
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
              <Check className="h-4 w-4" />
              Review request sent!
            </span>
          )}

          {sendError && (
            <span className="text-sm text-red-600">{sendError}</span>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/*  SECTION 3 : AI Review Response Generator                        */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">
            AI Review Response Generator
          </h2>
        </div>

        {/* Review type toggle */}
        <div className="mb-4">
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

        {/* Customer review text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Review Text{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={3}
            placeholder="Paste the customer review here to generate a tailored response..."
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors resize-none"
          />
        </div>

        {/* Tone selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tone
          </label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTone(t.key)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
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
          onClick={handleGenerate}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50"
        >
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {generating ? "Generating..." : "Generate Response"}
        </button>

        {/* Streaming result */}
        {aiResult && (
          <div className="mt-6">
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-6 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {aiResult}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/*  SECTION 4 : Google Business Profile Link                        */}
      {/* ================================================================ */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-bold text-gray-900">
            Google Business Profile
          </h2>
        </div>

        <p className="text-sm text-gray-500 mb-5">
          Manage your Google Business reviews, respond to customers, and update
          your business profile directly on Google.
        </p>

        <a
          href="https://business.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Open Google Business Profile
        </a>
      </div>
    </div>
  );
}
