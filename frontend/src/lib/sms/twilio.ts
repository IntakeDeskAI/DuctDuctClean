import twilio from "twilio";

let _client: twilio.Twilio | null = null;

function getClient(): twilio.Twilio {
  if (!_client) {
    _client = twilio(
      process.env.TWILIO_ACCOUNT_SID || "",
      process.env.TWILIO_AUTH_TOKEN || ""
    );
  }
  return _client;
}

interface SendSMSOptions {
  to: string;
  body: string;
}

function formatE164(phone: string): string {
  // Strip everything except digits
  const digits = phone.replace(/\D/g, "");
  // If 10 digits (US), prepend +1
  if (digits.length === 10) return `+1${digits}`;
  // If 11 digits starting with 1 (US with country code), prepend +
  if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
  // If already has +, return as-is; otherwise prepend +
  return phone.startsWith("+") ? phone : `+${digits}`;
}

export async function sendSMS(
  options: SendSMSOptions
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("Twilio not configured — SMS not sent");
    return { success: false, error: "Twilio not configured" };
  }

  const to = formatE164(options.to);
  const from = formatE164(process.env.TWILIO_PHONE_NUMBER || "");

  try {
    const message = await getClient().messages.create({
      body: options.body,
      from,
      to,
    });

    return { success: true, sid: message.sid };
  } catch (err) {
    console.error("Twilio SMS error:", err);
    return { success: false, error: String(err) };
  }
}
