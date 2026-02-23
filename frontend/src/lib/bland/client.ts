const BLAND_BASE_URL = "https://api.bland.ai/v1";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    authorization: process.env.BLAND_API_KEY!,
  };
}

export async function purchasePhoneNumber(areaCode: string = "208") {
  const res = await fetch(`${BLAND_BASE_URL}/inbound-purchase`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ area_code: areaCode, country_code: "US" }),
  });
  return res.json();
}

export async function configureInboundAgent(
  phoneNumber: string,
  config: {
    prompt: string;
    first_sentence: string;
    voice: string;
    webhook: string;
    max_duration: number;
    analysis_schema?: Record<string, string>;
    analysis_prompt?: string;
    record: boolean;
  }
) {
  const encoded = encodeURIComponent(phoneNumber);
  const res = await fetch(`${BLAND_BASE_URL}/inbound/${encoded}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(config),
  });
  return res.json();
}

export async function getCallDetails(callId: string) {
  const res = await fetch(`${BLAND_BASE_URL}/calls/${callId}`, {
    headers: getHeaders(),
  });
  return res.json();
}
