#!/bin/bash

# 🔧 Script pour corriger tous les types `any` dans les tests
# Remplace les mocks non-typés par des mocks typés

echo "🔧 Correction automatique des types any dans les tests..."

# Fonction pour remplacer dans un fichier
replace_in_file() {
    local file="$1"
    local pattern="$2"
    local replacement="$3"
    
    if [[ -f "$file" ]]; then
        sed -i "s/$pattern/$replacement/g" "$file"
        echo "✅ Corrigé: $file"
    fi
}

# Liste des fichiers de tests à corriger
test_files=(
    "src/application/use-cases/auth/login.use-case.spec.ts"
    "src/application/use-cases/auth/logout.use-case.spec.ts"
    "src/application/use-cases/auth/refresh-token.use-case.spec.ts"
    "src/application/use-cases/users/create-user.use-case.spec.ts"
    "src/application/use-cases/users/create-user-i18n.spec.ts"
    "src/application/use-cases/users/update-user.use-case.spec.ts"
    "src/application/use-cases/users/delete-user.use-case.spec.ts"
    "src/application/use-cases/users/get-user.use-case.spec.ts"
    "src/application/use-cases/users/search-users.use-case.simple.spec.ts"
)

echo "📋 Correction des patterns common dans ${#test_files[@]} fichiers..."

for file in "${test_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "🔄 Traitement de $file..."
        
        # Remplacements des anciens patterns par des mocks typés
        replace_in_file "$file" "mockUserRepository\." "mocks.mockUserRepository."
        replace_in_file "$file" "mockRefreshTokenRepository\." "mocks.mockRefreshTokenRepository."
        replace_in_file "$file" "mockTokenService\." "mocks.mockTokenService."
        replace_in_file "$file" "mockPasswordService\." "mocks.mockPasswordService."
        replace_in_file "$file" "mockCacheService\." "mocks.mockCacheService."
        replace_in_file "$file" "mockLogger\." "mocks.mockLogger."
        replace_in_file "$file" "mockI18n\." "mocks.mockI18n."
        replace_in_file "$file" "mockConfig\." "mocks.mockConfig."
        
        echo "✅ $file traité avec succès"
    else
        echo "⚠️  Fichier non trouvé: $file"
    fi
done

echo "🎯 Correction automatique terminée!"
echo "ℹ️  Les fichiers suivants nécessitent une vérification manuelle:"
echo "   - Imports des mocks typés"
echo "   - Setup des mocks dans beforeEach"
echo "   - Types spécifiques aux tests"
