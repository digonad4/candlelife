-- Atualizar tema padrão para supabase para todos os usuários existentes
UPDATE public.profiles 
SET active_theme = 'supabase' 
WHERE active_theme IS NULL OR active_theme = 'light' OR active_theme = 'default';

-- Inserir configurações de tema para usuários que não têm
INSERT INTO public.user_themes (user_id, theme_name, updated_at)
SELECT 
  p.id as user_id,
  'supabase' as theme_name,
  now() as updated_at
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_themes ut WHERE ut.user_id = p.id
);

-- Atualizar configurações existentes para supabase
UPDATE public.user_themes 
SET theme_name = 'supabase', updated_at = now()
WHERE theme_name IS NULL OR theme_name = 'light' OR theme_name = 'default';