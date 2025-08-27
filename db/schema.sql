-- Pet Clinic Database Schema (Postgres / Supabase)
-- Safe to run on a fresh database. Includes indexes and views.

create extension if not exists pgcrypto;

-- Owners
create table if not exists owners (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now()
);

-- Pets
create table if not exists pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  name text not null,
  species text not null,
  breed text,
  birthdate date,
  created_at timestamptz not null default now()
);

-- Appointments
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  owner_id uuid not null references owners(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null,
  treatment text,
  created_at timestamptz not null default now()
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references owners(id) on delete cascade,
  pet_id uuid references pets(id) on delete set null,
  body text not null,
  status text not null check (status in ('posted','scheduled','sent','failed')),
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

-- Message schedules (optional explicit table)
create table if not exists message_schedules (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  scheduled_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  owner_id uuid not null references owners(id) on delete cascade,
  type text not null check (type in ('vaccine','checkup','grooming','medication_refill')),
  status text not null default 'pending' check (status in ('pending','in_progress','completed','cancelled')),
  notes text,
  created_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists idx_owners_full_name on owners using gin (to_tsvector('simple', full_name));
create index if not exists idx_pets_name on pets (name);
create index if not exists idx_pets_owner on pets (owner_id);
create index if not exists idx_messages_owner on messages (owner_id);
create index if not exists idx_messages_pet on messages (pet_id);
create index if not exists idx_messages_scheduled_at on messages (scheduled_at);
create index if not exists idx_appointments_pet_starts on appointments (pet_id, starts_at);
create index if not exists idx_orders_pet_created on orders (pet_id, created_at);

-- Views for simplified API consumption
create or replace view pets_view as
select p.id as pet_id, p.name as pet_name, p.species, p.breed, o.id as owner_id, o.full_name as owner_full_name
from pets p
join owners o on o.id = p.owner_id;

create or replace view owners_view as
select id, full_name, phone, email, created_at from owners;

create or replace view pets_full_profile_view as
with mh as (
  select a.pet_id, json_agg(json_build_object('id', a.id, 'starts_at', a.starts_at, 'reason', a.reason, 'treatment', a.treatment) order by a.starts_at desc) as medical_history_json
  from appointments a
  group by a.pet_id
),
msg as (
  select m.pet_id, json_agg(json_build_object('id', m.id, 'body', m.body, 'status', m.status, 'scheduled_at', m.scheduled_at, 'created_at', m.created_at) order by m.created_at desc) as messages_json
  from messages m
  group by m.pet_id
)
select p.id as pet_id,
       p.name as pet_name,
       o.full_name as owner_full_name,
       coalesce(mh.medical_history_json, '[]'::json) as medical_history_json,
       coalesce(msg.messages_json, '[]'::json) as messages_json
from pets p
join owners o on o.id = p.owner_id
left join mh on mh.pet_id = p.id
left join msg on msg.pet_id = p.id;

create or replace view owner_profiles_view as
select o.id as owner_id,
       o.full_name,
       o.phone,
       o.email,
       coalesce(json_agg(json_build_object('pet_id', p.id, 'name', p.name, 'species', p.species) order by p.created_at) filter (where p.id is not null), '[]'::json) as pets
from owners o
left join pets p on p.owner_id = o.id
group by o.id;

create or replace view message_schedules_view as
select s.id, s.message_id, s.scheduled_at, m.owner_id, m.pet_id, m.body
from message_schedules s
join messages m on m.id = s.message_id;

create or replace view appointments_view as
select a.*, p.name as pet_name, o.full_name as owner_full_name
from appointments a
join pets p on p.id = a.pet_id
join owners o on o.id = a.owner_id;

create or replace view orders_view as
select ord.*, p.name as pet_name, o.full_name as owner_full_name
from orders ord
join pets p on p.id = ord.pet_id
join owners o on o.id = ord.owner_id;

-- Example query helpers
-- Search pets
-- select * from pets_view where pet_name ilike '%fluffy%' order by pet_name;
-- Search owners
-- select * from owners where full_name ilike '%alex%';


