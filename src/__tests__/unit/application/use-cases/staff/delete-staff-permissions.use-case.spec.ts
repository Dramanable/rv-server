import { ResourceNotFoundError } from "@application/exceptions/application.exceptions";
import { I18nService } from "@application/ports/i18n.port";
import { Logger } from "@application/ports/logger.port";
import { IPermissionService } from "@application/ports/permission.service.interface";
import { DeleteStaffUseCase } from "@application/use-cases/staff/delete-staff.use-case";
import { InsufficientPermissionsError } from "@domain/exceptions/user.exceptions";
import { StaffRepository } from "@domain/repositories/staff.repository.interface";
import { Permission } from "@shared/enums/permission.enum";

// Mocks centralisés
const mockStaffRepository: jest.Mocked<StaffRepository> = {
  findById: jest.fn(),
  findByEmail: jest.fn(),
  findByBusinessId: jest.fn(),
  findByBusinessIdAndRole: jest.fn(),
  findAvailableStaff: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  existsByEmail: jest.fn(),
  getBusinessStaffStatistics: jest.fn(),
  search: jest.fn(),
};

const mockPermissionService: jest.Mocked<IPermissionService> = {
  hasPermission: jest.fn(),
  canActOnRole: jest.fn(),
  requirePermission: jest.fn(),
  getUserPermissions: jest.fn(),
  getUserRole: jest.fn(),
  hasRole: jest.fn(),
  hasBusinessPermission: jest.fn(),
  canManageUser: jest.fn(),
  requireSuperAdminPermission: jest.fn(),
  isSuperAdmin: jest.fn(),
};

const mockLogger: jest.Mocked<Logger> = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  audit: jest.fn(),
  child: jest.fn(),
};

const mockI18n: jest.Mocked<I18nService> = {
  translate: jest.fn(),
  t: jest.fn(),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn(),
};

describe("DeleteStaffUseCase - Permissions TDD", () => {
  let useCase: DeleteStaffUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new DeleteStaffUseCase(
      mockStaffRepository,
      mockLogger,
      mockI18n,
      mockPermissionService,
    );
  });

  describe("Permission Enforcement", () => {
    const validRequestingUserId = "123e4567-e89b-42d3-a456-426614174000";
    const validStaffId = "123e4567-e89b-42d3-a456-426614174001";

    it("should require MANAGE_STAFF permission before deleting", async () => {
      // Given - Mock translations and user lacks permission
      mockI18n.translate.mockReturnValue("Field is required");
      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError("MANAGE_STAFF", "USER"),
      );

      // When & Then
      await expect(
        useCase.execute({
          staffId: validStaffId,
          requestingUserId: validRequestingUserId,
        }),
      ).rejects.toThrow(InsufficientPermissionsError);

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequestingUserId,
        Permission.MANAGE_STAFF,
        expect.objectContaining({
          action: "delete",
          resource: "staff",
          staffId: validStaffId,
        }),
      );

      // Repository should not be called if permission check fails
      expect(mockStaffRepository.findById).not.toHaveBeenCalled();
      expect(mockStaffRepository.delete).not.toHaveBeenCalled();
    });

    it("should successfully delete staff when user has MANAGE_STAFF permission", async () => {
      // Given - User has permission
      mockPermissionService.requirePermission.mockResolvedValue(undefined);
      mockI18n.translate.mockReturnValue("Staff deleted successfully");

      const mockStaff = {
        getId: () => ({ getValue: () => validStaffId }),
        getEmail: () => ({ getValue: () => "staff@example.com" }),
        getName: () => "Staff Name",
        isActive: () => true,
        canBeDeleted: () => true,
        fullName: "Staff Full Name",
        id: { getValue: () => validStaffId },
      };

      mockStaffRepository.findById.mockResolvedValue(mockStaff as any);
      mockStaffRepository.delete.mockResolvedValue(undefined);

      // When
      const result = await useCase.execute({
        staffId: validStaffId,
        requestingUserId: validRequestingUserId,
      });

      // Then
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequestingUserId,
        Permission.MANAGE_STAFF,
        expect.objectContaining({
          action: "delete",
          resource: "staff",
          staffId: validStaffId,
        }),
      );

      expect(mockStaffRepository.findById).toHaveBeenCalled();
      expect(mockStaffRepository.delete).toHaveBeenCalled();

      expect(result).toEqual({
        success: true,
        staffId: validStaffId,
        message: "Staff deleted successfully",
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Staff deleted successfully",
        expect.objectContaining({
          staffId: validStaffId,
          staffName: "Staff Full Name",
        }),
      );
    });

    it("should throw ResourceNotFoundError when staff does not exist", async () => {
      // Given - User has permission but staff not found
      mockI18n.translate.mockReturnValue("Field is required");
      mockPermissionService.requirePermission.mockResolvedValue(undefined);
      mockStaffRepository.findById.mockResolvedValue(null);

      // When & Then
      await expect(
        useCase.execute({
          staffId: validStaffId,
          requestingUserId: validRequestingUserId,
        }),
      ).rejects.toThrow(ResourceNotFoundError);

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        validRequestingUserId,
        Permission.MANAGE_STAFF,
        expect.objectContaining({
          action: "delete",
          resource: "staff",
          staffId: validStaffId,
        }),
      );

      expect(mockStaffRepository.findById).toHaveBeenCalled();
      expect(mockStaffRepository.delete).not.toHaveBeenCalled();
    });

    it("should log error when repository throws unexpected error", async () => {
      // Given - User has permission but repository fails
      mockI18n.translate.mockReturnValue("Field is required");
      mockPermissionService.requirePermission.mockResolvedValue(undefined);

      const mockStaff = {
        getId: () => ({ getValue: () => validStaffId }),
        getEmail: () => ({ getValue: () => "staff@example.com" }),
        getName: () => "Staff Name",
        isActive: () => true,
        canBeDeleted: () => true,
        fullName: "Staff Full Name",
        id: { getValue: () => validStaffId },
      };

      mockStaffRepository.findById.mockResolvedValue(mockStaff as any);

      const repositoryError = new Error("Database connection failed");
      mockStaffRepository.delete.mockRejectedValue(repositoryError);

      // When & Then
      await expect(
        useCase.execute({
          staffId: validStaffId,
          requestingUserId: validRequestingUserId,
        }),
      ).rejects.toThrow("Database connection failed");

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error deleting staff",
        repositoryError,
        expect.objectContaining({
          staffId: validStaffId,
        }),
      );
    });
  });

  describe("Request Validation", () => {
    it("should validate required fields", async () => {
      mockPermissionService.requirePermission.mockResolvedValue(undefined);
      mockI18n.translate.mockReturnValue("Field is required");

      // Test missing staffId
      await expect(
        useCase.execute({
          staffId: "",
          requestingUserId: "123e4567-e89b-42d3-a456-426614174000",
        }),
      ).rejects.toThrow();

      // Test missing requestingUserId
      await expect(
        useCase.execute({
          staffId: "123e4567-e89b-42d3-a456-426614174001",
          requestingUserId: "",
        }),
      ).rejects.toThrow();
    });

    it("should validate UUID format", async () => {
      mockPermissionService.requirePermission.mockResolvedValue(undefined);
      mockI18n.translate.mockReturnValue("Invalid UUID format");

      // Test invalid staffId UUID
      await expect(
        useCase.execute({
          staffId: "invalid-uuid",
          requestingUserId: "123e4567-e89b-42d3-a456-426614174000",
        }),
      ).rejects.toThrow();
    });
  });
});
