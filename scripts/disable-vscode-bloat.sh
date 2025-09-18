#!/bin/bash

# 🚫 Script de Désactivation des Extensions VS Code Inutiles
# ✅ Optimise les performances et réduit les distractions
# 🎯 Garde seulement les extensions essentielles pour NestJS Clean Architecture

echo "🧹 Désactivation des extensions VS Code inutiles..."

# Fonction pour désactiver une extension si elle est installée
disable_extension() {
    local ext_id="$1"
    local ext_name="$2"
    
    if code --list-extensions | grep -q "^${ext_id}$"; then
        echo "🚫 Désactivation de ${ext_name} (${ext_id})"
        code --disable-extension "${ext_id}"
    else
        echo "ℹ️  ${ext_name} n'est pas installée"
    fi
}

# 🤖 AI Assistants Concurrents (garder seulement GitHub Copilot)
echo "🤖 Désactivation des AI assistants concurrents..."
disable_extension "tabnine.tabnine-vscode" "Tabnine"
disable_extension "blackboxapp.blackbox" "BLACKBOX AI"
disable_extension "blackboxapp.blackboxagent" "BLACKBOX Agent"
disable_extension "codeium.codeium" "Codeium"
disable_extension "codium.codium" "Qodo Gen"
disable_extension "sourcery.sourcery" "Sourcery"
disable_extension "keploy.keployio" "Keploy"
disable_extension "mintlify.document" "Mintlify Doc Writer"

# 🎨 Thèmes (garder le thème par défaut)
echo "🎨 Désactivation des thèmes personnalisés..."
disable_extension "github.github-vscode-theme" "GitHub Theme"
disable_extension "zhuangtongfa.material-theme" "One Dark Pro"
disable_extension "dracula-theme.theme-dracula" "Dracula Theme"
disable_extension "akamud.vscode-theme-onedark" "Atom One Dark"
disable_extension "teabyii.ayu" "Ayu"
disable_extension "monokai.theme-monokai-pro-vscode" "Monokai Pro"
disable_extension "johnpapa.winteriscoming" "Winter is Coming"
disable_extension "sdras.night-owl" "Night Owl"
disable_extension "azemoh.one-monokai" "One Monokai"
disable_extension "whizkydee.material-palenight-theme" "Palenight Theme"
disable_extension "enkia.tokyo-night" "Tokyo Night"
disable_extension "akamud.vscode-theme-onelight" "Atom One Light"
disable_extension "liviuschera.noctis" "Noctis"
disable_extension "beardedbear.beardedtheme" "Bearded Theme"
disable_extension "jprestidge.theme-material-theme" "Sublime Material Theme"

# 🔧 Icônes (garder les icônes par défaut)
echo "🔧 Désactivation des packs d'icônes..."
disable_extension "pkief.material-icon-theme" "Material Icon Theme"
disable_extension "vscode-icons-team.vscode-icons" "vscode-icons"

# 🌐 Frameworks Non Utilisés
echo "🌐 Désactivation des extensions de frameworks non utilisés..."
disable_extension "angular.ng-template" "Angular Language Service"
disable_extension "hollowtree.vue-snippets" "Vue 3 Snippets"
disable_extension "astro-build.astro-vscode" "Astro"
disable_extension "ms-vscode.powershell" "PowerShell"

# 🏃 Runners de Code (redondant avec Jest/NestJS)
echo "🏃 Désactivation des runners de code..."
disable_extension "formulahendry.code-runner" "Code Runner"
disable_extension "whtouche.vscode-js-console-utils" "JavaScript Console Utils"
disable_extension "vscode-convert-utils.vscode-js-console-utils" "JS Console Utils (alt)"

# 📊 Outils de Productivité/Métriques
echo "📊 Désactivation des outils de productivité non essentiels..."
disable_extension "softwaredotcom.swdc-vscode" "Code Time"
disable_extension "softwaredotcom.music-time" "Music Time"
disable_extension "n3rds-inc.pomodoro-timer-focus" "Pomodoro Timer"
disable_extension "n3rds-inc.white-noise" "White Noise"
disable_extension "pegleg.codachi" "Codachi (Pet)"
disable_extension "patricklee.vsnotes" "VSNotes"

# 🔧 Utilitaires Non Critiques
echo "🔧 Désactivation des utilitaires non critiques..."
disable_extension "sleistner.vscode-fileutils" "File Utils"
disable_extension "huuums.vscode-fast-folder-structure" "Folder Templates"
disable_extension "mlewand.select-part-of-word" "Select Part of Word"
disable_extension "dyno-nguyen.vscode-dynofileutils" "Dyno File Utils"

# 🔍 Outils de Test Externes (on garde Jest uniquement)
echo "🔍 Désactivation des outils de test externes..."
disable_extension "ms-vscode.test-adapter-converter" "Test Adapter Converter"
disable_extension "hbenl.vscode-test-explorer" "Test Explorer"
disable_extension "chrisbreiding.test-utils" "Test Utils"

# 📝 Documentation/Markdown (pas critique)
echo "📝 Désactivation des outils de documentation..."
disable_extension "streetsidesoftware.code-spell-checker" "Code Spell Checker"
disable_extension "yzhang.markdown-all-in-one" "Markdown All in One"
disable_extension "davidanson.vscode-markdownlint" "markdownlint"
disable_extension "marp-team.marp-vscode" "Marp for VS Code"

# 🌐 Frontend/HTML/CSS (pas nécessaire pour API backend)
echo "🌐 Désactivation des outils frontend..."
disable_extension "ecmel.vscode-html-css" "HTML CSS Support"
disable_extension "formulahendry.auto-rename-tag" "Auto Rename Tag"
disable_extension "bradlc.vscode-tailwindcss" "Tailwind CSS IntelliSense"

# 🔗 Collaboration (pas essentiel)
echo "🔗 Désactivation des outils de collaboration optionnels..."
disable_extension "ms-vsliveshare.vsliveshare" "Live Share"
disable_extension "github.vscode-pull-request-github" "GitHub Pull Requests"

# 🎯 Utilitaires de Navigation/UI (simplifier l'interface)
echo "🎯 Désactivation des utilitaires d'interface..."
disable_extension "christian-kohler.path-intellisense" "Path Intellisense"
disable_extension "christian-kohler.npm-intellisense" "npm Intellisense"
disable_extension "aaron-bond.better-comments" "Better Comments"
disable_extension "oderwat.indent-rainbow" "Indent Rainbow"
disable_extension "gruntfuggly.todo-tree" "Todo Tree"
disable_extension "alefragnani.bookmarks" "Bookmarks"

# 📊 Outils JSON/Utilitaires
echo "📊 Désactivation des utilitaires JSON..."
disable_extension "eriklynd.json-tools" "JSON Tools"
disable_extension "adrientoub.base64utils" "Base64 Utils"

# 🏢 Outils Spécialisés/Enterprise
echo "🏢 Désactivation des outils spécialisés..."
disable_extension "financialforce.lana" "Apex Log Analyzer"
disable_extension "tonka3000.qtvsctools" "Qt tools"
disable_extension "andrzejzwierzchowski.al-code-outline" "AZ AL Dev Tools"
disable_extension "devprod.vulnerability-extension" "WAVE Analysis"

# 🎮 Outils de Développement Spécialisés
echo "🎮 Désactivation des outils de développement spécialisés..."
disable_extension "planbcoding.vscode-react-refactor" "VSCode React Refactor"
disable_extension "aaravb.chrome-extension-developer-tools" "Chrome Extension Developer Tools"
disable_extension "vsls-contrib.gistfs" "GistPad"
disable_extension "theshukran.theshukran-react-utils" "React Utils"

# 🔧 Langages/Outils Non Utilisés
echo "🔧 Désactivation des outils de langages non utilisés..."
disable_extension "dururu1215.verilog-utils" "Verilog Utils"
disable_extension "open-southeners.php-support-utils" "PHP Support Utils"
disable_extension "gkalpak.aio-docs-utils" "Angular.io Documentation Utilities"
disable_extension "ironmansoftware.powershellprotools" "PowerShell Pro Tools"

# ✅ Afficher les extensions restantes (essentielles)
echo ""
echo "✅ Extensions VS Code restantes (essentielles) :"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Extensions qui DOIVENT rester activées
essential_extensions=(
    "ms-vscode.vscode-typescript-next:TypeScript et JavaScript"
    "github.copilot:GitHub Copilot"
    "github.copilot-chat:GitHub Copilot Chat"
    "dbaeumer.vscode-eslint:ESLint"
    "esbenp.prettier-vscode:Prettier"
    "ms-vscode.vscode-json:JSON Language Features"
    "orta.vscode-jest:Jest"
    "eamodio.gitlens:GitLens"
    "ms-azuretools.vscode-docker:Docker"
    "cweijan.vscode-postgresql-client2:PostgreSQL Client"
    "mongodb.mongodb-vscode:MongoDB for VS Code"
    "sonarsource.sonarlint-vscode:SonarLint"
)

for ext in "${essential_extensions[@]}"; do
    ext_id="${ext%%:*}"
    ext_name="${ext##*:}"
    if code --list-extensions | grep -q "^${ext_id}$"; then
        echo "✅ ${ext_name} (${ext_id}) - ACTIVE"
    else
        echo "⚠️  ${ext_name} (${ext_id}) - PAS INSTALLÉE"
    fi
done

echo ""
echo "🎯 Configuration terminée !"
echo "📝 Note : Redémarrer VS Code pour appliquer tous les changements"
echo "🔧 Extensions désactivées : uniquement celles non essentielles pour NestJS/Clean Architecture"

# 📋 Recommandations finales
cat << 'EOF'

📋 RECOMMANDATIONS FINALES :

1. ✅ Extensions ESSENTIELLES conservées :
   - GitHub Copilot + Chat (AI assistance)
   - ESLint + Prettier (qualité du code)
   - TypeScript + Jest (développement)
   - Docker + Base de données (infrastructure)

2. 🚫 Extensions DÉSACTIVÉES :
   - Thèmes et icônes personnalisés
   - AI concurrents (Tabnine, Codeium, etc.)
   - Outils de productivité/distractions
   - Frameworks non utilisés (Angular, Vue, etc.)
   - Utilitaires non critiques

3. 🎯 RÉSULTATS ATTENDUS :
   - Performance VS Code améliorée
   - Interface simplifiée et moins de distractions
   - Focus sur l'essentiel pour le développement NestJS
   - Temps de démarrage réduit

4. 🔄 Pour réactiver une extension :
   code --enable-extension <extension-id>

EOF
