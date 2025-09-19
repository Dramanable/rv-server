/**
 * PRESENTATION MODULE - Couche de presentation complete
 *
 * Cont    // 💼 Use Cases avec tokens d'injection
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useClass: LoginUseCase,
    },
    {
      provide: TOKENS.REGISTER_USE_CASE,
      useClass: RegisterUseCase,
    },
    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useClass: RefreshTokenUseCase,
    },
    {
      provide: TOKENS.LOGOUT_USE_CASE,
      useClass: LogoutUseCase,
    },

    // 🌍 I18n Service avec token d'injection
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: MockI18nService,
    },posants de la couche presentation :
 * - Controleurs HTTP
 * - Services de presentation (cookies, etc.)
 * - Strategies d'authentification Passport.js
 * - Guards de securite
 * - Configuration Swagger
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';

// Import Infrastructure Module for dependencies
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { MockI18nService } from '../infrastructure/i18n/i18n.service';

// Application Use Cases
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { RegisterUseCase } from '../application/use-cases/auth/register.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';

// Controllers
import { AuthController } from './controllers/auth.controller';

// Services
import { PresentationCookieService } from './services/cookie.service';

// Security components
import { JwtStrategy } from './security/strategies/jwt.strategy';
import { LocalStrategy } from './security/strategies/local.strategy';
import { JwtAuthGuard } from './security/guards/jwt-auth.guard';
import { LocalAuthGuard } from './security/guards/local-auth.guard';
import { CustomThrottlerGuard } from './security/throttler.guard';
import { SecurityValidationPipe } from './security/validation.pipe';

// Constants
import { TOKENS } from '../shared/constants/injection-tokens';

@Module({
  imports: [
    // Passport configuration
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false, // Stateless JWT authentication
    }),
    ConfigModule,
    
    // Infrastructure dependencies for strategies
    InfrastructureModule,
  ],
  controllers: [AuthController],
  providers: [
    // Presentation services
    PresentationCookieService,

    // Authentication strategies
    JwtStrategy,
    LocalStrategy,

    // Security guards
    JwtAuthGuard,
    LocalAuthGuard,

    // Security components
    CustomThrottlerGuard,
    SecurityValidationPipe,

    // Use Cases avec tokens d'injection
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useClass: LoginUseCase,
    },
    {
      provide: TOKENS.REGISTER_USE_CASE,
      useClass: RegisterUseCase,
    },
    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useClass: RefreshTokenUseCase,
    },
    {
      provide: TOKENS.LOGOUT_USE_CASE,
      useClass: LogoutUseCase,
    },
  ],
  exports: [
    // Services exportes pour utilisation dans d'autres modules
    PresentationCookieService,

    // Guards exportes pour utilisation globale
    JwtAuthGuard,
    LocalAuthGuard,

    // Security components exportes
    CustomThrottlerGuard,
    SecurityValidationPipe,
  ],
})
export class PresentationModule {}
