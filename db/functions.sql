-- CREATE OR REPLACE FUNCTION actualizar_precio_defecto(nuevo_precio numeric)
-- RETURNS void
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- DECLARE
--   rol_usuario text;
-- BEGIN
--   SELECT rol INTO rol_usuario FROM public.perfiles WHERE id = auth.uid() AND estado = true;

--   IF rol_usuario IS NULL OR rol_usuario != 'admin' THEN
--     RAISE EXCEPTION 'No tienes permisos para realizar esta acción';
--   END IF;

--   UPDATE public.configuracion
--   SET precio_defecto = nuevo_precio,
--       fecha_actualizacion = now()
--   WHERE id = 1;
-- END;
-- $$;

CREATE OR REPLACE FUNCTION actualizar_precio_defecto(nuevo_precio numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  rol_usuario text;
  uid uuid;
BEGIN
  -- Obtener el uid correctamente dentro de SECURITY DEFINER
  uid := auth.uid();

  IF uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  SELECT rol INTO rol_usuario 
  FROM public.perfiles 
  WHERE id = uid AND estado = true;

  IF rol_usuario IS NULL OR rol_usuario != 'admin' THEN
    RAISE EXCEPTION 'No tienes permisos para realizar esta acción. Rol: %', COALESCE(rol_usuario, 'NULL');
  END IF;

  UPDATE public.configuracion
  SET precio_defecto = nuevo_precio,
      fecha_actualizacion = now()
  WHERE id = 1;
END;
$$;