/**
 * 🧪 Tests DeleteServiceUseCase - Phase TDD: RED → GREEN → REFACTOR
 *
 * Tests unitaires pour le cas d'usage de suppression d'un service
 * Couche Application - Tests d'orchestration métier
 */

import { DeleteServiceUseCase } from '../../../../../application/use-cases/service/delete-service.use-case';
import { ServiceRepository } from '../../../../../domain/repositories/service.repository.interface';
import { Logger } from '../../../../../application/ports/logger.port';
import { I18nService } from '../../../../../application/ports/i18n.port';
import {
  Service,
  ServiceCategory,
} from '../../../../../domain/entities/service.entity';
import { ServiceId } from '../../../../../domain/value-objects/service-id.value-object';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../../../domain/value-objects/user-id.value-object';
import { ApplicationValidationError } from '../../../../../application/exceptions/application.exceptions';
import { ServiceNotFoundError } from '../../../../../domain/exceptions/service.exceptions';

describe('DeleteServiceUseCase', () => {
  let useCase: DeleteServiceUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const mockService = Service.create({
    businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440000'),
    name: 'Service to Delete',
    description: 'Service description',
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
      delete: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByStaffId: jest.fn(),
      search: jest.fn(),
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

    useCase = new DeleteServiceUseCase(
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
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it('should throw ApplicationValidationError when requestingUserId is missing', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '',
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
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ServiceNotFoundError,
      );
    });
  });

  describe('Business rules', () => {
    beforeEach(() => {
      mockServiceRepository.findById.mockResolvedValue(mockService);
    });

    it('should prevent deletion of service with active appointments', async () => {
      // Créer un service ACTIVE (qui ne peut pas être supprimé)
      const activeService = Service.create({
        businessId: BusinessId.create('550e8400-e29b-41d4-a716-446655440003'),
        name: 'Active Service',
        description: 'Service with active appointments',
        category: ServiceCategory.CONSULTATION,
        basePrice: 100,
        currency: 'EUR',
        duration: 60,
      });

      // Activer le service (ce qui l'empêchera d'être supprimé)
      activeService.assignStaff(
        UserId.create('550e8400-e29b-41d4-a716-446655440004'),
      );
      activeService.activate();

      mockServiceRepository.findById.mockResolvedValue(activeService);

      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe('Successful deletion', () => {
    beforeEach(() => {
      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.delete.mockResolvedValue(undefined);
    });

    it('should delete service successfully', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.serviceId).toBe('550e8400-e29b-41d4-a716-446655440002');
      expect(mockServiceRepository.delete).toHaveBeenCalledWith(
        expect.any(ServiceId),
      );
    });
  });

  describe('Logging', () => {
    beforeEach(() => {
      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockServiceRepository.delete.mockResolvedValue(undefined);
    });

    it('should log deletion attempt', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to delete service',
        {
          serviceId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        },
      );
    });

    it('should log successful deletion', async () => {
      const request = {
        serviceId: '550e8400-e29b-41d4-a716-446655440002',
        requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Service deleted successfully',
        expect.objectContaining({
          serviceId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          serviceName: 'Service to Delete',
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
      };

      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Error deleting service',
        expect.any(Error),
        {
          serviceId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        },
      );
    });
  });
});
