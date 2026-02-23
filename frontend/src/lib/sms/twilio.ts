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

export async function sendSMS(
  options: SendSMSOptions
): Promise<{ success: boolean; sid?: string; error?: string }> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn("Twilio not configured — SMS not sent");
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const message = await getClient().messages.create({
      body: options.body,
      from: process.env.TWILIO_PHONE_NUMBER || "",
      to: options.to,
    });

    return { success: true, sid: message.sid };
  } catch (err) {
    console.error("Twilio SMS error:", err);
    return { success: false, error: String(err) };
  }
}
