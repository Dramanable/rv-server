/**
 * 🧪 TESTS - LocalStrategy (Version Clean Architecture)
 *
 * Tests pour la LocalStrategy qui fait uniquement la validation technique
 * (sans logique business qui reste dans LoginUseCase)
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { User } from '@domain/entities/user.entity';
import { Email } from '@domain/value-objects/email.vo';
import { Test, TestingModule } from '@nestjs/testing';
import { LocalStrategy } from '@presentation/security/strategies/local.strategy';
import { TOKENS } from '@shared/constants/injection-tokens';
import { UserRole } from '@shared/enums/user-role.enum';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let mockUserRepository: any;
  let mockPasswordService: any;

  beforeEach(async () => {
    mockUserRepository = {
      findByEmail: jest.fn(),
    };

    mockPasswordService = {
      compare: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalStrategy,
        {
          provide: TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.BCRYPT_PASSWORD_SERVICE,
          useValue: mockPasswordService,
        },
        {
          provide: 'PinoLogger',
          useValue: {
            debug: jest.fn(),
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalStrategy>(LocalStrategy);
  });

  describe('Strategy Configuration', () => {
    it('should be defined', () => {
      expect(strategy).toBeDefined();
    });

    it('should extend PassportStrategy with local strategy', () => {
      expect(strategy.name).toBe('local');
    });
  });

  describe('Technical Validation (Clean Architecture)', () => {
    it('should return user data when valid credentials provided', async () => {
            // Arrange
      const email = 'valid@example.com';
      const password = 'password123';
      const mockReq = { ip: '127.0.0.1', get: () => 'test-agent' };

      const mockUser = new User(
        Email.create('valid@example.com'),
        'Test User',
        UserRole.REGULAR_CLIENT,
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(true);

      // Act
      const result = await strategy.validate(mockReq as any, email, password);

      // Assert - Seules les données utilisateur (pas de tokens ici)
      expect(result).toEqual({
        id: mockUser.id,
        email: email,
        name: 'Test User',
        role: UserRole.REGULAR_CLIENT,
      });
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        expect.any(Email),
      );
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        password,
        'hashedPassword123',
      );
    });

    it('should return null when user not found', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'anyPassword';
      const mockReq = { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' };

      mockUserRepository.findByEmail.mockResolvedValue(null);

      // Act
      const result = await strategy.validate(mockReq as any, email, password);

      // Assert
      expect(result).toBeNull();
      expect(mockPasswordService.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'invalidPassword';
      const mockReq = { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' };
      const mockUser = User.createWithHashedPassword(
        'user-456',
        Email.create(email),
        'Test User',
        UserRole.REGULAR_CLIENT,
        'hashedPassword123',
        new Date(),
        undefined,
        undefined,
        true,
        false,
        false,
      );

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockPasswordService.compare.mockResolvedValue(false);

      // Act
      const result = await strategy.validate(mockReq as any, email, password);

      // Assert
      expect(result).toBeNull();
      expect(mockPasswordService.compare).toHaveBeenCalledWith(
        password,
        'hashedPassword123',
      );
    });

    it('should return null when email validation fails', async () => {
      // Arrange
      const invalidEmail = 'invalid-email';
      const password = 'anyPassword';
      const mockReq = { headers: { 'user-agent': 'test' }, ip: '127.0.0.1' };

      // Act
      const result = await strategy.validate(
        mockReq as any,
        invalidEmail,
        password,
      );

      // Assert
      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockPasswordService.compare).not.toHaveBeenCalled();
    });
  });
});
