-- 🏗️ Initialisation PostgreSQL - RVProject
-- ✅ Création automatique du schéma et configuration

-- 1️⃣ Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2️⃣ Créer le schéma principal de l'application
CREATE SCHEMA IF NOT EXISTS rvproject_schema;

-- 3️⃣ Donner les permissions appropriées à l'utilisateur de l'application
GRANT ALL PRIVILEGES ON SCHEMA rvproject_schema TO rvproject_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA rvproject_schema TO rvproject_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA rvproject_schema TO rvproject_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA rvproject_schema TO rvproject_user;

-- 4️⃣ Définir les privilèges par défaut pour les futurs objets
ALTER DEFAULT PRIVILEGES IN SCHEMA rvproject_schema GRANT ALL ON TABLES TO rvproject_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA rvproject_schema GRANT ALL ON SEQUENCES TO rvproject_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA rvproject_schema GRANT ALL ON FUNCTIONS TO rvproject_user;

-- 5️⃣ Log de confirmation
SELECT 'Schema rvproject_schema created successfully with proper permissions' as initialization_status;
