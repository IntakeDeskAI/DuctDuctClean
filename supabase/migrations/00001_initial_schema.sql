-- ============================================
-- DuctDuctClean: Initial Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------
-- Customers
-- ----------------------------
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- Services
-- ----------------------------
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- Bookings
-- ----------------------------
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    service_id UUID NOT NULL REFERENCES services(id),
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- Quotes
-- ----------------------------
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    email TEXT NOT NULL,
    property_type TEXT NOT NULL CHECK (property_type IN ('residential', 'commercial')),
    square_footage INTEGER,
    num_vents INTEGER,
    services_requested TEXT[],
    estimated_total NUMERIC(10,2),
    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- Invoices
-- ----------------------------
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id),
    customer_id UUID NOT NULL REFERENCES customers(id),
    amount NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'draft'
        CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
    stripe_payment_intent_id TEXT,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------
-- Indexes
-- ----------------------------
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_quotes_email ON quotes(email);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ----------------------------
-- Updated_at trigger
-- ----------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ----------------------------
-- Row Level Security
-- ----------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Customers can read their own data
CREATE POLICY "Customers can view own data"
    ON customers FOR SELECT
    USING (auth.uid() = auth_user_id);

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
    ON bookings FOR SELECT
    USING (customer_id IN (SELECT id FROM customers WHERE auth_user_id = auth.uid()));

-- Service role has full access (for backend API)
CREATE POLICY "Service role full access customers"
    ON customers FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access bookings"
    ON bookings FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access quotes"
    ON quotes FOR ALL
    USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access invoices"
    ON invoices FOR ALL
    USING (auth.role() = 'service_role');
