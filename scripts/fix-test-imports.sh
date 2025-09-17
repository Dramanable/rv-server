#!/bin/bash

# 🔧 Script pour corriger les imports des tests déplacés
# Ce script corrige automatiquement les paths relatifs des tests

echo "🔧 Correction des imports des tests unitaires..."

# Fonction pour corriger les imports dans un fichier
fix_imports() {
    local file="$1"
    local base_path="$2"
    
    echo "   Correction de: $file"
    
    # Corrections spécifiques pour différents types de tests
    if [[ "$file" == *"/domain/value-objects/"* ]]; then
        # Tests de value objects
        sed -i "s|import { \(.*\) } from './\(.*\)';|import { \1 } from '../../../../domain/value-objects/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../exceptions/\(.*\)';|import { \1 } from '../../../../domain/exceptions/\2';|g" "$file"
        
    elif [[ "$file" == *"/domain/entities/"* ]]; then
        # Tests d'entités
        sed -i "s|import { \(.*\) } from './\(.*\)';|import { \1 } from '../../../../domain/entities/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../value-objects/\(.*\)';|import { \1 } from '../../../../domain/value-objects/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../../shared/enums/\(.*\)';|import { \1 } from '../../../../shared/enums/\2';|g" "$file"
        
    elif [[ "$file" == *"/domain/services/"* ]]; then
        # Tests de services de domaine
        sed -i "s|import { \(.*\) } from './\(.*\)';|import { \1 } from '../../../../domain/services/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../value-objects/\(.*\)';|import { \1 } from '../../../../domain/value-objects/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../exceptions/\(.*\)';|import { \1 } from '../../../../domain/exceptions/\2';|g" "$file"
        
    elif [[ "$file" == *"/application/"* ]]; then
        # Tests de l'application
        sed -i "s|import { \(.*\) } from './\(.*\)';|import { \1 } from '../../../../application/services/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../../ports/\(.*\)';|import { \1 } from '../../../../application/ports/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../../domain/\(.*\)';|import { \1 } from '../../../../domain/\2';|g" "$file"
        
    elif [[ "$file" == *"/infrastructure/"* ]]; then
        # Tests d'infrastructure
        sed -i "s|import { \(.*\) } from './\(.*\)';|import { \1 } from '../../../../infrastructure/services/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../../shared/\(.*\)';|import { \1 } from '../../../../shared/\2';|g" "$file"
        
    elif [[ "$file" == *"/shared/"* ]]; then
        # Tests de shared
        sed -i "s|import { \(.*\) } from '../../../src/shared/\(.*\)';|import { \1 } from '../../../../shared/\2';|g" "$file"
        sed -i "s|import { \(.*\) } from '../../shared/\(.*\)';|import { \1 } from '../../../../shared/\2';|g" "$file"
    fi
    
    echo "   ✅ Corrigé: $file"
}

# Parcourir tous les fichiers de test unitaire
find src/__tests__/unit -name "*.spec.ts" -o -name "*.test.ts" | while read -r file; do
    if [[ -f "$file" ]]; then
        fix_imports "$file"
    fi
done

echo ""
echo "🎯 Correction des imports terminée !"
echo ""
echo "📋 Commandes pour tester :"
echo "   npm run test:unit  # Tests unitaires uniquement"
echo "   npm test           # Tous les tests (par défaut unitaires)"
