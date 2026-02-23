import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purchasePhoneNumber, configureInboundAgent } from "@/lib/bland/client";
import {
  buildBlandAgentPrompt,
  BLAND_FIRST_SENTENCE,
  BLAND_ANALYSIS_SCHEMA,
  BLAND_ANALYSIS_PROMPT,
} from "@/lib/bland/prompt";

function checkAuth() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("call_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch call logs:", error);
      return NextResponse.json({ calls: [] });
    }

    return NextResponse.json({ calls: data || [] });
  } catch {
    return NextResponse.json({ error: "Failed to fetch calls" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!checkAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (body.action === "purchase_number") {
      const result = await purchasePhoneNumber(body.area_code || "208");
      return NextResponse.json(result);
    }

    if (body.action === "configure_agent") {
      if (!body.phone_number) {
        return NextResponse.json(
          { error: "phone_number required" },
          { status: 400 }
        );
      }

      const prompt = buildBlandAgentPrompt();
      const webhookUrl = `https://ductductclean.com/api/webhook/bland`;

      const result = await configureInboundAgent(body.phone_number, {
        prompt,
        first_sentence: BLAND_FIRST_SENTENCE,
        voice: "nat",
        webhook: webhookUrl,
        max_duration: 300,
        analysis_schema: BLAND_ANALYSIS_SCHEMA,
        analysis_prompt: BLAND_ANALYSIS_PROMPT,
        record: true,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed", details: String(error) },
      { status: 500 }
    );
  }
}
