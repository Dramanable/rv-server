#!/usr/bin/env node

/**
 * 🔧 SCRIPT DE CORRECTION ULTIME - Prospect Status Mocks
 * ✅ Ajoute TOUTES les méthodes ProspectStatus manquantes dans les mocks
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Correction finale des mocks ProspectStatus...');

// Méthodes complètes ProspectStatus à ajouter aux mocks
const PROSPECT_STATUS_METHODS = `
          isClosed: jest.fn().mockReturnValue(false),
          isClosedWon: jest.fn().mockReturnValue(false),
          isClosedLost: jest.fn().mockReturnValue(false),
          isActive: jest.fn().mockReturnValue(true),
          isInProgress: jest.fn().mockReturnValue(false),
          canTransitionTo: jest.fn().mockReturnValue(true),
          getPriority: jest.fn().mockReturnValue(1),
          getDisplayName: jest.fn().mockReturnValue('LEAD'),
          equals: jest.fn().mockReturnValue(false),
          toString: () => 'LEAD',`;

// Fichiers de tests prospects à corriger
const testFiles = [
  'src/__tests__/unit/application/use-cases/prospects/delete-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/get-prospect-by-id.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/list-prospects.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/update-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/create-prospect-simple.use-case.spec.ts',
];

let totalFilesProcessed = 0;
let totalReplacements = 0;

for (const filePath of testFiles) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Fichier non trouvé : ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern pour trouver les objets getStatus sans toutes les méthodes
  const statusPatterns = [
    // Pattern 1: getStatus simple avec getValue seulement
    /getStatus:\s*jest\.fn\(\)\.mockReturnValue\(\{\s*getValue:\s*\(\)\s*=>\s*[^}]+\s*\}\)/g,
    
    // Pattern 2: getStatus avec quelques méthodes mais pas toutes
    /getStatus:\s*jest\.fn\(\)\.mockReturnValue\(\{[\s\S]*?getValue:\s*\(\)\s*=>\s*[^}]+[^}]*\}\)(?!\s*,[\s\S]*?isClosed:)/g,
  ];

  for (const pattern of statusPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Extraire juste la valeur du status de getValue
        const valueMatch = match.match(/getValue:\s*\(\)\s*=>\s*['"`]?([^'"`\s,}]+)['"`]?/);
        const statusValue = valueMatch ? valueMatch[1] : 'LEAD';
        
        // Créer le mock complet avec toutes les méthodes
        const completeMock = `getStatus: jest.fn().mockReturnValue({
        getValue: () => '${statusValue}',${PROSPECT_STATUS_METHODS}
      })`;
        
        content = content.replace(match, completeMock);
        modified = true;
        totalReplacements++;
      }
    }
  }

  // Pattern spécialisé pour les simples getValue sans autres méthodes
  const simpleGetValuePattern = /getStatus:\s*jest\.fn\(\)\.mockReturnValue\(\s*(['"`][^'"`]+['"`])\s*\)/g;
  const simpleMatches = content.match(simpleGetValuePattern);
  if (simpleMatches) {
    for (const match of simpleMatches) {
      const valueMatch = match.match(/['"`]([^'"`]+)['"`]/);
      const statusValue = valueMatch ? valueMatch[1] : 'LEAD';
      
      const completeMock = `getStatus: jest.fn().mockReturnValue({
        getValue: () => '${statusValue}',${PROSPECT_STATUS_METHODS}
      })`;
      
      content = content.replace(match, completeMock);
      modified = true;
      totalReplacements++;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Traité: ${path.basename(filePath)} (${totalReplacements} remplacements)`);
    totalFilesProcessed++;
  } else {
    console.log(`ℹ️  Aucune modification nécessaire: ${path.basename(filePath)}`);
  }
}

console.log(`\n🎯 Correction terminée:`);
console.log(`📁 Fichiers traités: ${totalFilesProcessed}`);
console.log(`🔄 Remplacements totaux: ${totalReplacements}`);
console.log(`\n✅ Tous les mocks ProspectStatus ont maintenant toutes les méthodes requises !`);