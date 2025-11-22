-- Corrigir cálculo OHLC para considerar tipo de transação
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
  
  -- Calcular transações do dia considerando o tipo
  -- income: +amount, expense: -amount
  SELECT 
    COUNT(*) as count,
    COALESCE(
      SUM(
        CASE 
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          ELSE 0
        END
      ), 0
    ) as total
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