-- Dados sensíveis das simulações apagados 30 dias após o envio, com o histórico mantido
-- (LGPD; auditoria de segurança de 27/10/2026, item 4). A limpeza diária (/api/limpeza) grava null em
-- cpf, nascimento e renda e preenche dados_sensiveis_apagados_em. Nome, WhatsApp, carro, entrada,
-- prazo, parcela, troca e status continuam.

alter table public.simulacoes
  alter column cpf drop not null,
  alter column nascimento drop not null,
  alter column renda drop not null,
  add column dados_sensiveis_apagados_em timestamptz,
  -- Só fica sem CPF, nascimento ou renda depois da limpeza.
  add constraint simulacoes_dados_sensiveis_check
    check (dados_sensiveis_apagados_em is not null or (cpf is not null and nascimento is not null and renda is not null));

comment on column public.simulacoes.dados_sensiveis_apagados_em is
  'Quando CPF, nascimento e renda foram apagados (30 dias após o envio, LGPD). Null: ainda guardados.';

-- A limpeza procura só as que ainda têm os dados.
create index simulacoes_limpeza_idx on public.simulacoes (created_at) where dados_sensiveis_apagados_em is null;
