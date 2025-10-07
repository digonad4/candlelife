-- Criar tabela para armazenar dados OHLC (candlestick)
CREATE TABLE IF NOT EXISTS public.ohlc_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  open NUMERIC NOT NULL,
  high NUMERIC NOT NULL,
  low NUMERIC NOT NULL,
  close NUMERIC NOT NULL,
  accumulated_balance NUMERIC NOT NULL,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE public.ohlc_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own OHLC data"
  ON public.ohlc_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert OHLC data"
  ON public.ohlc_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update OHLC data"
  ON public.ohlc_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can delete OHLC data"
  ON public.ohlc_data FOR DELETE
  USING (auth.uid() = user_id);

-- Função para recalcular OHLC de um usuário em uma data específica
CREATE OR REPLACE FUNCTION public.recalculate_ohlc_for_date(p_user_id UUID, p_date DATE)
RETURNS VOID AS $$
DECLARE
  v_previous_balance NUMERIC;
  v_daily_transactions RECORD;
  v_open NUMERIC;
  v_close NUMERIC;
  v_high NUMERIC;
  v_low NUMERIC;
  v_count INTEGER;
BEGIN
  -- Buscar saldo acumulado até o dia anterior
  SELECT COALESCE(accumulated_balance, 0) INTO v_previous_balance
  FROM public.ohlc_data
  WHERE user_id = p_user_id AND date < p_date
  ORDER BY date DESC
  LIMIT 1;
  
  IF v_previous_balance IS NULL THEN
    v_previous_balance := 0;
  END IF;
  
  -- Calcular transações do dia
  SELECT 
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total
  INTO v_daily_transactions
  FROM public.transactions
  WHERE user_id = p_user_id 
    AND date::DATE = p_date
    AND payment_status = 'confirmed';
  
  v_count := v_daily_transactions.count;
  
  -- Se não há transações, não criar registro
  IF v_count = 0 THEN
    DELETE FROM public.ohlc_data 
    WHERE user_id = p_user_id AND date = p_date;
    RETURN;
  END IF;
  
  -- Calcular OHLC
  v_open := v_previous_balance;
  v_close := v_previous_balance + v_daily_transactions.total;
  v_high := GREATEST(v_open, v_close);
  v_low := LEAST(v_open, v_close);
  
  -- Inserir ou atualizar registro OHLC
  INSERT INTO public.ohlc_data (
    user_id, date, open, high, low, close, 
    accumulated_balance, transaction_count, updated_at
  ) VALUES (
    p_user_id, p_date, v_open, v_high, v_low, v_close,
    v_close, v_count, NOW()
  )
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    open = EXCLUDED.open,
    high = EXCLUDED.high,
    low = EXCLUDED.low,
    close = EXCLUDED.close,
    accumulated_balance = EXCLUDED.accumulated_balance,
    transaction_count = EXCLUDED.transaction_count,
    updated_at = NOW();
    
  -- Recalcular dias seguintes (pois o saldo acumulado mudou)
  PERFORM public.recalculate_ohlc_cascade(p_user_id, p_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para recalcular OHLC em cascata (dias seguintes)
CREATE OR REPLACE FUNCTION public.recalculate_ohlc_cascade(p_user_id UUID, p_from_date DATE)
RETURNS VOID AS $$
DECLARE
  v_date_record RECORD;
BEGIN
  -- Para cada dia após a data alterada
  FOR v_date_record IN 
    SELECT DISTINCT date::DATE as transaction_date
    FROM public.transactions
    WHERE user_id = p_user_id 
      AND date::DATE > p_from_date
      AND payment_status = 'confirmed'
    ORDER BY transaction_date
  LOOP
    PERFORM public.recalculate_ohlc_for_date(p_user_id, v_date_record.transaction_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para recalcular OHLC quando transação é inserida
CREATE OR REPLACE FUNCTION public.trigger_recalculate_ohlc_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.payment_status = 'confirmed' THEN
      PERFORM public.recalculate_ohlc_for_date(NEW.user_id, NEW.date::DATE);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.payment_status = 'confirmed' THEN
      PERFORM public.recalculate_ohlc_for_date(OLD.user_id, OLD.date::DATE);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS recalculate_ohlc_trigger ON public.transactions;
CREATE TRIGGER recalculate_ohlc_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_recalculate_ohlc_on_transaction();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ohlc_user_date ON public.ohlc_data(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date_status ON public.transactions(user_id, date, payment_status);

-- Gerar dados OHLC para transações existentes
DO $$
DECLARE
  v_user RECORD;
  v_date RECORD;
BEGIN
  FOR v_user IN 
    SELECT DISTINCT user_id FROM public.transactions
  LOOP
    FOR v_date IN
      SELECT DISTINCT date::DATE as transaction_date
      FROM public.transactions
      WHERE user_id = v_user.user_id AND payment_status = 'confirmed'
      ORDER BY transaction_date
    LOOP
      PERFORM public.recalculate_ohlc_for_date(v_user.user_id, v_date.transaction_date);
    END LOOP;
  END LOOP;
END $$;