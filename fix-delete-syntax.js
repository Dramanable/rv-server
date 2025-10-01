#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Fixing syntax errors in delete-prospect test...');

const filePath = 'src/__tests__/unit/application/use-cases/prospects/delete-prospect.use-case.spec.ts';

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Fix syntax errors around the mockReturnValue additions
  content = content.replace(
    /createMockProspect\(\)[\s\S]*?canDelete: jest\.fn\(\)\.mockReturnValue\(false\)[\s\S]*?\}\);/g,
    `{
        ...createMockProspect(),
        canDelete: jest.fn().mockReturnValue(false)
      });`
  );
  
  // Fix the more complex ones with getStatus
  content = content.replace(
    /createMockProspect\(\)[\s\S]*?canDelete: jest\.fn\(\)\.mockReturnValue\(false\),[\s\S]*?getStatus: jest\.fn\(\)\.mockReturnValue\(\{[\s\S]*?isClosedWon: jest\.fn\(\)\.mockReturnValue\(true\),[\s\S]*?getValue: jest\.fn\(\)\.mockReturnValue\('WON'\)[\s\S]*?\}\)[\s\S]*?\}\);/g,
    `{
        ...createMockProspect(),
        canDelete: jest.fn().mockReturnValue(false),
        getStatus: jest.fn().mockReturnValue({
          isClosedWon: jest.fn().mockReturnValue(true),
          getValue: jest.fn().mockReturnValue('WON')
        })
      });`
  );
  
  // Fix hasActiveInteractions version
  content = content.replace(
    /createMockProspect\(\)[\s\S]*?canDelete: jest\.fn\(\)\.mockReturnValue\(false\),[\s\S]*?hasActiveInteractions: jest\.fn\(\)\.mockReturnValue\(true\)[\s\S]*?\}\);/g,
    `{
        ...createMockProspect(),
        canDelete: jest.fn().mockReturnValue(false),
        hasActiveInteractions: jest.fn().mockReturnValue(true)
      });`
  );
  
  fs.writeFileSync(filePath, content);
  console.log('✅ Fixed delete-prospect syntax errors');
} else {
  console.log('❌ File not found');
}

console.log('🎯 Delete-prospect syntax fix completed!');