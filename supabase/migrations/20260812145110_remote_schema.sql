-- Migration unit 1: schema_changes
-- Transaction mode: transactional
-- Boundary reason: default

SET check_function_bodies = false;

DROP EXTENSION pg_net;

DROP EXTENSION pg_graphql;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO anon;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT DELETE, INSERT, SELECT, UPDATE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT, USAGE ON SEQUENCES TO service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO service_role;

CREATE SEQUENCE public.secuencia_numero_ticket;

GRANT ALL ON SEQUENCE public.secuencia_numero_ticket TO anon;

GRANT ALL ON SEQUENCE public.secuencia_numero_ticket TO authenticated;

GRANT ALL ON SEQUENCE public.secuencia_numero_ticket TO service_role;

CREATE FUNCTION public.actualizar_precio_defecto (
  nuevo_precio numeric
)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public', 'auth'
  AS $function$
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
$function$;

GRANT ALL ON FUNCTION public.actualizar_precio_defecto(numeric) TO anon;

GRANT ALL ON FUNCTION public.actualizar_precio_defecto(numeric) TO authenticated;

GRANT ALL ON FUNCTION public.actualizar_precio_defecto(numeric) TO service_role;

CREATE FUNCTION public.manejar_nuevo_usuario()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
BEGIN
  INSERT INTO public.perfiles (id, correo, rol, nombre_completo)
  VALUES (
    new.id, 
    new.email, -- new.email es propio de auth.users de Supabase, se queda así
    COALESCE((new.raw_user_meta_data->>'rol'), 'operador'), 
    new.raw_user_meta_data->>'nombre_completo'
  );
  RETURN new;
END;
$function$;

CREATE TRIGGER en_usuario_auth_creado
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.manejar_nuevo_usuario();

GRANT ALL ON FUNCTION public.manejar_nuevo_usuario() TO anon;

GRANT ALL ON FUNCTION public.manejar_nuevo_usuario() TO authenticated;

GRANT ALL ON FUNCTION public.manejar_nuevo_usuario() TO service_role;

CREATE FUNCTION public.obtener_rol_usuario()
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  AS $function$
  SELECT rol FROM public.perfiles
  WHERE id = auth.uid() AND estado = true;
$function$;

GRANT ALL ON FUNCTION public.obtener_rol_usuario() TO anon;

GRANT ALL ON FUNCTION public.obtener_rol_usuario() TO authenticated;

GRANT ALL ON FUNCTION public.obtener_rol_usuario() TO service_role;

CREATE FUNCTION public.reiniciar_secuencia_ticket()
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $function$
BEGIN
  ALTER SEQUENCE secuencia_numero_ticket RESTART WITH 1;
END;
$function$;

GRANT ALL ON FUNCTION public.reiniciar_secuencia_ticket() TO anon;

GRANT ALL ON FUNCTION public.reiniciar_secuencia_ticket() TO authenticated;

GRANT ALL ON FUNCTION public.reiniciar_secuencia_ticket() TO service_role;

CREATE TABLE public.configuracion (
  id                  integer                  DEFAULT 1 NOT NULL,
  nombre_empresa      text                     NOT NULL,
  precio_defecto      numeric(10,2)            NOT NULL,
  fecha_actualizacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.configuracion
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.configuracion
  ADD CONSTRAINT configuracion_pkey PRIMARY KEY (id);

ALTER TABLE public.configuracion
  ADD CONSTRAINT fila_unica CHECK (id = 1);

GRANT ALL ON public.configuracion TO anon;

GRANT ALL ON public.configuracion TO authenticated;

GRANT ALL ON public.configuracion TO service_role;

CREATE POLICY modificar_configuracion ON public.configuracion
  FOR UPDATE
  TO authenticated
  USING ((public.obtener_rol_usuario() = 'admin'::text))
  WITH CHECK ((public.obtener_rol_usuario() = 'admin'::text));

CREATE POLICY ver_configuracion ON public.configuracion
  FOR SELECT
  TO authenticated
  USING ((public.obtener_rol_usuario() IS NOT NULL));

CREATE TABLE public.perfiles (
  id              uuid                     NOT NULL,
  correo          text                     NOT NULL,
  rol             text                     NOT NULL,
  nombre_completo text,
  fecha_creacion  timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  estado          boolean                  DEFAULT true NOT NULL
);

ALTER TABLE public.perfiles
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_pkey PRIMARY KEY (id);

ALTER TABLE public.perfiles
  ADD CONSTRAINT perfiles_rol_check CHECK (rol = ANY (ARRAY['admin'::text, 'operador'::text]));

GRANT ALL ON public.perfiles TO anon;

GRANT ALL ON public.perfiles TO authenticated;

GRANT ALL ON public.perfiles TO service_role;

CREATE POLICY actualizar_perfiles ON public.perfiles
  FOR UPDATE
  TO authenticated
  USING ((((auth.uid() = id) AND (estado = true)) OR (public.obtener_rol_usuario() = 'admin'::text)))
  WITH CHECK ((((auth.uid() = id) AND (estado = true)) OR (public.obtener_rol_usuario() = 'admin'::text)));

CREATE POLICY eliminar_perfiles ON public.perfiles
  FOR DELETE
  TO authenticated
  USING ((public.obtener_rol_usuario() = 'admin'::text));

CREATE POLICY insertar_perfiles ON public.perfiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((public.obtener_rol_usuario() = 'admin'::text));

CREATE POLICY ver_perfiles ON public.perfiles
  FOR SELECT
  TO authenticated
  USING ((((auth.uid() = id) AND (estado = true)) OR (public.obtener_rol_usuario() = 'admin'::text)));

CREATE TABLE public.tickets (
  id             uuid                     DEFAULT gen_random_uuid() NOT NULL,
  numero_ticket  integer                  DEFAULT nextval('public.secuencia_numero_ticket'::regclass) NOT NULL,
  placa          text                     NOT NULL,
  monto_cobrado  numeric(10,2)            NOT NULL,
  estado         text                     DEFAULT 'PAGADO'::text NOT NULL,
  notas          text,
  operador_id    uuid                     NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.tickets
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.tickets
  ADD CONSTRAINT requerir_notas_para_excepciones
    CHECK ((estado = ANY (ARRAY['PAGADO'::text, 'PENDIENTE'::text])) OR (estado = ANY (ARRAY['NO_PAGADO'::text, 'ANULADO'::text])) AND notas IS
    NOT NULL AND TRIM(BOTH FROM notas) <> ''::text);

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_estado_check CHECK (estado = ANY (ARRAY['PAGADO'::text, 'PENDIENTE'::text, 'NO_PAGADO'::text, 'ANULADO'::text]));

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_operador_id_fkey FOREIGN KEY (operador_id) REFERENCES public.perfiles(id);

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);

GRANT ALL ON public.tickets TO anon;

GRANT ALL ON public.tickets TO authenticated;

GRANT ALL ON public.tickets TO service_role;

CREATE POLICY actualizar_tickets ON public.tickets
  FOR UPDATE
  TO authenticated
  USING ((((operador_id = auth.uid()) AND (public.obtener_rol_usuario() IS NOT NULL)) OR (public.obtener_rol_usuario() = 'admin'::text)));

CREATE POLICY crear_tickets ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (((operador_id = auth.uid()) AND (public.obtener_rol_usuario() IS NOT NULL)));

CREATE POLICY eliminar_tickets ON public.tickets
  FOR DELETE
  TO authenticated
  USING ((public.obtener_rol_usuario() = 'admin'::text));

CREATE POLICY ver_tickets ON public.tickets
  FOR SELECT
  TO authenticated
  USING ((((operador_id = auth.uid()) AND (public.obtener_rol_usuario() IS NOT NULL)) OR (public.obtener_rol_usuario() = 'admin'::text)));
