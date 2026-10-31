-- Cupom de indicação: só identifica quem indicou o cliente (não dá desconto nem calcula prêmio).
-- O admin cria os cupons; o cliente informa o código (opcional) nos formulários e no "Tenho interesse".
-- Gravações públicas só no servidor, com a chave de serviço, como nos formulários. Nada para anon.

create table public.cupons (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique check (codigo ~ '^[A-Z0-9]{3,15}$'),
  indicador_nome text not null check (char_length(btrim(indicador_nome)) between 2 and 120),
  indicador_whatsapp text check (indicador_whatsapp ~ '^[0-9]{10,11}$'),
  observacao text not null default '' check (char_length(observacao) <= 500),
  ativo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cupons is 'Cupons de indicação criados pelo admin. Inativo conta como inválido para o cliente.';

create trigger cupons_updated_at before update on public.cupons
  for each row execute function public.definir_updated_at();

alter table public.simulacoes add column cupom_id uuid references public.cupons (id) on delete restrict;
alter table public.pedidos_busca add column cupom_id uuid references public.cupons (id) on delete restrict;
alter table public.consignacoes add column cupom_id uuid references public.cupons (id) on delete restrict;

create index simulacoes_cupom_idx on public.simulacoes (cupom_id) where cupom_id is not null;
create index pedidos_busca_cupom_idx on public.pedidos_busca (cupom_id) where cupom_id is not null;
create index consignacoes_cupom_idx on public.consignacoes (cupom_id) where cupom_id is not null;

-- Cliques no "Tenho interesse" com cupom. Sem nenhum dado do cliente.
create table public.cupom_cliques (
  id uuid primary key default gen_random_uuid(),
  cupom_id uuid not null references public.cupons (id) on delete restrict,
  veiculo_id uuid references public.veiculos (id) on delete set null,
  veiculo_nome text check (char_length(veiculo_nome) <= 200),
  created_at timestamptz not null default now()
);

comment on table public.cupom_cliques is 'Cliques no "Tenho interesse" com cupom válido. veiculo_nome é o retrato do carro no clique.';

create index cupom_cliques_cupom_idx on public.cupom_cliques (cupom_id, created_at desc);
create index cupom_cliques_veiculo_idx on public.cupom_cliques (veiculo_id) where veiculo_id is not null;

alter table public.cupons enable row level security;
alter table public.cupom_cliques enable row level security;

create policy "Admin gerencia cupons" on public.cupons for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia cliques de cupons" on public.cupom_cliques for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));

-- Limites por IP: verificações do cupom e cliques contam separado.
alter table public.limites_envio
  drop constraint limites_envio_formulario_check,
  add constraint limites_envio_formulario_check check (formulario in
    ('simulacao', 'pedido_busca', 'consignacao', 'upload_consignacao', 'login', 'redefinicao', 'cupom', 'cupom_clique'));

-- Totais e último uso da lista de cupons. security_invoker: respeita o RLS de quem consulta.
create view public.cupons_resumo with (security_invoker = true) as
select
  c.*,
  (select count(*) from public.simulacoes x where x.cupom_id = c.id) as total_simulacoes,
  (select count(*) from public.pedidos_busca x where x.cupom_id = c.id) as total_pedidos,
  (select count(*) from public.consignacoes x where x.cupom_id = c.id) as total_consignacoes,
  (select count(*) from public.cupom_cliques x where x.cupom_id = c.id) as total_cliques,
  greatest(
    (select max(x.created_at) from public.simulacoes x where x.cupom_id = c.id),
    (select max(x.created_at) from public.pedidos_busca x where x.cupom_id = c.id),
    (select max(x.created_at) from public.consignacoes x where x.cupom_id = c.id),
    (select max(x.created_at) from public.cupom_cliques x where x.cupom_id = c.id)
  ) as ultimo_uso
from public.cupons c;

revoke all on public.cupons_resumo from anon;
