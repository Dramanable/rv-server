/**
 * 🧪 TDD - Test pour passwordChangeRequired dans User Entity
 */

import { UserRole } from '@shared/enums/user-role.enum';
import { Email } from '@domain/value-objects/email.vo';
import { User } from '@domain/entities/user.entity';

describe('User Entity - Password Change Required', () => {
  describe('Password Change Requirement', () => {
    it('should create user with passwordChangeRequired false by default', () => {
      // Arrange
      const email = new Email('test@example.com');
      const name = 'John Doe';
      const role = UserRole.REGULAR_CLIENT;

      // Act
      const user = new User(email, name, role);

      // Assert
      expect(user.passwordChangeRequired).toBe(false);
    });

    it('should create user with passwordChangeRequired true when specified', () => {
      // Arrange
      const email = new Email('test@example.com');
      const name = 'John Doe';
      const role = UserRole.REGULAR_CLIENT;

      // Act
      const user = new User(email, name, role, {
        passwordChangeRequired: true,
      });

      // Assert
      expect(user.passwordChangeRequired).toBe(true);
    });

    it('should create user with passwordChangeRequired false when explicitly specified', () => {
      // Arrange
      const email = new Email('test@example.com');
      const name = 'John Doe';
      const role = UserRole.REGULAR_CLIENT;

      // Act
      const user = new User(email, name, role, {
        passwordChangeRequired: false,
      });

      // Assert
      expect(user.passwordChangeRequired).toBe(false);
    });
  });

  describe('Business Rules for Password Change', () => {
    it('should require password change for new temporary users', () => {
      // Arrange
      const email = new Email('temp@example.com');
      const name = 'Temp User';
      const role = UserRole.REGULAR_CLIENT;

      // Act
      const user = User.createTemporary(email, name, role);

      // Assert
      expect(user.passwordChangeRequired).toBe(true);
    });

    it('should allow forcing password change requirement', () => {
      // Arrange
      const email = new Email('test@example.com');
      const name = 'John Doe';
      const role = UserRole.REGULAR_CLIENT;
      const user = new User(email, name, role);

      // Act
      const updatedUser = user.requirePasswordChange();

      // Assert
      expect(updatedUser.passwordChangeRequired).toBe(true);
      expect(user.passwordChangeRequired).toBe(false); // Original unchanged
    });

    it('should allow clearing password change requirement', () => {
      // Arrange
      const email = new Email('test@example.com');
      const name = 'John Doe';
      const role = UserRole.REGULAR_CLIENT;
      const user = new User(email, name, role, {
        passwordChangeRequired: true,
      });

      // Act
      const updatedUser = user.clearPasswordChangeRequirement();

      // Assert
      expect(updatedUser.passwordChangeRequired).toBe(false);
      expect(user.passwordChangeRequired).toBe(true); // Original unchanged
    });
  });
});
