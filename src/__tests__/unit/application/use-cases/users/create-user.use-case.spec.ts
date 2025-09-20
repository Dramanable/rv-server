/**
 * 👤 CREATE USER USE CASE TESTS - TDD Clean Architecture
 *
 * Tests unitaires pour CreateUserUseCase avec règles de permissions et validation
 * TDD First : Définition des comportements attendus avant l'implémentation
 */

import {
  CreateUserUseCase,
  type CreateUserRequest,
} from '../../../../../application/use-cases/users/create-user.use-case';
import { UserRole } from '../../../../../shared/enums/user-role.enum';
import { User } from '../../../../../domain/entities/user.entity';
import { Email } from '../../../../../domain/value-objects/email.vo';
import {
  ForbiddenError,
  UserNotFoundError,
  ValidationError,
  DuplicationError,
} from '../../../../../application/exceptions/auth.exceptions';
import { createMockUserRepository } from '../../../../../application/mocks/typed-mocks';
import { createMockLogger } from '../../../../../application/mocks/typed-mocks';
import { createMockI18nService } from '../../../../../application/mocks/typed-mocks';

describe('CreateUserUseCase', () => {
  let createUserUseCase: CreateUserUseCase;
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

    createUserUseCase = new CreateUserUseCase(
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
      const request: CreateUserRequest = {
        requestingUserId: 'non-existent-user',
        email: 'newuser@test.com',
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        'non-existent-user',
      );
    });

    it('should throw ForbiddenError when REGULAR_CLIENT tries to create users', async () => {
      // Arrange
      const regularClient = createTestUser(
        'client-1',
        'client@test.com',
        'Regular Client',
        UserRole.REGULAR_CLIENT,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'client-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      mockUserRepository.findById.mockResolvedValue(regularClient);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw ForbiddenError when PRACTITIONER tries to create users', async () => {
      // Arrange
      const practitioner = createTestUser(
        'pract-1',
        'practitioner@test.com',
        'Practitioner',
        UserRole.PRACTITIONER,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'pract-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      mockUserRepository.findById.mockResolvedValue(practitioner);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 👑 PLATFORM_ADMIN PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('👑 PLATFORM_ADMIN Permissions', () => {
    it('should allow PLATFORM_ADMIN to create any user', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'newowner@test.com',
        name: 'New Business Owner',
        role: UserRole.BUSINESS_OWNER,
      };

      const expectedNewUser = createTestUser(
        'new-user-id',
        'newowner@test.com',
        'New Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(expectedNewUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.id).toBe('new-user-id');
      expect(result.email).toBe('newowner@test.com');
      expect(result.role).toBe(UserRole.BUSINESS_OWNER);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should allow PLATFORM_ADMIN to create other PLATFORM_ADMIN users', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'newadmin@test.com',
        name: 'New Platform Admin',
        role: UserRole.PLATFORM_ADMIN,
      };

      const expectedNewUser = createTestUser(
        'new-admin-id',
        'newadmin@test.com',
        'New Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(expectedNewUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.role).toBe(UserRole.PLATFORM_ADMIN);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏢 BUSINESS_OWNER PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🏢 BUSINESS_OWNER Permissions', () => {
    it('should allow BUSINESS_OWNER to create business-level users', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
        'business-1',
      );

      const request: CreateUserRequest = {
        requestingUserId: 'owner-1',
        email: 'newadmin@business.com',
        name: 'New Business Admin',
        role: UserRole.BUSINESS_ADMIN,
        businessId: 'business-1',
      };

      const expectedNewUser = createTestUser(
        'new-admin-id',
        'newadmin@business.com',
        'New Business Admin',
        UserRole.BUSINESS_ADMIN,
      );

      mockUserRepository.findById.mockResolvedValue(businessOwner);
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(expectedNewUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.role).toBe(UserRole.BUSINESS_ADMIN);
      expect(mockUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: expect.objectContaining({ value: 'newadmin@business.com' }),
          name: 'New Business Admin',
          role: UserRole.BUSINESS_ADMIN,
        }),
      );
    });

    it('should prevent BUSINESS_OWNER from creating PLATFORM_ADMIN', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'owner-1',
        email: 'newadmin@test.com',
        name: 'New Admin',
        role: UserRole.PLATFORM_ADMIN, // Forbidden!
      };

      mockUserRepository.findById.mockResolvedValue(businessOwner);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should prevent BUSINESS_OWNER from creating other BUSINESS_OWNER', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'owner-1',
        email: 'newowner@test.com',
        name: 'New Business Owner',
        role: UserRole.BUSINESS_OWNER, // Forbidden!
      };

      mockUserRepository.findById.mockResolvedValue(businessOwner);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏪 BUSINESS_ADMIN PERMISSIONS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('🏪 BUSINESS_ADMIN Permissions', () => {
    it('should allow BUSINESS_ADMIN to create location-level users', async () => {
      // Arrange
      const businessAdmin = createTestUser(
        'badmin-1',
        'badmin@test.com',
        'Business Admin',
        UserRole.BUSINESS_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'badmin-1',
        email: 'newmanager@test.com',
        name: 'New Location Manager',
        role: UserRole.LOCATION_MANAGER,
        businessId: 'business-1',
        locationId: 'location-1',
      };

      const expectedNewUser = createTestUser(
        'new-manager-id',
        'newmanager@test.com',
        'New Location Manager',
        UserRole.LOCATION_MANAGER,
      );

      mockUserRepository.findById.mockResolvedValue(businessAdmin);
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(expectedNewUser);

      // Act
      const result = await createUserUseCase.execute(request);

      // Assert
      expect(result.role).toBe(UserRole.LOCATION_MANAGER);
    });

    it('should prevent BUSINESS_ADMIN from creating management roles', async () => {
      // Arrange
      const businessAdmin = createTestUser(
        'badmin-1',
        'badmin@test.com',
        'Business Admin',
        UserRole.BUSINESS_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'badmin-1',
        email: 'newowner@test.com',
        name: 'New Business Owner',
        role: UserRole.BUSINESS_OWNER, // Forbidden!
      };

      mockUserRepository.findById.mockResolvedValue(businessAdmin);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ✅ VALIDATION TESTS - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('✅ Data Validation', () => {
    it('should throw ValidationError for invalid email', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'invalid-email', // Invalid!
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        ValidationError,
      );
    });

    it('should throw ValidationError for empty name', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'valid@test.com',
        name: '', // Empty!
        role: UserRole.REGULAR_CLIENT,
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
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

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'existing@test.com',
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.emailExists.mockResolvedValue(true); // Already exists!

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(
        DuplicationError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📊 LOGGING & AUDIT - TDD
  // ═══════════════════════════════════════════════════════════════

  describe('📊 Logging', () => {
    it('should log successful user creation', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      const expectedNewUser = createTestUser(
        'new-user-id',
        'newuser@test.com',
        'New User',
        UserRole.REGULAR_CLIENT,
      );

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.save.mockResolvedValue(expectedNewUser);

      // Act
      await createUserUseCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'create_attempt',
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'create_success',
        expect.objectContaining({
          createdUserId: 'new-user-id',
          createdUserRole: UserRole.REGULAR_CLIENT,
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

      const request: CreateUserRequest = {
        requestingUserId: 'admin-1',
        email: 'newuser@test.com',
        name: 'New User',
        role: UserRole.REGULAR_CLIENT,
      };

      const error = new Error('Database connection failed');

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.emailExists.mockResolvedValue(false);
      mockUserRepository.save.mockRejectedValue(error);

      // Act & Assert
      await expect(createUserUseCase.execute(request)).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'create_failed',
        error,
        expect.any(Object),
      );
    });
  });
});
