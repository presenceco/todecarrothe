-- Anotações da loja nas simulações, como nos pedidos e nas consignações. Só o admin lê e grava (RLS da tabela).

alter table public.simulacoes
  add column anotacoes text not null default '' check (char_length(anotacoes) <= 5000);
