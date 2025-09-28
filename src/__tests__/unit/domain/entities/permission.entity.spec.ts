import { Permission } from '@domain/entities/permission.entity';

describe('Permission Entity', () => {
  describe('Creation', () => {
    it('should create a permission with valid data', () => {
      // Given
      const permissionData = {
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de créer, modifier et supprimer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      };

      // When
      const permission = Permission.create(permissionData);

      // Then
      expect(permission.getId()).toBe(permissionData.id);
      expect(permission.getName()).toBe(permissionData.name);
      expect(permission.getDisplayName()).toBe(permissionData.displayName);
      expect(permission.getDescription()).toBe(permissionData.description);
      expect(permission.getCategory()).toBe(permissionData.category);
      expect(permission.isSystemPermission()).toBe(false);
      expect(permission.isActive()).toBe(true); // Default active
    });

    it('should create a system permission', () => {
      // Given
      const systemPermissionData = {
        id: 'sys-permission-123',
        name: 'SYSTEM_ADMIN',
        displayName: 'Administration Système',
        description: 'Accès complet au système',
        category: 'SYSTEM',
        isSystemPermission: true,
      };

      // When
      const permission = Permission.create(systemPermissionData);

      // Then
      expect(permission.isSystemPermission()).toBe(true);
      expect(permission.canBeDeleted()).toBe(false); // System permissions cannot be deleted
    });
  });

  describe('Validation Rules', () => {
    it('should throw error if name is empty', () => {
      // Given
      const invalidData = {
        id: 'permission-123',
        name: '',
        displayName: 'Test Permission',
        description: 'Test description',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      };

      // When & Then
      expect(() => Permission.create(invalidData)).toThrow(
        'Permission name must be between 2 and 100 characters',
      );
    });

    it('should throw error if name is too long', () => {
      // Given
      const invalidData = {
        id: 'permission-123',
        name: 'A'.repeat(101), // Too long
        displayName: 'Test Permission',
        description: 'Test description',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      };

      // When & Then
      expect(() => Permission.create(invalidData)).toThrow(
        'Permission name must be between 2 and 100 characters',
      );
    });

    it('should throw error if displayName is empty', () => {
      // Given
      const invalidData = {
        id: 'permission-123',
        name: 'VALID_NAME',
        displayName: '',
        description: 'Test description',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      };

      // When & Then
      expect(() => Permission.create(invalidData)).toThrow(
        'Permission display name must be between 2 and 200 characters',
      );
    });
  });

  describe('Business Logic', () => {
    it('should allow activation and deactivation for non-system permissions', () => {
      // Given
      const permission = Permission.create({
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de gérer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      });

      // When
      permission.deactivate();

      // Then
      expect(permission.isActive()).toBe(false);

      // When
      permission.activate();

      // Then
      expect(permission.isActive()).toBe(true);
    });

    it('should not allow deactivation of system permissions', () => {
      // Given
      const systemPermission = Permission.create({
        id: 'sys-permission-123',
        name: 'SYSTEM_ADMIN',
        displayName: 'Administration Système',
        description: 'Accès complet système',
        category: 'SYSTEM',
        isSystemPermission: true,
      });

      // When & Then
      expect(() => systemPermission.deactivate()).toThrow(
        'System permissions cannot be deactivated',
      );
    });

    it('should check if permission belongs to category', () => {
      // Given
      const permission = Permission.create({
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de gérer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      });

      // When & Then
      expect(permission.belongsToCategory('APPOINTMENTS')).toBe(true);
      expect(permission.belongsToCategory('STAFF')).toBe(false);
    });
  });

  describe('Update Functionality', () => {
    it('should update permission properties', () => {
      // Given
      const permission = Permission.create({
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de gérer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      });

      const updateData = {
        displayName: 'Gestion Complète des Rendez-vous',
        description:
          'Permet de créer, modifier, annuler et consulter tous les rendez-vous',
      };

      // When
      permission.update(updateData);

      // Then
      expect(permission.getDisplayName()).toBe(updateData.displayName);
      expect(permission.getDescription()).toBe(updateData.description);
      expect(permission.getName()).toBe('MANAGE_APPOINTMENTS'); // Name cannot be updated
    });

    it('should not update system permission critical properties', () => {
      // Given
      const systemPermission = Permission.create({
        id: 'sys-permission-123',
        name: 'SYSTEM_ADMIN',
        displayName: 'Administration Système',
        description: 'Accès complet système',
        category: 'SYSTEM',
        isSystemPermission: true,
      });

      // When & Then
      expect(() =>
        systemPermission.update({
          displayName: 'Updated Name',
          description: 'Updated description',
        }),
      ).toThrow('System permissions cannot be modified');
    });
  });

  describe('JSON Serialization', () => {
    it('should serialize to JSON correctly', () => {
      // Given
      const permission = Permission.create({
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de gérer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
      });

      // When
      const json = permission.toJSON();

      // Then
      expect(json).toMatchObject({
        id: 'permission-123',
        name: 'MANAGE_APPOINTMENTS',
        displayName: 'Gérer les rendez-vous',
        description: 'Permet de gérer les rendez-vous',
        category: 'APPOINTMENTS',
        isSystemPermission: false,
        isActive: true,
        canBeDeleted: true,
        createdAt: permission.getCreatedAt().toISOString(),
        updatedAt: permission.getUpdatedAt().toISOString(),
      });
    });
  });
});
