
create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  species text not null default 'Unknown',
  location text,
  photo_path text,
  moisture_min int not null default 40,
  moisture_max int not null default 70,
  temp_min int not null default 18,
  temp_max int not null default 27,
  humidity_min int not null default 40,
  humidity_max int not null default 70,
  light_min int not null default 30,
  light_max int not null default 75,
  auto_watering boolean not null default true,
  watering_threshold int not null default 35,
  watering_paused_until timestamptz,
  reminder_every_days int not null default 7,
  last_watered_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.plants to authenticated;
grant all on public.plants to service_role;
alter table public.plants enable row level security;
create policy "own plants" on public.plants for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  plant_id uuid not null unique references public.plants(id) on delete cascade,
  name text not null default 'Smart Plant Pot',
  connection text not null default 'simulated' check (connection in ('simulated','wifi','bluetooth')),
  status text not null default 'online',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.devices to authenticated;
grant all on public.devices to service_role;
alter table public.devices enable row level security;
create policy "own devices" on public.devices for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.sensor_readings (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  plant_id uuid not null references public.plants(id) on delete cascade,
  recorded_at timestamptz not null default now(),
  soil_moisture numeric, humidity numeric, temperature numeric, light numeric, tank_level numeric
);
create index on public.sensor_readings (plant_id, recorded_at desc);
grant select, insert, delete on public.sensor_readings to authenticated;
grant all on public.sensor_readings to service_role;
alter table public.sensor_readings enable row level security;
create policy "own readings" on public.sensor_readings for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.watering_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  source text not null default 'auto',
  amount_ml int not null default 200
);
grant select, insert, delete on public.watering_events to authenticated;
grant all on public.watering_events to service_role;
alter table public.watering_events enable row level security;
create policy "own watering" on public.watering_events for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  created_at timestamptz not null default now(),
  severity text not null default 'warning',
  message text not null
);
grant select, insert, delete on public.alerts to authenticated;
grant all on public.alerts to service_role;
alter table public.alerts enable row level security;
create policy "own alerts" on public.alerts for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.health_assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'ok',
  summary text not null
);
grant select, insert, delete on public.health_assessments to authenticated;
grant all on public.health_assessments to service_role;
alter table public.health_assessments enable row level security;
create policy "own health" on public.health_assessments for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  plant_id uuid references public.plants(id) on delete set null,
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.chat_threads to authenticated;
grant all on public.chat_threads to service_role;
alter table public.chat_threads enable row level security;
create policy "own threads" on public.chat_threads for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  image_path text,
  context_mode text,
  created_at timestamptz not null default now()
);
create index on public.chat_messages (thread_id, created_at);
grant select, insert, delete on public.chat_messages to authenticated;
grant all on public.chat_messages to service_role;
alter table public.chat_messages enable row level security;
create policy "own messages" on public.chat_messages for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.device_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  thread_id uuid references public.chat_threads(id) on delete set null,
  action_type text not null,
  params jsonb not null default '{}'::jsonb,
  reason text,
  status text not null default 'pending',
  validation_note text,
  result_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
grant select, insert, update, delete on public.device_actions to authenticated;
grant all on public.device_actions to service_role;
alter table public.device_actions enable row level security;
create policy "own actions" on public.device_actions for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.simulate_device_history(_device uuid, _scenario text default 'normal')
returns void language plpgsql security invoker set search_path = public as $$
declare d record; t timestamptz; m numeric; i int;
begin
  select * into d from public.devices where id = _device;
  if d is null or d.user_id <> auth.uid() then raise exception 'not allowed'; end if;
  m := 55;
  for i in reverse 168..0 loop
    t := now() - make_interval(hours => i);
    m := m - 0.5 + (random() - 0.5);
    if m < 38 or (_scenario = 'overwatered' and i in (40, 10)) then
      m := least(98, m + case when _scenario = 'overwatered' then 35 else 30 end);
      insert into public.watering_events(user_id, plant_id, occurred_at, source) values (d.user_id, d.plant_id, t, 'auto');
    end if;
    if _scenario = 'overwatered' and i < 48 then m := greatest(m, 85 + random()*8); end if;
    insert into public.sensor_readings(user_id, device_id, plant_id, recorded_at, soil_moisture, humidity, temperature, light, tank_level)
    values (d.user_id, d.id, d.plant_id, t, round(least(100, greatest(0, m)), 1),
      round(60 + 6*sin(i/4.0) + random()*3, 1),
      round(22 + 2.5*sin((i - 6)/3.82) + random(), 1),
      round(greatest(0, 70*sin(((extract(hour from t)::int - 6)/12.0)*pi())) + random()*5, 1),
      round(80 - (168 - i)*0.15, 1));
  end loop;
  update public.plants set last_watered_at = (select max(occurred_at) from public.watering_events where plant_id = d.plant_id) where id = d.plant_id;
end $$;
grant execute on function public.simulate_device_history(uuid, text) to authenticated;

create policy "users upload own photos" on storage.objects for insert to authenticated with check (bucket_id = 'plant-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "users read own photos" on storage.objects for select to authenticated using (bucket_id = 'plant-photos' and (storage.foldername(name))[1] = auth.uid()::text);
