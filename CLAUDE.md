# CLAUDE.md — DuctDuctClean

## Project Overview
Full-stack web app for a professional air duct cleaning business in Idaho Falls, ID. Includes a public marketing site, customer chat, admin dashboard with lead management, technician scheduling, marketing automation, and analytics.

**Live site**: https://ductductclean.com
**Repo**: https://github.com/IntakeDeskAI/DuctDuctClean

## Tech Stack
- **Framework**: Next.js 14.2 (App Router) with React 18.3 and TypeScript (strict)
- **Styling**: Tailwind CSS 3.4 with custom `brand` (blue) and `accent` (green) color scales
- **Database**: Supabase (PostgreSQL) with RLS, 9 migration files
- **AI**: OpenAI (default) or Anthropic, streaming via `streamChatCompletion()`
- **Email**: Resend (`lib/email/resend.ts`)
- **SMS**: Twilio (`lib/sms/twilio.ts`) with E.164 phone formatting
- **Voice**: Bland.ai for outbound tech notification calls
- **Analytics**: PostHog
- **Deployment**: Vercel with cron jobs
- **Fonts**: Inter (body), Poppins (display)

## Commands
All commands run from `frontend/`:
```bash
npm run dev       # Start dev server
npm run build     # Production build (always run before committing)
npm run lint      # ESLint
npm run start     # Production server
```
Deploy: `vercel --prod` from repo root.

## Project Structure
```
frontend/src/
├── app/
│   ├── (marketing)/         # Public pages (home, about, services, blog, contact)
│   ├── (admin)/admin/       # Protected admin pages (leads, schedule, marketing, etc.)
│   ├── admin/login/         # Public login page
│   └── api/
│       ├── admin/           # Protected API routes (auth via admin_session cookie)
│       │   ├── leads/[id]/  # Lead CRUD
│       │   ├── schedules/   # Job scheduling + tech notification
│       │   ├── technicians/ # Tech management
│       │   ├── marketing/   # Campaigns, content, coupons, actions
│       │   ├── ai/          # AI streaming endpoint
│       │   ├── analytics/   # Dashboard analytics
│       │   └── ...
│       ├── cron/            # Vercel cron jobs (automations, tech-notifications, blog)
│       ├── webhook/         # Bland.ai + Twilio webhooks
│       ├── contact/         # Public contact form
│       └── chat/            # Public AI chat
├── components/
│   ├── admin/               # Admin UI (LeadsTable, ScheduleCalendar, MarketingHub, etc.)
│   │   └── marketing/       # Marketing sub-components (6 files)
│   ├── layout/              # Headers, footers, sidebars
│   ├── ui/                  # Reusable UI primitives
│   └── chat/                # Customer chat widget
├── lib/
│   ├── supabase/            # admin.ts (service role), server.ts, client.ts
│   ├── ai/                  # provider.ts (streaming), prompts.ts, stream-client.ts
│   ├── email/               # resend.ts, templates.ts
│   ├── sms/                 # twilio.ts (with E.164 formatting)
│   ├── notifications/       # dispatch.ts (multi-channel tech notifications)
│   ├── validations/         # Zod schemas
│   └── utils.ts             # formatDate, formatDateRelative, formatPhone
├── types/index.ts           # All TypeScript interfaces
├── config/site.ts           # Business info, hours, service areas
└── middleware.ts            # Admin auth (checks admin_session cookie)

supabase/migrations/         # 00001 through 00009 SQL migrations
```

## Key Patterns

### Auth
Simple cookie-based. Middleware checks `admin_session` cookie against `ADMIN_PASSWORD` env var for all `/admin/*` routes except `/admin/login`. API routes use:
```typescript
async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}
```

### Database Access
Always use Supabase client, never raw SQL. Admin/API routes use `createAdminClient()` (service role key, bypasses RLS):
```typescript
const supabase = createAdminClient();
const { data, error } = await supabase
  .from("contact_submissions")
  .select("*")
  .eq("status", "new")
  .order("created_at", { ascending: false });
```

### Server Pages (Admin)
Pattern: async server component fetches data, passes to client component:
```typescript
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function LeadsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("contact_submissions").select("*");
  return <LeadsTable leads={data || []} />;
}
```

### AI Streaming
Server: use `streamChatCompletion()` which returns a `ReadableStream`. Client: use `streamFetch()` from `@/lib/ai/stream-client` with an `onChunk` callback.

### Notifications
`notifyTechnician()` in `lib/notifications/dispatch.ts` sends via Bland call + SMS + email in parallel based on `tech.notification_preference` ("all" | "phone" | "sms" | "email"). Results logged to `tech_notifications` table.

### Tailwind Conventions
- Cards: `bg-white rounded-xl border border-gray-200 p-6`
- Primary buttons: `bg-brand-600 text-white hover:bg-brand-700 rounded-lg px-4 py-2.5 text-sm font-semibold`
- Pill tabs: `rounded-full px-4 py-2 text-sm font-medium` with `bg-brand-600 text-white` active
- Form inputs: `rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none`
- Page headers: `text-2xl font-bold font-display text-gray-900`

## Database Tables
| Table | Purpose |
|-------|---------|
| contact_submissions | Leads from contact form (status: new→contacted→quoted→converted→closed) |
| customers | Customer profiles |
| services | Service catalog |
| bookings | Appointments |
| blog_posts | AI-generated + manual blog content |
| call_logs | Bland.ai call transcripts |
| email_logs | Resend delivery tracking |
| settings | JSONB key-value config |
| automation_runs | Prevents duplicate automations per lead |
| technicians | Techs with notification preferences and schedules |
| job_schedules | Scheduled jobs with notification status tracking |
| tech_notifications | Log of SMS/email/call attempts per job |
| marketing_campaigns | Email/SMS campaign tracking with delivery stats |
| content_library | Saved AI-generated marketing content |
| marketing_coupons | Discount codes with usage tracking |
| marketing_action_log | Quick action audit trail |

## Cron Jobs (vercel.json)
| Schedule | Endpoint | Purpose |
|----------|----------|---------|
| Every 15 min | `/api/cron/automations` | Thank-you emails, follow-ups, review requests, re-engagement |
| Every 5 min | `/api/cron/tech-notifications` | Process pending tech notifications + 24h reminders |
| Mon 9 AM | `/api/cron/generate-blog` | AI blog post generation |

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
ADMIN_PASSWORD
AI_PROVIDER (openai|anthropic), AI_CHAT_MODEL, AI_ADMIN_MODEL
OPENAI_API_KEY, ANTHROPIC_API_KEY
RESEND_API_KEY, RESEND_FROM_EMAIL, ADMIN_NOTIFICATION_EMAIL
TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
BLAND_API_KEY, BLAND_WEBHOOK_SECRET
CRON_SECRET
NEXT_PUBLIC_POSTHOG_KEY
```

## Important Notes
- Always run `npm run build` from `frontend/` before committing — TypeScript strict mode catches issues
- Migrations are sequential (00001–00009) — never reorder or delete
- SMS requires E.164 format — `formatE164()` in `twilio.ts` handles this automatically
- Admin API routes must check `isAuthenticated()` first
- `notify_at` is always set on schedule creation so techs always get notified
- Settings table uses JSONB — access via `settings` API route
- Phone numbers in contact_submissions may not have country codes — always format before sending
- Content in blog_posts uses JSONB sections array for flexible structure
- Git path with `(admin)` route group needs quoting: `git add "frontend/src/app/(admin)/..."`
