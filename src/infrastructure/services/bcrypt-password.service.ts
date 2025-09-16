/**
 * 🔐 BcryptPasswordService - TDD GREEN Phase
 *
 * Service bcrypt pour hachage et vérification des mots de passe
 */

import { Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IConfigService } from '../../application/ports/config.port';
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { TOKENS } from '../../shared/constants/injection-tokens';

@Injectable()
export class BcryptPasswordService {
  constructor(
    @Inject(TOKENS.PINO_LOGGER)
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE)
    private readonly i18n: I18nService,
    @Inject(TOKENS.APP_CONFIG)
    private readonly config: IConfigService,
  ) {}

  async hash(plainPassword: string): Promise<string> {
    const context = {
      operation: 'HASH_PASSWORD',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(this.i18n.t('operations.password.hash_attempt'), context);

    try {
      const saltRounds = this.config.getBcryptRounds();
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      this.logger.info(this.i18n.t('operations.password.hash_success'), {
        ...context,
        saltRounds,
      });

      return hashedPassword;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.password.hash_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }

  async compare(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const context = {
      operation: 'COMPARE_PASSWORD',
      timestamp: new Date().toISOString(),
    };

    this.logger.info(
      this.i18n.t('operations.password.compare_attempt'),
      context,
    );

    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

      this.logger.info(this.i18n.t('operations.password.compare_success'), {
        ...context,
        result: isMatch ? 'match' : 'no_match',
      });

      return isMatch;
    } catch (error) {
      this.logger.error(
        this.i18n.t('errors.password.compare_failed'),
        error as Error,
        context,
      );
      throw error;
    }
  }
}
