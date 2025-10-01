/**
 * 👤 Get Staff Use Case - Application Layer
 *
 * Cas d'usage pour la récupération d'un membre du personnel
 * Couche Application - Orchestration métier
 *
 * ✅ CLEAN ARCHITECTURE COMPLIANCE:
 * - Pas de dépendance vers les couches Infrastructure/Presentation
 * - Utilise uniquement les ports (interfaces)
 * - Validation des paramètres d'entrée
 * - Gestion centralisée des erreurs
 * - Logging et audit trail
 */

import {
  Staff,
  StaffAvailability,
  StaffCalendarIntegration,
  StaffProfile,
  StaffStatus,
} from "../../../domain/entities/staff.entity";
import { StaffNotFoundError } from "../../../domain/exceptions/staff.exceptions";
import { StaffRepository } from "../../../domain/repositories/staff.repository.interface";
import { UserId } from "../../../domain/value-objects/user-id.value-object";
import { StaffRole } from "../../../shared/enums/staff-role.enum";
import { ApplicationValidationError } from "../../exceptions/application.exceptions";
import { I18nService } from "../../ports/i18n.port";
import { Logger } from "../../ports/logger.port";

export interface GetStaffRequest {
  readonly staffId: string;
  readonly requestingUserId: string;
}

export interface GetStaffResponse {
  readonly id: string;
  readonly businessId: string;
  readonly profile: StaffProfile;
  readonly role: StaffRole;
  readonly email: string;
  readonly phone?: string;
  readonly availability?: StaffAvailability;
  readonly status: StaffStatus;
  readonly hireDate: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly calendarIntegration?: StaffCalendarIntegration;
}

export class GetStaffUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: GetStaffRequest): Promise<GetStaffResponse> {
    try {
      this.logger.info("Attempting to retrieve staff", {
        staffId: request.staffId,
        requestingUserId: request.requestingUserId,
      });

      // 1. Validation et conversion des paramètres
      const staffId = await this.validateAndParseRequest(request);

      // 3. Récupérer le staff
      const staff = await this.staffRepository.findById(staffId);
      if (!staff) {
        throw new StaffNotFoundError(
          this.i18n.translate("staff.errors.not_found", {
            id: request.staffId,
          }),
        );
      }

      this.logger.info("Staff retrieved successfully", {
        staffId: request.staffId,
        requestingUserId: request.requestingUserId,
        staffName: staff.fullName,
      });

      // 4. Retourner la réponse
      return this.mapStaffToResponse(staff);
    } catch (error) {
      this.logger.error(
        "Error retrieving staff",
        error instanceof Error ? error : new Error(String(error)),
        {
          staffId: request.staffId,
          requestingUserId: request.requestingUserId,
        },
      );
      throw error;
    }
  }

  /**
   * Valide et parse les paramètres de la requête
   */
  private async validateAndParseRequest(
    request: GetStaffRequest,
  ): Promise<UserId> {
    // Validation des paramètres requis
    if (!request.staffId || request.staffId.trim().length === 0) {
      throw new ApplicationValidationError(
        "staffId",
        request.staffId,
        "Staff ID is required and cannot be empty",
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new ApplicationValidationError(
        "requestingUserId",
        request.requestingUserId,
        "Requesting user ID is required and cannot be empty",
      );
    }

    // Validation du format UUID
    try {
      return UserId.create(request.staffId);
    } catch (error) {
      throw new ApplicationValidationError(
        "staffId",
        request.staffId,
        "Staff ID must be a valid UUID",
      );
    }
  }

  /**
   * Convertit une entité Staff vers GetStaffResponse
   */
  private mapStaffToResponse(staff: Staff): GetStaffResponse {
    return {
      id: staff.id.toString(),
      businessId: staff.businessId.toString(),
      profile: staff.profile,
      role: staff.role,
      email: staff.email.getValue(),
      phone: staff.phone?.getValue(),
      availability: staff.availability,
      status: staff.status,
      hireDate: staff.hireDate,
      createdAt: staff.createdAt,
      updatedAt: staff.updatedAt,
      calendarIntegration: staff.calendarIntegration,
    };
  }
}
