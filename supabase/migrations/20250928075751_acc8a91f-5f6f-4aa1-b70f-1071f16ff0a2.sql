-- Criar tabela para metas visuais no gráfico
CREATE TABLE public.chart_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('support', 'resistance')),
  value NUMERIC NOT NULL,
  label TEXT,
  chart_position JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  alert_triggered BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chart_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own chart goals" 
ON public.chart_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chart goals" 
ON public.chart_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chart goals" 
ON public.chart_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chart goals" 
ON public.chart_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_chart_goals_updated_at
BEFORE UPDATE ON public.chart_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Atualizar o tema padrão no profiles para supabase
UPDATE public.profiles 
SET active_theme = 'supabase' 
WHERE active_theme IS NULL OR active_theme = 'light';