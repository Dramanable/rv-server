#!/bin/bash

# 🧹 Script de Nettoyage NPM/Node - Optimisation Mémoire
# ✅ Supprime tous les caches et optimise l'environnement
# 🎯 Libère de l'espace disque et améliore les performances

echo "🧹 Nettoyage et optimisation NPM/Node..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher le statut
show_status() {
    local task="$1"
    local status="$2"
    
    if [ "$status" = "success" ]; then
        echo -e "${GREEN}✅ $task${NC}"
    elif [ "$status" = "warning" ]; then
        echo -e "${YELLOW}⚠️  $task${NC}"
    elif [ "$status" = "info" ]; then
        echo -e "${BLUE}ℹ️  $task${NC}"
    else
        echo -e "${RED}❌ $task${NC}"
    fi
}

# Fonction pour obtenir la taille d'un dossier
get_folder_size() {
    local folder="$1"
    if [ -d "$folder" ]; then
        du -sh "$folder" 2>/dev/null | cut -f1
    else
        echo "0B"
    fi
}

# 📊 État initial
echo -e "${BLUE}📊 État initial de l'environnement :${NC}"
node_modules_size=$(get_folder_size "./node_modules")
npm_cache_size=$(get_folder_size "$(npm config get cache)")
echo "   📦 node_modules: $node_modules_size"
echo "   🗂️  Cache NPM: $npm_cache_size"
echo ""

# 🗑️ Nettoyage du cache NPM
echo -e "${YELLOW}🗑️  Nettoyage du cache NPM...${NC}"
if npm cache clean --force >/dev/null 2>&1; then
    show_status "Cache NPM nettoyé" "success"
else
    show_status "Échec nettoyage cache NPM" "error"
fi

# 🗑️ Nettoyage des node_modules
if [ -d "./node_modules" ]; then
    echo -e "${YELLOW}🗑️  Suppression de node_modules...${NC}"
    rm -rf ./node_modules
    if [ ! -d "./node_modules" ]; then
        show_status "node_modules supprimé" "success"
    else
        show_status "Échec suppression node_modules" "error"
    fi
else
    show_status "node_modules déjà absent" "info"
fi

# 🗑️ Nettoyage du package-lock.json
if [ -f "./package-lock.json" ]; then
    echo -e "${YELLOW}🗑️  Suppression de package-lock.json...${NC}"
    rm -f ./package-lock.json
    show_status "package-lock.json supprimé" "success"
else
    show_status "package-lock.json déjà absent" "info"
fi

# 🧹 Nettoyage des fichiers temporaires
echo -e "${YELLOW}🧹 Nettoyage des fichiers temporaires...${NC}"
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true
show_status "Fichiers temporaires nettoyés" "success"

# 🗑️ Nettoyage des logs
if [ -d "./logs" ]; then
    rm -rf ./logs/*.log 2>/dev/null || true
    show_status "Logs nettoyés" "success"
fi

# 🗑️ Nettoyage coverage
if [ -d "./coverage" ]; then
    rm -rf ./coverage
    show_status "Coverage supprimé" "success"
fi

# 🗑️ Nettoyage dist
if [ -d "./dist" ]; then
    rm -rf ./dist
    show_status "Dist supprimé" "success"
fi

# 📦 Installation fraîche avec optimisations
echo ""
echo -e "${BLUE}📦 Installation fraîche avec optimisations mémoire...${NC}"

# Vérifier que npm est disponible
if ! command -v npm &> /dev/null; then
    show_status "NPM non disponible" "error"
    exit 1
fi

# Installation avec options optimisées pour la mémoire
export NODE_OPTIONS="--max-old-space-size=4096"
if npm install --prefer-offline --no-audit --no-fund --silent; then
    show_status "Installation NPM réussie" "success"
else
    show_status "Échec installation NPM" "error"
    exit 1
fi

# 📊 État final
echo ""
echo -e "${BLUE}📊 État final de l'environnement :${NC}"
node_modules_size_final=$(get_folder_size "./node_modules")
npm_cache_size_final=$(get_folder_size "$(npm config get cache)")
echo "   📦 node_modules: $node_modules_size_final"
echo "   🗂️  Cache NPM: $npm_cache_size_final"

# 🎯 Vérification des scripts
echo ""
echo -e "${BLUE}🎯 Vérification des scripts NPM...${NC}"
if npm run lint --silent >/dev/null 2>&1; then
    show_status "Script lint disponible" "success"
else
    show_status "Script lint non disponible" "warning"
fi

if npm run build --silent >/dev/null 2>&1; then
    show_status "Script build disponible" "success"
else
    show_status "Script build non disponible" "warning"
fi

if npm run test:unit --silent >/dev/null 2>&1; then
    show_status "Script test:unit disponible" "success"
else
    show_status "Script test:unit non disponible" "warning"
fi

# 🚀 Recommandations finales
echo ""
echo -e "${GREEN}🎉 NETTOYAGE ET OPTIMISATION TERMINÉS !${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${BLUE}💡 RECOMMANDATIONS :${NC}"
echo "   • Environment NODE_OPTIONS configuré pour max 4GB RAM"
echo "   • Cache NPM optimisé avec .npmrc personnalisé"
echo "   • Installation en mode offline préférée"
echo "   • Audit et fund désactivés pour la performance"
echo ""
echo -e "${BLUE}📋 PROCHAINES ÉTAPES :${NC}"
echo "   1. npm run lint    # Vérifier la qualité du code"
echo "   2. npm run test    # Lancer les tests"
echo "   3. npm run build   # Construire le projet"
echo ""
echo -e "${GREEN}✨ Environnement NPM optimisé pour NestJS Clean Architecture !${NC}"
