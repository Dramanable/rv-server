/**
 * 📝 Update Business Sector Use Case - Tests TDD
 *
 * Tests complets pour la mise à jour de secteurs d'activité
 * avec validation des permissions super-admin uniquement.
 */

import { UpdateBusinessSectorUseCase } from '@application/use-cases/business-sectors/update-business-sector.use-case';
import { BusinessSector } from '@domain/entities/business-sector.entity';
import { IBusinessSectorRepository } from '@application/ports/business-sector.repository.interface';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import {
  BusinessSectorNotFoundError,
  InvalidBusinessSectorDataError,
} from '@application/exceptions/business-sector.exceptions';
import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import type { Mocked } from 'jest-mock';

// Types pour les requêtes et réponses
interface UpdateBusinessSectorRequest {
  id: string;
  requestingUserId: string;
  name?: string;
  description?: string;
}

interface UpdateBusinessSectorResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

describe('UpdateBusinessSectorUseCase', () => {
  let useCase: UpdateBusinessSectorUseCase;
  let mockRepository: Mocked<IBusinessSectorRepository>;
  let mockLogger: Mocked<Logger>;
  let mockI18n: Mocked<I18nService>;
  let mockPermissionService: Mocked<IPermissionService>;

  const baseRequest: UpdateBusinessSectorRequest = {
    id: 'sector-123',
    requestingUserId: 'admin-123',
    name: 'Updated Manufacturing',
    description: 'Updated manufacturing and industrial services',
  };

  beforeEach(() => {
    // Mocks pour les dépendances
    mockRepository = {
      findById: jest.fn(),
      findByCode: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      isCodeUnique: jest.fn(),
      updateStatus: jest.fn(),
      findMostUsed: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      audit: jest.fn(),
      child: jest.fn(),
    };

    mockI18n = {
      t: jest.fn(),
      translate: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    };

    mockPermissionService = {
      hasPermission: jest.fn(),
      canActOnRole: jest.fn(),
      requirePermission: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
      canManageBusinessSectors: jest.fn(),
      canManageUser: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
    };

    // Configuration du use case
    useCase = new UpdateBusinessSectorUseCase(
      mockRepository,
      mockLogger,
      mockI18n,
      mockPermissionService,
    );
  });

  describe('🎯 Use Case Construction', () => {
    it('should create use case with all dependencies', () => {
      expect(useCase).toBeDefined();
      expect(useCase).toBeInstanceOf(UpdateBusinessSectorUseCase);
    });
  });

  describe('✅ Successful Business Sector Update', () => {
    it('should update business sector successfully with valid data', async () => {
      // Arrange
      const existingSector = BusinessSector.restore(
        baseRequest.id,
        'Manufacturing',
        'Original manufacturing description',
        'MANUFACTURING',
        true,
        new Date('2024-01-01'),
        'admin-123',
        new Date('2024-01-01'),
      );

      const updatedSector = BusinessSector.restore(
        baseRequest.id,
        baseRequest.name!,
        baseRequest.description!,
        'MANUFACTURING',
        true,
        new Date('2024-01-01'),
        'admin-123',
        new Date(),
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(existingSector);
      mockRepository.save.mockResolvedValue(updatedSector);
      mockI18n.t.mockReturnValue('Business sector updated successfully');

      // Act
      const result = await useCase.execute(baseRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(baseRequest.id);
      expect(result.name).toBe(baseRequest.name);
      expect(result.description).toBe(baseRequest.description);
      expect(mockRepository.findById).toHaveBeenCalledWith(baseRequest.id);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.any(BusinessSector),
      );
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Business sector updated successfully'),
        expect.objectContaining({
          sectorId: baseRequest.id,
          requestingUserId: baseRequest.requestingUserId,
        }),
      );
    });

    it('should update only provided fields (partial update)', async () => {
      // Arrange
      const existingSector = BusinessSector.restore(
        baseRequest.id,
        'Manufacturing',
        'Original description',
        'MANUFACTURING',
        true,
        new Date('2024-01-01'),
        'admin-123',
        new Date('2024-01-01'),
      );

      const partialRequest: UpdateBusinessSectorRequest = {
        id: baseRequest.id,
        requestingUserId: baseRequest.requestingUserId,
        name: 'New Manufacturing', // Seulement le nom
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(existingSector);
      mockRepository.save.mockResolvedValue(existingSector);

      // Act
      const result = await useCase.execute(partialRequest);

      // Assert
      expect(result).toBeDefined();
      const savedSector = mockRepository.save.mock.calls[0][0];
      expect(savedSector.name).toBe('New Manufacturing');
      expect(savedSector.description).toBe('Original description');
    });
  });

  describe('🚨 Permission Validation', () => {
    it('should throw InsufficientPermissionsError when user lacks MANAGE_BUSINESS_SECTORS permission', async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(false);
      mockI18n.t.mockReturnValue('Insufficient permissions');

      // Act & Assert
      await expect(useCase.execute(baseRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.hasPermission).toHaveBeenCalledWith(
        baseRequest.requestingUserId,
        'MANAGE_BUSINESS_SECTORS',
      );
    });

    it('should log permission denial attempt', async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(false);
      mockI18n.t.mockReturnValue('Insufficient permissions');

      // Act
      try {
        await useCase.execute(baseRequest);
      } catch {
        // Expected error
      }

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unauthorized attempt'),
        expect.objectContaining({
          requestingUserId: baseRequest.requestingUserId,
          sectorId: baseRequest.id,
        }),
      );
    });
  });

  describe('🔍 Business Sector Existence Validation', () => {
    it('should throw BusinessSectorNotFoundError when sector does not exist', async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(null);
      mockI18n.t.mockReturnValue('Business sector not found');

      // Act & Assert
      await expect(useCase.execute(baseRequest)).rejects.toThrow(
        BusinessSectorNotFoundError,
      );

      expect(mockRepository.findById).toHaveBeenCalledWith(baseRequest.id);
    });

    it('should log sector not found attempt', async () => {
      // Arrange
      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(null);
      mockI18n.t.mockReturnValue('Business sector not found');

      // Act
      try {
        await useCase.execute(baseRequest);
      } catch {
        // Expected error
      }

      // Assert
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Business sector not found'),
        expect.objectContaining({
          sectorId: baseRequest.id,
          requestingUserId: baseRequest.requestingUserId,
        }),
      );
    });
  });

  describe('❌ Input Validation', () => {
    it('should throw InvalidBusinessSectorDataError for empty update', async () => {
      // Arrange
      const emptyRequest: UpdateBusinessSectorRequest = {
        id: baseRequest.id,
        requestingUserId: baseRequest.requestingUserId,
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t.mockReturnValue('No fields to update');

      // Act & Assert
      await expect(useCase.execute(emptyRequest)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });

    it('should throw InvalidBusinessSectorDataError for invalid name', async () => {
      // Arrange
      const invalidRequest: UpdateBusinessSectorRequest = {
        ...baseRequest,
        name: '', // Nom vide
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t
        .mockReturnValueOnce('Business sector name cannot be empty')
        .mockReturnValueOnce('Invalid business sector data');

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });

    it('should throw InvalidBusinessSectorDataError for invalid description', async () => {
      // Arrange
      const invalidRequest: UpdateBusinessSectorRequest = {
        ...baseRequest,
        description: 'short', // Description trop courte
      };

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockI18n.t
        .mockReturnValueOnce('Business sector description is too short')
        .mockReturnValueOnce('Invalid business sector data');

      // Act & Assert
      await expect(useCase.execute(invalidRequest)).rejects.toThrow(
        InvalidBusinessSectorDataError,
      );
    });
  });

  describe('🔧 Error Handling', () => {
    it('should handle repository save errors gracefully', async () => {
      // Arrange
      const existingSector = BusinessSector.restore(
        baseRequest.id,
        'Manufacturing',
        'Original description',
        'MANUFACTURING',
        true,
        new Date('2024-01-01'),
        'admin-123',
        new Date('2024-01-01'),
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(existingSector);
      mockRepository.save.mockRejectedValue(
        new Error('Database connection failed'),
      );
      mockI18n.t.mockReturnValue('Failed to update business sector');

      // Act & Assert
      await expect(useCase.execute(baseRequest)).rejects.toThrow(
        'Database connection failed',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Failed to update business sector'),
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: baseRequest.requestingUserId,
          sectorId: baseRequest.id,
        }),
      );
    });

    it('should handle permission service errors gracefully', async () => {
      // Arrange
      mockPermissionService.hasPermission.mockRejectedValue(
        new Error('Permission service unavailable'),
      );

      // Act & Assert
      await expect(useCase.execute(baseRequest)).rejects.toThrow(
        'Permission service unavailable',
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error checking permissions'),
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: baseRequest.requestingUserId,
        }),
      );
    });
  });

  describe('📊 Logging', () => {
    it('should log operation attempt and success', async () => {
      // Arrange
      const existingSector = BusinessSector.restore(
        baseRequest.id,
        'Manufacturing',
        'Original description',
        'MANUFACTURING',
        true,
        new Date('2024-01-01'),
        'admin-123',
        new Date('2024-01-01'),
      );

      mockPermissionService.hasPermission.mockResolvedValue(true);
      mockRepository.findById.mockResolvedValue(existingSector);
      mockRepository.save.mockResolvedValue(existingSector);
      mockI18n.t.mockReturnValue('Business sector updated successfully');

      // Act
      await useCase.execute(baseRequest);

      // Assert - Log de démarrage
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Updating business sector'),
        expect.objectContaining({
          sectorId: baseRequest.id,
          requestingUserId: baseRequest.requestingUserId,
        }),
      );

      // Assert - Log de succès
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('Business sector updated successfully'),
        expect.objectContaining({
          sectorId: baseRequest.id,
          requestingUserId: baseRequest.requestingUserId,
        }),
      );
    });
  });
});
