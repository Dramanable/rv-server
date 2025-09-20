/**
 * 🎭 Authentication Controller - Presentation Layer
 *
 * Contrôleur REST pour l'authentification (login, refresh, logout)
 * Gère les cookies HTTP et orchestre les use cases
 */

import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { getUserIdFromRequestSafe } from '../../shared/types/request.types';
import { Throttle } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import type { I18nService } from '../../application/ports/i18n.port';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { RegisterUseCase } from '../../application/use-cases/auth/register.use-case';
import { TOKENS } from '../../shared/constants/injection-tokens';
import {
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  LogoutResponseDto,
  RefreshResponseDto,
  RefreshTokenDto,
  RegisterDto,
  RegisterResponseDto,
  ThrottleErrorDto,
  UnauthorizedErrorDto,
  ValidationErrorDto,
} from '../dtos/auth.dto';
import { PresentationCookieService } from '../services/cookie.service';
// 🛡️ Security imports
import { Public } from '../security/decorators/public.decorator';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
// import { CustomThrottlerGuard } from '../security/throttler.guard';
import { SecurityValidationPipe } from '../security/validation.pipe';

@ApiTags('Authentication')
@Controller('auth')
// @UseGuards(CustomThrottlerGuard) // 🛡️ Rate limiting global pour auth - Temporarily disabled
@UsePipes(SecurityValidationPipe) // 🛡️ Validation/sanitization globale
export class AuthController {
  private readonly controllerLogger = new Logger(AuthController.name);

  constructor(
    @Inject(TOKENS.LOGIN_USE_CASE)
    private readonly loginUseCase: LoginUseCase,
    @Inject(TOKENS.REGISTER_USE_CASE)
    private readonly registerUseCase: RegisterUseCase,
    @Inject(TOKENS.REFRESH_TOKEN_USE_CASE)
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    @Inject(TOKENS.LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
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
    description:
      '✅ Login successful - Secure JWT tokens set in HttpOnly cookies with appropriate security flags',
    type: LoginResponseDto,
    headers: {
      'Set-Cookie': {
        description:
          'Secure authentication cookies: accessToken (15min) and refreshToken (7-30 days)',
        schema: {
          type: 'string',
          example:
            'accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ Validation errors in request data',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 401,
    description: '🔒 Authentication failed - Invalid email or password',
    type: UnauthorizedErrorDto,
  })
  @ApiResponse({
    status: 429,
    description: '🚫 Rate limit exceeded - Too many login attempts',
    type: ThrottleErrorDto,
  })
  @ApiResponse({
    status: 500,
    description: '� Internal server error during authentication',
    schema: {
      properties: {
        message: { type: 'string', example: 'Internal server error' },
        error: {
          type: 'string',
          example: 'Authentication service unavailable',
        },
        statusCode: { type: 'number', example: 500 },
      },
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // 🌍 Log avec i18n
    const loginAttemptMessage = this.i18n.t('operations.auth.login_attempt', {
      email: loginDto.email,
    });
    this.controllerLogger.log(loginAttemptMessage);
    this.logger.log(
      `${loginAttemptMessage} - IP: ${req.ip} - UserAgent: ${req.get('User-Agent')}`,
    );

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

      // 🌍 Message de succès avec i18n
      const successMessage = this.i18n.t('success.auth.login_success', {
        email: loginDto.email,
        userId: result.user.id,
      });
      this.logger.log(successMessage);

      // Retourner la réponse (sans les tokens sensibles)
      res.status(200).json({
        user: result.user,
        message: this.i18n.t('auth.login_success', { email: loginDto.email }),
      });
    } catch (error) {
      // 🌍 Message d'erreur avec i18n
      const errorMessage = this.i18n.t('auth.login_failed', {
        email: loginDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.controllerLogger.error(errorMessage, error);
      this.logger.error(errorMessage, error);
      throw error;
    }
  }

  @Post('register')
  @Public() // 🔓 Endpoint public - inscription ouverte
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 🛡️ 3 inscriptions max par 5 minutes
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '📝 User Registration',
    description:
      'Register new user account with email/password and return secure JWT cookies',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description:
      '✅ Registration successful - New user account created and automatically logged in with secure cookies',
    type: RegisterResponseDto,
    headers: {
      'Set-Cookie': {
        description:
          'Secure authentication cookies set automatically after successful registration',
        schema: {
          type: 'string',
          example:
            'accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '❌ Registration failed - Validation errors or email already exists',
    type: ValidationErrorDto,
  })
  @ApiResponse({
    status: 409,
    description: '⚠️ Conflict - Email address already registered',
    schema: {
      properties: {
        message: { type: 'string', example: 'Email already exists' },
        error: { type: 'string', example: 'Conflict' },
        statusCode: { type: 'number', example: 409 },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description:
      '🚫 Rate limit exceeded - Too many registration attempts from this IP',
    type: ThrottleErrorDto,
  })
  async register(
    @Body() registerDto: RegisterDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // 🌍 Log avec i18n
    const registerAttemptMessage = this.i18n.t(
      'operations.user.creation_attempt',
    );
    this.controllerLogger.log(
      `${registerAttemptMessage} - ${registerDto.email}`,
    );
    this.logger.log(
      `${registerAttemptMessage} - Email: ${registerDto.email} - IP: ${req.ip}`,
    );

    try {
      // Exécuter le use case PURE (Application Layer)
      const result = await this.registerUseCase.execute({
        email: registerDto.email,
        name: registerDto.name,
        password: registerDto.password,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      // ✅ Gestion des cookies dans la couche Presentation UNIQUEMENT
      this.cookieService.setAuthenticationCookies(
        res,
        result.tokens,
        registerDto.rememberMe || false,
      );

      // 🌍 Message de succès avec i18n
      const successMessage = this.i18n.t('success.user.creation_success', {
        email: registerDto.email,
        requestingUser: 'self',
      });
      this.logger.log(successMessage);

      // Retourner la réponse (sans les tokens sensibles)
      res.status(201).json({
        user: result.user,
        message: this.i18n.t('auth.register_success', {
          email: registerDto.email,
        }),
      });
    } catch (error) {
      // 🌍 Message d'erreur avec i18n
      const errorMessage = this.i18n.t('auth.register_failed', {
        email: registerDto.email,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      this.controllerLogger.error(errorMessage, error);
      this.logger.error(errorMessage, error);
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
    description:
      '✅ Tokens refreshed successfully - New access token generated and both tokens rotated in secure cookies',
    type: RefreshResponseDto,
    headers: {
      'Set-Cookie': {
        description:
          'Updated secure authentication cookies with new rotated tokens',
        schema: {
          type: 'string',
          example:
            'accessToken=eyJhbGc...; HttpOnly; Secure; SameSite=Strict; Path=/',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      '🔒 Refresh failed - Invalid, expired, or missing refresh token in cookies',
    type: UnauthorizedErrorDto,
  })
  @ApiResponse({
    status: 429,
    description: '🚫 Rate limit exceeded - Too many refresh attempts',
    type: ThrottleErrorDto,
  })
  async refreshToken(@Req() req: Request, @Res() res: Response): Promise<void> {
    this.controllerLogger.log('Refresh token attempt');

    try {
      // Extraire le refresh token des cookies sécurisés
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        this.controllerLogger.warn('No refresh token found in cookies');
        throw new UnauthorizedException({
          message: 'Refresh token not found',
          error: 'No refresh token provided in cookies',
        });
      }

      // Exécuter le refresh token use case PURE (Application Layer)
      const result = await this.refreshTokenUseCase.execute({
        refreshToken,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
      });

      // ✅ Gestion des cookies dans la couche Presentation UNIQUEMENT
      this.cookieService.setAuthenticationCookies(
        res,
        {
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
        },
        false, // pas de remember me pour refresh
      );

      // Retourner la réponse (sans les tokens sensibles)
      res.status(200).json({
        message: result.message,
      });
    } catch (error) {
      this.controllerLogger.error('Refresh token failed', error);
      throw error;
    }
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
    description:
      '✅ Logout successful - All authentication cookies cleared and tokens revoked from server',
    type: LogoutResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'Authentication cookies cleared with secure flags',
        schema: {
          type: 'string',
          example:
            'accessToken=; HttpOnly; Secure; SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description:
      '🔒 Authentication required - Valid JWT token needed in cookies',
    type: UnauthorizedErrorDto,
  })
  @ApiResponse({
    status: 429,
    description: '🚫 Rate limit exceeded - Too many logout attempts',
    type: ThrottleErrorDto,
  })
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
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

    return Promise.resolve();
  }
}
