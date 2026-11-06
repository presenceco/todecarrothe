-- Cor da etiqueta escrita pelo admin (fundo, em hex). Sem cor: a padrão, branca com texto azul.
-- O texto fica branco ou escuro conforme o contraste com o fundo, calculado no site.

alter table public.etiquetas_personalizadas
  add column cor text check (cor ~ '^#[0-9a-f]{6}$');

comment on column public.etiquetas_personalizadas.cor is 'Cor de fundo da etiqueta (#rrggbb). Null: branca com texto azul.';
