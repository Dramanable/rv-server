#!/bin/bash

# 🧹 Script de Nettoyage ULTRA pour Réduction Mémoire VS Code
# 🚀 Supprime tous les fichiers inutiles qui consomment de la mémoire
# 📦 Optimise le projet pour performances VS Code maximales

set -e

echo "🧹 NETTOYAGE ULTRA pour optimisation mémoire VS Code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 📊 Taille initiale
INITIAL_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "N/A")
echo "📊 Taille initiale du projet: $INITIAL_SIZE"

# 🗑️ SUPPRIMER FICHIERS TEMPORAIRES ET CACHES
echo ""
echo "🗑️ Suppression des fichiers temporaires et caches..."

# TypeScript build info
find . -name "*.tsbuildinfo" -delete 2>/dev/null || true
echo "   ✅ Fichiers .tsbuildinfo supprimés"

# Logs et fichiers temporaires
find . -name "*.log" -delete 2>/dev/null || true
find . -name "*.tmp" -delete 2>/dev/null || true
find . -name "*.temp" -delete 2>/dev/null || true
echo "   ✅ Logs et fichiers temporaires supprimés"

# Fichiers OS
find . -name ".DS_Store" -delete 2>/dev/null || true
find . -name "Thumbs.db" -delete 2>/dev/null || true
find . -name "desktop.ini" -delete 2>/dev/null || true
echo "   ✅ Fichiers système OS supprimés"

# 📁 NETTOYER DOSSIERS DE BUILD ET COVERAGE
echo ""
echo "📁 Nettoyage des dossiers de build et coverage..."

[ -d "dist" ] && rm -rf dist && echo "   ✅ Dossier dist/ supprimé"
[ -d "coverage" ] && rm -rf coverage && echo "   ✅ Dossier coverage/ supprimé"
[ -d ".nyc_output" ] && rm -rf .nyc_output && echo "   ✅ Dossier .nyc_output/ supprimé"
[ -d "logs" ] && rm -rf logs && echo "   ✅ Dossier logs/ supprimé"
[ -d "tmp" ] && rm -rf tmp && echo "   ✅ Dossier tmp/ supprimé"
[ -d "temp" ] && rm -rf temp && echo "   ✅ Dossier temp/ supprimé"

# 🧽 NETTOYER CACHES NODE.JS ET NPM
echo ""
echo "🧽 Nettoyage des caches Node.js et npm..."

# Cache npm local
[ -d ".npm" ] && rm -rf .npm && echo "   ✅ Cache npm local supprimé"

# Cache Jest
[ -d ".jest" ] && rm -rf .jest && echo "   ✅ Cache Jest supprimé"

# Cache ESLint
[ -d ".eslintcache" ] && rm -rf .eslintcache && echo "   ✅ Cache ESLint supprimé"

# 📋 SUPPRIMER FICHIERS DE DOCUMENTATION VOLUMINEUX
echo ""
echo "📋 Suppression des fichiers de documentation volumineux..."

# Supprimer les anciens rapports (garder seulement les essentiels)
[ -f "CLEAN_ARCHITECTURE_REPORT.md" ] && rm -f CLEAN_ARCHITECTURE_REPORT.md && echo "   ✅ CLEAN_ARCHITECTURE_REPORT.md supprimé"
[ -f "FINAL_STATUS_REPORT.md" ] && rm -f FINAL_STATUS_REPORT.md && echo "   ✅ FINAL_STATUS_REPORT.md supprimé"
[ -f "HARMONISATION_HASHEDPASSWORD_REPORT.md" ] && rm -f HARMONISATION_HASHEDPASSWORD_REPORT.md && echo "   ✅ HARMONISATION_HASHEDPASSWORD_REPORT.md supprimé"
[ -f "IMPROVEMENT_ROADMAP.md" ] && rm -f IMPROVEMENT_ROADMAP.md && echo "   ✅ IMPROVEMENT_ROADMAP.md supprimé"
[ -f "PASSPORT_INTEGRATION.md" ] && rm -f PASSPORT_INTEGRATION.md && echo "   ✅ PASSPORT_INTEGRATION.md supprimé"

# Supprimer les anciens fichiers de cookies de test
[ -f "cookies_final.txt" ] && rm -f cookies_final.txt && echo "   ✅ cookies_final.txt supprimé"
[ -f "cookies_new.txt" ] && rm -f cookies_new.txt && echo "   ✅ cookies_new.txt supprimé"
[ -f "cookies.txt" ] && rm -f cookies.txt && echo "   ✅ cookies.txt supprimé"

# 🔧 NETTOYER SCRIPTS DE BUILD OBSOLÈTES
echo ""
echo "🔧 Nettoyage des scripts obsolètes..."

# Supprimer les anciens scripts de fix
[ -f "scripts/fix-any-types-auto.sh" ] && rm -f scripts/fix-any-types-auto.sh && echo "   ✅ fix-any-types-auto.sh supprimé"
[ -f "scripts/fix-any-types.sh" ] && rm -f scripts/fix-any-types.sh && echo "   ✅ fix-any-types.sh supprimé"
[ -f "scripts/fix-critical-any-types.sh" ] && rm -f scripts/fix-critical-any-types.sh && echo "   ✅ fix-critical-any-types.sh supprimé"

# Supprimer les scripts de génération Swagger obsolètes
[ -f "scripts/generate-swagger-json.ts" ] && rm -f scripts/generate-swagger-json.ts && echo "   ✅ generate-swagger-json.ts supprimé"
[ -f "scripts/generate-swagger-simple.ts" ] && rm -f scripts/generate-swagger-simple.ts && echo "   ✅ generate-swagger-simple.ts supprimé"

# 📊 OPTIMISER FICHIERS SWAGGER
echo ""
echo "📊 Optimisation des fichiers Swagger..."

# Supprimer les fichiers Swagger volumineux (ils seront régénérés)
[ -f "docs/swagger.json" ] && rm -f docs/swagger.json && echo "   ✅ swagger.json supprimé (sera régénéré)"
[ -f "docs/swagger-stats.json" ] && rm -f docs/swagger-stats.json && echo "   ✅ swagger-stats.json supprimé"

# 🧠 OPTIMISER .GITIGNORE pour VS Code
echo ""
echo "🧠 Optimisation du .gitignore pour VS Code..."

# Ajouter exclusions mémoire si pas déjà présentes
if ! grep -q "# VS Code Memory Optimization" .gitignore 2>/dev/null; then
cat >> .gitignore << 'EOF'

# VS Code Memory Optimization
*.tsbuildinfo
*.log
.DS_Store
Thumbs.db
desktop.ini

# Build and Coverage (memory heavy)
dist/
coverage/
.nyc_output/
logs/
tmp/
temp/

# Caches (memory heavy)
.npm/
.jest/
.eslintcache

# Large Documentation (keep only essential)
*_REPORT.md
cookies*.txt
EOF
echo "   ✅ .gitignore optimisé pour la mémoire"
fi

# 📦 NETTOYER NODE_MODULES si trop volumineux
echo ""
echo "📦 Vérification de node_modules..."

if [ -d "node_modules" ]; then
    NODE_MODULES_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "N/A")
    echo "   📊 Taille node_modules: $NODE_MODULES_SIZE"
    
    # Si node_modules > 500MB, suggérer un nettoyage
    SIZE_MB=$(du -sm node_modules 2>/dev/null | cut -f1 || echo "0")
    if [ "$SIZE_MB" -gt 500 ]; then
        echo "   ⚠️  node_modules très volumineux (${NODE_MODULES_SIZE})"
        echo "   💡 Suggestion: Exécuter './scripts/npm-cleanup-optimize.sh' pour optimiser"
    else
        echo "   ✅ node_modules taille acceptable"
    fi
fi

# 📊 STATISTIQUES FINALES
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
FINAL_SIZE=$(du -sh . 2>/dev/null | cut -f1 || echo "N/A")
echo "📊 Taille finale du projet: $FINAL_SIZE (initial: $INITIAL_SIZE)"

# Compter les fichiers TypeScript restants
TS_FILES=$(find src -name "*.ts" | wc -l 2>/dev/null || echo "N/A")
echo "📁 Fichiers TypeScript actifs: $TS_FILES"

# Compter les tests
TEST_FILES=$(find src -name "*.spec.ts" -o -name "*.test.ts" | wc -l 2>/dev/null || echo "N/A")
echo "🧪 Fichiers de tests: $TEST_FILES"

echo ""
echo "✅ NETTOYAGE ULTRA TERMINÉ !"
echo ""
echo "🎯 RECOMMANDATIONS POUR VS CODE :"
echo "   1. Redémarrer VS Code après ce nettoyage"
echo "   2. Utiliser uniquement les extensions essentielles"
echo "   3. Configuration .vscode/settings.json optimisée pour mémoire"
echo "   4. Fermer les onglets inutiles (limite: 3 max)"
echo "   5. Désactiver preview des fichiers"
echo ""
echo "🚀 Votre projet est maintenant optimisé pour VS Code !"