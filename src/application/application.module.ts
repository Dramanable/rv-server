/**
 * 🏛️ APPLICATION MODULE     // 🔐 Authentication Use Cases
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useFactory: (userRepo, passwordHasher, authService, configService, logger, i18n, userCacheService) =>
        new LoginUseCase(userRepo, passwordHasher, authService, configService, logger, i18n, userCacheService),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_HASHER,
        TOKENS.AUTH_SERVICE,
        TOKENS.CONFIG_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE,
      ],
    },ayer
 * ✅ Clean Architecture compliant
 * ✅ Services purs de la couche application
 */

import { Module } from '@nestjs/common';
import { TOKENS } from '../shared/constants/injection-tokens';
import { UserCacheService } from './services/user-cache.service';

// 💼 Use Cases
import { LoginUseCase } from './use-cases/auth/login.use-case';
import { LogoutUseCase } from './use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from './use-cases/auth/refresh-token.use-case';
import { RegisterUseCase } from './use-cases/auth/register.use-case';
import { CreateUserUseCase } from './use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from './use-cases/users/delete-user.use-case';
import { GetMeUseCase } from './use-cases/users/get-me.use-case';
import { GetUserByIdUseCase } from './use-cases/users/get-user-by-id.use-case';
import { ListUsersUseCase } from './use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from './use-cases/users/update-user.use-case';

@Module({
  providers: [
    // 💾 Service de cache utilisateur
    {
      provide: TOKENS.USER_CACHE_SERVICE,
      useClass: UserCacheService,
    },

    // � Authentication Use Cases
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useFactory: (
        userRepo,
        passwordService,
        authService,
        configService,
        logger,
        i18n,
        userCacheService,
      ) =>
        new LoginUseCase(
          userRepo,
          passwordService,
          authService,
          configService,
          logger,
          i18n,
          userCacheService,
        ),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_SERVICE,
        TOKENS.AUTH_SERVICE,
        TOKENS.CONFIG_SERVICE,
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
        TOKENS.CONFIG_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE,
      ],
    },
    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useFactory: (userRepo, authTokenService, logger, i18n) =>
        new RefreshTokenUseCase(userRepo, authTokenService, logger, i18n),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.AUTH_TOKEN_SERVICE,
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
        TOKENS.CONFIG_SERVICE,
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
  ],
  exports: [
    TOKENS.USER_CACHE_SERVICE,
    // 💼 Export des Use Cases
    TOKENS.LOGIN_USE_CASE,
    TOKENS.REGISTER_USE_CASE,
    TOKENS.REFRESH_TOKEN_USE_CASE,
    TOKENS.LOGOUT_USE_CASE,
    TOKENS.GET_USER_USE_CASE,
    TOKENS.LIST_USERS_USE_CASE,
  ],
})
export class ApplicationModule {}
