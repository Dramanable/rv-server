/**
 * 🧪 TESTS - RoleUtils avec Nouveau Système de Permissions
 */

import {
  UserRole,
  Permission,
  BusinessType,
  RoleUtils,
  ROLE_HIERARCHY,
} from '../../shared/enums/user-role.enum';

describe('RoleUtils - Advanced Permission System', () => {
  describe('Permission Checks', () => {
    it('should correctly identify platform admin permissions', () => {
      expect(
        RoleUtils.hasPermission(
          UserRole.PLATFORM_ADMIN,
          Permission.MANAGE_SYSTEM_SETTINGS,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.PLATFORM_ADMIN,
          Permission.CONFIGURE_BUSINESS_SETTINGS,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.PLATFORM_ADMIN,
          Permission.BOOK_APPOINTMENT,
        ),
      ).toBe(true);
    });

    it('should correctly identify business owner permissions', () => {
      expect(
        RoleUtils.hasPermission(
          UserRole.BUSINESS_OWNER,
          Permission.CONFIGURE_BUSINESS_SETTINGS,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.BUSINESS_OWNER,
          Permission.MANAGE_ALL_STAFF,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.BUSINESS_OWNER,
          Permission.MANAGE_SYSTEM_SETTINGS,
        ),
      ).toBe(false);
    });

    it('should correctly identify practitioner permissions', () => {
      expect(
        RoleUtils.hasPermission(
          UserRole.PRACTITIONER,
          Permission.MANAGE_OWN_SCHEDULE,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.PRACTITIONER,
          Permission.VIEW_CLIENT_HISTORY,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.PRACTITIONER,
          Permission.MANAGE_ALL_STAFF,
        ),
      ).toBe(false);
    });

    it('should correctly identify client permissions', () => {
      expect(
        RoleUtils.hasPermission(
          UserRole.REGULAR_CLIENT,
          Permission.BOOK_APPOINTMENT,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.REGULAR_CLIENT,
          Permission.VIEW_OWN_APPOINTMENTS,
        ),
      ).toBe(true);
      expect(
        RoleUtils.hasPermission(
          UserRole.REGULAR_CLIENT,
          Permission.MANAGE_OWN_SCHEDULE,
        ),
      ).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should correctly order role hierarchy', () => {
      expect(RoleUtils.getRoleLevel(UserRole.PLATFORM_ADMIN)).toBeGreaterThan(
        RoleUtils.getRoleLevel(UserRole.BUSINESS_OWNER),
      );
      expect(RoleUtils.getRoleLevel(UserRole.BUSINESS_OWNER)).toBeGreaterThan(
        RoleUtils.getRoleLevel(UserRole.PRACTITIONER),
      );
      expect(RoleUtils.getRoleLevel(UserRole.PRACTITIONER)).toBeGreaterThan(
        RoleUtils.getRoleLevel(UserRole.REGULAR_CLIENT),
      );
    });

    it('should allow higher roles to act on lower roles', () => {
      expect(
        RoleUtils.canActOnRole(UserRole.BUSINESS_OWNER, UserRole.PRACTITIONER),
      ).toBe(true);
      expect(
        RoleUtils.canActOnRole(UserRole.PRACTITIONER, UserRole.BUSINESS_OWNER),
      ).toBe(false);
      expect(
        RoleUtils.canActOnRole(UserRole.PRACTITIONER, UserRole.REGULAR_CLIENT),
      ).toBe(true);
    });
  });

  describe('Role Groups', () => {
    it('should correctly identify management roles', () => {
      expect(RoleUtils.isManagementRole(UserRole.PLATFORM_ADMIN)).toBe(true);
      expect(RoleUtils.isManagementRole(UserRole.BUSINESS_OWNER)).toBe(true);
      expect(RoleUtils.isManagementRole(UserRole.LOCATION_MANAGER)).toBe(true);
      expect(RoleUtils.isManagementRole(UserRole.PRACTITIONER)).toBe(false);
    });

    it('should correctly identify practitioner roles', () => {
      expect(RoleUtils.isPractitionerRole(UserRole.SENIOR_PRACTITIONER)).toBe(
        true,
      );
      expect(RoleUtils.isPractitionerRole(UserRole.PRACTITIONER)).toBe(true);
      expect(RoleUtils.isPractitionerRole(UserRole.JUNIOR_PRACTITIONER)).toBe(
        true,
      );
      expect(RoleUtils.isPractitionerRole(UserRole.BUSINESS_OWNER)).toBe(false);
    });

    it('should correctly identify client roles', () => {
      expect(RoleUtils.isClientRole(UserRole.REGULAR_CLIENT)).toBe(true);
      expect(RoleUtils.isClientRole(UserRole.VIP_CLIENT)).toBe(true);
      expect(RoleUtils.isClientRole(UserRole.CORPORATE_CLIENT)).toBe(true);
      expect(RoleUtils.isClientRole(UserRole.PRACTITIONER)).toBe(false);
    });

    it('should correctly identify support staff roles', () => {
      expect(RoleUtils.isSupportRole(UserRole.RECEPTIONIST)).toBe(true);
      expect(RoleUtils.isSupportRole(UserRole.ASSISTANT)).toBe(true);
      expect(RoleUtils.isSupportRole(UserRole.SCHEDULER)).toBe(true);
      expect(RoleUtils.isSupportRole(UserRole.PRACTITIONER)).toBe(false);
    });
  });

  describe('Business Type Permissions', () => {
    it('should provide correct permissions for medical clinic', () => {
      const medicalPermissions = RoleUtils.getBusinessTypePermissions(
        BusinessType.MEDICAL_CLINIC,
      );

      expect(medicalPermissions).toContain(Permission.VIEW_CLIENT_HISTORY);
      expect(medicalPermissions).toContain(Permission.MANAGE_CLIENT_NOTES);
      expect(medicalPermissions).toContain(Permission.CONFIRM_APPOINTMENTS);
    });

    it('should provide correct permissions for law firm', () => {
      const lawPermissions = RoleUtils.getBusinessTypePermissions(
        BusinessType.LAW_FIRM,
      );

      expect(lawPermissions).toContain(Permission.MANAGE_CLIENT_NOTES);
      expect(lawPermissions).toContain(Permission.VIEW_CLIENT_HISTORY);
      expect(lawPermissions).toContain(Permission.BOOK_FOR_OTHERS);
    });

    it('should combine role and business type permissions', () => {
      const effectivePermissions = RoleUtils.getEffectivePermissions(
        UserRole.PRACTITIONER,
        BusinessType.MEDICAL_CLINIC,
      );

      // Should have practitioner permissions
      expect(effectivePermissions).toContain(Permission.MANAGE_OWN_SCHEDULE);
      expect(effectivePermissions).toContain(Permission.VIEW_OWN_APPOINTMENTS);

      // Should have medical clinic specific permissions
      expect(effectivePermissions).toContain(Permission.VIEW_CLIENT_HISTORY);
      expect(effectivePermissions).toContain(Permission.CONFIRM_APPOINTMENTS);
    });
  });

  describe('Role Assignment', () => {
    it('should return assignable roles for business owner', () => {
      const assignableRoles = RoleUtils.getAssignableRoles(
        UserRole.BUSINESS_OWNER,
      );

      expect(assignableRoles).toContain(UserRole.PRACTITIONER);
      expect(assignableRoles).toContain(UserRole.RECEPTIONIST);
      expect(assignableRoles).toContain(UserRole.REGULAR_CLIENT);
      expect(assignableRoles).not.toContain(UserRole.PLATFORM_ADMIN);
      expect(assignableRoles).not.toContain(UserRole.BUSINESS_OWNER);
    });

    it('should return limited assignable roles for practitioner', () => {
      const assignableRoles = RoleUtils.getAssignableRoles(
        UserRole.PRACTITIONER,
      );

      expect(assignableRoles).toContain(UserRole.JUNIOR_PRACTITIONER);
      expect(assignableRoles).toContain(UserRole.REGULAR_CLIENT);
      expect(assignableRoles).not.toContain(UserRole.BUSINESS_OWNER);
      expect(assignableRoles).not.toContain(UserRole.PRACTITIONER);
    });

    it('should return limited assignable roles for clients', () => {
      const assignableRoles = RoleUtils.getAssignableRoles(
        UserRole.REGULAR_CLIENT,
      );

      // Regular clients can invite guest clients
      expect(assignableRoles).toContain(UserRole.GUEST_CLIENT);
      expect(assignableRoles).not.toContain(UserRole.PRACTITIONER);
      expect(assignableRoles).not.toContain(UserRole.VIP_CLIENT);
    });
  });

  describe('Role Descriptions', () => {
    it('should provide meaningful descriptions for all roles', () => {
      const platformAdminDesc = RoleUtils.getRoleDescription(
        UserRole.PLATFORM_ADMIN,
      );
      expect(platformAdminDesc).toContain('Plateforme');
      expect(platformAdminDesc).toContain('multi-tenant');

      const practitionerDesc = RoleUtils.getRoleDescription(
        UserRole.PRACTITIONER,
      );
      expect(practitionerDesc).toContain('Praticien');
      expect(practitionerDesc).toContain('certifié');

      const clientDesc = RoleUtils.getRoleDescription(UserRole.REGULAR_CLIENT);
      expect(clientDesc).toContain('Client');
      expect(clientDesc).toContain('standard');
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid roles gracefully', () => {
      expect(
        RoleUtils.hasPermission(
          'INVALID_ROLE' as UserRole,
          Permission.BOOK_APPOINTMENT,
        ),
      ).toBe(false);
      expect(RoleUtils.getRoleLevel('INVALID_ROLE' as UserRole)).toBe(0);
      expect(RoleUtils.getRoleDescription('INVALID_ROLE' as UserRole)).toBe(
        'Rôle non défini',
      );
    });

    it('should handle empty permission arrays', () => {
      const emptyPermissions = RoleUtils.getRolePermissions(
        'INVALID_ROLE' as UserRole,
      );
      expect(emptyPermissions).toEqual([]);
    });
  });
});
