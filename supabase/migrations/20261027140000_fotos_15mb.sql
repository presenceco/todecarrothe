-- Fotos enviadas pelos clientes ("Venda seu carro" e carro de entrada do pedido de busca) passam a
-- aceitar até 15 MB cada (auditoria de segurança de 27/10/2026, item 5). Continua o máximo de 8 fotos
-- por envio, validado nas Server Actions e pelo gatilho limitar_fotos. Os buckets do estoque ficam em 10 MB.

update storage.buckets
set file_size_limit = 15728640
where id in ('consignacoes', 'trocas');
