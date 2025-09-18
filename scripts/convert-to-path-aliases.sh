#!/bin/bash

# 🔄 Script de conversion des imports vers Path Aliases
# Clean Architecture - Amélioration des imports

echo "🚀 Conversion des imports relatifs vers Path Aliases..."

# Fonction de remplacement
replace_imports() {
    local pattern="$1"
    local replacement="$2"
    local description="$3"
    
    echo "  📁 $description"
    
    # Trouver et remplacer dans tous les fichiers TypeScript
    find src -name "*.ts" -type f -exec sed -i "s|from ['\"]$pattern['\"]|from '$replacement'|g" {} \;
    find src -name "*.ts" -type f -exec sed -i "s|import ['\"]$pattern['\"]|import '$replacement'|g" {} \;
}

# 🏛️ Domain Layer
replace_imports "../../../domain/" "@domain/" "Domain Layer"
replace_imports "../../domain/" "@domain/" "Domain Layer (niveau 2)"
replace_imports "../domain/" "@domain/" "Domain Layer (niveau 1)"

# 💼 Application Layer  
replace_imports "../../../application/" "@application/" "Application Layer"
replace_imports "../../application/" "@application/" "Application Layer (niveau 2)"
replace_imports "../application/" "@application/" "Application Layer (niveau 1)"

# 🔧 Infrastructure Layer
replace_imports "../../../infrastructure/" "@infrastructure/" "Infrastructure Layer"
replace_imports "../../infrastructure/" "@infrastructure/" "Infrastructure Layer (niveau 2)"
replace_imports "../infrastructure/" "@infrastructure/" "Infrastructure Layer (niveau 1)"

# 🎨 Presentation Layer
replace_imports "../../../presentation/" "@presentation/" "Presentation Layer"
replace_imports "../../presentation/" "@presentation/" "Presentation Layer (niveau 2)"
replace_imports "../presentation/" "@presentation/" "Presentation Layer (niveau 1)"

# 🔗 Shared Layer
replace_imports "../../../shared/" "@shared/" "Shared Layer"
replace_imports "../../shared/" "@shared/" "Shared Layer (niveau 2)"
replace_imports "../shared/" "@shared/" "Shared Layer (niveau 1)"

echo "✅ Conversion terminée !"
echo "🧪 Lancement des tests pour vérifier..."

# Vérifier que tout compile encore
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi ! Les Path Aliases fonctionnent correctement."
else
    echo "❌ Erreur de build. Vérifiez les imports."
    exit 1
fi
