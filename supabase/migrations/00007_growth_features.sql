-- Add revenue, completion, and re-engagement tracking to contact_submissions
ALTER TABLE contact_submissions
    ADD COLUMN revenue NUMERIC(10,2),
    ADD COLUMN completed_at TIMESTAMPTZ,
    ADD COLUMN last_email_sent_at TIMESTAMPTZ,
    ADD COLUMN referral_source TEXT,
    ADD COLUMN referral_code TEXT UNIQUE;

-- Index for re-engagement queries
CREATE INDEX idx_contact_submissions_completed ON contact_submissions(completed_at)
    WHERE completed_at IS NOT NULL;
CREATE INDEX idx_contact_submissions_referral ON contact_submissions(referral_code)
    WHERE referral_code IS NOT NULL;

-- Automation runs: tracks what automations have fired for which leads
CREATE TABLE automation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_submission_id UUID NOT NULL REFERENCES contact_submissions(id),
    automation_type TEXT NOT NULL,
    email_log_id UUID REFERENCES email_logs(id),
    status TEXT NOT NULL DEFAULT 'completed'
        CHECK (status IN ('pending', 'completed', 'skipped', 'failed')),
    scheduled_for TIMESTAMPTZ,
    executed_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_automation_runs_contact ON automation_runs(contact_submission_id);
CREATE INDEX idx_automation_runs_type ON automation_runs(automation_type);
CREATE UNIQUE INDEX idx_automation_runs_unique
    ON automation_runs(contact_submission_id, automation_type);
CREATE INDEX idx_automation_runs_scheduled
    ON automation_runs(scheduled_for)
    WHERE status = 'pending';

-- RLS: service_role only
ALTER TABLE automation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access automation_runs"
    ON automation_runs FOR ALL
    USING (auth.role() = 'service_role');
