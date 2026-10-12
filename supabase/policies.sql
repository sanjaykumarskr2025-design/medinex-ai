-- MediNex AI Row Level Security Policies
-- Run this AFTER schema.sql in your Supabase SQL Editor

-- Enable RLS on all tables
alter table user_profiles enable row level security;
alter table health_records enable row level security;
alter table health_metrics enable row level security;
alter table appointments enable row level security;
alter table reminders enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;

-- User Profiles: users can only read/update their own profile
create policy "Users can view own profile"
  on user_profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Health Records: full CRUD restricted to owner
create policy "Users can view own records"
  on health_records for select
  using (auth.uid() = user_id);

create policy "Users can insert own records"
  on health_records for insert
  with check (auth.uid() = user_id);

create policy "Users can update own records"
  on health_records for update
  using (auth.uid() = user_id);

create policy "Users can delete own records"
  on health_records for delete
  using (auth.uid() = user_id);

-- Health Metrics: same pattern
create policy "Users can view own metrics"
  on health_metrics for select
  using (auth.uid() = user_id);

create policy "Users can insert own metrics"
  on health_metrics for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own metrics"
  on health_metrics for delete
  using (auth.uid() = user_id);

-- Appointments
create policy "Users can view own appointments"
  on appointments for select
  using (auth.uid() = user_id);

create policy "Users can insert own appointments"
  on appointments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own appointments"
  on appointments for update
  using (auth.uid() = user_id);

create policy "Users can delete own appointments"
  on appointments for delete
  using (auth.uid() = user_id);

-- Reminders
create policy "Users can view own reminders"
  on reminders for select
  using (auth.uid() = user_id);

create policy "Users can insert own reminders"
  on reminders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reminders"
  on reminders for update
  using (auth.uid() = user_id);

create policy "Users can delete own reminders"
  on reminders for delete
  using (auth.uid() = user_id);

-- AI Conversations: owner-only access
create policy "Users can view own conversations"
  on ai_conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on ai_conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on ai_conversations for delete
  using (auth.uid() = user_id);

-- AI Messages: access through conversation ownership
-- Users can view messages from their own conversations
create policy "Users can view messages in own conversations"
  on ai_messages for select
  using (
    exists (
      select 1 from ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on ai_messages for insert
  with check (
    exists (
      select 1 from ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );

create policy "Users can delete messages in own conversations"
  on ai_messages for delete
  using (
    exists (
      select 1 from ai_conversations
      where ai_conversations.id = ai_messages.conversation_id
      and ai_conversations.user_id = auth.uid()
    )
  );
