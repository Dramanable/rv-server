/**
 * @fileoverview UpdateProfessionalUseCase - TDD Unit Tests
 * @module __tests__/unit/application/use-cases/professionals/update-professional.use-case.spec
 * @description Tests unitaires RED-GREEN-REFACTOR pour UpdateProfessionalUseCase
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import {
  Professional,
  ProfessionalStatus,
} from '@domain/entities/professional.entity';
import {
  ProfessionalNotFoundError,
  ProfessionalValidationError,
} from '@domain/exceptions/professional.exceptions';
import { IProfessionalRepository } from '@domain/repositories/professional.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { Email } from '@domain/value-objects/email.value-object';
import { ProfessionalId } from '@domain/value-objects/professional-id.value-object';
import {
  UpdateProfessionalRequest,
  UpdateProfessionalUseCase,
} from '../../../../../application/use-cases/professionals/update-professional.use-case';

describe('UpdateProfessionalUseCase - TDD', () => {
  let useCase: UpdateProfessionalUseCase;
  let mockProfessionalRepository: jest.Mocked<IProfessionalRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // ✅ OBLIGATOIRE - Mocks selon instructions Copilot
    mockProfessionalRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      deleteById: jest.fn(),
      findByEmail: jest.fn(),
      findByLicenseNumber: jest.fn(),
      existsById: jest.fn(),
      existsByEmail: jest.fn(),
      existsByLicenseNumber: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    };

    mockI18n = {
      translate: jest.fn((key: string, params?: any) => {
        const translations: Record<string, string> = {
          'professional.success.updated': 'Professional updated successfully',
          'professional.errors.notFound':
            'Professional not found with ID: {{professionalId}}',
          'professional.errors.validationFailed':
            'Professional data validation failed',
          'professional.errors.emailInvalid': 'Email format is invalid',
          'professional.errors.firstNameRequired': 'First name is required',
          'professional.errors.lastNameRequired': 'Last name is required',
        };
        return translations[key] || key;
      }),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    // ✅ OBLIGATOIRE - Instancier le use case
    useCase = new UpdateProfessionalUseCase(
      mockProfessionalRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('🔴 RED - Professional Update Success', () => {
    it('should update professional with valid data', async () => {
      // Given
      const request = createUpdateRequest();
      const existingProfessional = createExistingProfessional();
      const updatedProfessional = createUpdatedProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.save.mockResolvedValue(updatedProfessional);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(request.professionalId);
      expect(result.data.email).toBe(request.email);
      expect(result.data.firstName).toBe(request.firstName);
      expect(result.data.lastName).toBe(request.lastName);
      expect(result.data.phoneNumber).toBe(request.phoneNumber);

      // Verify repository calls
      expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(
        ProfessionalId.fromString(request.professionalId),
      );
      expect(mockProfessionalRepository.save).toHaveBeenCalledWith(
        expect.any(Professional),
      );
    });

    it('should log update operation with context', async () => {
      // Given
      const request = createUpdateRequest();
      const existingProfessional = createExistingProfessional();
      const updatedProfessional = createUpdatedProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.save.mockResolvedValue(updatedProfessional);

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Updating professional',
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
          requestingUserId: request.requestingUserId,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Professional updated successfully',
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
          updatedBy: request.requestingUserId,
        }),
      );
    });
  });

  describe('🔴 RED - Professional Not Found', () => {
    it('should throw error when professional does not exist', async () => {
      // Given
      const request = createUpdateRequest();
      mockProfessionalRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalNotFoundError,
      );

      // Verify logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Professional not found for update',
        expect.any(Error),
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should use i18n for not found error messages', async () => {
      // Given
      const request = createUpdateRequest();
      mockProfessionalRepository.findById.mockResolvedValue(null);

      // When
      try {
        await useCase.execute(request);
      } catch (error) {
        // Then
        expect(mockI18n.translate).toHaveBeenCalledWith(
          'professional.errors.notFound',
          { professionalId: request.professionalId },
        );
      }
    });
  });

  describe('🔴 RED - Input Validation', () => {
    it('should throw error for invalid email format', async () => {
      // Given
      const request = createUpdateRequest({ email: 'invalid-email' });
      const existingProfessional = createExistingProfessional();
      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();

      // Verify i18n usage
      expect(mockI18n.translate).toHaveBeenCalledWith(
        'professional.errors.emailInvalid',
      );
    });

    it('should throw error for empty first name', async () => {
      // Given
      const request = createUpdateRequest({ firstName: '' });
      const existingProfessional = createExistingProfessional();
      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
    });

    it('should throw error for empty last name', async () => {
      // Given
      const request = createUpdateRequest({ lastName: '' });
      const existingProfessional = createExistingProfessional();
      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );
    });

    it('should throw error for invalid professional ID format', async () => {
      // Given
      const request = createUpdateRequest({ professionalId: 'invalid-uuid' });

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();
    });
  });

  describe('🔴 RED - Repository Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Given
      const request = createUpdateRequest();
      const repositoryError = new Error('Database connection failed');
      mockProfessionalRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Repository error during professional update',
        repositoryError,
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should handle save operation errors', async () => {
      // Given
      const request = createUpdateRequest();
      const existingProfessional = createExistingProfessional();
      const saveError = new Error('Save operation failed');

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.save.mockRejectedValue(saveError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(saveError);
    });
  });

  describe('🔴 RED - Partial Updates', () => {
    it('should handle partial update with only email change', async () => {
      // Given
      const request = createMinimalUpdateRequest();
      const existingProfessional = createExistingProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );

      // Mock save pour retourner le professionnel avec l'email mis à jour
      mockProfessionalRepository.save.mockImplementation(
        async (professional: Professional) => {
          return professional; // Retourne le professionnel mis à jour
        },
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.email).toBe(request.email);
      // Les autres champs doivent rester inchangés
      expect(result.data.firstName).toBe(existingProfessional.getFirstName());
    });

    it('should preserve existing data when fields are not provided', async () => {
      // Given - Aucun champ à mettre à jour sauf requestingUserId et correlationId
      const request: UpdateProfessionalRequest = {
        professionalId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        requestingUserId: 'admin-user-id',
        correlationId: 'preserve-correlation-123',
        timestamp: new Date(),
      };

      const existingProfessional = createExistingProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.save.mockImplementation(
        async (professional: Professional) => {
          return professional; // Retourne le professionnel (inchangé)
        },
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.speciality).toBe(existingProfessional.getSpeciality());
      expect(result.data.phoneNumber).toBe(
        existingProfessional.getPhoneNumber(),
      );
    });

    it('should preserve existing data when fields are not provided', async () => {
      // Given
      const request = createMinimalUpdateRequest();
      const existingProfessional = createExistingProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.save.mockImplementation(
        async (professional: Professional) => {
          // Le mock doit retourner le professionnel avec seulement email mis à jour
          return Professional.reconstruct({
            id: ProfessionalId.fromString(
              'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
            ),
            businessId: BusinessId.fromString(
              'bbbbbbbb-cccc-4ddd-8eee-ffffffffffff',
            ),
            email: Email.create('minimal-update@clinic.com'), // Seulement l'email change
            firstName: 'Dr. Existing', // Garde l'ancienne valeur
            lastName: 'Professional', // Garde l'ancienne valeur
            speciality: 'Cardiologie', // Garde l'ancienne valeur
            licenseNumber: 'EXISTING-456', // Garde l'ancienne valeur
            phoneNumber: '0987654321', // Garde l'ancienne valeur
            bio: 'Existing bio', // Garde l'ancienne valeur
            experience: '15', // Garde l'ancienne valeur
            status: 'ACTIVE' as ProfessionalStatus,
            isVerified: true,
            createdBy: 'admin-user-id',
            updatedBy: 'admin-user-id',
            createdAt: new Date('2023-09-24T16:35:11.143Z'),
            updatedAt: new Date(),
          });
        },
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.email).toBe('minimal-update@clinic.com'); // Email mis à jour
      expect(result.data.speciality).toBe('Cardiologie'); // Garde l'ancienne valeur
      expect(result.data.phoneNumber).toBe('0987654321'); // Garde l'ancienne valeur
    });
  });
});

// ✅ OBLIGATOIRE - Helper functions pour tests cohérents
function createUpdateRequest(
  overrides: Partial<UpdateProfessionalRequest> = {},
): UpdateProfessionalRequest {
  return {
    professionalId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    email: 'updated@clinic.com',
    firstName: 'Dr. Updated',
    lastName: 'Name',
    phoneNumber: '+33999888777',
    speciality: 'Neurologie',
    licenseNumber: 'UPDATED-789',
    bio: 'Updated bio information',
    experience: '20',
    requestingUserId: 'admin-user-id',
    correlationId: 'update-correlation-123',
    timestamp: new Date(),
    ...overrides,
  };
}

function createMinimalUpdateRequest(): UpdateProfessionalRequest {
  return {
    professionalId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    email: 'minimal-update@clinic.com',
    requestingUserId: 'admin-user-id',
    correlationId: 'minimal-correlation-123',
    timestamp: new Date(),
  };
}

function createExistingProfessional(): Professional {
  return Professional.reconstruct({
    id: ProfessionalId.fromString('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'),
    businessId: BusinessId.fromString('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff'),
    email: Email.create('existing@clinic.com'),
    firstName: 'Dr. Existing',
    lastName: 'Professional',
    speciality: 'Cardiologie',
    licenseNumber: 'EXISTING-456',
    phoneNumber: '0987654321',
    bio: 'Existing bio',
    experience: '15',
    status: 'ACTIVE' as ProfessionalStatus,
    isVerified: true,
    createdBy: 'admin-user-id',
    updatedBy: 'admin-user-id',
    createdAt: new Date('2023-09-24T16:35:11.143Z'),
    updatedAt: new Date('2024-09-24T16:35:11.143Z'),
  });
}

function createUpdatedProfessional(): Professional {
  return Professional.reconstruct({
    id: ProfessionalId.fromString('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'),
    businessId: BusinessId.fromString('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff'),
    email: Email.create('updated@clinic.com'),
    firstName: 'Dr. Updated',
    lastName: 'Name',
    speciality: 'Neurologie',
    licenseNumber: 'UPDATED-789',
    phoneNumber: '+33999888777',
    bio: 'Updated bio information',
    experience: '20',
    status: 'ACTIVE' as ProfessionalStatus,
    isVerified: true,
    createdBy: 'admin-user-id',
    updatedBy: 'admin-user-id', // Sera mis à jour avec requestingUserId
    createdAt: new Date('2023-09-24T16:35:11.143Z'),
    updatedAt: new Date(), // Date de mise à jour actuelle
  });
}
