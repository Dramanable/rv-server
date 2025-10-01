#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🚨 SCRIPT FINAL - AJOUT MÉTHODES CRITIQUES MANQUANTES
 */

// Méthodes critiques à ajouter dans tous les mocks
const CRITICAL_METHODS = `
  // 🆕 MÉTHODES CRITIQUES MANQUANTES
  getEstimatedMonthlyPrice: () => ({
    getAmount: () => overrides.estimatedMonthlyPrice || 2500,
    getCurrency: () => "EUR",
  }),
  
  // Méthodes d'update manquantes
  updateEstimatedValue: jest.fn().mockImplementation((value) => {
    overrides.estimatedValue = value;
    return createMockProspect({ ...overrides, estimatedValue: value });
  }),
  updateStaffCount: jest.fn().mockImplementation((count) => {
    overrides.staffCount = count;
    return createMockProspect({ ...overrides, staffCount: count });
  }),
  updateNotes: jest.fn().mockImplementation((notes) => {
    overrides.notes = notes;
    return createMockProspect({ ...overrides, notes: notes });
  }),`;

// Fichiers à corriger
const testFiles = [
  'src/__tests__/unit/application/use-cases/prospects/create-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/delete-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/get-prospect-by-id.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/list-prospects.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/update-prospect.use-case.spec.ts'
];

function addCriticalMethods() {
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

    // Ajouter les méthodes critiques avant "...overrides,"
    const overridesPattern = /(\s+)\.\.\.overrides,(\s+)\}\);/;
    
    if (overridesPattern.test(content) && !content.includes('getEstimatedMonthlyPrice')) {
      content = content.replace(overridesPattern, `$1${CRITICAL_METHODS}
$1...overrides,$2});`);
      modified = true;
      console.log(`  ✅ Méthodes critiques ajoutées`);
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      totalFixed++;
      console.log(`  🎯 Fichier corrigé: ${filePath}`);
    } else {
      console.log(`  ⏭️  Déjà corrigé ou aucune modification nécessaire: ${filePath}`);
    }
  });

  console.log(`\\n🎉 CORRECTION TERMINÉE: ${totalFixed} fichiers modifiés`);
}

// Exécuter la correction
addCriticalMethods();