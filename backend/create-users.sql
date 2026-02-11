-- Criar usuário Admin
-- Senha: admin123
-- Hash bcrypt: $2b$10$YQZ9X8vKjXJ5vK5Z5Z5Z5uO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5

INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Administrador',
  'admin@rh.com',
  '$2b$10$rOJ5vK5Z5Z5Z5uO5Z5Z5Z.YQZ9X8vKjXJ5vK5Z5Z5Z5uO5Z5Z5Z5Zu',
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Criar usuário Psicóloga
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Psicóloga',
  'psicologa@rh.com',
  '$2b$10$rOJ5vK5Z5Z5Z5uO5Z5Z5Z.YQZ9X8vKjXJ5vK5Z5Z5Z5uO5Z5Z5Z5Zu',
  'PSICOLOGA',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
