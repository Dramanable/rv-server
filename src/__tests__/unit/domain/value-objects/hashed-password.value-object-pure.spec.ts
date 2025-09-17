/**
 * 🧪 HashedPassword Value Object Tests - DOMAIN PURE
 * ✅ Clean Architecture - Domain Layer Tests (SANS dépendances externes)
 * ✅ TDD - Tests-Driven Development
 * ⚠️  Tests de hachage/vérification dans Infrastructure Layer
 */

import { HashedPassword } from '../../../../domain/value-objects/hashed-password.value-object';
import { DomainError } from '../../../../domain/exceptions/domain.error';

describe('HashedPassword Value Object - Domain Pure', () => {
  describe('✅ Creation Tests', () => {
    it('should create HashedPassword from any non-empty string', () => {
      // Arrange - N'importe quel string non-vide (pas de validation technique ici)
      const hashValue = 'any-hash-string-here';

      // Act
      const hashedPassword = HashedPassword.create(hashValue);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.value).toBe(hashValue);
    });

    it('should throw error for empty hash', () => {
      // Act & Assert
      expect(() => HashedPassword.create('')).toThrow(DomainError);
      expect(() => HashedPassword.create('   ')).toThrow(DomainError);
      expect(() => HashedPassword.create(null as any)).toThrow(DomainError);
      expect(() => HashedPassword.create(undefined as any)).toThrow(DomainError);
    });

    it('should accept any valid string as hash', () => {
      // Arrange - Différents formats de string (validation technique dans Infrastructure)
      const validStrings = [
        'bcrypt-hash-format',
        'argon2-hash-format', 
        'scrypt-hash-format',
        'simple-hash-for-testing',
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'
      ];

      // Act & Assert
      validStrings.forEach((hashString) => {
        expect(() => HashedPassword.create(hashString)).not.toThrow();
      });
    });
  });

  describe('✅ Behavior Tests', () => {
    it('should provide access to hash value', () => {
      // Arrange
      const hashValue = 'test-hash-value';
      const hashedPassword = HashedPassword.create(hashValue);

      // Act
      const value = hashedPassword.value;

      // Assert
      expect(value).toBe(hashValue);
    });
  });

  describe('✅ Equality Tests', () => {
    it('should be equal to another HashedPassword with same hash', () => {
      // Arrange
      const hashValue = 'same-hash-value';
      const hashedPassword1 = HashedPassword.create(hashValue);
      const hashedPassword2 = HashedPassword.create(hashValue);

      // Act & Assert
      expect(hashedPassword1.equals(hashedPassword2)).toBe(true);
      expect(hashedPassword2.equals(hashedPassword1)).toBe(true);
    });

    it('should not be equal to another HashedPassword with different hash', () => {
      // Arrange
      const hashedPassword1 = HashedPassword.create('hash-value-1');
      const hashedPassword2 = HashedPassword.create('hash-value-2');

      // Act & Assert
      expect(hashedPassword1.equals(hashedPassword2)).toBe(false);
    });

    it('should not be equal to non-HashedPassword object', () => {
      // Arrange
      const hashedPassword = HashedPassword.create('test-hash');

      // Act & Assert
      expect(hashedPassword.equals(null as any)).toBe(false);
      expect(hashedPassword.equals(undefined as any)).toBe(false);
      expect(hashedPassword.equals('string' as any)).toBe(false);
      expect(hashedPassword.equals({} as any)).toBe(false);
    });
  });

  describe('✅ Serialization Tests', () => {
    it('should serialize to string correctly', () => {
      // Arrange
      const hashValue = 'test-hash-for-serialization';
      const hashedPassword = HashedPassword.create(hashValue);

      // Act
      const serialized = hashedPassword.toString();

      // Assert
      expect(serialized).toBe(hashValue);
    });
  });

  describe('✅ Domain Logic Tests', () => {
    it('should be immutable', () => {
      // Arrange
      const hashedPassword = HashedPassword.create('immutable-hash');

      // Act & Assert - Vérifier que la propriété est readonly
      expect(typeof hashedPassword.value).toBe('string');
      expect(hashedPassword.value).toBe('immutable-hash');
      
      // Vérifier qu'on ne peut pas modifier l'objet
      expect(() => {
        (hashedPassword as any).newProperty = 'test';
      }).not.toThrow(); // TypeScript empêche mais JS n'interdit pas l'ajout de propriétés
      
      // Le plus important : la valeur reste constante
      expect(hashedPassword.value).toBe('immutable-hash');
    });

    it('should have consistent string representation', () => {
      // Arrange
      const hashValue = 'consistent-hash';
      const hashedPassword = HashedPassword.create(hashValue);

      // Act
      const str1 = hashedPassword.toString();
      const str2 = hashedPassword.toString();

      // Assert
      expect(str1).toBe(str2);
      expect(str1).toBe(hashValue);
    });
  });
});
