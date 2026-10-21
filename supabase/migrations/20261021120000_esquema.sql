-- Esquema do catálogo e do painel da Tô de Carro Seminovos.
-- Ajustes em relação ao briefing estão em docs/PLANO.md, seção 5 (dinheiro em numeric(12,2),
-- domínios em text + check, publicado_em, limites_envio).

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------

create or replace function public.definir_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Opcionais (lista compartilhada; "+ Adicionar opcional" cria um novo para todos)
-- ---------------------------------------------------------------------------

create table public.opcionais (
  id uuid primary key default gen_random_uuid(),
  nome text not null unique check (char_length(btrim(nome)) between 2 and 60),
  ordem integer not null default 1000,
  created_at timestamptz not null default now()
);

comment on table public.opcionais is 'Opcionais disponíveis para todos os veículos (ar-condicionado, câmera de ré…).';

-- ---------------------------------------------------------------------------
-- Consignações ("Venda seu carro")
-- ---------------------------------------------------------------------------

create table public.consignacoes (
  id uuid primary key default gen_random_uuid(),
  forma_venda text not null check (forma_venda in ('venda_direta', 'troca', 'consignacao')),
  marca text not null check (char_length(btrim(marca)) between 2 and 40),
  modelo text not null check (char_length(btrim(modelo)) between 1 and 60),
  versao text not null default '' check (char_length(versao) <= 80),
  ano_fabricacao smallint not null check (ano_fabricacao between 1950 and 2100),
  ano_modelo smallint not null,
  km integer not null check (km between 0 and 2000000),
  cambio text not null check (cambio in ('automatico', 'manual')),
  cor text not null check (char_length(btrim(cor)) between 2 and 30),
  quitado boolean not null,
  valor_pretendido numeric(12, 2) check (valor_pretendido > 0),
  detalhes text not null default '' check (char_length(detalhes) <= 2000),
  nome text not null check (char_length(btrim(nome)) between 2 and 120),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,11}$'),
  anotacoes text not null default '' check (char_length(anotacoes) <= 5000),
  consentimento_em timestamptz not null,
  consentimento_versao text not null check (char_length(consentimento_versao) between 1 and 40),
  status text not null default 'nova' check (status in ('nova', 'em_avaliacao', 'negocio_fechado', 'recusada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ano_modelo between ano_fabricacao and ano_fabricacao + 1)
);

comment on table public.consignacoes is 'Carros oferecidos pelos clientes em "Venda seu carro" (venda direta, troca ou consignação).';
comment on column public.consignacoes.whatsapp is 'Só dígitos, com DDD e sem o 55.';

create table public.consignacao_fotos (
  id uuid primary key default gen_random_uuid(),
  consignacao_id uuid not null references public.consignacoes (id) on delete cascade,
  path text not null unique,
  ordem smallint not null check (ordem between 0 and 7),
  created_at timestamptz not null default now(),
  unique (consignacao_id, ordem) deferrable initially deferred
);

comment on table public.consignacao_fotos is 'Fotos enviadas pelo cliente (bucket privado "consignacoes"). Até 8.';

-- ---------------------------------------------------------------------------
-- Veículos do estoque
-- ---------------------------------------------------------------------------

create table public.veiculos (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 140),
  marca text not null check (char_length(btrim(marca)) between 2 and 40),
  modelo text not null check (char_length(btrim(modelo)) between 1 and 60),
  versao text not null default '' check (char_length(versao) <= 80),
  ano_fabricacao smallint not null check (ano_fabricacao between 1950 and 2100),
  ano_modelo smallint not null,
  km integer not null check (km between 0 and 2000000),
  cambio text not null check (cambio in ('automatico', 'manual')),
  cor text not null check (char_length(btrim(cor)) between 2 and 30),
  combustivel text not null check (combustivel in ('flex', 'gasolina', 'diesel', 'hibrido')),
  tipo text not null check (tipo in ('hatch', 'seda', 'suv', 'picape')),
  final_placa char(1) not null check (final_placa ~ '^[0-9]$'),
  preco numeric(12, 2) not null check (preco > 0),
  status text not null default 'disponivel' check (status in ('disponivel', 'reservado', 'vendido')),
  publicado boolean not null default false,
  publicado_em timestamptz,
  etiqueta text not null default 'nenhuma' check (etiqueta in ('nenhuma', 'destaque', 'novidade', 'baixa_km')),
  selos text[] not null default '{}'
    check (selos <@ array['ipva_pago', 'unico_dono', 'revisoes_em_dia', 'chave_reserva', 'manual']::text[]),
  consignacao_id uuid references public.consignacoes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ano_modelo between ano_fabricacao and ano_fabricacao + 1)
);

comment on table public.veiculos is 'Estoque. O catálogo público mostra só status disponivel e publicado = true.';
comment on column public.veiculos.publicado_em is 'Primeira publicação no catálogo; ordena "Mais recentes".';
comment on column public.veiculos.consignacao_id is 'Consignação que originou o cadastro ("Cadastrar no estoque").';

-- Grava a data da primeira publicação.
create or replace function public.definir_publicado_em()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.publicado and new.publicado_em is null then
    new.publicado_em = now();
  end if;
  return new;
end;
$$;

create trigger veiculos_publicado_em
  before insert or update of publicado on public.veiculos
  for each row execute function public.definir_publicado_em();

create table public.veiculo_fotos (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos (id) on delete cascade,
  path text not null unique,
  ordem smallint not null check (ordem between 0 and 19),
  created_at timestamptz not null default now(),
  -- Adiável: reordenar por arraste troca várias posições na mesma transação.
  unique (veiculo_id, ordem) deferrable initially deferred
);

comment on table public.veiculo_fotos is 'Fotos do veículo (bucket público "veiculos"). A de ordem 0 é a capa. Até 20.';

create table public.veiculo_opcionais (
  veiculo_id uuid not null references public.veiculos (id) on delete cascade,
  opcional_id uuid not null references public.opcionais (id) on delete cascade,
  primary key (veiculo_id, opcional_id)
);

-- ---------------------------------------------------------------------------
-- Simulações de financiamento
-- ---------------------------------------------------------------------------

create table public.simulacoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid references public.veiculos (id) on delete set null,
  -- Retrato do veículo no momento do envio (ele pode mudar ou ser excluído depois).
  veiculo_nome text check (char_length(veiculo_nome) <= 200),
  veiculo_preco numeric(12, 2) check (veiculo_preco > 0),
  -- Simulação sem veículo escolhido ("Valor aproximado do carro").
  valor_aproximado numeric(12, 2) check (valor_aproximado > 0),
  nome text not null check (char_length(btrim(nome)) between 3 and 120),
  cpf char(11) not null check (cpf ~ '^[0-9]{11}$'),
  nascimento date not null,
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,11}$'),
  renda numeric(12, 2) not null check (renda >= 0),
  entrada numeric(12, 2) not null check (entrada >= 0),
  prazo_meses smallint not null check (prazo_meses in (24, 36, 48, 60)),
  tem_troca boolean not null,
  troca_modelo text check (char_length(troca_modelo) <= 80),
  troca_ano smallint check (troca_ano between 1950 and 2100),
  possui_cnh boolean not null,
  consentimento_em timestamptz not null,
  consentimento_versao text not null check (char_length(consentimento_versao) between 1 and 40),
  status text not null default 'nova' check (status in ('nova', 'em_analise', 'aprovada', 'recusada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((veiculo_nome is not null and veiculo_preco is not null) or valor_aproximado is not null),
  check (entrada <= coalesce(veiculo_preco, valor_aproximado)),
  check (not tem_troca or (troca_modelo is not null and troca_ano is not null))
);

comment on table public.simulacoes is 'Pedidos de simulação de financiamento enviados pelo catálogo.';

-- ---------------------------------------------------------------------------
-- Pedidos de busca ("Não encontrou seu carro?")
-- ---------------------------------------------------------------------------

create table public.pedidos_busca (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 2 and 120),
  whatsapp text not null check (whatsapp ~ '^[0-9]{10,11}$'),
  marca_modelo text not null check (char_length(btrim(marca_modelo)) between 2 and 80),
  ano_minimo smallint not null check (ano_minimo between 1950 and 2100),
  faixa_preco text not null check (faixa_preco in ('ate_50', '50_80', '80_110', '110_150', '150_200', 'acima_200')),
  pagamento text not null check (pagamento in ('a_vista', 'financiado')),
  tem_troca boolean not null,
  troca_modelo text check (char_length(troca_modelo) <= 80),
  troca_ano smallint check (troca_ano between 1950 and 2100),
  anotacoes text not null default '' check (char_length(anotacoes) <= 5000),
  consentimento_em timestamptz not null,
  consentimento_versao text not null check (char_length(consentimento_versao) between 1 and 40),
  status text not null default 'novo' check (status in ('novo', 'em_busca', 'encontrado', 'finalizado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not tem_troca or (troca_modelo is not null and troca_ano is not null))
);

comment on table public.pedidos_busca is 'Pedidos do formulário "Não encontrou seu carro?".';

-- ---------------------------------------------------------------------------
-- Limite de envios por IP (formulários públicos)
-- ---------------------------------------------------------------------------

create table public.limites_envio (
  id bigint generated always as identity primary key,
  ip_hash text not null check (char_length(ip_hash) = 64),
  formulario text not null check (formulario in ('simulacao', 'pedido_busca', 'consignacao', 'upload_consignacao')),
  criado_em timestamptz not null default now()
);

comment on table public.limites_envio is 'Um registro por envio público: hash SHA-256 (com sal) do IP, nunca o IP.';

-- Conta os envios do IP na janela e registra o atual se ainda couber. Devolve se o envio pode seguir.
create or replace function public.registrar_envio(p_ip_hash text, p_formulario text, p_limite integer, p_janela interval)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  usados integer;
begin
  -- Faxina oportunista: nada de mais de um dia atrás é útil.
  delete from public.limites_envio where criado_em < now() - interval '1 day';

  -- Serializa por IP + formulário para dois envios simultâneos não passarem juntos.
  perform pg_advisory_xact_lock(hashtext(p_ip_hash || ':' || p_formulario));

  select count(*) into usados
  from public.limites_envio
  where ip_hash = p_ip_hash and formulario = p_formulario and criado_em > now() - p_janela;

  if usados >= p_limite then
    return false;
  end if;

  insert into public.limites_envio (ip_hash, formulario) values (p_ip_hash, p_formulario);
  return true;
end;
$$;

-- ---------------------------------------------------------------------------
-- Limites de fotos (também validados nas Server Actions)
-- ---------------------------------------------------------------------------

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
  else
    select count(*) into total from public.consignacao_fotos where consignacao_id = new.consignacao_id;
    if total >= 8 then
      raise exception 'Máximo de 8 fotos por consignação.' using errcode = 'check_violation';
    end if;
  end if;
  return new;
end;
$$;

create trigger veiculo_fotos_limite before insert on public.veiculo_fotos
  for each row execute function public.limitar_fotos();
create trigger consignacao_fotos_limite before insert on public.consignacao_fotos
  for each row execute function public.limitar_fotos();

-- ---------------------------------------------------------------------------
-- updated_at
-- ---------------------------------------------------------------------------

create trigger veiculos_updated_at before update on public.veiculos
  for each row execute function public.definir_updated_at();
create trigger simulacoes_updated_at before update on public.simulacoes
  for each row execute function public.definir_updated_at();
create trigger pedidos_busca_updated_at before update on public.pedidos_busca
  for each row execute function public.definir_updated_at();
create trigger consignacoes_updated_at before update on public.consignacoes
  for each row execute function public.definir_updated_at();

-- ---------------------------------------------------------------------------
-- Índices
-- ---------------------------------------------------------------------------

create index veiculos_catalogo_idx on public.veiculos (publicado_em desc) where status = 'disponivel' and publicado;
create index veiculos_criados_idx on public.veiculos (created_at desc);
create index veiculos_status_idx on public.veiculos (status);
create index veiculos_consignacao_idx on public.veiculos (consignacao_id) where consignacao_id is not null;
create index veiculo_fotos_ordem_idx on public.veiculo_fotos (veiculo_id, ordem);
create index veiculo_opcionais_opcional_idx on public.veiculo_opcionais (opcional_id);
create index consignacao_fotos_ordem_idx on public.consignacao_fotos (consignacao_id, ordem);
create index simulacoes_status_idx on public.simulacoes (status, created_at desc);
create index simulacoes_veiculo_idx on public.simulacoes (veiculo_id) where veiculo_id is not null;
create index pedidos_busca_status_idx on public.pedidos_busca (status, created_at desc);
create index consignacoes_status_idx on public.consignacoes (status, created_at desc);
create index limites_envio_janela_idx on public.limites_envio (formulario, ip_hash, criado_em desc);
