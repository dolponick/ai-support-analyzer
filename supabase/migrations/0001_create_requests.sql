create extension if not exists pgcrypto;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),

  customer_name text not null
    check (char_length(customer_name) between 1 and 120),

  message text not null
    check (char_length(message) between 1 and 4000),

  priority text null
    check (
      priority is null or priority in (
        'низький',
        'середній',
        'високий'
      )
    ),

  category text null
    check (
      category is null or category in (
        'оплата',
        'доставка',
        'скарга',
        'технічне',
        'акаунт',
        'інше'
      )
    ),

  summary text null,
  draft_reply text null,

  created_at timestamptz not null default now(),
  analyzed_at timestamptz null
);

alter table public.requests enable row level security;
