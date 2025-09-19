#!/bin/bash

# 🧠 Script d'Optimisation ULTRA Mémoire VS Code
# 🚀 Configuration pour projets volumineux (400MB+)
# 📦 Réduit drastiquement la consommation mémoire

set -e

echo "🧠 OPTIMISATION ULTRA MÉMOIRE VS Code..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 🔧 Configuration VS Code ultra agressive pour la mémoire
cat > .vscode/settings.json << 'EOF'
{
  // 🧠 ULTRA LOW MEMORY - Configuration agressive pour projets volumineux
  
  // 🤖 COPILOT - Configuration minimum absolu
  "github.copilot.advanced": {
    "length": 200,
    "temperature": 0,
    "top_p": 0.1,
    "listCount": 1
  },
  "github.copilot.enable": {
    "*": true,
    "yaml": false,
    "plaintext": false,
    "markdown": false,
    "json": false,
    "html": false,
    "css": false,
    "scss": false,
    "xml": false
  },

  // 📝 ÉDITEUR - Fonctionnalités désactivées au maximum
  "editor.fontSize": 11,
  "editor.fontFamily": "monospace",
  "editor.lineHeight": 1.1,
  "editor.wordWrap": "off",
  "editor.formatOnSave": true,
  "editor.formatOnPaste": false,
  "editor.formatOnType": false,
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.trimAutoWhitespace": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": "explicit",
    "source.fixAll.eslint": "explicit"
  },

  // 🚫 DÉSACTIVER TOUTES LES FONCTIONNALITÉS GOURMANDES
  "editor.minimap.enabled": false,
  "editor.semanticHighlighting.enabled": false,
  "editor.wordBasedSuggestions": "off",
  "editor.suggest.preview": false,
  "editor.suggest.showWords": false,
  "editor.suggest.showSnippets": false,
  "editor.suggest.localityBonus": false,
  "editor.suggest.shareSuggestSelections": false,
  "editor.suggest.insertMode": "replace",
  "editor.inlayHints.enabled": "off",
  "editor.lightbulb.enabled": "off",
  "editor.parameterHints.enabled": false,
  "editor.hover.enabled": false,
  "editor.quickSuggestions": false,
  "editor.acceptSuggestionOnEnter": "off",
  "editor.acceptSuggestionOnCommitCharacter": false,
  "editor.suggestOnTriggerCharacters": false,
  "editor.tabCompletion": "off",
  "editor.snippetSuggestions": "none",
  "editor.wordBasedSuggestionsMode": "currentDocument",
  "editor.occurrencesHighlight": "off",
  "editor.selectionHighlight": false,
  "editor.renderWhitespace": "none",
  "editor.renderControlCharacters": false,
  "editor.guides.indentation": false,
  "editor.guides.bracketPairs": false,

  // 📂 EXPLORATEUR - Minimal absolu
  "explorer.confirmDelete": false,
  "explorer.confirmDragAndDrop": false,
  "explorer.openEditors.visible": 0,
  "explorer.decorations.colors": false,
  "explorer.decorations.badges": false,
  "explorer.autoReveal": false,
  "explorer.sortOrder": "default",

  // 🔍 RECHERCHE - Limitations drastiques
  "search.useGlobalIgnoreFiles": true,
  "search.useParentIgnoreFiles": true,
  "search.followSymlinks": false,
  "search.smartCase": true,
  "search.maxResults": 20,
  "search.exclude": {
    "**/node_modules": true,
    "**/coverage": true,
    "**/dist": true,
    "**/.git": true,
    "**/.github": true,
    "**/logs": true,
    "**/*.log": true,
    "**/tmp": true,
    "**/temp": true,
    "**/.tsbuildinfo": true,
    "**/package-lock.json": true,
    "**/yarn.lock": true,
    "**/*.map": true,
    "**/*.min.js": true,
    "**/*.min.css": true,
    "**/*.spec.ts": true,
    "**/*.test.ts": true,
    "**/mocks": true
  },

  // 📁 FICHIERS - Surveillance ultra limitée
  "files.watcherExclude": {
    "**/node_modules/**": true,
    "**/coverage/**": true,
    "**/dist/**": true,
    "**/.git/**": true,
    "**/logs/**": true,
    "**/tmp/**": true,
    "**/*.log": true,
    "**/*.map": true,
    "**/*.spec.ts": true,
    "**/*.test.ts": true
  },
  "files.exclude": {
    "**/node_modules": false,
    "**/coverage": true,
    "**/dist": true,
    "**/.tsbuildinfo": true,
    "**/logs": true,
    "**/tmp": true,
    "**/*.log": true,
    "**/.git": false,
    "**/*.spec.ts": false,
    "**/*.test.ts": false
  },
  "files.autoSave": "onWindowChange",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "files.maxMemoryForLargeFilesMB": 64,

  // 🚪 ONGLETS - Limitation ultra stricte
  "workbench.editor.limit.enabled": true,
  "workbench.editor.limit.value": 2,
  "workbench.editor.limit.perEditorGroup": true,
  "workbench.editor.closeOnFileDelete": true,
  "workbench.editor.enablePreview": false,
  "workbench.editor.enablePreviewFromQuickOpen": false,
  "workbench.editor.revealIfOpen": true,
  "workbench.editor.showTabs": "single",
  "workbench.editor.closeEmptyGroups": true,

  // 🎨 INTERFACE - Minimal absolu
  "workbench.activityBar.visible": false,
  "workbench.statusBar.visible": true,
  "workbench.tips.enabled": false,
  "workbench.welcomePage.walkthroughs.openOnInstall": false,
  "workbench.startupEditor": "none",
  "workbench.colorTheme": "Default Dark+",
  "workbench.iconTheme": null,
  "workbench.tree.indent": 8,
  "workbench.sideBar.location": "left",
  "workbench.panel.defaultLocation": "bottom",
  "workbench.editor.tabSizing": "shrink",

  // 📦 EXTENSIONS - Contrôle total
  "extensions.autoUpdate": false,
  "extensions.autoCheckUpdates": false,
  "extensions.showRecommendationsOnlyOnDemand": true,
  "extensions.ignoreRecommendations": true,

  // 🔔 NOTIFICATIONS - Tout désactivé
  "update.showReleaseNotes": false,
  "update.enableWindowsBackgroundUpdates": false,
  "telemetry.telemetryLevel": "off",
  "workbench.enableExperiments": false,

  // 🗂️ EXPLORATEURS - Tous désactivés
  "npm.enableScriptExplorer": false,
  "timeline.showView": false,

  // 📦 NPM - Ultra strict
  "npm.packageManager": "npm",
  "npm.exclude": "**/node_modules/**",
  "npm.enableRunFromFolder": false,
  "npm.fetchOnlinePackageInfo": false,

  // 🏗️ TYPESCRIPT - Performance ultra
  "typescript.updateImportsOnFileMove.enabled": "never",
  "typescript.suggest.completeFunctionCalls": false,
  "typescript.suggest.enabled": false,
  "typescript.suggest.autoImports": "off",
  "typescript.preferences.includePackageJsonAutoImports": "off",
  "typescript.workspaceSymbols.scope": "currentProject",
  "typescript.disableAutomaticTypeAcquisition": true,
  "typescript.tsc.autoDetect": "off",
  "typescript.preferences.maxInlayHintLength": 5,

  // 🔧 ESLINT - Minimal
  "eslint.validate": ["typescript"],
  "eslint.run": "onSave",
  "eslint.codeAction.showDocumentation": {
    "enable": false
  },
  "eslint.quiet": true,

  // 📝 PRETTIER - Minimal
  "prettier.requireConfig": true,
  "prettier.useEditorConfig": false,

  // 🏃 JEST - Désactivé
  "jest.autoRun": "off",
  "jest.showCoverageOnLoad": false,
  "jest.enableInlineErrorMessages": false,

  // ⚡ GIT - Ultra minimal
  "git.enabled": true,
  "git.autorefresh": false,
  "git.fetchOnPull": false,
  "git.autofetch": false,
  "git.decorations.enabled": false,
  "scm.diffDecorations": "none",
  "scm.alwaysShowRepositories": false,

  // 🔧 TERMINAL - Performance
  "terminal.integrated.gpuAcceleration": "off",
  "terminal.integrated.rendererType": "dom",

  // 🛡️ SÉCURITÉ
  "security.workspace.trust.untrustedFiles": "open",
  
  // 🧠 LIMITES MÉMOIRE ULTRA STRICTES
  "problems.maxNumberOfProblems": 10,
  "search.maxResults": 10
}
EOF

echo "✅ Configuration VS Code ultra-mémoire créée"

# 🚫 Désactiver toutes les extensions non essentielles
echo ""
echo "🚫 Désactivation des extensions gourmandes..."

# Extensions à désactiver (si présentes)
EXTENSIONS_TO_DISABLE=(
    "ms-python.python"
    "golang.go" 
    "ms-vscode.vscode-json"
    "ms-azuretools.vscode-containers"
    "firsttris.vscode-jest-runner"
    "bradlc.vscode-tailwindcss"
    "formulahendry.auto-rename-tag"
    "ms-vscode.vscode-typescript-next"
    "dbaeumer.vscode-eslint"
    "esbenp.prettier-vscode"
)

for ext in "${EXTENSIONS_TO_DISABLE[@]}"; do
    if code --list-extensions | grep -q "$ext"; then
        code --disable-extension "$ext" 2>/dev/null || true
        echo "   ✅ Extension $ext désactivée"
    fi
done

echo ""
echo "🎯 Configuration ULTRA MÉMOIRE terminée !"
echo ""
echo "📋 CHANGEMENTS APPLIQUÉS :"
echo "   • Copilot réduit au minimum (200 chars, 1 suggestion)"
echo "   • Toutes les fonctionnalités d'aide désactivées"
echo "   • Maximum 2 onglets ouverts simultanément"  
echo "   • Surveillance des fichiers ultra limitée"
echo "   • Extensions non essentielles désactivées"
echo "   • Interface minimaliste (pas d'activity bar)"
echo "   • Recherche limitée à 10 résultats"
echo "   • Mémoire fichiers limitée à 64MB"
echo ""
echo "⚠️  IMPORTANT :"
echo "   1. REDÉMARRER VS Code maintenant"
echo "   2. Fermer tous les onglets actuels"
echo "   3. N'ouvrir que les fichiers essentiels"
echo "   4. Éviter d'ouvrir plusieurs projets simultanément"
echo ""
echo "🚀 VS Code devrait maintenant consommer beaucoup moins de mémoire !"
EOF

chmod +x scripts/ultra-memory-vscode.sh
./scripts/ultra-memory-vscode.sh