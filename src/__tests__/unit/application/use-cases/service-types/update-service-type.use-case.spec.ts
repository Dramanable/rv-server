// 🧪 UpdateServiceTypeUseCase - Test Spec avec TDD Strict
// Suit le pattern Clean Architecture + TDD de l'équipe

import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { UpdateServiceTypeUseCase } from '@application/use-cases/service-types/update-service-type.use-case';
import { ServiceType } from '@domain/entities/service-type.entity';
import {
  ServiceTypeAlreadyExistsError,
  ServiceTypeNotFoundError,
} from '@domain/exceptions/service-type.exceptions';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

describe('UpdateServiceTypeUseCase', () => {
  let useCase: UpdateServiceTypeUseCase;
  let mockRepository: jest.Mocked<IServiceTypeRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Test data constants with valid UUIDs
  const validBusinessId = BusinessId.fromString(
    '550e8400-e29b-41d4-a716-446655440000',
  );
  const validServiceTypeId = ServiceTypeId.fromString(
    '550e8400-e29b-41d4-a716-446655440001',
  );
  const validRequestingUserId = '550e8400-e29b-41d4-a716-446655440002';
  const correlationId = '550e8400-e29b-41d4-a716-446655440003';

  beforeEach(() => {
    // Arrange: Mock dependencies
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      hardDelete: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByBusinessIdAndCode: jest.fn(),
      findByBusinessIdAndName: jest.fn(),
      existsByBusinessIdAndCode: jest.fn(),
      existsByBusinessIdAndName: jest.fn(),
      search: jest.fn(),
      countByBusinessId: jest.fn(),
      countActiveByBusinessId: jest.fn(),
      isReferencedByServices: jest.fn(),
      findByBusinessIdOrderedBySortOrder: jest.fn(),
      updateSortOrders: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    mockI18n = {
      translate: jest
        .fn()
        .mockImplementation((key: string) => `Translated: ${key}`),
      t: jest.fn().mockImplementation((key: string) => `Translated: ${key}`),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    useCase = new UpdateServiceTypeUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('🎯 Use Case Execution', () => {
    it('should update service type successfully with all fields', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Old Name',
        code: 'OLD_CODE',
        description: 'Old description',
        createdBy: validRequestingUserId,
      });

      const updatedServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'New Name',
        code: 'NEW_CODE',
        description: 'New description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(updatedServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'New Name',
        code: 'NEW_CODE',
        description: 'New description',
        isActive: true,
        sortOrder: 10,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceType).toBeDefined();
      expect(result.serviceType.getName()).toBe('New Name');
      expect(mockRepository.save).toHaveBeenCalledWith(existingServiceType);
    });

    it('should update service type with partial data', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name', // Only updating name
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceType).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalledWith(existingServiceType);
    });

    it('should throw error when service type not found', async () => {
      // Arrange
      mockRepository.findById.mockResolvedValue(null);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'New Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeNotFoundError,
      );
      expect(mockI18n.translate).toHaveBeenCalledWith('serviceType.notFound', {
        id: validServiceTypeId.getValue(),
      });
    });

    it('should throw error when code already exists for different service type', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(true);
      mockRepository.findByBusinessIdAndCode.mockResolvedValue(
        ServiceType.create({
          businessId: validBusinessId,
          name: 'Other Service Type',
          code: 'NEW_CODE',
          description: 'Other description',
          createdBy: validRequestingUserId,
        }),
      );

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        code: 'NEW_CODE',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeAlreadyExistsError,
      );
    });

    it('should throw error when name already exists for different service type', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.existsByBusinessIdAndName.mockResolvedValue(true);
      mockRepository.findByBusinessIdAndName.mockResolvedValue(
        ServiceType.create({
          businessId: validBusinessId,
          name: 'New Name',
          code: 'OTHER',
          description: 'Other description',
          createdBy: validRequestingUserId,
        }),
      );

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'New Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeAlreadyExistsError,
      );
    });

    it('should allow updating with same code/name (no change)', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(true);
      mockRepository.findByBusinessIdAndCode.mockResolvedValue(
        existingServiceType,
      ); // Same service type
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        code: 'EXISTING', // Same code
        description: 'Updated description',
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceType).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('🔍 Input Validation', () => {
    it('should throw error for invalid service type ID', async () => {
      // Arrange
      const request = {
        serviceTypeId: 'invalid-uuid' as any,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Test Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for invalid business ID', async () => {
      // Arrange
      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: 'invalid-uuid' as any,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Test Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for empty requesting user ID', async () => {
      // Arrange
      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: '',
        correlationId,
        name: 'Test Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for empty correlation ID', async () => {
      // Arrange
      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: '',
        name: 'Test Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error when no update fields are provided', async () => {
      // Arrange
      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        // No update fields provided
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('📊 Logging & Audit', () => {
    it('should log update attempt', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name',
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith('Updating service type', {
        serviceTypeId: validServiceTypeId.getValue(),
        businessId: validBusinessId.getValue(),
        requestingUserId: validRequestingUserId,
        correlationId,
      });
    });

    it('should log successful update', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name',
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service type updated successfully',
        {
          serviceTypeId: validServiceTypeId.getValue(),
          businessId: validBusinessId.getValue(),
          correlationId,
        },
      );
    });

    it('should log errors when update fails', async () => {
      // Arrange
      const error = new Error('Repository error');
      mockRepository.findById.mockRejectedValue(error);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update service type',
        error,
        {
          serviceTypeId: validServiceTypeId.getValue(),
          error: error.message,
          correlationId,
        },
      );
    });
  });

  describe('🌐 Repository Interaction', () => {
    it('should call repository methods with correct parameters', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.existsByBusinessIdAndCode.mockResolvedValue(false);
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name',
        code: 'UPDATED_CODE',
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockRepository.findById).toHaveBeenCalledWith(validServiceTypeId);
      expect(mockRepository.existsByBusinessIdAndCode).toHaveBeenCalledWith(
        validBusinessId,
        'UPDATED_CODE',
      );
      expect(mockRepository.save).toHaveBeenCalledWith(existingServiceType);
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockRepository.findById.mockRejectedValue(repositoryError);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle update with minimal required fields only', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Minimal Update', // Only required field
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceType).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should handle empty optional fields gracefully', async () => {
      // Arrange
      const existingServiceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Existing Name',
        code: 'EXISTING',
        description: 'Existing description',
        createdBy: validRequestingUserId,
      });

      mockRepository.findById.mockResolvedValue(existingServiceType);
      mockRepository.save.mockResolvedValue(existingServiceType);

      const request = {
        serviceTypeId: validServiceTypeId,
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        name: 'Updated Name',
        description: '', // Empty optional field
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceType).toBeDefined();
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
