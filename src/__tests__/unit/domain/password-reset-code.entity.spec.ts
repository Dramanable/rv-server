/**
 * 🧪 TESTS - Password Reset Code Entity
 *
 * Tests TDD pour l'entité PasswordResetCode
 * Suivant les bonnes pratiques de test first approach
 */

import { PasswordResetCode } from '../../../domain/entities/password-reset-code.entity';
import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';

describe('PasswordResetCode Entity', () => {
  describe('Factory Method - create', () => {
    it('should create a valid password reset code', () => {
      // Given
      const userId = 'user-123';

      // When
      const resetCode = PasswordResetCode.create(userId);

      // Then
      expect(resetCode.userId).toBe(userId);
      expect(resetCode.code).toMatch(/^\d{4}$/); // 4 digits
      expect(resetCode.expiresAt).toBeInstanceOf(Date);
      expect(resetCode.createdAt).toBeInstanceOf(Date);
      expect(resetCode.usedAt).toBeNull();
      expect(resetCode.isValid).toBe(true);
      expect(resetCode.isExpired).toBe(false);
      expect(resetCode.isUsed).toBe(false);
    });

    it('should throw error when userId is empty', () => {
      // Given
      const emptyUserId = '';

      // When & Then
      expect(() => PasswordResetCode.create(emptyUserId)).toThrow(
        DomainValidationError,
      );
    });

    it('should throw error when userId is null', () => {
      // Given
      const nullUserId = null as any;

      // When & Then
      expect(() => PasswordResetCode.create(nullUserId)).toThrow(
        DomainValidationError,
      );
    });

    it('should set expiration to 15 minutes from now', () => {
      // Given
      const userId = 'user-123';
      const beforeCreation = new Date();

      // When
      const resetCode = PasswordResetCode.create(userId);

      // Then
      const afterCreation = new Date();
      const expectedExpiration = new Date(
        beforeCreation.getTime() + 15 * 60 * 1000,
      );
      const actualExpiration = resetCode.expiresAt;

      expect(actualExpiration.getTime()).toBeGreaterThanOrEqual(
        expectedExpiration.getTime() - 1000,
      );
      expect(actualExpiration.getTime()).toBeLessThanOrEqual(
        expectedExpiration.getTime() + 1000,
      );
    });

    it('should generate different codes for different calls', () => {
      // Given
      const userId = 'user-123';

      // When
      const code1 = PasswordResetCode.create(userId);
      const code2 = PasswordResetCode.create(userId);

      // Then
      expect(code1.code).not.toBe(code2.code);
    });

    it('should avoid predictable patterns', () => {
      // Given
      const userId = 'user-123';
      const predictablePatterns = [
        '0000',
        '1111',
        '2222',
        '3333',
        '4444',
        '5555',
        '6666',
        '7777',
        '8888',
        '9999',
        '1234',
        '4321',
      ];
      const generatedCodes = new Set<string>();

      // When - Generate 100 codes
      for (let i = 0; i < 100; i++) {
        const resetCode = PasswordResetCode.create(userId);
        generatedCodes.add(resetCode.code);
      }

      // Then - None should be predictable patterns
      for (const pattern of predictablePatterns) {
        expect(generatedCodes.has(pattern)).toBe(false);
      }
    });
  });

  describe('Business Rules - Validation', () => {
    it('should be valid when newly created', () => {
      // Given
      const userId = 'user-123';

      // When
      const resetCode = PasswordResetCode.create(userId);

      // Then
      expect(resetCode.isValid).toBe(true);
      expect(resetCode.isExpired).toBe(false);
      expect(resetCode.isUsed).toBe(false);
    });

    it('should be expired after 15 minutes', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // Simulate time passing (mock the expiration)
      const pastExpiration = new Date(Date.now() - 1000); // 1 second ago
      (resetCode as any)._expiresAt = pastExpiration;

      // When & Then
      expect(resetCode.isExpired).toBe(true);
      expect(resetCode.isValid).toBe(false);
    });

    it('should be invalid when used', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // When
      resetCode.markAsUsed();

      // Then
      expect(resetCode.isUsed).toBe(true);
      expect(resetCode.isValid).toBe(false);
      expect(resetCode.usedAt).toBeInstanceOf(Date);
    });

    it('should not allow using expired code', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // Simulate expiration
      const pastExpiration = new Date(Date.now() - 1000);
      (resetCode as any)._expiresAt = pastExpiration;

      // When & Then
      expect(() => resetCode.markAsUsed()).toThrow(DomainValidationError);
    });

    it('should not allow using already used code', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);
      resetCode.markAsUsed();

      // When & Then
      expect(() => resetCode.markAsUsed()).toThrow(DomainValidationError);
    });
  });

  describe('Code Matching', () => {
    it('should match correct code', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);
      const correctCode = resetCode.code;

      // When & Then
      expect(resetCode.matches(correctCode)).toBe(true);
    });

    it('should not match incorrect code', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);
      const incorrectCode = '9999';

      // When & Then
      expect(resetCode.matches(incorrectCode)).toBe(false);
    });

    it('should throw error for invalid code format', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // When & Then
      expect(() => resetCode.matches('123')).toThrow(DomainValidationError); // Too short
      expect(() => resetCode.matches('12345')).toThrow(DomainValidationError); // Too long
      expect(() => resetCode.matches('abcd')).toThrow(DomainValidationError); // Not digits
      expect(() => resetCode.matches('')).toThrow(DomainValidationError); // Empty
    });
  });

  describe('Time Management', () => {
    it('should calculate remaining time correctly', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // When
      const remainingTime = resetCode.remainingTimeInMinutes;

      // Then
      expect(remainingTime).toBeGreaterThan(14);
      expect(remainingTime).toBeLessThanOrEqual(15);
    });

    it('should return 0 remaining time when expired', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // Simulate expiration
      const pastExpiration = new Date(Date.now() - 1000);
      (resetCode as any)._expiresAt = pastExpiration;

      // When & Then
      expect(resetCode.remainingTimeInMinutes).toBe(0);
    });
  });

  describe('Data Serialization', () => {
    it('should serialize to data object correctly', () => {
      // Given
      const userId = 'user-123';
      const resetCode = PasswordResetCode.create(userId);

      // When
      const data = resetCode.toData();

      // Then
      expect(data).toHaveProperty('code');
      expect(data).toHaveProperty('userId', userId);
      expect(data).toHaveProperty('expiresAt');
      expect(data).toHaveProperty('createdAt');
      expect(data).toHaveProperty('usedAt', null);
      expect(data).toHaveProperty('isExpired', false);
      expect(data).toHaveProperty('isUsed', false);
      expect(data).toHaveProperty('isValid', true);
      expect(data).toHaveProperty('remainingTimeInMinutes');
      expect(typeof data.remainingTimeInMinutes).toBe('number');
    });
  });

  describe('Factory Method - fromData', () => {
    it('should recreate entity from data', () => {
      // Given
      const originalData = {
        id: 'reset-code-id',
        code: '1234',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
        usedAt: null,
      };

      // When
      const resetCode = PasswordResetCode.fromData(originalData);

      // Then
      expect(resetCode.id).toBe(originalData.id);
      expect(resetCode.code).toBe(originalData.code);
      expect(resetCode.userId).toBe(originalData.userId);
      expect(resetCode.expiresAt).toBe(originalData.expiresAt);
      expect(resetCode.createdAt).toBe(originalData.createdAt);
      expect(resetCode.usedAt).toBe(originalData.usedAt);
    });

    it('should recreate used entity from data', () => {
      // Given
      const usedAt = new Date();
      const usedData = {
        id: 'reset-code-id',
        code: '1234',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
        usedAt,
      };

      // When
      const resetCode = PasswordResetCode.fromData(usedData);

      // Then
      expect(resetCode.isUsed).toBe(true);
      expect(resetCode.usedAt).toBe(usedAt);
      expect(resetCode.isValid).toBe(false);
    });
  });
});
