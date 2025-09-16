#!/bin/bash

# Script simple et sûr pour corriger uniquement les propriétés de classe requises

echo "🔧 Correction simple des propriétés de classe..."

# Fonction pour corriger de façon très précise
fix_simple() {
    local file="$1"
    
    # Pattern très spécifique : 
    # - Début de ligne + espaces
    # - @Prop() ou @Transform() ou @Expose() ou @Type() peut être présent
    # - Nom de propriété + : + type + ;
    # - PAS de ? dans le nom (pour éviter les optionnelles)
    # - PAS dans une accolade (pour éviter les types inline)
    
    # Utiliser perl pour plus de précision
    perl -pi -e '
        # Seulement les lignes qui ressemblent à des propriétés de classe requises
        if (/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*): ([^;{]+;)$/ && $_ !~ /\?/ && $_ !~ /^\s*\//) {
            s/^(\s+)([a-zA-Z_][a-zA-Z0-9_]*): ([^;{]+;)$/$1$2!: $3/;
        }
    ' "$file"
    
    echo "✅ Fixé simple: $file"
}

# Appliquer seulement aux DTOs problématiques
for file in src/presentation/dtos/*.dto.ts src/infrastructure/database/entities/nosql/*.schema.ts; do
    if [ -f "$file" ]; then
        fix_simple "$file"
    fi
done

echo "🎯 Test rapide de syntaxe..."
timeout 10s npx tsc --noEmit 2>&1 | grep -E "Property.*signature expected" | wc -l
