-- Migration 002: Meal Plans & Meals

create type plan_duration as enum ('daily', 'weekly', 'monthly');
create type meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack');

create table meal_plans (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  description     text,
  goal_type       goal_type not null,
  plan_duration   plan_duration not null default 'weekly',
  price           numeric(10,2) not null,
  calories_per_day integer not null,
  image_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table meals (
  id              uuid primary key default uuid_generate_v4(),
  meal_plan_id    uuid not null references meal_plans on delete cascade,
  name            text not null,
  description     text,
  image_url       text,
  calories        integer not null,
  protein         numeric(6,2) not null,
  carbs           numeric(6,2) not null,
  fat             numeric(6,2) not null,
  fiber           numeric(6,2) default 0,
  ingredients     jsonb not null default '[]',
  allergens       jsonb not null default '[]',
  meal_type       meal_type not null,
  day_of_week     smallint not null check (day_of_week between 1 and 7),
  prep_time       integer,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Updated_at triggers
create trigger meal_plans_updated_at before update on meal_plans for each row execute function set_updated_at();
create trigger meals_updated_at before update on meals for each row execute function set_updated_at();

-- RLS
alter table meal_plans enable row level security;
alter table meals enable row level security;

-- Public can read active plans/meals
create policy "Public can read active meal plans" on meal_plans for select using (is_active = true);
create policy "Public can read active meals" on meals for select using (is_active = true);

-- Admin full access
create policy "Admin full access meal_plans" on meal_plans for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access meals" on meals for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
