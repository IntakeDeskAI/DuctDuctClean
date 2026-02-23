"use client";

import { useState } from "react";
import {
  Sparkles,
  Mail,
  FileText,
  ListChecks,
  Loader2,
  Copy,
  Check,
} from "lucide-react";
import { streamFetch } from "@/lib/ai/stream-client";
import type { ContactSubmission } from "@/types";

interface AIAssistantPanelProps {
  lead: ContactSubmission;
}

const actions = [
  { key: "draft_response", label: "Draft Response", icon: Mail },
  { key: "summarize", label: "Summarize", icon: FileText },
  { key: "suggest_next_steps", label: "Next Steps", icon: ListChecks },
] as const;

export default function AIAssistantPanel({ lead }: AIAssistantPanelProps) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [customInstructions, setCustomInstructions] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleAction(action: string) {
    setLoading(true);
    setActiveAction(action);
    setResult("");

    try {
      await streamFetch(
        "/api/admin/ai",
        {
          action,
          leadId: lead.id,
          customInstructions: customInstructions || undefined,
        },
        (chunk) => {
          setResult((prev) => prev + chunk);
        }
      );
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h2 className="text-lg font-bold text-gray-900">AI Assistant</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.key && loading;
          return (
            <button
              key={action.key}
              onClick={() => handleAction(action.key)}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                activeAction === action.key
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {isActive ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
              {action.label}
            </button>
          );
        })}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          placeholder="Optional: Add custom instructions..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-colors"
        />
      </div>

      {result && (
        <div className="relative">
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {result}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
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
