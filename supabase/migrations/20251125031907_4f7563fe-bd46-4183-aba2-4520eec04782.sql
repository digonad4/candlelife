-- Corrigir a função refresh_user_ohlc para gerar uma vela por transação
-- Cada transação é uma vela única com o saldo acumulado correto

CREATE OR REPLACE FUNCTION public.refresh_user_ohlc(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_transaction RECORD;
  v_running_balance NUMERIC := 0;
  v_date DATE;
BEGIN
  -- Limpar dados OHLC existentes do usuário
  DELETE FROM public.ohlc_data WHERE user_id = p_user_id;

  -- Processar cada transação em ordem cronológica
  FOR v_transaction IN 
    SELECT 
      id,
      date::DATE as transaction_date,
      date::TIMESTAMP as transaction_timestamp,
      type,
      amount,
      payment_status
    FROM public.transactions
    WHERE user_id = p_user_id 
      AND payment_status = 'confirmed'
    ORDER BY date ASC, created_at ASC
  LOOP
    -- Calcular o novo saldo após esta transação
    IF v_transaction.type = 'income' THEN
      v_running_balance := v_running_balance + v_transaction.amount;
      
      -- Receita: vela verde (sobe)
      INSERT INTO public.ohlc_data (
        user_id,
        date,
        open,
        high,
        low,
        close,
        accumulated_balance,
        transaction_count
      ) VALUES (
        p_user_id,
        v_transaction.transaction_timestamp,
        v_running_balance - v_transaction.amount, -- Abertura = saldo anterior
        v_running_balance,                         -- Máxima = saldo novo (topo)
        v_running_balance - v_transaction.amount, -- Mínima = saldo anterior (base)
        v_running_balance,                         -- Fechamento = saldo novo
        v_running_balance,
        1
      );
    ELSE
      v_running_balance := v_running_balance - v_transaction.amount;
      
      -- Despesa: vela vermelha (desce)
      INSERT INTO public.ohlc_data (
        user_id,
        date,
        open,
        high,
        low,
        close,
        accumulated_balance,
        transaction_count
      ) VALUES (
        p_user_id,
        v_transaction.transaction_timestamp,
        v_running_balance + v_transaction.amount, -- Abertura = saldo anterior (topo)
        v_running_balance + v_transaction.amount, -- Máxima = saldo anterior
        v_running_balance,                         -- Mínima = saldo novo (base)
        v_running_balance,                         -- Fechamento = saldo novo
        v_running_balance,
        1
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a tabela ohlc_data para suportar timestamp em vez de apenas date
ALTER TABLE public.ohlc_data 
  ALTER COLUMN date TYPE TIMESTAMP WITH TIME ZONE USING date::TIMESTAMP WITH TIME ZONE;