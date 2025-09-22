/**
 * 🏢 Create Business Use Case - Clean Architecture + SOLID
 *
 * ✅ COUCHE APPLICATION PURE - Sans dépendance NestJS
 * ✅ Dependency Inversion Principle respecté
 * ✅ Interface-driven design
 */
import {
  BusinessAlreadyExistsError,
  BusinessValidationError,
  InsufficientPermissionsError,
} from '../../../application/exceptions/application.exceptions';
import type { I18nService } from '../../../application/ports/i18n.port';
import type { Logger } from '../../../application/ports/logger.port';
import type { UserRepository } from '../../../domain/repositories/user.repository.interface';
import {
  Business,
  BusinessSector,
  BusinessStatus,
} from '../../../domain/entities/business.entity';
import type { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import { Address } from '../../../domain/value-objects/address.value-object';
import { BusinessName } from '../../../domain/value-objects/business-name.value-object';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Phone } from '../../../domain/value-objects/phone.value-object';
import {
  AppContext,
  AppContextFactory,
} from '../../../shared/context/app-context';
import { UserRole } from '../../../shared/enums/user-role.enum';

export interface CreateBusinessRequest {
  readonly requestingUserId: string;
  readonly name: string;
  readonly description: string;
  readonly slogan?: string;
  readonly sectorId?: string;
  readonly address: {
    readonly street: string;
    readonly city: string;
    readonly postalCode: string;
    readonly country: string;
    readonly region?: string;
  };
  readonly contactInfo: {
    readonly primaryEmail: string;
    readonly secondaryEmails?: string[];
    readonly primaryPhone: string;
    readonly secondaryPhones?: string[];
    readonly website?: string;
    readonly socialMedia?: {
      readonly facebook?: string;
      readonly instagram?: string;
      readonly linkedin?: string;
      readonly twitter?: string;
    };
  };
  readonly settings?: {
    readonly timezone?: string;
    readonly currency?: string;
    readonly language?: string;
    readonly appointmentSettings?: {
      readonly defaultDuration?: number;
      readonly bufferTime?: number;
      readonly advanceBookingLimit?: number;
      readonly cancellationPolicy?: string;
    };
    readonly notificationSettings?: {
      readonly emailNotifications?: boolean;
      readonly smsNotifications?: boolean;
      readonly reminderTime?: number;
    };
  };
}

export interface CreateBusinessResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly sector: BusinessSector | null;
  readonly status: BusinessStatus;
  readonly createdAt: Date;
}

/**
 * ✅ PURE APPLICATION USE CASE
 * ❌ No NestJS dependencies
 * ✅ Constructor Injection via interfaces only
 */
export class CreateBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly userRepository: UserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: CreateBusinessRequest,
  ): Promise<CreateBusinessResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('CreateBusiness')
      .requestingUser(request.requestingUserId)
      .build();

    this.logger.info(
      this.i18n.t('operations.business.creation_attempt'),
      context as any,
    );

    try {
      // 2. Validation des permissions
      await this.validatePermissions(request.requestingUserId, context);

      // 3. Validation des règles métier
      await this.validateBusinessRules(request, context);

      // 4. Création des Value Objects
      const address = Address.create({
        street: request.address.street,
        city: request.address.city,
        postalCode: request.address.postalCode,
        country: request.address.country,
        region: request.address.region,
      });

      const contactInfo = {
        primaryEmail: Email.create(request.contactInfo.primaryEmail),
        secondaryEmails: request.contactInfo.secondaryEmails?.map((email) =>
          Email.create(email),
        ),
        primaryPhone: Phone.create(request.contactInfo.primaryPhone),
        secondaryPhones: request.contactInfo.secondaryPhones?.map((phone) =>
          Phone.create(phone),
        ),
        website: request.contactInfo.website,
        socialMedia: request.contactInfo.socialMedia,
      };

      // 5. Création de l'entité Business
      const business = Business.create({
        name: request.name,
        description: request.description,
        slogan: request.slogan,
        sector: null, // TODO: Load sector from request.sectorId
        address,
        contactInfo,
      });

      // 6. Persistance
      await this.businessRepository.save(business);

      // 7. Réponse typée
      const response: CreateBusinessResponse = {
        id: business.id.getValue(),
        name: business.name.getValue(),
        description: business.description,
        sector: business.sector,
        status: business.status,
        createdAt: business.createdAt,
      };

      this.logger.info(this.i18n.t('operations.business.creation_success'), {
        ...(context as any),
        businessId: business.id.getValue(),
      });

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.creation_failed', {
          error: (error as Error).message,
        }),
        context as any,
      );
      throw error;
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        requestingUserId,
        'CREATE_BUSINESS',
        'business',
      );
    }

    // Seuls les admins et propriétaires peuvent créer des entreprises
    const allowedRoles = [UserRole.PLATFORM_ADMIN, UserRole.BUSINESS_OWNER];

    if (!allowedRoles.includes(requestingUser.role)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId,
        requestingUserRole: requestingUser.role,
        requiredPermissions: 'CREATE_BUSINESS',
      });
      throw new InsufficientPermissionsError(
        requestingUserId,
        'CREATE_BUSINESS',
        'business',
      );
    }
  }

  private async validateBusinessRules(
    request: CreateBusinessRequest,
    context: AppContext,
  ): Promise<void> {
    // Validation du nom d'entreprise
    if (request.name.length < 3) {
      throw new BusinessValidationError(
        'name',
        request.name,
        'Business name must be at least 3 characters long',
      );
    }

    if (request.name.length > 100) {
      throw new BusinessValidationError(
        'name',
        request.name,
        'Business name cannot exceed 100 characters',
      );
    }

    // Vérification de l'unicité du nom
    const businessName = BusinessName.create(request.name.trim());
    const existingBusiness =
      await this.businessRepository.existsByName(businessName);

    if (existingBusiness) {
      this.logger.warn(this.i18n.t('warnings.business.name_already_exists'), {
        ...context,
        businessName: request.name,
      });
      throw new BusinessAlreadyExistsError(request.name, 'name');
    }

    // Validation de l'email
    try {
      Email.create(request.contactInfo.primaryEmail);
    } catch (error) {
      throw new BusinessValidationError(
        'primaryEmail',
        request.contactInfo.primaryEmail,
        'Invalid primary email address',
      );
    }

    // Validation du téléphone
    try {
      Phone.create(request.contactInfo.primaryPhone);
    } catch (error) {
      throw new BusinessValidationError(
        'primaryPhone',
        request.contactInfo.primaryPhone,
        'Invalid primary phone number',
      );
    }

    // Validation de l'adresse
    if (
      !request.address.street ||
      !request.address.city ||
      !request.address.postalCode ||
      !request.address.country
    ) {
      throw new BusinessValidationError(
        'address',
        JSON.stringify(request.address),
        'Complete address is required (street, city, postal code, country)',
      );
    }
  }
}
