-- ==============================================================================
-- 1. EXTENSIONES Y SEGURIDAD BASE
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLA DE PERFILES (ROLES)
-- ==============================================================================
CREATE TABLE public.perfiles (
  -- El id sigue vinculado a la tabla interna de Supabase que está en inglés (auth.users)
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  correo text NOT NULL,
  rol text NOT NULL CHECK (rol IN ('admin', 'operador')),
  nombre_completo text,
  fecha_creacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- 3. TABLA DE CONFIGURACIÓN
-- ==============================================================================
CREATE TABLE public.configuracion (
  id integer PRIMARY KEY DEFAULT 1,
  nombre_empresa text NOT NULL,
  precio_defecto numeric(10, 2) NOT NULL,
  fecha_actualizacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Restricción para asegurar que solo exista una fila de configuración
  CONSTRAINT fila_unica CHECK (id = 1)
);

-- Insertamos la configuración inicial
INSERT INTO public.configuracion (id, nombre_empresa, precio_defecto)
VALUES (1, 'Mi Parqueadero', 5.00)
ON CONFLICT (id) DO NOTHING;

-- ==============================================================================
-- 4. SECUENCIA Y TABLA DE TICKETS
-- ==============================================================================
CREATE SEQUENCE IF NOT EXISTS secuencia_numero_ticket START 1;

CREATE TABLE public.tickets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_ticket integer DEFAULT nextval('secuencia_numero_ticket') NOT NULL,
  placa text NOT NULL,
  
  -- El precio que se cobra (o que se debió cobrar si se escapan)
  monto_cobrado numeric(10, 2) NOT NULL, 
  
  -- Estados: PAGADO (Por defecto), PENDIENTE, NO_PAGADO, ANULADO
  estado text NOT NULL DEFAULT 'PAGADO' CHECK (estado IN ('PAGADO', 'PENDIENTE', 'NO_PAGADO', 'ANULADO')),
  
  -- Notas (Opcionales en flujo normal, obligatorias si no se paga o se anula)
  notas text,
  
  operador_id uuid REFERENCES public.perfiles(id) NOT NULL,
  fecha_creacion timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- REGLA DE NEGOCIO ESTRICTA:
  -- Si el estado es NO_PAGADO o ANULADO, el campo 'notas' NO puede estar vacío.
  CONSTRAINT requerir_notas_para_excepciones CHECK (
    estado IN ('PAGADO', 'PENDIENTE') OR 
    (estado IN ('NO_PAGADO', 'ANULADO') AND notas IS NOT NULL AND trim(notas) != '')
  )
);

-- ==============================================================================
-- 5. FUNCIÓN PARA REINICIAR LA SECUENCIA DE TICKETS
-- ==============================================================================
CREATE OR REPLACE FUNCTION reiniciar_secuencia_ticket()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  ALTER SEQUENCE secuencia_numero_ticket RESTART WITH 1;
END;
$$;

-- ==============================================================================
-- 6. TRIGGER PARA CREAR PERFIL AUTOMÁTICAMENTE
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Disparador que escucha a la tabla auth.users
CREATE OR REPLACE TRIGGER en_usuario_auth_creado
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.manejar_nuevo_usuario();