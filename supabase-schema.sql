-- SQL Schema for Focus & Doa
-- Import this into the Supabase SQL Editor

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  date_of_birth date,
  timezone text default 'Asia/Jakarta',
  latitude numeric,
  longitude numeric,
  city text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 2. Create daily_plans table
create table public.daily_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  plan_date date default current_date not null,
  title text not null,
  description text,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium' not null,
  status text check (status in ('todo', 'in_progress', 'done')) default 'todo' not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for daily_plans
alter table public.daily_plans enable row level security;

create policy "Users can manage their own daily plans"
  on public.daily_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. Create prayer_checklists table
create table public.prayer_checklists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prayer_date date default current_date not null,
  fajr_done boolean default false not null,
  dhuhr_done boolean default false not null,
  asr_done boolean default false not null,
  maghrib_done boolean default false not null,
  isha_done boolean default false not null,
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint unique_user_date unique (user_id, prayer_date)
);

-- Enable RLS for prayer_checklists
alter table public.prayer_checklists enable row level security;

create policy "Users can manage their own prayer checklists"
  on public.prayer_checklists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Create notes table
create table public.notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text,
  category text default 'General' not null,
  note_date date default current_date not null,
  is_archived boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for notes
alter table public.notes enable row level security;

create policy "Users can manage their own notes"
  on public.notes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 5. Create reminders table
create table public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  reminder_time time not null,
  message text,
  active_days integer[] default array[0,1,2,3,4,5,6] not null,
  is_active boolean default true not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS for reminders
alter table public.reminders enable row level security;

create policy "Users can manage their own reminders"
  on public.reminders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 6. Create favorite_duas table
create table public.favorite_duas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  dua_id text not null,
  created_at timestamptz default now() not null,
  constraint unique_user_dua unique (user_id, dua_id)
);

-- Enable RLS for favorite_duas
alter table public.favorite_duas enable row level security;

create policy "Users can manage their own favorite duas"
  on public.favorite_duas for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 7. Trigger to automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
