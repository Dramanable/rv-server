/**
 * 🧪 TDD TEST SUITE - GetUserEffectivePermissionsUseCase
 *
 * Test-Driven Development pour les permissions effectives utilisateur
 *
 * CYCLE TDD APPLIQUÉ :
 * 🔴 RED    : Tests qui échouent en premier
 * 🟢 GREEN  : Code minimal pour faire passer les tests
 * 🔵 REFACTOR : Amélioration du code en gardant les tests verts
 */

import { InsufficientPermissionsError } from '@application/exceptions/application.exceptions';
import { Logger } from '@application/ports/logger.port';
import { IPermissionService } from '@application/ports/permission.service.interface';
import { GetUserEffectivePermissionsUseCase } from '@application/use-cases/role-management/get-user-effective-permissions.use-case';
import { RoleAssignmentContext } from '@domain/entities/role-assignment.entity';
import { IRoleAssignmentRepository } from '@domain/repositories/role-assignment.repository.interface';
import { Permission, UserRole } from '@shared/enums/user-role.enum';

describe('🧪 GetUserEffectivePermissionsUseCase - TDD Suite', () => {
  let useCase: GetUserEffectivePermissionsUseCase;
  let mockRoleAssignmentRepository: jest.Mocked<IRoleAssignmentRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;
  let mockLogger: jest.Mocked<Logger>;

  // Test data
  const testContext: RoleAssignmentContext = {
    businessId: 'business-123',
    locationId: 'location-456',
    departmentId: 'department-789',
  };

  const requestingUserId = 'manager-user-123';
  const targetUserId = 'staff-user-456';
  const correlationId = 'correlation-123';

  beforeEach(() => {
    // 🎭 MOCKS SETUP
    mockRoleAssignmentRepository = {
      findByUserId: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByBusinessId: jest.fn(),
      findActiveAssignments: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IRoleAssignmentRepository>;

    mockPermissionService = {
      hasPermission: jest.fn(),
      requirePermission: jest.fn(),
      getUserPermissions: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      canActOnRole: jest.fn(),
      hasBusinessPermission: jest.fn(),
      canManageUser: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
    } as unknown as jest.Mocked<IPermissionService>;

    mockLogger = {
      info: jest.fn().mockImplementation(() => {}),
      warn: jest.fn().mockImplementation(() => {}),
      error: jest.fn().mockImplementation(() => {}),
      debug: jest.fn().mockImplementation(() => {}),
      audit: jest.fn().mockImplementation(() => {}),
      child: jest.fn().mockImplementation(() => mockLogger),
    } as jest.Mocked<Logger>;

    useCase = new GetUserEffectivePermissionsUseCase(
      mockRoleAssignmentRepository,
      mockPermissionService,
      mockLogger,
    );
  });

  describe('🔴 RED Phase - Permission Validation', () => {
    it('should require MANAGE_ALL_STAFF permission when requesting other user permissions', async () => {
      // Given
      const request = {
        requestingUserId,
        targetUserId, // Different user
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      mockPermissionService.requirePermission.mockRejectedValueOnce(
        new InsufficientPermissionsError(requestingUserId, 'MANAGE_ALL_STAFF'),
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      expect(mockPermissionService.requirePermission).toHaveBeenCalledWith(
        requestingUserId,
        'MANAGE_ALL_STAFF',
        {
          businessId: testContext.businessId,
          locationId: testContext.locationId,
          departmentId: testContext.departmentId,
          correlationId,
        },
      );
    });

    it('should allow user to view their own permissions without additional checks', async () => {
      // Given - Same user requesting their own permissions
      const request = {
        requestingUserId: targetUserId, // Same user
        targetUserId: targetUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([]);

      // When
      const result = await useCase.execute(request);

      // Then - No permission check should be called
      expect(mockPermissionService.requirePermission).not.toHaveBeenCalled();
      expect(result.userId).toBe(targetUserId);
    });
  });

  describe('🔴 RED Phase - Role Assignment Retrieval', () => {
    it('should return empty permissions when user has no role assignments', async () => {
      // Given
      const request = {
        requestingUserId: targetUserId, // Same user
        targetUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result).toEqual({
        userId: targetUserId,
        context: testContext,
        effectivePermissions: [],
        assignedRoles: [],
        hierarchyLevel: 0,
        canAssignRoles: [],
        retrievedAt: expect.any(Date),
      });

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'No active role assignments found for user',
        expect.objectContaining({
          targetUserId,
          correlationId,
        }),
      );
    });

    it('should filter out expired and inactive role assignments', async () => {
      // Given
      const request = {
        requestingUserId: targetUserId,
        targetUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      // Mock expired assignment
      const expiredAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(false),
        hasExpired: jest.fn().mockReturnValue(true),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest.fn().mockReturnValue([]),
      } as any;

      // Mock inactive assignment
      const inactiveAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(false),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest.fn().mockReturnValue([]),
      } as any;

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([
        expiredAssignment,
        inactiveAssignment,
      ]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.assignedRoles).toHaveLength(0);
      expect(result.effectivePermissions).toHaveLength(0);
    });
  });

  describe('🟢 GREEN Phase - Effective Permissions Calculation', () => {
    it('should calculate effective permissions from multiple active role assignments', async () => {
      // Given
      const request = {
        requestingUserId: targetUserId,
        targetUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      // Mock active BUSINESS_ADMIN assignment
      const businessAdminAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest
          .fn()
          .mockReturnValue([
            Permission.MANAGE_ALL_STAFF,
            Permission.VIEW_BUSINESS_ANALYTICS,
          ]),
        getRole: jest.fn().mockReturnValue(UserRole.BUSINESS_ADMIN),
        getAssignmentScope: jest.fn().mockReturnValue('BUSINESS'),
        getAssignedAt: jest.fn().mockReturnValue(new Date()),
        getExpiresAt: jest.fn().mockReturnValue(undefined),
        getAssignedBy: jest.fn().mockReturnValue('business-owner-123'),
      } as any;

      // Mock active LOCATION_MANAGER assignment
      const locationManagerAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest
          .fn()
          .mockReturnValue([
            Permission.MANAGE_CALENDAR_RULES,
            Permission.BOOK_ANY_APPOINTMENT,
          ]),
        getRole: jest.fn().mockReturnValue(UserRole.LOCATION_MANAGER),
        getAssignmentScope: jest.fn().mockReturnValue('LOCATION'),
        getAssignedAt: jest.fn().mockReturnValue(new Date()),
        getExpiresAt: jest.fn().mockReturnValue(undefined),
        getAssignedBy: jest.fn().mockReturnValue('business-admin-456'),
      } as any;

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([
        businessAdminAssignment,
        locationManagerAssignment,
      ]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.effectivePermissions).toEqual(
        expect.arrayContaining([
          Permission.BOOK_ANY_APPOINTMENT,
          Permission.MANAGE_ALL_STAFF,
          Permission.MANAGE_CALENDAR_RULES,
          Permission.VIEW_BUSINESS_ANALYTICS,
        ]),
      );

      expect(result.assignedRoles).toHaveLength(2);
      expect(result.assignedRoles).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: UserRole.BUSINESS_ADMIN,
            scope: 'BUSINESS',
          }),
          expect.objectContaining({
            role: UserRole.LOCATION_MANAGER,
            scope: 'LOCATION',
          }),
        ]),
      );
    });

    it('should calculate correct hierarchy level from multiple roles', async () => {
      // Given
      const request = {
        requestingUserId: targetUserId,
        targetUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      // Mock BUSINESS_OWNER assignment (highest level)
      const businessOwnerAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest.fn().mockReturnValue([]),
        getRole: jest.fn().mockReturnValue(UserRole.BUSINESS_OWNER),
        getAssignmentScope: jest.fn().mockReturnValue('BUSINESS'),
        getAssignedAt: jest.fn().mockReturnValue(new Date()),
        getExpiresAt: jest.fn().mockReturnValue(undefined),
        getAssignedBy: jest.fn().mockReturnValue('platform-admin-123'),
      } as any;

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([
        businessOwnerAssignment,
      ]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.hierarchyLevel).toBe(900); // BUSINESS_OWNER level
      expect(result.canAssignRoles).toContain(UserRole.BUSINESS_ADMIN);
      expect(result.canAssignRoles).toContain(UserRole.LOCATION_MANAGER);
      expect(result.canAssignRoles).not.toContain(UserRole.BUSINESS_OWNER);
      expect(result.canAssignRoles).not.toContain(UserRole.PLATFORM_ADMIN);
    });
  });

  describe('🟢 GREEN Phase - Business Context Validation', () => {
    it('should only include assignments valid in the specified context', async () => {
      // Given
      const specificContext: RoleAssignmentContext = {
        businessId: 'business-123',
        locationId: 'location-456',
      };

      const request = {
        requestingUserId: targetUserId,
        targetUserId,
        context: specificContext,
        correlationId,
        timestamp: new Date(),
      };

      // Assignment valid in context
      const validAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest
          .fn()
          .mockReturnValue([Permission.MANAGE_CALENDAR_RULES]),
        getRole: jest.fn().mockReturnValue(UserRole.LOCATION_MANAGER),
        getAssignmentScope: jest.fn().mockReturnValue('LOCATION'),
        getAssignedAt: jest.fn().mockReturnValue(new Date()),
        getExpiresAt: jest.fn().mockReturnValue(undefined),
        getAssignedBy: jest.fn().mockReturnValue('business-admin-456'),
      } as any;

      // Assignment invalid in context (wrong location)
      const invalidAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(false),
        getEffectivePermissions: jest.fn().mockReturnValue([]),
      } as any;

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([
        validAssignment,
        invalidAssignment,
      ]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.assignedRoles).toHaveLength(1);
      expect(result.assignedRoles[0].role).toBe(UserRole.LOCATION_MANAGER);
    });
  });

  describe('🔴 RED Phase - Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      // Given
      const request = {
        requestingUserId: targetUserId,
        targetUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      const repositoryError = new Error('Database connection failed');
      mockRoleAssignmentRepository.findByUserId.mockRejectedValueOnce(
        repositoryError,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(repositoryError);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to retrieve user effective permissions',
        repositoryError,
        expect.objectContaining({
          targetUserId,
          correlationId,
        }),
      );
    });

    it('should handle permission service errors', async () => {
      // Given
      const request = {
        requestingUserId,
        targetUserId, // Different user
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      const permissionError = new InsufficientPermissionsError(
        requestingUserId,
        'MANAGE_ALL_STAFF',
      );
      mockPermissionService.requirePermission.mockRejectedValueOnce(
        permissionError,
      );

      // When & Then
      await expect(useCase.execute(request)).rejects.toThrow(permissionError);
    });
  });

  describe('🔵 REFACTOR Phase - Integration Tests', () => {
    it('should execute complete flow for BUSINESS_ADMIN requesting PRACTITIONER permissions', async () => {
      // Given - Business scenario: Admin checking practitioner permissions
      const request = {
        requestingUserId, // BUSINESS_ADMIN
        targetUserId, // PRACTITIONER
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      // Mock successful permission check
      mockPermissionService.requirePermission.mockResolvedValueOnce();

      // Mock practitioner assignment
      const practitionerAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest
          .fn()
          .mockReturnValue([
            Permission.VIEW_OWN_APPOINTMENTS,
            Permission.MANAGE_CLIENT_NOTES,
          ]),
        getRole: jest.fn().mockReturnValue(UserRole.PRACTITIONER),
        getAssignmentScope: jest.fn().mockReturnValue('DEPARTMENT'),
        getAssignedAt: jest.fn().mockReturnValue(new Date()),
        getExpiresAt: jest.fn().mockReturnValue(undefined),
        getAssignedBy: jest.fn().mockReturnValue('department-head-789'),
      } as any;

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([
        practitionerAssignment,
      ]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.userId).toBe(targetUserId);
      expect(result.effectivePermissions).toContain(
        Permission.VIEW_OWN_APPOINTMENTS,
      );
      expect(result.effectivePermissions).toContain(
        Permission.MANAGE_CLIENT_NOTES,
      );
      expect(result.assignedRoles[0].role).toBe(UserRole.PRACTITIONER);
      expect(result.hierarchyLevel).toBe(400); // PRACTITIONER level

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Retrieving user effective permissions',
        expect.objectContaining({
          requestingUserId,
          targetUserId,
          correlationId,
        }),
      );

      expect(mockLogger.info).toHaveBeenCalledWith(
        'User effective permissions retrieved successfully',
        expect.objectContaining({
          targetUserId,
          effectivePermissionsCount: 2,
          assignedRolesCount: 1,
          hierarchyLevel: 400,
          correlationId,
        }),
      );
    });

    it('should handle CLIENT permissions correctly', async () => {
      // Given - Client checking their own permissions
      const clientUserId = 'client-123';
      const request = {
        requestingUserId: clientUserId,
        targetUserId: clientUserId,
        context: testContext,
        correlationId,
        timestamp: new Date(),
      };

      // Mock VIP client assignment
      const vipClientAssignment = {
        isActiveAssignment: jest.fn().mockReturnValue(true),
        hasExpired: jest.fn().mockReturnValue(false),
        isValidInContext: jest.fn().mockReturnValue(true),
        getEffectivePermissions: jest
          .fn()
          .mockReturnValue([
            Permission.BOOK_APPOINTMENT,
            Permission.BOOK_FOR_FAMILY_MEMBER,
            Permission.VIEW_SERVICE_CATALOG,
            Permission.JOIN_WAITING_LIST,
          ]),
        getRole: jest.fn().mockReturnValue(UserRole.VIP_CLIENT),
        getAssignmentScope: jest.fn().mockReturnValue('BUSINESS'),
        getAssignedAt: jest.fn().mockReturnValue(new Date()),
        getExpiresAt: jest.fn().mockReturnValue(undefined),
        getAssignedBy: jest.fn().mockReturnValue('business-admin-123'),
      } as any;

      mockRoleAssignmentRepository.findByUserId.mockResolvedValueOnce([
        vipClientAssignment,
      ]);

      // When
      const result = await useCase.execute(request);

      // Then
      expect(result.assignedRoles[0].role).toBe(UserRole.VIP_CLIENT);
      expect(result.effectivePermissions).toContain(
        Permission.BOOK_APPOINTMENT,
      );
      expect(result.effectivePermissions).toContain(
        Permission.BOOK_FOR_FAMILY_MEMBER,
      );
      expect(result.hierarchyLevel).toBe(80); // VIP_CLIENT level
      expect(result.canAssignRoles).toEqual([
        UserRole.REGULAR_CLIENT,
        UserRole.GUEST_CLIENT,
      ]); // Can assign lower roles
    });
  });
});
