-- ---------------------------------------------------------
-- STAP 0: EXTENSIES (CRUCIAAL VOOR DE FIX)
-- ---------------------------------------------------------

-- Deze extensie is nodig om UUIDs te kunnen gebruiken in een EXCLUDE constraint
create extension if not exists btree_gist;

-- ---------------------------------------------------------
-- DEEL 1: BASIS TABELLEN (Clubs & Courts)
-- ---------------------------------------------------------

-- 1. Clubs (De Tenants)
create table if not exists clubs (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subdomain text unique not null, -- bijv. 'padel-zuid'
  custom_domain text unique,
  brand_color text default '#0f172a',
  logo_url text,
  stripe_account_id text, -- Voor Stripe Connect
  stripe_onboarding_completed boolean default false,
  subscription_tier text default 'starter' check (subscription_tier in ('starter', 'growth', 'pro')),
  created_at timestamptz default now()
);

-- 2. Courts (De Banen)
create table if not exists courts (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references clubs(id) on delete cascade not null,
  name text not null, -- bijv. 'Baan 1'
  court_type text default 'indoor', -- indoor/outdoor/single
  price_per_hour decimal(10,2) default 30.00,
  created_at timestamptz default now()
);

-- 3. Bookings (De Reserveringen)
create table if not exists bookings (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references clubs(id) on delete cascade not null,
  court_id uuid references courts(id) on delete cascade not null,
  user_id uuid references auth.users(id), -- Kan null zijn bij gastboeking via balie
  start_time timestamptz not null,
  end_time timestamptz not null,
  total_cost decimal(10,2) not null,
  status text default 'confirmed' check (status in ('pending', 'confirmed', 'cancelled')),
  payment_status text default 'unpaid' check (payment_status in ('pending', 'paid', 'refunded', 'unpaid')),
  attendees int default 4,
  booking_notes text,
  created_at timestamptz default now(),
  -- Voorkom overlapping op database niveau (Constraint)
  exclude using gist (
    court_id with =,
    tstzrange(start_time, end_time) with &&
  )
);

-- ---------------------------------------------------------
-- DEEL 2: SPLIT PAYMENTS
-- ---------------------------------------------------------

create table if not exists booking_shares (
  id uuid default gen_random_uuid() primary key,
  booking_id uuid references bookings(id) on delete cascade not null,
  user_id uuid references auth.users(id), -- Nullable (gast)
  share_number int not null, -- 1, 2, 3, 4
  share_amount decimal(10,2) not null,
  service_fee decimal(10,2) default 0.25,
  total_amount decimal(10,2) not null, -- share + fee
  payment_status text default 'pending' check (payment_status in ('pending', 'paid')),
  payment_link_token uuid default gen_random_uuid(), -- Voor de publieke link
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- DEEL 3: WALLET SYSTEM (Fintech)
-- ---------------------------------------------------------

create table if not exists club_wallets (
  id uuid default gen_random_uuid() primary key,
  club_id uuid references clubs(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  balance decimal(10,2) default 0.00 not null check (balance >= 0),
  updated_at timestamptz default now(),
  unique(club_id, user_id)
);

create table if not exists wallet_transactions (
  id uuid default gen_random_uuid() primary key,
  wallet_id uuid references club_wallets(id) on delete cascade not null,
  amount decimal(10,2) not null,
  type text check (type in ('topup', 'payment', 'refund', 'bonus')) not null,
  reference_id text,
  description text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------
-- DEEL 4: SECURITY (RLS Policies)
-- ---------------------------------------------------------

-- Zet RLS aan
alter table clubs enable row level security;
alter table courts enable row level security;
alter table bookings enable row level security;
alter table booking_shares enable row level security;
alter table club_wallets enable row level security;
alter table wallet_transactions enable row level security;

-- Simpele Public Read policies (voor demo doeleinden, in prod strenger maken)
create policy "Public read clubs" on clubs for select using (true);
create policy "Public read courts" on courts for select using (true);
create policy "Public read bookings" on bookings for select using (true);

-- User policies
create policy "Users manage own bookings" on bookings 
  for all using (auth.uid() = user_id);

create policy "Public read shares via token" on booking_shares 
  for select using (true); -- Nodig voor gast-pagina

create policy "Users view own wallet" on club_wallets 
  for select using (auth.uid() = user_id);

create policy "Users view own transactions" on wallet_transactions 
  for select using (
    wallet_id in (select id from club_wallets where user_id = auth.uid())
  );

-- ---------------------------------------------------------
-- DEEL 5: FUNCTIES (De Motor)
-- ---------------------------------------------------------

-- A. Atomic Booking Function
create or replace function create_atomic_booking(
  p_club_id uuid,
  p_court_id uuid,
  p_user_id uuid,
  p_start_time timestamptz,
  p_end_time timestamptz,
  p_total_cost decimal
) returns json language plpgsql as $$
declare
  v_booking_id uuid;
begin
  -- Check overlap (dubbele zekerheid naast constraint)
  if exists (
    select 1 from bookings 
    where court_id = p_court_id 
    and status != 'cancelled'
    and tstzrange(start_time, end_time) && tstzrange(p_start_time, p_end_time)
  ) then
    raise exception 'Tijdslot is niet meer beschikbaar.';
  end if;

  insert into bookings (club_id, court_id, user_id, start_time, end_time, total_cost, status, payment_status)
  values (p_club_id, p_court_id, p_user_id, p_start_time, p_end_time, p_total_cost, 'confirmed', 'pending')
  returning id into v_booking_id;

  return json_build_object('id', v_booking_id, 'status', 'success');
end;
$$;

-- B. Wallet Payment Function
create or replace function process_wallet_payment(
  p_booking_id uuid,
  p_user_id uuid,
  p_club_id uuid
) returns void language plpgsql as $$
declare
  v_total_cost decimal;
  v_wallet_id uuid;
  v_balance decimal;
begin
  -- Haal kosten op
  select total_cost into v_total_cost from bookings where id = p_booking_id;
  
  -- Haal wallet op en lock
  select id, balance into v_wallet_id, v_balance
  from club_wallets 
  where user_id = p_user_id and club_id = p_club_id
  for update;

  if v_wallet_id is null then raise exception 'Geen portemonnee gevonden.'; end if;
  if v_balance < v_total_cost then raise exception 'Onvoldoende saldo.'; end if;

  -- Transactie
  update club_wallets set balance = balance - v_total_cost where id = v_wallet_id;
  
  insert into wallet_transactions (wallet_id, amount, type, reference_id, description)
  values (v_wallet_id, -v_total_cost, 'payment', p_booking_id::text, 'Betaling Baanhuur');

  update bookings set payment_status = 'paid' where id = p_booking_id;
end;
$$;

-- ---------------------------------------------------------
-- DEEL 6: SEED DATA (Voorbeeld Club)
-- ---------------------------------------------------------

-- Maak een test club aan zodat je direct aan de slag kunt
insert into clubs (name, subdomain, brand_color)
values ('Padel Club Zuid', 'zuid', '#16a34a'); -- Groen thema

-- Voeg 2 banen toe aan de club die we net maakten
insert into courts (club_id, name, price_per_hour)
select id, 'Baan 1 (Panorama)', 30.00 from clubs where subdomain = 'zuid';

insert into courts (club_id, name, price_per_hour)
select id, 'Baan 2 (Indoor)', 30.00 from clubs where subdomain = 'zuid';