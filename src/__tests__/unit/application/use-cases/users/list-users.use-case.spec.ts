/**
 * 👥 LIST USERS USE CASE TESTS - TDD Clean Architecture
 *
 * Tests unitaires pour ListUsersUseCase avec règles de permissions par rôle
 * TDD First : Définition des comportements attendus avant l'implémentation
 */

import {
  ForbiddenError,
  UserNotFoundError,
} from '../../../../../application/exceptions/auth.exceptions';
import {
  createMockI18nService,
  createMockLogger,
  createMockUserRepository,
} from '../../../../../application/mocks/typed-mocks';
import {
  ListUsersUseCase,
  type ListUsersRequest,
} from '@application/use-cases/users/list-users.use-case';
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { UserRole } from '@shared/enums/user-role.enum';

describe('ListUsersUseCase', () => {
  let listUsersUseCase: ListUsersUseCase;
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
    // Override id for testing purposes (using Object.defineProperty to modify readonly)
    Object.defineProperty(user, 'id', { value: id, writable: false });
    return user;
  };

  beforeEach(() => {
    mockUserRepository = createMockUserRepository();
    mockLogger = createMockLogger();
    mockI18nService = createMockI18nService();

    listUsersUseCase = new ListUsersUseCase(
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
      const request: ListUsersRequest = {
        requestingUserId: 'non-existent-user',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(listUsersUseCase.execute(request)).rejects.toThrow(
        UserNotFoundError,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(
        'non-existent-user',
      );
    });

    it('should throw ForbiddenError when REGULAR_CLIENT tries to list users', async () => {
      // Arrange
      const regularClient = createTestUser(
        'client-1',
        'client@test.com',
        'Regular Client',
        UserRole.REGULAR_CLIENT,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'client-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(regularClient);

      // Act & Assert
      await expect(listUsersUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });

    it('should throw ForbiddenError when PRACTITIONER tries to list users', async () => {
      // Arrange
      const practitioner = createTestUser(
        'practitioner-1',
        'doctor@test.com',
        'Dr. Smith',
        UserRole.PRACTITIONER,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'practitioner-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(practitioner);

      // Act & Assert
      await expect(listUsersUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 👑 PLATFORM_ADMIN PERMISSIONS - PEUT VOIR TOUT LE MONDE SAUF LUI-MÊME
  // ═══════════════════════════════════════════════════════════════

  describe('👑 PLATFORM_ADMIN Permissions', () => {
    it('should allow PLATFORM_ADMIN to list all users EXCEPT himself', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const otherAdmin = createTestUser(
        'admin-2',
        'admin2@test.com',
        'Other Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const businessOwner = createTestUser(
        'owner-1',
        'owner@test.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const client = createTestUser(
        'client-1',
        'client@test.com',
        'Regular Client',
        UserRole.REGULAR_CLIENT,
      );

      const allUsersExceptRequester = [otherAdmin, businessOwner, client];

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: allUsersExceptRequester,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await listUsersUseCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.data.map((u) => u.id)).toEqual([
        'admin-2',
        'owner-1',
        'client-1',
      ]);
      expect(result.data.map((u) => u.id)).not.toContain('admin-1'); // Ne doit pas se voir lui-même
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            excludeUserIds: ['admin-1'], // Doit exclure l'utilisateur requérant
          }),
        }),
      );
    });

    it('should allow PLATFORM_ADMIN to filter by specific roles', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const businessOwners = [
        createTestUser(
          'owner-1',
          'owner1@test.com',
          'Owner 1',
          UserRole.BUSINESS_OWNER,
        ),
        createTestUser(
          'owner-2',
          'owner2@test.com',
          'Owner 2',
          UserRole.BUSINESS_OWNER,
        ),
      ];

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 20 },
        filters: {
          roles: [UserRole.BUSINESS_OWNER],
        },
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: businessOwners,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await listUsersUseCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every((u) => u.role === UserRole.BUSINESS_OWNER)).toBe(
        true,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏢 BUSINESS_OWNER PERMISSIONS
  // ═══════════════════════════════════════════════════════════════

  describe('🏢 BUSINESS_OWNER Permissions', () => {
    it('should allow BUSINESS_OWNER to see users from his business only', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner@business1.com',
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      const businessUsers = [
        createTestUser(
          'admin-1',
          'admin@business1.com',
          'Business Admin',
          UserRole.BUSINESS_ADMIN,
        ),
        createTestUser(
          'manager-1',
          'manager@business1.com',
          'Location Manager',
          UserRole.LOCATION_MANAGER,
        ),
        createTestUser(
          'doctor-1',
          'doctor@business1.com',
          'Doctor',
          UserRole.PRACTITIONER,
        ),
      ];

      const request: ListUsersRequest = {
        requestingUserId: 'owner-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(businessOwner);
      mockUserRepository.search.mockResolvedValue({
        data: businessUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await listUsersUseCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            businessId: 'business-1', // Filtre par business ID
            excludeRoles: [UserRole.PLATFORM_ADMIN, UserRole.BUSINESS_OWNER], // Ne peut pas voir les autres owners
          }),
        }),
      );
    });

    it('should prevent BUSINESS_OWNER from seeing other business owners', async () => {
      // Arrange
      const businessOwner = createTestUser(
        'owner-1',
        'owner1@business1.com',
        'Business Owner 1',
        UserRole.BUSINESS_OWNER,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'owner-1',
        pagination: { page: 1, limit: 20 },
        filters: {
          roles: [UserRole.BUSINESS_OWNER], // Essaie de voir les autres owners
        },
      };

      mockUserRepository.findById.mockResolvedValue(businessOwner);

      // Act & Assert
      await expect(listUsersUseCase.execute(request)).rejects.toThrow(
        ForbiddenError,
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏪 BUSINESS_ADMIN PERMISSIONS
  // ═══════════════════════════════════════════════════════════════

  describe('🏪 BUSINESS_ADMIN Permissions', () => {
    it('should allow BUSINESS_ADMIN to see business users but not owners/platform admins', async () => {
      // Arrange
      const businessAdmin = createTestUser(
        'admin-1',
        'admin@business1.com',
        'Business Admin',
        UserRole.BUSINESS_ADMIN,
      );

      const allowedUsers = [
        createTestUser(
          'manager-1',
          'manager@business1.com',
          'Manager',
          UserRole.LOCATION_MANAGER,
        ),
        createTestUser(
          'doctor-1',
          'doctor@business1.com',
          'Doctor',
          UserRole.PRACTITIONER,
        ),
        createTestUser(
          'client-1',
          'client@business1.com',
          'Client',
          UserRole.REGULAR_CLIENT,
        ),
      ];

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(businessAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: allowedUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await listUsersUseCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            businessId: 'business-1',
            excludeRoles: [UserRole.PLATFORM_ADMIN, UserRole.BUSINESS_OWNER],
          }),
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🏪 LOCATION_MANAGER PERMISSIONS
  // ═══════════════════════════════════════════════════════════════

  describe('🏪 LOCATION_MANAGER Permissions', () => {
    it('should allow LOCATION_MANAGER to see users from his location only', async () => {
      // Arrange
      const locationManager = createTestUser(
        'manager-1',
        'manager@location1.com',
        'Location Manager',
        UserRole.LOCATION_MANAGER,
      );

      const locationUsers = [
        createTestUser(
          'doctor-1',
          'doctor@location1.com',
          'Doctor',
          UserRole.PRACTITIONER,
        ),
        createTestUser(
          'assistant-1',
          'assistant@location1.com',
          'Assistant',
          UserRole.ASSISTANT,
        ),
        createTestUser(
          'client-1',
          'client@location1.com',
          'Client',
          UserRole.REGULAR_CLIENT,
        ),
      ];

      const request: ListUsersRequest = {
        requestingUserId: 'manager-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(locationManager);
      mockUserRepository.search.mockResolvedValue({
        data: locationUsers,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 3,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      const result = await listUsersUseCase.execute(request);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            locationId: 'location-1',
            excludeRoles: [
              UserRole.PLATFORM_ADMIN,
              UserRole.BUSINESS_OWNER,
              UserRole.BUSINESS_ADMIN,
              UserRole.LOCATION_MANAGER,
            ],
          }),
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📄 PAGINATION TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('📄 Pagination', () => {
    it('should respect pagination parameters', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 2, limit: 5 },
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 2,
          totalPages: 10,
          totalItems: 50,
          itemsPerPage: 5,
          hasNextPage: true,
          hasPreviousPage: true,
        },
      });

      // Act
      const result = await listUsersUseCase.execute(request);

      // Assert
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.itemsPerPage).toBe(5);
      expect(result.meta.totalItems).toBe(50);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
    });

    it('should enforce maximum limit of 100', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 200 }, // Limite trop élevée
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 100,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      await listUsersUseCase.execute(request);

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100, // Doit être plafonné à 100
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔍 FILTERING TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('🔍 Filtering', () => {
    it('should apply search filters correctly', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 20 },
        filters: {
          search: 'john',
          email: 'doctor@clinic.com',
          roles: [UserRole.PRACTITIONER],
          isActive: true,
          createdAfter: '2024-01-01',
          createdBefore: '2024-12-31',
        },
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      await listUsersUseCase.execute(request);

      // Assert
      expect(mockUserRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({
            query: 'john',
          }),
          filters: expect.objectContaining({
            role: [UserRole.PRACTITIONER],
            isActive: true,
            createdAt: expect.objectContaining({
              from: expect.any(Date),
              to: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📊 LOGGING TESTS
  // ═══════════════════════════════════════════════════════════════

  describe('📊 Logging', () => {
    it('should log successful operations', async () => {
      // Arrange
      const platformAdmin = createTestUser(
        'admin-1',
        'admin@test.com',
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 20 },
      };

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockResolvedValue({
        data: [],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Act
      await listUsersUseCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('list_attempt'),
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('list_success'),
        expect.objectContaining({
          resultCount: 0,
          totalItems: 0,
          currentPage: 1,
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

      const request: ListUsersRequest = {
        requestingUserId: 'admin-1',
        pagination: { page: 1, limit: 20 },
      };

      const error = new Error('Database connection failed');

      mockUserRepository.findById.mockResolvedValue(platformAdmin);
      mockUserRepository.search.mockRejectedValue(error);

      // Act & Assert
      await expect(listUsersUseCase.execute(request)).rejects.toThrow(error);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('list_failed'),
        error,
        expect.any(Object),
      );
    });
  });
});
