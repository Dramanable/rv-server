/**
 * 🧪 UPDATE SERVICE USE CASE - TDD Tests
 *
 * Phase RED: Tests qui échouent pour guider l'implémentation
 * Application Layer - Clean Architecture
 */

import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { ServiceId } from '../../../../../domain/value-objects/service-id.value-object';
import { ServiceTypeId } from '../../../../../domain/value-objects/service-type-id.value-object';
import { UpdateServiceUseCase } from '../../../../../application/use-cases/services/update-service.use-case';

// Mock dependencies
const mockServiceRepository = {
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('UpdateServiceUseCase', () => {
  let updateServiceUseCase: UpdateServiceUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    // 🔴 RED: Cette classe n'existe pas encore
    updateServiceUseCase = new UpdateServiceUseCase(
      mockServiceRepository as any,
      mockLogger as any,
    );
  });

  describe('🔴 RED Phase - Service Update', () => {
    it('should update service with valid data', async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const serviceTypeId = ServiceTypeId.fromString(
        '550e8400-e29b-41d4-a716-446655440002',
      );

      const request = {
        requestingUserId: 'user-123',
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
        name: 'Updated Service Name',
        description: 'Updated description',
        serviceTypeIds: [serviceTypeId.getValue()],
        basePrice: 75,
        currency: 'EUR',
        duration: 90,
      };

      const existingService = {
        id: serviceId,
        businessId: businessId,
        name: 'Original Service Name',
        description: 'Original description',
        getServiceTypeIds: () => [serviceTypeId],
        pricingConfig: { basePrice: { amount: 50, currency: 'EUR' } },
        scheduling: { duration: 60 },
        updateBasicInfo: jest.fn(),
        updateScheduling: jest.fn(),
        updateServiceTypes: jest.fn(),
      };

      const updatedService = {
        ...existingService,
        name: 'Updated Service Name',
        description: 'Updated description',
        pricingConfig: { basePrice: { amount: 75, currency: 'EUR' } },
        scheduling: { duration: 90 },
      };

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.findByName.mockResolvedValue(null);
      mockServiceRepository.save.mockResolvedValue(updatedService);

      // Act - 🔴 RED: Cette méthode n'existe pas encore
      const result = await updateServiceUseCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.service).toBeDefined();
      expect(result.service.name).toBe('Updated Service Name');
      expect(existingService.updateBasicInfo).toHaveBeenCalledWith({
        name: 'Updated Service Name',
        description: 'Updated description',
        basePrice: 75,
        currency: 'EUR',
      });
      expect(existingService.updateScheduling).toHaveBeenCalledWith({
        duration: 90,
      });
      expect(existingService.updateServiceTypes).toHaveBeenCalledWith([
        serviceTypeId,
      ]);
      expect(mockServiceRepository.save).toHaveBeenCalledWith(existingService);
    });

    it('should throw error when service not found', async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );

      const request = {
        requestingUserId: 'user-123',
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
        name: 'Updated Name',
      };

      mockServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert - 🔴 RED: Cette exception n'est pas gérée encore
      await expect(updateServiceUseCase.execute(request)).rejects.toThrow(
        'Service not found',
      );
    });

    it('should throw error when service belongs to different business', async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const requestingBusinessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const serviceBusinessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440002',
      );

      const request = {
        requestingUserId: 'user-123',
        serviceId: serviceId.getValue(),
        businessId: requestingBusinessId.getValue(),
        name: 'Updated Name',
      };

      const existingService = {
        id: serviceId,
        businessId: serviceBusinessId, // Différent business
        name: 'Original Name',
      };

      mockServiceRepository.findById.mockResolvedValue(existingService);

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(updateServiceUseCase.execute(request)).rejects.toThrow(
        'Service does not belong to the specified business',
      );
    });

    it('should throw error when new name already exists for another service', async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const anotherServiceId = ServiceId.generate();

      const request = {
        requestingUserId: 'user-123',
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
        name: 'Existing Service Name',
      };

      const existingService = {
        id: serviceId,
        businessId: businessId,
        name: 'Original Name',
        update: jest.fn(),
      };

      const serviceWithSameName = {
        id: anotherServiceId, // Différent service avec le même nom
        businessId: businessId,
        name: 'Existing Service Name',
      };

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.findByName.mockResolvedValue(serviceWithSameName);

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(updateServiceUseCase.execute(request)).rejects.toThrow(
        'Service name already exists',
      );
    });

    it('should allow updating service with same name (no conflict)', async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );

      const request = {
        requestingUserId: 'user-123',
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
        name: 'Same Name',
        description: 'Updated description',
      };

      const existingService = {
        id: serviceId,
        businessId: businessId,
        name: 'Same Name', // Même nom, pas de conflit
        description: 'Original description',
        updateBasicInfo: jest.fn(),
        updateScheduling: jest.fn(),
        updateServiceTypes: jest.fn(),
      };

      const updatedService = {
        ...existingService,
        description: 'Updated description',
      };

      mockServiceRepository.findById.mockResolvedValue(existingService);
      mockServiceRepository.findByName.mockResolvedValue(existingService); // Même service
      mockServiceRepository.save.mockResolvedValue(updatedService);

      // Act
      const result = await updateServiceUseCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.service.description).toBe('Updated description');
      expect(mockServiceRepository.save).toHaveBeenCalledWith(existingService);
    });

    it('should throw error with invalid price', async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );

      const request = {
        requestingUserId: 'user-123',
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
        basePrice: -10, // Invalid negative price
      };

      const existingService = {
        id: serviceId,
        businessId: businessId,
        name: 'Test Service',
      };

      mockServiceRepository.findById.mockResolvedValue(existingService);

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(updateServiceUseCase.execute(request)).rejects.toThrow(
        'Price must be positive',
      );
    });
  });
});
