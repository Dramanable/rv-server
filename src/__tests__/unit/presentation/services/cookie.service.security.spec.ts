/**
 * 🍪 Cookie Service Security Tests - Presentation Layer
 * ✅ Validation des paramètres de sécurité des cookies
 * ✅ HttpOnly, Secure, SameSite, Path restrictions
 */

import { createMockLogger } from '@application/mocks/typed-mocks';
import { ConfigService } from '@nestjs/config';
import { PresentationCookieService } from '@presentation/services/cookie.service';
import type { Request, Response } from 'express';

describe('🔐 PresentationCookieService - Security Tests', () => {
  let cookieService: PresentationCookieService;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;

  beforeEach(() => {
    // 🏗️ Setup mocks
    mockConfigService = {
      get: jest.fn(),
    } as any;

    mockResponse = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as any;

    mockRequest = {
      cookies: {},
    } as any;

    const mockLogger = createMockLogger();

    cookieService = new PresentationCookieService(
      mockConfigService,
      mockLogger,
    );
  });

  describe('🔒 Security Configuration Tests', () => {
    it('should set secure cookies in production environment', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      const tokens = {
        accessToken: 'access_token_123',
        refreshToken: 'refresh_token_456',
        expiresIn: 900, // 15 minutes
      };

      // 🟢 Act
      cookieService.setAuthenticationCookies(mockResponse, tokens, false);

      // ✅ Assert - Access Token Cookie
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access_token_123',
        expect.objectContaining({
          httpOnly: true,
          secure: true, // Production = true
          sameSite: 'strict',
          path: '/',
          maxAge: 900000, // 15 minutes in milliseconds
        }),
      );

      // ✅ Assert - Refresh Token Cookie
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token_456',
        expect.objectContaining({
          httpOnly: true,
          secure: true, // Production = true
          sameSite: 'strict',
          path: '/auth/refresh', // Restricted path
          maxAge: undefined, // Session cookie (no rememberMe)
        }),
      );
    });

    it('should set insecure cookies in development environment', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('development');

      const tokens = {
        accessToken: 'dev_access_token',
        refreshToken: 'dev_refresh_token',
        expiresIn: 300, // 5 minutes
      };

      // 🟢 Act
      cookieService.setAuthenticationCookies(mockResponse, tokens, true);

      // ✅ Assert - Secure should be false in development
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'dev_access_token',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // Development = false
          sameSite: 'strict',
          path: '/',
          maxAge: 300000, // 5 minutes in milliseconds
        }),
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'dev_refresh_token',
        expect.objectContaining({
          httpOnly: true,
          secure: false, // Development = false
          sameSite: 'strict',
          path: '/auth/refresh',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (rememberMe = true)
        }),
      );
    });

    it('should set proper cookie durations based on rememberMe flag', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 600, // 10 minutes
      };

      // 🟢 Act - rememberMe = true
      cookieService.setAuthenticationCookies(mockResponse, tokens, true);

      // ✅ Assert - Remember me should extend refresh token duration
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token',
        expect.objectContaining({
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        }),
      );

      // 🧹 Reset mocks
      mockResponse.cookie.mockClear();

      // 🟢 Act - rememberMe = false
      cookieService.setAuthenticationCookies(mockResponse, tokens, false);

      // ✅ Assert - No remember me should be session cookie
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token',
        expect.objectContaining({
          maxAge: undefined, // Session cookie
        }),
      );
    });

    it('should enforce HttpOnly flag on all authentication cookies', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      const tokens = {
        accessToken: 'test_access',
        refreshToken: 'test_refresh',
        expiresIn: 900,
      };

      // 🟢 Act
      cookieService.setAuthenticationCookies(mockResponse, tokens, false);

      // ✅ Assert - All cookies must be HttpOnly
      const cookieCalls = mockResponse.cookie.mock.calls;
      expect(cookieCalls).toHaveLength(2);

      cookieCalls.forEach((call) => {
        const options = call[2] as any; // Third parameter is options
        expect(options).toHaveProperty('httpOnly', true);
      });
    });

    it('should restrict refresh token path to /auth/refresh', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      const tokens = {
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
        expiresIn: 900,
      };

      // 🟢 Act
      cookieService.setAuthenticationCookies(mockResponse, tokens, false);

      // ✅ Assert - Refresh token should have restricted path
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh_token',
        expect.objectContaining({
          path: '/auth/refresh',
        }),
      );

      // ✅ Assert - Access token should have root path
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'accessToken',
        'access_token',
        expect.objectContaining({
          path: '/',
        }),
      );
    });

    it('should clear cookies with same security options during logout', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      // 🟢 Act
      cookieService.clearAuthenticationCookies(mockResponse);

      // ✅ Assert - Cookies cleared with proper options
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'accessToken',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/',
        }),
      );

      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        'refreshToken',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'strict',
          path: '/auth/refresh',
        }),
      );
    });
  });

  describe('🔍 Cookie Reading Security', () => {
    it('should safely read cookies from request', () => {
      // 🔴 Arrange
      mockRequest.cookies = {
        accessToken: 'valid_access_token',
        refreshToken: 'valid_refresh_token',
        otherCookie: 'other_value',
      };

      // 🟢 Act
      const accessToken = cookieService.getCookie(mockRequest, 'accessToken');
      const refreshToken = cookieService.getCookie(mockRequest, 'refreshToken');
      const nonexistent = cookieService.getCookie(mockRequest, 'nonexistent');

      // ✅ Assert
      expect(accessToken).toBe('valid_access_token');
      expect(refreshToken).toBe('valid_refresh_token');
      expect(nonexistent).toBeUndefined();
    });

    it('should handle missing cookies gracefully', () => {
      // 🔴 Arrange
      (mockRequest as any).cookies = undefined;

      // 🟢 Act
      const result = cookieService.getCookie(mockRequest, 'accessToken');

      // ✅ Assert
      expect(result).toBeUndefined();
    });
  });

  describe('🛡️ XSS and CSRF Protection', () => {
    it('should configure cookies to prevent XSS attacks', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      // 🟢 Act
      cookieService.setCookie(mockResponse, 'testCookie', 'testValue');

      // ✅ Assert - HttpOnly prevents client-side access
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'testCookie',
        'testValue',
        expect.objectContaining({
          httpOnly: true, // Prevents XSS
        }),
      );
    });

    it('should configure cookies to prevent CSRF attacks', () => {
      // 🔴 Arrange
      mockConfigService.get.mockReturnValue('production');

      // 🟢 Act
      cookieService.setCookie(mockResponse, 'testCookie', 'testValue');

      // ✅ Assert - SameSite strict prevents CSRF
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'testCookie',
        'testValue',
        expect.objectContaining({
          sameSite: 'strict', // Prevents CSRF
        }),
      );
    });
  });
});
