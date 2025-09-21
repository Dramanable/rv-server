/**
 * ✏️ UPDATE USER USE CASE TESTS - TDD Clean Architecture
 *
 * Tests unitaires pour UpdateUserUseCase avec règles de permissions strictes
 * TDD First : Définition des comportements attendus avant l'implémentation
 */

import {
  DuplicationError,
  ForbiddenError,
  UserNotFoundError,
  ValidationError,
} from '../../../../../application/exceptions/auth.exceptions';
import {
  createMockI18nService,
  createMockLogger,
  createMockUserRepository,
} from '../../../../../application/mocks/typed-mocks';
import {
  UpdateUserUseCase,
  type UpdateUserRequest,
} from '../../../../../application/use-cases/users/update-user.use-case';
import { User } from '../../../../../domain/entities/user.entity';
import { Email } from '../../../../../domain/value-objects/email.vo';
import { UserRole } from '../../../../../shared/enums/user-role.enum';

describe('UpdateUserUseCase', () => {
  let updateUserUseCase: UpdateUserUseCase;
  let mockUserRepository: ReturnType<typeof createMockUserRepository>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let mockI18nService: ReturnType<typeof createMockI18nService>;

  // Test Data Factory
  const createTestUser = (
    id: string,
    email: string,
    name: string,
    role: UserRole,
    businessId?: string,
  ): User => {
    const user = User.create(Email.create(email), name, role);
    // Override id for testing purposes
    Object.defineProperty(user, 'id', { value: id, writable: false });
    return user;
  };

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockLogger = createMockLogger();
    mockI18nService = createMockI18nService();

    updateUserUseCase = new UpdateUserUseCase(
      mockUserRepository,
      mockLogger,
      mockI18nService,
    );
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔒 TESTS DE PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🚨 Permission Validation', () => {
    it('should throw UserNotFoundError when requesting user does not exist', async () => {
      // Arrange
      const request: UpdateUserRequest = {
        requestingUserId: 'non-existent-user',
        targetUserId: 'target-user-1',
        updates: { name: 'New Name' },
      };

      mockUserRepository.findById.mockResolvedValueOnce(null); // Requesting user not found

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        'non-existent-user',
      );
    });

    it('should throw UserNotFoundError when target user does not exist', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'non-existent-target',
        updates: { name: 'New Name' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin) // Requesting user exists
        .mockResolvedValueOnce(null); // Target user not found

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('should throw ForbiddenError when REGULAR_CLIENT tries to update users', async () => {
      // Arrange
      const regularClient = createTestUser(
        'client-1',
        'client@test.com',
        'Regular Client',
        UserRole.REGULAR_CLIENT,
      );

      const otherUser = createTestUser(
        'other-user',
        'other@test.com',
        'Other User',
        UserRole.PRACTITIONER,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'client-1',
        targetUserId: 'other-user',
        updates: { name: 'New Name' },
      };

      // Mock différents utilisateurs selon l'ID
      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'client-1') return Promise.resolve(regularClient);
        if (id === 'other-user') return Promise.resolve(otherUser);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 👑 PLATFORM_ADMIN PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('👑 PLATFORM_ADMIN Permissions', () => {
    it('should allow PLATFORM_ADMIN to update any user', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const targetUser = createTestUser(
        'target-1',
        'target@test.com',
        'Target User',
        UserRole.BUSINESS_OWNER,
      );

      const updatedUser = createTestUser(
        'target-1',
        'target@test.com',
        'Updated Name',
        UserRole.BUSINESS_OWNER,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'target-1',
        updates: { name: 'Updated Name' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Updated Name');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should allow PLATFORM_ADMIN to change user roles', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const targetUser = createTestUser(
        'target-1',
        'target@test.com',
        'Target User',
        UserRole.REGULAR_CLIENT,
      );

      const updatedUser = createTestUser(
        'target-1',
        'target@test.com',
        'Target User',
        UserRole.BUSINESS_ADMIN,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'target-1',
        updates: { role: UserRole.BUSINESS_ADMIN }, // Role change
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.role).toBe(UserRole.BUSINESS_ADMIN);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏢 BUSINESS_OWNER PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🏢 BUSINESS_OWNER Permissions', () => {
    it('should allow BUSINESS_OWNER to update business users', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const targetUser = createTestUser(
        'admin-1',
        'admin@business.com',
        'Business Admin',
        UserRole.BUSINESS_ADMIN,
      );

      const updatedUser = createTestUser(
        'admin-1',
        'admin@business.com',
        'Updated Admin',
        UserRole.BUSINESS_ADMIN,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'owner-1',
        targetUserId: 'admin-1',
        updates: { name: 'Updated Admin' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(businessOwner)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Updated Admin');
    });

    it('should prevent BUSINESS_OWNER from updating PLATFORM_ADMIN', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'owner-1',
        targetUserId: 'admin-1',
        updates: { name: 'Updated Admin' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(businessOwner)
        .mockResolvedValueOnce(platformAdmin);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should prevent BUSINESS_OWNER from elevating role to PLATFORM_ADMIN', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const targetUser = createTestUser(
        'user-1',
        'user@test.com',
        'Regular User',
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'owner-1',
        targetUserId: 'user-1',
        updates: { role: UserRole.PLATFORM_ADMIN }, // Forbidden elevation!
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(businessOwner)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔄 SELF-UPDATE PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🔄 Self-Update Permissions', () => {
    it('should allow users to update their own profile (limited fields)', async () => {
      // Arrange
      const user = createTestUser(
        'user-1',
        'user@test.com',
        'User Name',
        UserRole.PRACTITIONER,
      );

      const updatedUser = createTestUser(
        'user-1',
        'user@test.com',
        'Updated Name',
        UserRole.PRACTITIONER,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'user-1',
        targetUserId: 'user-1', // Self-update
        updates: { name: 'Updated Name' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(user) // Requesting user
        .mockResolvedValueOnce(user); // Target user (same)
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await updateUserUseCase.execute(request);

      // Assert
      expect(result.name).toBe('Updated Name');
    });

    it('should prevent users from changing their own role', async () => {
      // Arrange
      const user = createTestUser(
        'user-1',
        'user@test.com',
        'User Name',
        UserRole.PRACTITIONER,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'user-1',
        targetUserId: 'user-1', // Self-update
        updates: { role: UserRole.BUSINESS_ADMIN }, // Forbidden!
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(user);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ✅ VALIDATION TESTS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('✅ Data Validation', () => {
    it('should throw ValidationError for invalid email update', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const targetUser = createTestUser(
        'user-1',
        'user@test.com',
        'User',
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'user-1',
        updates: { email: 'invalid-email' }, // Invalid!
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin)
        .mockResolvedValueOnce(targetUser);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw DuplicationError when email already exists', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const targetUser = createTestUser(
        'user-1',
        'user@test.com',
        'User',
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'user-1',
        updates: { email: 'existing@test.com' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.emailExists.mockResolvedValue(true); // Already exists!

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        DuplicationError,
      );
    });

    it('should validate empty updates', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'user-1',
        updates: {}, // Empty updates!
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📊 LOGGING & AUDIT - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('📊 Logging', () => {
    it('should log successful user update', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const targetUser = createTestUser(
        'user-1',
        'user@test.com',
        'User',
        UserRole.REGULAR_CLIENT,
      );

      const updatedUser = createTestUser(
        'user-1',
        'user@test.com',
        'Updated User',
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'user-1',
        updates: { name: 'Updated User' },
      };

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Act
      await updateUserUseCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'update_attempt',
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'update_success',
        expect.objectContaining({
          updatedUserId: 'user-1',
          changedFields: ['name'],
        }),
      );
    });

    it('should log errors', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const targetUser = createTestUser(
        'user-1',
        'user@test.com',
        'User',
        UserRole.REGULAR_CLIENT,
      );

      const request: UpdateUserRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'user-1',
        updates: { name: 'Updated User' },
      };

      const error = new Error('Database connection failed');

      mockUserRepository.findById
        .mockResolvedValueOnce(platformAdmin)
        .mockResolvedValueOnce(targetUser);
      mockUserRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(updateUserUseCase.execute(request)).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'update_failed',
        error,
        expect.any(Object),
      );
    });
  });
});
