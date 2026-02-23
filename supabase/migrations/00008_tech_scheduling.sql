-- Technicians table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    services TEXT[] NOT NULL DEFAULT '{}',
    max_jobs_per_day INTEGER NOT NULL DEFAULT 4,
    notification_preference TEXT NOT NULL DEFAULT 'all'
        CHECK (notification_preference IN ('all', 'phone', 'sms', 'email')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Job schedules table
CREATE TABLE job_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contact_submission_id UUID NOT NULL REFERENCES contact_submissions(id),
    technician_id UUID NOT NULL REFERENCES technicians(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    estimated_duration INTEGER NOT NULL DEFAULT 120,
    status TEXT NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'notified', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notification_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (notification_status IN ('pending', 'calling', 'sms_sent', 'emailed', 'confirmed', 'failed')),
    notify_at TIMESTAMPTZ DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_job_schedules_tech ON job_schedules(technician_id);
CREATE INDEX idx_job_schedules_date ON job_schedules(scheduled_date);
CREATE INDEX idx_job_schedules_status ON job_schedules(status);
CREATE INDEX idx_job_schedules_notify ON job_schedules(notification_status, notify_at)
    WHERE notification_status = 'pending';
CREATE INDEX idx_job_schedules_contact ON job_schedules(contact_submission_id);

-- Tech notification logs
CREATE TABLE tech_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_schedule_id UUID NOT NULL REFERENCES job_schedules(id),
    technician_id UUID NOT NULL REFERENCES technicians(id),
    channel TEXT NOT NULL
        CHECK (channel IN ('bland_call', 'sms', 'email')),
    status TEXT NOT NULL DEFAULT 'sent'
        CHECK (status IN ('sent', 'delivered', 'confirmed', 'failed')),
    external_id TEXT,
    response TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_tech_notifications_job ON tech_notifications(job_schedule_id);
CREATE INDEX idx_tech_notifications_tech ON tech_notifications(technician_id);

-- Seed tech_scheduling settings
INSERT INTO settings (key, value) VALUES
    ('tech_scheduling', '{"notifications_enabled": true, "default_notification": "all", "send_reminder_24h": true, "send_reminder_2h": true, "default_job_duration": 120}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- RLS: service_role only
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access technicians"
    ON technicians FOR ALL
    USING (auth.role() = 'service_role');

ALTER TABLE job_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access job_schedules"
    ON job_schedules FOR ALL
    USING (auth.role() = 'service_role');

ALTER TABLE tech_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access tech_notifications"
    ON tech_notifications FOR ALL
    USING (auth.role() = 'service_role');
