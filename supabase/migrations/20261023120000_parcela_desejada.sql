-- Simulação: valor de parcela que o cliente busca (opcional), informado no formulário de financiamento.
alter table public.simulacoes
  add column parcela_desejada numeric(12, 2) check (parcela_desejada > 0);

comment on column public.simulacoes.parcela_desejada is 'Parcela mensal que o cliente busca (opcional).';
