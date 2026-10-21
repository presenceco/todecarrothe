-- Segurança: RLS das tabelas e buckets do Storage.
--
-- - Público (anon): só LÊ veículos disponíveis e publicados, as fotos e os opcionais deles.
-- - Envios públicos (simulação, pedido, consignação) são gravados no servidor com a service role,
--   que ignora o RLS. Por isso essas tabelas não têm política nenhuma para anon.
-- - Admin: usuário autenticado com app_metadata.role = 'admin' (definido pelo script criar-admin).
--   O cadastro público fica desligado no Supabase; o papel é uma segunda trava.

-- ---------------------------------------------------------------------------
-- Papel de admin
-- ---------------------------------------------------------------------------

create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

comment on function public.eh_admin is 'Verdadeiro quando o JWT da requisição é do admin da loja.';

-- Visível no catálogo: disponível e publicado.
create or replace function public.veiculo_visivel(p_veiculo_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.veiculos v
    where v.id = p_veiculo_id and v.status = 'disponivel' and v.publicado
  );
$$;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.opcionais enable row level security;
alter table public.veiculos enable row level security;
alter table public.veiculo_fotos enable row level security;
alter table public.veiculo_opcionais enable row level security;
alter table public.simulacoes enable row level security;
alter table public.pedidos_busca enable row level security;
alter table public.consignacoes enable row level security;
alter table public.consignacao_fotos enable row level security;
alter table public.limites_envio enable row level security;

-- Catálogo público
create policy "Catálogo lê veículos disponíveis e publicados"
  on public.veiculos for select to anon, authenticated
  using (status = 'disponivel' and publicado);

create policy "Catálogo lê fotos de veículos visíveis"
  on public.veiculo_fotos for select to anon, authenticated
  using ((select public.veiculo_visivel(veiculo_id)));

create policy "Catálogo lê opcionais de veículos visíveis"
  on public.veiculo_opcionais for select to anon, authenticated
  using ((select public.veiculo_visivel(veiculo_id)));

create policy "Catálogo lê a lista de opcionais"
  on public.opcionais for select to anon, authenticated
  using (true);

-- Admin: acesso total em todas as tabelas
create policy "Admin gerencia opcionais" on public.opcionais for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia veículos" on public.veiculos for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia fotos de veículos" on public.veiculo_fotos for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia opcionais de veículos" on public.veiculo_opcionais for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia simulações" on public.simulacoes for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia pedidos de busca" on public.pedidos_busca for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia consignações" on public.consignacoes for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin gerencia fotos de consignações" on public.consignacao_fotos for all to authenticated
  using ((select public.eh_admin())) with check ((select public.eh_admin()));
create policy "Admin lê limites de envio" on public.limites_envio for select to authenticated
  using ((select public.eh_admin()));

-- O limite de envios só é chamado pelo servidor.
revoke execute on function public.registrar_envio(text, text, integer, interval) from public, anon, authenticated;
grant execute on function public.registrar_envio(text, text, integer, interval) to service_role;

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

-- veiculos: leitura pública por URL (nomes aleatórios, sem listagem); escrita só do admin.
-- consignacoes: privado; o cliente envia por URL assinada emitida no servidor; o admin lê por URL assinada.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('veiculos', 'veiculos', true, 10485760, array['image/jpeg', 'image/png']),
  ('consignacoes', 'consignacoes', false, 10485760, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin gerencia fotos de veículos no Storage"
  on storage.objects for all to authenticated
  using (bucket_id = 'veiculos' and (select public.eh_admin()))
  with check (bucket_id = 'veiculos' and (select public.eh_admin()));

create policy "Admin gerencia fotos de consignações no Storage"
  on storage.objects for all to authenticated
  using (bucket_id = 'consignacoes' and (select public.eh_admin()))
  with check (bucket_id = 'consignacoes' and (select public.eh_admin()));
