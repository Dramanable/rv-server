#!/usr/bin/env node

/**
 * 🚨 Script de correction d'urgence pour create-prospect.use-case.spec.ts
 * Correction de la syntaxe cassée
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/__tests__/unit/application/use-cases/prospects/create-prospect.use-case.spec.ts');

console.log('🚨 Correction d\'urgence du fichier create-prospect.use-case.spec.ts...');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Correction 1: Corriger les erreurs de syntaxe autour des mocks
content = content.replace(
  /const mockProspect = createMockProspect\(\)\),[\s\S]*?} as any;/g,
  `const mockProspect = createMockProspect();`
);

// Correction 2: S'assurer que tous les mocks utilisent createMockProspect()
content = content.replace(
  /mockProspectRepository\.save\.mockResolvedValue\(\s*\{[\s\S]*?\}\s*\)/g,
  `mockProspectRepository.save.mockResolvedValue(createMockProspect())`
);

// Correction 3: Corriger les tests qui utilisent des objets littéraux comme prospects
content = content.replace(
  /const\s+\w*[Pp]rospect\w*\s*=\s*\{[\s\S]*?getId\s*:\s*[\s\S]*?\}\s*as any;/g,
  `const mockProspect = createMockProspect();`
);

// Écrire le fichier corrigé
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Correction d\'urgence terminée !');