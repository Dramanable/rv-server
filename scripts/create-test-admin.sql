-- 🔑 Script de création d'un Super Admin pour Tests
-- À exécuter dans pgAdmin ou tout autre client PostgreSQL
-- 
-- Utilisateur créé:
-- Email: test@admin.com
-- Password: amadou
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
    'test@admin.com',
    'Test Super Admin',
    '$2b$12$OCOfEYGvLhTp2h40Cy5k6evQ.Mf4mM5T1YzN4Jc8k/af7fk7OEP/C', -- bcrypt hash de "amadou"
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
    '{"created_by": "test_script", "password": "amadou", "for_testing": true}'::jsonb,
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
    "passwordChangeRequired",
    "createdAt",
    "updatedAt",
    version,
    metadata
FROM users 
WHERE email = 'test@admin.com';

-- Test de login avec le nouveau compte
-- Pour tester, vous pouvez utiliser les credentials:
-- Email: test@admin.com
-- Password: amadou
