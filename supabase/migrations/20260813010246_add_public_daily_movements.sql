CREATE INDEX ingresos_vehiculos_fecha_entrada_orden_idx
  ON public.ingresos_vehiculos (fecha_entrada, orden_llegada);

CREATE FUNCTION public.obtener_movimientos_publicos(
  p_fecha date DEFAULT ((now() AT TIME ZONE 'America/Lima')::date)
)
RETURNS TABLE (
  clave_publica text,
  orden_dia bigint,
  posicion_actual bigint,
  placa text,
  estado text,
  fecha_entrada timestamp with time zone,
  fecha_salida timestamp with time zone,
  es_anterior boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
  WITH limites AS (
    SELECT
      (COALESCE(p_fecha, (now() AT TIME ZONE 'America/Lima')::date)::timestamp AT TIME ZONE 'America/Lima') AS inicio,
      ((COALESCE(p_fecha, (now() AT TIME ZONE 'America/Lima')::date) + 1)::timestamp AT TIME ZONE 'America/Lima') AS fin
  ),
  posiciones_activas AS (
    SELECT
      ingreso.id,
      row_number() OVER (ORDER BY ingreso.fecha_entrada, ingreso.orden_llegada) AS posicion
    FROM public.ingresos_vehiculos AS ingreso
    WHERE ingreso.estado = 'DENTRO'
  ),
  ingresos_del_dia AS (
    SELECT
      ingreso.*,
      row_number() OVER (ORDER BY ingreso.fecha_entrada, ingreso.orden_llegada) AS orden_del_dia
    FROM public.ingresos_vehiculos AS ingreso
    CROSS JOIN limites
    WHERE ingreso.fecha_entrada >= limites.inicio
      AND ingreso.fecha_entrada < limites.fin
  ),
  filas AS (
    SELECT
      md5(ingreso.id::text) AS clave_publica,
      ingreso.orden_del_dia AS orden_dia,
      posicion.posicion AS posicion_actual,
      ingreso.placa,
      ingreso.estado,
      ingreso.fecha_entrada,
      ingreso.fecha_salida,
      false AS es_anterior,
      ingreso.orden_llegada
    FROM ingresos_del_dia AS ingreso
    LEFT JOIN posiciones_activas AS posicion ON posicion.id = ingreso.id

    UNION ALL

    SELECT
      md5(ingreso.id::text) AS clave_publica,
      NULL::bigint AS orden_dia,
      posicion.posicion AS posicion_actual,
      ingreso.placa,
      ingreso.estado,
      ingreso.fecha_entrada,
      ingreso.fecha_salida,
      true AS es_anterior,
      ingreso.orden_llegada
    FROM public.ingresos_vehiculos AS ingreso
    INNER JOIN posiciones_activas AS posicion ON posicion.id = ingreso.id
    CROSS JOIN limites
    WHERE ingreso.fecha_entrada < limites.inicio
  )
  SELECT
    filas.clave_publica,
    filas.orden_dia,
    filas.posicion_actual,
    filas.placa,
    filas.estado,
    filas.fecha_entrada,
    filas.fecha_salida,
    filas.es_anterior
  FROM filas
  ORDER BY filas.fecha_entrada, filas.orden_llegada;
$$;

REVOKE ALL ON FUNCTION public.obtener_movimientos_publicos(date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.obtener_movimientos_publicos(date) TO anon, authenticated;
