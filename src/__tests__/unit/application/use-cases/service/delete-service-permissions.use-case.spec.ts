/**
 * 🧪 TDD - DeleteServiceUseCase Permission Enforcement Tests
 *
 * 🎯 Objectif : Valider que TOUTES les opérations de suppression de service
 * sont protégées par des permissions appropriées et rejettent les tentatives
 * non autorisées avec les bonnes exceptions.
 */

import { InsufficientPermissionsError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import {
  DeleteServiceRequest,
  DeleteServiceUseCase,
} from '@application/use-cases/service/delete-service.use-case';
import { Service } from '@domain/entities/service.entity';
import { ServiceRepository } from '@domain/repositories/service.repository.interface';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { ServiceTypeId } from '@domain/value-objects/service-type-id.value-object';

describe('DeleteServiceUseCase - Permission Validation', () => {
  let deleteServiceUseCase: DeleteServiceUseCase;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  // Test data
  const serviceId = '550e8400-e29b-41d4-a716-446655440001';
  const businessId = '550e8400-e29b-41d4-a716-446655440002';
  const requestingUserId = '550e8400-e29b-41d4-a716-446655440003';
  const unauthorizedUserId = '550e8400-e29b-41d4-a716-446655440004';

  const mockService = Service.create({
    businessId: BusinessId.create(businessId),
    name: 'Service to Delete',
    serviceTypeIds: [
      ServiceTypeId.fromString('550e8400-e29b-41d4-a716-446655440005'),
    ],
    description: 'Test service for deletion',
    basePrice: 50,
    currency: 'EUR',
    duration: 60,
    allowOnlineBooking: false, // Inactive pour permettre la suppression
    requiresApproval: false,
    assignedStaffIds: [],
  });

  beforeEach(() => {
    // Reset all mocks
    mockServiceRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByStaffId: jest.fn(),
      search: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<ServiceRepository>;

    mockPermissionService = {
      requirePermission: jest.fn(),
      hasPermission: jest.fn(),
      canActOnRole: jest.fn(),
      getUserPermissions: jest.fn(),
      validateBusinessAccess: jest.fn(),
    } as unknown as jest.Mocked<IPermissionService>;

    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockI18n = {
      translate: jest.fn((key: string, params?: any) => {
        const translations: Record<string, string> = {
          'service.errors.not_found': `Service with ID ${params?.id} not found`,
          'permissions.insufficient': `Insufficient permissions for ${params?.operation}`,
        };
        return translations[key] || key;
      }),
      t: jest.fn(),
      setDefaultLanguage: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    deleteServiceUseCase = new DeleteServiceUseCase(
      mockServiceRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe('🔐 Permission Checks - MANAGE_SERVICES Permission', () => {
    it('🚨 RED - should call requirePermission before deleting service', async () => {
      // Arrange
      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId,
      };

      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockPermissionService.requirePermission.mockResolvedValue();
      mockServiceRepository.delete.mockResolvedValue(undefined);

      // Act
      await deleteServiceUseCase.execute(deleteRequest);

      // Assert
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        requestingUserId,
        'MANAGE_SERVICES',
        {
          businessId,
          resourceId: serviceId,
        },
      );
    });

    it('🚨 RED - should throw InsufficientPermissionsError when user cannot manage services', async () => {
      // Arrange
      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId: unauthorizedUserId,
      };

      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError(
          unauthorizedUserId,
          'MANAGE_SERVICES',
          serviceId,
        ),
      );

      // Act & Assert
      await expect(deleteServiceUseCase.execute(deleteRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        unauthorizedUserId,
        'MANAGE_SERVICES',
        {
          businessId,
          resourceId: serviceId,
        },
      );

      // Service should not be deleted
      expect(mockServiceRepository.delete).not.toHaveBeenCalled();
    });

    it('🚨 RED - should pass business context in permission validation', async () => {
      // Arrange
      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId,
      };

      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockPermissionService.requirePermission.mockResolvedValue();
      mockServiceRepository.delete.mockResolvedValue(undefined);

      // Act
      await deleteServiceUseCase.execute(deleteRequest);

      // Assert
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        requestingUserId,
        'MANAGE_SERVICES',
        expect.objectContaining({
          businessId,
          resourceId: serviceId,
        }),
      );
    });

    it('🚨 RED - should verify permissions BEFORE business rule validation', async () => {
      // Arrange
      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId: unauthorizedUserId,
      };

      // Mock pour un service qui ne peut normalement pas être supprimé (actif)
      const activeService = Service.create({
        businessId: BusinessId.create(businessId),
        name: 'Active Service',
        serviceTypeIds: [
          ServiceTypeId.fromString('550e8400-e29b-41d4-a716-446655440005'),
        ],
        description: 'Active service that cannot be deleted',
        basePrice: 100,
        currency: 'EUR',
        duration: 90,
        allowOnlineBooking: true, // Actif = ne peut pas être supprimé normalement
        requiresApproval: false,
        assignedStaffIds: [],
      });

      mockServiceRepository.findById.mockResolvedValue(activeService);
      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError(
          unauthorizedUserId,
          'MANAGE_SERVICES',
          serviceId,
        ),
      );

      // Act & Assert
      await expect(deleteServiceUseCase.execute(deleteRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      // Permissions should be checked FIRST, before business rules
      expect(mockPermissionService.requirePermission).toHaveBeenCalled();
      expect(mockServiceRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('🔍 Error Handling & Logging', () => {
    it('🚨 RED - should log permission denial with context', async () => {
      // Arrange
      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId: unauthorizedUserId,
      };

      const permissionError = new InsufficientPermissionsError(
        unauthorizedUserId,
        'MANAGE_SERVICES',
        serviceId,
      );

      mockServiceRepository.findById.mockResolvedValue(mockService);
      mockPermissionService.requirePermission.mockRejectedValue(
        permissionError,
      );

      // Act
      try {
        await deleteServiceUseCase.execute(deleteRequest);
      } catch (error) {
        // Expected to throw
      }

      // Assert
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission denied for service deletion',
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: unauthorizedUserId,
          serviceId,
          businessId,
          requiredPermission: 'MANAGE_SERVICES',
        }),
      );
    });

    it('🚨 RED - should handle generic permission errors', async () => {
      // Arrange
      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId: unauthorizedUserId,
      };

      mockServiceRepository.findById.mockResolvedValue(mockService);
      // Simuler une InsufficientPermissionsError plus réaliste
      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError(
          unauthorizedUserId,
          'MANAGE_SERVICES',
          serviceId,
        ),
      );

      // Act & Assert
      await expect(deleteServiceUseCase.execute(deleteRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Permission denied for service deletion',
        expect.any(Error),
        expect.objectContaining({
          requestingUserId: unauthorizedUserId,
          serviceId,
          businessId,
          requiredPermission: 'MANAGE_SERVICES',
        }),
      );
    });
  });

  describe('🎯 Business Rules - Service Deletion Constraints', () => {
    it('🚨 RED - should require permissions even for services that cannot be deleted', async () => {
      // Arrange
      const activeService = Service.create({
        businessId: BusinessId.create(businessId),
        name: 'Active Service',
        serviceTypeIds: [
          ServiceTypeId.fromString('550e8400-e29b-41d4-a716-446655440005'),
        ],
        description: 'Active service with business constraints',
        basePrice: 100,
        currency: 'EUR',
        duration: 90,
        allowOnlineBooking: true, // Actif = contraintes métier pour suppression
        requiresApproval: false,
        assignedStaffIds: [],
      });

      const deleteRequest: DeleteServiceRequest = {
        serviceId,
        requestingUserId: unauthorizedUserId,
      };

      mockServiceRepository.findById.mockResolvedValue(activeService);
      mockPermissionService.requirePermission.mockRejectedValue(
        new InsufficientPermissionsError(
          unauthorizedUserId,
          'MANAGE_SERVICES',
          serviceId,
        ),
      );

      // Act & Assert
      await expect(deleteServiceUseCase.execute(deleteRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      // Permissions doivent être vérifiées AVANT les règles métier
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        unauthorizedUserId,
        'MANAGE_SERVICES',
        expect.objectContaining({
          businessId,
          resourceId: serviceId,
        }),
      );
    });
  });

  describe('✅ TDD GREEN Phase - Placeholder for Implementation Tests', () => {
    it('should be implemented after DeleteServiceUseCase refactoring', () => {
      // Ce test sera développé après implémentation complète du refactoring
      expect(true).toBe(true);
    });
  });

  describe('🔵 TDD REFACTOR Phase - Enhanced Permission Logic Tests', () => {
    it('should be implemented after GREEN phase completion', () => {
      // Ce test sera développé dans la phase REFACTOR
      expect(true).toBe(true);
    });
  });
});
