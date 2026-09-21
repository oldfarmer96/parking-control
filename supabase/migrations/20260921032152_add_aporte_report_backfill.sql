ALTER TABLE public.aporte_placas
  ADD COLUMN ticket_id uuid,
  ADD CONSTRAINT aporte_placas_ticket_fkey
    FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE RESTRICT,
  ADD CONSTRAINT aporte_placas_referencia_check
    CHECK (ingreso_id IS NOT NULL OR ticket_id IS NOT NULL);

CREATE INDEX aporte_placas_ticket_idx
  ON public.aporte_placas (ticket_id)
  WHERE ticket_id IS NOT NULL;

CREATE FUNCTION public.registrar_estado_aporte_desde_ticket(
  p_ticket_id uuid,
  p_estado text
)
RETURNS public.aporte_placas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ticket public.tickets;
  v_aporte public.aportes;
  v_placa_normalizada text;
  v_resultado public.aporte_placas;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = v_uid AND estado = true AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo un administrador activo puede regularizar aportes desde reportes';
  END IF;

  IF p_estado NOT IN ('PAGADO', 'PREFERENCIAL') THEN
    RAISE EXCEPTION 'Estado de aporte no válido';
  END IF;

  SELECT * INTO v_ticket
  FROM public.tickets
  WHERE id = p_ticket_id
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ticket no encontrado';
  END IF;

  v_placa_normalizada := upper(
    regexp_replace(trim(v_ticket.placa), '[^[:alnum:]]', '', 'g')
  );

  IF char_length(v_placa_normalizada) < 3 THEN
    RAISE EXCEPTION 'La placa del ticket no es válida';
  END IF;

  SELECT * INTO v_aporte
  FROM public.aportes
  WHERE estado = 'ACTIVO'
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe un aporte activo';
  END IF;

  INSERT INTO public.aporte_placas (
    aporte_id,
    ticket_id,
    placa,
    placa_normalizada,
    estado,
    monto_pagado,
    registrado_por
  )
  VALUES (
    v_aporte.id,
    v_ticket.id,
    upper(trim(v_ticket.placa)),
    v_placa_normalizada,
    p_estado,
    CASE WHEN p_estado = 'PAGADO' THEN v_aporte.monto ELSE 0 END,
    v_uid
  )
  RETURNING * INTO v_resultado;

  RETURN v_resultado;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Esta placa ya fue registrada para el aporte activo';
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_estado_aporte_desde_ticket(uuid, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.registrar_estado_aporte_desde_ticket(uuid, text)
  TO authenticated;
