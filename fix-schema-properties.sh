#!/bin/bash

# Script pour corriger les propriétés de classe dans les schemas NoSQL

echo "🍃 Correction des schemas NoSQL..."

fix_schema_properties() {
    local file="$1"
    echo "Traitement de $file"
    
    # Corriger seulement les propriétés directes de classe
    perl -i -pe '
        # Si la ligne ressemble à une propriété de classe et n'est pas déjà corrigée
        if (/^\s+[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*[^;{]+\s*;\s*$/ &&
            !/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*\{/ &&  # pas un objet
            !/!\s*:/ &&  # pas déjà avec !
            !/required\s*:/ &&  # pas dans une définition de schema
            !/type\s*:/) {  # pas dans une définition de schema
            s/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^;]+);(\s*)$/$1$2!: $3;$4/;
        }
    ' "$file"
}

# Traiter les schemas NoSQL
find "/home/amadou/Desktop/rvproject/server/src/infrastructure/database/entities/nosql" -name "*.schema.ts" | while read -r file; do
    fix_schema_properties "$file"
done

echo "✅ Correction schemas terminée"
