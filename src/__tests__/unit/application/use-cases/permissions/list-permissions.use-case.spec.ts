import { ListPermissionsUseCase } from '@application/use-cases/permissions/list-permissions.use-case';
import { Permission } from '@domain/entities/permission.entity';
import { IPermissionRepository } from '@domain/repositories/permission.repository';

describe('ListPermissionsUseCase', () => {
  let useCase: ListPermissionsUseCase;
  let mockPermissionRepository: jest.Mocked<IPermissionRepository>;

  beforeEach(() => {
    mockPermissionRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      findByCategory: jest.fn(),
      existsByName: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    };

    useCase = new ListPermissionsUseCase(mockPermissionRepository);
  });

  describe('TDD - GREEN Phase', () => {
    it('should list all permissions without filters', async () => {
      // Given
      const request = {
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      const permissions = [
        Permission.create({
          id: 'permission-1',
          name: 'MANAGE_APPOINTMENTS',
          displayName: 'Gérer les rendez-vous',
          description: 'Permet de gérer les rendez-vous',
          category: 'APPOINTMENTS',
          isSystemPermission: false,
        }),
        Permission.create({
          id: 'permission-2',
          name: 'SYSTEM_ADMIN',
          displayName: 'Administration Système',
          description: 'Accès complet système',
          category: 'SYSTEM',
          isSystemPermission: true,
        }),
      ];

      mockPermissionRepository.findAll.mockResolvedValue(permissions);
      mockPermissionRepository.count.mockResolvedValue(2);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toEqual({
        permissions: [
          expect.objectContaining({
            id: 'permission-1',
            name: 'MANAGE_APPOINTMENTS',
            category: 'APPOINTMENTS',
            isSystemPermission: false,
          }),
          expect.objectContaining({
            id: 'permission-2',
            name: 'SYSTEM_ADMIN',
            category: 'SYSTEM',
            isSystemPermission: true,
          }),
        ],
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });

      // Vérifier que les repositories sont appelés avec les options par défaut
      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(
        {},
        { limit: 10, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );
      expect(mockPermissionRepository.count).toHaveBeenCalledWith({});
    });

    it('should filter permissions by category', async () => {
      // Given
      const request = {
        filters: {
          category: 'APPOINTMENTS',
        },
        requestingUserId: 'user-123',
        correlationId: 'req-123',
        timestamp: new Date(),
      };

      const appointmentPermissions = [
        Permission.create({
          id: 'permission-1',
          name: 'MANAGE_APPOINTMENTS',
          displayName: 'Gérer les rendez-vous',
          description: 'Permet de gérer les rendez-vous',
          category: 'APPOINTMENTS',
          isSystemPermission: false,
        }),
      ];

      mockPermissionRepository.findAll.mockResolvedValue(
        appointmentPermissions,
      );
      mockPermissionRepository.count.mockResolvedValue(1);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.permissions).toHaveLength(1);
      expect(result.permissions[0].category).toBe('APPOINTMENTS');
      expect(result.meta.totalItems).toBe(1);
      expect(result.meta.currentPage).toBe(1);
      expect(result.meta.itemsPerPage).toBe(10);

      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(
        {
          category: 'APPOINTMENTS',
        },
        { limit: 10, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );
      expect(mockPermissionRepository.count).toHaveBeenCalledWith({
        category: 'APPOINTMENTS',
      });
    });

    it('should filter permissions by active status', async () => {
      // Given
      const request = {
        filters: {
          isActive: true,
        },
        requestingUserId: 'user-123',
        correlationId: 'req-123',
        timestamp: new Date(),
      };

      const activePermissions = [
        Permission.create({
          id: 'permission-1',
          name: 'MANAGE_APPOINTMENTS',
          displayName: 'Gérer les rendez-vous',
          description: 'Permet de gérer les rendez-vous',
          category: 'APPOINTMENTS',
          isSystemPermission: false,
        }),
      ];

      mockPermissionRepository.findAll.mockResolvedValue(activePermissions);
      mockPermissionRepository.count.mockResolvedValue(1);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.meta.totalItems).toBe(1);

      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(
        {
          isActive: true,
        },
        { limit: 10, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );
      expect(mockPermissionRepository.count).toHaveBeenCalledWith({
        isActive: true,
      });
    });

    it('should filter permissions by system permission status', async () => {
      // Given
      const request = {
        filters: {
          isSystemPermission: false,
        },
        requestingUserId: 'user-123',
        correlationId: 'req-123',
        timestamp: new Date(),
      };

      const customPermissions = [
        Permission.create({
          id: 'permission-1',
          name: 'CUSTOM_PERMISSION',
          displayName: 'Permission Personnalisée',
          description: 'Une permission personnalisée',
          category: 'CUSTOM',
          isSystemPermission: false,
        }),
      ];

      mockPermissionRepository.findAll.mockResolvedValue(customPermissions);
      mockPermissionRepository.count.mockResolvedValue(1);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.permissions[0].isSystemPermission).toBe(false);
      expect(result.meta.totalItems).toBe(1);

      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(
        {
          isSystemPermission: false,
        },
        { limit: 10, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );
    });

    it('should combine multiple filters', async () => {
      // Given
      const request = {
        filters: {
          category: 'APPOINTMENTS',
          isActive: true,
          isSystemPermission: false,
        },
        requestingUserId: 'user-123',
        correlationId: 'req-123',
        timestamp: new Date(),
      };

      mockPermissionRepository.findAll.mockResolvedValue([]);
      mockPermissionRepository.count.mockResolvedValue(0);

      // When
      await useCase.execute(request);

      // Then
      expect(mockPermissionRepository.findAll).toHaveBeenCalledWith(
        {
          category: 'APPOINTMENTS',
          isActive: true,
          isSystemPermission: false,
        },
        { limit: 10, offset: 0, sortBy: 'createdAt', sortOrder: 'desc' },
      );
      expect(mockPermissionRepository.count).toHaveBeenCalledWith({
        category: 'APPOINTMENTS',
        isActive: true,
        isSystemPermission: false,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Given
      const request = {
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      mockPermissionRepository.findAll.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
