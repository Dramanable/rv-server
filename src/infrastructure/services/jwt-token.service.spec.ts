/**
 * 🧪 JwtTokenService - TDD RED Phase
 *
 * Tests avant implémentation pour JWT token service
 */

import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { JwtTokenService } from './jwt-token.service';

describe('JwtTokenService (TDD)', () => {
  let service: JwtTokenService;
  let mockJwtService: Partial<JwtService>;
  let mockLogger: {
    info: jest.Mock;
    error: jest.Mock;
    warn: jest.Mock;
  };
  let mockI18n: {
    t: jest.Mock;
  };

  beforeEach(async () => {
    mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    };

    mockI18n = {
      t: jest.fn().mockReturnValue('Mock message'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtTokenService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: TOKENS.PINO_LOGGER,
          useValue: mockLogger,
        },
        {
          provide: TOKENS.I18N_SERVICE,
          useValue: mockI18n,
        },
      ],
    }).compile();

    service = module.get<JwtTokenService>(JwtTokenService);
  });

  describe('Access Token Generation', () => {
    it('should generate valid access token with user claims', () => {
      // Arrange
      const userId = 'user-123';
      const email = 'user@example.com';
      const role = 'user';
      const secret = 'test-secret';
      const expiresIn = 15;

      const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
      mockJwtService.sign = jest.fn().mockReturnValue(expectedToken);

      // Act
      const result = service.generateAccessToken(
        userId,
        email,
        role,
        secret,
        expiresIn,
      );

      // Assert
      expect(result).toBe(expectedToken);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: userId,
          email,
        },
        {
          secret,
          expiresIn,
        },
      );
    });

    it('should log access token generation', () => {
      // Arrange
      const userId = 'user-123';
      const email = 'user@example.com';
      const role = 'user';
      const secret = 'test-secret';
      const expiresIn = 15;

      mockJwtService.sign = jest.fn().mockReturnValue('token');

      // Act
      service.generateAccessToken(userId, email, role, secret, expiresIn);

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Mock message',
        expect.objectContaining({
          operation: 'GENERATE_ACCESS_TOKEN',
          userId,
        }),
      );
    });
  });

  describe('Refresh Token Generation', () => {
    it('should generate secure refresh token', () => {
      // Arrange - no parameters needed

      // Act
      const result = service.generateRefreshToken();

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should log refresh token generation', () => {
      // Arrange - no setup needed

      // Act
      service.generateRefreshToken();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operation: 'generateRefreshToken',
        }),
      );
    });
  });

  describe('Refresh Token Generation', () => {
    it('should generate secure refresh token', () => {
      // Arrange - no parameters needed
      // Mock crypto.randomBytes et buffer toString
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mockRandomBytes = jest.spyOn(require('crypto'), 'randomBytes');
      mockRandomBytes.mockReturnValue(Buffer.from('test-random-data'));

      // Act
      const result = service.generateRefreshToken();

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should log refresh token generation', () => {
      // Arrange - no setup needed

      // Act
      service.generateRefreshToken();

      // Assert
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          operation: 'generateRefreshToken',
        }),
      );
    });
  });

  describe('Token Verification', () => {
    it('should verify valid JWT token', () => {
      // Arrange
      const token = 'valid.jwt.token';
      const secret = 'test-secret';
      const expectedPayload = {
        sub: 'user-123',
        email: 'user@example.com',
        role: 'USER',
        type: 'access',
      };

      mockJwtService.verify = jest.fn().mockReturnValue(expectedPayload);

      // Act
      const result = service.verifyToken(token, secret);

      // Assert
      expect(result).toEqual(expectedPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(token, { secret });
    });

    it('should handle invalid token verification', () => {
      // Arrange
      const token = 'invalid.jwt.token';
      const secret = 'test-secret';

      mockJwtService.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => service.verifyToken(token, secret)).toThrow('Invalid token');
    });
  });

  describe('Error Handling', () => {
    it('should handle JWT generation errors gracefully', () => {
      // Arrange
      const userId = 'user-123';
      const email = 'user@example.com';
      const role = 'USER';
      const secret = 'test-secret';
      const expiresIn = 900;

      mockJwtService.sign = jest.fn().mockImplementation(() => {
        throw new Error('JWT generation failed');
      });

      // Act & Assert
      expect(() =>
        service.generateAccessToken(userId, email, role, secret, expiresIn),
      ).toThrow('JWT generation failed');

      expect(mockLogger.error).toHaveBeenCalled();
    });
  });
});
