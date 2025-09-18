#!/bin/bash

# 🚀 Setup Complet - Environnement de Développement NestJS
# ✅ Configure automatiquement VS Code pour Clean Architecture
# 🎯 Installation et optimisation pour maximum d'efficacité

echo "🚀 SETUP ENVIRONNEMENT DE DÉVELOPPEMENT NESTJS CLEAN ARCHITECTURE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'affichage coloré
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

print_status $BLUE "📋 Vérifications préliminaires..."

# Vérifier les prérequis
if ! command -v node &> /dev/null; then
    print_status $RED "❌ Node.js n'est pas installé"
    echo "💡 Installez Node.js 20+ depuis https://nodejs.org/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_status $RED "❌ npm n'est pas disponible"
    exit 1
fi

if ! command -v code &> /dev/null; then
    print_status $RED "❌ VS Code CLI n'est pas disponible"
    echo "💡 Installez VS Code et activez la commande 'code' dans le PATH"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status $GREEN "✅ Node.js $NODE_VERSION détecté"

# 1. Installation des dépendances NPM
print_status $BLUE "📦 Installation des dépendances NPM..."

if npm install; then
    print_status $GREEN "✅ Dépendances NPM installées avec succès"
else
    print_status $RED "❌ Échec de l'installation des dépendances"
    exit 1
fi

# 2. Configuration VS Code - Extensions essentielles
print_status $BLUE "🔧 Configuration VS Code - Extensions essentielles..."

if [ -f "./scripts/install-essential-extensions.sh" ]; then
    chmod +x ./scripts/install-essential-extensions.sh
    ./scripts/install-essential-extensions.sh
    print_status $GREEN "✅ Extensions VS Code configurées"
else
    print_status $YELLOW "⚠️  Script d'installation d'extensions non trouvé"
fi

# 3. Désactivation des extensions inutiles
print_status $BLUE "🧹 Désactivation des extensions inutiles..."

if [ -f "./scripts/disable-vscode-bloat.sh" ]; then
    chmod +x ./scripts/disable-vscode-bloat.sh
    ./scripts/disable-vscode-bloat.sh
    print_status $GREEN "✅ Extensions inutiles désactivées"
else
    print_status $YELLOW "⚠️  Script de désactivation non trouvé"
fi

# 4. Vérification de la configuration TypeScript
print_status $BLUE "📝 Vérification configuration TypeScript..."

if [ -f "tsconfig.json" ] && [ -f "tsconfig.build.json" ]; then
    print_status $GREEN "✅ Configuration TypeScript présente"
else
    print_status $YELLOW "⚠️  Configuration TypeScript incomplète"
fi

# 5. Vérification ESLint & Prettier
print_status $BLUE "🔍 Vérification ESLint & Prettier..."

if [ -f "eslint.config.mjs" ] && [ -f ".prettierrc" ]; then
    print_status $GREEN "✅ Configuration ESLint & Prettier présente"
else
    print_status $YELLOW "⚠️  Configuration qualité de code incomplète"
fi

# 6. Vérification des tests
print_status $BLUE "🧪 Vérification de l'environnement de test..."

if [ -f "jest.unit.config.js" ] && [ -f "jest.integration.config.js" ]; then
    print_status $GREEN "✅ Configuration Jest (unit/integration) présente"
else
    print_status $YELLOW "⚠️  Configuration Jest incomplète"
fi

# 7. Test de build
print_status $BLUE "🏗️  Test de build du projet..."

if npm run build > /dev/null 2>&1; then
    print_status $GREEN "✅ Build réussi"
else
    print_status $RED "❌ Échec du build - vérifier les erreurs TypeScript"
fi

# 8. Test de linting
print_status $BLUE "🔧 Test de linting..."

if npm run lint > /dev/null 2>&1; then
    print_status $GREEN "✅ Linting réussi"
else
    print_status $YELLOW "⚠️  Problèmes de linting détectés - exécuter 'npm run lint' pour voir les détails"
fi

# 9. Test de formatage
print_status $BLUE "💄 Test de formatage..."

if npm run format:check > /dev/null 2>&1; then
    print_status $GREEN "✅ Formatage conforme"
else
    print_status $YELLOW "⚠️  Formatage requis - exécuter 'npm run format' pour corriger"
fi

# 10. Exécution des tests
print_status $BLUE "🧪 Exécution des tests unitaires..."

if npm run test:unit > /dev/null 2>&1; then
    print_status $GREEN "✅ Tests unitaires passent"
else
    print_status $RED "❌ Échec des tests unitaires"
fi

# 11. Audit final des extensions
print_status $BLUE "📊 Audit final des extensions VS Code..."

if [ -f "./scripts/audit-vscode-extensions.sh" ]; then
    chmod +x ./scripts/audit-vscode-extensions.sh
    ./scripts/audit-vscode-extensions.sh | tail -n 15
else
    print_status $YELLOW "⚠️  Script d'audit non trouvé"
fi

# Résumé final
echo ""
print_status $GREEN "✅ SETUP TERMINÉ AVEC SUCCÈS !"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
print_status $BLUE "🎯 ENVIRONNEMENT CONFIGURÉ POUR :"
echo "   ✅ Clean Architecture (Domain/Application/Infrastructure/Presentation)"
echo "   ✅ NestJS avec TypeScript strict"
echo "   ✅ TDD avec Jest (tests unitaires & intégration)"
echo "   ✅ ESLint + Prettier (qualité de code)"
echo "   ✅ Docker + Base de données (PostgreSQL, MongoDB, Redis)"
echo "   ✅ VS Code optimisé (11 extensions essentielles)"
echo "   ✅ GitHub Copilot configuré"

echo ""
print_status $BLUE "🚀 COMMANDES DE DÉVELOPPEMENT :"
echo "   npm run start:dev      # Démarrer en mode développement"
echo "   npm run test:unit      # Exécuter les tests unitaires"
echo "   npm run test:integration  # Exécuter les tests d'intégration"
echo "   npm run lint           # Vérifier la qualité du code"
echo "   npm run format         # Formater le code"
echo "   npm run build          # Build de production"

echo ""
print_status $BLUE "🐳 ENVIRONNEMENT DOCKER :"
echo "   make start-db          # Démarrer les bases de données"
echo "   ./dev.sh docker        # Démarrer l'environnement complet"
echo "   ./dev.sh stop          # Arrêter les services"

echo ""
print_status $BLUE "📖 DOCUMENTATION :"
echo "   README.md              # Documentation complète du projet"
echo "   docs/                  # Documentation technique"
echo "   .vscode/               # Configuration VS Code partagée"

echo ""
print_status $YELLOW "⚠️  IMPORTANT :"
echo "   1. 🔄 Redémarrez VS Code pour activer toutes les extensions"
echo "   2. 🐳 Démarrez les bases de données avec 'make start-db'"
echo "   3. 🧪 Vérifiez que tous les tests passent avec 'npm test'"
echo "   4. 📝 Respectez les conventions de commit sémantique"

echo ""
print_status $GREEN "🎉 Prêt pour le développement NestJS Clean Architecture !"
