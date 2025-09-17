/**
 * 🧪 TDD - Email Value Object
 *
 * CYCLE RED → GREEN → REFACTOR
 * Test 1 : Email valide doit être accepté
 */

import { Email } from '../../../../domain/value-objects/email.vo';

describe('Email Value Object', () => {
  describe('Valid Email Creation', () => {
    it('should create email with valid format', () => {
      // Arrange
      const validEmail = 'user@example.com';

      // Act
      const email = new Email(validEmail);

      // Assert
      expect(email.value).toBe('user@example.com');
      expect(email.toString()).toBe('user@example.com');
    });

    it('should normalize email (lowercase and trim)', () => {
      // Arrange
      const unnormalizedEmail = '  USER@EXAMPLE.COM  ';

      // Act
      const email = new Email(unnormalizedEmail);

      // Assert
      expect(email.value).toBe('user@example.com');
    });
  });

  describe('Invalid Email Rejection', () => {
    it('should reject email without @', () => {
      // Arrange & Act & Assert
      expect(() => new Email('invalid-email')).toThrow('Invalid email format');
    });

    it('should reject empty email', () => {
      expect(() => new Email('')).toThrow('Email cannot be empty');
    });

    it('should reject email too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(() => new Email(longEmail)).toThrow('Email too long');
    });

    it('should reject email without domain', () => {
      expect(() => new Email('user@')).toThrow('Invalid email format');
    });
  });

  describe('Email Equality', () => {
    it('should be equal when values are same', () => {
      // Arrange
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');

      // Act & Assert
      expect(email1.equals(email2)).toBe(true);
    });

    it('should not be equal when values differ', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });
});
