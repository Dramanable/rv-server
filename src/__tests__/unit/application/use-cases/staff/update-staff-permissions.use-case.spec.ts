/**
 * 🧪 TDD Test - UpdateStaffUseCase avec IPermissionService
 *
 * Test d'intégration entre UpdateStaffUseCase et système de permissions unifié
 */

import { I18nService } from "../../../../../application/ports/i18n.port";
import { Logger } from "../../../../../application/ports/logger.port";
import { IPermissionService } from "../../../../../application/ports/permission.service.interface";
import {
  UpdateStaffRequest,
  UpdateStaffUseCase,
} from "../../../../../application/use-cases/staff/update-staff.use-case";
import { StaffRepository } from "../../../../../domain/repositories/staff.repository.interface";
import { Permission } from "../../../../../shared/enums/permission.enum";
import { StaffRole } from "../../../../../shared/enums/staff-role.enum";

describe("UpdateStaffUseCase - Permissions Integration", () => {
  let useCase: UpdateStaffUseCase;
  let mockStaffRepository: jest.Mocked<StaffRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;
  let mockPermissionService: jest.Mocked<IPermissionService>;

  beforeEach(() => {
    mockStaffRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      save: jest.fn(),
    } as any;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    } as any;

    mockI18n = {
      translate: jest.fn().mockReturnValue("Mocked translation"),
    } as any;

    mockPermissionService = {
      requirePermission: jest.fn(),
    } as any;

    useCase = new UpdateStaffUseCase(
      mockStaffRepository,
      mockLogger,
      mockI18n,
      mockPermissionService,
    );
  });

  it("should call IPermissionService.requirePermission with correct parameters", async () => {
    // Given - Pas de patterns legacy attendus dans le code
    const request: UpdateStaffRequest = {
      staffId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      requestingUserId: "f47ac10b-58cc-4372-a567-0e02b2c3d478",
      updates: {
        profile: {
          firstName: "John Updated",
          lastName: "Doe Updated",
        },
      },
    };

    // Mock des dépendances
    const mockStaff = {
      id: { getValue: () => "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
      businessId: { getValue: () => "f47ac10b-58cc-4372-a567-0e02b2c3d477" },
      profile: { firstName: "John", lastName: "Doe" },
      role: StaffRole.DOCTOR,
      email: { getValue: () => "john.doe@example.com" },
      status: "ACTIVE",
      updatedAt: new Date(),
    };
    mockStaffRepository.findById.mockResolvedValue(mockStaff as any);
    mockStaffRepository.existsByEmail.mockResolvedValue(false);
    mockStaffRepository.save.mockResolvedValue(mockStaff as any);
    mockPermissionService.requirePermission.mockResolvedValue(undefined);

    // When
    await useCase.execute(request);

    // Then - IPermissionService.requirePermission DOIT être appelé avec les bons paramètres
    expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
      request.requestingUserId,
      Permission.MANAGE_STAFF,
      {
        action: "update",
        resource: "staff",
        staffId: request.staffId,
      },
    );
  });

  it("should NOT use legacy validatePermissions or hasPermission patterns", async () => {
    // Given - Use case configuré avec IPermissionService
    const request: UpdateStaffRequest = {
      staffId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      requestingUserId: "f47ac10b-58cc-4372-a567-0e02b2c3d478",
      updates: {
        profile: {
          firstName: "John Updated",
        },
      },
    };

    // Mock des dépendances
    const mockStaff = {
      id: { getValue: () => "f47ac10b-58cc-4372-a567-0e02b2c3d479" },
      businessId: { getValue: () => "f47ac10b-58cc-4372-a567-0e02b2c3d477" },
      profile: { firstName: "John", lastName: "Doe" },
      role: StaffRole.DOCTOR,
      email: { getValue: () => "john.doe@example.com" },
      status: "ACTIVE",
      updatedAt: new Date(),
    };
    mockStaffRepository.findById.mockResolvedValue(mockStaff as any);
    mockStaffRepository.existsByEmail.mockResolvedValue(false);
    mockStaffRepository.save.mockResolvedValue(mockStaff as any);
    mockPermissionService.requirePermission.mockResolvedValue(undefined);

    // When
    await useCase.execute(request);

    // Then - Devrait utiliser IPermissionService.requirePermission au lieu de patterns legacy
    expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
      request.requestingUserId,
      Permission.MANAGE_STAFF,
      expect.any(Object),
    );

    // La classe doit avoir une propriété permissionService
    expect((useCase as any).permissionService).toBeDefined();
  });

  it("should handle permission denied correctly", async () => {
    // Given
    const request: UpdateStaffRequest = {
      staffId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      requestingUserId: "f47ac10b-58cc-4372-a567-0e02b2c3d478",
      updates: {
        profile: {
          firstName: "John Updated",
        },
      },
    };

    // Mock permission denied
    const permissionError = new Error(
      "Insufficient permissions to manage staff",
    );
    mockPermissionService.requirePermission.mockRejectedValue(permissionError);

    // When & Then
    await expect(useCase.execute(request)).rejects.toThrow(
      "Insufficient permissions to manage staff",
    );

    // Verify that permission check was called but repository was not
    expect(mockPermissionService.requirePermission).toHaveBeenCalled();
    expect(mockStaffRepository.findById).not.toHaveBeenCalled();
  });
});
