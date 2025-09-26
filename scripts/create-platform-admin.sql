-- Script de création d'un PLATFORM_ADMIN avec toutes les permissions
-- À exécuter dans le schéma correct (rvproject_schema)

-- Supprimer l'utilisateur s'il existe déjà
DELETE FROM rvproject_schema.users WHERE email = 'platform.admin@example.com';

-- Créer un PLATFORM_ADMIN avec mot de passe : StrongPassword123!
INSERT INTO rvproject_schema.users (
    id,
    email,
    username,
    hashed_password,
    first_name,
    last_name,
    role,
    is_active,
    is_verified,
    password_change_required,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'platform.admin@example.com',
    'platformadmin',
    '$2b$10$yKv4yHQH4H7Wgl8mOvyOzuc5gBGKNVgAEf2uIx5PFMrm6mTg5dEBm', -- StrongPassword123!
    'Platform',
    'Admin',
    'PLATFORM_ADMIN',
    true,
    true,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Vérifier la création
SELECT id, email, role, is_active, created_at
FROM rvproject_schema.users
WHERE email = 'platform.admin@example.com';
