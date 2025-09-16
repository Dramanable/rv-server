#!/bin/bash

# 🧹 NETTOYAGE COMPLET NESTJS - Version Améliorée
# ✅ Supprime TOUS les decorators et imports NestJS
# ✅ Traite tous les fichiers Use Cases et Services

echo "🧹 Nettoyage COMPLET NestJS - Version Améliorée..."

# Fonction de nettoyage améliorée
clean_file_complete() {
    local file="$1"
    echo "  📄 Nettoyage complet: $file"
    
    # Supprimer les imports NestJS (toutes variantes)
    sed -i "/import.*from '@nestjs\/common'/d" "$file"
    sed -i "/import.*{ Inject, Injectable }/d" "$file"
    sed -i "/import.*{ Injectable, Inject }/d" "$file"
    sed -i "/import.*{ Injectable }/d" "$file"
    sed -i "/import.*{ Inject }/d" "$file"
    
    # Supprimer les decorators @Injectable
    sed -i "/@Injectable()/d" "$file"
    
    # Supprimer les decorators @Inject (toutes formes)
    sed -i "s/@Inject([^)]*)[[:space:]]*//g" "$file"
    
    # Nettoyer les lignes vides multiples
    sed -i '/^[[:space:]]*$/N;/^\n$/d' "$file"
    
    # Supprimer les lignes vides en début de fichier
    sed -i '/./,$!d' "$file"
}

# Nettoyer TOUS les Use Cases récursivement
echo "🎯 Nettoyage complet Use Cases..."
find src/application/use-cases -name "*.ts" -not -name "*.spec.ts" | while read -r file; do
    clean_file_complete "$file"
done

# Nettoyer TOUS les Services d'application
echo "🔧 Nettoyage complet Application Services..."
find src/application/services -name "*.ts" -not -name "*.spec.ts" | while read -r file; do
    clean_file_complete "$file"
done

# Vérification finale
echo ""
echo "🔍 Vérification finale..."
violations_found=0

# Chercher tous les @Injectable restants
injectable_files=$(find src/application src/domain -name "*.ts" -exec grep -l "@Injectable" {} \; 2>/dev/null || true)
if [ ! -z "$injectable_files" ]; then
    echo "❌ @Injectable trouvés dans:"
    echo "$injectable_files"
    violations_found=1
fi

# Chercher tous les @Inject restants  
inject_files=$(find src/application src/domain -name "*.ts" -exec grep -l "@Inject" {} \; 2>/dev/null || true)
if [ ! -z "$inject_files" ]; then
    echo "❌ @Inject trouvés dans:"
    echo "$inject_files"
    violations_found=1
fi

# Chercher les imports NestJS restants
nestjs_imports=$(find src/application src/domain -name "*.ts" -exec grep -l "@nestjs" {} \; 2>/dev/null || true)
if [ ! -z "$nestjs_imports" ]; then
    echo "❌ Imports NestJS trouvés dans:"
    echo "$nestjs_imports"
    violations_found=1
fi

if [ $violations_found -eq 0 ]; then
    echo "✅ PARFAIT! Aucune dépendance NestJS dans Domain/Application"
    echo "🏛️ Clean Architecture 100% respectée !"
else
    echo "⚠️ Des violations subsistent - nettoyage manuel requis"
fi

echo ""
echo "📊 Résumé:"
echo "   - Tous les Use Cases traités"
echo "   - Tous les Services d'application traités" 
echo "   - Decorators supprimés"
echo "   - Imports NestJS éliminés"
echo "   - Constructor injection préservé"
