/**
 * 📋 LIST SERVICES USE CASE - TDD Tests
 *
 * Tests unitaires pour le cas d'usage de listage des services
 * Phase RED → GREEN → REFACTOR
 */

import { ListServicesUseCase } from "../../../../../application/use-cases/service/list-services.use-case";
import { Service } from "../../../../../domain/entities/service.entity";
import { BusinessId } from "../../../../../domain/value-objects/business-id.value-object";
import { ServiceId } from "../../../../../domain/value-objects/service-id.value-object";
import { ServiceTypeId } from "../../../../../domain/value-objects/service-type-id.value-object";
import {
  ApplicationValidationError,
  InsufficientPermissionsError,
} from "../../../../../application/exceptions/application.exceptions";

describe("ListServicesUseCase", () => {
  let listServicesUseCase: ListServicesUseCase;
  let mockServiceRepository: any;
  let mockPermissionService: any;
  let mockLogger: any;
  let mockI18n: any;

  const mockServices = [
    Service.create({
      businessId: BusinessId.create("550e8400-e29b-41d4-a716-446655440000"),
      name: "Service 1",
      description: "First service",
      serviceTypeIds: [
        ServiceTypeId.fromString("550e8400-e29b-41d4-a716-446655440001"),
      ],
      basePrice: 100,
      currency: "EUR",
      duration: 60,
      allowOnlineBooking: true,
      requiresApproval: false,
    }),
    Service.create({
      businessId: BusinessId.create("550e8400-e29b-41d4-a716-446655440000"),
      name: "Service 2",
      description: "Second service",
      serviceTypeIds: [
        ServiceTypeId.fromString("550e8400-e29b-41d4-a716-446655440002"),
      ],
      basePrice: 200,
      currency: "EUR",
      duration: 90,
      allowOnlineBooking: false,
      requiresApproval: true,
    }),
  ];

  beforeEach(() => {
    mockServiceRepository = {
      search: jest.fn(),
    };

    mockPermissionService = {
      requirePermission: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    mockI18n = {
      translate: jest.fn(),
    };

    listServicesUseCase = new ListServicesUseCase(
      mockServiceRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe("🔴 RED Phase - Parameter Validation", () => {
    it("should throw ApplicationValidationError when requestingUserId is missing", async () => {
      // Arrange
      const request = {
        requestingUserId: "",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      // Act & Assert
      await expect(listServicesUseCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when businessId is missing", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      // Act & Assert
      await expect(listServicesUseCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when page is less than 1", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 0, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      // Act & Assert
      await expect(listServicesUseCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when limit exceeds maximum", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 101 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      // Act & Assert
      await expect(listServicesUseCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe("🔴 RED Phase - Permissions", () => {
    it("should throw InsufficientPermissionsError when user lacks VIEW_SERVICES permission", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError(
          request.requestingUserId,
          "VIEW_SERVICES",
          request.businessId,
        ),
      );

      // Act & Assert
      await expect(listServicesUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );
    });
  });

  describe("🔴 RED Phase - Successful Listing", () => {
    beforeEach(() => {
      mockPermissionService.requirePermission.mockResolvedValue(true);
    });

    it("should list services with pagination successfully", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      mockServiceRepository.search.mockResolvedValue({
        services: mockServices,
        total: 2,
      });

      // Act
      const result = await listServicesUseCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe("Service 1");
      expect(result.data[1].name).toBe("Service 2");
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.totalItems).toBe(2);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(false);
    });

    it("should apply filters correctly", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {
          name: "Service 1",
          isActive: true,
          minPrice: 50,
          maxPrice: 150,
        },
      };

      mockServiceRepository.search.mockResolvedValue({
        services: [mockServices[0]],
        total: 1,
      });

      // Act
      const result = await listServicesUseCase.execute(request);

      // Assert
      expect(mockServiceRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Service 1",
          isActive: true,
          minPrice: 50,
          maxPrice: 150,
          limit: 10,
          offset: 0,
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it("should calculate pagination metadata correctly for multiple pages", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 2, limit: 1 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      mockServiceRepository.search.mockResolvedValue({
        services: [mockServices[1]],
        total: 2,
      });

      // Act
      const result = await listServicesUseCase.execute(request);

      // Assert
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.hasNextPage).toBe(false);
      expect(result.meta.hasPrevPage).toBe(true);
      expect(mockServiceRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 1, // (page - 1) * limit = 1
          limit: 1,
        }),
      );
    });
  });

  describe("🔴 RED Phase - Logging", () => {
    beforeEach(() => {
      mockPermissionService.requirePermission.mockResolvedValue(true);
      mockServiceRepository.search.mockResolvedValue({
        services: mockServices,
        total: 2,
      });
    });

    it("should log listing attempt and success", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      // Act
      await listServicesUseCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Attempting to list services",
        {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
          page: 1,
          limit: 10,
        },
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Services listed successfully",
        {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
          totalFound: 2,
          page: 1,
          limit: 10,
        },
      );
    });

    it("should log errors when listing fails", async () => {
      // Arrange
      const request = {
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        businessId: "550e8400-e29b-41d4-a716-446655440000",
        pagination: { page: 1, limit: 10 },
        sorting: { sortBy: "name", sortOrder: "asc" as const },
        filters: {},
      };

      mockServiceRepository.search.mockRejectedValue(
        new Error("Database error"),
      );

      // Act & Assert
      await expect(listServicesUseCase.execute(request)).rejects.toThrow(
        "Database error",
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error listing services",
        expect.any(Error),
        {
          businessId: request.businessId,
          requestingUserId: request.requestingUserId,
        },
      );
    });
  });
});
