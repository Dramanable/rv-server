#!/bin/bash

# Script pour corriger uniquement les propriétés de classe (pas dans les types)
# Ne modifie que les lignes qui commencent par des espaces suivis d'un nom de propriété

echo "🔧 Correction des propriétés de classe dans les schemas et DTOs..."

# Fonction pour corriger un fichier
fix_class_properties() {
    local file="$1"
    
    # Sauvegarde
    cp "$file" "$file.bak"
    
    # Corrige uniquement les propriétés de classe (pas dans les types)
    # Pattern: début de ligne + espaces + nom + : + type (mais pas dans {})
    sed -i 's/^\( *\)\([a-zA-Z_][a-zA-Z0-9_]*\): \([^;]*;\)$/\1\2!: \3/' "$file"
    
    # Revenir en arrière pour les propriétés optionnelles (qui ont déjà ?)
    sed -i 's/^\( *\)\([a-zA-Z_][a-zA-Z0-9_]*\)!\?: \([^;]*;\)$/\1\2?: \3/' "$file"
    
    echo "✅ Fixé: $file"
}

# Fichiers DTOs
for file in src/presentation/dtos/*.dto.ts; do
    if [ -f "$file" ]; then
        fix_class_properties "$file"
    fi
done

# Fichiers Schemas
for file in src/infrastructure/database/entities/nosql/*.schema.ts; do
    if [ -f "$file" ]; then
        fix_class_properties "$file"
    fi
done

echo "🎯 Script terminé. Vérification des erreurs..."

# Test rapide
npx tsc --noEmit 2>&1 | grep -E "(has no initializer|Property.*expected)" | head -5
