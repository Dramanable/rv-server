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
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiSecurity,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { LoginDto, RefreshTokenDto, LogoutDto } from '../dtos/auth.dto';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { PresentationCookieService } from '../services/cookie.service';
// 🛡️ Security imports
import { CustomThrottlerGuard } from '../security/throttler.guard';
import { SecurityValidationPipe } from '../security/validation.pipe';
import { Public, JwtAuthGuard } from '../security/auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(CustomThrottlerGuard) // 🛡️ Rate limiting global pour auth
@UsePipes(SecurityValidationPipe) // 🛡️ Validation/sanitization globale
export class AuthController {
  private readonly controllerLogger = new Logger(AuthController.name);

  constructor(
    @Inject(TOKENS.LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    @Inject(TOKENS.LOGOUT_USE_CASE)
    private readonly logoutUseCase: LogoutUseCase,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    private readonly cookieService: PresentationCookieService,
  ) {}

  @Post('login')
  @Public() // 🔓 Endpoint public - pas besoin d'authentification
  @Throttle({ default: { limit: 5, ttl: 300000 } }) // 🛡️ 5 tentatives max par 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔐 User Login',
    description:
      'Authenticate user with email/password and return secure JWT cookies',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: '✅ Login successful - Secure cookies set',
    schema: {
      properties: {
        message: { type: 'string', example: 'Login successful' },
        user: {
          type: 'object',
          example: {
            id: 'user-123',
            email: 'user@example.com',
            name: 'John Doe',
            role: 'USER',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ Invalid credentials',
    schema: {
      properties: {
        message: { type: 'string', example: 'Invalid credentials' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: '🚫 Too many login attempts',
    schema: {
      properties: {
        message: { type: 'string', example: 'Too many login attempts' },
        retryAfter: { type: 'number', example: 300 },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    this.controllerLogger.log(`Login attempt for email: ${loginDto.email}`);

    try {
      // Exécuter le use case PURE (Application Layer)
      const result = await this.loginUseCase.execute({
        email: loginDto.email,
        password: loginDto.password,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      // ✅ Gestion des cookies dans la couche Presentation UNIQUEMENT
      this.cookieService.setAuthenticationCookies(
        res,
        result.tokens,
        loginDto.rememberMe || false,
      );

      // Retourner la réponse (sans les tokens sensibles)
      res.status(200).json({
        user: result.user,
        message: result.message,
      });
    } catch (error) {
      this.controllerLogger.error(`Login failed for ${loginDto.email}`, error);
      throw error;
    }
  }

  @Post('refresh')
  @Public() // 🔓 Public mais sécurisé par refresh token
  @Throttle({ default: { limit: 10, ttl: 300000 } }) // 🛡️ 10 refresh max par 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '🔄 Refresh Access Token',
    description:
      'Generate new access token using valid refresh token from secure cookie',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({
    status: 200,
    description: '✅ Token refreshed successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Token refreshed successfully' },
        user: {
          type: 'object',
          example: {
            id: 'user-123',
            email: 'user@example.com',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ Invalid or expired refresh token',
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Res() res: Response,
  ): Promise<void> {
    // TODO: Implémenter le refresh token use case
    throw new Error('RefreshToken endpoint not yet implemented');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard) // 🔐 Authentification requise pour logout
  @Throttle({ default: { limit: 20, ttl: 300000 } }) // 🛡️ 20 logout max par 5 minutes
  @HttpCode(HttpStatus.OK)
  @ApiSecurity('JWT') // 📄 Indique que l'endpoint nécessite JWT
  @ApiOperation({
    summary: '🚪 User Logout',
    description: 'Clear all authentication tokens and logout user securely',
  })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({
    status: 200,
    description: '✅ Logout successful - All cookies cleared',
    schema: {
      properties: {
        message: { type: 'string', example: 'Logout successful' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '❌ Authentication required',
  })
  async logout(
    @Body() logoutDto: LogoutDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // Supprimer les cookies d'authentification
    this.cookieService.clearAuthenticationCookies(res);

    // Log de l'action
    this.controllerLogger.log('User logged out successfully', {
      userId: (req as any).user?.id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });

    res.status(200).json({
      message: 'Logout successful',
    });
  }
}
