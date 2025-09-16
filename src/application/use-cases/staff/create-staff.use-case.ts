/**
 * 👥 Create Staff Use Case - Clean Architecture + SOLID
 * 
 * Création d'un membre du personnel avec validation métier et permissions
 */

import { Inject, Injectable } from '@nestjs/common';
import { Staff } from '../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../domain/repositories/staff.repository.interface';
import { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import { Logger } from '../../../application/ports/logger.port';
import { I18nService } from '../../../application/ports/i18n.port';
import { AppContext, AppContextFactory } from '../../../shared/context/app-context';
import { UserRole, Permission } from '../../../shared/enums/user-role.enum';
import { StaffRole } from '../../../shared/enums/staff-role.enum';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../application/ports/user.repository.interface';
import { 
  InsufficientPermissionsError, 
  StaffValidationError,
  BusinessNotFoundError 
} from '../../../application/exceptions/application.exceptions';
import { Email } from '../../../domain/value-objects/email.value-object';
import { Phone } from '../../../domain/value-objects/phone.value-object';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';

export interface CreateStaffRequest {
  readonly requestingUserId: string;
  readonly businessId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly phone?: string;
  readonly role: StaffRole;
  readonly department?: string;
  readonly jobTitle?: string;
  readonly workingHours?: {
    readonly monday?: { start: string; end: string };
    readonly tuesday?: { start: string; end: string };
    readonly wednesday?: { start: string; end: string };
    readonly thursday?: { start: string; end: string };
    readonly friday?: { start: string; end: string };
    readonly saturday?: { start: string; end: string };
    readonly sunday?: { start: string; end: string };
  };
  readonly permissions?: {
    readonly canManageAppointments?: boolean;
    readonly canManageClients?: boolean;
    readonly canManageServices?: boolean;
    readonly canViewReports?: boolean;
    readonly canManageSchedule?: boolean;
  };
  readonly isActive?: boolean;
}

export interface CreateStaffResponse {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly email: string;
  readonly role: StaffRole;
  readonly businessId: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
}

@Injectable()
export class CreateStaffUseCase {
  constructor(
    @Inject('StaffRepository')
    private readonly staffRepository: StaffRepository,
    @Inject('BusinessRepository')
    private readonly businessRepository: BusinessRepository,
    @Inject('UserRepository')
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: CreateStaffRequest): Promise<CreateStaffResponse> {
    // 1. Context pour traçabilité
    const context: AppContext = AppContextFactory.create()
      .operation('CreateStaff')
      .requestingUser(request.requestingUserId)
      .businessEntity(request.businessId)
      .build();

    this.logger.info(
      this.i18n.t('operations.staff.creation_attempt'),
      context as Record<string, unknown>,
    );

    try {
      // 2. Validation des permissions
      await this.validatePermissions(
        request.requestingUserId,
        request.businessId,
        context,
      );

      // 3. Validation des règles métier
      await this.validateBusinessRules(request, context);

      // 4. Création de l'entité Staff
      const businessId = BusinessId.create(request.businessId);
      const email = Email.create(request.email);
      const phone = request.phone ? Phone.create(request.phone) : undefined;

      const staff = Staff.create(
        businessId,
        request.firstName.trim(),
        request.lastName.trim(),
        email,
        request.role,
        {
          phone,
          department: request.department?.trim(),
          jobTitle: request.jobTitle?.trim(),
          workingHours: request.workingHours,
          permissions: request.permissions,
          isActive: request.isActive ?? true,
        },
      );

      // 5. Persistance
      const savedStaff = await this.staffRepository.save(staff);

      // 6. Réponse typée
      const response: CreateStaffResponse = {
        id: savedStaff.id.getValue(),
        firstName: savedStaff.firstName,
        lastName: savedStaff.lastName,
        email: savedStaff.email.getValue(),
        role: savedStaff.role,
        businessId: savedStaff.businessId.getValue(),
        isActive: savedStaff.isActive,
        createdAt: savedStaff.createdAt,
      };

      this.logger.info(
        this.i18n.t('operations.staff.creation_success'),
        {
          ...context,
          staffId: savedStaff.id.getValue(),
          staffRole: savedStaff.role,
        } as Record<string, unknown>,
      );

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.staff.creation_failed'),
        error as Error,
        context as Record<string, unknown>,
      );
      throw error;
    }
  }

  private async validatePermissions(
    requestingUserId: string,
    businessId: string,
    context: AppContext,
  ): Promise<void> {
    const requestingUser = await this.userRepository.findById(requestingUserId);
    if (!requestingUser) {
      throw new InsufficientPermissionsError(
        'Requesting user not found',
        UserRole.REGULAR_CLIENT,
      );
    }

    // Vérifier que l'entreprise existe
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new BusinessNotFoundError(`Business with id ${businessId} not found`);
    }

    // Platform admins peuvent créer du personnel dans n'importe quelle entreprise
    if (requestingUser.role === UserRole.PLATFORM_ADMIN) {
      return;
    }

    // Business owners et admins peuvent créer du personnel dans leur entreprise
    const allowedRoles = [
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
    ];

    if (!allowedRoles.includes(requestingUser.role)) {
      this.logger.warn(this.i18n.t('warnings.permission.denied'), {
        requestingUserId,
        requestingUserRole: requestingUser.role,
        requiredPermissions: 'CREATE_STAFF',
        businessId,
      });
      throw new InsufficientPermissionsError(
        Permission.MANAGE_STAFF,
        requestingUser.role,
      );
    }

    // Note: Il faudrait aussi vérifier que le requesting user appartient à cette entreprise
    // Cela nécessiterait une relation staff-user ou business-user
  }

  private async validateBusinessRules(
    request: CreateStaffRequest,
    context: AppContext,
  ): Promise<void> {
    // Validation du prénom
    if (!request.firstName || request.firstName.trim().length < 2) {
      throw new StaffValidationError(
        'First name must be at least 2 characters long',
      );
    }

    if (request.firstName.trim().length > 50) {
      throw new StaffValidationError(
        'First name cannot exceed 50 characters',
      );
    }

    // Validation du nom de famille
    if (!request.lastName || request.lastName.trim().length < 2) {
      throw new StaffValidationError(
        'Last name must be at least 2 characters long',
      );
    }

    if (request.lastName.trim().length > 50) {
      throw new StaffValidationError(
        'Last name cannot exceed 50 characters',
      );
    }

    // Validation de l'email (unicité dans l'entreprise)
    const existingStaff = await this.staffRepository.findByEmailAndBusiness(
      Email.create(request.email),
      BusinessId.create(request.businessId),
    );

    if (existingStaff) {
      this.logger.warn(
        this.i18n.t('warnings.staff.email_already_exists'),
        { 
          ...context, 
          email: request.email,
          businessId: request.businessId,
        },
      );
      throw new StaffValidationError(
        `Staff member with email "${request.email}" already exists in this business`,
      );
    }

    // Validation du rôle
    if (!Object.values(StaffRole).includes(request.role)) {
      throw new StaffValidationError(
        `Invalid staff role: ${request.role}`,
      );
    }

    // Validation des horaires de travail si fournis
    if (request.workingHours) {
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      for (const day of days) {
        const hours = request.workingHours[day as keyof typeof request.workingHours];
        if (hours) {
          if (!this.isValidTimeFormat(hours.start) || !this.isValidTimeFormat(hours.end)) {
            throw new StaffValidationError(
              `Invalid time format for ${day}. Use HH:MM format`,
            );
          }
          
          if (hours.start >= hours.end) {
            throw new StaffValidationError(
              `Start time must be before end time for ${day}`,
            );
          }
        }
      }
    }

    // Validation du département si fourni
    if (request.department && request.department.trim().length > 100) {
      throw new StaffValidationError(
        'Department name cannot exceed 100 characters',
      );
    }

    // Validation du titre de poste si fourni
    if (request.jobTitle && request.jobTitle.trim().length > 100) {
      throw new StaffValidationError(
        'Job title cannot exceed 100 characters',
      );
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
