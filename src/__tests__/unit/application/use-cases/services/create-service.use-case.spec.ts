/**
 * 🧪 CREATE SERVICE USE CASE - TDD Tests
 *
 * Phase RED: Tests qui échouent pour guider l'implémentation
 * Application Layer - Clean Architecture
 */

import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '../../../../../domain/value-objects/service-type-id.value-object';
import { CreateServiceUseCase } from '../../../../../application/use-cases/services/create-service.use-case';

// Mock dependencies (à implémenter)
const mockServiceRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
};

const mockBusinessRepository = {
  findById: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe('CreateServiceUseCase', () => {
  let createServiceUseCase: CreateServiceUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    // 🔴 RED: Cette classe n'existe pas encore
    createServiceUseCase = new CreateServiceUseCase(
      mockServiceRepository as any,
      mockBusinessRepository as any,
      mockLogger as any,
    );
  });

  describe('🔴 RED Phase - Service Creation', () => {
    it('should create service with valid data', async () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const serviceTypeId = ServiceTypeId.fromString(
        '550e8400-e29b-41d4-a716-446655440002',
      );

      const request = {
        requestingUserId: 'user-123',
        businessId: businessId.getValue(),
        name: 'Consultation Générale',
        description: 'Consultation médicale générale',
        serviceTypeIds: [serviceTypeId.getValue()],
        basePrice: 50,
        currency: 'EUR',
        duration: 60,
      };

      const mockBusiness = { getId: () => businessId };
      mockBusinessRepository.findById.mockResolvedValue(mockBusiness);
      mockServiceRepository.findByName.mockResolvedValue(null);
      mockServiceRepository.save.mockResolvedValue({
        id: { getValue: () => 'service-123' },
        name: 'Consultation Générale',
        description: 'Consultation médicale générale',
        getServiceTypeIds: () => [serviceTypeId],
        pricingConfig: { basePrice: { amount: 50, currency: 'EUR' } },
        scheduling: { duration: 60 },
      });

      // Act - 🔴 RED: Cette méthode n'existe pas encore
      const result = await createServiceUseCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.service).toBeDefined();
      expect(result.service.name).toBe('Consultation Générale');
      expect(mockServiceRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw error when business not found', async () => {
      // Arrange
      const request = {
        requestingUserId: 'user-123',
        businessId: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Test Service',
        description: 'Test description',
        serviceTypeIds: ['550e8400-e29b-41d4-a716-446655440002'],
        basePrice: 50,
        currency: 'EUR',
        duration: 60,
      };

      mockBusinessRepository.findById.mockResolvedValue(null);

      // Act & Assert - 🔴 RED: Cette exception n'est pas gérée encore
      await expect(createServiceUseCase.execute(request)).rejects.toThrow(
        'Business not found',
      );
    });

    it('should throw error when service name already exists', async () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const request = {
        requestingUserId: 'user-123',
        businessId: businessId.getValue(),
        name: 'Existing Service',
        description: 'Test description',
        serviceTypeIds: ['550e8400-e29b-41d4-a716-446655440002'],
        basePrice: 50,
        currency: 'EUR',
        duration: 60,
      };

      const mockBusiness = { getId: () => businessId };
      mockBusinessRepository.findById.mockResolvedValue(mockBusiness);
      mockServiceRepository.findByName.mockResolvedValue({
        getName: () => 'Existing Service',
      });

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(createServiceUseCase.execute(request)).rejects.toThrow(
        'Service name already exists',
      );
    });

    it('should throw error with invalid price', async () => {
      // Arrange
      const businessId = BusinessId.fromString(
        '550e8400-e29b-41d4-a716-446655440001',
      );
      const request = {
        requestingUserId: 'user-123',
        businessId: businessId.getValue(),
        name: 'Test Service',
        description: 'Test description',
        serviceTypeIds: ['550e8400-e29b-41d4-a716-446655440002'],
        basePrice: -10, // Invalid negative price
        currency: 'EUR',
        duration: 60,
      };

      const mockBusiness = { getId: () => businessId };
      mockBusinessRepository.findById.mockResolvedValue(mockBusiness);
      mockServiceRepository.findByName.mockResolvedValue(null);

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(createServiceUseCase.execute(request)).rejects.toThrow(
        'Price must be positive',
      );
    });
  });
});
