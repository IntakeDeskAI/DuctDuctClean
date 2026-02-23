const BLAND_BASE_URL = "https://api.bland.ai/v1";

function getHeaders() {
  const key = process.env.BLAND_API_KEY;
  if (!key) {
    throw new Error("BLAND_API_KEY environment variable is not set");
  }
  return {
    "Content-Type": "application/json",
    authorization: key,
  };
}

export async function purchasePhoneNumber(areaCode: string = "208") {
  const headers = getHeaders();
  const body = { area_code: areaCode, country_code: "US" };

  const res = await fetch(`${BLAND_BASE_URL}/inbound/purchase`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("Bland purchase error:", res.status, data);
    return {
      error: true,
      message: data?.message || data?.error || `Bland API returned ${res.status}`,
      details: data,
    };
  }

  return data;
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

  const data = await res.json();

  if (!res.ok) {
    console.error("Bland configure error:", res.status, data);
    return {
      error: true,
      message: data?.message || data?.error || `Bland API returned ${res.status}`,
      details: data,
    };
  }

  return { status: "success", ...data };
}

export async function getCallDetails(callId: string) {
  const res = await fetch(`${BLAND_BASE_URL}/calls/${callId}`, {
    headers: getHeaders(),
  });
  return res.json();
}
