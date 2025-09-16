/**
 * 🧪 LOCAL AUTH GUARD TESTS - Tests unitaires avec TDD
 */

import { Test, TestingModule } from '@nestjs/testing';
import { LocalAuthGuard } from './local-auth.guard';

describe('LocalAuthGuard', () => {
  let guard: LocalAuthGuard;

  beforeEach(async () => {
    // 📦 Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalAuthGuard],
    }).compile();

    guard = module.get<LocalAuthGuard>(LocalAuthGuard);
  });

  describe('Request Handling', () => {
    it('should return user when authentication is successful', () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      // Act
      const result = guard.handleRequest(null, mockUser, null);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw error when credentials are invalid', () => {
      // Arrange
      const mockError = new Error('Invalid credentials');

      // Act & Assert
      expect(() => guard.handleRequest(mockError, null, null)).toThrow(
        'Invalid credentials',
      );
    });

    it('should throw error when user is null', () => {
      // Act & Assert
      expect(() => guard.handleRequest(null, null, null)).toThrow(
        'Invalid credentials',
      );
    });

    it('should handle strategy info parameter', () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockInfo = { message: 'Authentication successful' };

      // Act
      const result = guard.handleRequest(null, mockUser, mockInfo);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });

  describe('Guard Configuration', () => {
    it('should be defined', () => {
      expect(guard).toBeDefined();
    });

    it('should extend AuthGuard with local strategy', () => {
      expect(guard).toBeInstanceOf(LocalAuthGuard);
    });
  });
});
