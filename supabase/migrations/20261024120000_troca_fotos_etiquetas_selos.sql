-- 1) Fotos do carro de entrada no pedido de busca ("Não encontrou seu carro?").
-- 2) Etiquetas e 3) selos personalizados, criados pelo admin e disponíveis para todos os veículos
--    (como os opcionais: "+ Adicionar" cria um item novo na lista).

-- ---------------------------------------------------------------------------
-- 1) Fotos da troca
-- ---------------------------------------------------------------------------

create table public.pedido_fotos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references public.pedidos_busca (id) on delete cascade,
  path text not null unique,
  ordem smallint not null check (ordem between 0 and 7),
  created_at timestamptz not null default now(),
  unique (pedido_id, ordem) deferrable initially deferred
);

comment on table public.pedido_fotos is 'Fotos do carro de entrada enviadas no pedido de busca (bucket privado "trocas"). Até 8.';

create index pedido_fotos_ordem_idx on public.pedido_fotos (pedido_id, ordem);

alter table public.pedido_fotos enable row level security;
create policy "Admin gerencia fotos de pedidos" on public.pedido_fotos for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));

create or replace function public.limitar_fotos()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  total integer;
begin
  if tg_table_name = 'veiculo_fotos' then
    select count(*) into total from public.veiculo_fotos where veiculo_id = new.veiculo_id;
    if total >= 20 then
      raise exception 'Máximo de 20 fotos por veículo.' using errcode = 'check_violation';
    end if;
  elsif tg_table_name = 'consignacao_fotos' then
    select count(*) into total from public.consignacao_fotos where consignacao_id = new.consignacao_id;
    if total >= 8 then
      raise exception 'Máximo de 8 fotos por consignação.' using errcode = 'check_violation';
    end if;
  else
    select count(*) into total from public.pedido_fotos where pedido_id = new.pedido_id;
    if total >= 8 then
      raise exception 'Máximo de 8 fotos por pedido.' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger pedido_fotos_limite before insert on public.pedido_fotos
  for each row execute function public.limitar_fotos();

-- trocas: privado, como consignacoes (o cliente envia por URL assinada; o admin lê por URL assinada).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trocas', 'trocas', false, 10485760, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin gerencia fotos de trocas no Storage"
  on storage.objects for all to authenticated
  using (bucket_id = 'trocas' and (select public.eh_admin()))
  with check (bucket_id = 'trocas' and (select public.eh_admin()));

-- ---------------------------------------------------------------------------
-- 2) Etiquetas personalizadas (cartão do catálogo)
-- ---------------------------------------------------------------------------

create table public.etiquetas_personalizadas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 20),
  created_at timestamptz not null default now()
);

create unique index etiquetas_personalizadas_nome_idx on public.etiquetas_personalizadas (lower(nome));

comment on table public.etiquetas_personalizadas is 'Etiquetas escritas pelo admin (além de Destaque, Novidade e Baixa km).';

alter table public.veiculos
  drop constraint veiculos_etiqueta_check,
  add constraint veiculos_etiqueta_check check (etiqueta in ('nenhuma', 'destaque', 'novidade', 'baixa_km', 'personalizada')),
  add column etiqueta_personalizada_id uuid references public.etiquetas_personalizadas (id) on delete set null;

comment on column public.veiculos.etiqueta_personalizada_id is 'Etiqueta escrita pelo admin, quando etiqueta = ''personalizada''.';

create index veiculos_etiqueta_personalizada_idx on public.veiculos (etiqueta_personalizada_id) where etiqueta_personalizada_id is not null;

-- ---------------------------------------------------------------------------
-- 3) Selos personalizados (página do veículo)
-- ---------------------------------------------------------------------------

create table public.selos_personalizados (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 40),
  created_at timestamptz not null default now()
);

create unique index selos_personalizados_nome_idx on public.selos_personalizados (lower(nome));

comment on table public.selos_personalizados is 'Selos verificados escritos pelo admin (além de IPVA pago, Único dono…).';

create table public.veiculo_selos (
  veiculo_id uuid not null references public.veiculos (id) on delete cascade,
  selo_id uuid not null references public.selos_personalizados (id) on delete cascade,
  primary key (veiculo_id, selo_id)
);

create index veiculo_selos_selo_idx on public.veiculo_selos (selo_id);

-- ---------------------------------------------------------------------------
-- RLS: o catálogo lê as listas e os selos dos veículos visíveis; o admin gerencia tudo.
-- ---------------------------------------------------------------------------

alter table public.etiquetas_personalizadas enable row level security;
alter table public.selos_personalizados enable row level security;
alter table public.veiculo_selos enable row level security;

create policy "Catálogo lê as etiquetas personalizadas"
  on public.etiquetas_personalizadas for select to anon, authenticated
  using (true);

create policy "Catálogo lê os selos personalizados"
  on public.selos_personalizados for select to anon, authenticated
  using (true);

create policy "Catálogo lê selos de veículos visíveis"
  on public.veiculo_selos for select to anon, authenticated
  using ((select public.veiculo_visivel(veiculo_id)));

create policy "Admin gerencia etiquetas personalizadas" on public.etiquetas_personalizadas for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia selos personalizados" on public.selos_personalizados for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia selos de veículos" on public.veiculo_selos for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
