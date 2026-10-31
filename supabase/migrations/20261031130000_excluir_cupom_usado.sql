-- Cupom usado também pode ser excluído: os contatos continuam, sem a indicação, e os cliques saem junto.

alter table public.simulacoes
  drop constraint simulacoes_cupom_id_fkey,
  add constraint simulacoes_cupom_id_fkey foreign key (cupom_id) references public.cupons (id) on delete set null;

alter table public.pedidos_busca
  drop constraint pedidos_busca_cupom_id_fkey,
  add constraint pedidos_busca_cupom_id_fkey foreign key (cupom_id) references public.cupons (id) on delete set null;

alter table public.consignacoes
  drop constraint consignacoes_cupom_id_fkey,
  add constraint consignacoes_cupom_id_fkey foreign key (cupom_id) references public.cupons (id) on delete set null;

alter table public.cupom_cliques
  drop constraint cupom_cliques_cupom_id_fkey,
  add constraint cupom_cliques_cupom_id_fkey foreign key (cupom_id) references public.cupons (id) on delete cascade;
