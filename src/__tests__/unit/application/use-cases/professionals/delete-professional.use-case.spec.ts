/**
 * @fileoverview DeleteProfessionalUseCase Unit Tests
 * @module __tests__/unit/application/use-cases/professionals/delete-professional.use-case.spec
 * @description Tests unitaires TDD pour DeleteProfessionalUseCase selon Clean Architecture
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { DeleteProfessionalUseCase } from '@application/use-cases/professionals/delete-professional.use-case';
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

describe('DeleteProfessionalUseCase - TDD', () => {
  let useCase: DeleteProfessionalUseCase;
  let mockProfessionalRepository: jest.Mocked<IProfessionalRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // ✅ OBLIGATOIRE - Mocks avec types Jest appropriés
    mockProfessionalRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      deleteById: jest.fn(),
      findByEmail: jest.fn(),
      findByLicenseNumber: jest.fn(),
      findAll: jest.fn(),
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
      translate: jest
        .fn()
        .mockImplementation((key: string) => `translated_${key}`),
      t: jest.fn().mockImplementation((key: string) => `translated_${key}`),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    // ✅ Use Case avec dépendances mockées
    useCase = new DeleteProfessionalUseCase(
      mockProfessionalRepository,
      mockLogger,
      mockI18n,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('🔴 RED - Professional Delete Success', () => {
    it('should delete professional successfully', async () => {
      // Given
      const request = createDeleteRequest();
      const existingProfessional = createExistingProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.deleteById.mockResolvedValue(undefined);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.data.deleted).toBe(true);
      expect(result.data.professionalId).toBe(request.professionalId);

      // Verify repository calls
      expect(mockProfessionalRepository.findById).toHaveBeenCalledWith(
        ProfessionalId.fromString(request.professionalId),
      );
      expect(mockProfessionalRepository.deleteById).toHaveBeenCalledWith(
        ProfessionalId.fromString(request.professionalId),
      );
    });

    it('should log delete operation with context', async () => {
      // Given
      const request = createDeleteRequest();
      const existingProfessional = createExistingProfessional();

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.deleteById.mockResolvedValue(undefined);

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Deleting professional',
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
          requestingUserId: request.requestingUserId,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Professional deleted successfully',
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
          deletedBy: request.requestingUserId,
        }),
      );
    });
  });

  describe('🔴 RED - Professional Not Found', () => {
    it('should throw error when professional does not exist', async () => {
      // Given
      const request = createDeleteRequest();
      mockProfessionalRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalNotFoundError,
      );

      // Verify logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Professional not found for deletion',
        expect.any(Error),
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should use i18n for not found error messages', async () => {
      // Given
      const request = createDeleteRequest();
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
    it('should throw error for invalid professional ID format', async () => {
      // Given
      const request = createDeleteRequest({ professionalId: 'invalid-uuid' });

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Invalid professional ID format',
        expect.any(Error),
        expect.objectContaining({
          professionalId: 'invalid-uuid',
          correlationId: request.correlationId,
        }),
      );
    });

    it('should validate required context fields', async () => {
      // Given
      const requestWithoutCorrelationId = {
        professionalId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
        requestingUserId: 'admin-user-id',
        timestamp: new Date(),
      } as any; // Force type pour test validation

      // When & Then
      await expect(
        useCase.execute(requestWithoutCorrelationId),
      ).rejects.toThrow();
    });
  });

  describe('🔴 RED - Repository Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Given
      const request = createDeleteRequest();
      const repositoryError = new Error('Database connection failed');
      mockProfessionalRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Repository error during professional deletion',
        repositoryError,
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should handle delete operation errors', async () => {
      // Given
      const request = createDeleteRequest();
      const existingProfessional = createExistingProfessional();
      const deleteError = new Error('Delete operation failed');

      mockProfessionalRepository.findById.mockResolvedValue(
        existingProfessional,
      );
      mockProfessionalRepository.deleteById.mockRejectedValue(deleteError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(deleteError);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Repository error during professional deletion',
        deleteError,
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });
  });

  describe('🔴 RED - Business Rules', () => {
    it('should prevent deletion of active professionals with appointments', async () => {
      // Given
      const request = createDeleteRequest();
      const activeProfessional = createActiveProfessionalWithAppointments();

      mockProfessionalRepository.findById.mockResolvedValue(activeProfessional);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ProfessionalValidationError,
      );

      // Verify business rule logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Cannot delete professional with active appointments',
        undefined,
        expect.objectContaining({
          professionalId: request.professionalId,
          correlationId: request.correlationId,
        }),
      );
    });

    it('should use i18n for business rule violations', async () => {
      // Given
      const request = createDeleteRequest();
      const activeProfessional = createActiveProfessionalWithAppointments();

      mockProfessionalRepository.findById.mockResolvedValue(activeProfessional);

      // When
      try {
        await useCase.execute(request);
      } catch (error) {
        // Then
        expect(mockI18n.translate).toHaveBeenCalledWith(
          'professional.errors.cannotDeleteWithAppointments',
          { professionalId: request.professionalId },
        );
      }
    });
  });
});

// ✅ OBLIGATOIRE - Helper functions pour tests cohérents
function createDeleteRequest(overrides: any = {}): any {
  return {
    professionalId: 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    requestingUserId: 'admin-user-id',
    correlationId: 'delete-correlation-123',
    timestamp: new Date(),
    ...overrides,
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
    status: 'INACTIVE' as ProfessionalStatus,
    isVerified: true,
    createdBy: 'admin-user-id',
    updatedBy: 'admin-user-id',
    createdAt: new Date('2023-09-24T16:35:11.143Z'),
    updatedAt: new Date('2024-09-24T16:35:11.143Z'),
  });
}

function createActiveProfessionalWithAppointments(): Professional {
  const professional = Professional.reconstruct({
    id: ProfessionalId.fromString('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee'),
    businessId: BusinessId.fromString('bbbbbbbb-cccc-4ddd-8eee-ffffffffffff'),
    email: Email.create('active@clinic.com'),
    firstName: 'Dr. Active',
    lastName: 'Professional',
    speciality: 'Cardiologie',
    licenseNumber: 'ACTIVE-789',
    phoneNumber: '0987654321',
    bio: 'Active professional',
    experience: '20',
    status: 'ACTIVE' as ProfessionalStatus,
    isVerified: true,
    createdBy: 'admin-user-id',
    updatedBy: 'admin-user-id',
    createdAt: new Date('2023-09-24T16:35:11.143Z'),
    updatedAt: new Date('2024-09-24T16:35:11.143Z'),
  });

  // ✅ TODO : Simuler l'existence de rendez-vous actifs
  // Cette logique sera implémentée quand on aura les entités Appointment
  (professional as any).hasActiveAppointments = true;

  return professional;
}
