-- Atualizar trigger para usar refresh_user_ohlc (velas individuais por transação)
-- Em vez de recalculate_ohlc_for_date (agregação por dia)

CREATE OR REPLACE FUNCTION public.trigger_recalculate_ohlc_on_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Para qualquer operação, recalcular todas as velas do usuário
  -- Isso garante que cada transação seja uma vela individual
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.payment_status = 'confirmed' THEN
      PERFORM public.refresh_user_ohlc(NEW.user_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.payment_status = 'confirmed' THEN
      PERFORM public.refresh_user_ohlc(OLD.user_id);
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;