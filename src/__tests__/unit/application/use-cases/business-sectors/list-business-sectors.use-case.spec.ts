/**
 * @fileoverview Test suite for ListBusinessSectorsUseCase - TDD
 * Tests permission validation and basic functionality
 *
 * @author Amadou Sall
 * @version 1.0.0
 * @since 2024
 */

import { ForbiddenError } from '@application/exceptions/auth.exceptions';
import { BusinessSectorOperationError } from '@application/exceptions/business-sector.exceptions';
import {
  BusinessSectorListResult,
  IBusinessSectorRepository,
} from '@application/ports/business-sector.repository.interface';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { ListBusinessSectorsUseCase } from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import { BusinessSector } from '@domain/entities/business-sector.entity';

describe('ListBusinessSectorsUseCase', () => {
  let useCase: ListBusinessSectorsUseCase;
  let mockBusinessSectorRepository: jest.Mocked<IBusinessSectorRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Test Data
  const mockBusinessSectors = [
    BusinessSector.restore(
      'bs-1',
      'Technology',
      'Technology and Software',
      'TECH',
      true,
      new Date('2024-01-01'),
      'admin-1',
    ),
    BusinessSector.restore(
      'bs-2',
      'Healthcare',
      'Medical and Health Services',
      'HEALTH',
      true,
      new Date('2024-01-02'),
      'admin-1',
    ),
  ];

  const mockListResult: BusinessSectorListResult = {
    data: mockBusinessSectors,
    meta: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 2,
      itemsPerPage: 20,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };

  beforeEach(() => {
    mockBusinessSectorRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByCode: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      exists: jest.fn(),
      isCodeUnique: jest.fn(),
      count: jest.fn(),
      searchByText: jest.fn(),
      findActiveOnly: jest.fn(),
      updateStatus: jest.fn(),
      findMostUsed: jest.fn(),
    };

    mockPermissionService = {
      hasPermission: jest.fn(),
      canActOnRole: jest.fn(),
      requirePermission: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canManageUser: jest.fn(),
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
    } as jest.Mocked<Logger>;

    mockI18n = {
      translate: jest.fn().mockImplementation((key: string) => key),
      t: jest.fn().mockImplementation((key: string) => key),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn().mockReturnValue(true),
    } as jest.Mocked<I18nService>;

    useCase = new ListBusinessSectorsUseCase(
      mockBusinessSectorRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe('🚨 Permission Validation', () => {
    it('should throw ForbiddenError when user is not super admin', async () => {
      // Arrange
      const request = {
        requestingUserId: 'regular-user',
      };

      mockPermissionService.isSuperAdmin.mockResolvedValue(false);
      mockI18n.translate.mockReturnValue('Super admin permissions required');

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(ForbiddenError);

      expect(mockPermissionService.isSuperAdmin).toHaveBeenCalledWith(
        'regular-user',
      );
    });

    it('should allow super admin to list business sectors', async () => {
      // Arrange
      const request = {
        requestingUserId: 'super-admin-1',
        page: 1,
        limit: 10,
      };

      mockPermissionService.isSuperAdmin.mockResolvedValue(true);
      (mockBusinessSectorRepository.findAll as jest.Mock).mockResolvedValue(
        mockListResult,
      );

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        businessSectors: mockListResult,
      });

      expect(mockPermissionService.isSuperAdmin).toHaveBeenCalledWith(
        'super-admin-1',
      );
      expect(mockBusinessSectorRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            page: 1,
            limit: 10,
          },
        }),
      );
    });
  });

  describe('✅ Business Rules Validation', () => {
    beforeEach(() => {
      mockPermissionService.isSuperAdmin.mockResolvedValue(true);
    });

    it('should reject invalid page number', async () => {
      // Arrange
      const request = {
        requestingUserId: 'admin-1',
        page: 0,
      };

      mockI18n.translate.mockReturnValue('Page must be greater than 0');

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        BusinessSectorOperationError,
      );
    });

    it('should reject limit exceeding maximum', async () => {
      // Arrange
      const request = {
        requestingUserId: 'admin-1',
        limit: 150,
      };

      mockI18n.translate.mockReturnValue('Limit cannot exceed 100');

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(
        BusinessSectorOperationError,
      );
    });

    it('should apply default pagination when not specified', async () => {
      // Arrange
      const request = {
        requestingUserId: 'admin-1',
      };

      (mockBusinessSectorRepository.findAll as jest.Mock).mockResolvedValue(
        mockListResult,
      );

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.businessSectors).toEqual(mockListResult);
      expect(mockBusinessSectorRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: {
            page: 1,
            limit: 20,
          },
        }),
      );
    });
  });

  describe('📊 Logging', () => {
    beforeEach(() => {
      mockPermissionService.isSuperAdmin.mockResolvedValue(true);
      (mockBusinessSectorRepository.findAll as jest.Mock).mockResolvedValue(
        mockListResult,
      );
    });

    it('should log operation attempt and success', async () => {
      // Arrange
      const request = {
        requestingUserId: 'admin-1',
      };

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Listing business sectors',
        expect.objectContaining({
          userId: 'admin-1',
          operation: 'list_business_sectors',
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Successfully listed 2 business sectors',
        expect.objectContaining({
          userId: 'admin-1',
          operation: 'list_business_sectors',
          count: 2,
          totalItems: 2,
        }),
      );
    });
  });
});
