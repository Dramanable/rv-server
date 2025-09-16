#!/bin/bash

# 🔑 Script pour créer l'utilisateur test admin
# À exécuter une fois que la base de données PostgreSQL est démarrée

echo "🔑 Création de l'utilisateur test admin..."

# Variables de connexion
DB_HOST="localhost"
DB_PORT="5432"
DB_NAME="testingcleanarchi"
DB_USER="admin"
DB_PASSWORD="amadou"

# Attendre que la base soit prête
echo "⏳ Attente de la disponibilité de PostgreSQL..."
while ! pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER > /dev/null 2>&1; do
  echo "   📡 PostgreSQL non disponible, attente..."
  sleep 2
done

echo "✅ PostgreSQL disponible, exécution du script..."

# Exécuter le script SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$(dirname "$0")/create-test-admin.sql"

if [ $? -eq 0 ]; then
    echo "✅ Utilisateur test admin créé avec succès !"
    echo "📧 Email: test@admin.com"
    echo "🔑 Password: amadou"
else
    echo "❌ Erreur lors de la création de l'utilisateur test admin"
    exit 1
fi
