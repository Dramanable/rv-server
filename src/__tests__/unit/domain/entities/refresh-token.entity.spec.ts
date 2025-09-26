/**
 * 🧪 TDD - Refresh Token Entity Tests
 *
 * Tests complets pour l'entité RefreshToken avec logique métier
 */

import { RefreshToken } from '@domain/entities/refresh-token.entity';

describe('RefreshToken Entity', () => {
  const validUserId = 'user-123';
  const validToken =
    'secure-token-with-minimum-32-characters-length-requirement';
  let futureDate: Date;

  beforeEach(() => {
    // Date d'expiration dans 7 jours
    futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
  });

  describe('Token Creation', () => {
    it('should create refresh token with valid inputs', () => {
      // Act
      const refreshToken = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
        'device-123',
        'Mozilla/5.0',
        '192.168.1.100',
      );

      // Assert
      expect(refreshToken.id).toMatch(/^rt_/);
      expect(refreshToken.userId).toBe(validUserId);
      expect(refreshToken.tokenHash).toMatch(/^hash_/);
      expect(refreshToken.deviceId).toBe('device-123');
      expect(refreshToken.userAgent).toBe('Mozilla/5.0');
      expect(refreshToken.ipAddress).toBe('192.168.1.100');
      expect(refreshToken.expiresAt).toBe(futureDate);
      expect(refreshToken.createdAt).toBeInstanceOf(Date);
      expect(refreshToken.isRevoked).toBe(false);
      expect(refreshToken.revokedAt).toBeUndefined();
      expect(refreshToken.revokedReason).toBeUndefined();
    });

    it('should create token with optional fields', () => {
      // Act
      const refreshToken = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
      );

      // Assert
      expect(refreshToken.deviceId).toBeUndefined();
      expect(refreshToken.userAgent).toBeUndefined();
      expect(refreshToken.ipAddress).toBeUndefined();
    });

    it('should generate unique IDs for different tokens', () => {
      // Act
      const token1 = new RefreshToken(validUserId, validToken, futureDate);
      const token2 = new RefreshToken(validUserId, validToken, futureDate);

      // Assert
      expect(token1.id).not.toBe(token2.id);
    });
  });

  describe('Token Validation Rules', () => {
    it('should reject empty user ID', () => {
      // Act & Assert
      expect(() => {
        new RefreshToken('', validToken, futureDate);
      }).toThrow('User ID cannot be empty');
    });

    it('should reject whitespace-only user ID', () => {
      // Act & Assert
      expect(() => {
        new RefreshToken('   ', validToken, futureDate);
      }).toThrow('User ID cannot be empty');
    });

    it('should reject empty token', () => {
      // Act & Assert
      expect(() => {
        new RefreshToken(validUserId, '', futureDate);
      }).toThrow('Token cannot be empty');
    });

    it('should reject token shorter than 32 characters', () => {
      // Act & Assert
      expect(() => {
        new RefreshToken(validUserId, 'short-token', futureDate);
      }).toThrow('Token must be at least 32 characters long');
    });

    it('should reject past expiration date', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      // Act & Assert
      expect(() => {
        new RefreshToken(validUserId, validToken, pastDate);
      }).toThrow('Expiration date must be in the future');
    });

    it('should reject expiration date more than 1 year in future', () => {
      // Arrange
      const farFutureDate = new Date();
      farFutureDate.setFullYear(farFutureDate.getFullYear() + 2);

      // Act & Assert
      expect(() => {
        new RefreshToken(validUserId, validToken, farFutureDate);
      }).toThrow('Expiration date cannot be more than 1 year in the future');
    });
  });

  describe('Token State Management', () => {
    let refreshToken: RefreshToken;

    beforeEach(() => {
      refreshToken = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
        'device-123',
      );
    });

    it('should be valid when not revoked and not expired', () => {
      // Assert
      expect(refreshToken.isValid()).toBe(true);
      expect(refreshToken.isExpired()).toBe(false);
    });

    it('should be invalid when revoked', () => {
      // Act
      const revokedToken = refreshToken.revoke('User logout');

      // Assert
      expect(revokedToken.isValid()).toBe(false);
      expect(revokedToken.isRevoked).toBe(true);
      expect(revokedToken.revokedAt).toBeInstanceOf(Date);
      expect(revokedToken.revokedReason).toBe('User logout');
    });

    it('should be invalid when expired', () => {
      // Arrange
      const expiredDate = new Date();
      expiredDate.setDate(expiredDate.getDate() - 1);
      const expiredToken = new RefreshToken(
        validUserId,
        validToken,
        expiredDate,
        undefined,
        undefined,
        undefined,
        true, // Skip validation pour créer un token expiré
      );

      // Assert
      expect(expiredToken.isValid()).toBe(false);
      expect(expiredToken.isExpired()).toBe(true);
    });

    it('should throw error when revoking already revoked token', () => {
      // Arrange
      const revokedToken = refreshToken.revoke('First revocation');

      // Act & Assert
      expect(() => {
        revokedToken.revoke('Second revocation');
      }).toThrow('Token is already revoked');
    });
  });

  describe('Time Management', () => {
    it('should calculate correct time to expiry', () => {
      // Arrange
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + 10); // 10 minutes
      const token = new RefreshToken(validUserId, validToken, expiryDate);

      // Act
      const timeToExpiry = token.getTimeToExpiry();

      // Assert
      expect(timeToExpiry).toBeGreaterThan(580); // ~9m 40s
      expect(timeToExpiry).toBeLessThanOrEqual(600); // 10 minutes
    });

    it('should return 0 for expired tokens', () => {
      // Arrange
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      const expiredToken = new RefreshToken(
        validUserId,
        validToken,
        pastDate,
        undefined,
        undefined,
        undefined,
        true, // Skip validation pour créer un token expiré
      );

      // Act
      const timeToExpiry = expiredToken.getTimeToExpiry();

      // Assert
      expect(timeToExpiry).toBe(0);
    });
  });

  describe('Device Matching', () => {
    let tokenWithDevice: RefreshToken;
    let tokenWithUserAgent: RefreshToken;
    let tokenWithoutDevice: RefreshToken;

    beforeEach(() => {
      tokenWithDevice = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
        'device-123',
      );
      tokenWithUserAgent = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
        undefined,
        'Mozilla/5.0',
      );
      tokenWithoutDevice = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
      );
    });

    it('should match correct device ID', () => {
      // Assert
      expect(tokenWithDevice.matchesDevice('device-123')).toBe(true);
      expect(tokenWithDevice.matchesDevice('device-456')).toBe(false);
    });

    it('should match correct user agent when no device ID', () => {
      // Assert
      expect(tokenWithUserAgent.matchesDevice(undefined, 'Mozilla/5.0')).toBe(
        true,
      );
      expect(tokenWithUserAgent.matchesDevice(undefined, 'Chrome/91.0')).toBe(
        false,
      );
    });

    it('should match when no device info available', () => {
      // Assert
      expect(tokenWithoutDevice.matchesDevice()).toBe(true);
      expect(tokenWithoutDevice.matchesDevice('any-device')).toBe(true);
    });
  });

  describe('Token Security', () => {
    it('should hash tokens for secure storage', () => {
      // Arrange
      const token1 = new RefreshToken(validUserId, validToken, futureDate);
      const token2 = new RefreshToken(validUserId, validToken, futureDate);

      // Assert
      expect(token1.tokenHash).toMatch(/^hash_/);
      expect(token2.tokenHash).toMatch(/^hash_/);
      expect(token1.tokenHash).toBe(token2.tokenHash); // Same token = same hash
    });

    it('should verify correct token', () => {
      // Arrange
      const refreshToken = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
      );

      // Assert
      expect(refreshToken.verifyToken(validToken)).toBe(true);
      expect(refreshToken.verifyToken('wrong-token')).toBe(false);
    });

    it('should not expose original token', () => {
      // Arrange
      const refreshToken = new RefreshToken(
        validUserId,
        validToken,
        futureDate,
      );

      // Assert
      expect(refreshToken).not.toHaveProperty('token');
      expect(refreshToken.tokenHash).not.toBe(validToken);
    });
  });

  describe('Token Equality and String Representation', () => {
    it('should be equal when same ID', () => {
      // Arrange
      const token1 = new RefreshToken(validUserId, validToken, futureDate);
      const token2 = Object.create(RefreshToken.prototype);
      Object.assign(token2, token1);

      // Assert
      expect(token1.equals(token2)).toBe(true);
    });

    it('should not be equal when different ID', () => {
      // Arrange
      const token1 = new RefreshToken(validUserId, validToken, futureDate);
      const token2 = new RefreshToken(validUserId, validToken, futureDate);

      // Assert
      expect(token1.equals(token2)).toBe(false);
    });

    it('should have meaningful string representation', () => {
      // Arrange
      const token = new RefreshToken(validUserId, validToken, futureDate);

      // Act
      const stringRepresentation = token.toString();

      // Assert
      expect(stringRepresentation).toContain('RefreshToken');
      expect(stringRepresentation).toContain(token.id);
      expect(stringRepresentation).toContain(validUserId);
      expect(stringRepresentation).toContain('valid=true');
    });
  });
});
