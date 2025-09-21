#!/bin/bash

# 🔍 Script de Vérification des Conventions de Nommage
# Vérifie que toutes les entités utilisent la convention snake_case

echo "🔍 Vérification des conventions de nommage des entités..."

ENTITIES_DIR="src/infrastructure/database/sql/postgresql/entities"
VIOLATIONS_FOUND=0

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour vérifier les violations
check_violations() {
    local file=$1
    local violations=()

    # Chercher les @Column() sans name explicite (sauf pour les colonnes simples)
    while IFS= read -r line; do
        if [[ $line =~ @Column\(\)$ ]] && [[ $line =~ [A-Z] ]]; then
            violations+=("$line")
        fi
    done < "$file"

    # Chercher les propriétés camelCase sans name explicite
    while IFS= read -r line; do
        if [[ $line =~ @Column\(\{[^}]*\}\) ]] && [[ ! $line =~ name: ]]; then
            # Extraire le nom de la propriété
            if [[ $line =~ ^[[:space:]]*([a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*)[!?:]+ ]]; then
                violations+=("Propriété camelCase sans name explicite: ${BASH_REMATCH[1]}")
            fi
        fi
    done < "$file"

    return ${#violations[@]}
}

# Parcourir tous les fichiers d'entités
if [ -d "$ENTITIES_DIR" ]; then
    for entity_file in "$ENTITIES_DIR"/*.entity.ts; do
        if [ -f "$entity_file" ]; then
            echo "Vérification: $(basename "$entity_file")"

            # Vérifier les violations de convention
            check_violations "$entity_file"
            violations_count=$?

            if [ $violations_count -gt 0 ]; then
                echo -e "${RED}❌ Violations trouvées dans $(basename "$entity_file")${NC}"
                VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + violations_count))
            else
                echo -e "${GREEN}✅ $(basename "$entity_file") - Conforme${NC}"
            fi
        fi
    done
else
    echo -e "${RED}❌ Répertoire des entités introuvable: $ENTITIES_DIR${NC}"
    exit 1
fi

# Vérifications spécifiques pour les patterns courants
echo ""
echo "🔍 Vérification des patterns courants..."

# Chercher les @Column() simples sans name (potentiellement problématiques)
if grep -r "@Column()" "$ENTITIES_DIR" | grep -v "id\|email\|username\|role\|status\|phone"; then
    echo -e "${YELLOW}⚠️ Trouvé des @Column() simples - Vérifiez si name est nécessaire${NC}"
fi

# Chercher les propriétés camelCase sans name explicite
if grep -rE "@Column\(\{[^}]*\}\)" "$ENTITIES_DIR" | grep -v "name:" | grep -E "[a-z][A-Z]"; then
    echo -e "${RED}❌ Propriétés camelCase trouvées sans name explicite${NC}"
    VIOLATIONS_FOUND=$((VIOLATIONS_FOUND + 1))
fi

# Résumé final
echo ""
if [ $VIOLATIONS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ Toutes les entités respectent les conventions de nommage !${NC}"
    exit 0
else
    echo -e "${RED}❌ $VIOLATIONS_FOUND violation(s) trouvée(s)${NC}"
    echo ""
    echo -e "${YELLOW}📋 Actions recommandées:${NC}"
    echo "1. Ajouter name: 'snake_case' aux colonnes camelCase"
    echo "2. Générer une migration après les modifications"
    echo "3. Relancer ce script pour vérification"
    echo ""
    echo -e "${YELLOW}📖 Consultez docs/NAMING_CONVENTIONS.md pour plus de détails${NC}"
    exit 1
fi
