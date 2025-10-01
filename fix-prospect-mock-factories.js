#!/usr/bin/env node

/**
 * 🔧 Script pour créer des mock factories pour les entités Prospect
 * Remplace les mocks simples par des mocks d'entités complètes
 */

const fs = require('fs');
const path = require('path');

// Mock factory pour créer des entités Prospect complètes
const createProspectMockFactory = () => `
// 🏭 Mock Factory pour entité Prospect complète
const createMockProspect = (overrides = {}) => {
  const mockProspect = {
    getId: jest.fn().mockReturnValue({
      getValue: () => overrides.id || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    }),
    getBusinessName: jest.fn().mockReturnValue(overrides.businessName || 'TechCorp Solutions'),
    getContactEmail: jest.fn().mockReturnValue(overrides.contactEmail || 'contact@techcorp.com'),
    getContactName: jest.fn().mockReturnValue(overrides.contactName || 'Jean Dupont'),
    getContactPhone: jest.fn().mockReturnValue(overrides.contactPhone || '+33123456789'),
    getNotes: jest.fn().mockReturnValue(overrides.notes || 'Notes initiales'),
    getSource: jest.fn().mockReturnValue(overrides.source || 'WEBSITE'),
    getStaffCount: jest.fn().mockReturnValue(overrides.staffCount || 10),
    getBusinessSize: jest.fn().mockReturnValue(overrides.businessSize || 'SMALL'),
    getEstimatedValue: jest.fn().mockReturnValue({
      getAmount: () => overrides.estimatedValue || 50000,
      getCurrency: () => 'EUR',
    }),
    getAssignedSalesRep: jest.fn().mockReturnValue({
      getValue: () => overrides.assignedSalesRep || 'a1b2c3d4-e5f6-4789-abc1-234567890def',
    }),
    getStatus: jest.fn().mockReturnValue({
      getValue: () => overrides.status || 'LEAD',
      equals: jest.fn().mockReturnValue(false),
      isClosed: jest.fn().mockReturnValue((overrides.status || 'LEAD') === 'CLOSED_WON' || (overrides.status || 'LEAD') === 'CLOSED_LOST'),
      isClosedWon: jest.fn().mockReturnValue((overrides.status || 'LEAD') === 'CLOSED_WON'),
      isClosedLost: jest.fn().mockReturnValue((overrides.status || 'LEAD') === 'CLOSED_LOST'),
      isActive: jest.fn().mockReturnValue((overrides.status || 'LEAD') !== 'CLOSED_WON' && (overrides.status || 'LEAD') !== 'CLOSED_LOST'),
      isInProgress: jest.fn().mockReturnValue(['CONTACTED', 'QUALIFIED', 'PROPOSAL'].includes(overrides.status || 'LEAD')),
      canTransitionTo: jest.fn().mockReturnValue(true),
      getPriority: jest.fn().mockReturnValue(1),
      getDisplayName: jest.fn().mockReturnValue(overrides.status || 'LEAD'),
      toString: () => overrides.status || 'LEAD',
    }),
    getCreatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    getUpdatedAt: jest.fn().mockReturnValue(new Date('2024-01-01')),
    isHotProspect: jest.fn().mockReturnValue(overrides.isHotProspect || false),
    isHighValue: jest.fn().mockReturnValue(overrides.isHighValue || false),
    getAnnualRevenuePotential: jest.fn().mockReturnValue({
      getAmount: () => overrides.annualRevenuePotential || 600000,
      getCurrency: () => 'EUR',
    }),
    getEstimatedMonthlyPrice: jest.fn().mockReturnValue({
      getAmount: () => overrides.estimatedMonthlyPrice || 50,
      getCurrency: () => 'EUR',
    }),
    getCurrentSolution: jest.fn().mockReturnValue(overrides.currentSolution),
    toJSON: jest.fn().mockReturnValue({
      id: overrides.id || 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      businessName: overrides.businessName || 'TechCorp Solutions',
      contactEmail: overrides.contactEmail || 'contact@techcorp.com',
      contactName: overrides.contactName || 'Jean Dupont',
      contactPhone: overrides.contactPhone || '+33123456789',
      notes: overrides.notes || 'Notes initiales',
      source: overrides.source || 'WEBSITE',
      staffCount: overrides.staffCount || 10,
      businessSize: overrides.businessSize || 'SMALL',
      estimatedValue: { amount: overrides.estimatedValue || 50000, currency: 'EUR' },
      assignedSalesRep: overrides.assignedSalesRep || 'a1b2c3d4-e5f6-4789-abc1-234567890def',
      status: overrides.status || 'LEAD',
      createdAt: new Date('2024-01-01').toISOString(),
      updatedAt: new Date('2024-01-01').toISOString(),
      isHotProspect: overrides.isHotProspect || false,
      annualRevenuePotential: { amount: overrides.annualRevenuePotential || 600000, currency: 'EUR' },
      estimatedMonthlyPrice: { amount: overrides.estimatedMonthlyPrice || 50, currency: 'EUR' },
      currentSolution: overrides.currentSolution,
    }),
  };

  return mockProspect;
};
`;

// Trouver tous les fichiers de test prospect
const testDir = path.join(__dirname, 'src/__tests__/unit/application/use-cases/prospects');
const testFiles = fs.readdirSync(testDir).filter(file => file.endsWith('.spec.ts'));

console.log('🔧 Ajout de mock factories pour les entités Prospect...');

testFiles.forEach(file => {
  const filePath = path.join(testDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Ajouter la factory au début du fichier après les imports
  if (!content.includes('createMockProspect')) {
    const importEndIndex = content.lastIndexOf('import ');
    const nextLineIndex = content.indexOf('\n', importEndIndex);
    
    if (nextLineIndex !== -1) {
      const beforeImports = content.substring(0, nextLineIndex + 1);
      const afterImports = content.substring(nextLineIndex + 1);
      
      content = beforeImports + '\n' + createProspectMockFactory() + '\n' + afterImports;
      modified = true;
    }
  }

  // Remplacer les mocks simples par des appels à la factory
  // Pattern 1: mockProspectRepository.save retournant un objet simple
  const savePattern = /mockProspectRepository\.save\.mockResolvedValue\(\s*\{[\s\S]*?\}\s*\)/g;
  if (content.match(savePattern)) {
    content = content.replace(savePattern, (match) => {
      // Extraire les propriétés override si possible
      return 'mockProspectRepository.save.mockResolvedValue(createMockProspect())';
    });
    modified = true;
  }

  // Pattern 2: mockProspectRepository.findById retournant un objet simple
  const findByIdPattern = /mockProspectRepository\.findById\.mockResolvedValue\(\s*\{[\s\S]*?\}\s*\)/g;
  if (content.match(findByIdPattern)) {
    content = content.replace(findByIdPattern, (match) => {
      return 'mockProspectRepository.findById.mockResolvedValue(createMockProspect())';
    });
    modified = true;
  }

  // Pattern 3: Objects literals utilisés comme prospects dans les tests
  const prospectObjectPattern = /const\s+\w*[Pp]rospect\w*\s*=\s*\{[\s\S]*?getStatus\s*:\s*\(\)\s*=>\s*[\s\S]*?\}/g;
  if (content.match(prospectObjectPattern)) {
    content = content.replace(prospectObjectPattern, (match) => {
      // Extraire le nom de la variable
      const varNameMatch = match.match(/const\s+(\w*[Pp]rospect\w*)\s*=/);
      const varName = varNameMatch ? varNameMatch[1] : 'mockProspect';
      
      return `const ${varName} = createMockProspect()`;
    });
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Ajouté mock factory: ${file}`);
  } else {
    console.log(`⏭️  Ignoré: ${file} (factory déjà présente ou pas de mocks détectés)`);
  }
});

console.log('✨ Ajout des mock factories terminé !');