// 🧪 ListServiceTypesUseCase - Test Spec avec TDD Strict
// Suit le pattern Clean Architecture + TDD de l'équipe

import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { ListServiceTypesUseCase } from '@application/use-cases/service-types/list-service-types.use-case';
import { ServiceType } from '@domain/entities/service-type.entity';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';

describe('ListServiceTypesUseCase', () => {
  let useCase: ListServiceTypesUseCase;
  let mockRepository: jest.Mocked<IServiceTypeRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Test data constants with valid UUIDs
  const validBusinessId = BusinessId.fromString(
    '550e8400-e29b-41d4-a716-446655440000',
  );
  const validRequestingUserId = '550e8400-e29b-41d4-a716-446655440001';
  const correlationId = '550e8400-e29b-41d4-a716-446655440002';

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

    useCase = new ListServiceTypesUseCase(mockRepository, mockLogger, mockI18n);
  });

  describe('🎯 Use Case Execution', () => {
    it('should list service types successfully', async () => {
      // Arrange
      const serviceTypes = [
        ServiceType.create({
          businessId: validBusinessId,
          name: 'Standard Appointment',
          code: 'STANDARD',
          description: 'Standard appointment type',
          createdBy: validRequestingUserId,
        }),
        ServiceType.create({
          businessId: validBusinessId,
          name: 'Emergency Appointment',
          code: 'EMERGENCY',
          description: 'Emergency appointment type',
          createdBy: validRequestingUserId,
        }),
      ];

      mockRepository.findByBusinessId.mockResolvedValue(serviceTypes);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceTypes).toHaveLength(2);
      expect(result.serviceTypes[0].getName()).toBe('Standard Appointment');
      expect(result.serviceTypes[1].getName()).toBe('Emergency Appointment');
      expect(result.totalCount).toBe(2);
    });

    it('should return empty list when no service types exist', async () => {
      // Arrange
      mockRepository.findByBusinessId.mockResolvedValue([]);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceTypes).toHaveLength(0);
      expect(result.totalCount).toBe(0);
    });

    it('should filter only active service types when specified', async () => {
      // Arrange
      const serviceTypes = [
        ServiceType.create({
          businessId: validBusinessId,
          name: 'Active Type',
          code: 'ACTIVE',
          description: 'Active type',
          createdBy: validRequestingUserId,
        }),
      ];

      // Make one inactive
      const inactiveType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Inactive Type',
        code: 'INACTIVE',
        description: 'Inactive type',
        createdBy: validRequestingUserId,
      });
      inactiveType.deactivate(validRequestingUserId);

      mockRepository.findByBusinessId.mockResolvedValue([
        serviceTypes[0],
        inactiveType,
      ]);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
        filters: {
          isActive: true,
        },
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceTypes).toHaveLength(1);
      expect(result.serviceTypes[0].getName()).toBe('Active Type');
      expect(result.totalCount).toBe(1);
    });
  });

  describe('🔍 Input Validation', () => {
    it('should throw error for invalid business ID', async () => {
      // Arrange
      const request = {
        businessId: 'invalid-uuid' as any,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for empty requesting user ID', async () => {
      // Arrange
      const request = {
        businessId: validBusinessId,
        requestingUserId: '',
        correlationId,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw error for empty correlation ID', async () => {
      // Arrange
      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId: '',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('📊 Logging & Audit', () => {
    it('should log successful retrieval', async () => {
      // Arrange
      mockRepository.findByBusinessId.mockResolvedValue([]);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Listing service types for business',
        {
          businessId: validBusinessId.getValue(),
          requestingUserId: validRequestingUserId,
          correlationId,
        },
      );
    });

    it('should log successful completion with count', async () => {
      // Arrange
      const serviceTypes = [
        ServiceType.create({
          businessId: validBusinessId,
          name: 'Test Type',
          code: 'TEST',
          description: 'Test type',
          createdBy: validRequestingUserId,
        }),
      ];

      mockRepository.findByBusinessId.mockResolvedValue(serviceTypes);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service types listed successfully',
        {
          businessId: validBusinessId.getValue(),
          count: 1,
          correlationId,
        },
      );
    });

    it('should log repository errors', async () => {
      // Arrange
      const error = new Error('Repository error');
      mockRepository.findByBusinessId.mockRejectedValue(error);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to list service types',
        error,
        {
          businessId: validBusinessId.getValue(),
          error: error.message,
          correlationId,
        },
      );
    });
  });

  describe('🌐 Repository Interaction', () => {
    it('should call repository with correct business ID', async () => {
      // Arrange
      mockRepository.findByBusinessId.mockResolvedValue([]);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockRepository.findByBusinessId).toHaveBeenCalledWith(
        validBusinessId,
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Arrange
      const repositoryError = new Error('Database connection failed');
      mockRepository.findByBusinessId.mockRejectedValue(repositoryError);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle null response from repository', async () => {
      // Arrange
      mockRepository.findByBusinessId.mockResolvedValue(null as any);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceTypes).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should handle undefined response from repository', async () => {
      // Arrange
      mockRepository.findByBusinessId.mockResolvedValue(undefined as any);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceTypes).toEqual([]);
      expect(result.totalCount).toBe(0);
    });

    it('should handle service types with missing data gracefully', async () => {
      // Arrange
      const serviceType = ServiceType.create({
        businessId: validBusinessId,
        name: 'Test Type',
        code: 'TEST',
        description: 'Test type',
        createdBy: validRequestingUserId,
      });

      mockRepository.findByBusinessId.mockResolvedValue([serviceType]);

      const request = {
        businessId: validBusinessId,
        requestingUserId: validRequestingUserId,
        correlationId,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.serviceTypes).toHaveLength(1);
      expect(result.serviceTypes[0].getName()).toBe('Test Type');
      expect(result.totalCount).toBe(1);
    });
  });
});
