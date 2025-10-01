#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🚨 SCRIPT DE CORRECTION ULTRA-COMPLÈTE - TOUS LES MOCKS PROSPECTS
 * 
 * Ce script ajoute TOUTES les méthodes manquantes aux mocks Prospect
 * pour résoudre toutes les erreurs de tests prospects
 */

// Template complet pour mock Prospect
const COMPLETE_PROSPECT_MOCK = `const createMockProspect = (overrides: any = {}): any => ({
  getId: () => ({ getValue: () => overrides.id || "f47ac10b-58cc-4372-a567-0e02b2c3d479" }),
  getBusinessName: () => overrides.businessName || "TechCorp Solutions",
  getContactEmail: () => ({
    getValue: () => overrides.email || "contact@techcorp.com",
  }),
  getContactName: () => overrides.contactName || "Jean Dupont",
  getContactPhone: () =>
    overrides.phone ? { getValue: () => overrides.phone } : undefined,
  getSource: () => overrides.source || "WEBSITE",
  getStatus: () => ({
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
    isValidTransition: jest.fn().mockReturnValue(overrides.isValidTransition !== false)
  }),
  getAssignedSalesRep: () => ({
    getValue: () => overrides.assignedSalesRep || "a1b2c3d4-e5f6-4789-abc1-234567890def",
  }),
  getStaffCount: () => overrides.staffCount || 15,
  getEstimatedValue: () => ({
    getAmount: () => overrides.estimatedValue || 50000,
    getCurrency: () => "EUR",
  }),
  
  // 🆕 NOUVELLE MÉTHODE MANQUANTE - getAnnualRevenuePotential
  getAnnualRevenuePotential: () => ({
    getAmount: () => overrides.annualRevenuePotential || 120000,
    getCurrency: () => "EUR",
  }),
  
  getBusinessSize: () => overrides.businessSize || "MEDIUM",
  getNotes: () => overrides.notes || "",
  getCreatedAt: () => overrides.createdAt || new Date("2025-01-01T10:00:00Z"),
  getUpdatedAt: () => overrides.updatedAt || new Date("2025-01-01T10:00:00Z"),
  isHighValue: () => overrides.isHighValue || false,
  isHotProspect: () => overrides.isHotProspect || false,
  canBeDeleted: jest.fn().mockReturnValue(overrides.canBeDeleted !== false),
  hasActiveInteractions: jest
    .fn()
    .mockReturnValue(overrides.hasActiveInteractions || false),

  // 🆕 MÉTHODES MANQUANTES POUR UPDATE
  updateBasicInfo: jest.fn().mockImplementation((data) => {
    // Simule la mise à jour en retournant un nouveau mock avec les données mises à jour
    return createMockProspect({ ...overrides, ...data });
  }),
  updateContactInfo: jest.fn().mockImplementation((data) => {
    return createMockProspect({ ...overrides, ...data });
  }),
  updateBusinessInfo: jest.fn().mockImplementation((data) => {
    return createMockProspect({ ...overrides, ...data });
  }),
  updateStatus: jest.fn().mockImplementation((newStatus) => {
    return createMockProspect({ ...overrides, status: newStatus });
  }),

  ...overrides,
});`;

// Fichiers de test à corriger
const testFiles = [
  'src/__tests__/unit/application/use-cases/prospects/create-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/delete-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/get-prospect-by-id.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/list-prospects.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/update-prospect.use-case.spec.ts',
  'src/__tests__/unit/application/use-cases/prospects/create-prospect-simple.use-case.spec.ts'
];

function fixAllProspectMocks() {
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

    // Remplacer la fonction createMockProspect complète si elle existe
    const createMockProspectPattern = /const createMockProspect = \(overrides: any = \{\}\): any => \(\{[\s\S]*?\}\);/;
    
    if (createMockProspectPattern.test(content)) {
      content = content.replace(createMockProspectPattern, COMPLETE_PROSPECT_MOCK);
      modified = true;
      console.log(`  ✅ createMockProspect remplacé par version complète`);
    }

    // Si pas de createMockProspect trouvé, l'ajouter après les imports
    if (!content.includes('createMockProspect') && content.includes('describe(')) {
      const insertPosition = content.indexOf('describe(');
      content = content.slice(0, insertPosition) + COMPLETE_PROSPECT_MOCK + '\\n\\n  ' + content.slice(insertPosition);
      modified = true;
      console.log(`  ✅ createMockProspect ajouté`);
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
fixAllProspectMocks();