-- Email log tracking table
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email TEXT NOT NULL,
    to_name TEXT,
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    template TEXT NOT NULL,
    body_preview TEXT,
    resend_id TEXT,
    status TEXT NOT NULL DEFAULT 'sent'
        CHECK (status IN ('sent', 'delivered', 'bounced', 'failed')),
    contact_submission_id UUID REFERENCES contact_submissions(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_email_logs_created ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_template ON email_logs(template);
CREATE INDEX idx_email_logs_contact ON email_logs(contact_submission_id);
CREATE INDEX idx_email_logs_to ON email_logs(to_email);

-- RLS: service_role only
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access email_logs"
    ON email_logs FOR ALL
    USING (auth.role() = 'service_role');
