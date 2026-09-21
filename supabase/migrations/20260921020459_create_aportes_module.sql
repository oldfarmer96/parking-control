CREATE TABLE public.aportes (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  nombre              text                     NOT NULL,
  monto               numeric(10,2)            NOT NULL,
  estado              text                     DEFAULT 'INACTIVO'::text NOT NULL,
  creado_por          uuid                     NOT NULL,
  fecha_creacion      timestamp with time zone DEFAULT now() NOT NULL,
  fecha_actualizacion timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT aportes_pkey PRIMARY KEY (id),
  CONSTRAINT aportes_nombre_check CHECK (char_length(trim(nombre)) BETWEEN 3 AND 120),
  CONSTRAINT aportes_monto_check CHECK (monto > 0),
  CONSTRAINT aportes_estado_check CHECK (estado = ANY (ARRAY['ACTIVO'::text, 'INACTIVO'::text])),
  CONSTRAINT aportes_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.perfiles(id)
);

CREATE UNIQUE INDEX aportes_unico_activo_idx
  ON public.aportes (estado)
  WHERE estado = 'ACTIVO';

CREATE INDEX aportes_fecha_creacion_idx
  ON public.aportes (fecha_creacion DESC);

CREATE TABLE public.aporte_placas (
  id                  uuid                     DEFAULT gen_random_uuid() NOT NULL,
  aporte_id           uuid                     NOT NULL,
  ingreso_id          uuid,
  placa               text                     NOT NULL,
  placa_normalizada   text                     NOT NULL,
  estado              text                     NOT NULL,
  monto_pagado        numeric(10,2)            NOT NULL,
  registrado_por      uuid                     NOT NULL,
  fecha_registro      timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT aporte_placas_pkey PRIMARY KEY (id),
  CONSTRAINT aporte_placas_aporte_fkey FOREIGN KEY (aporte_id) REFERENCES public.aportes(id) ON DELETE RESTRICT,
  CONSTRAINT aporte_placas_ingreso_fkey FOREIGN KEY (ingreso_id) REFERENCES public.ingresos_vehiculos(id) ON DELETE SET NULL,
  CONSTRAINT aporte_placas_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.perfiles(id),
  CONSTRAINT aporte_placas_estado_check CHECK (estado = ANY (ARRAY['PAGADO'::text, 'PREFERENCIAL'::text])),
  CONSTRAINT aporte_placas_monto_check CHECK (
    (estado = 'PAGADO' AND monto_pagado > 0)
    OR (estado = 'PREFERENCIAL' AND monto_pagado = 0)
  ),
  CONSTRAINT aporte_placas_placa_check CHECK (
    char_length(placa_normalizada) >= 3
    AND placa_normalizada = upper(regexp_replace(trim(placa), '[^[:alnum:]]', '', 'g'))
  ),
  CONSTRAINT aporte_placas_aporte_placa_key UNIQUE (aporte_id, placa_normalizada)
);

CREATE INDEX aporte_placas_aporte_estado_idx
  ON public.aporte_placas (aporte_id, estado);

CREATE INDEX aporte_placas_placa_idx
  ON public.aporte_placas (placa_normalizada, fecha_registro DESC);

ALTER TABLE public.aportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aporte_placas ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.aportes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.aporte_placas FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.aportes TO authenticated;
GRANT SELECT ON public.aporte_placas TO authenticated;

CREATE POLICY ver_aportes
  ON public.aportes
  FOR SELECT
  TO authenticated
  USING (public.obtener_rol_usuario() IS NOT NULL);

CREATE POLICY ver_aporte_placas
  ON public.aporte_placas
  FOR SELECT
  TO authenticated
  USING (public.obtener_rol_usuario() IS NOT NULL);

CREATE FUNCTION public.crear_aporte(
  p_nombre text,
  p_monto numeric
)
RETURNS public.aportes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_aporte public.aportes;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = v_uid AND estado = true AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo un administrador activo puede crear aportes';
  END IF;

  IF p_nombre IS NULL OR char_length(trim(p_nombre)) < 3 THEN
    RAISE EXCEPTION 'El nombre debe tener al menos 3 caracteres';
  END IF;

  IF p_monto IS NULL OR p_monto <= 0 THEN
    RAISE EXCEPTION 'El monto debe ser mayor que cero';
  END IF;

  INSERT INTO public.aportes (nombre, monto, creado_por)
  VALUES (trim(p_nombre), round(p_monto, 2), v_uid)
  RETURNING * INTO v_aporte;

  RETURN v_aporte;
END;
$$;

CREATE FUNCTION public.actualizar_aporte(
  p_aporte_id uuid,
  p_nombre text,
  p_monto numeric
)
RETURNS public.aportes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_aporte public.aportes;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = v_uid AND estado = true AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo un administrador activo puede editar aportes';
  END IF;

  IF p_nombre IS NULL OR char_length(trim(p_nombre)) < 3 THEN
    RAISE EXCEPTION 'El nombre debe tener al menos 3 caracteres';
  END IF;

  IF p_monto IS NULL OR p_monto <= 0 THEN
    RAISE EXCEPTION 'El monto debe ser mayor que cero';
  END IF;

  UPDATE public.aportes
  SET nombre = trim(p_nombre),
      monto = round(p_monto, 2),
      fecha_actualizacion = now()
  WHERE id = p_aporte_id
  RETURNING * INTO v_aporte;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aporte no encontrado';
  END IF;

  RETURN v_aporte;
END;
$$;

CREATE FUNCTION public.establecer_estado_aporte(
  p_aporte_id uuid,
  p_activo boolean
)
RETURNS public.aportes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_aporte public.aportes;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = v_uid AND estado = true AND rol = 'admin'
  ) THEN
    RAISE EXCEPTION 'Solo un administrador activo puede cambiar el estado del aporte';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('public.aportes.unico_activo'));

  IF NOT EXISTS (SELECT 1 FROM public.aportes WHERE id = p_aporte_id) THEN
    RAISE EXCEPTION 'Aporte no encontrado';
  END IF;

  IF p_activo THEN
    UPDATE public.aportes
    SET estado = 'INACTIVO',
        fecha_actualizacion = now()
    WHERE estado = 'ACTIVO' AND id <> p_aporte_id;
  END IF;

  UPDATE public.aportes
  SET estado = CASE WHEN p_activo THEN 'ACTIVO' ELSE 'INACTIVO' END,
      fecha_actualizacion = now()
  WHERE id = p_aporte_id
  RETURNING * INTO v_aporte;

  RETURN v_aporte;
END;
$$;

CREATE FUNCTION public.registrar_estado_aporte_placa(
  p_ingreso_id uuid,
  p_estado text
)
RETURNS public.aporte_placas
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ingreso public.ingresos_vehiculos;
  v_aporte public.aportes;
  v_resultado public.aporte_placas;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE id = v_uid AND estado = true AND rol = 'operador'
  ) THEN
    RAISE EXCEPTION 'Solo un operador activo puede registrar el estado de un aporte';
  END IF;

  IF p_estado NOT IN ('PAGADO', 'PREFERENCIAL') THEN
    RAISE EXCEPTION 'Estado de aporte no válido';
  END IF;

  SELECT * INTO v_ingreso
  FROM public.ingresos_vehiculos
  WHERE id = p_ingreso_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Ingreso no encontrado';
  END IF;

  IF v_ingreso.estado <> 'DENTRO' THEN
    RAISE EXCEPTION 'El vehículo ya no se encuentra dentro';
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
    ingreso_id,
    placa,
    placa_normalizada,
    estado,
    monto_pagado,
    registrado_por
  )
  VALUES (
    v_aporte.id,
    v_ingreso.id,
    v_ingreso.placa,
    v_ingreso.placa_normalizada,
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

CREATE FUNCTION public.obtener_ingresos_activos_con_aporte()
RETURNS TABLE (
  id uuid,
  orden_llegada bigint,
  placa text,
  placa_normalizada text,
  estado text,
  fecha_entrada timestamp with time zone,
  fecha_salida timestamp with time zone,
  ticket_id uuid,
  motivo_sin_ticket text,
  creado_por uuid,
  atendido_por uuid,
  fecha_creacion timestamp with time zone,
  fecha_actualizacion timestamp with time zone,
  aporte_id uuid,
  aporte_nombre text,
  aporte_monto numeric,
  aporte_estado text,
  aporte_monto_pagado numeric,
  aporte_fecha_registro timestamp with time zone
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE perfiles.id = auth.uid() AND perfiles.estado = true AND perfiles.rol = 'operador'
  ) THEN
    RAISE EXCEPTION 'Solo un operador activo puede consultar los ingresos';
  END IF;

  RETURN QUERY
  SELECT
    ingreso.id,
    ingreso.orden_llegada,
    ingreso.placa,
    ingreso.placa_normalizada,
    ingreso.estado,
    ingreso.fecha_entrada,
    ingreso.fecha_salida,
    ingreso.ticket_id,
    ingreso.motivo_sin_ticket,
    ingreso.creado_por,
    ingreso.atendido_por,
    ingreso.fecha_creacion,
    ingreso.fecha_actualizacion,
    aporte.id,
    aporte.nombre,
    aporte.monto,
    resultado.estado,
    resultado.monto_pagado,
    resultado.fecha_registro
  FROM public.ingresos_vehiculos AS ingreso
  LEFT JOIN public.aportes AS aporte
    ON aporte.estado = 'ACTIVO'
  LEFT JOIN public.aporte_placas AS resultado
    ON resultado.aporte_id = aporte.id
   AND resultado.placa_normalizada = ingreso.placa_normalizada
  WHERE ingreso.estado = 'DENTRO'
  ORDER BY ingreso.fecha_entrada, ingreso.orden_llegada;
END;
$$;

REVOKE ALL ON FUNCTION public.crear_aporte(text, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.actualizar_aporte(uuid, text, numeric) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.establecer_estado_aporte(uuid, boolean) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.registrar_estado_aporte_placa(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.obtener_ingresos_activos_con_aporte() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.crear_aporte(text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.actualizar_aporte(uuid, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.establecer_estado_aporte(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_estado_aporte_placa(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_ingresos_activos_con_aporte() TO authenticated;
