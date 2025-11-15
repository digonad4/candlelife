-- Função para limpar e recalcular OHLC completamente para um usuário
CREATE OR REPLACE FUNCTION public.refresh_user_ohlc(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_date RECORD;
BEGIN
  -- Limpar todos os dados OHLC do usuário
  DELETE FROM public.ohlc_data WHERE user_id = p_user_id;
  
  -- Recalcular para cada data com transações confirmadas
  FOR v_date IN
    SELECT DISTINCT date::DATE as transaction_date
    FROM public.transactions
    WHERE user_id = p_user_id 
      AND payment_status = 'confirmed'
    ORDER BY transaction_date
  LOOP
    PERFORM public.recalculate_ohlc_for_date(p_user_id, v_date.transaction_date);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Corrigir função recalculate_ohlc_cascade para também limpar datas órfãs
CREATE OR REPLACE FUNCTION public.recalculate_ohlc_cascade(p_user_id UUID, p_from_date DATE)
RETURNS VOID AS $$
DECLARE
  v_date_record RECORD;
  v_orphan_date RECORD;
BEGIN
  -- Primeiro, limpar datas órfãs (datas com OHLC mas sem transações confirmadas)
  FOR v_orphan_date IN
    SELECT DISTINCT o.date
    FROM public.ohlc_data o
    WHERE o.user_id = p_user_id
      AND o.date > p_from_date
      AND NOT EXISTS (
        SELECT 1 FROM public.transactions t
        WHERE t.user_id = p_user_id
          AND t.date::DATE = o.date
          AND t.payment_status = 'confirmed'
      )
  LOOP
    DELETE FROM public.ohlc_data 
    WHERE user_id = p_user_id AND date = v_orphan_date.date;
  END LOOP;

  -- Para cada dia após a data alterada que tem transações
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