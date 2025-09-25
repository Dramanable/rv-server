/**
 * 🧪 GetServiceTypeByIdUseCase - Tests TDD STRICT
 *
 * ⚠️ PHASE RED : Tests qui échouent AVANT l'implémentation
 * ✅ Toujours respecter le cycle RED → GREEN → REFACTOR
 * 🎯 Un test = une responsabilité = une assertion principale
 */

import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { GetServiceTypeByIdUseCase } from '@application/use-cases/service-types/get-service-type-by-id.use-case';
import { ServiceType } from '@domain/entities/service-type.entity';
import { ServiceTypeNotFoundError } from '@domain/exceptions/service-type.exceptions';
import { IServiceTypeRepository } from '@domain/repositories/service-type.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

// ✅ Mocks typés stricts
const mockServiceTypeRepository = (): jest.Mocked<IServiceTypeRepository> => ({
  save: jest.fn(),
  findById: jest.fn(),
  findByBusinessId: jest.fn(),
  findByBusinessIdAndCode: jest.fn(),
  findByBusinessIdAndName: jest.fn(),
  findActiveByBusinessId: jest.fn(),
  search: jest.fn(),
  existsByBusinessIdAndCode: jest.fn(),
  existsByBusinessIdAndName: jest.fn(),
  countByBusinessId: jest.fn(),
  countActiveByBusinessId: jest.fn(),
  delete: jest.fn(),
  hardDelete: jest.fn(),
  isReferencedByServices: jest.fn(),
  findByBusinessIdOrderedBySortOrder: jest.fn(),
  updateSortOrders: jest.fn(),
});

const mockLogger = (): jest.Mocked<Logger> => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  audit: jest.fn(),
  child: jest.fn(),
});

const mockI18nService = (): jest.Mocked<I18nService> => ({
  translate: jest.fn(),
  t: jest.fn(),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn(),
});

describe('GetServiceTypeByIdUseCase', () => {
  let useCase: GetServiceTypeByIdUseCase;
  let serviceTypeRepository: jest.Mocked<IServiceTypeRepository>;
  let logger: jest.Mocked<Logger>;
  let i18n: jest.Mocked<I18nService>;

  // ✅ Test data factory
  const createValidServiceType = (): ServiceType => {
    return ServiceType.reconstruct({
      id: ServiceTypeId.fromString('123e4567-e89b-12d3-a456-426614174000'),
      businessId: BusinessId.fromString('987fcdeb-51d2-43e8-b456-789012345678'),
      name: 'Consultation Premium',
      code: 'CONSULT_PREMIUM',
      description: 'Premium consultation service',
      isActive: true,
      sortOrder: 100,
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
    });
  };

  beforeEach(async () => {
    // ✅ Setup avec mocks
    serviceTypeRepository = mockServiceTypeRepository();
    logger = mockLogger();
    i18n = mockI18nService();

    useCase = new GetServiceTypeByIdUseCase(
      serviceTypeRepository,
      logger,
      i18n,
    );

    // ✅ Setup traductions par défaut
    i18n.translate.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        'serviceType.notFound': 'Service type not found',
        'serviceType.retrieved': 'Service type retrieved successfully',
      };
      return translations[key] || key;
    });
  });

  describe('🎯 Use Case Execution', () => {
    it('should retrieve service type successfully', async () => {
      // Given
      const serviceType = createValidServiceType();
      const request = {
        serviceTypeId: '123e4567-e89b-12d3-a456-426614174000',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(serviceType);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.businessId).toBe('987fcdeb-51d2-43e8-b456-789012345678');
      expect(result.name).toBe('Consultation Premium');
      expect(result.code).toBe('CONSULT_PREMIUM');
      expect(result.description).toBe('Premium consultation service');
      expect(result.isActive).toBe(true);
      expect(result.sortOrder).toBe(100);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw error when service type not found', async () => {
      // Given - ✅ Utiliser UUID valide
      const request = {
        serviceTypeId: '999e4567-e89b-12d3-a456-426614174999', // ✅ UUID valide mais inexistant
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeNotFoundError,
      );
    });
  });

  describe('🔍 Input Validation', () => {
    it('should throw error for invalid service type ID', async () => {
      // Given
      const request = {
        serviceTypeId: 'invalid-uuid',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();
    });

    it('should throw error for empty service type ID', async () => {
      // Given
      const request = {
        serviceTypeId: '',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow();
    });
  });

  describe('📊 Logging & Audit', () => {
    it('should log successful retrieval', async () => {
      // Given
      const serviceType = createValidServiceType();
      const request = {
        serviceTypeId: '123e4567-e89b-12d3-a456-426614174000',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(serviceType);

      // When
      await useCase.execute(request);

      // Then
      expect(logger.info).toHaveBeenCalledWith(
        'Retrieving service type by ID',
        expect.objectContaining({
          serviceTypeId: request.serviceTypeId,
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        }),
      );

      expect(logger.info).toHaveBeenCalledWith(
        'Service type retrieved successfully',
        expect.objectContaining({
          serviceTypeId: serviceType.getId().getValue(),
          correlationId: request.correlationId,
        }),
      );
    });

    it('should log error when service type not found', async () => {
      // Given - ✅ UUID valide mais inexistant
      const request = {
        serviceTypeId: '999e4567-e89b-12d3-a456-426614174999',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(null);

      // When & Then
      try {
        await useCase.execute(request);
        fail('Expected ServiceTypeNotFoundError');
      } catch (error) {
        expect(logger.error).toHaveBeenCalledWith(
          'Service type not found',
          undefined,
          expect.objectContaining({
            serviceTypeId: request.serviceTypeId,
            correlationId: request.correlationId,
          }),
        );
      }
    });
  });

  describe('🌐 Repository Interaction', () => {
    it('should call repository with correct service type ID', async () => {
      // Given
      const serviceType = createValidServiceType();
      const request = {
        serviceTypeId: '123e4567-e89b-12d3-a456-426614174000',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(serviceType);

      // When
      await useCase.execute(request);

      // Then
      expect(serviceTypeRepository.findById).toHaveBeenCalledWith(
        expect.objectContaining({
          getValue: expect.any(Function),
        }),
      );
    });

    it('should handle repository errors gracefully', async () => {
      // Given
      const request = {
        serviceTypeId: '123e4567-e89b-12d3-a456-426614174000',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      const repositoryError = new Error('Database connection failed');
      serviceTypeRepository.findById.mockRejectedValue(repositoryError);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to retrieve service type',
        repositoryError,
        expect.objectContaining({
          serviceTypeId: request.serviceTypeId,
          correlationId: request.correlationId,
        }),
      );
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle null response from repository', async () => {
      // Given - ✅ UUID valide
      const request = {
        serviceTypeId: '888e4567-e89b-12d3-a456-426614174888',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeNotFoundError,
      );
    });

    it('should handle undefined response from repository', async () => {
      // Given - ✅ UUID valide
      const request = {
        serviceTypeId: '777e4567-e89b-12d3-a456-426614174777',
        requestingUserId: 'user-123',
        correlationId: 'get_service_type_test',
        timestamp: new Date(),
      };

      serviceTypeRepository.findById.mockResolvedValue(undefined as any);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceTypeNotFoundError,
      );
    });
  });
});
