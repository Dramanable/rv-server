import { CreatePermissionUseCase } from '@application/use-cases/permissions/create-permission.use-case';
import { IPermissionRepository } from '@domain/repositories/permission.repository';
import { Permission } from '@domain/entities/permission.entity';
import { PermissionAlreadyExistsError } from '@domain/exceptions/permission.exceptions';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
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

    useCase = new CreatePermissionUseCase(mockPermissionRepository);
  });

  describe('TDD - RED Phase', () => {
    it('should throw error when permission name already exists', async () => {
      // Given
      const request = {
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de créer, modifier et supprimer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      mockPermissionRepository.existsByName.mockResolvedValue(true);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        PermissionAlreadyExistsError,
      );

      expect(mockPermissionRepository.existsByName).toHaveBeenCalledWith(
        'MANAGE_APPOINTMENTS',
      );
      expect(mockPermissionRepository.save).not.toHaveBeenCalled();
    });

    it('should validate permission name format', async () => {
      // Given
      const request = {
        name: 'invalid-name', // Lowercase with dashes instead of uppercase with underscores
        displayName: 'Invalid Permission',
        description: 'This is an invalid permission name',
        category: 'TEST',
        isSystemPermission: false,
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      mockPermissionRepository.existsByName.mockResolvedValue(false);

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Permission name must be uppercase with underscores (e.g., MANAGE_APPOINTMENTS)',
      );

      expect(mockPermissionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('TDD - GREEN Phase', () => {
    it('should create permission successfully', async () => {
      // Given
      const request = {
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de créer, modifier et supprimer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      const savedPermission = Permission.create({
        id: 'permission-123',
        name: request.name,
        displayName: request.displayName,
        description: request.description,
        category: request.category,
        isSystemPermission: request.isSystemPermission,
      });

      mockPermissionRepository.existsByName.mockResolvedValue(false);
      mockPermissionRepository.save.mockResolvedValue(savedPermission);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toEqual({
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de créer, modifier et supprimer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
        isActive: true,
        canBeDeleted: true,
        createdAt: savedPermission.getCreatedAt().toISOString(),
        updatedAt: savedPermission.getUpdatedAt().toISOString(),
      });

      expect(mockPermissionRepository.existsByName).toHaveBeenCalledWith(
        'MANAGE_APPOINTMENTS',
      );
      expect(mockPermissionRepository.save).toHaveBeenCalledWith(
        expect.any(Permission),
      );
    });

    it('should create system permission correctly', async () => {
      // Given
      const request = {
        name: 'SYSTEM_ADMIN',
        displayName: 'Administration Système',
        description: 'Accès complet au système',
        category: 'SYSTEM',
        isSystemPermission: true,
        requestingUserId: 'admin-123',
        correlationId: 'req-456',
      };

      const savedPermission = Permission.create({
        id: 'system-permission-123',
        name: request.name,
        displayName: request.displayName,
        description: request.description,
        category: request.category,
        isSystemPermission: request.isSystemPermission,
      });

      mockPermissionRepository.existsByName.mockResolvedValue(false);
      mockPermissionRepository.save.mockResolvedValue(savedPermission);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.isSystemPermission).toBe(true);
      expect(result.canBeDeleted).toBe(false);
    });
  });

  describe('TDD - REFACTOR Phase', () => {
    it('should generate unique ID for new permission', async () => {
      // Given
      const request = {
        name: 'TEST_PERMISSION',
        displayName: 'Test Permission',
        description: 'This is a test permission',
        category: 'TEST',
        isSystemPermission: false,
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      mockPermissionRepository.existsByName.mockResolvedValue(false);
      mockPermissionRepository.save.mockImplementation(
        async (permission) => permission,
      );

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.id.length).toBeGreaterThan(0);
    });

    it('should handle repository errors gracefully', async () => {
      // Given
      const request = {
        name: 'TEST_PERMISSION',
        displayName: 'Test Permission',
        description: 'This is a test permission',
        category: 'TEST',
        isSystemPermission: false,
        requestingUserId: 'user-123',
        correlationId: 'req-123',
      };

      mockPermissionRepository.existsByName.mockResolvedValue(false);
      mockPermissionRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });
});
