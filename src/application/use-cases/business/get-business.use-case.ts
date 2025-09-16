/**
 * 🏢 Get Business Use Case - Clean Architecture + SOLID
 * 
 * Récupération d'une entreprise par ID avec vérification des permissions
 */

import { Business } from '../../../domain/entities/business.entity';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import type { Logger } from '../../../application/ports/logger.port';
import type { I18nService } from '../../../application/ports/i18n.port';
import { AppContext, AppContextFactory } from '../../../shared/context/app-context';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { User } from '../../../domain/entities/user.entity';
import { UserRepository } from "../../../domain/repositories/user.repository.interface";
import { 
  InsufficientPermissionsError,
  BusinessNotFoundError
} from '../../../application/exceptions/application.exceptions';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';

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
    
    private readonly userRepository: UserRepository,
    
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
      await this.validatePermissions(request.requestingUserId, context);

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

      this.logger.info(
        this.i18n.t('operations.business.get_success'),
        {
          ...context,
          businessId: business.id.getValue(),
        } as unknown as Record<string, unknown>,
      );

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
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        requestingUserId,
        'VIEW_BUSINESS',
        'Business',
        context,
      );
    }

    // Rôles autorisés à voir les détails d'entreprise
    const allowedRoles = [
      UserRole.PLATFORM_ADMIN,
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
      UserRole.LOCATION_MANAGER,
    ];

    if (!allowedRoles.includes(requestingUser.role)) {
      throw new InsufficientPermissionsError(
        requestingUserId,
        'VIEW_BUSINESS',
        'Business',
        context,
      );
    }
  }
}
