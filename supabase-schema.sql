-- Run this in your Supabase SQL editor

create table if not exists users (
  id text primary key,
  email text unique not null,
  name text,
  avatar text,
  updated_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  recipe_id text not null,
  user_id text not null references users(id),
  user_name text not null,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

create table if not exists bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id text not null references users(id),
  recipe_id text not null,
  created_at timestamptz default now(),
  unique(user_id, recipe_id)
);

create table if not exists community_recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  region text default 'Himachal Pradesh',
  category text not null,
  diet text not null,
  "prepTime" int,
  "cookTime" int,
  servings int,
  description text,
  ingredients jsonb,
  steps jsonb,
  tags jsonb,
  "submittedBy" text references users(id),
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  "createdAt" timestamptz default now()
);
