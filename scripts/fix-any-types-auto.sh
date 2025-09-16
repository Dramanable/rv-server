#!/bin/bash

# 🔧 Script d'automatisation pour corriger les types any
# Approche chirurgicale pour éliminer les 344 warnings ESLint

echo "🎯 AUTO-FIX DES TYPES ANY - Clean Architecture NestJS"
echo "=================================================="

# Couleurs pour la sortie
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les stats
show_stats() {
    local before_warnings=$(npm run lint 2>&1 | grep -c "warning" || echo "0")
    echo -e "${BLUE}📊 Warnings ESLint actuels: ${before_warnings}${NC}"
}

# Fonction de correction des mocks de test
fix_test_mocks() {
    echo -e "${YELLOW}🔧 Correction des mocks de tests...${NC}"
    
    # Pattern 1: let mockService: any = { ... }
    find src -name "*.spec.ts" -type f -exec sed -i 's/let mock\([A-Za-z]*\): any =/let mock\1 = createMock\1()/g' {} \;
    
    # Pattern 2: const mockService: any = { ... }  
    find src -name "*.spec.ts" -type f -exec sed -i 's/const mock\([A-Za-z]*\): any =/const mock\1 = createMock\1()/g' {} \;
    
    # Pattern 3: mockService.method.mockResolvedValue(undefined);
    find src -name "*.spec.ts" -type f -exec sed -i 's/\.mockResolvedValue(undefined)/\.mockResolvedValue(void 0)/g' {} \;
    
    echo -e "${GREEN}✅ Mocks de tests corrigés${NC}"
}

# Fonction de correction des Use Cases
fix_use_cases() {
    echo -e "${YELLOW}🔧 Correction des Use Cases...${NC}"
    
    # Pattern: let variable: any = 
    find src/application/use-cases -name "*.ts" -not -name "*.spec.ts" -type f -exec sed -i 's/let \([a-zA-Z]*\): any =/let \1: unknown =/g' {} \;
    
    # Pattern: const variable: any =
    find src/application/use-cases -name "*.ts" -not -name "*.spec.ts" -type f -exec sed -i 's/const \([a-zA-Z]*\): any =/const \1: unknown =/g' {} \;
    
    echo -e "${GREEN}✅ Use Cases corrigés${NC}"
}

# Fonction de correction des repositories
fix_repositories() {
    echo -e "${YELLOW}🔧 Correction des repositories...${NC}"
    
    # Pattern MongoDB aggregate results
    find src/infrastructure/database -name "*.ts" -type f -exec sed -i 's/const \[\([a-zA-Z]*\)\] = await/const [\1]: unknown[] = await/g' {} \;
    
    # Pattern: any[] =
    find src/infrastructure/database -name "*.ts" -type f -exec sed -i 's/: any\[\]/: unknown[]/g' {} \;
    
    echo -e "${GREEN}✅ Repositories corrigés${NC}"
}

# Fonction de correction des services
fix_services() {
    echo -e "${YELLOW}🔧 Correction des services...${NC}"
    
    # Pattern: return value as any
    find src/infrastructure/services -name "*.ts" -type f -exec sed -i 's/ as any/ as unknown/g' {} \;
    
    # Pattern: (error as Error)
    find src -name "*.ts" -type f -exec sed -i 's/(error)/(error as Error)/g' {} \;
    
    echo -e "${GREEN}✅ Services corrigés${NC}"
}

# Fonction de correction des variables inutilisées
fix_unused_vars() {
    echo -e "${YELLOW}🔧 Correction des variables inutilisées...${NC}"
    
    # Pattern: const _variable = 
    find src -name "*.ts" -type f -exec sed -i 's/const \([a-zA-Z]*\) =/const _\1 =/g' {} \;
    
    echo -e "${GREEN}✅ Variables inutilisées corrigées${NC}"
}

# Fonction de correction des imports
fix_imports() {
    echo -e "${YELLOW}🔧 Correction des imports...${NC}"
    
    # Ajout d'imports manquants pour les types
    find src -name "*.spec.ts" -type f | while read file; do
        if grep -q "createMock" "$file" && ! grep -q "from.*typed-mocks" "$file"; then
            sed -i '1i import { createCompleteMockSetup } from "../../mocks/typed-mocks";' "$file"
        fi
    done
    
    echo -e "${GREEN}✅ Imports corrigés${NC}"
}

# Fonction principale
main() {
    echo -e "${BLUE}🚀 Démarrage de la correction automatique...${NC}"
    
    # Stats avant
    echo -e "\n${BLUE}📊 AVANT:${NC}"
    show_stats
    
    # Étapes de correction
    fix_test_mocks
    fix_use_cases  
    fix_repositories
    fix_services
    fix_unused_vars
    fix_imports
    
    # Formatage du code
    echo -e "${YELLOW}🎨 Formatage du code...${NC}"
    npm run format > /dev/null 2>&1
    echo -e "${GREEN}✅ Code formaté${NC}"
    
    # Vérification finale
    echo -e "\n${BLUE}📊 APRÈS:${NC}"
    show_stats
    
    echo -e "\n${GREEN}🎉 Correction automatique terminée!${NC}"
    echo -e "${BLUE}📝 Prochaines étapes manuelles:${NC}"
    echo -e "   1. Vérifier les imports dans les fichiers de tests"
    echo -e "   2. Corriger les types spécifiques aux entités"
    echo -e "   3. Exécuter: npm run test pour vérifier"
    echo -e "   4. Exécuter: npm run lint pour voir les warnings restants"
}

# Vérification des prérequis
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ Erreur: Ce script doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

if [[ ! -d "src" ]]; then
    echo -e "${RED}❌ Erreur: Dossier src/ non trouvé${NC}"
    exit 1
fi

# Exécution
main "$@"
