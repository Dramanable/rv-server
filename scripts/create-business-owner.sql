-- Script de création d'un BUSINESS_OWNER avec toutes les permissions
-- À exécuter dans le schéma correct (rvproject_schema)

-- Supprimer l'utilisateur s'il existe déjà
DELETE FROM rvproject_schema.users WHERE email = 'owner@business.com';

-- Créer un BUSINESS_OWNER avec mot de passe : BusinessOwner123!
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
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000'::uuid,
    'owner@business.com',
    'businessowner',
    '$2b$10$L4ZQzGP4X0gB2CIqX.gFWeMQVYL9HGmSHBK4LQzYbTxRyZKnKfgD2', -- BusinessOwner123!
    'Business',
    'Owner',
    'BUSINESS_OWNER',
    true,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Vérifier la création
SELECT id, email, role, is_active, created_at
FROM rvproject_schema.users
WHERE email = 'owner@business.com';
