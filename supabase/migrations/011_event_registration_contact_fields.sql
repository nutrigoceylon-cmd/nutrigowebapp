alter table event_registrations
  alter column user_id drop not null;

alter table event_registrations
  add column if not exists contact_name text,
  add column if not exists contact_phone text,
  add column if not exists contact_email text,
  add column if not exists attendee_age integer,
  add column if not exists attendee_gender text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'event_registrations_attendee_age_check'
  ) then
    alter table event_registrations
      add constraint event_registrations_attendee_age_check
      check (attendee_age is null or attendee_age between 1 and 120);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'event_registrations_attendee_gender_check'
  ) then
    alter table event_registrations
      add constraint event_registrations_attendee_gender_check
      check (attendee_gender is null or attendee_gender in ('male', 'female', 'other'));
  end if;
end $$;

create policy "Public insert event registrations"
on event_registrations
for insert
with check (user_id is null or auth.uid() = user_id);
