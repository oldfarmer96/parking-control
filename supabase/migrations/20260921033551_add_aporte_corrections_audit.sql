ALTER TABLE public.aporte_placas
  ADD COLUMN fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL;

CREATE TABLE public.aporte_cambios (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  aporte_id           uuid                     NOT NULL,
  aporte_placa_id     uuid,
  ticket_id           uuid,
  ingreso_id          uuid,
  placa               text                     NOT NULL,
  placa_normalizada   text                     NOT NULL,
  estado_anterior     text                     NOT NULL,
  estado_nuevo        text                     NOT NULL,
  monto_anterior      numeric(10,2)            NOT NULL,
  monto_nuevo         numeric(10,2)            NOT NULL,
  motivo              text                     NOT NULL,
  cambiado_por        uuid                     NOT NULL,
  fecha_cambio        timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT aporte_cambios_pkey PRIMARY KEY (id),
  CONSTRAINT aporte_cambios_aporte_fkey FOREIGN KEY (aporte_id) REFERENCES public.aportes(id) ON DELETE RESTRICT,
  CONSTRAINT aporte_cambios_aporte_placa_fkey FOREIGN KEY (aporte_placa_id) REFERENCES public.aporte_placas(id) ON DELETE SET NULL,
  CONSTRAINT aporte_cambios_ticket_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE RESTRICT,
  CONSTRAINT aporte_cambios_ingreso_fkey FOREIGN KEY (ingreso_id) REFERENCES public.ingresos_vehiculos(id) ON DELETE SET NULL,
  CONSTRAINT aporte_cambios_usuario_fkey FOREIGN KEY (cambiado_por) REFERENCES public.perfiles(id),
  CONSTRAINT aporte_cambios_estados_check CHECK (
    estado_anterior = ANY (ARRAY['PENDIENTE'::text, 'PAGADO'::text, 'PREFERENCIAL'::text])
    AND estado_nuevo = ANY (ARRAY['PENDIENTE'::text, 'PAGADO'::text, 'PREFERENCIAL'::text])
    AND estado_anterior <> estado_nuevo
  ),
  CONSTRAINT aporte_cambios_montos_check CHECK (monto_anterior >= 0 AND monto_nuevo >= 0),
  CONSTRAINT aporte_cambios_motivo_check CHECK (char_length(trim(motivo)) BETWEEN 5 AND 500),
  CONSTRAINT aporte_cambios_placa_check CHECK (char_length(placa_normalizada) >= 3)
);

CREATE INDEX aporte_cambios_aporte_fecha_idx
  ON public.aporte_cambios (aporte_id, fecha_cambio DESC);

CREATE INDEX aporte_cambios_placa_fecha_idx
  ON public.aporte_cambios (placa_normalizada, fecha_cambio DESC);

ALTER TABLE public.aporte_cambios ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.aporte_cambios FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.aporte_cambios TO authenticated;

CREATE POLICY ver_cambios_aporte
  ON public.aporte_cambios
  FOR SELECT
  TO authenticated
  USING (public.obtener_rol_usuario() = 'admin');

CREATE FUNCTION public.corregir_estado_aporte_desde_ticket(
  p_ticket_id uuid,
  p_estado_nuevo text,
  p_motivo text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ticket public.tickets;
  v_aporte public.aportes;
  v_actual public.aporte_placas;
  v_placa_normalizada text;
  v_estado_anterior text;
  v_monto_anterior numeric(10,2);
  v_monto_nuevo numeric(10,2);
  v_tiene_actual boolean;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = v_uid AND estado = true AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo un administrador activo puede corregir aportes';
  END IF;

  IF p_estado_nuevo NOT IN ('PENDIENTE', 'PAGADO', 'PREFERENCIAL') THEN
    RAISE EXCEPTION 'Estado de aporte no válido';
  END IF;

  IF p_motivo IS NULL OR char_length(trim(p_motivo)) < 5 THEN
    RAISE EXCEPTION 'El motivo debe tener al menos 5 caracteres';
  END IF;

  IF char_length(trim(p_motivo)) > 500 THEN
    RAISE EXCEPTION 'El motivo no puede superar 500 caracteres';
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

  SELECT * INTO v_aporte
  FROM public.aportes
  WHERE estado = 'ACTIVO'
  FOR SHARE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No existe un aporte activo';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext(v_aporte.id::text),
    hashtext(v_placa_normalizada)
  );

  SELECT * INTO v_actual
  FROM public.aporte_placas
  WHERE aporte_id = v_aporte.id
    AND placa_normalizada = v_placa_normalizada
  FOR UPDATE;

  v_tiene_actual := FOUND;
  v_estado_anterior := CASE WHEN v_tiene_actual THEN v_actual.estado ELSE 'PENDIENTE' END;
  v_monto_anterior := CASE WHEN v_tiene_actual THEN v_actual.monto_pagado ELSE 0 END;
  v_monto_nuevo := CASE WHEN p_estado_nuevo = 'PAGADO' THEN v_aporte.monto ELSE 0 END;

  IF v_estado_anterior = p_estado_nuevo THEN
    RAISE EXCEPTION 'La placa ya tiene el estado seleccionado';
  END IF;

  INSERT INTO public.aporte_cambios (
    aporte_id,
    aporte_placa_id,
    ticket_id,
    ingreso_id,
    placa,
    placa_normalizada,
    estado_anterior,
    estado_nuevo,
    monto_anterior,
    monto_nuevo,
    motivo,
    cambiado_por
  )
  VALUES (
    v_aporte.id,
    CASE WHEN v_tiene_actual THEN v_actual.id ELSE NULL END,
    v_ticket.id,
    v_actual.ingreso_id,
    upper(trim(v_ticket.placa)),
    v_placa_normalizada,
    v_estado_anterior,
    p_estado_nuevo,
    v_monto_anterior,
    v_monto_nuevo,
    trim(p_motivo),
    v_uid
  );

  IF p_estado_nuevo = 'PENDIENTE' THEN
    DELETE FROM public.aporte_placas
    WHERE id = v_actual.id;
  ELSIF NOT v_tiene_actual THEN
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
      p_estado_nuevo,
      v_monto_nuevo,
      v_uid
    );
  ELSE
    UPDATE public.aporte_placas
    SET estado = p_estado_nuevo,
        monto_pagado = v_monto_nuevo,
        ticket_id = COALESCE(ticket_id, v_ticket.id),
        fecha_actualizacion = now()
    WHERE id = v_actual.id;
  END IF;

  RETURN jsonb_build_object(
    'aporte_id', v_aporte.id,
    'placa', upper(trim(v_ticket.placa)),
    'placa_normalizada', v_placa_normalizada,
    'estado_anterior', v_estado_anterior,
    'estado_nuevo', p_estado_nuevo,
    'monto_anterior', v_monto_anterior,
    'monto_nuevo', v_monto_nuevo
  );
END;
$$;

REVOKE ALL ON FUNCTION public.corregir_estado_aporte_desde_ticket(uuid, text, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.corregir_estado_aporte_desde_ticket(uuid, text, text)
  TO authenticated;
