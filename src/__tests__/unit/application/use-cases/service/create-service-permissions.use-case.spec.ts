/**
 * @fileoverview Tests TDD pour les permissions dans CreateServiceUseCase
 *
 * 🎯 OBJECTIF TDD : Vérifier que les permissions sont strictement appliquées
 * pour la création de services selon les 3 types d'acteurs :
 * - BUSINESS_OWNER : Peut créer des services pour son business uniquement
 * - PROFESSIONAL : Peut créer des services selon ses permissions business
 * - REGULAR_CLIENT : Ne peut JAMAIS créer de services
 *
 * 📋 WORKFLOW TDD :
 * 1. RED : Tests qui échouent car permissions non implémentées
 * 2. GREEN : Implémentation minimale pour faire passer les tests
 * 3. REFACTOR : Amélioration du code tout en gardant les tests verts
 */

import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import {
  CreateServiceRequest,
  CreateServiceUseCase,
} from '@application/use-cases/service/create-service.use-case';
import { BusinessRepository } from '@domain/repositories/business.repository.interface';
import { ServiceRepository } from '@domain/repositories/service.repository.interface';

describe('CreateServiceUseCase - TDD Permission Enforcement', () => {
  let createServiceUseCase: CreateServiceUseCase;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockServiceRepository: jest.Mocked<ServiceRepository>;
  let mockBusinessRepository: jest.Mocked<BusinessRepository>;
  let mockLogger: jest.Mocked<Logger>;
  let mockI18n: jest.Mocked<I18nService>;

  beforeEach(() => {
    // Mock du service de permissions (principal focus du TDD)
    mockPermissionService = {
      requirePermission: jest.fn(),
      hasPermission: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canActOnRole: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      canManageUser: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
    } as unknown as jest.Mocked<IPermissionService>;

    // Mock des repositories (nécessaires pour le constructeur)
    mockServiceRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findByBusinessId: jest.fn(),
      findByCategory: jest.fn(),
      findByType: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      search: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
      findActiveByBusinessId: jest.fn(),
      findByDuration: jest.fn(),
      findByPrice: jest.fn(),
      export: jest.fn(),
      getServiceStatistics: jest.fn(),
    } as unknown as jest.Mocked<ServiceRepository>;

    mockBusinessRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      findBySector: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByName: jest.fn(),
      search: jest.fn(),
      getStatistics: jest.fn(),
    } as unknown as jest.Mocked<BusinessRepository>;

    // Mock des services nécessaires
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      audit: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockI18n = {
      t: jest.fn().mockReturnValue('mocked translation'),
    } as unknown as jest.Mocked<I18nService>;

    // Instancier le Use Case avec le constructeur complet (5 arguments)
    createServiceUseCase = new CreateServiceUseCase(
      mockServiceRepository,
      mockBusinessRepository,
      mockPermissionService,
      mockLogger,
      mockI18n,
    );
  });

  describe('🚨 TDD RED Phase - Permission Enforcement Tests', () => {
    it('should enforce business permissions for service creation', async () => {
      // Given - Données de test valides avec UUID corrects selon CreateServiceRequest
      const request: CreateServiceRequest = {
        requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Professional Service',
        description: 'A service for professionals',
        serviceTypeIds: ['f47ac10b-58cc-4372-a567-0e02b2c3d481'],
        duration: 60,
        price: {
          amount: 80.0,
          currency: 'EUR',
        },
        settings: {
          isOnlineBookingEnabled: true,
          requiresApproval: false,
        },
        isActive: true,
      };

      // Mock business repository
      const mockBusiness = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Test Business',
        ownerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      } as any;

      mockBusinessRepository.findById.mockResolvedValueOnce(mockBusiness);

      // 🚨 TDD RED : Cette exception ne sera pas lancée car les permissions
      // ne sont pas encore vérifiées avec IPermissionService !
      mockPermissionService.requirePermission.mockRejectedValueOnce(
        new InsufficientPermissionsError(
          'Insufficient permissions to create service',
          { businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' },
        ),
      );

      // When & Then
      await expect(createServiceUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        'CREATE_SERVICE',
        {
          businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          targetResource: 'SERVICE',
        },
      );
    });

    it('should reject service creation by non-business-owner without permissions', async () => {
      // Given
      const request: CreateServiceRequest = {
        requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d484',
        businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Unauthorized Service',
        description: 'Service by unauthorized user',
        serviceTypeIds: ['f47ac10b-58cc-4372-a567-0e02b2c3d481'],
        duration: 30,
        price: {
          amount: 50.0,
          currency: 'EUR',
        },
        settings: {
          isOnlineBookingEnabled: false,
        },
        isActive: true,
      };

      const mockBusiness = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Target Business',
        ownerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d483',
      } as any;

      mockBusinessRepository.findById.mockResolvedValueOnce(mockBusiness);

      // 🚨 TDD RED : La vérification d'ownership n'est pas encore faite
      // avec IPermissionService.requirePermission !
      mockPermissionService.requirePermission.mockRejectedValueOnce(
        new InsufficientPermissionsError(
          'User does not have permission to create services for this business',
          { businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' },
        ),
      );

      // When & Then
      await expect(createServiceUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d484',
        'CREATE_SERVICE',
        {
          businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          targetResource: 'SERVICE',
        },
      );
    });

    it('should pass business context validation for proper permissions', async () => {
      // Given
      const request: CreateServiceRequest = {
        requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d486',
        businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Valid Service',
        description: 'Service with proper permissions',
        serviceTypeIds: ['f47ac10b-58cc-4372-a567-0e02b2c3d481'],
        duration: 45,
        price: {
          amount: 75.0,
          currency: 'EUR',
        },
        settings: {
          isOnlineBookingEnabled: true,
          requiresApproval: true,
        },
        isActive: true,
      };

      const mockBusiness = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Test Business',
        ownerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      } as any;

      mockBusinessRepository.findById.mockResolvedValueOnce(mockBusiness);
      mockServiceRepository.save.mockResolvedValueOnce({
        id: { getValue: () => 'f47ac10b-58cc-4372-a567-0e02b2c3d487' },
        businessId: { getValue: () => 'f47ac10b-58cc-4372-a567-0e02b2c3d480' },
        name: 'Test Service',
      } as any);

      mockPermissionService.requirePermission.mockResolvedValueOnce(undefined);

      // When
      await createServiceUseCase.execute(request);

      // Then - Vérifier que le contexte business est passé correctement
      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d486',
        'CREATE_SERVICE',
        {
          businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          targetResource: 'SERVICE',
        },
      );
    });

    it('should handle permission errors correctly', async () => {
      // Given
      const request: CreateServiceRequest = {
        requestingUserId: 'f47ac10b-58cc-4372-a567-0e02b2c3d488',
        businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Error Test Service',
        description: 'Service to test error handling',
        serviceTypeIds: ['f47ac10b-58cc-4372-a567-0e02b2c3d481'],
        duration: 60,
        price: {
          amount: 100.0,
          currency: 'EUR',
        },
        isActive: true,
      };

      const mockBusiness = {
        id: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
        name: 'Test Business',
        ownerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      } as any;

      mockBusinessRepository.findById.mockResolvedValueOnce(mockBusiness);

      const permissionError = new InsufficientPermissionsError(
        'User does not have CREATE_SERVICE permission',
        { businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480' },
      );

      mockPermissionService.requirePermission.mockRejectedValueOnce(
        permissionError,
      );

      // When & Then
      await expect(createServiceUseCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        'f47ac10b-58cc-4372-a567-0e02b2c3d488',
        'CREATE_SERVICE',
        {
          businessId: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
          targetResource: 'SERVICE',
        },
      );
    });
  });

  describe('✅ TDD GREEN Phase - Placeholder for Implementation Tests', () => {
    it('should be implemented after CreateServiceUseCase refactoring', () => {
      // 📝 NOTE : Ces tests passeront au VERT une fois que CreateServiceUseCase
      // aura été refactorisé pour utiliser IPermissionService.requirePermission()
      expect(mockPermissionService).toBeDefined();
    });
  });

  describe('🔵 TDD REFACTOR Phase - Enhanced Permission Logic Tests', () => {
    it('should be implemented after GREEN phase completion', () => {
      // 📝 NOTE : Cette phase interviendra après que tous les tests RED
      // soient passés au VERT avec l'implémentation de base
      expect(true).toBe(true);
    });
  });
});
