"use client";

import { useState } from "react";
import {
  Target,
  Sparkles,
  Tag,
  Star,
  Zap,
} from "lucide-react";
import type {
  MarketingCampaign,
  ContentLibraryItem,
  MarketingCoupon,
  MarketingActionLog,
} from "@/types";
import CampaignManager from "./marketing/CampaignManager";
import ContentStudio from "./marketing/ContentStudio";
import PromotionManager from "./marketing/PromotionManager";
import ReputationHub from "./marketing/ReputationHub";
import QuickActions from "./marketing/QuickActions";

interface MarketingHubProps {
  campaigns: MarketingCampaign[];
  savedContent: ContentLibraryItem[];
  coupons: MarketingCoupon[];
  actions: MarketingActionLog[];
  reviewStats: {
    total: number;
    average: number;
    distribution: Record<string, number>;
  };
}

const tabs = [
  { key: "campaigns", label: "Campaigns", icon: Target },
  { key: "content", label: "Content Studio", icon: Sparkles },
  { key: "promotions", label: "Promotions", icon: Tag },
  { key: "reputation", label: "Reputation", icon: Star },
  { key: "quick-actions", label: "Quick Actions", icon: Zap },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function MarketingHub({
  campaigns,
  savedContent,
  coupons,
  actions,
  reviewStats,
}: MarketingHubProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("campaigns");

  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
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

      {/* Tab Content */}
      <div>
        {activeTab === "campaigns" && (
          <CampaignManager campaigns={campaigns} />
        )}
        {activeTab === "content" && (
          <ContentStudio savedContent={savedContent} />
        )}
        {activeTab === "promotions" && (
          <PromotionManager coupons={coupons} />
        )}
        {activeTab === "reputation" && (
          <ReputationHub reviews={reviewStats} />
        )}
        {activeTab === "quick-actions" && (
          <QuickActions actions={actions} />
        )}
      </div>
    </div>
  );
}
