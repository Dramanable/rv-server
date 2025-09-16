#!/bin/bash

# Script pour corriger les propriétés non initialisées dans les DTOs et schemas

echo "🔧 Correction des propriétés non initialisées..."

# Fonction pour ajouter ! aux propriétés
fix_properties() {
    local file="$1"
    echo "Traitement de $file"
    
    # Utiliser une expression plus précise
    sed -i 's/^\([[:space:]]*\)\([a-zA-Z_][a-zA-Z0-9_]*\):[[:space:]]*\([^;=!]*\);$/\1\2!: \3;/g' "$file"
}

# Traiter les DTOs
echo "📋 Traitement des DTOs..."
find "/home/amadou/Desktop/rvproject/server/src/presentation/dtos" -name "*.dto.ts" | while read -r file; do
    fix_properties "$file"
done

# Traiter les schemas NoSQL
echo "🍃 Traitement des schemas NoSQL..."
find "/home/amadou/Desktop/rvproject/server/src/infrastructure/database/entities/nosql" -name "*.schema.ts" | while read -r file; do
    fix_properties "$file"
done

echo "✅ Correction terminée"
