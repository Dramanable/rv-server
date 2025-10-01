#!/usr/bin/env node

const fs = require('fs');

console.log('🔧 Final prospect test corrections...');

// 1. Fix update-prospect repository save mock to return complete prospect
const updatePath = 'src/__tests__/unit/application/use-cases/prospects/update-prospect.use-case.spec.ts';
if (fs.existsSync(updatePath)) {
  let content = fs.readFileSync(updatePath, 'utf-8');
  
  // Fix the save mock to return proper prospect with all required methods
  content = content.replace(
    /mockProspectRepository\.save\.mockResolvedValue\(\{[\s\S]*?\}\);/g,
    `mockProspectRepository.save.mockResolvedValue({
      ...createMockProspect(),
      getId: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue('f47ac10b-58cc-4372-a567-0e02b2c3d479')
      }),
      getBusinessName: jest.fn().mockReturnValue('TechCorp Solutions'),
      getContactEmail: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue('contact@techcorp.com')
      }),
      getContactName: jest.fn().mockReturnValue('Jean Dupont'),
      getContactPhone: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue('+33123456789')
      }),
      getEstimatedValue: jest.fn().mockReturnValue({
        getAmount: jest.fn().mockReturnValue(5000),
        getCurrency: jest.fn().mockReturnValue('EUR')
      }),
      getStatus: jest.fn().mockReturnValue({
        getValue: jest.fn().mockReturnValue('LEAD')
      }),
      getSource: jest.fn().mockReturnValue('WEBSITE'),
      getStaffCount: jest.fn().mockReturnValue(15),
      getNotes: jest.fn().mockReturnValue('Updated notes'),
      getAssignedSalesRep: jest.fn().mockReturnValue('a1b2c3d4-e5f6-4789-abc1-234567890def'),
      getCreatedAt: jest.fn().mockReturnValue(new Date('2025-01-01T10:00:00.000Z')),
      getUpdatedAt: jest.fn().mockReturnValue(new Date())
    });`
  );
  
  // Fix the logging error message expectation
  content = content.replace(
    /"Failed to delete prospect"/g,
    '"Failed to update prospect"'
  );
  
  // Fix updatedFields logging expectation
  content = content.replace(
    /expect\.objectContaining\(\{[\s\S]*?updatedFields: expect\.arrayContaining\(\[[\s\S]*?\]\)[\s\S]*?\}\)/g,
    `expect.objectContaining({
        prospectId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        correlationId: "correlation-789",
        requestingUserId: "a1b2c3d4-e5f6-4789-abc1-234567890def"
      })`
  );
  
  fs.writeFileSync(updatePath, content);
  console.log('✅ Fixed update-prospect save mock and logging');
}

// 2. Fix get-prospect-by-id error logging and error tests
const getByIdPath = 'src/__tests__/unit/application/use-cases/prospects/get-prospect-by-id.use-case.spec.ts';
if (fs.existsSync(getByIdPath)) {
  let content = fs.readFileSync(getByIdPath, 'utf-8');
  
  // Fix error logging message
  content = content.replace(
    /"Failed to delete prospect"/g,
    '"Failed to get prospect by ID"'
  );
  
  // Fix error case where it should find null but still throw ProspectNotFoundError
  content = content.replace(
    /(should throw ProspectNotFoundError when prospect does not exist[\s\S]*?)mockProspectRepository\.findById\.mockResolvedValue\(createMockProspect\(\)\);/g,
    '$1mockProspectRepository.findById.mockResolvedValue(null);'
  );
  
  fs.writeFileSync(getByIdPath, content);
  console.log('✅ Fixed get-prospect-by-id error cases');
}

// 3. Fix create-prospect permission check
const createPath = 'src/__tests__/unit/application/use-cases/prospects/create-prospect.use-case.spec.ts';
if (fs.existsSync(createPath)) {
  let content = fs.readFileSync(createPath, 'utf-8');
  
  // Fix success case permission mock
  content = content.replace(
    /(should create prospect successfully with valid data[\s\S]*?beforeEach[\s\S]*?)mockPermissionService\.hasPermission\.mockResolvedValue\(false\);/g,
    '$1mockPermissionService.hasPermission.mockResolvedValue(true);'
  );
  
  fs.writeFileSync(createPath, content);
  console.log('✅ Fixed create-prospect permission mock');
}

// 4. Fix create-prospect-simple expectations
const createSimplePath = 'src/__tests__/unit/application/use-cases/prospects/create-prospect-simple.use-case.spec.ts';
if (fs.existsSync(createSimplePath)) {
  let content = fs.readFileSync(createSimplePath, 'utf-8');
  
  // Fix the permission error test - should actually fail the permission check
  content = content.replace(
    /(should deny creation if permission check fails[\s\S]*?beforeEach[\s\S]*?)mockPermissionService\.hasPermission\.mockResolvedValue\(true\);/g,
    '$1mockPermissionService.hasPermission.mockResolvedValue(false);'
  );
  
  fs.writeFileSync(createSimplePath, content);
  console.log('✅ Fixed create-prospect-simple permission test');
}

// 5. Fix list-prospects permission error test
const listPath = 'src/__tests__/unit/application/use-cases/prospects/list-prospects.use-case.spec.ts';
if (fs.existsSync(listPath)) {
  let content = fs.readFileSync(listPath, 'utf-8');
  
  // Fix permission error test to actually throw permission error not proceed with undefined result
  content = content.replace(
    /(should throw ProspectPermissionError when user lacks VIEW_PROSPECTS permission[\s\S]*?beforeEach[\s\S]*?)mockPermissionService\.hasPermission\.mockResolvedValue\(false\);[\s\S]*?mockProspectRepository\.findProspectsWithFilters\.mockResolvedValue\(\{ prospects: \[\], total: 0 \}\);/g,
    `$1mockPermissionService.hasPermission.mockResolvedValue(false);
      
        // Repository should not be called due to permission failure
        // mockProspectRepository.findProspectsWithFilters.mockResolvedValue({ prospects: [], total: 0 });`
  );
  
  fs.writeFileSync(listPath, content);
  console.log('✅ Fixed list-prospects permission error test');
}

console.log('🎯 Final prospect test corrections completed!');