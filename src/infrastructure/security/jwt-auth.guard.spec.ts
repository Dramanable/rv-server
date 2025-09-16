/**
 * 🧪 JWT AUTH GUARD TESTS - Tests unitaires avec TDD
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    // 🎭 Create mock
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    // 📦 Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: Reflector,
          useValue: reflector,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  describe('Public Endpoints', () => {
    it('should allow access to public endpoints without authentication', async () => {
      // Arrange
      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue(true); // Endpoint is public

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });

  describe('Protected Endpoints', () => {
    it('should delegate to parent AuthGuard for protected endpoints', async () => {
      // Arrange
      const mockRequest = {
        cookies: { access_token: 'valid-token' },
        url: '/protected-endpoint',
      };

      const mockContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
        }),
      } as unknown as ExecutionContext;

      reflector.getAllAndOverride.mockReturnValue(false); // Endpoint is protected

      // Mock the parent canActivate method
      const superCanActivateSpy = jest.spyOn(
        Object.getPrototypeOf(Object.getPrototypeOf(guard)),
        'canActivate',
      );
      superCanActivateSpy.mockReturnValue(true);

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
      expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);

      // Cleanup
      superCanActivateSpy.mockRestore();
    });
  });

  describe('Request Handling', () => {
    it('should return user when authentication is successful', () => {
      // Arrange
      const mockUser = { id: '123', email: 'user@example.com' };
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ url: '/api/test' }),
        }),
      } as unknown as ExecutionContext;

      // Act
      const result = guard.handleRequest(null, mockUser, null, mockContext);

      // Assert
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user is not authenticated', () => {
      // Arrange
      const mockError = new Error('Token expired');
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ url: '/api/test' }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      expect(() =>
        guard.handleRequest(mockError, null, null, mockContext),
      ).toThrow('Token expired');
    });

    it('should throw error when user is null', () => {
      // Arrange
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({ url: '/api/test' }),
        }),
      } as unknown as ExecutionContext;

      // Act & Assert
      expect(() => guard.handleRequest(null, null, null, mockContext)).toThrow(
        'Authentication failed. Please login again.',
      );
    });
  });
});
