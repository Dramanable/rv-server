import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import {
  BusinessSectorInUseError,
  BusinessSectorNotFoundError,
} from '@application/exceptions/business-sector.exceptions';
import { IBusinessSectorRepository } from '@application/ports/business-sector.repository.interface';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { DeleteBusinessSectorUseCase } from '@application/use-cases/business-sectors/delete-business-sector.use-case';
import { BusinessSector } from '@domain/entities/business-sector.entity';
import { Permission } from '@shared/enums/permission.enum';

/**
 * 🧪 Test Suite: DeleteBusinessSectorUseCase
 *
 * Tests TDD pour le use case de suppression de secteur d'activité
 * avec validation permissions, règles métier et gestion d'erreurs.
 */
describe('DeleteBusinessSectorUseCase', () => {
  let useCase: DeleteBusinessSectorUseCase;
  let mockRepository: jest.Mocked<IBusinessSectorRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;

  // 📋 Test Data
  const validSectorId = 'sector-123';
  const validRequestingUserId = 'user-456';
  const businessSectorMock = BusinessSector.restore(
    validSectorId,
    'Manufacturing',
    'Manufacturing and production services',
    'MANUFACTURING',
    true,
    new Date('2024-01-01'),
    'creator-123',
    new Date('2024-01-15'),
    'updater-789',
  );

  beforeEach(() => {
    // 🔧 Mock Repository
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByCode: jest.fn(),
      findAll: jest.fn(),
      countUsageInBusinesses: jest.fn(),
    } as jest.Mocked<IBusinessSectorRepository>;

    // 🔧 Mock Permission Service
    mockPermissionService = {
      hasPermission: jest.fn(),
    } as jest.Mocked<IPermissionService>;

    // 🔧 Mock Logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      audit: jest.fn(),
      child: jest.fn().mockReturnThis(),
    } as jest.Mocked<Logger>;

    useCase = new DeleteBusinessSectorUseCase(
      mockRepository,
      mockPermissionService,
      mockLogger,
    );
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎯 Use Case Construction
  // ═══════════════════════════════════════════════════════════════

  describe('🎯 Use Case Construction', () => {
    it('should create use case with all dependencies', () => {
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(DeleteBusinessSectorUseCase);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // ✅ Successful Business Sector Deletion
  // ═══════════════════════════════════════════════════════════════

  describe('✅ Successful Business Sector Deletion', () => {
    beforeEach(() => {
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(businessSectorMock);
      mockRepository.countUsageInBusinesses.mockResolvedValue(0); // Pas d'usage
      mockRepository.save.mockResolvedValue(
        businessSectorMock.deactivate(validRequestingUserId),
      );
    });

    it('should delete (deactivate) business sector successfully', async () => {
      // 🎯 Arrange
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false, // Soft delete par défaut
      };

      // 🚀 Act
      const result = await useCase.execute(request);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('deactivated successfully');
      expect(result.deletedAt).toBeDefined();

      // 📋 Vérifier les appels
      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        validRequestingUserId,
        Permission.MANAGE_BUSINESS_SECTORS,
      );
      expect(mockRepository.findById).toHaveBeenCalledWith(validSectorId);
      expect(mockRepository.countUsageInBusinesses).toHaveBeenCalledWith(
        validSectorId,
      );
      expect(mockRepository.save).toHaveBeenCalled();

      // 📊 Vérifier le logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Business sector deactivated successfully',
        expect.objectContaining({
          sectorId: validSectorId,
          requestingUserId: validRequestingUserId,
        }),
      );
    });

    it('should support forced deletion when explicitly requested', async () => {
      // 🎯 Arrange - Force delete même avec usage
      mockRepository.countUsageInBusinesses.mockResolvedValue(5); // Secteur utilisé
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: true, // Force delete
      };

      // 🚀 Act
      const result = await useCase.execute(request);

      // ✅ Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.message).toContain('forcefully deactivated');

      // 📊 Vérifier le logging de warning
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Business sector forcefully deactivated despite being in use',
        expect.objectContaining({
          sectorId: validSectorId,
          usageCount: 5,
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🚨 Permission Validation
  // ═══════════════════════════════════════════════════════════════

  describe('🚨 Permission Validation', () => {
    beforeEach(() => {
      mockRepository.findById.mockResolvedValue(businessSectorMock);
      mockRepository.countUsageInBusinesses.mockResolvedValue(0);
    });

    it('should throw InsufficientPermissionsError when user lacks MANAGE_BUSINESS_SECTORS permission', async () => {
      // 🎯 Arrange
      mockPermissionService.hasPermission.mockResolvedValue(false);
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'User does not have permission to manage business sectors',
      );

      // 📋 Vérifier qu'aucune autre opération n'est appelée
      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should log permission denial attempt', async () => {
      // 🎯 Arrange
      mockPermissionService.hasPermission.mockResolvedValue(false);
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act
      try {
        await useCase.execute(request);
      } catch (error) {
        // Expected
      }

      // ✅ Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Permission denied for business sector deletion',
        expect.objectContaining({
          requestingUserId: validRequestingUserId,
          sectorId: validSectorId,
          requiredPermission: Permission.MANAGE_BUSINESS_SECTORS,
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔍 Business Sector Existence Validation
  // ═══════════════════════════════════════════════════════════════

  describe('🔍 Business Sector Existence Validation', () => {
    beforeEach(() => {
      mockPermissionService.hasPermission.mockResolvedValue(true);
    });

    it('should throw BusinessSectorNotFoundError when sector does not exist', async () => {
      // 🎯 Arrange
      mockRepository.findById.mockResolvedValue(null);
      const request = {
        id: 'non-existent-id',
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        BusinessSectorNotFoundError,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Business sector with id non-existent-id not found',
      );

      // 📋 Vérifier qu'aucune modification n'est tentée
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should log sector not found attempt', async () => {
      // 🎯 Arrange
      const nonExistentId = 'non-existent-id';
      mockRepository.findById.mockResolvedValue(null);
      const request = {
        id: nonExistentId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act
      try {
        await useCase.execute(request);
      } catch (error) {
        // Expected
      }

      // ✅ Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempted to delete non-existent business sector',
        expect.objectContaining({
          sectorId: nonExistentId,
          requestingUserId: validRequestingUserId,
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 💼 Business Rules Validation
  // ═══════════════════════════════════════════════════════════════

  describe('💼 Business Rules Validation', () => {
    beforeEach(() => {
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(businessSectorMock);
    });

    it('should throw BusinessSectorInUseError when sector is in use and force is false', async () => {
      // 🎯 Arrange
      mockRepository.countUsageInBusinesses.mockResolvedValue(3); // Secteur utilisé
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false, // Pas de force delete
      };

      // 🚀 Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        BusinessSectorInUseError,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Cannot delete business sector: it is currently used by 3 businesses',
      );

      // 📋 Vérifier qu'aucune modification n'est tentée
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should log business rule violation attempt', async () => {
      // 🎯 Arrange
      mockRepository.countUsageInBusinesses.mockResolvedValue(5);
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act
      try {
        await useCase.execute(request);
      } catch (error) {
        // Expected
      }

      // ✅ Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempted to delete business sector in use',
        expect.objectContaining({
          sectorId: validSectorId,
          usageCount: 5,
          requestingUserId: validRequestingUserId,
        }),
      );
    });

    it('should prevent deletion of already inactive sector', async () => {
      // 🎯 Arrange - Secteur déjà inactif
      const inactiveSector = businessSectorMock.deactivate(
        validRequestingUserId,
      );
      mockRepository.findById.mockResolvedValue(inactiveSector);
      mockRepository.countUsageInBusinesses.mockResolvedValue(0);

      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        BusinessSectorNotFoundError,
      );
      await expect(useCase.execute(request)).rejects.toThrow(
        'Business sector is already inactive',
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🔧 Error Handling
  // ═══════════════════════════════════════════════════════════════

  describe('🔧 Error Handling', () => {
    beforeEach(() => {
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(businessSectorMock);
      mockRepository.countUsageInBusinesses.mockResolvedValue(0);
    });

    it('should handle repository save errors gracefully', async () => {
      // 🎯 Arrange
      const repositoryError = new Error('Database connection failed');
      mockRepository.save.mockRejectedValue(repositoryError);
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);

      // 📊 Vérifier le logging d'erreur
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to delete business sector',
        repositoryError,
        expect.objectContaining({
          requestingUserId: validRequestingUserId,
          sectorId: validSectorId,
        }),
      );
    });

    it('should handle permission service errors gracefully', async () => {
      // 🎯 Arrange
      const permissionError = new Error('Permission service unavailable');
      mockPermissionService.hasPermission.mockRejectedValue(permissionError);
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(permissionError);

      // 📊 Vérifier le logging d'erreur
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to delete business sector',
        permissionError,
        expect.objectContaining({
          requestingUserId: validRequestingUserId,
          sectorId: validSectorId,
        }),
      );
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 📊 Logging
  // ═══════════════════════════════════════════════════════════════

  describe('📊 Logging', () => {
    beforeEach(() => {
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(businessSectorMock);
      mockRepository.countUsageInBusinesses.mockResolvedValue(0);
      mockRepository.save.mockResolvedValue(
        businessSectorMock.deactivate(validRequestingUserId),
      );
    });

    it('should log operation attempt and success', async () => {
      // 🎯 Arrange
      const request = {
        id: validSectorId,
        requestingUserId: validRequestingUserId,
        force: false,
      };

      // 🚀 Act
      await useCase.execute(request);

      // ✅ Assert - Log de début
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'Deleting business sector',
        expect.objectContaining({
          sectorId: validSectorId,
          requestingUserId: validRequestingUserId,
          force: false,
        }),
      );

      // ✅ Assert - Log de succès
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Business sector deactivated successfully',
        expect.objectContaining({
          sectorId: validSectorId,
          requestingUserId: validRequestingUserId,
        }),
      );
    });
  });
});
