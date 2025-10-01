#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🚨 SCRIPT DE CORRECTION FINALE - ProspectStatus Mock Methods
 * 
 * Ce script ajoute TOUTES les méthodes manquantes aux mocks ProspectStatus
 * dans les tests de prospects pour résoudre les erreurs "isClosedWon is not a function"
 */

// Définir toutes les méthodes requises pour ProspectStatus
const PROSPECT_STATUS_METHODS = `
      // 🎯 TOUTES LES MÉTHODES PROSPECT STATUS REQUISES
      getValue: () => overrides.status || "LEAD",
      getLabel: () => overrides.statusLabel || "Nouveau lead", 
      getColor: () => overrides.statusColor || "#10B981",
      getPriority: () => overrides.statusPriority || 1,
      
      // ✅ Méthodes de validation de statut (CRITIQUES)
      isActive: jest.fn().mockReturnValue(overrides.isActive !== false),
      isClosed: jest.fn().mockReturnValue(overrides.isClosed || false),
      isClosedWon: jest.fn().mockReturnValue(overrides.isClosedWon || false),
      isClosedLost: jest.fn().mockReturnValue(overrides.isClosedLost || false),
      isInProgress: jest.fn().mockReturnValue(overrides.isInProgress || false),
      isQualified: jest.fn().mockReturnValue(overrides.isQualified || false),
      isLead: jest.fn().mockReturnValue(overrides.isLead !== false),
      isProposal: jest.fn().mockReturnValue(overrides.isProposal || false),
      isNegotiation: jest.fn().mockReturnValue(overrides.isNegotiation || false),
      
      // 🔒 Méthodes de règles métier
      canDelete: jest.fn().mockReturnValue(overrides.canDelete !== false),
      canEdit: jest.fn().mockReturnValue(overrides.canEdit !== false),
      canConvert: jest.fn().mockReturnValue(overrides.canConvert !== false),
      
      // 📊 Méthodes de transition et validation
      canTransitionTo: jest.fn().mockReturnValue(overrides.canTransitionTo !== false),
      getValidTransitions: jest.fn().mockReturnValue(overrides.validTransitions || []),
      isValidTransition: jest.fn().mockReturnValue(overrides.isValidTransition !== false)`;

// Fichiers de test à corriger
const testFiles = [
  'src/__tests__/unit/application/use-cases/prospects/create-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/delete-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/get-prospect-by-id.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/list-prospects.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/update-prospect.use-case.spec.ts'
];

function fixProspectStatusMocks() {
  let totalFixed = 0;

  testFiles.forEach(filePath => {
    const fullPath = path.join(__dirname, filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  Fichier non trouvé: ${filePath}`);
      return;
    }

    console.log(`🔧 Traitement de: ${filePath}`);
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let modified = false;

    // Pattern 1: Remplacer getStatus mock incomplet par version complète
    const getStatusPattern = /getStatus:\s*\(\)\s*=>\s*\(\{[^}]*canDelete:[^}]*\}\)/gs;
    
    if (getStatusPattern.test(content)) {
      content = content.replace(getStatusPattern, `getStatus: () => ({${PROSPECT_STATUS_METHODS}
    })`);
      modified = true;
      console.log(`  ✅ Pattern getStatus corrigé`);
    }

    // Pattern 2: Remplacer getStatus arrow function simple
    const simpleGetStatusPattern = /getStatus:\s*\(\)\s*=>\s*\(\{[^}]*\}\)/gs;
    
    if (simpleGetStatusPattern.test(content) && !modified) {
      content = content.replace(simpleGetStatusPattern, `getStatus: () => ({${PROSPECT_STATUS_METHODS}
    })`);
      modified = true;
      console.log(`  ✅ Pattern getStatus simple corrigé`);
    }

    // Pattern 3: Si aucun getStatus trouvé, chercher dans createMockProspect et ajouter
    if (!content.includes('getStatus:') && content.includes('createMockProspect')) {
      const mockProspectPattern = /(const createMockProspect[^{]*\{[^}]*)(getId:[^,]*,)/s;
      
      if (mockProspectPattern.test(content)) {
        content = content.replace(mockProspectPattern, 
          `$1$2
    getStatus: () => ({${PROSPECT_STATUS_METHODS}
    }),`);
        modified = true;
        console.log(`  ✅ getStatus ajouté à createMockProspect`);
      }
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      totalFixed++;
      console.log(`  🎯 Fichier corrigé: ${filePath}`);
    } else {
      console.log(`  ⏭️  Aucune modification nécessaire: ${filePath}`);
    }
  });

  console.log(`\n🎉 CORRECTION TERMINÉE: ${totalFixed} fichiers modifiés`);
}

// Exécuter la correction
fixProspectStatusMocks();