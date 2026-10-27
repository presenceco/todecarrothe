-- Fotos de carros fora do catálogo inacessíveis, mesmo com o link (auditoria de segurança de 27/10/2026,
-- item 7). O bucket público "veiculos" guarda só as fotos de carros disponíveis e publicados; rascunho,
-- reservado e vendido ficam neste bucket privado, com os mesmos limites. Só o admin lê e grava; o painel
-- mostra as fotos por URL assinada. O app move os arquivos entre os dois buckets ao salvar, publicar,
-- despublicar ou mudar o status. As fotos que já existem são movidas pelo script
-- scripts/mover-fotos-ocultas.ts (uma vez, depois desta migration).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('veiculos-ocultos', 'veiculos-ocultos', false, 10485760, array['image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "Admin gerencia fotos de veículos ocultos no Storage"
  on storage.objects for all to authenticated
  using (bucket_id = 'veiculos-ocultos' and (select public.eh_admin()))
  with check (bucket_id = 'veiculos-ocultos' and (select public.eh_admin()));
