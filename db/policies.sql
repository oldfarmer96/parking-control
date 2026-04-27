-- =============================================
-- FUNCIÓN AUXILIAR
-- Retorna NULL si el usuario está inactivo
-- =============================================
CREATE OR REPLACE FUNCTION public.obtener_rol_usuario()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT rol FROM public.perfiles
  WHERE id = auth.uid() AND estado = true;
$$;

-- =============================================
-- POLÍTICAS: perfiles
-- =============================================

-- SELECT: operador activo ve solo el suyo, admin ve todos
CREATE POLICY "ver_perfiles"
ON public.perfiles FOR SELECT
TO authenticated
USING (
  (auth.uid() = id AND estado = true)
  OR public.obtener_rol_usuario() = 'admin'
);

-- UPDATE: operador activo edita solo el suyo, admin edita todos
CREATE POLICY "actualizar_perfiles"
ON public.perfiles FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id AND estado = true)
  OR public.obtener_rol_usuario() = 'admin'
)
WITH CHECK (
  (auth.uid() = id AND estado = true)
  OR public.obtener_rol_usuario() = 'admin'
);

-- DELETE: solo admin
CREATE POLICY "eliminar_perfiles"
ON public.perfiles FOR DELETE
TO authenticated
USING (public.obtener_rol_usuario() = 'admin');

-- INSERT: solo admin (el trigger también puede insertar por SECURITY DEFINER)
CREATE POLICY "insertar_perfiles"
ON public.perfiles FOR INSERT
TO authenticated
WITH CHECK (public.obtener_rol_usuario() = 'admin');

-- =============================================
-- POLÍTICAS: configuracion
-- =============================================

-- SELECT: cualquier usuario activo puede leer
CREATE POLICY "ver_configuracion"
ON public.configuracion FOR SELECT
TO authenticated
USING (public.obtener_rol_usuario() IS NOT NULL);

-- UPDATE: solo admin
CREATE POLICY "modificar_configuracion"
ON public.configuracion FOR UPDATE
TO authenticated
USING (public.obtener_rol_usuario() = 'admin')
WITH CHECK (public.obtener_rol_usuario() = 'admin');

-- =============================================
-- POLÍTICAS: tickets
-- =============================================

-- SELECT: operador ve solo los suyos, admin ve todos
CREATE POLICY "ver_tickets"
ON public.tickets FOR SELECT
TO authenticated
USING (
  (operador_id = auth.uid() AND public.obtener_rol_usuario() IS NOT NULL)
  OR public.obtener_rol_usuario() = 'admin'
);

-- INSERT: operador activo crea tickets con su propio id
CREATE POLICY "crear_tickets"
ON public.tickets FOR INSERT
TO authenticated
WITH CHECK (
  operador_id = auth.uid()
  AND public.obtener_rol_usuario() IS NOT NULL
);

-- UPDATE: operador activo edita los suyos, admin edita todos
CREATE POLICY "actualizar_tickets"
ON public.tickets FOR UPDATE
TO authenticated
USING (
  (operador_id = auth.uid() AND public.obtener_rol_usuario() IS NOT NULL)
  OR public.obtener_rol_usuario() = 'admin'
);

-- DELETE: solo admin
CREATE POLICY "eliminar_tickets"
ON public.tickets FOR DELETE
TO authenticated
USING (public.obtener_rol_usuario() = 'admin');