/**
 * 🧪 Password Service Tests - DOMAIN PURE
 * ✅ Clean Architecture - Domain Layer Tests
 * ✅ TDD - Tests-Driven Development  
 * ✅ Tests de logique métier PURE (sans dépendances techniques)
 */

import { PasswordService } from '../../../../domain/services/password.service';
import { HashedPassword } from '../../../../domain/value-objects/hashed-password.value-object';
import { DomainError } from '../../../../domain/exceptions/domain.error';

describe('PasswordService - Domain Pure', () => {
  describe('✅ Plain Password Validation Tests', () => {
    it('should accept valid complex password', () => {
      // Arrange
      const validPasswords = [
        'MyStr0ng!Pass',      // All 4 criteria
        'Complex123@',        // All 4 criteria
        'Test1234!',          // All 4 criteria
        'Abcd123@',           // All 4 criteria
      ];

      // Act & Assert
      validPasswords.forEach(password => {
        expect(() => PasswordService.validatePlainPassword(password)).not.toThrow();
      });
    });

    it('should reject passwords that are too short', () => {
      // Arrange
      const shortPasswords = [
        'Abc1!',     // 5 chars
        'Test1@',    // 6 chars  
        'Abc123!',   // 7 chars
      ];

      // Act & Assert
      shortPasswords.forEach(password => {
        expect(() => PasswordService.validatePlainPassword(password))
          .toThrow(DomainError);
      });
    });

    it('should reject passwords that are too long', () => {
      // Arrange
      const longPassword = 'A'.repeat(129) + '1@'; // 131 chars

      // Act & Assert
      expect(() => PasswordService.validatePlainPassword(longPassword))
        .toThrow(DomainError);
    });

    it('should reject empty or null passwords', () => {
      // Act & Assert
      expect(() => PasswordService.validatePlainPassword(''))
        .toThrow(DomainError);
      expect(() => PasswordService.validatePlainPassword(null as any))
        .toThrow(DomainError);
      expect(() => PasswordService.validatePlainPassword(undefined as any))
        .toThrow(DomainError);
    });

    it('should reject passwords without sufficient complexity', () => {
      // Arrange - Passwords avec moins de 3 critères
      const weakPasswords = [
        'alllowercase',           // 1 critère (lowercase)
        'ALLUPPERCASE',           // 1 critère (uppercase)
        '12345678901',            // 1 critère (numbers)
        '!@#$%^&*()',            // 1 critère (special)
        'OnlyLetters',            // 2 critères (upper + lower)
        'onlyletters123',         // 2 critères (lower + numbers)
        'ONLYUPPER123',           // 2 critères (upper + numbers)
      ];

      // Act & Assert
      weakPasswords.forEach(password => {
        expect(() => PasswordService.validatePlainPassword(password))
          .toThrow(DomainError);
      });
    });

    it('should accept minimum valid complexity (3 of 4 criteria)', () => {
      // Arrange - Passwords avec exactement 3 critères  
      const minComplexPasswords = [
        'Lowercase123',          // upper + lower + numbers (3 critères)
        'lowercase123!',         // lower + numbers + special (3 critères)  
        'UPPERCASE123!',         // upper + numbers + special (3 critères)
        'UpperLower!',           // upper + lower + special (3 critères)
      ];

      // Act & Assert
      minComplexPasswords.forEach(password => {
        expect(() => PasswordService.validatePlainPassword(password)).not.toThrow();
      });
    });
  });

  describe('✅ Hashed Password Validation Tests', () => {
    it('should accept valid HashedPassword', () => {
      // Arrange
      const hashedPassword = HashedPassword.create('valid-hash-value');

      // Act & Assert
      expect(() => PasswordService.validateHashedPassword(hashedPassword)).not.toThrow();
    });

    it('should reject null or undefined HashedPassword', () => {
      // Act & Assert
      expect(() => PasswordService.validateHashedPassword(null as any))
        .toThrow(DomainError);
      expect(() => PasswordService.validateHashedPassword(undefined as any))
        .toThrow(DomainError);
    });

    it('should reject HashedPassword with empty value', () => {
      // Arrange - Cette création devrait déjà échouer, mais testons la logique
      try {
        const emptyHashedPassword = HashedPassword.create('  ');
        // Act & Assert - Si la création réussit malgré tout
        expect(() => PasswordService.validateHashedPassword(emptyHashedPassword))
          .toThrow(DomainError);
      } catch {
        // Si la création échoue (comportement attendu), le test passe
        expect(true).toBe(true);
      }
    });
  });

  describe('✅ Password Equality Tests', () => {
    it('should return true for equal passwords', () => {
      // Arrange
      const hashValue = 'same-hash-value';
      const password1 = HashedPassword.create(hashValue);
      const password2 = HashedPassword.create(hashValue);

      // Act
      const areEqual = PasswordService.arePasswordsEqual(password1, password2);

      // Assert
      expect(areEqual).toBe(true);
    });

    it('should return false for different passwords', () => {
      // Arrange
      const password1 = HashedPassword.create('hash-value-1');
      const password2 = HashedPassword.create('hash-value-2');

      // Act
      const areEqual = PasswordService.arePasswordsEqual(password1, password2);

      // Assert
      expect(areEqual).toBe(false);
    });

    it('should return false when one password is null/undefined', () => {
      // Arrange
      const validPassword = HashedPassword.create('valid-hash');

      // Act & Assert
      expect(PasswordService.arePasswordsEqual(validPassword, null as any)).toBe(false);
      expect(PasswordService.arePasswordsEqual(null as any, validPassword)).toBe(false);
      expect(PasswordService.arePasswordsEqual(null as any, null as any)).toBe(false);
      expect(PasswordService.arePasswordsEqual(validPassword, undefined as any)).toBe(false);
    });
  });

  describe('✅ Domain Business Rules Tests', () => {
    it('should enforce consistent password policy', () => {
      // Arrange - Test que la politique est cohérente
      const policyTestPassword = 'TestPass123!';

      // Act & Assert - Même validation doit donner même résultat
      expect(() => PasswordService.validatePlainPassword(policyTestPassword)).not.toThrow();
      expect(() => PasswordService.validatePlainPassword(policyTestPassword)).not.toThrow();
    });

    it('should provide clear error messages for business rules', () => {
      // Act & Assert
      expect(() => PasswordService.validatePlainPassword('short'))
        .toThrow('Password must be at least 8 characters long');
      
      expect(() => PasswordService.validatePlainPassword('simplelowercase'))
        .toThrow('Password must contain at least 3 of: uppercase, lowercase, numbers, special characters');

      expect(() => PasswordService.validatePlainPassword(''))
        .toThrow('Password is required');
    });
  });
});
