-- Migration 007: Session Providers & Bookings

create type provider_specialty as enum ('nutritionist', 'dietitian', 'personal_trainer', 'doctor', 'therapist', 'wellness_coach');
create type booking_status as enum ('pending', 'confirmed', 'cancelled', 'completed');

create table providers (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  title            text not null,
  specialty        provider_specialty not null default 'nutritionist',
  bio              text,
  image_url        text,
  session_price    numeric(10,2) not null default 0,
  session_duration integer not null default 60,          -- minutes
  available_days   jsonb not null default '[1,2,3,4,5]', -- 1=Mon … 7=Sun
  available_from   text not null default '09:00',
  available_to     text not null default '17:00',
  languages        text[] not null default '{English}',
  qualifications   text[] not null default '{}',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table session_bookings (
  id             uuid primary key default uuid_generate_v4(),
  provider_id    uuid not null references providers on delete cascade,
  user_id        uuid not null references profiles on delete cascade,
  booking_date   date not null,
  start_time     text not null,
  session_type   text not null default 'Consultation',
  status         booking_status not null default 'pending',
  notes          text,
  meeting_link   text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger providers_updated_at before update on providers for each row execute function set_updated_at();
create trigger session_bookings_updated_at before update on session_bookings for each row execute function set_updated_at();

create index on session_bookings (provider_id, booking_date);
create index on session_bookings (user_id);

alter table providers enable row level security;
alter table session_bookings enable row level security;

create policy "Public reads active providers" on providers for select using (is_active = true);

create policy "Users read own bookings"   on session_bookings for select using (auth.uid() = user_id);
create policy "Users insert own bookings" on session_bookings for insert with check (auth.uid() = user_id);
create policy "Users update own bookings" on session_bookings for update using (auth.uid() = user_id);

create policy "Admin full access providers" on providers for all using (is_admin());
create policy "Admin full access bookings" on session_bookings for all using (is_admin());
