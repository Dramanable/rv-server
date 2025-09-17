import { PasswordResetService } from '../../../../application/services/password-reset-simple.service';
import { UserRepository } from '../../../../domain/repositories/user.repository.interface';
import { EmailService } from '../../../../domain/services/email.service';
import { Logger } from '../../application/ports/logger.port';

// Types pour les mocks
type MockUserRepository = {
  findByEmail: jest.Mock;
  save: jest.Mock;
};

type MockEmailService = {
  sendPasswordResetEmail: jest.Mock;
};

type MockLogger = {
  info: jest.Mock;
  error: jest.Mock;
};

// Mock simple sans NestJS pour éviter les dépendances circulaires
describe('PasswordResetService (Simplified)', () => {
  let service: PasswordResetService;
  let mockUserRepository: MockUserRepository;
  let mockEmailService: MockEmailService;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };

    mockEmailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
    };

    // Création directe sans NestJS TestingModule
    service = new PasswordResetService(
      mockUserRepository as unknown as UserRepository,
      mockEmailService as unknown as EmailService,
      mockLogger as unknown as Logger,
    );
  });

  describe('requestPasswordReset', () => {
    it('should return success for valid email', () => {
      // Arrange
      const email = 'user@example.com';

      // Act
      const result = service.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If this email exists, you will receive password reset instructions.',
      );
    });

    it('should return success even for non-existent email (security)', () => {
      // Arrange
      const email = 'nonexistent@example.com';

      // Act
      const result = service.requestPasswordReset(email);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'If this email exists, you will receive password reset instructions.',
      );
    });
  });

  describe('resetPassword', () => {
    it('should return success for valid input', () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = 'NewPassword123!';

      // Act
      const result = service.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Password successfully reset.');
    });

    it('should reject weak passwords', () => {
      // Arrange
      const token = 'valid-token';
      const newPassword = '123';

      // Act
      const result = service.resetPassword(token, newPassword);

      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe(
        'Password must be at least 8 characters long',
      );
    });
  });
});
