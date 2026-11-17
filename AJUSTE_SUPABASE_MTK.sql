-- Execute este SQL no Supabase > SQL Editor > New query.
-- Ele adiciona os campos usados pela vitrine da MTK Butterfly.

ALTER TABLE public.produto
ADD COLUMN IF NOT EXISTS cores text[] NOT NULL DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS prazo_producao_dias integer NOT NULL DEFAULT 3;

-- Produtos antigos continuam cadastrados. Se quiser, edite a categoria
-- de cada um pelo painel administrativo para usar uma das novas categorias.
