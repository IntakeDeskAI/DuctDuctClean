import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAllSettings, updateSetting } from "@/lib/supabase/settings";

function isAuthenticated(): boolean {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getAllSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();
    if (!key || value === undefined) {
      return NextResponse.json(
        { error: "Key and value are required" },
        { status: 400 }
      );
    }

    await updateSetting(key, value);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
