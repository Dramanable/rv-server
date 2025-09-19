/**
 * 🧪 Bcrypt Password Hasher Tests - INFRASTRUCTURE
 * ✅ Clean Architecture - Infrastructure Layer Tests
 * ✅ TDD - Tests avec dépendances techniques (bcrypt)
 * ✅ Tests d'intégration pour l'adapter
 */

import { BcryptPasswordHasher } from '../../../../infrastructure/services/bcrypt-password-hasher.service';

describe.skip('BcryptPasswordHasher - Infrastructure', () => {
  let passwordHasher: BcryptPasswordHasher;

  beforeEach(() => {
    passwordHasher = new BcryptPasswordHasher();
  });

  afterEach(() => {
    // Cleanup pour éviter les fuites mémoire
    passwordHasher = null as any;
  });

  describe.skip('✅ Hash Generation Tests', () => {
    it('should generate valid bcrypt hash from plain password', async () => {
      // Arrange
      const plainPassword = 'testpassword123';

      // Act
      const hash = await passwordHasher.hash(plainPassword);

      // Assert
      expect(hash).toBeDefined();
      expect(hash).toMatch(/^\$2[abxy]\$\d{1,2}\$.{53,}$/); // Bcrypt format
      expect(hash.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password (salt)', async () => {
      // Arrange
      const plainPassword = 'samepassword';

      // Act
      const hash1 = await passwordHasher.hash(plainPassword);
      const hash2 = await passwordHasher.hash(plainPassword);

      // Assert
      expect(hash1).not.toBe(hash2); // Different salts
      expect(await passwordHasher.verify(plainPassword, hash1)).toBe(true);
      expect(await passwordHasher.verify(plainPassword, hash2)).toBe(true);
    });

    it('should throw error for empty plain password', async () => {
      // Act & Assert
      await expect(passwordHasher.hash('')).rejects.toThrow();
      await expect(passwordHasher.hash('   ')).rejects.toThrow();
      await expect(passwordHasher.hash(null as any)).rejects.toThrow();
    });

    it('should handle long passwords correctly', async () => {
      // Arrange
      const longPassword = 'A'.repeat(100) + '123!';

      // Act
      const hash = await passwordHasher.hash(longPassword);

      // Assert
      expect(hash).toBeDefined();
      expect(await passwordHasher.verify(longPassword, hash)).toBe(true);
    });
  });

  describe.skip('✅ Password Verification Tests', () => {
    it('should verify correct password against hash', async () => {
      // Arrange
      const plainPassword = 'correctpassword123';
      const hash = await passwordHasher.hash(plainPassword);

      // Act
      const isValid = await passwordHasher.verify(plainPassword, hash);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password against hash', async () => {
      // Arrange
      const correctPassword = 'correctpassword';
      const wrongPassword = 'wrongpassword';
      const hash = await passwordHasher.hash(correctPassword);

      // Act
      const isValid = await passwordHasher.verify(wrongPassword, hash);

      // Assert
      expect(isValid).toBe(false);
    });

    it('should handle empty passwords in verification gracefully', async () => {
      // Arrange
      const hash = await passwordHasher.hash('validpassword');

      // Act & Assert
      expect(await passwordHasher.verify('', hash)).toBe(false);
      expect(await passwordHasher.verify(null as any, hash)).toBe(false);
      expect(await passwordHasher.verify(undefined as any, hash)).toBe(false);
    });

    it('should handle invalid hash in verification gracefully', async () => {
      // Arrange
      const plainPassword = 'testpassword';
      const invalidHash = 'invalid-hash-format';

      // Act
      const isValid = await passwordHasher.verify(plainPassword, invalidHash);

      // Assert
      expect(isValid).toBe(false); // Should not throw, just return false
    });

    it('should verify password case-sensitivity', async () => {
      // Arrange
      const password = 'TestPassword123';
      const hash = await passwordHasher.hash(password);

      // Act & Assert
      expect(await passwordHasher.verify(password, hash)).toBe(true);
      expect(await passwordHasher.verify('testpassword123', hash)).toBe(false);
      expect(await passwordHasher.verify('TESTPASSWORD123', hash)).toBe(false);
    });
  });

  describe.skip('✅ Hash Format Validation Tests', () => {
    it('should validate correct bcrypt hash formats', () => {
      // Arrange
      const validHashes = [
        '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
        '$2a$12$N9qo8uLOickgx2ZMRZoMye1COmmJZPEaWB/FJU81PiPBJCgqKYL1u',
        '$2y$08$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        '$2x$04$abcdefghijklmnopqrstuv.ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      ];

      // Act & Assert
      validHashes.forEach((hash) => {
        expect(passwordHasher.isValidHashFormat(hash)).toBe(true);
      });
    });

    it('should reject invalid hash formats', () => {
      // Arrange
      const invalidHashes = [
        '',
        '   ',
        'plaintext',
        '$2b$invalidformat',
        '$3b$10$EixZaYVK1fsbw1ZfbX3OXe', // Wrong version
        '$2b$99$EixZaYVK1fsbw1ZfbX3OXe', // Invalid rounds
        '$2b$10$short', // Too short
        'not-bcrypt-at-all',
        null as any,
        undefined as any,
      ];

      // Act & Assert
      invalidHashes.forEach((hash) => {
        expect(passwordHasher.isValidHashFormat(hash)).toBe(false);
      });
    });

    it('should validate different bcrypt versions', () => {
      // Arrange
      const versions = ['$2a$', '$2b$', '$2x$', '$2y$'];

      // Act & Assert
      versions.forEach((version) => {
        const hash = `${version}10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW`;
        expect(passwordHasher.isValidHashFormat(hash)).toBe(true);
      });
    });

    it('should validate different cost factors', () => {
      // Arrange
      const costs = ['04', '08', '10', '12', '15'];

      // Act & Assert
      costs.forEach((cost) => {
        const hash = `$2b$${cost}$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW`;
        expect(passwordHasher.isValidHashFormat(hash)).toBe(true);
      });
    });
  });

  describe.skip('✅ Testing Helper Methods', () => {
    it('should create fast hash for testing', async () => {
      // Arrange
      const plainPassword = 'testpassword';
      const startTime = Date.now();

      // Act
      const testHash = await passwordHasher.hashForTesting(plainPassword);
      const endTime = Date.now();

      // Assert
      expect(testHash).toBeDefined();
      expect(testHash).toMatch(/^\$2[abxy]\$04\$.+/); // Should use cost 4
      expect(await passwordHasher.verify(plainPassword, testHash)).toBe(true);
      expect(endTime - startTime).toBeLessThan(50); // Should be fast
    });

    it('should throw error when creating test hash with empty password', async () => {
      // Act & Assert
      await expect(passwordHasher.hashForTesting('')).rejects.toThrow();
      await expect(passwordHasher.hashForTesting('   ')).rejects.toThrow();
    });
  });

  describe.skip('✅ Performance Tests', () => {
    it('should hash password within reasonable time', async () => {
      // Arrange
      const plainPassword = 'performancetest123';
      const startTime = Date.now();

      // Act
      await passwordHasher.hash(plainPassword);
      const endTime = Date.now();

      // Assert - Should complete within 1 second (generous for bcrypt rounds=10)
      expect(endTime - startTime).toBeLessThan(1000);
    }, 2000);

    it('should verify password within reasonable time', async () => {
      // Arrange
      const plainPassword = 'verifytest123';
      const hash = await passwordHasher.hash(plainPassword);
      const startTime = Date.now();

      // Act
      await passwordHasher.verify(plainPassword, hash);
      const endTime = Date.now();

      // Assert - Verification should be faster than hashing
      expect(endTime - startTime).toBeLessThan(500);
    });
  });
});
