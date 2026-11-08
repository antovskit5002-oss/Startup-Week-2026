create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  status text not null default 'awaiting_payment',
  customer_name text not null,
  email text not null,
  phone text,
  address text not null,
  city text not null,
  postal_code text not null,
  country text not null,
  notes text,
  total_cents integer,
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer
);
grant select, insert on public.orders, public.order_items to authenticated;
grant insert on public.orders, public.order_items to anon;
grant all on public.orders, public.order_items to service_role;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "create order auth" on public.orders for insert to authenticated with check (user_id = auth.uid() and status = 'awaiting_payment');
create policy "create order guest" on public.orders for insert to anon with check (user_id is null and status = 'awaiting_payment');
create policy "own items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "add items" on public.order_items for insert to anon, authenticated with check (exists (select 1 from public.orders o where o.id = order_id and o.created_at > now() - interval '10 minutes' and (o.user_id is null or o.user_id = auth.uid())));

create table public.gift_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  premium_months integer not null default 3,
  order_id uuid references public.orders(id) on delete set null,
  redeemed_by uuid,
  redeemed_at timestamptz,
  app_activation_status text not null default 'not_synced',
  created_at timestamptz not null default now()
);
grant select on public.gift_codes to authenticated;
grant all on public.gift_codes to service_role;
alter table public.gift_codes enable row level security;
create policy "own redeemed codes" on public.gift_codes for select to authenticated using (redeemed_by = auth.uid());

create or replace function public.redeem_gift_code(_code text) returns json language plpgsql security definer set search_path = public as $$
declare g public.gift_codes;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', 'Please sign in first.'); end if;
  select * into g from public.gift_codes where upper(code) = upper(trim(_code)) for update;
  if not found then return json_build_object('ok', false, 'error', 'This code is not valid.'); end if;
  if g.redeemed_by is not null then return json_build_object('ok', false, 'error', 'This code has already been redeemed.'); end if;
  update public.gift_codes set redeemed_by = auth.uid(), redeemed_at = now(), app_activation_status = 'pending' where id = g.id;
  return json_build_object('ok', true, 'months', g.premium_months);
end; $$;
revoke execute on function public.redeem_gift_code(text) from anon, public;
grant execute on function public.redeem_gift_code(text) to authenticated;

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null, contact_person text not null, email text not null, phone text,
  devices integer not null, message text, created_at timestamptz not null default now()
);
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, topic text not null, message text not null,
  created_at timestamptz not null default now()
);
grant insert on public.quote_requests, public.contact_messages to anon, authenticated;
grant all on public.quote_requests, public.contact_messages to service_role;
alter table public.quote_requests enable row level security;
alter table public.contact_messages enable row level security;
create policy "submit quote" on public.quote_requests for insert to anon, authenticated with check (devices > 0 and length(company_name) < 200);
create policy "submit contact" on public.contact_messages for insert to anon, authenticated with check (length(message) < 5000);

insert into public.gift_codes (code) values ('PLANT-DEMO-2026');