import { InsufficientPermissionsError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import {
  ListServicesRequest,
  ListServicesUseCase,
} from '@application/use-cases/service/list-services.use-case';
import { ServiceRepository } from '@domain/repositories/service.repository.interface';

describe('ListServicesUseCase - Permissions', () => {
  let useCase: ListServicesUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Valid test request with valid UUIDs
  const validRequest: ListServicesRequest = {
    requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
    businessId: '550e8400-e29b-41d4-a716-446655440002',
    pagination: { page: 1, limit: 10 },
    sorting: { sortBy: 'createdAt', sortOrder: 'desc' },
    filters: { name: 'test', isActive: true },
  };

  beforeEach(() => {
    // Create mocks with complete interfaces
    mockServiceRepository = {
      findById: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByStaffId: jest.fn(),
      search: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      findByName: jest.fn(),
      existsByName: jest.fn(),
      findPopularServices: jest.fn(),
      getServiceStatistics: jest.fn(),
      getBusinessServiceStatistics: jest.fn(),
    };

    mockPermissionService = {
      requirePermission: jest.fn(),
      hasPermission: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canManageUser: jest.fn(),
      canActOnRole: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    };

    mockI18n = {
      translate: jest.fn().mockReturnValue('Translated message'),
      t: jest.fn().mockReturnValue('Translated message'),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    };

    useCase = new ListServicesUseCase(
      mockServiceRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Permission Enforcement', () => {
    it('should require VIEW_SERVICES permission before listing services', async () => {
      // Arrange
      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError(
          '550e8400-e29b-41d4-a716-446655440001',
          'VIEW_SERVICES',
          '550e8400-e29b-41d4-a716-446655440002',
        ),
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440001',
        'VIEW_SERVICES',
        {
          businessId: '550e8400-e29b-41d4-a716-446655440002',
        },
      );

      // Should not proceed to repository if permission denied
      expect(mockServiceRepository.search).not.toHaveBeenCalled();
    });

    it('should proceed with service listing when user has VIEW_SERVICES permission', async () => {
      // Arrange
      mockPermissionService.requirePermission.mockResolvedValue();
      mockServiceRepository.search.mockResolvedValue({
        services: [],
        total: 0,
      });

      // Act
      const result = await useCase.execute(validRequest);

      // Assert
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440001',
        'VIEW_SERVICES',
        {
          businessId: '550e8400-e29b-41d4-a716-446655440002',
        },
      );

      expect(mockServiceRepository.search).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.data).toEqual([]);
    });

    it('should log permission denied errors appropriately', async () => {
      // Arrange
      const permissionError = new InsufficientPermissionsError(
        '550e8400-e29b-41d4-a716-446655440001',
        'VIEW_SERVICES',
        '550e8400-e29b-41d4-a716-446655440002',
      );
      mockPermissionService.requirePermission.mockRejectedValue(
        permissionError,
      );

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission denied for service listing',
        expect.any(Error),
        {
          businessId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          requiredPermission: 'VIEW_SERVICES',
        },
      );
    });

    it('should handle generic permission service errors', async () => {
      // Arrange
      const genericError = new Error('Permission service unavailable');
      mockPermissionService.requirePermission.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission denied for service listing',
        genericError,
        {
          businessId: '550e8400-e29b-41d4-a716-446655440002',
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          requiredPermission: 'VIEW_SERVICES',
        },
      );
    });

    it('should validate request parameters before checking permissions', async () => {
      // Arrange
      const invalidRequest = {
        ...validRequest,
        businessId: 'invalid-business-id', // Invalid UUID
      };

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        'BusinessId must be a valid UUID v4',
      );

      // Should not call permission service with invalid data
      expect(mockPermissionService.requirePermission).not.toHaveBeenCalled();
    });

    it('should enforce business context in permission check', async () => {
      // Arrange
      const differentBusinessRequest = {
        ...validRequest,
        businessId: '550e8400-e29b-41d4-a716-446655440003', // Different business
      };

      mockPermissionService.requirePermission.mockResolvedValue();
      mockServiceRepository.search.mockResolvedValue({
        services: [],
        total: 0,
      });

      // Act
      await useCase.execute(differentBusinessRequest);

      // Assert - Should check permission for the specific business
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        '550e8400-e29b-41d4-a716-446655440001',
        'VIEW_SERVICES',
        {
          businessId: '550e8400-e29b-41d4-a716-446655440003',
        },
      );
    });
  });

  describe('Success Logging', () => {
    it('should log service listing attempt', async () => {
      // Arrange
      mockPermissionService.requirePermission.mockResolvedValue();
      mockServiceRepository.search.mockResolvedValue({
        services: [],
        total: 0,
      });

      // Act
      await useCase.execute(validRequest);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Attempting to list services',
        {
          businessId: '550e8400-e29b-41d4-a716-446655440002',
          limit: 10,
          page: 1,
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
        },
      );
    });

    it('should log successful service listing', async () => {
      // Arrange
      mockPermissionService.requirePermission.mockResolvedValue();
      mockServiceRepository.search.mockResolvedValue({
        services: [],
        total: 0,
      });

      // Act
      await useCase.execute(validRequest);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Services listed successfully',
        {
          businessId: '550e8400-e29b-41d4-a716-446655440002',
          limit: 10,
          page: 1,
          requestingUserId: '550e8400-e29b-41d4-a716-446655440001',
          totalFound: 0,
        },
      );
    });
  });
});
