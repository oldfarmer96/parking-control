-- ============================================================
-- PARQUEO UNIDAD MINERA HUINCHOS PATACCOHA
-- Supabase Schema — ejecutar en el SQL Editor de Supabase
-- ============================================================

-- 1. TABLA: empresa (configuración general)
CREATE TABLE empresa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL DEFAULT 'Parqueo Unidad Minera Huinchos Pataccoha',
  precio_fijo NUMERIC(10,2) NOT NULL DEFAULT 8.00,
  moneda TEXT DEFAULT 'S/',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar fila única de configuración
INSERT INTO empresa (nombre, precio_fijo) VALUES ('Parqueo Unidad Minera Huinchos Pataccoha', 8.00);

-- 2. TABLA: usuarios (operadores y administradores)
-- Nota: usa la autenticación de Supabase (auth.users)
-- Esta tabla extiende el perfil
CREATE TABLE perfiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('operador', 'admin')),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA: registros (cada vehículo que entra y paga)
CREATE TABLE registros (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket TEXT NOT NULL,           -- TK-001, TK-002...
  placa TEXT NOT NULL,            -- ABC-123
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora TIME NOT NULL DEFAULT CURRENT_TIME,
  monto NUMERIC(10,2) NOT NULL DEFAULT 8.00,
  notas TEXT,
  operador_id UUID REFERENCES perfiles(id),
  operador_nombre TEXT,           -- copia del nombre para reportes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ÍNDICES para búsquedas rápidas
CREATE INDEX idx_registros_fecha ON registros(fecha);
CREATE INDEX idx_registros_placa ON registros(placa);
CREATE INDEX idx_registros_ticket ON registros(ticket);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — seguridad por usuario
-- ============================================================

ALTER TABLE empresa ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Empresa: solo lectura para todos los autenticados
CREATE POLICY "empresa_read" ON empresa FOR SELECT TO authenticated USING (true);
CREATE POLICY "empresa_update" ON empresa FOR UPDATE TO authenticated USING (true);

-- Perfiles: cada usuario ve el suyo; admin ve todos
CREATE POLICY "perfiles_self" ON perfiles FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "perfiles_admin_all" ON perfiles FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- Registros: operador ve/crea sus registros; admin ve todos
CREATE POLICY "registros_operador_insert" ON registros FOR INSERT TO authenticated
  WITH CHECK (operador_id = auth.uid());

CREATE POLICY "registros_operador_select" ON registros FOR SELECT TO authenticated
  USING (
    operador_id = auth.uid()
    OR EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

CREATE POLICY "registros_admin_delete" ON registros FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM perfiles WHERE id = auth.uid() AND rol = 'admin')
  );

-- ============================================================
-- FUNCIÓN: siguiente número de ticket del día
-- ============================================================
CREATE OR REPLACE FUNCTION next_ticket(p_fecha DATE DEFAULT CURRENT_DATE)
RETURNS TEXT AS $$
DECLARE
  ultimo INT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(ticket FROM 'TK-(\d+)') AS INT)
  ), 0)
  INTO ultimo
  FROM registros
  WHERE fecha = p_fecha;

  RETURN 'TK-' || LPAD((ultimo + 1)::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- VISTA: resumen diario para reportes rápidos
-- ============================================================
CREATE OR REPLACE VIEW resumen_diario AS
SELECT
  fecha,
  COUNT(*) AS total_vehiculos,
  SUM(monto) AS total_recaudado,
  MIN(hora) AS primer_ingreso,
  MAX(hora) AS ultimo_ingreso
FROM registros
GROUP BY fecha
ORDER BY fecha DESC;

-- ============================================================
-- USUARIOS DE EJEMPLO
-- (crear desde Supabase Auth > Users, luego insertar perfil)
-- Email: operador@parqueo.pe   Password: op1234
-- Email: admin@parqueo.pe      Password: adm9999
-- Después de crearlos en Auth, ejecutar:
-- ============================================================
-- INSERT INTO perfiles (id, nombre, rol) VALUES
--   ('<uuid-del-operador>', 'Operador Campo', 'operador'),
--   ('<uuid-del-admin>',    'Administrador',  'admin');