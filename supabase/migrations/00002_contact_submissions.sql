-- ============================================
-- DuctDuctClean: Contact Submissions Table
-- ============================================

CREATE TABLE contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    service_type TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'contacted', 'quoted', 'converted', 'closed')),
    notes TEXT,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);
CREATE INDEX idx_contact_submissions_email ON contact_submissions(email);

-- Updated_at trigger
CREATE TRIGGER contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert (contact form submissions)
CREATE POLICY "Anyone can submit contact form"
    ON contact_submissions FOR INSERT
    WITH CHECK (true);

-- Service role has full access (for admin dashboard)
CREATE POLICY "Service role full access contact_submissions"
    ON contact_submissions FOR ALL
    USING (auth.role() = 'service_role');
