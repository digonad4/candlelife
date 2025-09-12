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

-- Função para análise inteligente de gastos
CREATE OR REPLACE FUNCTION public.analyze_spending_patterns(p_user_id uuid, p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  total_income numeric;
  total_expenses numeric;
  avg_daily_spending numeric;
  categories_analysis jsonb;
BEGIN
  -- Calcular receitas e gastos
  SELECT 
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END), 0)
  INTO total_income, total_expenses
  FROM public.transactions
  WHERE user_id = p_user_id 
    AND date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    AND payment_status = 'confirmed';

  -- Calcular média diária de gastos
  avg_daily_spending := total_expenses / GREATEST(p_days, 1);

  -- Análise por categorias (usando description como proxy para categoria)
  SELECT json_agg(
    json_build_object(
      'category', COALESCE(description, 'Outros'),
      'total', SUM(ABS(amount)),
      'percentage', ROUND((SUM(ABS(amount)) / NULLIF(total_expenses, 0) * 100)::numeric, 2)
    )
  )
  INTO categories_analysis
  FROM public.transactions
  WHERE user_id = p_user_id 
    AND amount < 0
    AND date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    AND payment_status = 'confirmed'
  GROUP BY description
  ORDER BY SUM(ABS(amount)) DESC
  LIMIT 10;

  result := json_build_object(
    'period_days', p_days,
    'total_income', total_income,
    'total_expenses', total_expenses,
    'net_balance', total_income - total_expenses,
    'avg_daily_spending', avg_daily_spending,
    'savings_rate', CASE 
      WHEN total_income > 0 THEN ROUND(((total_income - total_expenses) / total_income * 100)::numeric, 2)
      ELSE 0 
    END,
    'categories', COALESCE(categories_analysis, '[]'::json)
  );

  RETURN result;
END;
$$;