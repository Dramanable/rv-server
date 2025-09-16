/**
 * 🔌 NESTJS ADAPTER - Create User Use Case
 * ✅ Clean Architecture compliant
 * ✅ Framework isolation dans la couche Presentation
 * ✅ Delegation vers Use Case pur
 */

import { Injectable, Inject } from '@nestjs/common';
import { CreateUserUseCase, CreateUserRequest, CreateUserResponse } from '../../../application/use-cases/users/create-user.use-case';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import type { Logger } from '../../../application/ports/logger.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import { USER_REPOSITORY } from '../../../domain/repositories';

/**
 * Adapter NestJS pour isoler le framework du Use Case pur
 */
@Injectable()
export class CreateUserAdapter {
  private useCase: CreateUserUseCase;

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @Inject('Logger')
    private readonly logger: Logger,
    @Inject('I18nService')
    private readonly i18n: I18nService,
  ) {
    // Instancier le Use Case pur avec les dépendances injectées
    this.useCase = new CreateUserUseCase(
      this.userRepository,
      this.logger,
      this.i18n,
    );
  }

  /**
   * Point d'entrée pour l'exécution du Use Case
   */
  async execute(request: CreateUserRequest): Promise<CreateUserResponse> {
    return this.useCase.execute(request);
  }
}
