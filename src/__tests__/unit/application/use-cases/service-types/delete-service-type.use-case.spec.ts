/**
 * 🧪 DELETE SERVICE TYPE USE CASE - TESTS TDD COMPLETS
 *
 * ✅ Tests couvrant tous les scénarios métier :
 * - Validation des paramètres d'entrée
 * - Vérification existence du ServiceType
 * - Règles métier (suppression interdite si utilisé)
 * - Logging et audit complets
 * - Gestion des erreurs et exceptions
 *
 * 🎯 Architecture : Clean Architecture + TDD strict
 * 📊 Couverture : 100% des cas d'usage métier
 */

import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { DeleteServiceTypeUseCase } from '@application/use-cases/service-types/delete-service-type.use-case';
import { ServiceType } from '@domain/entities/service-type.entity';
import {
  ServiceTypeInUseError,
  ServiceTypeNotFoundError,
} from '@domain/exceptions/service-type.exceptions';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

/**
 * 📋 Interfaces de requête et réponse
 */
interface DeleteServiceTypeRequest {
  readonly serviceTypeId: ServiceTypeId;
  readonly businessId: BusinessId;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

interface DeleteServiceTypeResponse {
  readonly success: boolean;
  readonly message: string;
  readonly deletedAt: Date;
}

describe('DeleteServiceTypeUseCase', () => {
  let useCase: DeleteServiceTypeUseCase;
  let mockRepository: jest.Mocked<IServiceTypeRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // 🧪 Test data setup
  const validServiceTypeId = ServiceTypeId.fromString(
    'e8f8c8c0-3b0a-4b8f-8c8c-0a4b8f8c8c0e',
  );
  const validBusinessId = BusinessId.create(
    '550e8400-e29b-41d4-a716-446655440000',
  );
  const validRequestingUserId = 'a1b2c3d4-e5f6-4890-abcd-ef1234567890';
  const validCorrelationId = 'corr-456';

  beforeEach(() => {
    // 🎭 Mock repository
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      findByBusinessIdAndName: jest.fn(),
      findByBusinessIdAndCode: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      search: jest.fn(),
      existsByBusinessIdAndCode: jest.fn(),
      existsByBusinessIdAndName: jest.fn(),
      countByBusinessId: jest.fn(),
      countActiveByBusinessId: jest.fn(),
      isReferencedByServices: jest.fn(),
      findByBusinessIdOrderedBySortOrder: jest.fn(),
      updateSortOrders: jest.fn(),
    } as jest.Mocked<IServiceTypeRepository>; // 🎭 Mock logger
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    } as jest.Mocked<Logger>;

    // 🎭 Mock i18n
    mockI18n = {
      translate: jest
        .fn()
        .mockImplementation((key: string) => `translated.${key}`),
      t: jest.fn().mockImplementation((key: string) => `translated.${key}`),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    } as jest.Mocked<I18nService>;

    // 🏗️ Instancier le Use Case
    useCase = new DeleteServiceTypeUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('🎯 Use Case Execution', () => {
    it('should delete service type successfully when not in use', async () => {
      // Given
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Consultation Type',
        code: 'CONSULT',
        description: 'Standard consultation',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      // Setup mocks
      mockRepository.findById.mockResolvedValue(mockServiceType);
      mockRepository.isReferencedByServices.mockResolvedValue(false);
      mockRepository.delete.mockResolvedValue();

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.success).toBe(true);
      expect(result.deletedServiceTypeId).toBe(validServiceTypeId.getValue());
      expect(mockRepository.findById).toHaveBeenCalledWith(validServiceTypeId);
      expect(mockRepository.isReferencedByServices).toHaveBeenCalledWith(
        validServiceTypeId,
      );
      expect(mockRepository.delete).toHaveBeenCalledWith(validServiceTypeId);
    });

    it('should throw error when service type not found', async () => {
      // Given
      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeNotFoundError,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(validServiceTypeId);
      expect(mockRepository.isReferencedByServices).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw error when service type is in use', async () => {
      // Given
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'In Use Service Type',
        code: 'INUSE',
        description: 'Service type currently in use',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);
      mockRepository.isReferencedByServices.mockResolvedValue(true);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeInUseError,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(validServiceTypeId);
      expect(mockRepository.isReferencedByServices).toHaveBeenCalledWith(
        validServiceTypeId,
      );
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it('should validate service type belongs to business', async () => {
      // Given
      const differentBusinessId = BusinessId.create(
        '12345678-1234-4567-8901-234567890abc',
      );
      const mockServiceType = ServiceType.create({
        businessId: differentBusinessId,
        name: 'Different Business Type',
        code: 'DIFFBIZ',
        description: 'Service type from different business',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeNotFoundError,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(validServiceTypeId);
      expect(mockRepository.isReferencedByServices).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('🔍 Input Validation', () => {
    it('should throw error for invalid service type ID', async () => {
      // Given
      const request = {
        serviceTypeId: null as any,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for invalid business ID', async () => {
      // Given
      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: null as any,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for empty requesting user ID', async () => {
      // Given
      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: '',
        correlationId: validCorrelationId,
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw error for empty correlation ID', async () => {
      // Given
      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: '',
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });
  });

  describe('📊 Logging & Audit', () => {
    it('should log deletion attempt', async () => {
      // Given
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Test Service Type',
        code: 'TEST',
        description: 'Test description',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);
      mockRepository.isReferencedByServices.mockResolvedValue(false);
      mockRepository.delete.mockResolvedValue();

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to delete service type',
        expect.objectContaining({
          serviceTypeId: validServiceTypeId.getValue(),
          businessId: validBusinessId.getValue(),
          requestingUserId: validRequestingUserId,
          correlationId: validCorrelationId,
        }),
      );
    });

    it('should log successful deletion', async () => {
      // Given
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Test Service Type',
        code: 'TEST',
        description: 'Test description',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);
      mockRepository.isReferencedByServices.mockResolvedValue(false);
      mockRepository.delete.mockResolvedValue();

      // When
      await useCase.execute(request);

      // Then
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service type deleted successfully',
        expect.objectContaining({
          serviceTypeId: validServiceTypeId.getValue(),
          businessId: validBusinessId.getValue(),
          correlationId: validCorrelationId,
        }),
      );
    });

    it('should log errors when deletion fails', async () => {
      // Given
      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      const error = new Error('Repository error');
      mockRepository.findById.mockRejectedValue(error);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to delete service type',
        error,
        expect.objectContaining({
          serviceTypeId: validServiceTypeId.getValue(),
          businessId: validBusinessId.getValue(),
          error: error.message,
          correlationId: validCorrelationId,
        }),
      );
    });
  });

  describe('🌐 Repository Interaction', () => {
    it('should call repository methods with correct parameters', async () => {
      // Given
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Repository Test Type',
        code: 'REPOTEST',
        description: 'Testing repository interactions',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);
      mockRepository.isReferencedByServices.mockResolvedValue(false);
      mockRepository.delete.mockResolvedValue();

      // When
      await useCase.execute(request);

      // Then
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockRepository.findById).toHaveBeenCalledWith(validServiceTypeId);
      expect(mockRepository.isReferencedByServices).toHaveBeenCalledTimes(1);
      expect(mockRepository.isReferencedByServices).toHaveBeenCalledWith(
        validServiceTypeId,
      );
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockRepository.delete).toHaveBeenCalledWith(validServiceTypeId);
    });

    it('should handle repository errors gracefully', async () => {
      // Given
      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      const repositoryError = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to delete service type',
        repositoryError,
        expect.objectContaining({
          error: repositoryError.message,
        }),
      );
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle concurrent deletion attempts gracefully', async () => {
      // Given - Service type existe mais est supprimé entre la vérification et la suppression
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Concurrent Test',
        code: 'CONCURRENT',
        description: 'Testing concurrent operations',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);
      mockRepository.isReferencedByServices.mockResolvedValue(false);
      mockRepository.delete.mockRejectedValue(new Error('Record not found')); // Concurrence

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Record not found',
      );
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle service type becoming in use during deletion process', async () => {
      // Given
      const mockServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Race Condition Test',
        code: 'RACE',
        description: 'Testing race conditions',
        isActive: true,
        sortOrder: 1,
        createdBy: 'user-123',
      });

      const request: DeleteServiceTypeRequest = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: validCorrelationId,
      };

      mockRepository.findById.mockResolvedValue(mockServiceType);
      // Simule qu'il devient référencé pendant la vérification
      mockRepository.isReferencedByServices.mockResolvedValueOnce(true);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeInUseError,
      );
      expect(mockRepository.isReferencedByServices).toHaveBeenCalledTimes(1);
    });
  });
});
