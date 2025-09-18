#!/bin/bash

# 🚀 Script de Configuration Environnement NVM + Node.js 24
# 📦 Pour le projet NestJS Clean Architecture

set -e

echo "🚀 Configuration de l'environnement Node.js avec NVM..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 🔍 Vérifier que nvm est disponible
if ! command -v nvm &> /dev/null; then
    echo "❌ nvm n'est pas installé ou pas dans le PATH"
    echo "📋 Installez nvm d'abord : curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash"
    exit 1
fi

echo "✅ nvm détecté : $(nvm --version)"

# 📦 Configurer Node.js 24
echo "📦 Configuration de Node.js 24..."
nvm install 24
nvm use 24
nvm alias default 24

# ✅ Vérifications
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)

echo "✅ Node.js configuré : $NODE_VERSION"
echo "✅ npm configuré : $NPM_VERSION"

# 📋 Créer le fichier .nvmrc pour le projet
echo "24" > .nvmrc
echo "📋 Fichier .nvmrc créé avec Node.js 24"

# 🧹 Nettoyage et installation optimisée
echo "🧹 Nettoyage de l'environnement npm..."

# Supprimer les anciens fichiers si présents
[ -d "node_modules" ] && rm -rf node_modules
[ -f "package-lock.json" ] && rm -f package-lock.json

# Vider le cache npm
npm cache clean --force 2>/dev/null || echo "ℹ️  Cache npm déjà propre"

echo "📦 Installation des dépendances avec optimisations..."

# Installation avec optimisations mémoire
npm install \
    --prefer-offline \
    --no-audit \
    --no-fund \
    --no-optional \
    --progress=false

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Configuration terminée !"
echo ""
echo "📋 PROCHAINES ÉTAPES :"
echo "   1. Redémarrer votre terminal ou exécuter : source ~/.bashrc"
echo "   2. Dans ce projet, exécuter : nvm use"
echo "   3. Vérifier : node --version && npm --version"
echo ""
echo "🚀 Commandes utiles :"
echo "   • nvm use          → Utiliser la version Node.js du projet"
echo "   • nvm current      → Afficher la version active"
echo "   • nvm ls           → Lister toutes les versions installées"
echo ""
echo "✅ Environnement NVM + Node.js 24 + npm 11 configuré avec succès !"
