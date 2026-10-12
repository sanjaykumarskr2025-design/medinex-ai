-- MediNex AI Database Schema
-- Run this in your Supabase SQL Editor to set up all tables

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- User profiles table (extends Supabase auth.users)
create table if not exists user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text default '',
  preferred_language text default 'en' check (preferred_language in ('en', 'ta', 'hi', 'es')),
  units_system text default 'metric' check (units_system in ('metric', 'imperial')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Health records
create table if not exists health_records (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_type text not null check (record_type in ('checkup', 'lab_result', 'prescription', 'vaccination', 'procedure', 'symptom', 'note')),
  title text not null check (char_length(title) <= 200),
  record_date date not null,
  notes text default '' check (char_length(notes) <= 5000),
  measurements jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_health_records_user on health_records(user_id);
create index idx_health_records_type on health_records(user_id, record_type);
create index idx_health_records_date on health_records(user_id, record_date desc);

-- Health metrics (individual measurements for charting)
create table if not exists health_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  metric_type text not null check (metric_type in ('blood_pressure', 'heart_rate', 'weight', 'blood_sugar', 'temperature', 'oxygen_saturation', 'sleep_hours', 'steps', 'water_intake')),
  value numeric not null,
  secondary_value numeric, -- e.g., diastolic for blood pressure
  unit text not null,
  recorded_at timestamptz not null,
  notes text default '',
  created_at timestamptz default now()
);

create index idx_health_metrics_user on health_metrics(user_id);
create index idx_health_metrics_type on health_metrics(user_id, metric_type);
create index idx_health_metrics_date on health_metrics(user_id, recorded_at desc);

-- Appointments
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider_name text not null check (char_length(provider_name) <= 200),
  purpose text not null check (char_length(purpose) <= 500),
  appointment_date timestamptz not null,
  location text default '',
  notes text default '' check (char_length(notes) <= 2000),
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_appointments_user on appointments(user_id);
create index idx_appointments_date on appointments(user_id, appointment_date);
create index idx_appointments_status on appointments(user_id, status);

-- Reminders
create table if not exists reminders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) <= 200),
  reminder_type text not null check (reminder_type in ('medication', 'appointment', 'wellness', 'custom')),
  due_date timestamptz not null,
  recurrence text default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  is_completed boolean default false,
  notes text default '' check (char_length(notes) <= 1000),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_reminders_user on reminders(user_id);
create index idx_reminders_due on reminders(user_id, due_date);
create index idx_reminders_active on reminders(user_id, is_completed, due_date);

-- AI Conversations
create table if not exists ai_conversations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text default 'New Conversation',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_conversations_user on ai_conversations(user_id);

-- AI Messages
create table if not exists ai_messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) <= 10000),
  created_at timestamptz default now()
);

create index idx_messages_conversation on ai_messages(conversation_id);

-- Updated-at trigger function
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_user_profiles_modtime before update on user_profiles for each row execute function update_modified_column();
create trigger update_health_records_modtime before update on health_records for each row execute function update_modified_column();
create trigger update_appointments_modtime before update on appointments for each row execute function update_modified_column();
create trigger update_reminders_modtime before update on reminders for each row execute function update_modified_column();
create trigger update_conversations_modtime before update on ai_conversations for each row execute function update_modified_column();

-- Auto-create user profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into user_profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();
