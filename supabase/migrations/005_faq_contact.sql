-- Migration 005: FAQ & Contact

create type contact_status as enum ('new', 'read', 'replied');

create table faq_items (
  id            uuid primary key default uuid_generate_v4(),
  question      text not null,
  answer        text not null,
  category      text not null,
  sort_order    integer not null default 0,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table contact_messages (
  id        uuid primary key default uuid_generate_v4(),
  name      text not null,
  email     text not null,
  subject   text not null,
  message   text not null,
  status    contact_status not null default 'new',
  created_at timestamptz not null default now()
);

-- Trigger
create trigger faq_items_updated_at before update on faq_items for each row execute function set_updated_at();

-- RLS
alter table faq_items enable row level security;
alter table contact_messages enable row level security;

create policy "Public reads published FAQs" on faq_items for select using (is_published = true);
create policy "Anyone can insert contact message" on contact_messages for insert with check (true);

create policy "Admin full access faq" on faq_items for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin reads contact messages" on contact_messages for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin updates contact messages" on contact_messages for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
