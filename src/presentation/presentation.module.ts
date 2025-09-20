/**
 * 🎨 PRESENTATION MODULE - Couche de presentation Clean Architecture
 * ✅ Controllers HTTP
 * ✅ Security Guards & Pipes
 * ✅ Use Cases injection
 * ✅ Swagger configuration
 */

import { Module } from '@nestjs/common';

// 🏗️ Modules d'infrastructure
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

// 📝 Tokens pour l'injection de dépendances
import { TOKENS } from '@shared/constants/injection-tokens';

// 💼 Use Cases pour l'inversion de dépendances (Presentation Layer responsability)
// Auth Use Cases
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import { RegisterUseCase } from '@application/use-cases/auth/register.use-case';

// User Use Cases
import { GetMeUseCase } from '@application/use-cases/users/get-me.use-case';
import { ListUsersUseCase } from '@application/use-cases/users/list-users.use-case';
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user.use-case';

// Business Sector Use Cases
import { CreateBusinessSectorUseCase } from '@application/use-cases/business-sectors/create-business-sector.use-case';
import { ListBusinessSectorsUseCase } from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import { UpdateBusinessSectorUseCase } from '@application/use-cases/business-sectors/update-business-sector.use-case';
import { DeleteBusinessSectorUseCase } from '@application/use-cases/business-sectors/delete-business-sector.use-case';

// 🎮 Controllers
import { AuthController } from './controllers/auth.controller';
import { BusinessController } from './controllers/business.controller';
import { BusinessSectorController } from './controllers/business-sector.controller';
import { HealthController } from './controllers/health.controller';
import { UserController } from './controllers/user.controller';

// 🛡️ Security
import { JwtAuthGuard } from './security/auth.guard';
import { SecurityValidationPipe } from './security/validation.pipe';

// 🔧 Services
import { MockI18nService } from '@application/mocks/mock-i18n.service';
import { PresentationCookieService } from './services/cookie.service';

@Module({
  imports: [
    // 🏗️ Infrastructure module pour tous les services nécessaires
    InfrastructureModule,
  ],
  controllers: [
    AuthController,
    UserController,
    BusinessController,
    BusinessSectorController,
    HealthController,
  ],
  providers: [
    // 🛡️ Security providers
    JwtAuthGuard,
    SecurityValidationPipe,

    // 🍪 Cookie Service
    PresentationCookieService,

    // 🌍 I18n Service avec token d'injection
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: MockI18nService,
    },

    // 💼 USE CASES - Inversion de Dépendances (Presentation Layer responsability)
    // 📋 Authentication Use Cases
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useFactory: (
        userRepo,
        passwordHasher,
        authService,
        configService,
        logger,
        i18n,
        userCacheService,
      ) =>
        new LoginUseCase(
          userRepo,
          passwordHasher,
          authService,
          configService,
          logger,
          i18n,
          userCacheService,
        ),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_HASHER,
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE,
      ],
    },
    {
      provide: TOKENS.REGISTER_USE_CASE,
      useFactory: (
        userRepo,
        passwordHasher,
        authService,
        configService,
        logger,
        i18n,
        userCacheService,
      ) =>
        new RegisterUseCase(
          userRepo,
          passwordHasher,
          authService,
          configService,
          logger,
          i18n,
          userCacheService,
        ),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_HASHER,
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE,
      ],
    },
    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useFactory: (authService, configService, logger, i18n) =>
        new RefreshTokenUseCase(authService, configService, logger, i18n),
      inject: [
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.LOGOUT_USE_CASE,
      useFactory: (authService, configService, logger, i18n) =>
        new LogoutUseCase(authService, configService, logger, i18n),
      inject: [
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    // 👤 User Management Use Cases
    {
      provide: TOKENS.GET_ME_USE_CASE,
      useFactory: () => new GetMeUseCase(),
      inject: [],
    },
    {
      provide: TOKENS.LIST_USERS_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new ListUsersUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.CREATE_USER_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new CreateUserUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.GET_USER_BY_ID_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new GetUserByIdUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.UPDATE_USER_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new UpdateUserUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.DELETE_USER_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new DeleteUserUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },

    // 🏢 Business Sector Use Cases
    {
      provide: TOKENS.CREATE_BUSINESS_SECTOR_USE_CASE,
      useFactory: (businessSectorRepo, logger, i18n, permissionService) =>
        new CreateBusinessSectorUseCase(
          businessSectorRepo,
          logger,
          i18n,
          permissionService,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_BUSINESS_SECTORS_USE_CASE,
      useFactory: (businessSectorRepo, permissionService, logger, i18n) =>
        new ListBusinessSectorsUseCase(
          businessSectorRepo,
          permissionService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_BUSINESS_SECTOR_USE_CASE,
      useFactory: (businessSectorRepo, logger, i18n, permissionService) =>
        new UpdateBusinessSectorUseCase(
          businessSectorRepo,
          logger,
          i18n,
          permissionService,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_BUSINESS_SECTOR_USE_CASE,
      useFactory: (businessSectorRepo, permissionService, logger) =>
        new DeleteBusinessSectorUseCase(
          businessSectorRepo,
          permissionService,
          logger,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
      ],
    },
  ],
  exports: [JwtAuthGuard, SecurityValidationPipe],
})
export class PresentationModule {}
