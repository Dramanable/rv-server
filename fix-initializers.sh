#!/bin/bash

# Script pour corriger automatiquement les erreurs "has no initializer"

echo "🔧 Correction des propriétés sans initialisation..."

# Fonction pour corriger les propriétés dans un fichier
fix_properties_in_file() {
    local file="$1"
    echo "📝 Traitement: $(basename "$file")"
    
    # Utiliser sed pour ajouter ! aux propriétés de classe
    # Pattern: ligne qui commence par des espaces, nom de propriété, : type; 
    # Et qui n'a pas déjà un ! ou =
    sed -i 's/^\(\s\+\)\([a-zA-Z_][a-zA-Z0-9_]*\)\s*:\s*\([^;=!]*\);$/\1\2!: \3;/g' "$file"
    
    # Patterns spéciaux pour les propriétés complexes
    sed -i 's/^\(\s\+\)\([a-zA-Z_][a-zA-Z0-9_]*\)\s*:\s*\(Types\.ObjectId\);$/\1\2!: \3;/g' "$file"
    sed -i 's/^\(\s\+\)\([a-zA-Z_][a-zA-Z0-9_]*\)\s*:\s*\(Date\);$/\1\2!: \3;/g' "$file"
    sed -i 's/^\(\s\+\)\([a-zA-Z_][a-zA-Z0-9_]*\)\s*:\s*\(string\);$/\1\2!: \3;/g' "$file"
    sed -i 's/^\(\s\+\)\([a-zA-Z_][a-zA-Z0-9_]*\)\s*:\s*\(number\);$/\1\2!: \3;/g' "$file"
    sed -i 's/^\(\s\+\)\([a-zA-Z_][a-zA-Z0-9_]*\)\s*:\s*\(boolean\);$/\1\2!: \3;/g' "$file"
}

# Corriger les schemas NoSQL
echo "🍃 Schemas NoSQL..."
find "src/infrastructure/database/entities/nosql" -name "*.schema.ts" -type f | while read -r file; do
    fix_properties_in_file "$file"
done

# Corriger les DTOs
echo "📋 DTOs..."
find "src/presentation/dtos" -name "*.dto.ts" -type f | while read -r file; do
    fix_properties_in_file "$file"
done

echo "✅ Correction automatique terminée !"
