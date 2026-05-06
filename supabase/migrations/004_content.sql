-- Migration 004: Content (Articles, Podcasts, Events)

create type event_type as enum ('workshop', 'webinar', 'cooking_class', 'fitness_session', 'nutrition_talk');
create type event_status as enum ('upcoming', 'ongoing', 'completed', 'cancelled');
create type registration_status as enum ('registered', 'cancelled', 'attended');

create table articles (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  content       text not null,
  excerpt       text,
  category      text not null,
  tags          jsonb not null default '[]',
  author_id     uuid references profiles on delete set null,
  image_url     text,
  is_published  boolean not null default false,
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table podcasts (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  audio_url       text not null,
  duration        integer not null,
  episode_number  integer not null unique,
  show_notes      text,
  transcript      text,
  image_url       text,
  is_published    boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table events (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  description     text,
  event_type      event_type not null,
  start_date      timestamptz not null,
  end_date        timestamptz not null,
  location        text,
  is_virtual      boolean not null default false,
  max_attendees   integer not null default 50,
  image_url       text,
  status          event_status not null default 'upcoming',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table event_registrations (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events on delete cascade,
  user_id     uuid not null references profiles on delete cascade,
  status      registration_status not null default 'registered',
  created_at  timestamptz not null default now(),
  unique (event_id, user_id)
);

-- Triggers
create trigger articles_updated_at before update on articles for each row execute function set_updated_at();
create trigger podcasts_updated_at before update on podcasts for each row execute function set_updated_at();
create trigger events_updated_at before update on events for each row execute function set_updated_at();

-- Indexes
create index on articles (slug);
create index on articles (is_published);
create index on podcasts (episode_number);
create index on events (status);
create index on events (start_date);

-- RLS
alter table articles enable row level security;
alter table podcasts enable row level security;
alter table events enable row level security;
alter table event_registrations enable row level security;

create policy "Public reads published articles" on articles for select using (is_published = true);
create policy "Public reads published podcasts" on podcasts for select using (is_published = true);
create policy "Public reads published events" on events for select using (true);
create policy "Users read own registrations" on event_registrations for select using (auth.uid() = user_id);
create policy "Users insert own registrations" on event_registrations for insert with check (auth.uid() = user_id);

create policy "Admin full access articles" on articles for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin full access podcasts" on podcasts for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin full access events" on events for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
create policy "Admin full access registrations" on event_registrations for all using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
