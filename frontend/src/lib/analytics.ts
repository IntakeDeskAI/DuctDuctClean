import posthog from "posthog-js";

function isLoaded(): boolean {
  return typeof window !== "undefined" && posthog.__loaded;
}

/** Track a contact form submission */
export function trackFormSubmission(serviceType: string) {
  if (!isLoaded()) return;
  posthog.capture("form_submission", {
    service_type: serviceType,
  });
}

/** Track a phone number CTA click */
export function trackPhoneClick(location: string) {
  if (!isLoaded()) return;
  posthog.capture("phone_click", {
    location,
  });
}

/** Track chat widget open */
export function trackChatOpen() {
  if (!isLoaded()) return;
  posthog.capture("chat_opened");
}

/** Track chat message sent */
export function trackChatMessage() {
  if (!isLoaded()) return;
  posthog.capture("chat_message_sent");
}
