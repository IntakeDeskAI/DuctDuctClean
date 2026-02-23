import { siteConfig } from "@/config/site";
import type { ContactSubmission, Technician, JobSchedule } from "@/types";

const brandColor = "#1e40af";
const accentColor = "#16a34a";

function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;margin:0 auto;background-color:#ffffff;">
    <!-- Header -->
    <tr>
      <td style="background-color:${brandColor};padding:24px 32px;">
        <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">DuctDuctClean</h1>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:32px;">
        ${content}
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:24px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
          ${siteConfig.name} &middot; ${siteConfig.contact.address}<br>
          ${siteConfig.contact.phone} &middot; ${siteConfig.hours.display}<br>
          <a href="${siteConfig.url}" style="color:${brandColor};">${siteConfig.url}</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const serviceLabels: Record<string, string> = {
  residential: "Residential Duct Cleaning",
  commercial: "Commercial HVAC Vent Cleaning",
  "dryer-vent": "Dryer Vent Cleaning",
  "window-washing": "Window Washing",
};

function getServiceLabel(type: string): string {
  return serviceLabels[type] || type.replace("-", " ");
}

// 1. Admin Notification: New Lead
export function newLeadAdminNotification(lead: ContactSubmission): {
  subject: string;
  html: string;
} {
  return {
    subject: `New Lead: ${lead.name} - ${getServiceLabel(lead.service_type)}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">New Lead Received</h2>
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <strong style="color:#6b7280;font-size:13px;">Name:</strong>
            <span style="color:#111827;font-size:14px;margin-left:8px;">${lead.name}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <strong style="color:#6b7280;font-size:13px;">Phone:</strong>
            <a href="tel:${lead.phone}" style="color:${brandColor};font-size:14px;margin-left:8px;">${lead.phone}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <strong style="color:#6b7280;font-size:13px;">Email:</strong>
            <a href="mailto:${lead.email}" style="color:${brandColor};font-size:14px;margin-left:8px;">${lead.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <strong style="color:#6b7280;font-size:13px;">Address:</strong>
            <span style="color:#111827;font-size:14px;margin-left:8px;">${lead.address}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <strong style="color:#6b7280;font-size:13px;">Service:</strong>
            <span style="color:#111827;font-size:14px;margin-left:8px;">${getServiceLabel(lead.service_type)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <strong style="color:#6b7280;font-size:13px;">Source:</strong>
            <span style="color:#111827;font-size:14px;margin-left:8px;">${lead.source}</span>
          </td>
        </tr>
        ${lead.message ? `<tr>
          <td style="padding:8px 0;">
            <strong style="color:#6b7280;font-size:13px;">Message:</strong>
            <p style="color:#111827;font-size:14px;margin:4px 0 0;background:#f9fafb;padding:12px;border-radius:8px;">${lead.message}</p>
          </td>
        </tr>` : ""}
      </table>
      <a href="${siteConfig.url}/admin/leads/${lead.id}" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
        View Lead in Dashboard
      </a>
    `),
  };
}

// 2. Thank You Customer
export function thankYouCustomer(lead: ContactSubmission): {
  subject: string;
  html: string;
} {
  return {
    subject: `Thanks for contacting DuctDuctClean, ${lead.name.split(" ")[0]}!`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Thanks for reaching out!</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${lead.name.split(" ")[0]}, we received your request for <strong>${getServiceLabel(lead.service_type)}</strong> and we're excited to help.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Here's what happens next:
      </p>
      <ol style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>We'll review your request within the next hour</li>
        <li>A team member will reach out to schedule your free estimate</li>
        <li>We'll provide a detailed quote before any work begins</li>
      </ol>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
        In the meantime, feel free to call us at <a href="tel:${siteConfig.contact.phoneTel}" style="color:${brandColor};font-weight:600;">${siteConfig.contact.phone}</a> if you have any questions.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0;">
        We look forward to serving you!<br>
        <strong>The DuctDuctClean Team</strong>
      </p>
    `),
  };
}

// 3. Follow-Up (1 Hour)
export function followUp1Hour(lead: ContactSubmission): {
  subject: string;
  html: string;
} {
  return {
    subject: `${lead.name.split(" ")[0]}, we're working on your quote`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">We haven't forgotten about you!</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${lead.name.split(" ")[0]}, just a quick note that we received your request for <strong>${getServiceLabel(lead.service_type)}</strong> and we're putting together your estimate.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
        We'll be reaching out shortly. If you'd like to get started right away, give us a call:
      </p>
      <a href="tel:${siteConfig.contact.phoneTel}" style="display:inline-block;background-color:${accentColor};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
        Call ${siteConfig.contact.phone}
      </a>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">
        ${siteConfig.hours.display}
      </p>
    `),
  };
}

// 4. Quote Follow-Up
export function quoteFollowUp(lead: ContactSubmission): {
  subject: string;
  html: string;
} {
  return {
    subject: `Following up on your ${getServiceLabel(lead.service_type)} quote`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Still interested in getting your ducts cleaned?</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${lead.name.split(" ")[0]}, we wanted to follow up on the ${getServiceLabel(lead.service_type)} quote we discussed. We'd love to get you scheduled at a time that works best for you.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
        Just reply to this email or give us a call to book your appointment. We're happy to answer any questions you might have!
      </p>
      <a href="tel:${siteConfig.contact.phoneTel}" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
        Schedule Now: ${siteConfig.contact.phone}
      </a>
    `),
  };
}

// 5. Review Request
export function reviewRequest(
  lead: ContactSubmission,
  googleReviewUrl: string
): { subject: string; html: string } {
  return {
    subject: `${lead.name.split(" ")[0]}, how did we do?`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">We hope you're enjoying your cleaner air!</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${lead.name.split(" ")[0]}, thank you for choosing DuctDuctClean for your ${getServiceLabel(lead.service_type)}. We hope you're noticing the difference!
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 24px;">
        If you have a moment, we'd really appreciate a quick review. It helps other Idaho Falls homeowners find us and keeps our small business growing.
      </p>
      <a href="${googleReviewUrl}" style="display:inline-block;background-color:${accentColor};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;">
        Leave a Google Review
      </a>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">
        Thank you for supporting a local business!
      </p>
    `),
  };
}

// 6. Re-Engagement
export function reEngagement(
  lead: ContactSubmission,
  monthsSinceService: number
): { subject: string; html: string } {
  return {
    subject: `It's been ${monthsSinceService} months - time for another cleaning?`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Time for a tune-up!</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${lead.name.split(" ")[0]}, it's been about ${monthsSinceService} months since we last cleaned your ${getServiceLabel(lead.service_type).toLowerCase()}. The NADCA recommends cleaning every 3-5 years, but Idaho's dusty conditions mean more frequent cleanings can make a real difference.
      </p>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Signs it might be time:
      </p>
      <ul style="color:#374151;font-size:14px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
        <li>Visible dust around vents</li>
        <li>Increased allergy symptoms</li>
        <li>Higher energy bills</li>
        <li>Musty or stale odors</li>
      </ul>
      <a href="${siteConfig.url}/contact" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
        Schedule Your Next Cleaning
      </a>
      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:24px 0 0;">
        Or call us at ${siteConfig.contact.phone}
      </p>
    `),
  };
}

// 7. Referral Invite
export function referralInvite(
  lead: ContactSubmission,
  referralCode: string,
  rewardDescription: string
): { subject: string; html: string } {
  return {
    subject: `Share the clean air, ${lead.name.split(" ")[0]} - give your friends ${rewardDescription}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Share the love, earn rewards!</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Hi ${lead.name.split(" ")[0]}, thanks again for choosing DuctDuctClean! We have a special offer for you:
      </p>
      <div style="background-color:#f0f9ff;border:2px dashed ${brandColor};border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
        <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">YOUR REFERRAL CODE</p>
        <p style="color:${brandColor};font-size:24px;font-weight:700;margin:0 0 8px;letter-spacing:2px;">${referralCode}</p>
        <p style="color:#374151;font-size:14px;margin:0;">
          Share this code with friends and family. They get <strong>${rewardDescription}</strong> and you'll receive the same discount on your next service!
        </p>
      </div>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Just have them mention your code when they book, or enter it on our contact form.
      </p>
      <a href="${siteConfig.url}/contact" style="display:inline-block;background-color:${brandColor};color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;">
        Visit Our Website
      </a>
    `),
  };
}

// 8. Tech Job Notification
export function techJobNotification(
  tech: Technician,
  lead: ContactSubmission,
  schedule: JobSchedule
): { subject: string; html: string } {
  const scheduledDate = new Date(schedule.scheduled_date + "T00:00:00");
  const dateStr = scheduledDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const [hours, minutes] = schedule.scheduled_time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  const timeStr = `${h12}:${minutes} ${ampm}`;

  const confirmUrl = `${siteConfig.url}/api/webhook/tech-confirm?schedule=${schedule.id}&tech=${tech.id}&action=confirm`;

  return {
    subject: `New Job Assignment: ${getServiceLabel(lead.service_type)} on ${dateStr}`,
    html: emailWrapper(`
      <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">New Job Assignment</h2>
      <p style="color:#374151;font-size:14px;line-height:1.6;margin:0 0 20px;">
        Hi ${tech.name.split(" ")[0]}, you've been assigned a new job. Here are the details:
      </p>

      <div style="background-color:#f0f9ff;border-radius:12px;padding:20px;margin:0 0 24px;">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:6px 0;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Service</strong><br>
              <span style="color:#111827;font-size:15px;font-weight:600;">${getServiceLabel(lead.service_type)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Date & Time</strong><br>
              <span style="color:#111827;font-size:15px;font-weight:600;">${dateStr} at ${timeStr}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Duration</strong><br>
              <span style="color:#111827;font-size:15px;">${schedule.estimated_duration} minutes</span>
            </td>
          </tr>
          <tr>
            <td style="padding:6px 0;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Address</strong><br>
              <span style="color:#111827;font-size:15px;">${lead.address}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 0 6px;border-top:1px solid #dbeafe;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Customer</strong><br>
              <span style="color:#111827;font-size:15px;">${lead.name}</span><br>
              <a href="tel:${lead.phone}" style="color:${brandColor};font-size:14px;">${lead.phone}</a>
            </td>
          </tr>
          ${schedule.notes ? `<tr>
            <td style="padding:6px 0;">
              <strong style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;">Notes</strong><br>
              <span style="color:#111827;font-size:14px;">${schedule.notes}</span>
            </td>
          </tr>` : ""}
        </table>
      </div>

      <div style="text-align:center;margin:0 0 24px;">
        <a href="${confirmUrl}" style="display:inline-block;background-color:${accentColor};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;">
          Confirm This Job
        </a>
      </div>

      <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0;text-align:center;">
        Can't make it? Reply to this email or call dispatch at ${siteConfig.contact.phone}
      </p>
    `),
  };
}
