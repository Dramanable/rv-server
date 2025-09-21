#!/bin/bash

# 🏛️ CHECK CLEAN ARCHITECTURE DEPENDENCIES
# Script pour vérifier que les couches Domain et Application ne dépendent jamais de NestJS

echo "🔍 Vérification Clean Architecture - Dépendances NestJS"
echo "====================================================="

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
violations=0
total_files=0

# Fonction pour vérifier un répertoire
check_directory() {
    local dir=$1
    local layer_name=$2

    echo -e "\n📁 Vérification couche ${YELLOW}${layer_name}${NC}: ${dir}"
    echo "─────────────────────────────────────────────────"

    # Trouver tous les fichiers TypeScript (hors tests)
    local files=$(find "$dir" -name "*.ts" ! -name "*.spec.ts" ! -name "*.test.ts" ! -name "*.spec.*.ts" 2>/dev/null)

    if [ -z "$files" ]; then
        echo -e "⚠️  ${YELLOW}Aucun fichier trouvé dans $dir${NC}"
        return
    fi

    local file_count=$(echo "$files" | wc -l)
    total_files=$((total_files + file_count))
    echo "📊 Fichiers à vérifier: $file_count"

    # Vérifier les imports NestJS
    echo -e "\n🔍 Vérification des imports @nestjs..."
    local nestjs_imports=$(echo "$files" | xargs grep -l "import.*@nestjs" 2>/dev/null || true)

    if [ ! -z "$nestjs_imports" ]; then
        echo -e "❌ ${RED}VIOLATION: Imports NestJS trouvés:${NC}"
        echo "$nestjs_imports" | while read file; do
            echo -e "   ${RED}→ $file${NC}"
            grep -n "import.*@nestjs" "$file" | sed 's/^/     /'
        done
        violations=$((violations + $(echo "$nestjs_imports" | wc -l)))
    else
        echo -e "✅ ${GREEN}Aucun import NestJS trouvé${NC}"
    fi

    # Vérifier les décorateurs NestJS
    echo -e "\n🔍 Vérification des décorateurs NestJS..."
    local nestjs_decorators=$(echo "$files" | xargs grep -l "@Injectable\|@Inject\|@Module" 2>/dev/null || true)

    if [ ! -z "$nestjs_decorators" ]; then
        echo -e "❌ ${RED}VIOLATION: Décorateurs NestJS trouvés:${NC}"
        echo "$nestjs_decorators" | while read file; do
            echo -e "   ${RED}→ $file${NC}"
            grep -n "@Injectable\|@Inject\|@Module" "$file" | sed 's/^/     /'
        done
        violations=$((violations + $(echo "$nestjs_decorators" | wc -l)))
    else
        echo -e "✅ ${GREEN}Aucun décorateur NestJS trouvé${NC}"
    fi

    # Vérifier les références à NestJS dans les commentaires
    echo -e "\n🔍 Vérification des références textuelles..."
    local nestjs_references=$(echo "$files" | xargs grep -l -i "nestjs" 2>/dev/null || true)

    if [ ! -z "$nestjs_references" ]; then
        # Filtrer les commentaires qui documentent l'ABSENCE de NestJS (OK)
        local bad_references=$(echo "$nestjs_references" | xargs grep -l -i "nestjs" | xargs grep -L "sans.*nestjs\|aucune.*nestjs\|no.*nestjs\|without.*nestjs" 2>/dev/null || true)

        if [ ! -z "$bad_references" ]; then
            echo -e "⚠️  ${YELLOW}Références NestJS trouvées (à vérifier):${NC}"
            echo "$bad_references" | while read file; do
                echo -e "   ${YELLOW}→ $file${NC}"
                grep -n -i "nestjs" "$file" | head -3 | sed 's/^/     /'
            done
        else
            echo -e "✅ ${GREEN}Références NestJS appropriées (documentation d'absence)${NC}"
        fi
    else
        echo -e "✅ ${GREEN}Aucune référence NestJS trouvée${NC}"
    fi
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "src/domain" ] || [ ! -d "src/application" ]; then
    echo -e "❌ ${RED}Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

echo "🏛️ Clean Architecture Dependency Check"
echo "======================================="
echo "📅 $(date)"
echo ""

# Vérifier la couche Domain
check_directory "src/domain" "DOMAIN"

# Vérifier la couche Application
check_directory "src/application" "APPLICATION"

# Résumé final
echo ""
echo "📊 RÉSUMÉ DE LA VÉRIFICATION"
echo "============================="
echo "📁 Fichiers vérifiés: $total_files"
echo "🚨 Violations trouvées: $violations"
echo ""

if [ $violations -eq 0 ]; then
    echo -e "🎉 ${GREEN}SUCCÈS: Clean Architecture respectée !${NC}"
    echo -e "✅ ${GREEN}Aucune dépendance NestJS dans Domain/Application${NC}"
    exit 0
else
    echo -e "💥 ${RED}ÉCHEC: $violations violation(s) de Clean Architecture${NC}"
    echo -e "❌ ${RED}Les couches Domain et Application ne doivent JAMAIS dépendre de NestJS${NC}"
    echo ""
    echo -e "🔧 ${YELLOW}Actions requises:${NC}"
    echo "   1. Supprimer tous les imports @nestjs des couches Domain/Application"
    echo "   2. Remplacer les décorateurs @Injectable par des classes pures"
    echo "   3. Utiliser l'injection de dépendances dans la couche Infrastructure"
    echo "   4. Définir des interfaces (ports) dans Application pour les services externes"
    exit 1
fi
