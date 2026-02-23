import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sendEmail } from "@/lib/email/resend";
import { createAdminClient } from "@/lib/supabase/admin";

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
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Email logs fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch email logs" },
        { status: 500 }
      );
    }

    return NextResponse.json({ emails: data });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch email logs" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { to, toName, subject, body, contactSubmissionId } =
      await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "to, subject, and body are required" },
        { status: 400 }
      );
    }

    const htmlBody = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <tr>
      <td style="background-color:#1e40af;padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">DuctDuctClean</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        ${body.replace(/\n/g, "<br>")}
      </td>
    </tr>
  </table>
</body>
</html>`;

    const result = await sendEmail({
      to,
      toName: toName || undefined,
      subject,
      html: htmlBody,
      template: "manual",
      contactSubmissionId: contactSubmissionId || undefined,
    });

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
