-- Migration 006: Tracking & Nutrition Logs

create table nutrition_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles on delete cascade,
  log_date    date not null,
  meal_type   meal_type not null,
  food_name   text not null,
  calories    integer not null,
  protein     numeric(6,2) not null default 0,
  carbs       numeric(6,2) not null default 0,
  fat         numeric(6,2) not null default 0,
  water_ml    integer default 0,
  notes       text,
  created_at  timestamptz not null default now()
);

create table weight_logs (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid not null references profiles on delete cascade,
  log_date              date not null,
  weight                numeric(6,2) not null,
  body_fat_percentage   numeric(4,2),
  notes                 text,
  created_at            timestamptz not null default now()
);

create table workout_logs (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles on delete cascade,
  log_date          date not null,
  workout_type      text not null,
  duration_minutes  integer not null,
  calories_burned   integer,
  notes             text,
  created_at        timestamptz not null default now()
);

-- Indexes for time-series queries
create index on nutrition_logs (user_id, log_date desc);
create index on weight_logs (user_id, log_date desc);
create index on workout_logs (user_id, log_date desc);

-- RLS — users access only their own logs
alter table nutrition_logs enable row level security;
alter table weight_logs enable row level security;
alter table workout_logs enable row level security;

create policy "Users manage own nutrition logs" on nutrition_logs for all using (auth.uid() = user_id);
create policy "Users manage own weight logs" on weight_logs for all using (auth.uid() = user_id);
create policy "Users manage own workout logs" on workout_logs for all using (auth.uid() = user_id);

create policy "Admin reads nutrition logs" on nutrition_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin reads weight logs" on weight_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin reads workout logs" on workout_logs for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
