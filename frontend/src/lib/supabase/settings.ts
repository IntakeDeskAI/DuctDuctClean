import { createAdminClient } from "./admin";

// Simple in-memory cache for settings (5-minute TTL)
let settingsCache: Record<string, unknown> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getAllSettings(): Promise<Record<string, unknown>> {
  if (settingsCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return settingsCache;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("settings").select("*");

  if (error) {
    console.error("Failed to fetch settings:", error);
    return {};
  }

  const settings: Record<string, unknown> = {};
  for (const row of data || []) {
    settings[row.key] = row.value;
  }

  settingsCache = settings;
  cacheTimestamp = Date.now();
  return settings;
}

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  const all = await getAllSettings();
  return (all[key] as T) ?? null;
}

export async function updateSetting(
  key: string,
  value: unknown
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value, updated_at: new Date().toISOString() })
    .eq("key", key);

  if (error) {
    console.error("Failed to update setting:", error);
    throw new Error(`Failed to update setting: ${key}`);
  }

  // Invalidate cache
  settingsCache = null;
}
