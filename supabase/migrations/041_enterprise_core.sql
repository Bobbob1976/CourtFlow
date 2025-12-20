-- 1. Split Payment & Wallet Core

-- Enums
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'pending_split', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE split_status AS ENUM ('pending', 'paid', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('top_up', 'payment', 'refund', 'penalty', 'clawback');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update Bookings Table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status payment_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS outstanding_amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS split_group_id UUID;

-- Booking Splits
CREATE TABLE IF NOT EXISTS booking_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    status split_status DEFAULT 'pending',
    payment_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, user_id)
);

-- Wallet Transactions (User View)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10, 2) NOT NULL,
    type transaction_type NOT NULL,
    reference_id UUID,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Game Engine (Stats)

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    club_id UUID REFERENCES clubs(id),
    sport TEXT NOT NULL DEFAULT 'padel',
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending_verification',
    submitted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    set_number INT NOT NULL,
    score_team_a INT NOT NULL,
    score_team_b INT NOT NULL
);

CREATE TABLE IF NOT EXISTS match_players (
    match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    team TEXT NOT NULL,
    rating_before INT,
    rating_after INT,
    PRIMARY KEY (match_id, user_id)
);

CREATE TABLE IF NOT EXISTS player_ratings (
    user_id UUID REFERENCES auth.users(id),
    sport TEXT NOT NULL,
    rating INT DEFAULT 1200,
    matches_played INT DEFAULT 0,
    confidence_factor DECIMAL(5,2) DEFAULT 1.0,
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, sport)
);

-- 3. Financial Core (Accounting)

CREATE TABLE IF NOT EXISTS tax_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL,
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    club_id UUID REFERENCES clubs(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'paid',
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(club_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    description TEXT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    tax_rate_id UUID REFERENCES tax_rates(id),
    total_price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id),
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    account_code TEXT NOT NULL,
    description TEXT,
    debit DECIMAL(10, 2) DEFAULT 0,
    credit DECIMAL(10, 2) DEFAULT 0,
    reference_id UUID
);

-- Seed Tax Rates
INSERT INTO tax_rates (name, percentage) VALUES ('BTW Hoog', 21.00), ('BTW Laag', 9.00) ON CONFLICT DO NOTHING;
