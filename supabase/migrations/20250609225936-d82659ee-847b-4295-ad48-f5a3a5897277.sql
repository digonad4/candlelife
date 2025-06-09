
-- Adicionar colunas para criptografia e melhorias no chat
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS encrypted_content text,
ADD COLUMN IF NOT EXISTS encryption_key_id uuid,
ADD COLUMN IF NOT EXISTS file_name text,
ADD COLUMN IF NOT EXISTS file_size bigint,
ADD COLUMN IF NOT EXISTS mime_type text,
ADD COLUMN IF NOT EXISTS duration integer,
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;

-- Criar tabela para chaves de criptografia
CREATE TABLE IF NOT EXISTS public.conversation_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid NOT NULL,
  encryption_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Criar tabela para metadados de links
CREATE TABLE IF NOT EXISTS public.message_link_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  description text,
  image_url text,
  site_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para mensagens fixadas
CREATE TABLE IF NOT EXISTS public.pinned_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id text NOT NULL,
  pinned_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(message_id, conversation_id)
);

-- Habilitar RLS
ALTER TABLE public.conversation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_link_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para conversation_keys
CREATE POLICY "Users can view their conversation keys" ON public.conversation_keys
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversation keys" ON public.conversation_keys
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Políticas RLS para message_link_previews
CREATE POLICY "Users can view link previews of their messages" ON public.message_link_previews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_id 
      AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can create link previews for their messages" ON public.message_link_previews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_id 
      AND m.sender_id = auth.uid()
    )
  );

-- Políticas RLS para pinned_messages
CREATE POLICY "Users can view pinned messages in their conversations" ON public.pinned_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_id 
      AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can pin messages in their conversations" ON public.pinned_messages
  FOR INSERT WITH CHECK (
    pinned_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.messages m 
      WHERE m.id = message_id 
      AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
    )
  );

CREATE POLICY "Users can unpin their pinned messages" ON public.pinned_messages
  FOR DELETE USING (pinned_by = auth.uid());

-- Função para criar/obter chave de criptografia da conversa
CREATE OR REPLACE FUNCTION public.get_or_create_conversation_key(p_other_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  user1_id uuid;
  user2_id uuid;
  existing_key text;
  new_key text;
BEGIN
  -- Ordenar IDs para consistência
  IF current_user_id < p_other_user_id THEN
    user1_id := current_user_id;
    user2_id := p_other_user_id;
  ELSE
    user1_id := p_other_user_id;
    user2_id := current_user_id;
  END IF;
  
  -- Verificar se já existe uma chave
  SELECT encryption_key INTO existing_key
  FROM public.conversation_keys
  WHERE conversation_keys.user1_id = get_or_create_conversation_key.user1_id 
    AND conversation_keys.user2_id = get_or_create_conversation_key.user2_id;
  
  IF existing_key IS NOT NULL THEN
    RETURN existing_key;
  END IF;
  
  -- Gerar nova chave (simulação - em produção usar função segura)
  new_key := encode(gen_random_bytes(32), 'base64');
  
  -- Inserir nova chave
  INSERT INTO public.conversation_keys (user1_id, user2_id, encryption_key)
  VALUES (user1_id, user2_id, new_key);
  
  RETURN new_key;
END;
$$;

-- Função para extrair e salvar previews de links
CREATE OR REPLACE FUNCTION public.extract_message_links(p_message_id uuid, p_content text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  url_pattern text := 'https?://[^\s]+';
  urls text[];
  url text;
BEGIN
  -- Extrair URLs do conteúdo (regex básico)
  SELECT array_agg(matches[1]) INTO urls
  FROM regexp_split_to_table(p_content, '\s+') AS content_part,
       regexp_matches(content_part, url_pattern, 'g') AS matches;
  
  -- Inserir URLs encontradas (preview será feito no frontend)
  IF urls IS NOT NULL THEN
    FOREACH url IN ARRAY urls LOOP
      INSERT INTO public.message_link_previews (message_id, url)
      VALUES (p_message_id, url)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
END;
$$;
