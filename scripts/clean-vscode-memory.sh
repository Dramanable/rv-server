#!/bin/bash

# 🧹 Script de nettoyage mémoire VS Code + Copilot
# Usage: ./scripts/clean-vscode-memory.sh

echo "🧹 Nettoyage mémoire VS Code + Copilot..."

# 1️⃣ Nettoyer les caches npm
echo "📦 Nettoyage cache npm..."
npm cache clean --force 2>/dev/null || echo "Cache npm déjà propre"

# 2️⃣ Nettoyer les node_modules cache
echo "🗂️ Nettoyage cache node_modules..."
rm -rf node_modules/.cache
rm -rf .npm
rm -rf ~/.npm/_cacache

# 3️⃣ Nettoyer les fichiers temporaires TypeScript
echo "📝 Nettoyage cache TypeScript..."
rm -rf .tsbuildinfo
rm -rf tsconfig.tsbuildinfo
rm -rf dist
rm -rf build

# 4️⃣ Nettoyer les logs Jest/ESLint
echo "🧪 Nettoyage logs de test..."
rm -rf coverage
rm -rf .nyc_output
rm -rf *.log
rm -rf logs

# 5️⃣ Nettoyer le cache VS Code (optionnel)
echo "💾 Nettoyage cache VS Code (optionnel)..."
# Décommentez si nécessaire :
# rm -rf ~/.vscode/extensions/github.copilot-*/dist/agent.js.map
# rm -rf ~/.vscode/CachedExtensions

# 6️⃣ Redémarrer le serveur TypeScript
echo "🔄 Redémarrage serveur TypeScript..."
pkill -f "tsserver" 2>/dev/null || echo "Aucun tsserver à arrêter"

echo "✅ Nettoyage terminé !"
echo ""
echo "🔧 Prochaines étapes recommandées :"
echo "   1. Redémarrer VS Code complètement"
echo "   2. Cmd+Shift+P > 'Developer: Restart Extension Host'"
echo "   3. Cmd+Shift+P > 'TypeScript: Restart TS Server'"
echo "   4. Cmd+Shift+P > 'GitHub Copilot: Restart Language Server'"
