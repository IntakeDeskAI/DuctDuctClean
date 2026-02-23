import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display text-gray-900">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your admin preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Coming Soon</h2>
        <p className="text-sm text-gray-500">
          Settings and configuration options will be available in a future
          update.
        </p>
      </div>
    </div>
  );
}
