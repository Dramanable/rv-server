/**
 * ✅ TDD Test - CreateServiceTypeUseCase avec IPermissionService
 */

import { IAuditService } from "@application/ports/audit.port";
import { Logger } from "@application/ports/logger.port";
import { IPermissionService } from "@application/ports/permission.service.interface";
import {
  CreateServiceTypeRequest,
  CreateServiceTypeUseCase,
} from "@application/use-cases/service-types/create-service-type.use-case";
import { IServiceTypeRepository } from "@domain/repositories/service-type.repository";

// Mock helpers
function createMockServiceTypeRepository(): jest.Mocked<IServiceTypeRepository> {
  return {
    save: jest.fn(),
    findById: jest.fn(),
    findByBusinessIdAndCode: jest.fn(),
    findByBusinessIdAndName: jest.fn(),
  } as any;
}

function createMockPermissionService(): jest.Mocked<IPermissionService> {
  return {
    requirePermission: jest.fn(),
  } as any;
}

function createMockLogger(): jest.Mocked<Logger> {
  return {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  } as any;
}

interface I18nTranslateFunction {
  translate(
    key: string,
    options?: { args?: Record<string, any> },
  ): string | Promise<string>;
}

function createMockI18n(): jest.Mocked<I18nTranslateFunction> {
  return {
    translate: jest.fn().mockReturnValue("Mock message"),
  } as any;
}

function createMockAuditService(): jest.Mocked<IAuditService> {
  return {
    logOperation: jest.fn(),
  } as any;
}

describe("CreateServiceTypeUseCase - IPermissionService TDD", () => {
  let useCase: CreateServiceTypeUseCase;
  let mockServiceTypeRepository: jest.Mocked<IServiceTypeRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nTranslateFunction>;
  let mockAuditService: jest.Mocked<IAuditService>;

  beforeEach(() => {
    // Mock IServiceTypeRepository
    mockServiceTypeRepository = createMockServiceTypeRepository();

    // Mock IPermissionService (NEW - this should be added to constructor)
    mockPermissionService = createMockPermissionService();

    // Mock Logger
    mockLogger = createMockLogger();

    // Mock I18nTranslateFunction
    mockI18n = createMockI18n();

    // Mock IAuditService
    mockAuditService = createMockAuditService();

    // 🟢 GREEN - Now using IPermissionService in constructor
    useCase = new CreateServiceTypeUseCase(
      mockServiceTypeRepository,
      mockLogger,
      mockI18n,
      mockAuditService,
      mockPermissionService,
    );
  });

  describe("🟢 GREEN Phase - IPermissionService Integrated", () => {
    it("should use IPermissionService.requirePermission for authorization", async () => {
      // Arrange
      const request: CreateServiceTypeRequest = {
        businessId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Test Service Type",
        code: "TEST_TYPE",
        description: "Test description",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440002",
        correlationId: "550e8400-e29b-41d4-a716-446655440003",
        timestamp: new Date(),
      };

      const mockServiceType = {
        getId: () => ({
          getValue: () => "550e8400-e29b-41d4-a716-446655440004",
        }),
        getBusinessId: () => ({
          getValue: () => "550e8400-e29b-41d4-a716-446655440001",
        }),
        getName: () => "Test Service Type",
        getCode: () => "TEST_TYPE",
        getDescription: () => "Test description",
        getSortOrder: () => 0,
        isActive: () => true,
        getCreatedAt: () => new Date(),
        getUpdatedAt: () => new Date(),
      };

      mockServiceTypeRepository.findByBusinessIdAndCode.mockResolvedValue(null);
      mockServiceTypeRepository.findByBusinessIdAndName.mockResolvedValue(null);
      mockServiceTypeRepository.save.mockResolvedValue(mockServiceType as any);
      mockPermissionService.requirePermission.mockResolvedValue();

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440002",
        "MANAGE_SERVICES",
        { businessId: "550e8400-e29b-41d4-a716-446655440001" },
      );
    });

    it("should throw error when user lacks MANAGE_SERVICES permission", async () => {
      // Arrange
      const request: CreateServiceTypeRequest = {
        businessId: "550e8400-e29b-41d4-a716-446655440001",
        name: "Test Service Type",
        code: "TEST_TYPE",
        description: "Test description",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440002",
        correlationId: "550e8400-e29b-41d4-a716-446655440003",
        timestamp: new Date(),
      };

      // Mock permission service to throw error (user lacks permission)
      mockPermissionService.requirePermission.mockRejectedValue(
        new Error("Insufficient permissions"),
      );

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        "Insufficient permissions",
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        "550e8400-e29b-41d4-a716-446655440002",
        "MANAGE_SERVICES",
        { businessId: "550e8400-e29b-41d4-a716-446655440001" },
      );
    });
  });
});
