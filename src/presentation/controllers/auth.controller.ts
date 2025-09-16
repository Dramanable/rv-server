/**
 * 🎭 Authentication Controller - Presentation Layer
 *
 * Contrôleur REST pour l'authentification (login, refresh, logout)
 * Gère les cookies HTTP et orchestre les use cases
 */

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpStatus,
  HttpCode,
  Logger,
  Inject,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { LoginDto, RefreshTokenDto, LogoutDto } from '../dtos/auth.dto';
import { TOKENS } from '../../shared/constants/injection-tokens';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject(TOKENS.LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    @Inject(TOKENS.REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(TOKENS.LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCase,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    try {
      // Exécuter le use case
      const result = await this.loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
        rememberMe: loginDto.rememberMe,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      // Définir les cookies sécurisés
      this.setAuthCookies(res, result);

      // Retourner la réponse (sans les tokens sensibles)
      return {
        user: result.user,
        message: result.message,
      };
    } catch (error) {
      this.logger.error(`Login failed for ${loginDto.email}`, error);
      throw error;
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      this.logger.warn('Refresh token attempt without token');
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'No refresh token provided',
      });
    }

    try {
      // Exécuter le use case
      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      // Définir les nouveaux cookies
      this.setRefreshCookies(res, result);

      // Retourner la réponse
      return {
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      // Nettoyer les cookies invalides
      this.clearAuthCookies(res);
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User logout - revoke tokens and clear cookies' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    try {
      // Exécuter le use case
      const result = await this.logoutUseCase.execute({
        refreshToken,
        userId: logoutDto.userId,
        logoutAllDevices: logoutDto.logoutAllDevices,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      // Nettoyer les cookies
      this.clearAuthCookies(res, result.cookieSettings.isProduction);

      return {
        message: result.message,
      };
    } catch (error) {
      this.logger.error('Logout error', error);
      // Toujours nettoyer les cookies même en cas d'erreur
      this.clearAuthCookies(res);

      // Retourner succès pour la sécurité
      return {
        message: 'Logged out successfully',
      };
    }
  }

  /**
   * 🍪 Définit les cookies d'authentification pour le login
   */
  private setAuthCookies(res: Response, loginResult: any): void {
    const { tokens, cookieSettings } = loginResult;

    const baseOptions = {
      httpOnly: true,
      secure: cookieSettings.isProduction,
      sameSite: 'strict' as const,
    };

    // Cookie Access Token
    res.cookie('access_token', tokens.accessToken, {
      ...baseOptions,
      maxAge: cookieSettings.accessTokenMaxAge,
    });

    // Cookie Refresh Token
    res.cookie('refresh_token', tokens.refreshToken, {
      ...baseOptions,
      maxAge: cookieSettings.refreshTokenMaxAge,
    });

    this.logger.debug('Auth cookies set successfully');
  }

  /**
   * 🔄 Définit les cookies d'authentification pour le refresh
   */
  private setRefreshCookies(res: Response, refreshResult: any): void {
    const { tokens, cookieSettings } = refreshResult;

    const baseOptions = {
      httpOnly: true,
      secure: cookieSettings.isProduction,
      sameSite: 'strict' as const,
    };

    // Nouveau Access Token
    res.cookie('access_token', tokens.accessToken, {
      ...baseOptions,
      maxAge: cookieSettings.accessTokenMaxAge,
    });

    // Nouveau Refresh Token
    res.cookie('refresh_token', tokens.refreshToken, {
      ...baseOptions,
      maxAge: cookieSettings.refreshTokenMaxAge,
    });

    this.logger.debug('Auth cookies refreshed successfully');
  }

  /**
   * 🧹 Nettoie les cookies d'authentification
   */
  private clearAuthCookies(res: Response, isProduction?: boolean): void {
    const clearOptions = {
      httpOnly: true,
      secure: isProduction ?? false,
      sameSite: 'strict' as const,
    };

    res.clearCookie('access_token', clearOptions);
    res.clearCookie('refresh_token', clearOptions);

    this.logger.debug('Auth cookies cleared');
  }
}
