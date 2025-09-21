/**
 * 🧪 Tests UpdateServiceUseCase - Phase TDD: RED → GREEN → REFACTOR
 *
 * Tests unitaires pour le cas d'usage de mise à jour d'un service
 * Couche Application - Tests d'orchestration métier
 */

import { ApplicationValidationError } from '../../../../../application/exceptions/application.exceptions';
import { I18nService } from '../../../../../application/ports/i18n.port';
import { Logger } from '../../../../../application/ports/logger.port';
import { UpdateServiceUseCase } from '../../../../../application/use-cases/service/update-service.use-case';
import {
  Service,
  ServiceCategory,
} from '../../../../../domain/entities/service.entity';
import { ServiceNotFoundError } from '../../../../../domain/exceptions/service.exceptions';
import { ServiceRepository } from '../../../../../domain/repositories/service.repository.interface';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';

describe('UpdateServiceUseCase', () => {
  let useCase: UpdateServiceUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const mockService = Service.create({
    businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: 'Original Service',
    description: 'Original description',
    category: ServiceCategory.CONSULTATION,
    basePrice: 100,
    currency: 'EUR',
    duration: 60,
    allowOnlineBooking: true,
    requiresApproval: false,
  });

  beforeEach(() => {
    mockServiceRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByStaffId: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
      findPopularServices: jest.fn(),
      getServiceStatistics: jest.fn(),
      getBusinessServiceStatistics: jest.fn(),
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
      translate: jest.fn(),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    useCase = new UpdateServiceUseCase(
      mockServiceRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('Parameter validation', () => {
    it('should throw ApplicationValidationError when serviceId is missing', async () => {
      const request = {
        serviceId: '',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when requestingUserId is missing', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '',
        updates: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Business rules validation', () => {
    beforeEach(() => {
      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.findByName.mockResolvedValue(null);
    });

    it('should throw ApplicationValidationError when name is too short', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: { name: 'A' },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when price is negative', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: {
          pricing: { basePrice: -10, currency: 'EUR' },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when duration is zero or negative', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: {
          scheduling: { duration: 0 },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when name already exists', async () => {
      const existingService = Service.create({
        businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
        name: 'Existing Service',
        description: 'description',
        category: ServiceCategory.TREATMENT,
        basePrice: 50,
        currency: 'EUR',
        duration: 30,
        allowOnlineBooking: true,
        requiresApproval: false,
      });

      mockServiceRepository.findByName.mockResolvedValue(existingService);

      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: { name: 'Existing Service' },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Service not found', () => {
    it('should throw ServiceNotFoundError when service does not exist', async () => {
      mockServiceRepository.findById.mockResolvedValue(null);
      mockI18n.translate.mockReturnValue('Service not found');

      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440003',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceNotFoundError,
      );
    });
  });

  describe('Successful update', () => {
    beforeEach(() => {
      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.findByName.mockResolvedValue(null);
      mockServiceRepository.save.mockResolvedValue(undefined);
    });

    it('should update service successfully with valid data', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: {
          name: 'Updated Service Name',
          description: 'Updated description',
        },
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Service Name');
      expect(mockServiceRepository.save).toHaveBeenCalledWith(mockService);
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.findByName.mockResolvedValue(null);
      mockServiceRepository.save.mockResolvedValue(undefined);
    });

    it('should log update attempt', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: { name: 'Updated Name' },
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to update service',
        {
          serviceId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        },
      );
    });

    it('should log successful update', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: { name: 'Updated Name' },
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service updated successfully',
        expect.objectContaining({
          serviceId: expect.any(String),
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          updatedFields: ['name'],
        }),
      );
    });

    it('should log errors', async () => {
      mockServiceRepository.findById.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        updates: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error updating service',
        expect.any(Error),
        {
          serviceId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        },
      );
    });
  });
});
