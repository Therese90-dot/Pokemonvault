reate table if not exists public.my_collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone not null default now(),
  unique (user_id, card_id)
);

create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, card_id)
);

create table if not exists public.trade_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null,
  created_at timestamp with time zone not null default now(),
  unique (user_id, card_id)
);

alter table public.my_collection enable row level security;
alter table public.wishlist enable row level security;
alter table public.trade_cards enable row level security;

create policy "Users can select own collection"
on public.my_collection for select
using (auth.uid() = user_id);

create policy "Users can insert own collection"
on public.my_collection for insert
with check (auth.uid() = user_id);

create policy "Users can update own collection"
on public.my_collection for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own collection"
on public.my_collection for delete
using (auth.uid() = user_id);

create policy "Users can select own wishlist"
on public.wishlist for select
using (auth.uid() = user_id);

create policy "Users can insert own wishlist"
on public.wishlist for insert
with check (auth.uid() = user_id);

create policy "Users can update own wishlist"
on public.wishlist for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own wishlist"
on public.wishlist for delete
using (auth.uid() = user_id);

create policy "Users can select own trade cards"
on public.trade_cards for select
using (auth.uid() = user_id);

create policy "Users can insert own trade cards"
on public.trade_cards for insert
with check (auth.uid() = user_id);

create policy "Users can update own trade cards"
on public.trade_cards for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own trade cards"
on public.trade_cards for delete
using (auth.uid() = user_id);
