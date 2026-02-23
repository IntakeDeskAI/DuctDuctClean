// ===========================
// DuctDuctClean Type Definitions
// ===========================

export interface Customer {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  service_id: string;
  scheduled_date: string;
  scheduled_time: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  base_price: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Quote {
  id: string;
  customer_id: string | null;
  email: string;
  property_type: "residential" | "commercial";
  square_footage: number;
  num_vents: number;
  services_requested: string[];
  estimated_total: number;
  status: "draft" | "sent" | "accepted" | "declined" | "expired";
  created_at: string;
  expires_at: string;
}

export interface Invoice {
  id: string;
  booking_id: string;
  customer_id: string;
  amount: number;
  tax: number;
  total: number;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  stripe_payment_intent_id: string | null;
  due_date: string;
  paid_at: string | null;
  created_at: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  service_type: string;
  message: string | null;
  status: "new" | "contacted" | "quoted" | "converted" | "closed";
  notes: string | null;
  source: string;
  revenue: number | null;
  completed_at: string | null;
  last_email_sent_at: string | null;
  referral_source: string | null;
  referral_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  bland_call_id: string;
  phone_number: string;
  direction: "inbound" | "outbound";
  status: "completed" | "transferred" | "voicemail" | "failed" | "no_answer";
  duration_seconds: number | null;
  transcript: string | null;
  recording_url: string | null;
  summary: string | null;
  analysis: Record<string, unknown> | null;
  contact_submission_id: string | null;
  caller_name: string | null;
  caller_intent: string | null;
  service_interested: string | null;
  transferred: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailLog {
  id: string;
  to_email: string;
  to_name: string | null;
  from_email: string;
  subject: string;
  template: string;
  body_preview: string | null;
  resend_id: string | null;
  status: "sent" | "delivered" | "bounced" | "failed";
  contact_submission_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AutomationRun {
  id: string;
  contact_submission_id: string;
  automation_type: string;
  email_log_id: string | null;
  status: "pending" | "completed" | "skipped" | "failed";
  scheduled_for: string | null;
  executed_at: string | null;
  created_at: string;
}

export interface BlogSection {
  heading?: string;
  content: string;
  list?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: number;
  metaDescription: string;
  keywords: string[];
  sections: BlogSection[];
}
