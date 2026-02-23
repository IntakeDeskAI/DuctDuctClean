import MarketingTools from "@/components/admin/MarketingTools";

export default function MarketingPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Marketing
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Generate email templates, social media posts, and blog ideas with AI
        </p>
      </div>

      <MarketingTools />
    </div>
  );
}
