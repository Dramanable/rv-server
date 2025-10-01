#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// UUID valide pour les tests
const validUUID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
const validUserUUID = 'a1b2c3d4-e5f6-4789-abc1-234567890def';
const validSalesRepUUID = 'b2c3d4e5-f6a7-4890-bcd1-23456789abcd';

const replacements = [
  // IDs de prospects
  { from: '"prospect-123"', to: `"${validUUID}"` },
  { from: "'prospect-123'", to: `'${validUUID}'` },
  { from: '"prospect-456"', to: `"${validUUID}"` },
  { from: "'prospect-456'", to: `'${validUUID}'` },
  
  // IDs d'utilisateurs
  { from: '"user-456"', to: `"${validUserUUID}"` },
  { from: "'user-456'", to: `'${validUserUUID}'` },
  { from: '"requesting-user-id"', to: `"${validUserUUID}"` },
  { from: "'requesting-user-id'", to: `'${validUserUUID}'` },
  { from: '"user-123"', to: `"${validUserUUID}"` },
  { from: "'user-123'", to: `'${validUserUUID}'` },
  
  // IDs de sales rep
  { from: '"sales-rep-id"', to: `"${validSalesRepUUID}"` },
  { from: "'sales-rep-id'", to: `'${validSalesRepUUID}'` },
  { from: '"sales-rep-123"', to: `"${validSalesRepUUID}"` },
  { from: "'sales-rep-123'", to: `'${validSalesRepUUID}'` },
  { from: '"other-sales-rep"', to: `"${validSalesRepUUID}"` },
  { from: "'other-sales-rep'", to: `'${validSalesRepUUID}'` },
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    replacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replaceAll(from, to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

const testDir = path.join(__dirname, 'src', '__tests__', 'unit', 'application', 'use-cases', 'prospects');

if (fs.existsSync(testDir)) {
  const files = fs.readdirSync(testDir);
  files.forEach(file => {
    if (file.endsWith('.spec.ts')) {
      fixFile(path.join(testDir, file));
    }
  });
  console.log('Finished fixing prospect test files');
} else {
  console.error('Test directory not found:', testDir);
}