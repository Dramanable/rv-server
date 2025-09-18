#!/bin/bash

# 🚀 Script d'Installation des Extensions VS Code Essentielles
# ✅ Configure VS Code pour le développement NestJS Clean Architecture
# 🎯 Installe uniquement les extensions nécessaires

echo "🚀 Installation des extensions VS Code essentielles pour NestJS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier si VS Code est installé
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI n'est pas disponible"
    echo "💡 Assurez-vous que VS Code est installé et que 'code' est dans le PATH"
    exit 1
fi

# Fonction pour installer une extension
install_extension() {
    local ext_id="$1"
    local ext_name="$2"
    
    echo "📦 Installation de ${ext_name}..."
    
    if code --list-extensions | grep -q "^${ext_id}$"; then
        echo "   ✅ Déjà installée"
    else
        if code --install-extension "${ext_id}" --force; then
            echo "   ✅ Installée avec succès"
        else
            echo "   ❌ Échec de l'installation"
            return 1
        fi
    fi
}

# 🔧 Extensions CORE - TypeScript/JavaScript/Node.js
echo ""
echo "🔧 EXTENSIONS CORE - TypeScript/JavaScript/Node.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "ms-vscode.vscode-typescript-next" "TypeScript et JavaScript"
install_extension "dbaeumer.vscode-eslint" "ESLint"
install_extension "esbenp.prettier-vscode" "Prettier - Code formatter"
install_extension "ms-vscode.vscode-json" "JSON Language Features"

# 🤖 Extensions AI - GitHub Copilot
echo ""
echo "🤖 EXTENSIONS AI - GitHub Copilot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "github.copilot" "GitHub Copilot"
install_extension "github.copilot-chat" "GitHub Copilot Chat"

# 🧪 Extensions TESTING - Jest
echo ""
echo "🧪 EXTENSIONS TESTING - Jest"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "orta.vscode-jest" "Jest"

# 🔗 Extensions GIT - Version Control
echo ""
echo "🔗 EXTENSIONS GIT - Version Control"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "eamodio.gitlens" "GitLens"

# 🐳 Extensions DOCKER - Containerisation
echo ""
echo "🐳 EXTENSIONS DOCKER - Containerisation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "ms-azuretools.vscode-docker" "Docker"

# 🗄️ Extensions DATABASE - PostgreSQL/MongoDB/Redis
echo ""
echo "🗄️ EXTENSIONS DATABASE - PostgreSQL/MongoDB"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "cweijan.vscode-postgresql-client2" "PostgreSQL Client"
install_extension "mongodb.mongodb-vscode" "MongoDB for VS Code"

# 🛡️ Extensions QUALITY - Code Quality & Security
echo ""
echo "🛡️ EXTENSIONS QUALITY - Code Quality & Security"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

install_extension "sonarsource.sonarlint-vscode" "SonarLint"

# ✅ Résumé final
echo ""
echo "✅ INSTALLATION TERMINÉE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📊 Extensions installées pour NestJS Clean Architecture :"
echo ""
echo "   🔧 Développement :"
echo "      • TypeScript et JavaScript (types, IntelliSense)"
echo "      • ESLint (linting, qualité du code)"
echo "      • Prettier (formatage automatique)"
echo "      • JSON (support JSON amélioré)"
echo ""
echo "   🤖 AI Assistant :"
echo "      • GitHub Copilot (suggestions de code)"
echo "      • GitHub Copilot Chat (assistance conversationnelle)"
echo ""
echo "   🧪 Testing :"
echo "      • Jest (tests unitaires et d'intégration)"
echo ""
echo "   🔗 Version Control :"
echo "      • GitLens (historique Git enrichi)"
echo ""
echo "   🐳 Infrastructure :"
echo "      • Docker (containerisation, docker-compose)"
echo ""
echo "   🗄️ Bases de Données :"
echo "      • PostgreSQL Client (gestion PostgreSQL)"
echo "      • MongoDB (gestion MongoDB)"
echo ""
echo "   🛡️ Qualité :"
echo "      • SonarLint (détection de bugs, vulnérabilités)"

echo ""
echo "🎯 CONFIGURATION OPTIMALE POUR :"
echo "   ✅ Clean Architecture (Domain, Application, Infrastructure, Presentation)"
echo "   ✅ TDD (Test-Driven Development)"
echo "   ✅ NestJS (framework Node.js enterprise)"
echo "   ✅ TypeScript strict (type safety à 100%)"
echo "   ✅ Docker (développement containerisé)"
echo "   ✅ Multi-databases (PostgreSQL, MongoDB, Redis)"

echo ""
echo "📝 PROCHAINES ÉTAPES :"
echo "   1. 🔄 Redémarrer VS Code pour activer toutes les extensions"
echo "   2. 🔧 Vérifier la configuration dans .vscode/settings.json"
echo "   3. 🧹 Désactiver les extensions non essentielles :"
echo "      ./scripts/disable-vscode-bloat.sh"
echo "   4. 🚀 Commencer le développement avec un environnement optimisé !"

echo ""
echo "🎉 VS Code est maintenant configuré pour le développement NestJS professionnel !"
