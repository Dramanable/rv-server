/**
 * 🧪 TDD Test - CreateServiceTypeUseCase avec IPermissionService
 *
 * @description Test TDD pour valider que CreateServiceTypeUseCase
 * utilise IPermissionService pour l'autorisation
 *
 * @workflow TDD: RED -> GREEN -> REFACTOR
 * Statut: � GREEN (Use Case already uses IPermissionService)
 */

import { InsufficientPermissionsError } from "@application/exceptions/application.exceptions";
import {
  CreateServiceTypeRequest,
  CreateServiceTypeUseCase,
} from "@application/use-cases/service-types/create-service-type.use-case";
import {
  createMockAuditService,
  createMockI18nService,
  createMockLogger,
  createMockPermissionService,
  createMockServiceTypeRepository,
} from "../../../../setup/test-mocks";

describe("CreateServiceTypeUseCase - IPermissionService TDD", () => {
  let useCase: CreateServiceTypeUseCase;
  let mockServiceTypeRepository: ReturnType<
    typeof createMockServiceTypeRepository
  >;
  let mockPermissionService: ReturnType<typeof createMockPermissionService>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockI18n: ReturnType<typeof createMockI18nService>;
  let mockAuditService: ReturnType<typeof createMockAuditService>;

  beforeEach(() => {
    // Create all mocks using centralized factory
    mockServiceTypeRepository = createMockServiceTypeRepository();
    mockPermissionService = createMockPermissionService();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();
    mockAuditService = createMockAuditService();

    // � GREEN - Constructor already uses IPermissionService!
    useCase = new CreateServiceTypeUseCase(
      mockServiceTypeRepository,
      mockLogger,
      mockI18n,
      mockAuditService,
      mockPermissionService,
    );
  });

  describe("� GREEN Phase - IPermissionService Already Integrated", () => {
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

      // Mock repository behavior
      mockServiceTypeRepository.findByBusinessIdAndName.mockResolvedValue(null);
      mockServiceTypeRepository.findByBusinessIdAndCode.mockResolvedValue(null);
      mockPermissionService.requirePermission.mockResolvedValue(undefined);

      const mockServiceType = {
        getId: () => ({ getValue: () => "service-type-123" }),
        getBusinessId: () => ({ getValue: () => request.businessId }),
        getName: () => request.name,
        getCode: () => request.code,
        getDescription: () => request.description,
        isActive: () => true,
        getSortOrder: () => 1,
        getCreatedAt: () => new Date(),
        getUpdatedAt: () => new Date(),
      };

      mockServiceTypeRepository.save.mockResolvedValue(mockServiceType as any);

      // Act
      await useCase.execute(request);

      // Assert - Permission should be checked with MANAGE_SERVICES
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        request.requestingUserId,
        "MANAGE_SERVICES",
        { businessId: request.businessId },
      );

      expect(mockServiceTypeRepository.save).toHaveBeenCalled();
    });

    it("should propagate InsufficientPermissionsError from IPermissionService", async () => {
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

      const permissionError = new InsufficientPermissionsError(
        request.requestingUserId,
        "MANAGE_SERVICES",
        request.businessId,
      );

      mockPermissionService.requirePermission.mockRejectedValue(
        permissionError,
      );

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        request.requestingUserId,
        "MANAGE_SERVICES",
        { businessId: request.businessId },
      );

      // Repository save should NOT be called when permission denied
      expect(mockServiceTypeRepository.save).not.toHaveBeenCalled();
    });
  });
});
