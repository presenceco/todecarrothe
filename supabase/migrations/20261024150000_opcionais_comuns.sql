-- Lista padrão de opcionais com itens comuns a todo carro (aprovada pelo cliente em 24/10/2026).
-- Os nomes específicos de versão topo de linha são renomeados no lugar: os carros que já tinham o
-- opcional continuam com ele, com o nome novo. Os itens novos começam desmarcados em todos os carros.
-- Opcionais criados no painel ("+ Adicionar opcional") ficam como estão, depois da lista padrão.

update public.opcionais as o
set nome = r.novo
from (values
  ('Ar-condicionado digital', 'Ar-condicionado'),
  ('Retrovisores rebatíveis', 'Retrovisores elétricos'),
  ('Multimídia 9" com CarPlay', 'Central multimídia'),
  ('Piloto automático adaptativo', 'Piloto automático'),
  ('7 airbags', 'Airbags'),
  ('Faróis full LED', 'Faróis de LED'),
  ('Rodas de liga leve 17"', 'Rodas de liga leve')
) as r (antigo, novo)
where o.nome = r.antigo
  and not exists (select 1 from public.opcionais x where x.nome = r.novo);

-- Saem da lista (os carros que tinham "Bancos aquecidos" perdem esse opcional).
delete from public.opcionais where nome in ('Bancos aquecidos', 'Opcional de teste (pode apagar)');

insert into public.opcionais (nome, ordem)
values
  ('Ar-condicionado', 0),
  ('Direção hidráulica', 1),
  ('Direção elétrica', 2),
  ('Vidros elétricos', 3),
  ('Travas elétricas', 4),
  ('Retrovisores elétricos', 5),
  ('Alarme', 6),
  ('Central multimídia', 7),
  ('Bluetooth', 8),
  ('Volante multifuncional', 9),
  ('Computador de bordo', 10),
  ('Piloto automático', 11),
  ('Câmera de ré', 12),
  ('Sensor de estacionamento', 13),
  ('Airbags', 14),
  ('Freios ABS', 15),
  ('Controle de estabilidade', 16),
  ('Faróis de LED', 17),
  ('Faróis de neblina', 18),
  ('Rodas de liga leve', 19),
  ('Rodas com calotas', 20),
  ('Bancos em couro', 21),
  ('Bancos em tecido', 22),
  ('Chave presencial', 23),
  ('Partida por botão', 24),
  ('Teto solar', 25)
on conflict (nome) do update set ordem = excluded.ordem;
