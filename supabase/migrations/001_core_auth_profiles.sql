-- Migration 001: Core Auth & Profiles

create extension if not exists "uuid-ossp";

create type user_role as enum ('user', 'admin', 'nutritionist');
create type goal_type as enum ('weight_loss', 'muscle_gain', 'healthy_lifestyle');
create type activity_level as enum ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active');
create type gender_type as enum ('male', 'female', 'other');

create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  full_name     text not null,
  avatar_url    text,
  phone         text,
  dob           date,
  gender        gender_type,
  height        numeric(5,2),
  weight        numeric(5,2),
  activity_level activity_level default 'moderately_active',
  dietary_preferences jsonb default '[]',
  allergens     jsonb default '[]',
  goal          goal_type,
  role          user_role not null default 'user',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Updated_at trigger
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- RLS
alter table profiles enable row level security;

create policy "Users can read their own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin')
$$;

create policy "Admins can read all profiles"
  on profiles for select using (is_admin());

create policy "Admins can update all profiles"
  on profiles for update using (is_admin());
