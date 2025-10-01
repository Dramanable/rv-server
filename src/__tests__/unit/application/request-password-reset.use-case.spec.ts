/**
 * 🧪 TESTS - Request Password Reset Use Case
 *
 * Tests TDD pour le use case de demande de réinitialisation de mot de passe
 */

import {
  IEmailService,
  PasswordResetEmailData,
} from '../../../application/ports/email.port';
import { RequestPasswordResetUseCase } from '../../../application/use-cases/password-reset/request-password-reset.use-case';
import { PasswordResetCode } from '../../../domain/entities/password-reset-code.entity';
import { User } from '../../../domain/entities/user.entity';
import { DomainValidationError } from '../../../domain/exceptions/domain.exceptions';
import { IPasswordResetCodeRepository } from '../../../domain/repositories/password-reset-code.repository';
import { UserRepository } from '../../../domain/repositories/user.repository.interface';
import { Email } from '../../../domain/value-objects/email.vo';

// Mocks pour les tests
class MockPasswordResetCodeRepository implements IPasswordResetCodeRepository {
  private codes: PasswordResetCode[] = [];

  async save(code: PasswordResetCode): Promise<void> {
    if (!code.id) {
      (code as any).id = `mock-id-${this.codes.length + 1}`;
    }
    this.codes.push(code);
  }

  async findByCode(code: string): Promise<PasswordResetCode | null> {
    return this.codes.find((c) => c.code === code) || null;
  }

  async findValidCodesByUserId(userId: string): Promise<PasswordResetCode[]> {
    return this.codes.filter((c) => c.userId === userId && c.isValid);
  }

  async invalidateUserCodes(userId: string): Promise<void> {
    this.codes.forEach((c) => {
      if (c.userId === userId && c.isValid) {
        c.markAsUsed();
      }
    });
  }

  async markAsUsed(code: string): Promise<void> {
    const resetCode = await this.findByCode(code);
    if (resetCode) {
      resetCode.markAsUsed();
    }
  }

  async deleteExpiredCodes(): Promise<number> {
    const initialCount = this.codes.length;
    this.codes = this.codes.filter((c) => !c.isExpired);
    return initialCount - this.codes.length;
  }

  async deleteUserCodes(userId: string): Promise<void> {
    this.codes = this.codes.filter((c) => c.userId !== userId);
  }

  async isCodeValid(code: string): Promise<boolean> {
    const resetCode = await this.findByCode(code);
    return resetCode ? resetCode.isValid : false;
  }
}

class MockUserRepository implements Partial<UserRepository> {
  private readonly users: User[] = [];

  async findByEmail(email: Email): Promise<User | null> {
    return (
      this.users.find((u) => u.email.getValue() === email.getValue()) || null
    );
  }

  addUser(user: User): void {
    this.users.push(user);
  }
}

class MockEmailService implements Partial<IEmailService> {
  public sentEmails: PasswordResetEmailData[] = [];

  async sendPasswordResetEmail(
    data: PasswordResetEmailData,
  ): Promise<{ success: boolean; messageId?: string }> {
    this.sentEmails.push(data);
    return { success: true, messageId: 'mock-message-id' };
  }
}

describe('RequestPasswordResetUseCase', () => {
  let useCase: RequestPasswordResetUseCase;
  let passwordResetRepository: MockPasswordResetCodeRepository;
  let userRepository: MockUserRepository;
  let emailService: MockEmailService;
  let testUser: User;

  beforeEach(() => {
    passwordResetRepository = new MockPasswordResetCodeRepository();
    userRepository = new MockUserRepository();
    emailService = new MockEmailService();

    useCase = new RequestPasswordResetUseCase(
      passwordResetRepository as any,
      userRepository as any,
      emailService as any,
    );

    // Créer un utilisateur de test simplifié
    testUser = {
      id: 'user-123',
      email: Email.create('test@example.com'),
      name: 'John Doe',
      firstName: 'John',
    } as unknown as User;

    userRepository.addUser(testUser);
  });

  describe('execute', () => {
    it('should create and send password reset code for valid email', async () => {
      // Given
      const email = 'test@example.com';

      // When
      const result = await useCase.execute({ email });

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toContain('code de réinitialisation');

      // Vérifier qu'un code a été créé
      const validCodes = await passwordResetRepository.findValidCodesByUserId(
        testUser.id,
      );
      expect(validCodes).toHaveLength(1);
      expect(validCodes[0].code).toMatch(/^\d{4}$/);

      // Vérifier qu'un email a été envoyé
      expect(emailService.sentEmails).toHaveLength(1);
      const sentEmail = emailService.sentEmails[0];
      expect(sentEmail.userName).toBe('John');
      expect(sentEmail.resetCode).toMatch(/^\d{4}$/);
      expect(sentEmail.expirationTime).toContain('15 minutes');
    });

    it('should invalidate existing codes before creating new one', async () => {
      // Given
      const email = 'test@example.com';
      const existingCode = PasswordResetCode.create(testUser.id);
      await passwordResetRepository.save(existingCode);

      // When
      const result = await useCase.execute({ email });

      // Then
      expect(result.success).toBe(true);

      // Vérifier que l'ancien code est invalidé
      const oldCodeValid = await passwordResetRepository.isCodeValid(
        existingCode.code,
      );
      expect(oldCodeValid).toBe(false);

      // Vérifier qu'un nouveau code valide existe
      const validCodes = await passwordResetRepository.findValidCodesByUserId(
        testUser.id,
      );
      expect(validCodes).toHaveLength(1);
      expect(validCodes[0].code).not.toBe(existingCode.code);
    });

    it('should return success even for non-existent email (security)', async () => {
      // Given
      const email = 'nonexistent@example.com';

      // When
      const result = await useCase.execute({ email });

      // Then
      expect(result.success).toBe(true);
      expect(result.message).toContain('Si cette adresse email existe');

      // Vérifier qu'aucun code n'a été créé
      const allCodes =
        await passwordResetRepository.findValidCodesByUserId('any-user');
      expect(allCodes).toHaveLength(0);

      // Vérifier qu'aucun email n'a été envoyé
      expect(emailService.sentEmails).toHaveLength(0);
    });

    it('should throw error for invalid email format', async () => {
      // Given
      const invalidEmail = 'invalid-email';

      // When & Then
      await expect(useCase.execute({ email: invalidEmail })).rejects.toThrow(
        DomainValidationError,
      );
    });

    it('should throw error for empty email', async () => {
      // Given
      const emptyEmail = '';

      // When & Then
      await expect(useCase.execute({ email: emptyEmail })).rejects.toThrow(
        DomainValidationError,
      );
    });

    it('should handle email service failure gracefully', async () => {
      // Given
      const email = 'test@example.com';
      emailService.sendPasswordResetEmail = jest
        .fn()
        .mockRejectedValue(new Error('Email service down'));

      // When
      const result = await useCase.execute({ email });

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain('erreur technique');

      // Le code ne doit pas être sauvegardé si l'email échoue
      const validCodes = await passwordResetRepository.findValidCodesByUserId(
        testUser.id,
      );
      expect(validCodes).toHaveLength(0);
    });

    it('should include proper email template data', async () => {
      // Given
      const email = 'test@example.com';

      // When
      await useCase.execute({ email });

      // Then
      const sentEmail = emailService.sentEmails[0];
      expect(sentEmail).toMatchObject({
        userName: 'John',
        resetCode: expect.stringMatching(/^\d{4}$/),
        expirationTime: '15 minutes',
        companyName: expect.any(String),
      });
    });

    it('should generate different codes for multiple requests', async () => {
      // Given
      const email = 'test@example.com';

      // When
      await useCase.execute({ email });
      await useCase.execute({ email });

      // Then
      expect(emailService.sentEmails).toHaveLength(2);
      const code1 = emailService.sentEmails[0].resetCode;
      const code2 = emailService.sentEmails[1].resetCode;
      expect(code1).not.toBe(code2);
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'test@',
        'test.example.com',
        '',
        null,
        undefined,
      ];

      for (const email of invalidEmails) {
        await expect(useCase.execute({ email: email as any })).rejects.toThrow(
          DomainValidationError,
        );
      }
    });
  });
});
