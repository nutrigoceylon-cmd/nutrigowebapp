-- Migration 008: Guest Checkout Order Flow
-- Extends the existing orders/order_items tables to support
-- guest checkout, richer statuses, and delivery tracking.
-- All new columns are nullable so existing subscription-based
-- rows remain valid without any data migration.

-- ─── 1. Make user_id nullable (support guest orders) ──────────────────────
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- ─── 2. New columns on orders ─────────────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS order_number              text,
  ADD COLUMN IF NOT EXISTS customer_name             text,
  ADD COLUMN IF NOT EXISTS customer_email            text,
  ADD COLUMN IF NOT EXISTS customer_phone            text,
  ADD COLUMN IF NOT EXISTS delivery_address_line     text,
  ADD COLUMN IF NOT EXISTS city                      text,
  ADD COLUMN IF NOT EXISTS nearest_landmark          text,
  ADD COLUMN IF NOT EXISTS preferred_delivery_time   text,
  ADD COLUMN IF NOT EXISTS special_instructions      text,
  ADD COLUMN IF NOT EXISTS meal_plan_id              uuid references meal_plans(id) on delete set null,
  ADD COLUMN IF NOT EXISTS meal_plan_name            text,
  ADD COLUMN IF NOT EXISTS payment_method            text,
  ADD COLUMN IF NOT EXISTS checkout_status           text not null default 'order_received',
  ADD COLUMN IF NOT EXISTS checkout_payment_status   text not null default 'pending',
  ADD COLUMN IF NOT EXISTS delivery_status           text not null default 'not_assigned',
  ADD COLUMN IF NOT EXISTS admin_note                text;

-- Unique index on order_number (only for rows that have one)
CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_unique
  ON orders (order_number)
  WHERE order_number IS NOT NULL;

-- Index for guest tracking lookups
CREATE INDEX IF NOT EXISTS orders_customer_phone_idx  ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx  ON orders (customer_email);
CREATE INDEX IF NOT EXISTS orders_checkout_status_idx ON orders (checkout_status);

-- ─── 3. Extend order_items ────────────────────────────────────────────────
-- meal_id was NOT NULL; make nullable to allow custom/ad-hoc items
ALTER TABLE order_items ALTER COLUMN meal_id DROP NOT NULL;

ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS meal_name     text,
  ADD COLUMN IF NOT EXISTS meal_category text,
  ADD COLUMN IF NOT EXISTS calories      integer,
  ADD COLUMN IF NOT EXISTS price         numeric(10,2),
  ADD COLUMN IF NOT EXISTS item_date     date;

-- ─── 4. Order status history ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
  id          uuid primary key default uuid_generate_v4(),
  order_id    uuid not null references orders(id) on delete cascade,
  status      text not null,
  note        text,
  updated_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

CREATE INDEX IF NOT EXISTS order_status_history_order_id_idx
  ON order_status_history (order_id);

-- ─── 5. RLS ───────────────────────────────────────────────────────────────

-- Allow anyone to insert a guest order (no auth required)
CREATE POLICY IF NOT EXISTS "Anyone can insert orders"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert order_items"
  ON order_items FOR INSERT WITH CHECK (true);

-- Guest orders (user_id IS NULL) are readable by anyone so
-- guests can look up their own order by order_number + phone/email.
-- Application layer enforces the phone/email match.
CREATE POLICY IF NOT EXISTS "Guest orders are publicly readable"
  ON orders FOR SELECT USING (user_id IS NULL);

-- Status history RLS
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Admin manages status history"
  ON order_status_history FOR ALL
  USING (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

CREATE POLICY IF NOT EXISTS "Users read own order status history"
  ON order_status_history FOR SELECT
  USING (
    exists (
      select 1 from orders
      where orders.id = order_id and orders.user_id = auth.uid()
    )
  );

-- ─── 6. Extend admin policy to reach new orders ───────────────────────────
-- (existing "Admin full access orders" and "Admin full access order_items"
--  policies already cover all rows; nothing new needed there)
