#!/bin/bash

echo "🧪 Lancement des tests unitaires optimisés"
echo "=========================================="

# Lancer seulement nos tests personnalisés
npx jest src/__tests__/ --verbose --coverage=false

echo ""
echo "✅ Tests unitaires terminés"
