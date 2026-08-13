-- Datos exclusivos para desarrollo local.
-- No ejecutar en produccion ni usar `supabase db push --include-seed`.

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'admin@parking.local',
    extensions.crypt('12345678', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre_completo":"Administrador Local","rol":"admin"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'operador@parking.local',
    extensions.crypt('12345678', extensions.gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"nombre_completo":"Operador Local","rol":"operador"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '{"sub":"10000000-0000-0000-0000-000000000001","email":"admin@parking.local","email_verified":true}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000002',
    '{"sub":"20000000-0000-0000-0000-000000000002","email":"operador@parking.local","email_verified":true}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
ON CONFLICT (provider_id, provider) DO NOTHING;
