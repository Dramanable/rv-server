/**
 * 🧪 GET SERVICE USE CASE - TDD Tests
 *
 * Phase RED: Tests qui échouent pour guider l'implémentation
 * Application Layer - Clean Architecture
 */

import { BusinessId } from "../../../../../domain/value-objects/business-id.value-object";
import { ServiceId } from "../../../../../domain/value-objects/service-id.value-object";
import { GetServiceUseCase } from "../../../../../application/use-cases/services/get-service.use-case";

// Mock dependencies
const mockServiceRepository = {
  findById: jest.fn(),
  findByBusinessId: jest.fn(),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

describe("GetServiceUseCase", () => {
  let getServiceUseCase: GetServiceUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    // 🔴 RED: Cette classe n'existe pas encore
    getServiceUseCase = new GetServiceUseCase(
      mockServiceRepository as any,
      mockLogger as any,
    );
  });

  describe("🔴 RED Phase - Service Retrieval", () => {
    it("should get service by id successfully", async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        "550e8400-e29b-41d4-a716-446655440001",
      );

      const request = {
        requestingUserId: "user-123",
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
      };

      const mockService = {
        id: serviceId,
        businessId: businessId,
        name: "Consultation Générale",
        description: "Consultation médicale générale",
        getServiceTypeIds: () => [],
        pricingConfig: { basePrice: { amount: 50, currency: "EUR" } },
        scheduling: { duration: 60, allowOnlineBooking: true },
      };

      mockServiceRepository.findById.mockResolvedValue(mockService);

      // Act - 🔴 RED: Cette méthode n'existe pas encore
      const result = await getServiceUseCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.service).toBeDefined();
      expect(result.service.id).toEqual(serviceId);
      expect(result.service.name).toBe("Consultation Générale");
      expect(mockServiceRepository.findById).toHaveBeenCalledWith(serviceId);
    });

    it("should throw error when service not found", async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const businessId = BusinessId.fromString(
        "550e8400-e29b-41d4-a716-446655440001",
      );

      const request = {
        requestingUserId: "user-123",
        serviceId: serviceId.getValue(),
        businessId: businessId.getValue(),
      };

      mockServiceRepository.findById.mockResolvedValue(null);

      // Act & Assert - 🔴 RED: Cette exception n'est pas gérée encore
      await expect(getServiceUseCase.execute(request)).rejects.toThrow(
        "Service not found",
      );
    });

    it("should throw error when service belongs to different business", async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const requestingBusinessId = BusinessId.fromString(
        "550e8400-e29b-41d4-a716-446655440001",
      );
      const serviceBusinessId = BusinessId.fromString(
        "550e8400-e29b-41d4-a716-446655440002",
      );

      const request = {
        requestingUserId: "user-123",
        serviceId: serviceId.getValue(),
        businessId: requestingBusinessId.getValue(),
      };

      const mockService = {
        id: serviceId,
        businessId: serviceBusinessId, // Différent business
        name: "Consultation Générale",
        description: "Consultation médicale générale",
      };

      mockServiceRepository.findById.mockResolvedValue(mockService);

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(getServiceUseCase.execute(request)).rejects.toThrow(
        "Service does not belong to the specified business",
      );
    });

    it("should throw error with invalid service id format", async () => {
      // Arrange
      const request = {
        requestingUserId: "user-123",
        serviceId: "invalid-service-id",
        businessId: "550e8400-e29b-41d4-a716-446655440001",
      };

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(getServiceUseCase.execute(request)).rejects.toThrow(
        "Invalid service ID format",
      );
    });

    it("should throw error with invalid business id format", async () => {
      // Arrange
      const serviceId = ServiceId.generate();
      const request = {
        requestingUserId: "user-123",
        serviceId: serviceId.getValue(),
        businessId: "invalid-business-id",
      };

      // Act & Assert - 🔴 RED: Cette validation n'existe pas encore
      await expect(getServiceUseCase.execute(request)).rejects.toThrow(
        "Invalid business ID format",
      );
    });
  });

  describe("🔴 RED Phase - Service List by Business", () => {
    it("should list services by business id successfully", async () => {
      // Arrange
      const businessId = BusinessId.fromString(
        "550e8400-e29b-41d4-a716-446655440001",
      );

      const request = {
        requestingUserId: "user-123",
        businessId: businessId.getValue(),
        page: 1,
        limit: 10,
      };

      const mockServices = [
        {
          id: ServiceId.generate(),
          businessId: businessId,
          name: "Service 1",
          description: "Description 1",
        },
        {
          id: ServiceId.generate(),
          businessId: businessId,
          name: "Service 2",
          description: "Description 2",
        },
      ];

      mockServiceRepository.findByBusinessId.mockResolvedValue({
        services: mockServices,
        total: 2,
        page: 1,
        limit: 10,
      });

      // Act - 🔴 RED: Cette méthode n'existe pas encore
      const result = await getServiceUseCase.executeList(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.services).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(mockServiceRepository.findByBusinessId).toHaveBeenCalledWith(
        businessId,
        { page: 1, limit: 10 },
      );
    });

    it("should return empty list when no services found", async () => {
      // Arrange
      const businessId = BusinessId.fromString(
        "550e8400-e29b-41d4-a716-446655440001",
      );

      const request = {
        requestingUserId: "user-123",
        businessId: businessId.getValue(),
        page: 1,
        limit: 10,
      };

      mockServiceRepository.findByBusinessId.mockResolvedValue({
        services: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      // Act
      const result = await getServiceUseCase.executeList(request);

      // Assert
      expect(result).toBeDefined();
      expect(result.services).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
