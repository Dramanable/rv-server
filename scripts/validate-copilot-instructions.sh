#!/bin/bash

# 🔍 Script de validation des instructions GitHub Copilot
# Vérifie que toutes les règles importantes sont présentes

echo "🔍 Validation des instructions GitHub Copilot..."
echo ""

# Vérifier la présence des éléments clés
checks=(
    "ORDRE OBLIGATOIRE DE DÉVELOPPEMENT"
    "Domain → Application → Infrastructure → Presentation"
    "WORKFLOW DE DÉVELOPPEMENT OBLIGATOIRE"
    "DOMAIN FIRST"
    "APPLICATION SECOND"
    "INFRASTRUCTURE THIRD"
    "PRESENTATION LAST"
    "Jamais de retour en arrière dans l'ordre des couches"
    "Compilation incrémentale"
    "Développement dans le mauvais ordre"
)

missing=0
for check in "${checks[@]}"; do
    if grep -q "$check" .github/copilot-instructions.md; then
        echo "✅ '$check' - Trouvé"
    else
        echo "❌ '$check' - MANQUANT"
        missing=$((missing + 1))
    fi
done

echo ""
if [ $missing -eq 0 ]; then
    echo "🎉 Toutes les règles de développement en couches ordonnées sont présentes !"
else
    echo "⚠️  $missing règle(s) manquante(s)"
fi

echo ""
echo "📊 Statistiques du fichier:"
echo "- Lignes totales: $(wc -l < .github/copilot-instructions.md)"
echo "- Taille: $(du -h .github/copilot-instructions.md | cut -f1)"
