/**
 * 🧪 TESTS UNITAIRES - Role Assignment Entity
 *
 * Tests TDD pour l'entité métier RoleAssignment avec validation
 * des contextes hiérarchiques et permissions effectives.
 */

import {
  RoleAssignment,
  RoleAssignmentContext,
  CreateRoleAssignmentParams,
} from '@domain/entities/role-assignment.entity';
import { UserRole } from '@shared/enums/user-role.enum';

describe('RoleAssignment Domain Entity', () => {
  const mockUserId = 'user-123';
  const mockAssignedBy = 'admin-456';

  const businessContext: RoleAssignmentContext = {
    businessId: 'business-123',
  };

  const locationContext: RoleAssignmentContext = {
    businessId: 'business-123',
    locationId: 'location-456',
  };

  const departmentContext: RoleAssignmentContext = {
    businessId: 'business-123',
    locationId: 'location-456',
    departmentId: 'department-789',
  };

  describe('create', () => {
    it('should create a valid role assignment', () => {
      const params: CreateRoleAssignmentParams = {
        userId: mockUserId,
        role: UserRole.BUSINESS_ADMIN,
        context: businessContext,
        assignedBy: mockAssignedBy,
      };

      const roleAssignment = RoleAssignment.create(params);

      expect(roleAssignment.getId()).toBeDefined();
      expect(roleAssignment.getUserId()).toBe(mockUserId);
      expect(roleAssignment.getRole()).toBe(UserRole.BUSINESS_ADMIN);
      expect(roleAssignment.getContext()).toEqual(businessContext);
      expect(roleAssignment.getAssignedBy()).toBe(mockAssignedBy);
      expect(roleAssignment.getAssignedAt()).toBeInstanceOf(Date);
      expect(roleAssignment.isActive()).toBe(true);
    });

    it('should create role assignment with expiration date', () => {
      const expiresAt = new Date(Date.now() + 86400000); // +24h
      const params: CreateRoleAssignmentParams = {
        userId: mockUserId,
        role: UserRole.DEPARTMENT_HEAD,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt,
        notes: 'Temporary assignment',
      };

      const assignment = RoleAssignment.create(params);

      expect(assignment.getExpiresAt()).toEqual(expiresAt);
      expect(assignment.getNotes()).toBe('Temporary assignment');
    });

    it('should validate business-level roles', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.BUSINESS_OWNER,
          context: locationContext, // ❌ Should be business level only
          assignedBy: mockAssignedBy,
        });
      }).toThrow('Role BUSINESS_OWNER must be assigned at business level only');
    });

    it('should validate location-level roles', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.LOCATION_MANAGER,
          context: departmentContext, // ❌ Should be location level only
          assignedBy: mockAssignedBy,
        });
      }).toThrow(
        'Role LOCATION_MANAGER must be assigned at location level only',
      );
    });

    it('should validate department-level roles', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.DEPARTMENT_HEAD,
          context: locationContext, // ❌ Missing departmentId
          assignedBy: mockAssignedBy,
        });
      }).toThrow('Role DEPARTMENT_HEAD must be assigned at department level');
    });

    it('should validate required businessId', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.PRACTITIONER,
          context: { businessId: '' }, // ❌ Empty businessId
          assignedBy: mockAssignedBy,
        });
      }).toThrow('Business ID is required');
    });
  });

  describe('getEffectivePermissions', () => {
    it('should return permissions for active assignments', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.LOCATION_MANAGER,
        context: locationContext,
        assignedBy: mockAssignedBy,
      });

      const permissions = assignment.getEffectivePermissions();
      expect(permissions.length).toBeGreaterThan(0);
    });

    it('should return empty permissions for inactive assignments', () => {
      const pastDate = new Date(Date.now() - 86400000); // -24h
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.DEPARTMENT_HEAD,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt: pastDate,
      });

      const permissions = assignment.getEffectivePermissions();
      expect(permissions).toEqual([]);
    });
  });

  describe('isValidInContext', () => {
    it('should validate context hierarchy', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.DEPARTMENT_HEAD,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.isValidInContext(departmentContext)).toBe(true);
      expect(assignment.isValidInContext(locationContext)).toBe(false);
      expect(assignment.isValidInContext(businessContext)).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should deactivate role assignment', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.PRACTITIONER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.isActive()).toBe(true);

      assignment.deactivate();

      expect(assignment.isActive()).toBe(false);
      expect(assignment.getEffectivePermissions()).toEqual([]);
    });
  });

  describe('isExpired', () => {
    it('should detect expired assignments', () => {
      const pastDate = new Date(Date.now() - 86400000); // -24h
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.PRACTITIONER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt: pastDate,
      });

      expect(assignment.isExpired()).toBe(true);
    });

    it('should detect non-expired assignments', () => {
      const futureDate = new Date(Date.now() + 86400000); // +24h
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.PRACTITIONER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt: futureDate,
      });

      expect(assignment.isExpired()).toBe(false);
    });

    it('should handle assignments without expiration', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.PRACTITIONER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.isExpired()).toBe(false);
    });
  });
});
