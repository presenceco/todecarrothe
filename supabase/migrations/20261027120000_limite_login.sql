-- Limite de tentativas no login do painel e nos pedidos de "Esqueci minha senha"
-- (auditoria de segurança de 27/10/2026, itens 2 e 3). O contador é o mesmo dos formulários
-- públicos (registrar_envio, por hash do IP); só entram os dois tipos novos.

alter table public.limites_envio
  drop constraint limites_envio_formulario_check,
  add constraint limites_envio_formulario_check
    check (formulario in ('simulacao', 'pedido_busca', 'consignacao', 'upload_consignacao', 'login', 'redefinicao'));
