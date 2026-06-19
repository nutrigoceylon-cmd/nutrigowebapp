-- Migration 010: Store explicit booking contact details for notifications

alter table session_bookings
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text;
