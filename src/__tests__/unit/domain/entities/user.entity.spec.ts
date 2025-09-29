/**
 * 🧪 TDD - User Entity avec Rôles
 *
 * Tests pour l'entité User avec Email VO et système de rôles
 */
import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { Permission, UserRole } from '@shared/enums/user-role.enum';

describe('User Entity with Roles', () => {
  let validEmail: Email;

  beforeEach(() => {
    validEmail = new Email('test@example.com');
  });

  describe('User Creation', () => {
    it('should create user with email, name and role', () => {
      // Arrange & Act
      const user = new User(validEmail, 'John Doe', UserRole.REGULAR_CLIENT);

      // Assert
      expect(user.email).toBe(validEmail);
      expect(user.name).toBe('John Doe');
      expect(user.role).toBe(UserRole.REGULAR_CLIENT);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create platform admin user', () => {
      const user = new User(
        validEmail,
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      expect(user.role).toBe(UserRole.PLATFORM_ADMIN);
      expect(user.isPlatformAdmin()).toBe(true);
    });

    it('should create business owner user', () => {
      const user = new User(
        validEmail,
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      expect(user.role).toBe(UserRole.BUSINESS_OWNER);
      expect(user.isBusinessOwner()).toBe(true);
      expect(user.isManager()).toBe(true);
    });

    it('should create practitioner user', () => {
      const user = new User(validEmail, 'Doctor', UserRole.PRACTITIONER);

      expect(user.role).toBe(UserRole.PRACTITIONER);
      expect(user.isPractitioner()).toBe(true);
    });

    it('should create client user', () => {
      const user = new User(validEmail, 'Client', UserRole.REGULAR_CLIENT);

      expect(user.role).toBe(UserRole.REGULAR_CLIENT);
      expect(user.isClient()).toBe(true);
    });
  });

  describe('Permissions System', () => {
    it('should allow platform admin to have all permissions', () => {
      // Arrange
      const platformAdmin = new User(
        validEmail,
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );

      // Act & Assert - Teste quelques permissions clés
      expect(
        platformAdmin.hasPermission(Permission.CONFIGURE_BUSINESS_SETTINGS),
      ).toBe(true);
      expect(platformAdmin.hasPermission(Permission.MANAGE_ALL_STAFF)).toBe(
        true,
      );
      expect(
        platformAdmin.hasPermission(Permission.MANAGE_BILLING_SETTINGS),
      ).toBe(true);
      expect(
        platformAdmin.hasPermission(Permission.VIEW_BUSINESS_ANALYTICS),
      ).toBe(true);
    });

    it('should allow business owner to manage business but not platform', () => {
      const businessOwner = new User(
        validEmail,
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );

      // Peut gérer l'entreprise
      expect(
        businessOwner.hasPermission(Permission.CONFIGURE_BUSINESS_SETTINGS),
      ).toBe(true);
      expect(businessOwner.hasPermission(Permission.MANAGE_ALL_STAFF)).toBe(
        true,
      );
      expect(
        businessOwner.hasPermission(Permission.VIEW_FINANCIAL_REPORTS),
      ).toBe(true);
      expect(
        businessOwner.hasPermission(Permission.MANAGE_SERVICE_CATALOG),
      ).toBe(true);

      // Ne peut pas gérer la plateforme
      expect(
        businessOwner.hasPermission(Permission.MANAGE_SYSTEM_SETTINGS),
      ).toBe(false);
    });

    it('should allow practitioner to manage own schedule and view assigned clients', () => {
      const practitioner = new User(
        validEmail,
        'Doctor',
        UserRole.PRACTITIONER,
      );

      // Permissions praticien
      expect(practitioner.hasPermission(Permission.MANAGE_OWN_SCHEDULE)).toBe(
        true,
      );
      expect(practitioner.hasPermission(Permission.UPDATE_OWN_PROFILE)).toBe(
        true,
      );
      expect(practitioner.hasPermission(Permission.VIEW_OWN_APPOINTMENTS)).toBe(
        true,
      );
      expect(practitioner.hasPermission(Permission.SET_OWN_AVAILABILITY)).toBe(
        true,
      );

      // Ne peut pas faire de gestion avancée
      expect(practitioner.hasPermission(Permission.MANAGE_ALL_STAFF)).toBe(
        false,
      );
      expect(
        practitioner.hasPermission(Permission.MANAGE_SYSTEM_SETTINGS),
      ).toBe(false);
    });

    it('should allow client basic booking permissions only', () => {
      const client = new User(
        validEmail,
        'Regular Client',
        UserRole.REGULAR_CLIENT,
      );

      // Permissions client
      expect(client.hasPermission(Permission.BOOK_APPOINTMENT)).toBe(true);
      expect(client.hasPermission(Permission.CANCEL_OWN_APPOINTMENTS)).toBe(
        true,
      );
      expect(client.hasPermission(Permission.RESCHEDULE_OWN_APPOINTMENTS)).toBe(
        true,
      );

      // Ne peut pas faire d'actions staff/admin
      expect(client.hasPermission(Permission.MANAGE_ALL_STAFF)).toBe(false);
      expect(client.hasPermission(Permission.HIRE_STAFF)).toBe(false);
      expect(client.hasPermission(Permission.MANAGE_SYSTEM_SETTINGS)).toBe(
        false,
      );
    });
  });

  describe('Business Rules - User Actions', () => {
    it('should allow platform admin to act on any user', () => {
      const platformAdmin = new User(
        validEmail,
        'Platform Admin',
        UserRole.PLATFORM_ADMIN,
      );
      const businessOwner = new User(
        new Email('owner@example.com'),
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );
      const client = new User(
        new Email('client@example.com'),
        'Client',
        UserRole.REGULAR_CLIENT,
      );

      expect(platformAdmin.canActOnUser(businessOwner)).toBe(true);
      expect(platformAdmin.canActOnUser(client)).toBe(true);
      expect(platformAdmin.canActOnUser(platformAdmin)).toBe(true);
    });

    it('should allow business owner to act on lower hierarchy users only', () => {
      const businessOwner = new User(
        validEmail,
        'Business Owner',
        UserRole.BUSINESS_OWNER,
      );
      const practitioner = new User(
        new Email('doctor@example.com'),
        'Doctor',
        UserRole.PRACTITIONER,
      );
      const anotherOwner = new User(
        new Email('owner2@example.com'),
        'Another Owner',
        UserRole.BUSINESS_OWNER,
      );
      const client = new User(
        new Email('client@example.com'),
        'Client',
        UserRole.REGULAR_CLIENT,
      );

      expect(businessOwner.canActOnUser(practitioner)).toBe(true);
      expect(businessOwner.canActOnUser(client)).toBe(true);
      expect(businessOwner.canActOnUser(anotherOwner)).toBe(false); // Même niveau = pas d'action sauf sur soi-même
      expect(businessOwner.canActOnUser(businessOwner)).toBe(true); // Peut agir sur lui-même
    });

    it('should allow clients to act only on themselves', () => {
      const client = new User(validEmail, 'Client', UserRole.REGULAR_CLIENT);
      const anotherClient = new User(
        new Email('other@example.com'),
        'Other Client',
        UserRole.REGULAR_CLIENT,
      );
      const practitioner = new User(
        new Email('doctor@example.com'),
        'Doctor',
        UserRole.PRACTITIONER,
      );

      expect(client.canActOnUser(client)).toBe(true);
      expect(client.canActOnUser(anotherClient)).toBe(false);
      expect(client.canActOnUser(practitioner)).toBe(false);
    });
  });

  describe('Role Validation', () => {
    it('should reject invalid name', () => {
      expect(() => new User(validEmail, '', UserRole.REGULAR_CLIENT)).toThrow(
        'USER_NAME_VALIDATION_ERROR',
      );
    });

    it('should normalize name', () => {
      const user = new User(
        validEmail,
        '  John Doe  ',
        UserRole.REGULAR_CLIENT,
      );
      expect(user.name).toBe('John Doe');
    });
  });

  describe('User Comparison', () => {
    it('should be equal when same email', () => {
      const user1 = new User(validEmail, 'John', UserRole.REGULAR_CLIENT);
      const user2 = new User(validEmail, 'Jane', UserRole.BUSINESS_OWNER);

      expect(user1.hasSameEmail(user2)).toBe(true);
    });

    it('should not be equal when different email', () => {
      const email2 = new Email('other@example.com');
      const user1 = new User(validEmail, 'John', UserRole.REGULAR_CLIENT);
      const user2 = new User(email2, 'Jane', UserRole.REGULAR_CLIENT);

      expect(user1.hasSameEmail(user2)).toBe(false);
    });
  });

  // 🔧 Clean up after each test to prevent memory leaks
  afterEach(() => {
    jest.clearAllMocks();
  });
});
