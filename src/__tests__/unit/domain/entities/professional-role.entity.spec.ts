/**
 * 🧪 TESTS DOMAIN - ProfessionalRole Entity
 * Clean Architecture - Domain Layer Tests
 * Tests unitaires pour l'entité ProfessionalRole
 */

import { ProfessionalRole } from '@domain/entities/professional-role.entity';

describe('ProfessionalRole Entity', () => {
  describe('Factory Method - create', () => {
    it('should create a professional role with valid data', () => {
      // Given
      const validData = {
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
        canLead: true,
      };

      // When
      const professionalRole = ProfessionalRole.create(validData);

      // Then
      expect(professionalRole.getId()).toBeDefined();
      expect(professionalRole.getCode()).toBe('SPECIALIST');
      expect(professionalRole.getName()).toBe('Specialist');
      expect(professionalRole.getDisplayName()).toBe('Spécialiste');
      expect(professionalRole.getCategory()).toBe('SERVICE_PROVIDER');
      expect(professionalRole.getDescription()).toBe(
        'Professionnel spécialisé dans un domaine particulier',
      );
      expect(professionalRole.getCanLead()).toBe(true);
      expect(professionalRole.getIsActive()).toBe(true);
      expect(professionalRole.getCreatedAt()).toBeInstanceOf(Date);
      expect(professionalRole.getUpdatedAt()).toBeInstanceOf(Date);
    });

    it('should create a professional role with canLead defaulting to false', () => {
      // Given
      const validData = {
        code: 'ASSISTANT',
        name: 'Assistant',
        displayName: 'Assistant',
        category: 'SERVICE_PROVIDER',
        description: 'Assistant spécialisé dans les soins',
      };

      // When
      const professionalRole = ProfessionalRole.create(validData);

      // Then
      expect(professionalRole.getCanLead()).toBe(false);
    });

    it('should normalize code to uppercase', () => {
      // Given
      const validData = {
        code: 'specialist',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      };

      // When
      const professionalRole = ProfessionalRole.create(validData);

      // Then
      expect(professionalRole.getCode()).toBe('SPECIALIST');
    });

    it('should trim whitespace from all string fields', () => {
      // Given
      const validData = {
        code: '  SPECIALIST  ',
        name: '  Specialist  ',
        displayName: '  Spécialiste  ',
        category: 'SERVICE_PROVIDER',
        description: '  Professionnel spécialisé dans un domaine particulier  ',
      };

      // When
      const professionalRole = ProfessionalRole.create(validData);

      // Then
      expect(professionalRole.getCode()).toBe('SPECIALIST');
      expect(professionalRole.getName()).toBe('Specialist');
      expect(professionalRole.getDisplayName()).toBe('Spécialiste');
      expect(professionalRole.getDescription()).toBe(
        'Professionnel spécialisé dans un domaine particulier',
      );
    });

    it('should set isActive to true by default', () => {
      // Given
      const validData = {
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      };

      // When
      const professionalRole = ProfessionalRole.create(validData);

      // Then
      expect(professionalRole.getIsActive()).toBe(true);
    });
  });

  describe('Validation Rules', () => {
    it('should throw error if code is empty', () => {
      // Given
      const invalidData = {
        code: '',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      };

      // When & Then
      expect(() => ProfessionalRole.create(invalidData)).toThrow(
        'Professional role code must be between 2 and 20 characters',
      );
    });

    it('should throw error if code is too short', () => {
      // Given
      const invalidData = {
        code: 'S',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      };

      // When & Then
      expect(() => ProfessionalRole.create(invalidData)).toThrow(
        'Professional role code must be between 2 and 20 characters',
      );
    });

    it('should throw error if name is empty', () => {
      // Given
      const invalidData = {
        code: 'SPECIALIST',
        name: '',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      };

      // When & Then
      expect(() => ProfessionalRole.create(invalidData)).toThrow(
        'Professional role name must be at least 2 characters',
      );
    });

    it('should throw error if description is too short', () => {
      // Given
      const invalidData = {
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Short',
      };

      // When & Then
      expect(() => ProfessionalRole.create(invalidData)).toThrow(
        'Professional role description must be at least 10 characters',
      );
    });

    it('should throw error if category is empty', () => {
      // Given
      const invalidData = {
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: '',
        description: 'Professionnel spécialisé dans un domaine particulier',
      };

      // When & Then
      expect(() => ProfessionalRole.create(invalidData)).toThrow(
        'Professional category must be at least 2 characters',
      );
    });
  });

  describe('Business Rules', () => {
    it('should identify primary roles correctly', () => {
      // Given
      const primaryRole = ProfessionalRole.create({
        code: 'PRIMARY',
        name: 'Primary',
        displayName: 'Rôle Principal',
        category: 'PRIMARY',
        description: 'Rôle principal du professionnel',
      });

      const supportRole = ProfessionalRole.create({
        code: 'ADMIN',
        name: 'Admin',
        displayName: 'Administrateur',
        category: 'SUPPORT',
        description: 'Administrateur du système',
      });

      // When & Then
      expect(primaryRole.isPrimaryRole()).toBe(true);
      expect(supportRole.isPrimaryRole()).toBe(false);
    });

    it('should identify support roles correctly', () => {
      // Given
      const supportRole = ProfessionalRole.create({
        code: 'ADMIN',
        name: 'Admin',
        displayName: 'Administrateur',
        category: 'SUPPORT',
        description: 'Administrateur du système',
      });

      const primaryRole = ProfessionalRole.create({
        code: 'PRIMARY',
        name: 'Primary',
        displayName: 'Rôle Principal',
        category: 'PRIMARY',
        description: 'Rôle principal du professionnel',
      });

      // When & Then
      expect(supportRole.isSupportRole()).toBe(true);
      expect(primaryRole.isSupportRole()).toBe(false);
    });

    it('should identify management roles correctly', () => {
      // Given
      const managementRole = ProfessionalRole.create({
        code: 'MANAGER',
        name: 'Manager',
        displayName: 'Gestionnaire',
        category: 'MANAGEMENT',
        description: 'Rôle de gestion',
      });

      const supportRole = ProfessionalRole.create({
        code: 'ASSISTANT',
        name: 'Assistant',
        displayName: 'Assistant',
        category: 'SUPPORT',
        description: 'Assistant administratif',
      });

      // When & Then
      expect(managementRole.isManagementRole()).toBe(true);
      expect(supportRole.isManagementRole()).toBe(false);
    });
  });

  describe('Status Management', () => {
    it('should deactivate role', () => {
      // Given
      const professionalRole = ProfessionalRole.create({
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      });

      // When
      professionalRole.deactivate();

      // Then
      expect(professionalRole.getIsActive()).toBe(false);
    });

    it('should activate role', () => {
      // Given
      const professionalRole = ProfessionalRole.create({
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      });

      professionalRole.deactivate();

      // When
      professionalRole.activate();

      // Then
      expect(professionalRole.getIsActive()).toBe(true);
    });
  });

  describe('Update Functionality', () => {
    it('should update role properties', () => {
      // Given
      const professionalRole = ProfessionalRole.create({
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      });

      const updateData = {
        displayName: 'Spécialiste Mis à Jour',
        description: 'Description mise à jour du professionnel spécialisé',
        canLead: true,
      };

      // When
      professionalRole.update(updateData);

      // Then
      expect(professionalRole.getName()).toBe('Specialist'); // Name ne change pas car readonly
      expect(professionalRole.getDisplayName()).toBe('Spécialiste Mis à Jour');
      expect(professionalRole.getDescription()).toBe(
        'Description mise à jour du professionnel spécialisé',
      );
      expect(professionalRole.getCanLead()).toBe(true);
      expect(professionalRole.getUpdatedAt()).toBeInstanceOf(Date);
    });
  });

  describe('Validation Method', () => {
    it('should return true for valid professional role', () => {
      // Given
      const professionalRole = ProfessionalRole.create({
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
      });

      // When & Then
      expect(professionalRole.isValid()).toBe(true);
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON correctly', () => {
      // Given
      const professionalRole = ProfessionalRole.create({
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
        canLead: true,
      });

      // When
      const json = professionalRole.toJSON();

      // Then
      expect(json).toMatchObject({
        id: professionalRole.getId(),
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER',
        description: 'Professionnel spécialisé dans un domaine particulier',
        canLead: true,
        isActive: true,
        createdAt: professionalRole.getCreatedAt().toISOString(),
        updatedAt: professionalRole.getUpdatedAt().toISOString(),
      });
    });
  });

  describe('Reconstruct Method', () => {
    it('should reconstruct from persistence data', () => {
      // Given
      const persistenceData = {
        id: 'test-id',
        code: 'SPECIALIST',
        name: 'Specialist',
        displayName: 'Spécialiste',
        category: 'SERVICE_PROVIDER' as string,
        description: 'Professionnel spécialisé dans un domaine particulier',
        canLead: true,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      // When
      const professionalRole = ProfessionalRole.reconstruct(persistenceData);

      // Then
      expect(professionalRole.getId()).toBe('test-id');
      expect(professionalRole.getCode()).toBe('SPECIALIST');
      expect(professionalRole.getName()).toBe('Specialist');
      expect(professionalRole.getDisplayName()).toBe('Spécialiste');
      expect(professionalRole.getCategory()).toBe('SERVICE_PROVIDER');
      expect(professionalRole.getDescription()).toBe(
        'Professionnel spécialisé dans un domaine particulier',
      );
      expect(professionalRole.getCanLead()).toBe(true);
      expect(professionalRole.getIsActive()).toBe(true);
      expect(professionalRole.getCreatedAt()).toEqual(new Date('2024-01-01'));
      expect(professionalRole.getUpdatedAt()).toEqual(new Date('2024-01-01'));
    });
  });
});
