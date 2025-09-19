/**
 * 🎨 PRESENTATION MODULE - Couche de presentation Clean Architecture
 * ✅ Controllers HTTP
 * ✅ Security Guards & Pipes
 * ✅ Use Cases injection
 * ✅ Swagger configuration
 */

import { Module } from '@nestjs/common';

// 🎮 Controllers
import { AuthController } from './controllers/auth.controller';
import { BusinessController } from './controllers/business.controller';
import { HealthController } from './controllers/health.controller';
import { UserController } from './controllers/user.controller';

// 🛡️ Security
import { JwtAuthGuard } from './security/auth.guard';
import { SecurityValidationPipe } from './security/validation.pipe';

// 💼 Use Cases
import { LoginUseCase } from '../application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '../application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '../application/use-cases/auth/refresh-token.use-case';
import { RegisterUseCase } from '../application/use-cases/auth/register.use-case';
import { ListBusinessUseCase } from '../application/use-cases/business/list-business.use-case';
import { GetMeUseCase } from '../application/use-cases/users/get-me.use-case';

// 🔧 Services
import { MockI18nService } from '../application/mocks/mock-i18n.service';

// 📝 Tokens
import { TOKENS } from '../shared/constants/tokens.constant';

@Module({
  controllers: [
    AuthController,
    UserController,
    BusinessController,
    HealthController,
  ],
  providers: [
    // 🛡️ Security providers
    JwtAuthGuard,
    SecurityValidationPipe,

    // 💼 Use Cases avec tokens d'injection
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
    {
      provide: TOKENS.GET_ME_USE_CASE,
      useClass: GetMeUseCase,
    },
    {
      provide: TOKENS.LIST_BUSINESS_USE_CASE,
      useClass: ListBusinessUseCase,
    },

    // 🌍 I18n Service avec token d'injection
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: MockI18nService,
    },
  ],
  exports: [JwtAuthGuard, SecurityValidationPipe],
})
export class PresentationModule {}
