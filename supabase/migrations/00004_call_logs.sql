-- ============================================
-- DuctDuctClean: Call Logs Table (Bland.ai)
-- ============================================

CREATE TABLE call_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bland_call_id TEXT UNIQUE NOT NULL,
    phone_number TEXT NOT NULL,
    direction TEXT NOT NULL DEFAULT 'inbound'
        CHECK (direction IN ('inbound', 'outbound')),
    status TEXT NOT NULL DEFAULT 'completed'
        CHECK (status IN ('completed', 'transferred', 'voicemail', 'failed', 'no_answer')),
    duration_seconds INTEGER,
    transcript TEXT,
    recording_url TEXT,
    summary TEXT,
    analysis JSONB,
    contact_submission_id UUID REFERENCES contact_submissions(id),
    caller_name TEXT,
    caller_intent TEXT,
    service_interested TEXT,
    transferred BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_call_logs_created ON call_logs(created_at DESC);
CREATE INDEX idx_call_logs_phone ON call_logs(phone_number);
CREATE INDEX idx_call_logs_bland_id ON call_logs(bland_call_id);
CREATE INDEX idx_call_logs_submission ON call_logs(contact_submission_id);

-- Updated_at trigger
CREATE TRIGGER call_logs_updated_at
    BEFORE UPDATE ON call_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Service role has full access (webhook + admin)
CREATE POLICY "Service role full access call_logs"
    ON call_logs FOR ALL
    USING (auth.role() = 'service_role');
