/**
 * 🏗️ INFRASTRUCTURE - Pino Logger Module
 *
 * Configuration NestJS pour l'intégration Pino
 * Logging structuré pour la Clean Architecture
 */

import { Global, Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { pinoConfig } from './pino-logger.config';
import { AppConfigService } from '../config/app-config.service';
import { PinoLoggerService } from './pino-logger.service';

@Global()
@Module({
  imports: [LoggerModule.forRoot(pinoConfig)],
  providers: [
    AppConfigService,
    PinoLoggerService,
    {
      provide: TOKENS.LOGGER,
      useClass: PinoLoggerService,
    },
    {
      provide: TOKENS.PINO_LOGGER,
      useClass: PinoLoggerService,
    },
  ],
  exports: [TOKENS.LOGGER, TOKENS.PINO_LOGGER, PinoLoggerService],
})
export class PinoLoggerModule {}
