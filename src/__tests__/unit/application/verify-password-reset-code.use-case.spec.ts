/**
 * 🧪 TESTS - Verify Password Reset Code Use Case
 *
 * Tests TDD pour le use case de vérification du code de réinitialisation
 */

import { VerifyPasswordResetCodeUseCase } from "../../../application/use-cases/password-reset/verify-password-reset-code.use-case";
import { IPasswordResetCodeRepository } from "../../../domain/repositories/password-reset-code.repository";
import { UserRepository } from "../../../domain/repositories/user.repository.interface";
import { AuthenticationService } from "../../../application/ports/authentication.port";
import { User } from "../../../domain/entities/user.entity";
import { PasswordResetCode } from "../../../domain/entities/password-reset-code.entity";
import { Email } from "../../../domain/value-objects/email.vo";
import { DomainValidationError } from "../../../domain/exceptions/domain.exceptions";

// Mocks pour les tests
class MockPasswordResetCodeRepository implements IPasswordResetCodeRepository {
  private codes: PasswordResetCode[] = [];

  async save(code: PasswordResetCode): Promise<void> {
    if (!code.id) {
      (code as any).id = `mock-id-${this.codes.length + 1}`;
    }
    const existingIndex = this.codes.findIndex(
      (c) => c.id === code.id || c.code === code.code,
    );
    if (existingIndex >= 0) {
      this.codes[existingIndex] = code;
    } else {
      this.codes.push(code);
    }
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

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find((u) => u.email.getValue() === email.value) || null;
  }

  addUser(user: User): void {
    this.users.push(user);
  }
}

class MockAuthService implements Partial<AuthenticationService> {
  public generatedTokens: { userId: string; token: string }[] = [];

  async generateResetSessionToken(userId: string): Promise<string> {
    const token = `reset-session-token-${userId}-${Date.now()}`;
    this.generatedTokens.push({ userId, token });
    return token;
  }
}

describe("VerifyPasswordResetCodeUseCase", () => {
  let useCase: VerifyPasswordResetCodeUseCase;
  let passwordResetRepository: MockPasswordResetCodeRepository;
  let userRepository: MockUserRepository;
  let authService: MockAuthService;
  let testUser: User;
  let testCode: PasswordResetCode;

  beforeEach(() => {
    passwordResetRepository = new MockPasswordResetCodeRepository();
    userRepository = new MockUserRepository();
    authService = new MockAuthService();

    useCase = new VerifyPasswordResetCodeUseCase(
      passwordResetRepository as any,
      userRepository as any,
      authService as any,
    );

    // Créer un utilisateur de test
    testUser = {
      id: "user-123",
      email: Email.create("test@example.com"),
      name: "John Doe",
      firstName: "John",
    } as unknown as User;

    userRepository.addUser(testUser);

    // Créer un code de test
    testCode = PasswordResetCode.create(testUser.id);
  });

  describe("execute", () => {
    it("should successfully verify valid code and return session token", async () => {
      // Given
      await passwordResetRepository.save(testCode);
      const command = { code: testCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(true);
      expect(result.sessionToken).toBeDefined();
      expect(result.sessionToken).toMatch(/^reset-session-token-user-123-/);
      expect(result.message).toContain("Code vérifié avec succès");
      expect(result.userId).toBe(testUser.id);
      expect(result.expiresIn).toBe(300); // 5 minutes

      // Vérifier qu'un token de session a été généré
      expect(authService.generatedTokens).toHaveLength(1);
      expect(authService.generatedTokens[0].userId).toBe(testUser.id);
    });

    it("should fail for non-existent code", async () => {
      // Given
      const command = { code: "9999" };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain("Code invalide");
      expect(result.sessionToken).toBeUndefined();
      expect(result.userId).toBeUndefined();
    });

    it("should fail for expired code", async () => {
      // Given
      const expiredCode = PasswordResetCode.create(testUser.id);
      (expiredCode as any)._expiresAt = new Date(Date.now() - 1000); // Expired
      await passwordResetRepository.save(expiredCode);

      const command = { code: expiredCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain("Code expiré");
      expect(result.sessionToken).toBeUndefined();
    });

    it("should fail for already used code", async () => {
      // Given
      testCode.markAsUsed();
      await passwordResetRepository.save(testCode);

      const command = { code: testCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain("Code déjà utilisé");
      expect(result.sessionToken).toBeUndefined();
    });

    it("should fail when user not found", async () => {
      // Given
      const orphanCode = PasswordResetCode.create("non-existent-user");
      await passwordResetRepository.save(orphanCode);

      const command = { code: orphanCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain("Utilisateur introuvable");
      expect(result.sessionToken).toBeUndefined();
    });

    it("should mark code as used after successful verification", async () => {
      // Given
      await passwordResetRepository.save(testCode);
      const command = { code: testCode.code };

      // When
      await useCase.execute(command);

      // Then
      const codeAfter = await passwordResetRepository.findByCode(testCode.code);
      expect(codeAfter?.isUsed).toBe(true);
      expect(codeAfter?.usedAt).toBeInstanceOf(Date);
    });

    it("should handle auth service failure gracefully", async () => {
      // Given
      await passwordResetRepository.save(testCode);
      authService.generateResetSessionToken = jest
        .fn()
        .mockRejectedValue(new Error("Auth service down"));

      const command = { code: testCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(false);
      expect(result.message).toContain("erreur technique");

      // Le code ne doit pas être marqué comme utilisé si la génération du token échoue
      const codeAfter = await passwordResetRepository.findByCode(testCode.code);
      expect(codeAfter?.isUsed).toBe(false);
    });

    it("should provide remaining time information for valid code", async () => {
      // Given
      await passwordResetRepository.save(testCode);
      const command = { code: testCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.success).toBe(true);
      expect(result.remainingTimeMinutes).toBeGreaterThan(14);
      expect(result.remainingTimeMinutes).toBeLessThanOrEqual(15);
    });

    it("should prevent brute force with rate limiting info", async () => {
      // Given
      const command = { code: "9999" };

      // When - Multiple failed attempts
      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(await useCase.execute(command));
      }

      // Then - Should still fail but not lock account (just info)
      results.forEach((result) => {
        expect(result.success).toBe(false);
        expect(result.attemptsRemaining).toBeDefined();
        expect(typeof result.attemptsRemaining).toBe("number");
      });
    });
  });

  describe("Input Validation", () => {
    it("should throw error for invalid code format", async () => {
      const invalidCodes = [
        "123", // Too short
        "12345", // Too long
        "abcd", // Not digits
        "", // Empty
        null, // Null
        undefined, // Undefined
      ];

      for (const code of invalidCodes) {
        await expect(useCase.execute({ code: code as any })).rejects.toThrow(
          DomainValidationError,
        );
      }
    });

    it("should validate code is exactly 4 digits", async () => {
      // Valid codes should not throw
      await expect(useCase.execute({ code: "1234" })).resolves.toBeDefined();
      await expect(useCase.execute({ code: "0000" })).resolves.toBeDefined();
      await expect(useCase.execute({ code: "9999" })).resolves.toBeDefined();
    });
  });

  describe("Security Features", () => {
    it("should not reveal timing differences between valid/invalid codes", async () => {
      // Given
      await passwordResetRepository.save(testCode);

      const validCommand = { code: testCode.code };
      const invalidCommand = { code: "9999" };

      // When - Measure timing (simplified test)
      const start1 = Date.now();
      await useCase.execute(validCommand);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      await useCase.execute(invalidCommand);
      const time2 = Date.now() - start2;

      // Then - Times should be reasonably close (within 100ms tolerance)
      const timeDiff = Math.abs(time1 - time2);
      expect(timeDiff).toBeLessThan(100);
    });

    it("should include security headers in response", async () => {
      // Given
      await passwordResetRepository.save(testCode);
      const command = { code: testCode.code };

      // When
      const result = await useCase.execute(command);

      // Then
      expect(result.security).toBeDefined();
      expect(result.security?.sessionType).toBe("password-reset");
      expect(result.security?.maxAttempts).toBeDefined();
      expect(result.security?.lockoutDuration).toBeDefined();
    });
  });
});
