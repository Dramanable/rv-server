/**
 * 🧪 TDD Tests - UpdateUserUseCase Permissions
 *
 * Tests de validation des permissions pour la mise à jour d'utilisateurs.
 * Suivant les règles métier définies dans PERMISSIONS_COMPLETE_AUDIT.md
 */

import {
  InsufficientPermissionsError,
  UserNotFoundError,
} from "../../../../../application/exceptions/auth.exceptions";
import {
  UpdateUserRequest,
  UpdateUserUseCase,
} from "../../../../../application/use-cases/users/update-user.use-case";
import { User } from "../../../../../domain/entities/user.entity";
import { Email } from "../../../../../domain/value-objects/email.vo";
import { UserRole } from "../../../../../shared/enums/user-role.enum";

// ═══════════════════════════════════════════════════════════════
// 🛠️ TEST SETUP & HELPERS
// ═══════════════════════════════════════════════════════════════

// Mocks typés - Version simplifiée
const mockUserRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  emailExists: jest.fn(),
} as any;

const mockPermissionService = {
  canManageUser: jest.fn(),
  canActOnRole: jest.fn(),
} as any;

const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  log: jest.fn(),
} as any;

const mockI18n = {
  translate: jest.fn(),
} as any;

// ═══════════════════════════════════════════════════════════════
// 🧪 TEST DATA
// ═══════════════════════════════════════════════════════════════

const validUserId = "fd8c5ac8-90b2-4d91-8d1b-2c5e1a8f4b3e";
const targetUserId = "bd9c2ac7-80a1-3c82-7c0a-1b4d0a7e3c2d";
const businessId = "business-uuid-12345";

// Créer un utilisateur de test
const createTestUser = (id: string, email: string, role: UserRole): User => {
  const user = User.create(Email.create(email), "Test User", role);
  // Simuler un utilisateur existant avec ID
  (user as any).id = id;
  return user;
};

// ═══════════════════════════════════════════════════════════════
// 🧪 TESTS PRINCIPAUX
// ═══════════════════════════════════════════════════════════════

describe("UpdateUserUseCase - Permission Validation", () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    jest.clearAllMocks();

    // Réinitialiser les mocks par défaut
    mockI18n.translate.mockReturnValue("Mocked translation");
    mockPermissionService.canManageUser.mockResolvedValue(true);
    mockPermissionService.canActOnRole.mockResolvedValue(true);

    useCase = new UpdateUserUseCase(
      mockUserRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe("🔐 Permission Validation - Different Requesting Users", () => {
    it("should allow authorized user to update target user", async () => {
      // Arrange
      const targetUser = createTestUser(
        targetUserId,
        "target@example.com",
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        targetUserId,
        requestingUserId: validUserId,
        updates: {
          email: "newemail@example.com",
        },
      };

      mockUserRepository.findById.mockResolvedValue(targetUser);
      mockPermissionService.canManageUser.mockResolvedValue(true);

      const updatedUser = createTestUser(
        targetUserId,
        "newemail@example.com",
        UserRole.REGULAR_CLIENT,
      );
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act & Assert
      await expect(useCase.execute(request)).resolves.toBeDefined();
      expect(mockPermissionService.canManageUser).toHaveBeenCalledWith(
        validUserId,
        targetUserId,
      );
    });

    it("should deny when user cannot manage target user", async () => {
      // Arrange
      const targetUser = createTestUser(
        targetUserId,
        "target@example.com",
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        targetUserId,
        requestingUserId: validUserId,
        updates: {
          email: "newemail@example.com",
        },
      };

      mockUserRepository.findById.mockResolvedValue(targetUser);
      mockPermissionService.canManageUser.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );
      expect(mockPermissionService.canManageUser).toHaveBeenCalledWith(
        validUserId,
        targetUserId,
      );
    });

    it("should deny role assignment when user cannot act on target role", async () => {
      // Arrange
      const targetUser = createTestUser(
        targetUserId,
        "target@example.com",
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        targetUserId,
        requestingUserId: validUserId,
        updates: {
          role: UserRole.PLATFORM_ADMIN,
        },
      };

      mockUserRepository.findById.mockResolvedValue(targetUser);
      mockPermissionService.canManageUser.mockResolvedValue(true);
      mockPermissionService.canActOnRole.mockResolvedValue(false);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );
      expect(mockPermissionService.canActOnRole).toHaveBeenCalledWith(
        validUserId,
        UserRole.PLATFORM_ADMIN,
      );
    });

    it("should throw UserNotFoundError when target user does not exist", async () => {
      // Arrange
      const request: UpdateUserRequest = {
        targetUserId: "non-existent-user-id",
        requestingUserId: validUserId,
        updates: {
          email: "newemail@example.com",
        },
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(UserNotFoundError);
    });
  });

  describe("🔄 Self-Update Permissions", () => {
    it("should allow user to update their own profile (basic fields)", async () => {
      // Arrange - Self update case
      const requestingUser = createTestUser(
        validUserId,
        "requesting@example.com",
        UserRole.REGULAR_CLIENT,
      );

      const selfUpdateRequest: UpdateUserRequest = {
        targetUserId: validUserId,
        requestingUserId: validUserId, // Same user
        updates: {
          email: "mynewemail@example.com",
        },
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);

      const updatedUser = createTestUser(
        validUserId,
        "mynewemail@example.com",
        UserRole.REGULAR_CLIENT,
      );
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act & Assert
      await expect(useCase.execute(selfUpdateRequest)).resolves.toBeDefined();

      // Self update should not call permission service for basic updates
      expect(mockPermissionService.canManageUser).not.toHaveBeenCalled();
    });

    it("should deny user from changing their own role in self-update", async () => {
      // Arrange - Self update with role change (should be denied)
      const requestingUser = createTestUser(
        validUserId,
        "requesting@example.com",
        UserRole.REGULAR_CLIENT,
      );

      const selfUpdateRequest: UpdateUserRequest = {
        targetUserId: validUserId,
        requestingUserId: validUserId, // Same user
        updates: {
          role: UserRole.BUSINESS_ADMIN, // User trying to elevate themselves
        },
      };

      mockUserRepository.findById.mockResolvedValue(requestingUser);

      // Act & Assert
      await expect(useCase.execute(selfUpdateRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );
    });
  });

  describe("🔍 Logging and Audit", () => {
    it("should log permission validation attempts", async () => {
      // Arrange
      const targetUser = createTestUser(
        targetUserId,
        "target@example.com",
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        targetUserId,
        requestingUserId: validUserId,
        updates: {
          email: "newemail@example.com",
        },
      };

      mockUserRepository.findById.mockResolvedValue(targetUser);
      mockPermissionService.canManageUser.mockResolvedValue(false);

      // Act
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      // Assert - Check that logging occurred
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
