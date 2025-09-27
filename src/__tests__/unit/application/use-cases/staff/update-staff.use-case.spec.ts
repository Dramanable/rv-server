/**
 * 🧪 Tests Unitaires - Phase TDD: RED → GREEN → REFACTOR
 *
 * Tests unitaires pour le cas d'usage de mise à jour du personnel
 * Couche Application - Tests d'orchestration métier
 */

import { UpdateStaffUseCase } from "@application/use-cases/staff/update-staff.use-case";
import { Staff, StaffStatus } from "@domain/entities/staff.entity";
import { StaffNotFoundError } from "@domain/exceptions/staff.exceptions";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { StaffRole } from "@shared/enums/staff-role.enum";
import { ApplicationValidationError } from "../../../../../application/exceptions/application.exceptions";
import { I18nService } from "../../../../../application/ports/i18n.port";
import { Logger } from "../../../../../application/ports/logger.port";
import { IPermissionService } from "../../../../../application/ports/permission.service.interface";
import { StaffRepository } from "../../../../../domain/repositories/staff.repository.interface";

describe("UpdateStaffUseCase", () => {
  let useCase: UpdateStaffUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  const mockStaff = Staff.create({
    businessId: BusinessId.create("550e8400-e29b-41d4-a716-446655440000"),
    profile: {
      firstName: "John",
      lastName: "Doe",
      specialization: "General Medicine",
    },
    role: StaffRole.DOCTOR,
    email: "john.doe@example.com",
  });

  beforeEach(() => {
    mockStaffRepository = {
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

    // Mock permission service
    const mockPermissionService = {
      requirePermission: jest.fn(),
      hasPermission: jest.fn(),
      canActOnRole: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canManageUser: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
    } as jest.Mocked<IPermissionService>;

    useCase = new UpdateStaffUseCase(
      mockStaffRepository,
      mockLogger,
      mockI18n,
      mockPermissionService,
    );
  });

  describe("Parameter validation", () => {
    it("should throw ApplicationValidationError when staffId is missing", async () => {
      const request = {
        staffId: "",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when requestingUserId is missing", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when staffId is not a valid UUID", async () => {
      const request = {
        staffId: "invalid-uuid",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when updates are empty", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {},
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe("Business rules validation", () => {
    beforeEach(() => {
      mockStaffRepository.findById.mockResolvedValue(mockStaff);
    });

    it("should throw ApplicationValidationError when firstName is too short", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "X" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when lastName is too short", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { lastName: "Y" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when email format is invalid", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          email: "invalid-email",
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });

    it("should throw ApplicationValidationError when email already exists", async () => {
      mockStaffRepository.existsByEmail.mockResolvedValue(true);

      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          email: "existing@example.com",
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        ApplicationValidationError,
      );
    });
  });

  describe("Staff not found", () => {
    it("should throw StaffNotFoundError when staff does not exist", async () => {
      mockStaffRepository.findById.mockResolvedValue(null);

      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow(
        StaffNotFoundError,
      );
    });
  });

  describe("Successful update", () => {
    beforeEach(() => {
      mockStaffRepository.findById.mockResolvedValue(mockStaff);
      mockStaffRepository.save.mockResolvedValue(undefined);
      mockStaffRepository.existsByEmail.mockResolvedValue(false);
    });

    it("should update staff successfully with valid data", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: {
            firstName: "Updated John",
            lastName: "Updated Doe",
            specialization: "Cardiology",
          },
          email: "updated.john@example.com",
        },
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockStaff.id.getValue());
      expect(mockStaffRepository.save).toHaveBeenCalledWith(mockStaff);
    });

    it("should update only provided fields (partial update)", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Only FirstName Updated" },
        },
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockStaff.id.getValue());
      expect(mockStaffRepository.save).toHaveBeenCalledWith(mockStaff);
    });

    it("should handle status updates correctly", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          status: StaffStatus.ON_LEAVE,
        },
      };

      const result = await useCase.execute(request);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockStaff.id.getValue());
      expect(mockStaffRepository.save).toHaveBeenCalledWith(mockStaff);
    });
  });

  describe("Logging", () => {
    beforeEach(() => {
      mockStaffRepository.findById.mockResolvedValue(mockStaff);
      mockStaffRepository.save.mockResolvedValue(undefined);
      mockStaffRepository.existsByEmail.mockResolvedValue(false);
    });

    it("should log update attempt", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Attempting to update staff",
        expect.objectContaining({
          staffId: "550e8400-e29b-41d4-a716-446655440002",
          requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        }),
      );
    });

    it("should log successful update", async () => {
      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await useCase.execute(request);

      expect(mockLogger.info).toHaveBeenCalledWith(
        "Staff updated successfully",
        expect.objectContaining({
          staffId: "550e8400-e29b-41d4-a716-446655440002",
          requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        }),
      );
    });

    it("should log errors", async () => {
      mockStaffRepository.findById.mockRejectedValue(
        new Error("Database error"),
      );

      const request = {
        staffId: "550e8400-e29b-41d4-a716-446655440002",
        requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        updates: {
          profile: { firstName: "Updated" },
        },
      };

      await expect(useCase.execute(request)).rejects.toThrow();

      expect(mockLogger.error).toHaveBeenCalledWith(
        "Error updating staff",
        expect.any(Error),
        expect.objectContaining({
          staffId: "550e8400-e29b-41d4-a716-446655440002",
          requestingUserId: "550e8400-e29b-41d4-a716-446655440001",
        }),
      );
    });
  });
});
