-- Migration 003: Subscriptions & Orders

create type subscription_status as enum ('active', 'paused', 'cancelled');
create type order_status as enum ('pending', 'preparing', 'delivering', 'delivered', 'cancelled');
create type payment_status as enum ('pending', 'paid', 'failed');

create table subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles on delete cascade,
  meal_plan_id        uuid not null references meal_plans on delete restrict,
  status              subscription_status not null default 'active',
  start_date          date not null,
  end_date            date not null,
  delivery_address    jsonb not null,
  delivery_time_slot  text not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references profiles on delete cascade,
  subscription_id   uuid references subscriptions on delete set null,
  status            order_status not null default 'pending',
  delivery_date     date not null,
  total_amount      numeric(10,2) not null,
  payment_status    payment_status not null default 'pending',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table order_items (
  id                      uuid primary key default uuid_generate_v4(),
  order_id                uuid not null references orders on delete cascade,
  meal_id                 uuid not null references meals on delete restrict,
  quantity                smallint not null default 1,
  special_instructions    text
);

-- Indexes
create index on subscriptions (user_id);
create index on orders (user_id);
create index on orders (status);
create index on orders (delivery_date);

-- Triggers
create trigger subscriptions_updated_at before update on subscriptions for each row execute function set_updated_at();
create trigger orders_updated_at before update on orders for each row execute function set_updated_at();

-- RLS
alter table subscriptions enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

create policy "Users read own subscriptions" on subscriptions for select using (auth.uid() = user_id);
create policy "Users read own orders" on orders for select using (auth.uid() = user_id);
create policy "Users read own order_items" on order_items for select using (
  exists (select 1 from orders where id = order_id and user_id = auth.uid())
);

create policy "Admin full access subscriptions" on subscriptions for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Admin full access order_items" on order_items for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
