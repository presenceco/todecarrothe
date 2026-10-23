-- Pedido de busca financiado: quantidade de parcelas e valor de parcela que o cliente busca (opcionais).
alter table public.pedidos_busca
  add column prazo_meses smallint check (prazo_meses in (12, 24, 36, 48, 60)),
  add column parcela_desejada numeric(12, 2) check (parcela_desejada > 0),
  add constraint pedidos_busca_financiamento_check
    check (pagamento = 'financiado' or (prazo_meses is null and parcela_desejada is null));

comment on column public.pedidos_busca.prazo_meses is 'Quantidade de parcelas desejada (só para pagamento financiado).';
comment on column public.pedidos_busca.parcela_desejada is 'Parcela mensal que o cliente busca (só para pagamento financiado).';
