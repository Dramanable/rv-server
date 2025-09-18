#!/bin/bash

# 📊 Script d'Audit des Extensions VS Code
# ✅ Liste toutes les extensions installées avec leur statut
# 🎯 Aide à identifier les extensions inutiles

echo "📊 AUDIT DES EXTENSIONS VS CODE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Vérifier si VS Code est installé
if ! command -v code &> /dev/null; then
    echo "❌ VS Code CLI n'est pas disponible"
    echo "💡 Assurez-vous que VS Code est installé et que 'code' est dans le PATH"
    exit 1
fi

# Extensions essentielles pour NestJS Clean Architecture
declare -A essential_extensions
essential_extensions["ms-vscode.vscode-typescript-next"]="TypeScript et JavaScript"
essential_extensions["github.copilot"]="GitHub Copilot"
essential_extensions["github.copilot-chat"]="GitHub Copilot Chat"
essential_extensions["dbaeumer.vscode-eslint"]="ESLint"
essential_extensions["esbenp.prettier-vscode"]="Prettier - Code formatter"
essential_extensions["ms-vscode.vscode-json"]="JSON Language Features"
essential_extensions["orta.vscode-jest"]="Jest"
essential_extensions["eamodio.gitlens"]="GitLens"
essential_extensions["ms-azuretools.vscode-docker"]="Docker"
essential_extensions["cweijan.vscode-postgresql-client2"]="PostgreSQL Client"
essential_extensions["mongodb.mongodb-vscode"]="MongoDB for VS Code"
essential_extensions["sonarsource.sonarlint-vscode"]="SonarLint"

# Extensions inutiles/redondantes connues
declare -A bloat_extensions
bloat_extensions["tabnine.tabnine-vscode"]="Tabnine (AI concurrent)"
bloat_extensions["blackboxapp.blackbox"]="BLACKBOX AI (AI concurrent)"
bloat_extensions["codeium.codeium"]="Codeium (AI concurrent)"
bloat_extensions["formulahendry.code-runner"]="Code Runner (redondant)"
bloat_extensions["github.github-vscode-theme"]="GitHub Theme (cosmétique)"
bloat_extensions["dracula-theme.theme-dracula"]="Dracula Theme (cosmétique)"
bloat_extensions["pkief.material-icon-theme"]="Material Icons (cosmétique)"
bloat_extensions["softwaredotcom.swdc-vscode"]="Code Time (métriques)"
bloat_extensions["ms-vsliveshare.vsliveshare"]="Live Share (collaboration)"
bloat_extensions["streetsidesoftware.code-spell-checker"]="Spell Checker (pas critique)"

# Compteurs
essential_count=0
bloat_count=0
unknown_count=0
total_count=0

echo "🔍 Analyse des extensions installées..."
echo ""

# Obtenir la liste des extensions installées
installed_extensions=$(code --list-extensions)

if [ -z "$installed_extensions" ]; then
    echo "📭 Aucune extension installée"
    exit 0
fi

echo "✅ EXTENSIONS ESSENTIELLES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

while IFS= read -r ext_id; do
    total_count=$((total_count + 1))
    
    if [[ -n "${essential_extensions[$ext_id]}" ]]; then
        echo "✅ ${essential_extensions[$ext_id]} ($ext_id)"
        essential_count=$((essential_count + 1))
    fi
done <<< "$installed_extensions"

echo ""
echo "🚫 EXTENSIONS INUTILES/REDONDANTES :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

while IFS= read -r ext_id; do
    if [[ -n "${bloat_extensions[$ext_id]}" ]]; then
        echo "🚫 ${bloat_extensions[$ext_id]} ($ext_id)"
        bloat_count=$((bloat_count + 1))
    fi
done <<< "$installed_extensions"

echo ""
echo "❓ AUTRES EXTENSIONS :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

while IFS= read -r ext_id; do
    if [[ -z "${essential_extensions[$ext_id]}" ]] && [[ -z "${bloat_extensions[$ext_id]}" ]]; then
        # Récupérer le nom de l'extension
        ext_info=$(code --list-extensions --show-versions | grep "^$ext_id@")
        echo "❓ $ext_id"
        unknown_count=$((unknown_count + 1))
    fi
done <<< "$installed_extensions"

# Résumé
echo ""
echo "📊 RÉSUMÉ DE L'AUDIT :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 Total d'extensions installées : $total_count"
echo "✅ Extensions essentielles : $essential_count"
echo "🚫 Extensions inutiles/redondantes : $bloat_count"
echo "❓ Autres extensions : $unknown_count"

# Recommandations
echo ""
echo "💡 RECOMMANDATIONS :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $bloat_count -gt 0 ]; then
    echo "🧹 Vous avez $bloat_count extensions inutiles à désactiver"
    echo "🚀 Utilisez le script : ./scripts/disable-vscode-bloat.sh"
    echo ""
fi

if [ $essential_count -lt 8 ]; then
    echo "⚠️  Il manque des extensions essentielles pour NestJS"
    echo "📥 Extensions recommandées à installer :"
    
    for ext_id in "${!essential_extensions[@]}"; do
        if ! echo "$installed_extensions" | grep -q "^$ext_id$"; then
            echo "   📦 ${essential_extensions[$ext_id]} ($ext_id)"
            echo "       code --install-extension $ext_id"
        fi
    done
fi

echo ""
echo "🎯 OBJECTIF : Garder seulement les extensions essentielles pour :"
echo "   • Performance optimale de VS Code"
echo "   • Interface simplifiée et focus"
echo "   • Développement NestJS efficace"
echo "   • Clean Architecture respectée"

if [ $unknown_count -gt 0 ]; then
    echo ""
    echo "🔍 EXTENSIONS À EXAMINER :"
    echo "   • Vérifiez si les '$unknown_count autres extensions' sont nécessaires"
    echo "   • Désactivez celles qui ne sont pas utilisées quotidiennement"
    echo "   • Privilégiez les fonctionnalités intégrées de VS Code"
fi

echo ""
echo "✨ Audit terminé ! Extensions optimisées = VS Code plus rapide 🚀"
