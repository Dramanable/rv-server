/**
 * 🧪 Test TDD pour ListStaffUseCase avec IPermissionService
 *
 * Validation que les permissions sont correctement vérifiées
 * pour l'opération de listage du personnel
 */

import { I18nService } from "../../../../../application/ports/i18n.port";
import { Logger } from "../../../../../application/ports/logger.port";
import { IPermissionService } from "../../../../../application/ports/permission.service.interface";
import {
  ListStaffRequest,
  ListStaffUseCase,
} from "../../../../../application/use-cases/staff/list-staff.use-case";
import { Staff } from "../../../../../domain/entities/staff.entity";
import { StaffRepository } from "../../../../../domain/repositories/staff.repository.interface";
import { BusinessId } from "../../../../../domain/value-objects/business-id.value-object";
import { Permission } from "../../../../../shared/enums/permission.enum";
import { StaffRole } from "../../../../../shared/enums/staff-role.enum";
import {
  createMockI18nService,
  createMockLogger,
  createMockPermissionService,
} from "../../../../setup/test-mocks";

describe("ListStaffUseCase - Permission Tests", () => {
  let useCase: ListStaffUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const validRequest: ListStaffRequest = {
    requestingUserId: "123e4567-e89b-42d3-a456-426614174000",
    pagination: {
      page: 1,
      limit: 10,
    },
    sorting: {
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    filters: {
      businessId: "123e4567-e89b-42d3-a456-426614174001",
      isActive: true,
    },
  };

  beforeEach(() => {
    // Mock StaffRepository inline (pas encore dans test-mocks.ts)
    mockStaffRepository = {
      search: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findByEmail: jest.fn(),
      findByBusinessId: jest.fn(),
      findByBusinessIdAndRole: jest.fn(),
      findAvailableStaff: jest.fn(),
      existsByEmail: jest.fn(),
      getBusinessStaffStatistics: jest.fn(),
    } as jest.Mocked<StaffRepository>;

    // Use centralized mocks
    mockPermissionService = createMockPermissionService();
    mockLogger = createMockLogger();
    mockI18n = createMockI18nService();

    useCase = new ListStaffUseCase(
      mockStaffRepository,
      mockLogger,
      mockI18n,
      mockPermissionService,
    );
  });

  describe("Permission Validation", () => {
    it("should require VIEW_STAFF permission", async () => {
      // Arrange
      mockPermissionService.requirePermission.mockResolvedValue();
      mockStaffRepository.search.mockResolvedValue({
        staff: [],
        total: 0,
      });

      // Act
      await useCase.execute(validRequest);

      // Assert
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        Permission.VIEW_STAFF,
        {
          action: "list",
          resource: "staff",
          businessId: validRequest.filters.businessId,
        },
      );
    });

    it("should throw error when permission is denied", async () => {
      // Arrange
      const permissionError = new Error("Permission denied");
      mockPermissionService.requirePermission.mockRejectedValue(
        permissionError,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Permission denied",
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        Permission.VIEW_STAFF,
        {
          action: "list",
          resource: "staff",
          businessId: validRequest.filters.businessId,
        },
      );

      // Repository should not be called
      expect(mockStaffRepository.search).not.toHaveBeenCalled();
    });

    it("should successfully list staff when permission is granted", async () => {
      // Arrange
      const mockStaff = Staff.create({
        businessId: BusinessId.create("123e4567-e89b-42d3-a456-426614174001"),
        profile: {
          firstName: "John",
          lastName: "Doe",
          specialization: "General",
        },
        role: StaffRole.DOCTOR,
        email: "john.doe@test.com",
      });

      mockPermissionService.requirePermission.mockResolvedValue();
      mockStaffRepository.search.mockResolvedValue({
        staff: [mockStaff],
        total: 1,
      });

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(1);
      expect(result.meta.totalItems).toBe(1);

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequest.requestingUserId,
        Permission.VIEW_STAFF,
        {
          action: "list",
          resource: "staff",
          businessId: validRequest.filters.businessId,
        },
      );

      expect(mockStaffRepository.search).toHaveBeenCalled();
    });
  });

  describe("Logging", () => {
    it("should log operation start and success", async () => {
      // Arrange
      mockPermissionService.requirePermission.mockResolvedValue();
      mockStaffRepository.search.mockResolvedValue({
        staff: [],
        total: 0,
      });

      // Act
      await useCase.execute(validRequest);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        "Attempting to list staff",
        expect.objectContaining({
          requestingUserId: validRequest.requestingUserId,
          page: validRequest.pagination.page,
          limit: validRequest.pagination.limit,
          filters: validRequest.filters,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Staff list retrieved successfully",
        expect.objectContaining({
          requestingUserId: validRequest.requestingUserId,
          totalItems: 0,
          returnedItems: 0,
        }),
      );
    });

    it("should log errors when operation fails", async () => {
      // Arrange
      const testError = new Error("Database error");
      mockPermissionService.requirePermission.mockResolvedValue();
      mockStaffRepository.search.mockRejectedValue(testError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        "Database error",
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error listing staff",
        testError,
        {
          requestingUserId: validRequest.requestingUserId,
        },
      );
    });
  });
});
