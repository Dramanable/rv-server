#!/usr/bin/env node

/**
 * 🔧 Script de correction des mocks ProspectStatus
 * Ajoute les méthodes manquantes isClosed(), isClosedWon(), etc.
 */

const fs = require('fs');
const path = require('path');

// Fonction pour créer un mock ProspectStatus complet
const createProspectStatusMock = (status = 'NEW') => `{
      getValue: () => '${status}',
      equals: jest.fn().mockReturnValue(false),
      isClosed: jest.fn().mockReturnValue(${status === 'CLOSED_WON' || status === 'CLOSED_LOST'}),
      isClosedWon: jest.fn().mockReturnValue(${status === 'CLOSED_WON'}),
      isClosedLost: jest.fn().mockReturnValue(${status === 'CLOSED_LOST'}),
      isOpen: jest.fn().mockReturnValue(${status !== 'CLOSED_WON' && status !== 'CLOSED_LOST'}),
      canTransitionTo: jest.fn().mockReturnValue(true),
      getPriority: jest.fn().mockReturnValue(1),
      getDisplayName: jest.fn().mockReturnValue('${status}'),
      toString: () => '${status}',
    }`;

// Trouver tous les fichiers de test prospect
const testDir = path.join(__dirname, 'src/__tests__/unit/application/use-cases/prospects');
const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.spec.ts'));

console.log('🔧 Correction des mocks ProspectStatus dans les tests...');

testFiles.forEach(file => {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Pattern 1: Mock simple avec getStatus
  const simpleStatusPattern = /getStatus:\s*\(\)\s*=>\s*(\{[^}]*\}|\w+)/g;
  if (content.match(simpleStatusPattern)) {
    content = content.replace(simpleStatusPattern, (match, statusValue) => {
      // Extraire le status si c'est une string
      let status = 'NEW';
      if (statusValue.includes('CLOSED_WON')) status = 'CLOSED_WON';
      else if (statusValue.includes('CLOSED_LOST')) status = 'CLOSED_LOST';
      else if (statusValue.includes('QUALIFIED')) status = 'QUALIFIED';
      else if (statusValue.includes('CONTACTED')) status = 'CONTACTED';
      
      return `getStatus: () => ${createProspectStatusMock(status)}`;
    });
    modified = true;
  }

  // Pattern 2: Mock avec ProspectStatus.create
  const createStatusPattern = /ProspectStatus\.create\(['"`]([^'"`]+)['"`]\)/g;
  if (content.match(createStatusPattern)) {
    content = content.replace(createStatusPattern, (match, status) => {
      return createProspectStatusMock(status);
    });
    modified = true;
  }

  // Pattern 3: Mock incomplet dans les données de test
  const incompleteStatusPattern = /getStatus:\s*\(\)\s*=>\s*\{\s*getValue:\s*\(\)\s*=>\s*['"`]([^'"`]+)['"`]\s*\}/g;
  if (content.match(incompleteStatusPattern)) {
    content = content.replace(incompleteStatusPattern, (match, status) => {
      return `getStatus: () => ${createProspectStatusMock(status)}`;
    });
    modified = true;
  }

  // Pattern 4: Ajouter les imports manquants si nécessaire
  if (content.includes('ProspectStatus') && !content.includes("import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';")) {
    const importSection = content.match(/^(import[^;]+;\s*)+/m);
    if (importSection) {
      const newImport = "import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';\n";
      content = content.replace(importSection[0], importSection[0] + newImport);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé: ${file}`);
  } else {
    console.log(`⏭️  Ignoré: ${file} (pas de mocks ProspectStatus détectés)`);
  }
});

console.log('✨ Correction des mocks ProspectStatus terminée !');