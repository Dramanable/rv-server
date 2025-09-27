/**
 * 🧪 APPLICATION USE CASE TESTS - AssignRoleUseCase
 *
 * Tests TDD pour le use case d'assignation de rôles.
 * Focus sur la logique d'orchestration et validation métier.
 */

import { InsufficientPermissionsError } from '@application/exceptions/auth.exceptions';
import { IPermissionService } from '@application/ports/permission.service.interface';
import {
  AssignRoleRequest,
  AssignRoleUseCase,
} from '@application/use-cases/role-management/assign-role.use-case';
import { BusinessContext } from '@domain/entities/business-context.entity';
import { RoleAssignment } from '@domain/entities/role-assignment.entity';
import { IBusinessContextRepository } from '@domain/repositories/business-context.repository.interface';
import { IRoleAssignmentRepository } from '@domain/repositories/role-assignment.repository.interface';
import { UserRole } from '@shared/enums/user-role.enum';

describe('AssignRoleUseCase', () => {
  let useCase: AssignRoleUseCase;
  let mockRoleAssignmentRepository: jest.Mocked<IRoleAssignmentRepository>;
  let mockBusinessContextRepository: jest.Mocked<IBusinessContextRepository>;
  let mockPermissionService: jest.Mocked<IPermissionService>;

  const mockBusinessContext = BusinessContext.create(
    'business-123',
    'Test Business',
    [
      {
        locationId: 'location-456',
        locationName: 'Main Office',
        departments: [
          {
            departmentId: 'department-789',
            departmentName: 'Sales Department',
            isActive: true,
          },
        ],
        isActive: true,
      },
    ],
  );

  beforeEach(() => {
    // Permission Service Mock
    mockPermissionService = {
      requirePermission: jest.fn(),
      canActOnRole: jest.fn(),
      canManageUser: jest.fn(),
      hasPermission: jest.fn(),
      getUserRole: jest.fn(),
      hasRole: jest.fn(),
      getUserPermissions: jest.fn(),
      hasBusinessPermission: jest.fn(),
      isSuperAdmin: jest.fn(),
      requireSuperAdminPermission: jest.fn(),
    } as jest.Mocked<IPermissionService>;

    // Role Assignment Repository Mock
    mockRoleAssignmentRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findActiveByUserId: jest.fn(),
      findActiveByUserIdAndContext: jest.fn(),
      findByContext: jest.fn(),
      findByCriteria: jest.fn(),
      findWithFilters: jest.fn(),
      hasRoleInContext: jest.fn(),
      getEffectiveRole: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      getAssignmentStats: jest.fn(),
      revokeByContext: jest.fn(),
      countByRole: jest.fn(),
      countByBusiness: jest.fn(),
      findExpiringSoon: jest.fn(),
      searchAssignments: jest.fn(),
      bulkAssign: jest.fn(),
      transferRoles: jest.fn(),
      archiveExpired: jest.fn(),
      countByCriteria: jest.fn(),
      deleteByUserId: jest.fn(),
      findActiveByCriteria: jest.fn(),
      existsByUserAndRole: jest.fn(),
    } as unknown as jest.Mocked<IRoleAssignmentRepository>;

    // Business Context Repository Mock
    mockBusinessContextRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findByCriteria: jest.fn(),
      findByBusinessId: jest.fn(),
      findAllActive: jest.fn(),
      findWithFilters: jest.fn(),
      exists: jest.fn(),
      count: jest.fn(),
      addLocation: jest.fn(),
      updateLocation: jest.fn(),
      removeLocation: jest.fn(),
      activateLocation: jest.fn(),
      deactivateLocation: jest.fn(),
      addDepartment: jest.fn(),
      updateDepartment: jest.fn(),
      removeDepartment: jest.fn(),
      activateDepartment: jest.fn(),
      deactivateDepartment: jest.fn(),
      transferDepartment: jest.fn(),
      reactivateDepartment: jest.fn(),
    } as unknown as jest.Mocked<IBusinessContextRepository>;

    useCase = new AssignRoleUseCase(
      mockRoleAssignmentRepository,
      mockBusinessContextRepository,
      mockPermissionService, // ✅ Ajout du service de permissions
    );
  });

  describe('execute', () => {
    const validRequest: AssignRoleRequest = {
      userId: 'user-123',
      role: UserRole.LOCATION_MANAGER,
      context: {
        businessId: 'business-123',
        locationId: 'location-456',
      },
      assignedBy: 'admin-456',
      correlationId: 'correlation-123',
    };

    it('should assign role successfully', async () => {
      // ✅ Mock de permissions - OBLIGATOIRE pour passer les tests
      mockPermissionService.requirePermission.mockResolvedValue(undefined); // Pas d'erreur
      mockPermissionService.canActOnRole.mockResolvedValue(true); // Peut agir sur le rôle

      // Mock pour assigneur avec permissions
      const assignerRoleAssignment = RoleAssignment.create({
        userId: 'admin-456',
        role: UserRole.BUSINESS_ADMIN,
        context: { businessId: 'business-123' },
        assignedBy: 'system',
      });

      // Mock pour sauvegarde réussie
      const mockSavedAssignment = RoleAssignment.create({
        userId: 'user-123',
        role: UserRole.LOCATION_MANAGER,
        context: {
          businessId: 'business-123',
          locationId: 'location-456',
        },
        assignedBy: 'admin-456',
      });

      mockBusinessContextRepository.findById.mockResolvedValue(
        mockBusinessContext,
      );
      mockRoleAssignmentRepository.findActiveByUserIdAndContext.mockResolvedValue(
        [assignerRoleAssignment],
      );
      mockRoleAssignmentRepository.save.mockResolvedValue(mockSavedAssignment);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(true);
      expect(result.roleAssignmentId).toBe(mockSavedAssignment.getId());
      expect(mockRoleAssignmentRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should fail when business context does not exist', async () => {
      // ✅ Mock de permissions - Autoriser permissions mais pas de contexte business
      mockPermissionService.requirePermission.mockResolvedValue(undefined); // Permission OK
      mockPermissionService.canActOnRole.mockResolvedValue(true); // Rôle OK

      mockBusinessContextRepository.findById.mockResolvedValue(null);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Business context not found');
    });

    it('should fail when assigner has insufficient permissions', async () => {
      // ✅ Mock de permissions - Réussir requirePermission mais échouer canActOnRole
      mockPermissionService.requirePermission.mockResolvedValue(undefined); // Permission OK
      mockPermissionService.canActOnRole.mockResolvedValue(false); // ❌ Pas le bon niveau de rôle
      mockPermissionService.canManageUser.mockResolvedValue(true);

      const insufficientAssignment = RoleAssignment.create({
        userId: 'insufficient-admin',
        role: UserRole.RECEPTIONIST,
        context: { businessId: 'business-123' },
        assignedBy: 'system',
      });

      mockBusinessContextRepository.findById.mockResolvedValue(
        mockBusinessContext,
      );
      mockRoleAssignmentRepository.findActiveByUserIdAndContext.mockResolvedValue(
        [insufficientAssignment],
      );

      // ✅ S'attendre à une exception au lieu d'un résultat avec success: false
      await expect(useCase.execute(validRequest)).rejects.toThrow(
        InsufficientPermissionsError,
      );

      // Vérifier que la méthode de permission a été appelée
      expect(mockPermissionService.canActOnRole).toHaveBeenCalledWith(
        'admin-456',
        UserRole.LOCATION_MANAGER,
        expect.any(Object),
      );
    });

    it('should prevent duplicate role assignments', async () => {
      // ✅ Mock de permissions - Autoriser permissions pour passer les vérifications initiales
      mockPermissionService.requirePermission.mockResolvedValue(undefined); // Permission OK
      mockPermissionService.canActOnRole.mockResolvedValue(true); // Rôle OK

      const assignerRoleAssignment = RoleAssignment.create({
        userId: 'admin-456',
        role: UserRole.BUSINESS_ADMIN,
        context: { businessId: 'business-123' },
        assignedBy: 'system',
      });

      const existingUserAssignment = RoleAssignment.create({
        userId: 'user-123',
        role: UserRole.LOCATION_MANAGER,
        context: {
          businessId: 'business-123',
          locationId: 'location-456',
        },
        assignedBy: 'admin-456',
      });

      mockBusinessContextRepository.findById.mockResolvedValue(
        mockBusinessContext,
      );
      mockRoleAssignmentRepository.findActiveByUserIdAndContext.mockResolvedValue(
        [assignerRoleAssignment],
      );
      mockRoleAssignmentRepository.hasRoleInContext.mockResolvedValue(true);

      const result = await useCase.execute(validRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'User already has this role in the specified context',
      );
    });
  });

  describe('validation edge cases', () => {
    it('should validate location exists when assigning location-level role', async () => {
      const locationRequest: AssignRoleRequest = {
        userId: 'user-123',
        role: UserRole.LOCATION_MANAGER,
        context: {
          businessId: 'business-123',
          locationId: 'non-existent-location',
        },
        assignedBy: 'admin-456',
        correlationId: 'correlation-123',
      };

      const businessOwnerAssignment = RoleAssignment.create({
        userId: 'admin-456',
        role: UserRole.BUSINESS_OWNER,
        context: { businessId: 'business-123' },
        assignedBy: 'super-admin',
      });

      // Mock permission service
      mockPermissionService.requirePermission.mockResolvedValue(undefined);
      mockPermissionService.canActOnRole.mockResolvedValue(true);
      mockPermissionService.canManageUser.mockResolvedValue(true);

      mockBusinessContextRepository.findById.mockResolvedValue(
        mockBusinessContext,
      );
      mockRoleAssignmentRepository.findActiveByUserIdAndContext.mockResolvedValue(
        [businessOwnerAssignment],
      );

      const result = await useCase.execute(locationRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Location not found in business context');
    });

    it('should validate department exists when assigning department-level role', async () => {
      const departmentRequest: AssignRoleRequest = {
        userId: 'user-123',
        role: UserRole.DEPARTMENT_HEAD,
        context: {
          businessId: 'business-123',
          locationId: 'location-456',
          departmentId: 'non-existent-department',
        },
        assignedBy: 'admin-456',
        correlationId: 'correlation-123',
      };

      const businessOwnerAssignment = RoleAssignment.create({
        userId: 'admin-456',
        role: UserRole.BUSINESS_OWNER,
        context: { businessId: 'business-123' },
        assignedBy: 'super-admin',
      });

      // Mock permission service
      mockPermissionService.requirePermission.mockResolvedValue(undefined);
      mockPermissionService.canActOnRole.mockResolvedValue(true);
      mockPermissionService.canManageUser.mockResolvedValue(true);

      mockBusinessContextRepository.findById.mockResolvedValue(
        mockBusinessContext,
      );
      mockRoleAssignmentRepository.findActiveByUserIdAndContext.mockResolvedValue(
        [businessOwnerAssignment],
      );

      const result = await useCase.execute(departmentRequest);

      expect(result.success).toBe(false);
      expect(result.error).toContain(
        'Department not found in business context',
      );
    });
  });
});
