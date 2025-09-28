import {
  RoleAssignment,
  RoleAssignmentContext,
} from '@domain/entities/role-assignment.entity';
import { Permission, UserRole } from '@shared/enums/user-role.enum';

/**
 * 🧪 TESTS UNITAIRES - Role Assignment Entity
 * Tests TDD pour l'entité métier RoleAssignment avec validation
 * des contextes hiérarchiques et permissions effectives.
 */
describe('RoleAssignment Entity', () => {
  // Setup test data
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
      const roleAssignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_ADMIN,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      expect(roleAssignment.getId()).toBeDefined();
      expect(roleAssignment.getUserId()).toBe(mockUserId);
      expect(roleAssignment.getRole()).toBe(UserRole.BUSINESS_ADMIN);
      expect(roleAssignment.getContext()).toEqual(businessContext);
      expect(roleAssignment.getAssignedBy()).toBe(mockAssignedBy);
      expect(roleAssignment.getAssignedAt()).toBeInstanceOf(Date);
      expect(roleAssignment.isActiveAssignment()).toBe(true);
    });

    it('should create role assignment with expiration date', () => {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const roleAssignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.DEPARTMENT_HEAD,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt,
        notes: 'Temporary assignment',
      });

      expect(roleAssignment.getExpiresAt()).toEqual(expiresAt);
      expect(roleAssignment.getNotes()).toBe('Temporary assignment');
    });

    it('should throw error when BUSINESS_OWNER assigned at location level', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.BUSINESS_OWNER,
          context: locationContext,
          assignedBy: mockAssignedBy,
        });
      }).toThrow('Role BUSINESS_OWNER must be assigned at business level only');
    });

    it('should throw error when LOCATION_MANAGER assigned at department level', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.LOCATION_MANAGER,
          context: departmentContext,
          assignedBy: mockAssignedBy,
        });
      }).toThrow(
        'Role LOCATION_MANAGER must be assigned at location level only',
      );
    });

    it('should throw error when DEPARTMENT_HEAD assigned without department', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.DEPARTMENT_HEAD,
          context: locationContext,
          assignedBy: mockAssignedBy,
        });
      }).toThrow('Role DEPARTMENT_HEAD must be assigned at department level');
    });

    it('should throw error for SUPER_ADMIN role', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.SUPER_ADMIN,
          context: businessContext,
          assignedBy: mockAssignedBy,
        });
      }).toThrow(
        'Super admin and platform admin roles cannot be assigned in business context',
      );
    });

    it('should validate required businessId', () => {
      expect(() => {
        RoleAssignment.create({
          userId: mockUserId,
          role: UserRole.STAFF_MEMBER,
          context: { businessId: '' },
          assignedBy: mockAssignedBy,
        });
      }).toThrow('Business ID is required');
    });
  });

  describe('getEffectivePermissions', () => {
    it('should return permissions for active assignments', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_ADMIN,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      const permissions = assignment.getEffectivePermissions();
      expect(permissions.length).toBeGreaterThan(0);
      expect(permissions).toContain(Permission.MANAGE_ALL_STAFF);
      expect(permissions).toContain(Permission.CONFIGURE_BUSINESS_SETTINGS);
    });

    it('should return empty permissions for inactive assignments', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.DEPARTMENT_HEAD,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      assignment.deactivate();
      const permissions = assignment.getEffectivePermissions();
      expect(permissions).toEqual([]);
    });

    it('should return empty permissions for expired assignments', () => {
      const pastDate = new Date(Date.now() - 86400000); // -24h
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_ADMIN,
        context: businessContext,
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

    it('should validate business level assignment for any context in same business', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_OWNER,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.isValidInContext(businessContext)).toBe(true);
      expect(assignment.isValidInContext(locationContext)).toBe(true);
      expect(assignment.isValidInContext(departmentContext)).toBe(true);

      // Different business
      expect(
        assignment.isValidInContext({ businessId: 'other-business' }),
      ).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should deactivate role assignment', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.STAFF_MEMBER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.isActiveAssignment()).toBe(true);

      assignment.deactivate();

      expect(assignment.isActiveAssignment()).toBe(false);
      expect(assignment.getEffectivePermissions()).toEqual([]);
    });
  });

  describe('hasExpired', () => {
    it('should detect expired assignments', () => {
      const pastDate = new Date(Date.now() - 86400000); // -24h
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.STAFF_MEMBER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt: pastDate,
      });

      expect(assignment.hasExpired()).toBe(true);
    });

    it('should detect non-expired assignments', () => {
      const futureDate = new Date(Date.now() + 86400000); // +24h
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.STAFF_MEMBER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
        expiresAt: futureDate,
      });

      expect(assignment.hasExpired()).toBe(false);
    });

    it('should handle assignments without expiration', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.STAFF_MEMBER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.hasExpired()).toBe(false);
    });
  });

  describe('getAssignmentScope', () => {
    it('should return DEPARTMENT for department-level assignment', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.DEPARTMENT_HEAD,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.getAssignmentScope()).toBe('DEPARTMENT');
    });

    it('should return LOCATION for location-level assignment', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.LOCATION_MANAGER,
        context: locationContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.getAssignmentScope()).toBe('LOCATION');
    });

    it('should return BUSINESS for business-level assignment', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_OWNER,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.getAssignmentScope()).toBe('BUSINESS');
    });
  });

  describe('hasPermission', () => {
    it('should return true for valid permission of active assignment', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_OWNER,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.hasPermission(Permission.MANAGE_ALL_STAFF)).toBe(true);
    });

    it('should return false for permission not assigned to role', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.REGULAR_CLIENT,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(assignment.hasPermission(Permission.MANAGE_BUSINESS)).toBe(false);
    });

    it('should return false for expired assignment', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_OWNER,
        context: businessContext,
        assignedBy: mockAssignedBy,
        expiresAt: pastDate,
      });

      expect(assignment.hasPermission(Permission.MANAGE_BUSINESS)).toBe(false);
    });
  });

  describe('canActOnRole', () => {
    it('should allow higher hierarchy role to act on lower role', () => {
      const businessOwner = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_OWNER,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      expect(businessOwner.canActOnRole(UserRole.LOCATION_MANAGER)).toBe(true);
      expect(businessOwner.canActOnRole(UserRole.DEPARTMENT_HEAD)).toBe(true);
      expect(businessOwner.canActOnRole(UserRole.PRACTITIONER)).toBe(true);
    });

    it('should not allow lower hierarchy role to act on higher role', () => {
      const practitioner = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.PRACTITIONER,
        context: departmentContext,
        assignedBy: mockAssignedBy,
      });

      expect(practitioner.canActOnRole(UserRole.DEPARTMENT_HEAD)).toBe(false);
      expect(practitioner.canActOnRole(UserRole.LOCATION_MANAGER)).toBe(false);
      expect(practitioner.canActOnRole(UserRole.BUSINESS_OWNER)).toBe(false);
    });

    it('should not allow inactive assignment to act on any role', () => {
      const assignment = RoleAssignment.create({
        userId: mockUserId,
        role: UserRole.BUSINESS_OWNER,
        context: businessContext,
        assignedBy: mockAssignedBy,
      });

      assignment.deactivate();
      expect(assignment.canActOnRole(UserRole.PRACTITIONER)).toBe(false);
    });
  });
});
