/**
 * 👥 Create Staff Use Case - Clean Architecture + SOLID
 *
 * Création d'un membre du personnel avec validation métier et permissions
 * ✅ AUCUNE dépendance NestJS - Respect de la Clean Architecture
 */
import { StaffValidationError } from "../../../application/exceptions/application.exceptions";
import { I18nService } from "../../../application/ports/i18n.port";
import { Logger } from "../../../application/ports/logger.port";
import { Staff } from "../../../domain/entities/staff.entity";
import { BusinessRepository } from "../../../domain/repositories/business.repository.interface";
import { StaffRepository } from "../../../domain/repositories/staff.repository.interface";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import { Email } from "../../../domain/value-objects/email.value-object";
import { Phone } from "../../../domain/value-objects/phone.value-object";
import { Permission } from "../../../shared/enums/permission.enum";
import { StaffRole } from "../../../shared/enums/staff-role.enum";
import { IPermissionService } from "../../ports/permission.service.interface";

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

export class CreateStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly businessRepository: BusinessRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: CreateStaffRequest): Promise<CreateStaffResponse> {
    // 1. Validation des permissions avec service centralisé
    await this.permissionService.requirePermission(
      request.requestingUserId,
      Permission.MANAGE_STAFF,
      { businessId: request.businessId },
    );

    this.logger.info(this.i18n.t("operations.staff.creation_attempt"), {
      operation: "CreateStaff",
      requestingUserId: request.requestingUserId,
      businessId: request.businessId,
    });

    try {
      // 2. Validation des règles métier
      await this.validateBusinessRules(request);

      // 3. Création de l'entité Staff
      const businessId = BusinessId.create(request.businessId);
      const email = Email.create(request.email);
      const phone = request.phone ? Phone.create(request.phone) : undefined;

      const staff = Staff.create({
        businessId,
        profile: {
          firstName: request.firstName.trim(),
          lastName: request.lastName.trim(),
          title: request.jobTitle?.trim(),
        },
        role: request.role,
        email: request.email,
        phone: request.phone,
      });

      // 4. Persistance
      await this.staffRepository.save(staff);

      // 5. Réponse typée
      const response: CreateStaffResponse = {
        id: staff.id.getValue(),
        firstName: staff.profile.firstName,
        lastName: staff.profile.lastName,
        email: staff.email.getValue(),
        role: staff.role,
        businessId: staff.businessId.getValue(),
        isActive: staff.isActive(),
        createdAt: staff.createdAt,
      };

      this.logger.info(this.i18n.t("operations.staff.creation_success"), {
        operation: "CreateStaff",
        requestingUserId: request.requestingUserId,
        staffId: staff.id.getValue(),
        staffRole: staff.role,
      });

      return response;
    } catch (error) {
      this.logger.error(
        this.i18n.t("operations.staff.creation_failed"),
        error as Error,
        {
          operation: "CreateStaff",
          requestingUserId: request.requestingUserId,
          businessId: request.businessId,
        },
      );
      throw error;
    }
  }

  private async validateBusinessRules(
    request: CreateStaffRequest,
  ): Promise<void> {
    // Validation du prénom
    if (!request.firstName || request.firstName.trim().length < 2) {
      throw new StaffValidationError(
        "firstName",
        request.firstName,
        "First name must be at least 2 characters long",
      );
    }

    if (request.firstName.trim().length > 50) {
      throw new StaffValidationError(
        "firstName",
        request.firstName,
        "First name cannot exceed 50 characters",
      );
    }

    // Validation du nom de famille
    if (!request.lastName || request.lastName.trim().length < 2) {
      throw new StaffValidationError(
        "lastName",
        request.lastName,
        "Last name must be at least 2 characters long",
      );
    }

    if (request.lastName.trim().length > 50) {
      throw new StaffValidationError(
        "lastName",
        request.lastName,
        "Last name cannot exceed 50 characters",
      );
    }

    // Validation de l'email (unicité dans l'entreprise)
    const existingStaff = await this.staffRepository.findByEmail(
      Email.create(request.email),
    );
    // TODO: Ajouter findByEmailAndBusiness method au repository interface

    if (existingStaff) {
      this.logger.warn(this.i18n.t("warnings.staff.email_already_exists"), {
        email: request.email,
        businessId: request.businessId,
      });
      throw new StaffValidationError(
        "email",
        request.email,
        `Staff member with email "${request.email}" already exists in this business`,
      );
    }

    // Validation du rôle
    if (!Object.values(StaffRole).includes(request.role)) {
      throw new StaffValidationError(
        "role",
        request.role,
        `Invalid staff role: ${request.role}`,
      );
    }

    // Validation des horaires de travail si fournis
    if (request.workingHours) {
      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      for (const day of days) {
        const hours =
          request.workingHours[day as keyof typeof request.workingHours];
        if (hours) {
          if (
            !this.isValidTimeFormat(hours.start) ||
            !this.isValidTimeFormat(hours.end)
          ) {
            throw new StaffValidationError(
              "workingHours",
              `${day}: ${hours.start}-${hours.end}`,
              `Invalid time format for ${day}. Use HH:MM format`,
            );
          }

          if (hours.start >= hours.end) {
            throw new StaffValidationError(
              "workingHours",
              `${day}: ${hours.start}-${hours.end}`,
              `Start time must be before end time for ${day}`,
            );
          }
        }
      }
    }

    // Validation du département si fourni
    if (request.department && request.department.trim().length > 100) {
      throw new StaffValidationError(
        "department",
        request.department,
        "Department name cannot exceed 100 characters",
      );
    }

    // Validation du titre de poste si fourni
    if (request.jobTitle && request.jobTitle.trim().length > 100) {
      throw new StaffValidationError(
        "jobTitle",
        request.jobTitle,
        "Job title cannot exceed 100 characters",
      );
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }
}
