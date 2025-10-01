#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🚨 SCRIPT ULTIME - CORRECTION ADDNOTE + VALEURS PAR DÉFAUT
 */

// Méthode addNote et corrections valeurs par défaut
const ADD_NOTE_METHOD = `
  // 🆕 MÉTHODE ADDNOTE MANQUANTE (CRITIQUE)
  addNote: jest.fn().mockImplementation((note) => {
    overrides.notes = note;
    return createMockProspect({ ...overrides, notes: note });
  }),`;

// Fichiers à corriger
const testFiles = [
  'src/__tests__/unit/application/use-cases/prospects/create-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/delete-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/get-prospect-by-id.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/list-prospects.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/update-prospect.use-case.spec.ts'
];

function addAddNoteMethod() {
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

    // Ajouter la méthode addNote si pas déjà présente
    if (!content.includes('addNote:') && content.includes('updateNotes:')) {
      content = content.replace(/(\s+)updateNotes:/, `$1${ADD_NOTE_METHOD}
$1updateNotes:`);
      modified = true;
      console.log(`  ✅ Méthode addNote ajoutée`);
    }

    // Corrections des valeurs par défaut pour get-prospect-by-id
    if (filePath.includes('get-prospect-by-id')) {
      // Corriger estimatedMonthlyPrice par défaut
      content = content.replace(
        /estimatedMonthlyPrice \|\| 2500/g,
        'estimatedMonthlyPrice || 390'
      );
      
      // Corriger les valeurs par défaut pour les tests spécifiques
      if (content.includes('overrides.phone ? { getValue: () => overrides.phone } : undefined')) {
        content = content.replace(
          'overrides.phone ? { getValue: () => overrides.phone } : undefined',
          'overrides.phone ? { getValue: () => overrides.phone } : (overrides.contactPhone ? { getValue: () => overrides.contactPhone } : undefined)'
        );
      }
      
      modified = true;
      console.log(`  ✅ Valeurs par défaut corrigées pour get-prospect-by-id`);
    }

    // Corrections pour list-prospects - hotProspect par défaut
    if (filePath.includes('list-prospects')) {
      content = content.replace(
        /isHotProspect: \(\) => overrides\.isHotProspect \|\| false/g,
        'isHotProspect: () => overrides.isHotProspect !== undefined ? overrides.isHotProspect : true'
      );
      modified = true;
      console.log(`  ✅ Valeurs par défaut corrigées pour list-prospects`);
    }

    if (modified) {
      fs.writeFileSync(fullPath, content, 'utf8');
      totalFixed++;
      console.log(`  🎯 Fichier corrigé: ${filePath}`);
    } else {
      console.log(`  ⏭️  Aucune modification nécessaire: ${filePath}`);
    }
  });

  console.log(`\\n🎉 CORRECTION TERMINÉE: ${totalFixed} fichiers modifiés`);
}

// Exécuter la correction
addAddNoteMethod();