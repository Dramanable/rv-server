/**
 * 🧪 HashedPassword Value Object - TDD Tests
 * ✅ Clean Architecture - Domain Layer
 * ✅ Test-Driven Development
 */

import { HashedPassword } from './hashed-password.value-object';
import { DomainError } from '../exceptions/domain.error';

describe('🔐 HashedPassword Value Object', () => {
  describe('🏗️ Creation', () => {
    it('should create a valid hashed password', () => {
      // Arrange - Hash bcrypt réel pour "testpassword"
      const validHash =
        '$2b$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu';

      // Act
      const hashedPassword = HashedPassword.create(validHash);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.value).toBe(validHash);
    });

    it('should throw error for empty hash', () => {
      // Act & Assert
      expect(() => HashedPassword.create('')).toThrow(DomainError);
      expect(() => HashedPassword.create('   ')).toThrow(DomainError);
    });

    it('should throw error for invalid bcrypt hash format', () => {
      // Act & Assert
      expect(() => HashedPassword.create('invalidhash')).toThrow(DomainError);
      expect(() => HashedPassword.create('$2b$invalidhash')).toThrow(
        DomainError,
      );
      expect(() => HashedPassword.create('plainpassword')).toThrow(DomainError);
    });

    it('should accept different bcrypt versions', () => {
      // Arrange - Hashes bcrypt réels
      const validHashes = [
        '$2b$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu', // bcrypt v2b
        '$2a$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu', // bcrypt v2a
        '$2y$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu', // bcrypt v2y
      ];

      // Act & Assert
      validHashes.forEach((hash) => {
        expect(() => HashedPassword.create(hash)).not.toThrow();
      });
    });
  });

  describe('🔍 Verification', () => {
    it('should verify correct plain password', async () => {
      // Arrange
      const plainPassword = 'testpassword';
      const hash =
        '$2b$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu'; // Hash de "testpassword"
      const hashedPassword = HashedPassword.create(hash);

      // Act
      const isValid = await hashedPassword.verify(plainPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject incorrect plain password', async () => {
      // Arrange
      const correctPassword = 'testpassword';
      const wrongPassword = 'wrongPassword';
      const hash =
        '$2b$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu';
      const hashedPassword = HashedPassword.create(hash);

      // Act
      const isValid = await hashedPassword.verify(wrongPassword);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should handle empty plain password', async () => {
      // Arrange
      const hash =
        '$2b$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu';
      const hashedPassword = HashedPassword.create(hash);

      // Act
      const isValid = await hashedPassword.verify('');

      // Assert
      expect(isValid).toBe(false);
    });
  });

  describe('⚖️ Equality', () => {
    it('should be equal when hashes are identical', () => {
      // Arrange
      const hash =
        '$2b$10$TiWEFvLKAtasWv3Bi/PU5ugoTd.JpnA.22FmJHwmIgKEurgStTvtu';
      const hashedPassword1 = HashedPassword.create(hash);
      const hashedPassword2 = HashedPassword.create(hash);

      // Act & Assert
      expect(hashedPassword1.equals(hashedPassword2)).toBe(true);
    });

    it('should not be equal when hashes are different', () => {
      // Arrange
      const hash1 =
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW';
      const hash2 =
        '$2b$10$DifferentSaltHere..EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQa2lW';
      const hashedPassword1 = HashedPassword.create(hash1);
      const hashedPassword2 = HashedPassword.create(hash2);

      // Act & Assert
      expect(hashedPassword1.equals(hashedPassword2)).toBe(false);
    });
  });

  describe('🏭 Factory Methods', () => {
    it('should hash plain password and create HashedPassword', async () => {
      // Arrange
      const plainPassword = 'mySecurePassword123!';

      // Act
      const hashedPassword =
        await HashedPassword.fromPlainPassword(plainPassword);

      // Assert
      expect(hashedPassword).toBeDefined();
      expect(hashedPassword.value).toMatch(/^\$2b\$10\$/);

      // Vérification que le hash peut vérifier le mot de passe original
      const isValid = await hashedPassword.verify(plainPassword);
      expect(isValid).toBe(true);
    });

    it('should create different hashes for same password (salt)', async () => {
      // Arrange
      const plainPassword = 'samePassword';

      // Act
      const hashedPassword1 =
        await HashedPassword.fromPlainPassword(plainPassword);
      const hashedPassword2 =
        await HashedPassword.fromPlainPassword(plainPassword);

      // Assert
      expect(hashedPassword1.value).not.toBe(hashedPassword2.value);
      expect(hashedPassword1.equals(hashedPassword2)).toBe(false);

      // Mais les deux peuvent vérifier le même mot de passe
      expect(await hashedPassword1.verify(plainPassword)).toBe(true);
      expect(await hashedPassword2.verify(plainPassword)).toBe(true);
    });
  });

  describe('🔒 Security', () => {
    it('should use secure bcrypt rounds', async () => {
      // Arrange
      const plainPassword = 'testPassword';

      // Act
      const hashedPassword =
        await HashedPassword.fromPlainPassword(plainPassword);

      // Assert
      // Vérifier que le hash utilise au moins 10 rounds (sécurité standard)
      expect(hashedPassword.value).toMatch(/^\$2b\$1[0-9]\$/);
    });

    it('should handle special characters in passwords', async () => {
      // Arrange
      const specialPassword = 'P@ssw0rd!#$%^&*()';

      // Act
      const hashedPassword =
        await HashedPassword.fromPlainPassword(specialPassword);
      const isValid = await hashedPassword.verify(specialPassword);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should handle unicode characters', async () => {
      // Arrange
      const unicodePassword = 'Mötörhead🤘éèù';

      // Act
      const hashedPassword =
        await HashedPassword.fromPlainPassword(unicodePassword);
      const isValid = await hashedPassword.verify(unicodePassword);

      // Assert
      expect(isValid).toBe(true);
    });
  });
});
