/**
 * 🔌 NESTJS ADAPTER - Create Business Use Case
 * ✅ Clean Architecture compliant
 * ✅ Framework isolation dans la couche Presentation
 * ✅ Delegation vers Use Case pur
 */

import { Injectable, Inject } from '@nestjs/common';
import { CreateBusinessUseCase, CreateBusinessRequest, CreateBusinessResponse } from '../../../application/use-cases/business/create-business.use-case';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import type { UserRepository } from "../../../domain/repositories/user.repository.interface";
import type { Logger } from '../../../application/ports/logger.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import { BUSINESS_REPOSITORY } from '../../../domain/repositories';

/**
 * Adapter NestJS pour isoler le framework du Use Case pur
 */
@Injectable()
export class CreateBusinessAdapter {
  private useCase: CreateBusinessUseCase;

  constructor(
    @Inject(BUSINESS_REPOSITORY)
    private readonly businessRepository: BusinessRepository,
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('Logger')
    private readonly logger: Logger,
    @Inject('I18nService')
    private readonly i18n: I18nService,
  ) {
    // Instancier le Use Case pur avec les dépendances injectées
    this.useCase = new CreateBusinessUseCase(
      this.businessRepository,
      this.userRepository,
      this.logger,
      this.i18n,
    );
  }

  /**
   * Point d'entrée pour l'exécution du Use Case
   */
  async execute(request: CreateBusinessRequest): Promise<CreateBusinessResponse> {
    return this.useCase.execute(request);
  }
}
