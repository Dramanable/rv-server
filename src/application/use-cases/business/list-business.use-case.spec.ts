/**
 * 🧪 LIST BUSINESS USE CASE TESTS
 * ✅ Clean Architecture + TDD compliant
 * ✅ SOLID principles applied
 */

import {
  ListBusinessUseCase,
  ListBusinessRequest,
  ListBusinessResponse,
} from './list-business.use-case';
import { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { Logger } from '../../../application/ports/logger.port';
import { I18nService } from '../../../application/ports/i18n.port';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { InsufficientPermissionsError } from '../../../application/exceptions/application.exceptions';

describe('ListBusinessUseCase', () => {
  let useCase: ListBusinessUseCase;
  let mockBusinessRepository: jest.Mocked<BusinessRepository>;
  let mockUserRepository: jest.Mocked<UserRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // Mocks typés avec jest.Mocked
    mockBusinessRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findBySector: jest.fn(),
      search: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      existsByName: jest.fn(),
      findNearLocation: jest.fn(),
      getStatistics: jest.fn(),
    } as jest.Mocked<BusinessRepository>;

    mockUserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByUsername: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      search: jest.fn(),
      findByRole: jest.fn(),
      emailExists: jest.fn(),
      existsByUsername: jest.fn(),
      updatePassword: jest.fn(),
      updateActiveStatus: jest.fn(),
      countSuperAdmins: jest.fn(),
      count: jest.fn(),
      countWithFilters: jest.fn(),
      update: jest.fn(),
      updateBatch: jest.fn(),
      deleteBatch: jest.fn(),
      export: jest.fn(),
    } as jest.Mocked<UserRepository>;

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as jest.Mocked<Logger>;

    mockI18n = {
      translate: jest.fn().mockReturnValue('Mocked message'),
      t: jest.fn().mockReturnValue('Mocked message'),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    } as jest.Mocked<I18nService>;

    // Instanciation directe sans NestJS pour les tests unitaires
    useCase = new ListBusinessUseCase(
      mockBusinessRepository,
      mockUserRepository,
      mockLogger,
      mockI18n,
    );
  });

  describe('Successful Operations', () => {
    it('should list businesses when valid request from authorized user', async () => {
      // Arrange - Données typées
      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        page: 1,
        limit: 10,
        search: 'test',
        sector: 'tech',
      };

      const mockUser = {
        id: 'admin-123',
        role: UserRole.PLATFORM_ADMIN,
      } as any;

      const mockBusiness = {
        id: { getValue: () => 'business-123' },
        name: { getValue: () => 'Test Business' },
        description: 'Test Description',
        status: 'ACTIVE',
        contactInfo: {
          primaryEmail: { getValue: () => 'test@business.com' },
          primaryPhone: { getValue: () => '+1234567890' },
        },
        branding: {
          logoUrl: { getUrl: () => 'https://example.com/logo.png' },
        },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      } as any;

      const expectedSearchResult = {
        businesses: [mockBusiness],
        total: 1,
      };

      // Setup mocks
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBusinessRepository.search.mockResolvedValue(expectedSearchResult);

      // Act
      const result: ListBusinessResponse = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        businesses: [
          {
            id: 'business-123',
            name: 'Test Business',
            description: 'Test Description',
            status: 'ACTIVE',
            primaryEmail: 'test@business.com',
            primaryPhone: '+1234567890',
            logoUrl: 'https://example.com/logo.png',
            createdAt: mockBusiness.createdAt,
            updatedAt: mockBusiness.updatedAt,
          },
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      });

      // Verify repository calls
      expect(mockUserRepository.findById).toHaveBeenCalledWith('admin-123');
      expect(mockBusinessRepository.search).toHaveBeenCalledWith({
        name: 'test',
        sector: 'tech',
        city: undefined,
        isActive: undefined,
        limit: 10,
        offset: 0,
      });
    });

    it('should apply default pagination when not specified', async () => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
      };

      const mockUser = {
        id: 'admin-123',
        role: UserRole.BUSINESS_OWNER,
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockBusinessRepository.search).toHaveBeenCalledWith({
        name: undefined,
        sector: undefined,
        city: undefined,
        isActive: undefined,
        limit: 20, // Valeur par défaut
        offset: 0, // Page 1
      });
    });

    it('should calculate correct pagination for multiple pages', async () => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        page: 2,
        limit: 5,
      };

      const mockUser = {
        id: 'admin-123',
        role: UserRole.PLATFORM_ADMIN,
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 15,
      });

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalItems: 15,
        itemsPerPage: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });

      expect(mockBusinessRepository.search).toHaveBeenCalledWith({
        name: undefined,
        sector: undefined,
        city: undefined,
        isActive: undefined,
        limit: 5,
        offset: 5, // (page 2 - 1) * limit 5
      });
    });
  });

  describe('Authorization Rules', () => {
    it('should reject when requesting user not found', async () => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'invalid-user',
      };

      mockUserRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );
      expect(mockBusinessRepository.search).not.toHaveBeenCalled();
    });

    it('should reject when user has insufficient permissions', async () => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'client-123',
      };

      const mockUser = {
        id: 'client-123',
        role: UserRole.REGULAR_CLIENT,
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );
      expect(mockBusinessRepository.search).not.toHaveBeenCalled();
    });

    it.each([
      UserRole.PLATFORM_ADMIN,
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
      UserRole.LOCATION_MANAGER,
    ])('should allow access for authorized role: %s', async (role) => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'user-123',
      };

      const mockUser = {
        id: 'user-123',
        role: role,
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      // Act & Assert
      await expect(useCase.execute(request)).resolves.toBeDefined();
      expect(mockBusinessRepository.search).toHaveBeenCalled();
    });
  });

  describe('Business Rules Validation', () => {
    const setupAuthorizedUser = () => {
      const mockUser = {
        id: 'admin-123',
        role: UserRole.PLATFORM_ADMIN,
      } as User;
      mockUserRepository.findById.mockResolvedValue(mockUser);
    };

    it('should reject invalid page number', async () => {
      // Arrange
      setupAuthorizedUser();
      // Le mock repository ne devrait pas être appelé car la validation échoue avant
      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        page: 0, // Invalid
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        'Page number must be greater than 0',
      );
    });

    it('should reject limit exceeding maximum', async () => {
      // Arrange
      setupAuthorizedUser();
      // Le mock repository ne devrait pas être appelé car la validation échoue avant
      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        limit: 150, // Exceeds maximum of 100
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        'Limit must be between 1 and 100',
      );
    });

    it('should reject invalid sort field', async () => {
      // Arrange
      setupAuthorizedUser();

      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        sortBy: 'invalidField' as any,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        'Invalid sort field',
      );
    });

    it('should reject invalid sort order', async () => {
      // Arrange
      setupAuthorizedUser();

      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        sortOrder: 'INVALID' as any,
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        'Invalid sort order',
      );
    });

    it('should enforce maximum limit of 100', async () => {
      // Arrange
      setupAuthorizedUser();

      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
        limit: 150, // Will be capped to 100
      };

      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      // Cette validation se fait maintenant dans validateBusinessRules
      await expect(useCase.execute(request)).rejects.toThrow();
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
      };

      const mockUser = {
        id: 'admin-123',
        role: UserRole.PLATFORM_ADMIN,
      } as User;

      const repositoryError = new Error('Database connection failed');

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBusinessRepository.search.mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );

      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Mocked message',
        repositoryError,
        expect.any(Object),
      );
    });
  });

  describe('Logging', () => {
    it('should log operation attempt and success', async () => {
      // Arrange
      const request: ListBusinessRequest = {
        requestingUserId: 'admin-123',
      };

      const mockUser = {
        id: 'admin-123',
        role: UserRole.PLATFORM_ADMIN,
      } as User;

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockBusinessRepository.search.mockResolvedValue({
        businesses: [],
        total: 0,
      });

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mocked message',
        expect.any(Object),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mocked message',
        expect.objectContaining({
          totalBusinesses: 0,
          page: 1,
          limit: 20,
        }),
      );
    });
  });
});
