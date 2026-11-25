-- Schema for SPIKE (Lengua de Señas Colombiana - LSC)
create extension if not exists "uuid-ossp";

-- 1. PROFILES TABLE (Linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  email text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. GAME PROGRESS TABLE
create table if not exists public.game_progress (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  done integer default 0 not null,
  master_count integer default 0 not null,
  master_seals text[] default '{}'::text[] not null,
  taught jsonb default '{"nino": 0, "papa": 0}'::jsonb not null,
  play_seconds integer default 0 not null,
  days text[] default '{}'::text[] not null,
  learned jsonb default '{}'::jsonb not null,
  replay text[] default '{}'::text[] not null,
  tutorial_done boolean default false not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS on game_progress
alter table public.game_progress enable row level security;

-- Game progress policies
create policy "Users can view their own game progress"
  on public.game_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert their own game progress"
  on public.game_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own game progress"
  on public.game_progress for update
  using (auth.uid() = user_id);

-- 3. GAME LOGS TABLE (For gameplay events and investigator mode)
create table if not exists public.game_logs (
  id bigserial primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  hora text not null,
  modulo text not null,
  turno text not null,
  actor text not null,
  accion text not null,
  contenido text not null,
  correcto text not null,
  intento integer default 1 not null,
  calor integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- Enable RLS on game_logs
alter table public.game_logs enable row level security;

create policy "Users can view their own game logs"
  on public.game_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own game logs"
  on public.game_logs for insert
  with check (auth.uid() = user_id);

-- 4. AUTOMATIC USER CREATION TRIGGER
-- When a user signs up with Supabase Auth, automatically create their profile and initial game_progress
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_name text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  
  insert into public.profiles (id, username, email)
  values (new.id, raw_name, new.email)
  on conflict (id) do update
  set username = excluded.username,
      email = excluded.email,
      updated_at = timezone('utc'::text, now());

  insert into public.game_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
