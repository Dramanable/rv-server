/**
 * 🏢 Get Business Use Case - Clean Architecture + SOLID
 *
 * Récupération d'une entreprise par ID avec vérification des permissions
 */

import { BusinessNotFoundError } from '../../../application/exceptions/application.exceptions';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import {
  AppContext,
  AppContextFactory,
} from '../../../shared/context/app-context';
import type { IPermissionService } from '../../ports/permission.service.interface';

export interface GetBusinessRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
}

export interface GetBusinessResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly primaryEmail: string;
  readonly primaryPhone: string;
  readonly logoUrl?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class GetBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: GetBusinessRequest): Promise<GetBusinessResponse> {
    // 1. Création du contexte d'opération
    const context: AppContext = AppContextFactory.create()
      .operation('GetBusiness')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.business.get_attempt'),
      context as unknown as Record<string, unknown>,
    );

    try {
      // 2. Vérification des permissions
      await this.validatePermissions(
        request.requestingUserId,
        request.businessId,
        context,
      );

      // 3. Récupération de l'entreprise
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);

      if (!business) {
        throw new BusinessNotFoundError(request.businessId, 'id');
      }

      // 4. Construction de la réponse
      const response: GetBusinessResponse = {
        id: business.id.getValue(),
        name: business.name.getValue(),
        description: business.description,
        status: business.status,
        primaryEmail: business.contactInfo.primaryEmail.getValue(),
        primaryPhone: business.contactInfo.primaryPhone.getValue(),
        logoUrl: business.branding?.logoUrl?.getUrl(),
        createdAt: business.createdAt,
        updatedAt: business.updatedAt,
      };

      this.logger.info(this.i18n.t('operations.business.get_success'), {
        ...context,
        businessId: business.id.getValue(),
      } as unknown as Record<string, unknown>);

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.get_failed'),
        error as Error,
        context as unknown as Record<string, unknown>,
      );
      throw error;
    }
  }

  /**
   * Validation des permissions pour la récupération d'entreprise
   */
  private async validatePermissions(
    requestingUserId: string,
    businessId: string,
    context: AppContext,
  ): Promise<void> {
    this.logger.info('Validating READ_BUSINESS permission', {
      requestingUserId,
      businessId,
      correlationId: context.correlationId,
    });

    try {
      await this.permissionService.requirePermission(
        requestingUserId,
        'READ_BUSINESS',
        {
          businessId,
          correlationId: context.correlationId,
        },
      );

      this.logger.info('READ_BUSINESS permission validated successfully', {
        requestingUserId,
        businessId,
        correlationId: context.correlationId,
      });
    } catch (error) {
      this.logger.error('READ_BUSINESS permission denied', error as Error, {
        requestingUserId,
        businessId,
        correlationId: context.correlationId,
      });
      throw error;
    }
  }
}
