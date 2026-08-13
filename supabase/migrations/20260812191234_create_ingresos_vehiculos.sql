CREATE TABLE public.ingresos_vehiculos (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  orden_llegada       bigint                   GENERATED ALWAYS AS IDENTITY,
  placa               text                     NOT NULL,
  placa_normalizada   text                     GENERATED ALWAYS AS (upper(regexp_replace(trim(placa), '[^[:alnum:]]', '', 'g'))) STORED,
  estado              text                     DEFAULT 'DENTRO'::text NOT NULL,
  fecha_entrada       timestamp with time zone DEFAULT now() NOT NULL,
  fecha_salida        timestamp with time zone,
  ticket_id           uuid,
  motivo_sin_ticket   text,
  creado_por          uuid                     NOT NULL,
  atendido_por        uuid,
  fecha_creacion      timestamp with time zone DEFAULT now() NOT NULL,
  fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT ingresos_vehiculos_pkey PRIMARY KEY (id),
  CONSTRAINT ingresos_vehiculos_estado_check CHECK (estado = ANY (ARRAY['DENTRO'::text, 'SALIO_CON_TICKET'::text, 'SALIO_SIN_TICKET'::text])),
  CONSTRAINT ingresos_vehiculos_placa_check CHECK (char_length(placa_normalizada) >= 3),
  CONSTRAINT ingresos_vehiculos_fechas_check CHECK (fecha_salida IS NULL OR fecha_salida >= fecha_entrada),
  CONSTRAINT ingresos_vehiculos_resultado_check CHECK (
    (estado = 'DENTRO' AND fecha_salida IS NULL AND ticket_id IS NULL AND motivo_sin_ticket IS NULL AND atendido_por IS NULL)
    OR
    (estado = 'SALIO_CON_TICKET' AND fecha_salida IS NOT NULL AND ticket_id IS NOT NULL AND motivo_sin_ticket IS NULL AND atendido_por IS NOT NULL)
    OR
    (estado = 'SALIO_SIN_TICKET' AND fecha_salida IS NOT NULL AND ticket_id IS NULL AND trim(motivo_sin_ticket) <> '' AND atendido_por IS NOT NULL)
  ),
  CONSTRAINT ingresos_vehiculos_ticket_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON DELETE RESTRICT,
  CONSTRAINT ingresos_vehiculos_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id),
  CONSTRAINT ingresos_vehiculos_atendido_por_fkey FOREIGN KEY (atendido_por) REFERENCES public.perfiles(id)
);

CREATE UNIQUE INDEX ingresos_vehiculos_placa_activa_idx
  ON public.ingresos_vehiculos (placa_normalizada)
  WHERE estado = 'DENTRO';

CREATE UNIQUE INDEX ingresos_vehiculos_ticket_idx
  ON public.ingresos_vehiculos (ticket_id)
  WHERE ticket_id IS NOT NULL;

CREATE INDEX ingresos_vehiculos_activos_orden_idx
  ON public.ingresos_vehiculos (fecha_entrada, orden_llegada)
  WHERE estado = 'DENTRO';

CREATE INDEX ingresos_vehiculos_historial_idx
  ON public.ingresos_vehiculos (fecha_salida DESC)
  WHERE fecha_salida IS NOT NULL;

CREATE INDEX ingresos_vehiculos_placa_busqueda_idx
  ON public.ingresos_vehiculos (placa_normalizada, fecha_entrada DESC);

ALTER TABLE public.ingresos_vehiculos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.ingresos_vehiculos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.ingresos_vehiculos TO authenticated;

CREATE POLICY ver_ingresos_vehiculos
  ON public.ingresos_vehiculos
  FOR SELECT
  TO authenticated
  USING (public.obtener_rol_usuario() IS NOT NULL);

CREATE FUNCTION public.registrar_ingreso_vehiculo(
  p_placa text,
  p_fecha_entrada timestamp with time zone DEFAULT now()
)
RETURNS public.ingresos_vehiculos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rol text;
  v_ingreso public.ingresos_vehiculos;
BEGIN
  SELECT rol INTO v_rol
  FROM public.perfiles
  WHERE id = v_uid AND estado = true;

  IF v_rol <> 'operador' THEN
    RAISE EXCEPTION 'Solo un operador activo puede registrar ingresos';
  END IF;

  IF p_placa IS NULL OR char_length(upper(regexp_replace(trim(p_placa), '[^[:alnum:]]', '', 'g'))) < 3 THEN
    RAISE EXCEPTION 'La placa debe tener al menos 3 caracteres';
  END IF;

  INSERT INTO public.ingresos_vehiculos (placa, fecha_entrada, creado_por)
  VALUES (upper(trim(p_placa)), p_fecha_entrada, v_uid)
  RETURNING * INTO v_ingreso;

  RETURN v_ingreso;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'La placa ya tiene un ingreso activo';
END;
$$;

CREATE FUNCTION public.generar_ticket_desde_ingreso(
  p_ingreso_id uuid,
  p_monto_cobrado numeric,
  p_estado text DEFAULT 'PAGADO',
  p_notas text DEFAULT NULL
)
RETURNS public.tickets
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rol text;
  v_ingreso public.ingresos_vehiculos;
  v_ticket public.tickets;
BEGIN
  SELECT rol INTO v_rol
  FROM public.perfiles
  WHERE id = v_uid AND estado = true;

  IF v_rol <> 'operador' THEN
    RAISE EXCEPTION 'Solo un operador activo puede generar tickets';
  END IF;

  SELECT * INTO v_ingreso
  FROM public.ingresos_vehiculos
  WHERE id = p_ingreso_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ingreso no encontrado';
  END IF;

  IF v_ingreso.estado <> 'DENTRO' THEN
    RAISE EXCEPTION 'Este ingreso ya fue atendido';
  END IF;

  IF p_monto_cobrado IS NULL OR p_monto_cobrado < 0 THEN
    RAISE EXCEPTION 'El monto del ticket no es válido';
  END IF;

  INSERT INTO public.tickets (placa, monto_cobrado, estado, notas, operador_id)
  VALUES (v_ingreso.placa, p_monto_cobrado, p_estado, nullif(trim(p_notas), ''), v_uid)
  RETURNING * INTO v_ticket;

  UPDATE public.ingresos_vehiculos
  SET estado = 'SALIO_CON_TICKET',
      fecha_salida = now(),
      ticket_id = v_ticket.id,
      atendido_por = v_uid,
      fecha_actualizacion = now()
  WHERE id = v_ingreso.id;

  RETURN v_ticket;
END;
$$;

CREATE FUNCTION public.registrar_salida_sin_ticket(
  p_ingreso_id uuid,
  p_motivo text
)
RETURNS public.ingresos_vehiculos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rol text;
  v_ingreso public.ingresos_vehiculos;
BEGIN
  SELECT rol INTO v_rol
  FROM public.perfiles
  WHERE id = v_uid AND estado = true;

  IF v_rol <> 'operador' THEN
    RAISE EXCEPTION 'Solo un operador activo puede registrar salidas';
  END IF;

  IF p_motivo IS NULL OR trim(p_motivo) = '' THEN
    RAISE EXCEPTION 'El motivo de salida es obligatorio';
  END IF;

  SELECT * INTO v_ingreso
  FROM public.ingresos_vehiculos
  WHERE id = p_ingreso_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ingreso no encontrado';
  END IF;

  IF v_ingreso.estado <> 'DENTRO' THEN
    RAISE EXCEPTION 'Este ingreso ya fue atendido';
  END IF;

  UPDATE public.ingresos_vehiculos
  SET estado = 'SALIO_SIN_TICKET',
      fecha_salida = now(),
      motivo_sin_ticket = trim(p_motivo),
      atendido_por = v_uid,
      fecha_actualizacion = now()
  WHERE id = v_ingreso.id
  RETURNING * INTO v_ingreso;

  RETURN v_ingreso;
END;
$$;

CREATE FUNCTION public.obtener_cola_publica()
RETURNS TABLE (
  posicion bigint,
  placa text,
  fecha_entrada timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  SELECT
    row_number() OVER (ORDER BY ingreso.fecha_entrada, ingreso.orden_llegada) AS posicion,
    ingreso.placa,
    ingreso.fecha_entrada
  FROM public.ingresos_vehiculos AS ingreso
  WHERE ingreso.estado = 'DENTRO'
  ORDER BY ingreso.fecha_entrada, ingreso.orden_llegada;
$$;

REVOKE ALL ON FUNCTION public.registrar_ingreso_vehiculo(text, timestamp with time zone) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.generar_ticket_desde_ingreso(uuid, numeric, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.registrar_salida_sin_ticket(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.obtener_cola_publica() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.registrar_ingreso_vehiculo(text, timestamp with time zone) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generar_ticket_desde_ingreso(uuid, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_salida_sin_ticket(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_cola_publica() TO anon, authenticated;
