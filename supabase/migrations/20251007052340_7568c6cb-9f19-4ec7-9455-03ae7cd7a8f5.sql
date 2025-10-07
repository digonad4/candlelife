-- Limpar tabelas de chat e social
DROP TABLE IF EXISTS message_reactions CASCADE;
DROP TABLE IF EXISTS message_link_previews CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS group_messages CASCADE;
DROP TABLE IF EXISTS group_members CASCADE;
DROP TABLE IF EXISTS chat_groups CASCADE;
DROP TABLE IF EXISTS conversation_keys CASCADE;
DROP TABLE IF EXISTS conversation_settings CASCADE;
DROP TABLE IF EXISTS pinned_messages CASCADE;
DROP TABLE IF EXISTS typing_status CASCADE;
DROP TABLE IF EXISTS user_presence CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS reactions CASCADE;
DROP TABLE IF EXISTS posts CASCADE;
DROP TABLE IF EXISTS friend_requests CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;

-- Atualizar temas dos usuários para apenas os 4 essenciais
UPDATE user_themes 
SET theme_name = 'supabase' 
WHERE theme_name NOT IN ('supabase', 'dark', 'light', 'system');

-- Criar trigger para definir tema padrão para novos usuários
CREATE OR REPLACE FUNCTION set_default_supabase_theme()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_themes (user_id, theme_name, updated_at)
  VALUES (NEW.id, 'supabase', NOW())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_created_set_theme ON auth.users;

CREATE TRIGGER on_user_created_set_theme
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION set_default_supabase_theme();