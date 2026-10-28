-- Run once in the project's SQL Editor before enabling PUSH_ENABLED.
-- Adds only PWA tables/functions. Does not change trades/trade_comments policies.
begin;

create table public.push_devices (
  device_id text primary key check (device_id ~ '^[a-f0-9]{64}$'),
  endpoint_hash text not null unique check (endpoint_hash ~ '^[a-f0-9]{64}$'),
  subscription jsonb not null check (jsonb_typeof(subscription) = 'object' and octet_length(subscription::text) <= 4096),
  updated_at timestamptz not null default now()
);
create table public.push_watches (
  device_id text not null references public.push_devices(device_id) on delete cascade,
  trade_id bigint not null references public.trades(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (device_id, trade_id)
);
create index push_watches_trade_idx on public.push_watches(trade_id);
create table public.push_deliveries (
  comment_id bigint not null references public.trade_comments(id) on delete cascade,
  device_id text not null references public.push_devices(device_id) on delete cascade,
  status text not null check (status in ('pending','sent','retry')),
  lease_until timestamptz not null,
  attempts integer not null default 1,
  created_at timestamptz not null default now(),
  primary key (comment_id, device_id)
);
create index push_deliveries_device_idx on public.push_deliveries(device_id);
create table public.push_rate_limits (
  bucket_key text not null check (bucket_key ~ '^[a-f0-9]{64}$'),
  window_start timestamptz not null,
  hits integer not null default 1,
  primary key (bucket_key, window_start)
);
create index push_rate_limits_window_idx on public.push_rate_limits(window_start);
alter table public.push_devices enable row level security;
alter table public.push_watches enable row level security;
alter table public.push_deliveries enable row level security;
alter table public.push_rate_limits enable row level security;
revoke all on public.push_devices, public.push_watches, public.push_deliveries, public.push_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on public.push_devices, public.push_watches, public.push_deliveries, public.push_rate_limits to service_role;

-- SECURITY INVOKER: service_role only, with no escalation of browser privileges.
create function public.register_push_watch(p_device text, p_trade bigint, p_endpoint_hash text, p_subscription jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('pwa:' || p_device, 0));
  if not exists(select 1 from public.trades where id=p_trade and status='active') then
    raise exception 'trade_unavailable';
  end if;
  if exists(select 1 from public.push_devices where endpoint_hash=p_endpoint_hash and device_id<>p_device) then
    raise exception 'endpoint_owned';
  end if;
  if not exists(select 1 from public.push_watches where device_id=p_device and trade_id=p_trade)
     and (select count(*) from public.push_watches where device_id=p_device)>=50 then
    raise exception 'watch_limit';
  end if;
  insert into public.push_devices(device_id,endpoint_hash,subscription) values(p_device,p_endpoint_hash,p_subscription)
  on conflict(device_id) do update set endpoint_hash=excluded.endpoint_hash, subscription=excluded.subscription, updated_at=now();
  insert into public.push_watches(device_id,trade_id) values(p_device,p_trade) on conflict do nothing;
end;
$$;

create function public.claim_push_delivery(p_comment bigint, p_device text)
returns boolean language sql security invoker set search_path = '' as $$
  with claimed as (
    insert into public.push_deliveries(comment_id,device_id,status,lease_until)
    values(p_comment,p_device,'pending',now()+interval '60 seconds')
    on conflict(comment_id,device_id) do update
      set status='pending',lease_until=now()+interval '60 seconds',attempts=public.push_deliveries.attempts+1
      where public.push_deliveries.status<>'sent' and public.push_deliveries.lease_until<=now()
    returning 1
  ) select exists(select 1 from claimed);
$$;
create function public.consume_push_rate(p_key text, p_limit integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare allowed boolean;
begin
  delete from public.push_rate_limits where window_start < now()-interval '2 hours';
  with consumed as (
    insert into public.push_rate_limits(bucket_key,window_start) values(p_key,date_trunc('minute',now()))
    on conflict(bucket_key,window_start) do update set hits=public.push_rate_limits.hits+1
      where public.push_rate_limits.hits<p_limit
    returning 1
  ) select exists(select 1 from consumed) into allowed;
  return allowed;
end;
$$;
revoke all on function public.register_push_watch(text,bigint,text,jsonb), public.claim_push_delivery(bigint,text), public.consume_push_rate(text,integer) from public, anon, authenticated;
grant execute on function public.register_push_watch(text,bigint,text,jsonb), public.claim_push_delivery(bigint,text), public.consume_push_rate(text,integer) to service_role;
comment on table public.push_devices is 'Private Web Push subscriptions. Accessible through server API only.';
commit;
