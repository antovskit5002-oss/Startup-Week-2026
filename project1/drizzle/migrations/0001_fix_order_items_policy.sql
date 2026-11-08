create or replace function public.can_add_order_item(_order_id uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.orders o where o.id = _order_id and o.created_at > now() - interval '10 minutes' and (o.user_id is null or o.user_id = auth.uid()) and not exists (select 1 from public.order_items i where i.order_id = o.id and i.id is null))
$$;
drop policy "add items" on public.order_items;
create policy "add items" on public.order_items for insert to anon, authenticated with check (public.can_add_order_item(order_id));