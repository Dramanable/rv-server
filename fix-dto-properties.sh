#!/bin/bash

# Script pour corriger intelligemment les propriétés non initialisées

echo "🔧 Correction intelligente des propriétés..."

# Fonction pour ajouter ! seulement aux propriétés de classes, pas aux objets
fix_class_properties() {
    local file="$1"
    echo "Traitement de $file"
    
    # Traiter seulement les propriétés de classe (qui ne sont pas dans des objets)
    # Chercher les lignes qui commencent par des espaces, nom de propriété, deux points, type, point-virgule
    # Mais pas celles dans des définitions d'objets comme { nom: type }
    perl -i -pe '
        # Si on est dans une classe (après "export class" et avant "}")
        # et la ligne ressemble à une propriété de classe
        if (/^\s+[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*[^;{]+\s*;\s*$/ && 
            !/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:\s*\{/ &&  # pas un objet
            !/!\s*:/) {  # pas déjà avec !
            s/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^;]+);(\s*)$/$1$2!: $3;$4/;
        }
    ' "$file"
}

# Traiter seulement les DTOs pour l'instant
echo "📋 Traitement des DTOs..."
find "/home/amadou/Desktop/rvproject/server/src/presentation/dtos" -name "*.dto.ts" | while read -r file; do
    fix_class_properties "$file"
done

echo "✅ Correction DTOs terminée"
