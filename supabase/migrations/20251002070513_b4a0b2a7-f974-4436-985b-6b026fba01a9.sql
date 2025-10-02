-- FASE 5 CORRIGIDA: MIGRATION - UNIFICAR SISTEMA DE METAS

-- 1. Remover constraint antiga de goal_type
ALTER TABLE financial_goals 
  DROP CONSTRAINT IF EXISTS financial_goals_goal_type_check;

-- 2. Adicionar constraint atualizada incluindo todos os tipos válidos
ALTER TABLE financial_goals 
  ADD CONSTRAINT financial_goals_goal_type_check 
  CHECK (goal_type IN (
    'emergency_fund', 
    'purchase_goal', 
    'investment_goal', 
    'custom_goal', 
    'spending_limit', 
    'category_budget', 
    'savings_rate'
  ));

-- 3. Adicionar novos campos para visualização no gráfico
ALTER TABLE financial_goals
  ADD COLUMN IF NOT EXISTS display_on_chart BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS chart_line_type TEXT CHECK (chart_line_type IN ('support', 'resistance', 'spending_limit')),
  ADD COLUMN IF NOT EXISTS chart_line_color TEXT,
  ADD COLUMN IF NOT EXISTS alert_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_triggered BOOLEAN DEFAULT false;

-- 4. Migrar dados de chart_goals para financial_goals
INSERT INTO financial_goals (
  user_id, 
  goal_type, 
  amount, 
  display_on_chart, 
  chart_line_type, 
  description, 
  active,
  alert_enabled,
  alert_triggered,
  created_at,
  updated_at,
  start_date,
  period,
  current_amount,
  monthly_contribution
)
SELECT 
  cg.user_id,
  CASE 
    WHEN cg.goal_type = 'resistance' THEN 'investment_goal'
    WHEN cg.goal_type = 'support' THEN 'spending_limit'
    ELSE 'custom_goal'
  END as goal_type,
  cg.value as amount,
  true as display_on_chart,
  cg.goal_type as chart_line_type,
  COALESCE(cg.label, 'Meta Visual') as description,
  cg.is_active as active,
  true as alert_enabled,
  cg.alert_triggered,
  cg.created_at,
  cg.updated_at,
  CURRENT_DATE as start_date,
  'monthly' as period,
  0 as current_amount,
  0 as monthly_contribution
FROM chart_goals cg
WHERE NOT EXISTS (
  SELECT 1 FROM financial_goals fg 
  WHERE fg.user_id = cg.user_id 
    AND fg.amount = cg.value 
    AND fg.description = COALESCE(cg.label, 'Meta Visual')
);

-- 5. Remover campos redundantes
ALTER TABLE financial_goals 
  DROP COLUMN IF EXISTS period,
  DROP COLUMN IF EXISTS goal_category,
  DROP COLUMN IF EXISTS end_date,
  DROP COLUMN IF EXISTS goal_icon;

-- 6. Renomear amount para target_amount
ALTER TABLE financial_goals 
  RENAME COLUMN amount TO target_amount;

-- 7. Dropar tabela chart_goals
DROP TABLE IF EXISTS chart_goals CASCADE;

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_goals_display_on_chart 
  ON financial_goals(user_id, display_on_chart) 
  WHERE display_on_chart = true;

CREATE INDEX IF NOT EXISTS idx_financial_goals_chart_line_type 
  ON financial_goals(user_id, chart_line_type) 
  WHERE chart_line_type IS NOT NULL;

-- 9. Atualizar tema padrão para Supabase
UPDATE profiles 
SET active_theme = 'supabase' 
WHERE active_theme IS NULL OR active_theme NOT IN ('supabase', 'dark', 'light', 'dracula', 'super-hacker');

-- 10. Comentários para documentação
COMMENT ON COLUMN financial_goals.display_on_chart IS 'Se a meta deve ser exibida como linha no gráfico';
COMMENT ON COLUMN financial_goals.chart_line_type IS 'Tipo: support (vermelho-teto gasto), resistance (verde-meta acúmulo), spending_limit (laranja-limite dinâmico)';
COMMENT ON COLUMN financial_goals.target_amount IS 'Valor alvo da meta financeira';
COMMENT ON COLUMN financial_goals.current_amount IS 'Progresso atual em direção à meta';