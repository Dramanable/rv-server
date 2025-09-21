/**
 * 🧪 GET USER BY ID USE CASE - TDD TESTS
 *
 * Tests pour la récupération d'un utilisateur par ID avec permissions strictes par rôle
 * Test-Driven Development : Red → Green → Refactor
 */

import {
  ForbiddenError,
  UserNotFoundError,
} from '../../../../../application/exceptions/auth.exceptions';
import { I18nService } from '../../../../../application/ports/i18n.port';
import { Logger } from '../../../../../application/ports/logger.port';
import {
  GetUserByIdRequest,
  GetUserByIdUseCase,
} from '../../../../../application/use-cases/users/get-user-by-id.use-case';
import { User } from '../../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../../domain/repositories/user.repository.interface';
import { Email } from '../../../../../domain/value-objects/email.vo';
import { UserRole } from '../../../../../shared/enums/user-role.enum';

// ═══════════════════════════════════════════════════════════════
// 🛠️ TEST SETUP & HELPERS
// ═══════════════════════════════════════════════════════════════

// Mocks typés
const mockUserRepository = {
  findById: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  emailExists: jest.fn(),
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  findAll: jest.fn(),
  findMany: jest.fn(),
  findWithPagination: jest.fn(),
  findByRoleWithPagination: jest.fn(),
  findByNameWithPagination: jest.fn(),
  count: jest.fn(),
  countByRole: jest.fn(),
  exists: jest.fn(),
  export: jest.fn(),
  softDelete: jest.fn(),
  isDeleted: jest.fn(),
} as unknown as jest.Mocked<UserRepository>;

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  audit: jest.fn(),
  child: jest.fn(),
} as unknown as jest.Mocked<Logger>;

const mockI18n = {
  t: jest.fn().mockImplementation((key: string) => key),
  translate: jest.fn().mockImplementation((key: string) => key),
  setDefaultLanguage: jest.fn(),
  exists: jest.fn(),
} as unknown as jest.Mocked<I18nService>;

// Factory pour créer des utilisateurs de test
function createTestUser(
  id: string,
  email: string,
  name: string,
  role: UserRole,
): User {
  const user = User.create(Email.create(email), name, role);
  Object.defineProperty(user, 'id', { value: id, writable: false });
  return user;
}

// ═══════════════════════════════════════════════════════════════
// 🧪 GET USER BY ID USE CASE - TDD TESTS
// ═══════════════════════════════════════════════════════════════

describe('GetUserByIdUseCase', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    getUserByIdUseCase = new GetUserByIdUseCase(
      mockUserRepository,
      mockLogger,
      mockI18n,
    );
  });

  // ═══════════════════════════════════════════════════════════════
  // 🚨 BASIC VALIDATION - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🚨 Basic Validation', () => {
    it('should throw UserNotFoundError when requesting user does not exist', async () => {
      // Arrange
      const request: GetUserByIdRequest = {
        requestingUserId: 'non-existent',
        targetUserId: 'some-user',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );
    });

    it('should throw UserNotFoundError when target user does not exist', async () => {
      // Arrange
      const admin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'non-existent',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'admin-1') return Promise.resolve(admin);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔄 SELF ACCESS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🔄 Self Access', () => {
    it('should allow users to view their own profile', async () => {
      // Arrange
      const user = createTestUser(
        'user-1',
        'user@test.com',
        'User Name',
        UserRole.PRACTITIONER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'user-1',
        targetUserId: 'user-1',
      };

      mockUserRepository.findById.mockResolvedValue(user);

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        id: 'user-1',
        email: 'user@test.com',
        name: 'User Name',
        role: UserRole.PRACTITIONER,
        isActive: true,
        canViewSensitiveData: false, // Pas de data sensible pour soi-même dans ce contexte
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 👑 PLATFORM_ADMIN PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('👑 PLATFORM_ADMIN Permissions', () => {
    it('should allow PLATFORM_ADMIN to view any user', async () => {
      // Arrange
      const admin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Admin',
        UserRole.PLATFORM_ADMIN,
      );
      const targetUser = createTestUser(
        'target-1',
        'target@test.com',
        'Target User',
        UserRole.BUSINESS_OWNER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'target-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'admin-1') return Promise.resolve(admin);
        if (id === 'target-1') return Promise.resolve(targetUser);
        return Promise.resolve(null);
      });

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result).toEqual({
        id: 'target-1',
        email: 'target@test.com',
        name: 'Target User',
        role: UserRole.BUSINESS_OWNER,
        isActive: true,
        canViewSensitiveData: true, // PLATFORM_ADMIN peut voir les données sensibles
      });
    });

    it('should allow PLATFORM_ADMIN to view other PLATFORM_ADMIN', async () => {
      // Arrange
      const admin1 = createTestUser(
        'admin-1',
        'admin1@test.com',
        'Admin 1',
        UserRole.PLATFORM_ADMIN,
      );
      const admin2 = createTestUser(
        'admin-2',
        'admin2@test.com',
        'Admin 2',
        UserRole.PLATFORM_ADMIN,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'admin-2',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'admin-1') return Promise.resolve(admin1);
        if (id === 'admin-2') return Promise.resolve(admin2);
        return Promise.resolve(null);
      });

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result.id).toBe('admin-2');
      expect(result.role).toBe(UserRole.PLATFORM_ADMIN);
      expect(result.canViewSensitiveData).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏢 BUSINESS_OWNER PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🏢 BUSINESS_OWNER Permissions', () => {
    it('should allow BUSINESS_OWNER to view business users', async () => {
      // Arrange
      const owner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Owner',
        UserRole.BUSINESS_OWNER,
      );
      const admin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Admin',
        UserRole.BUSINESS_ADMIN,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'owner-1',
        targetUserId: 'admin-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'owner-1') return Promise.resolve(owner);
        if (id === 'admin-1') return Promise.resolve(admin);
        return Promise.resolve(null);
      });

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result.id).toBe('admin-1');
      expect(result.role).toBe(UserRole.BUSINESS_ADMIN);
      expect(result.canViewSensitiveData).toBe(true); // BUSINESS_OWNER peut voir les données sensibles des employés
    });

    it('should prevent BUSINESS_OWNER from viewing PLATFORM_ADMIN', async () => {
      // Arrange
      const owner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Owner',
        UserRole.BUSINESS_OWNER,
      );
      const admin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'owner-1',
        targetUserId: 'admin-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'owner-1') return Promise.resolve(owner);
        if (id === 'admin-1') return Promise.resolve(admin);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should allow BUSINESS_OWNER to view other BUSINESS_OWNER (peers)', async () => {
      // Arrange
      const owner1 = createTestUser(
        'owner-1',
        'owner1@test.com',
        'Owner 1',
        UserRole.BUSINESS_OWNER,
      );
      const owner2 = createTestUser(
        'owner-2',
        'owner2@test.com',
        'Owner 2',
        UserRole.BUSINESS_OWNER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'owner-1',
        targetUserId: 'owner-2',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'owner-1') return Promise.resolve(owner1);
        if (id === 'owner-2') return Promise.resolve(owner2);
        return Promise.resolve(null);
      });

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result.id).toBe('owner-2');
      expect(result.role).toBe(UserRole.BUSINESS_OWNER);
      expect(result.canViewSensitiveData).toBe(false); // Pas de données sensibles entre pairs
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔧 BUSINESS_ADMIN PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🔧 BUSINESS_ADMIN Permissions', () => {
    it('should allow BUSINESS_ADMIN to view operational users', async () => {
      // Arrange
      const admin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Admin',
        UserRole.BUSINESS_ADMIN,
      );
      const manager = createTestUser(
        'manager-1',
        'manager@test.com',
        'Manager',
        UserRole.LOCATION_MANAGER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'manager-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'admin-1') return Promise.resolve(admin);
        if (id === 'manager-1') return Promise.resolve(manager);
        return Promise.resolve(null);
      });

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result.id).toBe('manager-1');
      expect(result.role).toBe(UserRole.LOCATION_MANAGER);
      expect(result.canViewSensitiveData).toBe(true);
    });

    it('should prevent BUSINESS_ADMIN from viewing management users', async () => {
      // Arrange
      const admin1 = createTestUser(
        'admin-1',
        'admin1@test.com',
        'Admin 1',
        UserRole.BUSINESS_ADMIN,
      );
      const admin2 = createTestUser(
        'admin-2',
        'admin2@test.com',
        'Admin 2',
        UserRole.BUSINESS_ADMIN,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'admin-2',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'admin-1') return Promise.resolve(admin1);
        if (id === 'admin-2') return Promise.resolve(admin2);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📍 LOCATION_MANAGER PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('📍 LOCATION_MANAGER Permissions', () => {
    it('should allow LOCATION_MANAGER to view operational staff', async () => {
      // Arrange
      const manager = createTestUser(
        'manager-1',
        'manager@test.com',
        'Manager',
        UserRole.LOCATION_MANAGER,
      );
      const practitioner = createTestUser(
        'pract-1',
        'pract@test.com',
        'Practitioner',
        UserRole.PRACTITIONER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'manager-1',
        targetUserId: 'pract-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'manager-1') return Promise.resolve(manager);
        if (id === 'pract-1') return Promise.resolve(practitioner);
        return Promise.resolve(null);
      });

      // Act
      const result = await getUserByIdUseCase.execute(request);

      // Assert
      expect(result.id).toBe('pract-1');
      expect(result.role).toBe(UserRole.PRACTITIONER);
      expect(result.canViewSensitiveData).toBe(false); // LOCATION_MANAGER voit les infos de base seulement
    });

    it('should prevent LOCATION_MANAGER from viewing management users', async () => {
      // Arrange
      const manager1 = createTestUser(
        'manager-1',
        'manager1@test.com',
        'Manager 1',
        UserRole.LOCATION_MANAGER,
      );
      const manager2 = createTestUser(
        'manager-2',
        'manager2@test.com',
        'Manager 2',
        UserRole.LOCATION_MANAGER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'manager-1',
        targetUserId: 'manager-2',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'manager-1') return Promise.resolve(manager1);
        if (id === 'manager-2') return Promise.resolve(manager2);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🚨 RESTRICTED ROLES - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🚨 Restricted Roles', () => {
    it('should prevent REGULAR_CLIENT from viewing other users', async () => {
      // Arrange
      const client = createTestUser(
        'client-1',
        'client@test.com',
        'Client',
        UserRole.REGULAR_CLIENT,
      );
      const otherUser = createTestUser(
        'other-1',
        'other@test.com',
        'Other',
        UserRole.PRACTITIONER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'client-1',
        targetUserId: 'other-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'client-1') return Promise.resolve(client);
        if (id === 'other-1') return Promise.resolve(otherUser);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should prevent PRACTITIONER from viewing other users (except themselves)', async () => {
      // Arrange
      const practitioner = createTestUser(
        'pract-1',
        'pract@test.com',
        'Practitioner',
        UserRole.PRACTITIONER,
      );
      const otherUser = createTestUser(
        'other-1',
        'other@test.com',
        'Other',
        UserRole.PRACTITIONER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'pract-1',
        targetUserId: 'other-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'pract-1') return Promise.resolve(practitioner);
        if (id === 'other-1') return Promise.resolve(otherUser);
        return Promise.resolve(null);
      });

      // Act & Assert
      await expect(getUserByIdUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📊 LOGGING - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('📊 Logging', () => {
    it('should log successful user retrieval', async () => {
      // Arrange
      const admin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Admin',
        UserRole.PLATFORM_ADMIN,
      );
      const targetUser = createTestUser(
        'target-1',
        'target@test.com',
        'Target',
        UserRole.PRACTITIONER,
      );

      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'target-1',
      };

      mockUserRepository.findById.mockImplementation((id: string) => {
        if (id === 'admin-1') return Promise.resolve(admin);
        if (id === 'target-1') return Promise.resolve(targetUser);
        return Promise.resolve(null);
      });

      // Act
      await getUserByIdUseCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'get_user_attempt',
        expect.objectContaining({
          operation: 'GetUserById',
          requestingUserId: 'admin-1',
          targetUserId: 'target-1',
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'get_user_success',
        expect.objectContaining({
          operation: 'GetUserById',
          retrievedUserId: 'target-1',
          requestingUserId: 'admin-1',
        }),
      );
    });

    it('should log errors', async () => {
      // Arrange
      const request: GetUserByIdRequest = {
        requestingUserId: 'admin-1',
        targetUserId: 'target-1',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act
      try {
        await getUserByIdUseCase.execute(request);
      } catch (error) {
        // Expected error
      }

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'get_user_failed',
        expect.any(UserNotFoundError),
        expect.objectContaining({
          operation: 'GetUserById',
          requestingUserId: 'admin-1',
          targetUserId: 'target-1',
        }),
      );
    });
  });
});
