-- Settings key-value store for business configuration
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed default settings
INSERT INTO settings (key, value) VALUES
    ('business_info', '{"name": "DuctDuctClean", "phone": "(208) 470-8020", "email": "info@ductductclean.com", "address": "Idaho Falls, ID 83401", "hours": "Mon-Sat: 7:00 AM - 7:00 PM"}'::jsonb),
    ('email_config', '{"from_name": "DuctDuctClean", "from_email": "info@ductductclean.com", "reply_to": "info@ductductclean.com"}'::jsonb),
    ('notifications', '{"email_on_new_lead": true, "admin_email": "", "daily_digest": false}'::jsonb),
    ('automations', '{"auto_thank_you_email": true, "auto_follow_up_1h": true, "auto_review_request": true, "auto_reengagement_12m": true}'::jsonb),
    ('google_review', '{"url": "", "enabled": false}'::jsonb),
    ('referral_program', '{"enabled": false, "reward_description": "$25 off your next service"}'::jsonb);

-- RLS: service_role only
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access settings"
    ON settings FOR ALL
    USING (auth.role() = 'service_role');
