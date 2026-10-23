-- Pedido de busca financiado: valor de entrada que o cliente pretende dar (opcional).
alter table public.pedidos_busca
  add column entrada numeric(12, 2) check (entrada > 0),
  drop constraint pedidos_busca_financiamento_check,
  add constraint pedidos_busca_financiamento_check
    check (pagamento = 'financiado' or (prazo_meses is null and parcela_desejada is null and entrada is null));

comment on column public.pedidos_busca.entrada is 'Valor de entrada que o cliente pretende dar (só para pagamento financiado).';
