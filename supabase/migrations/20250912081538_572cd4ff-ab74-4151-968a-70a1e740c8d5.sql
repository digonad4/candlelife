-- Expandir tipos de metas financeiras para incluir metas de gastos e orçamento
ALTER TYPE public.goal_type_enum RENAME TO goal_type_enum_old;

CREATE TYPE public.goal_type_enum AS ENUM (
  'emergency_fund',
  'purchase_goal', 
  'investment_goal',
  'custom_goal',
  'spending_limit',
  'category_budget',
  'savings_rate'
);

-- Atualizar coluna goal_type para usar novo enum
ALTER TABLE public.financial_goals 
ALTER COLUMN goal_type TYPE public.goal_type_enum 
USING goal_type::text::public.goal_type_enum;

-- Remover enum antigo
DROP TYPE public.goal_type_enum_old;

-- Adicionar novos campos para metas inteligentes
ALTER TABLE public.financial_goals 
ADD COLUMN IF NOT EXISTS goal_category text,
ADD COLUMN IF NOT EXISTS period_type text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS alert_threshold numeric DEFAULT 0.8,
ADD COLUMN IF NOT EXISTS is_recurring boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS priority_level integer DEFAULT 1;

-- Criar tabela para alertas inteligentes
CREATE TABLE IF NOT EXISTS public.smart_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES public.financial_goals(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.smart_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_alerts
CREATE POLICY "Users can view their own alerts"
ON public.smart_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON public.smart_alerts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts"
ON public.smart_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para limpar alertas expirados
CREATE OR REPLACE FUNCTION clean_expired_alerts()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.smart_alerts 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;