#!/bin/bash

# 🏛️ Clean Architecture Compliance Checker
# Vérifie automatiquement le respect des principes de la Clean Architecture

echo "🏛️ CLEAN ARCHITECTURE COMPLIANCE CHECKER"
echo "========================================="
echo ""

# Configuration des couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Compteurs
VIOLATIONS=0
CHECKS=0

# Fonction utilitaire pour les tests
check_rule() {
    local rule_name="$1"
    local command="$2"
    local success_message="$3"
    local failure_message="$4"
    
    CHECKS=$((CHECKS + 1))
    echo -n "🔍 Checking: $rule_name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $success_message${NC}"
    else
        echo -e "${RED}❌ $failure_message${NC}"
        VIOLATIONS=$((VIOLATIONS + 1))
    fi
}

echo "1️⃣ DEPENDENCY RULE VERIFICATION"
echo "================================"

# Vérification : Domain ne dépend de rien d'externe
check_rule \
    "Domain Layer Purity" \
    "! grep -r 'import.*from.*\.\./\.\./application\|import.*from.*application/\|import.*from.*\.\./\.\./infrastructure\|import.*from.*infrastructure/\|import.*from.*\.\./\.\./presentation\|import.*from.*presentation/' src/domain/ 2>/dev/null" \
    "Domain layer is pure (no external dependencies)" \
    "Domain layer has forbidden external dependencies"

# Vérification : Application dépend uniquement de Domain
check_rule \
    "Application Layer Dependencies" \
    "! grep -r 'import.*from.*\.\./\.\./infrastructure\|import.*from.*infrastructure/\|import.*from.*\.\./\.\./presentation\|import.*from.*presentation/' src/application/ 2>/dev/null" \
    "Application layer depends only on Domain" \
    "Application layer has forbidden dependencies to Infrastructure/Presentation"

# Vérification : Infrastructure ne dépend pas de Presentation
check_rule \
    "Infrastructure Layer Dependencies" \
    "! grep -r 'import.*from.*\.\./\.\./presentation\|import.*from.*presentation/' src/infrastructure/ 2>/dev/null" \
    "Infrastructure layer doesn't depend on Presentation" \
    "Infrastructure layer has forbidden dependencies to Presentation"

echo ""
echo "2️⃣ SOLID PRINCIPLES VERIFICATION"
echo "================================="

# Vérification : Pas de classe avec mot-clé 'any'
check_rule \
    "Type Safety (No Any)" \
    "! grep -r ': any\|any\[\]\|Array<any>\|any =' src/ --include='*.ts' --exclude='*.spec.ts' --exclude='*.example.ts' | grep -v 'test\|spec\|mock' 2>/dev/null" \
    "No 'any' types found in production code" \
    "Found forbidden 'any' types in production code"

# Vérification : Use Cases utilisent des interfaces
check_rule \
    "Dependency Inversion in Use Cases" \
    "grep -r 'readonly.*: I' src/application/use-cases/ --include='*.ts' | grep -v '.spec.ts' 2>/dev/null" \
    "Use Cases use interfaces (DIP applied)" \
    "Use Cases don't properly apply DIP"

# Vérification : Repositories implémentent des interfaces
check_rule \
    "Repository Pattern Implementation" \
    "grep -r 'implements.*Repository' src/infrastructure/database/repositories/ --include='*.ts' 2>/dev/null" \
    "Repositories implement interfaces" \
    "Repositories don't implement proper interfaces"

echo ""
echo "3️⃣ ARCHITECTURE PATTERNS VERIFICATION"
echo "====================================="

# Vérification : Use Cases suivent le pattern
check_rule \
    "Use Case Pattern Structure" \
    "grep -r 'async execute(' src/application/use-cases/ --include='*.ts' | grep -v '.spec.ts' 2>/dev/null" \
    "Use Cases follow standard execute() pattern" \
    "Use Cases don't follow standard pattern"

# Vérification : Entities dans Domain
check_rule \
    "Domain Entities Present" \
    "ls src/domain/entities/*.ts 2>/dev/null" \
    "Domain entities are properly located" \
    "Domain entities not found or misplaced"

# Vérification : Value Objects dans Domain
check_rule \
    "Domain Value Objects Present" \
    "ls src/domain/value-objects/*.ts 2>/dev/null" \
    "Domain value objects are properly located" \
    "Domain value objects not found"

# Vérification : Ports/Interfaces dans Application
check_rule \
    "Application Ports Present" \
    "ls src/application/ports/*.ts 2>/dev/null" \
    "Application ports/interfaces are properly defined" \
    "Application ports/interfaces not found"

echo ""
echo "4️⃣ TESTING QUALITY VERIFICATION"
echo "==============================="

# Vérification : Tests passent
check_rule \
    "All Tests Pass" \
    "npm test --silent --passWithNoTests" \
    "All tests are passing" \
    "Some tests are failing"

# Vérification : Tests pour chaque Use Case
check_rule \
    "Use Case Test Coverage" \
    "find src/application/use-cases -name '*.ts' -not -name '*.spec.ts' -exec basename {} .ts \; | while read usecase; do [ -f src/application/use-cases/*/$usecase.spec.ts ] || [ -f src/application/use-cases/$usecase.spec.ts ]; done" \
    "All Use Cases have corresponding tests" \
    "Some Use Cases lack test coverage"

# Vérification : Tests unitaires avec mocks
check_rule \
    "Proper Mock Usage in Tests" \
    "grep -r 'jest.fn()\|createMock\|MockType' src/ --include='*.spec.ts' 2>/dev/null" \
    "Tests use proper mocking" \
    "Tests might not be using proper mocks"

echo ""
echo "5️⃣ CODE QUALITY VERIFICATION"
echo "==========================="

# Vérification : Pas de console.log en production
check_rule \
    "No Console Logs in Production" \
    "! grep -r 'console\.' src/ --include='*.ts' | grep -v '.spec.ts' | grep -v 'console' 2>/dev/null" \
    "No console statements in production code" \
    "Found console statements in production code"

# Vérification : Injection de dépendances appropriée
check_rule \
    "Proper Dependency Injection" \
    "grep -r '@Injectable()\|@Controller(' src/ --include='*.ts' 2>/dev/null" \
    "Classes properly use dependency injection" \
    "Dependency injection not properly used"

# Vérification : Documentation des Use Cases
check_rule \
    "Use Case Documentation" \
    "grep -r '/\*\*\|//' src/application/use-cases/ --include='*.ts' | grep -v '.spec.ts' 2>/dev/null" \
    "Use Cases are documented" \
    "Use Cases lack proper documentation"

echo ""
echo "6️⃣ CONFIGURATION & STRUCTURE"
echo "============================"

# Vérification : Structure des dossiers Clean Architecture
check_rule \
    "Clean Architecture Folder Structure" \
    "[ -d src/domain ] && [ -d src/application ] && [ -d src/infrastructure ] && [ -d src/presentation ]" \
    "Clean Architecture folder structure is correct" \
    "Clean Architecture folder structure is incorrect"

# Vérification : Configuration TypeScript stricte
check_rule \
    "TypeScript Strict Configuration" \
    "grep '\"strict\": true' tsconfig.json 2>/dev/null" \
    "TypeScript strict mode is enabled" \
    "TypeScript strict mode is not enabled"

# Vérification : Tokens d'injection centralisés
check_rule \
    "Centralized Injection Tokens" \
    "[ -f src/shared/constants/injection-tokens.ts ]" \
    "Injection tokens are centralized" \
    "Injection tokens are not properly centralized"

echo ""
echo "📊 COMPLIANCE REPORT"
echo "==================="

PASSED=$((CHECKS - VIOLATIONS))
PERCENTAGE=$((PASSED * 100 / CHECKS))

echo "Total Checks: $CHECKS"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Violations: ${RED}$VIOLATIONS${NC}"
echo -e "Compliance Score: ${BLUE}$PERCENTAGE%${NC}"

echo ""

if [ $VIOLATIONS -eq 0 ]; then
    echo -e "${GREEN}🎉 PERFECT COMPLIANCE! 🎉${NC}"
    echo -e "${GREEN}✅ Your project fully respects Clean Architecture principles${NC}"
    echo -e "${GREEN}✅ Ready for production deployment${NC}"
    exit 0
elif [ $VIOLATIONS -le 2 ]; then
    echo -e "${YELLOW}⚠️  GOOD COMPLIANCE with minor issues${NC}"
    echo -e "${YELLOW}🔧 Please address the violations above${NC}"
    exit 1
else
    echo -e "${RED}❌ COMPLIANCE ISSUES DETECTED${NC}"
    echo -e "${RED}🚨 Please fix violations before proceeding${NC}"
    exit 2
fi
