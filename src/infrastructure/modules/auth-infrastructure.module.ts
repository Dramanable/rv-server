/**
 * 🏗️ Auth Infrastructure Module
 *
 * Module NestJS qui configure l'infrastructure d'authentification
 * Provides les implémentations concrètes des ports
 */

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

// Infrastructure Services
import { NestJsConfigServiceAdapter } from "../config/nestjs-config.adapter";
import { BcryptPasswordHasher } from "../services/bcrypt-password-hasher.service"; // ✅ NOUVEAU: Clean Architecture
import { BcryptPasswordService } from "../services/bcrypt-password.service";
import { JwtAuthenticationService } from "../services/jwt-authentication.service";

// Application Ports

// Note: Use Cases are imported and configured in PresentationModule

// Shared Constants
import { TOKENS } from "../../shared/constants/injection-tokens";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("ACCESS_TOKEN_SECRET"),
        signOptions: {
          expiresIn: `${configService.get<number>("ACCESS_TOKEN_EXPIRATION", 3600)}s`,
        },
      }),
      inject: [ConfigService],
    }),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  providers: [
    // Config Service Adapter
    {
      provide: TOKENS.APP_CONFIG,
      useClass: NestJsConfigServiceAdapter,
    },

    // Authentication Service
    {
      provide: TOKENS.AUTH_SERVICE,
      useClass: JwtAuthenticationService,
    },

    // Password Service
    {
      provide: TOKENS.PASSWORD_SERVICE,
      useClass: BcryptPasswordService,
    },

    // Password Hasher Service ✅ NOUVEAU: Clean Architecture
    {
      provide: TOKENS.PASSWORD_HASHER,
      useClass: BcryptPasswordHasher,
    },

    // I18n Service (mock implementation for now)
    {
      provide: TOKENS.I18N_SERVICE,
      useFactory: () => ({
        t: (key: string, params?: any) => key, // Simple mock
        translate: (key: string, params?: any) => key,
        setDefaultLanguage: (lang: string) => {},
        exists: (key: string) => true,
      }),
    },

    // Note: Use Cases are handled in PresentationModule with proper DI
  ],
  exports: [
    TOKENS.AUTH_SERVICE,
    TOKENS.PASSWORD_SERVICE,
    TOKENS.PASSWORD_HASHER,
    TOKENS.APP_CONFIG,
    TOKENS.I18N_SERVICE,
    JwtModule, // ✅ Export JwtModule pour JwtService
    PassportModule, // ✅ Export PassportModule si nécessaire
  ],
})
export class AuthInfrastructureModule {}
