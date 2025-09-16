-- 🚀 Script de création d'un Super Admin
-- À exécuter dans pgAdmin ou tout autre client PostgreSQL
-- 
-- Utilisateur créé:
-- Email: admin@example.com
-- Password: superadmin
-- Role: PLATFORM_ADMIN

-- Créer le super admin avec la vraie structure de la table
INSERT INTO users (
    id,
    email,
    name,
    "hashedPassword",
    "passwordChangeRequired",
    role,
    "isActive",
    "lastLoginAt",
    "lastLoginIp",
    "loginAttempts",
    "lockedUntil",
    "emailVerified",
    "emailVerifiedAt",
    "emailVerificationToken",
    "passwordResetToken",
    "passwordResetExpires",
    "tenantId",
    metadata,
    "createdAt",
    "updatedAt",
    version
) VALUES (
    gen_random_uuid(), -- Génère automatiquement un UUID
    'admin@example.com',
    'Super Administrator',
    '$2b$12$72JayMbpWdYvpppwVKTY.ece6igWkGKIUNSbAUoHfkww4qJXiNnF6', -- bcrypt hash de "superadmin"
    false,
    'PLATFORM_ADMIN',
    true,
    NULL,
    NULL,
    0,
    NULL,
    true, -- Email déjà vérifié pour le super admin
    NOW(),
    NULL,
    NULL,
    NULL,
    NULL,
    '{"created_by": "sql_script", "is_default_admin": true}'::jsonb,
    NOW(),
    NOW(),
    1
)
ON CONFLICT (email) DO UPDATE SET
    name = EXCLUDED.name,
    "hashedPassword" = EXCLUDED."hashedPassword",
    "passwordChangeRequired" = EXCLUDED."passwordChangeRequired",
    role = EXCLUDED.role,
    "isActive" = EXCLUDED."isActive",
    "emailVerified" = EXCLUDED."emailVerified",
    "emailVerifiedAt" = EXCLUDED."emailVerifiedAt",
    metadata = EXCLUDED.metadata,
    "updatedAt" = NOW(),
    version = users.version + 1;

-- Vérification de la création
SELECT 
    id,
    email,
    name,
    role,
    "isActive",
    "emailVerified",
    "createdAt",
    "updatedAt",
    version
FROM users 
WHERE email = 'admin@example.com';
