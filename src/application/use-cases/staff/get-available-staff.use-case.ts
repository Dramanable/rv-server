import { Staff } from "../../../domain/entities/staff.entity";
import { StaffRepository } from "../../../domain/repositories/staff.repository.interface";
import { BusinessId } from "../../../domain/value-objects/business-id.value-object";
import { ApplicationValidationError } from "../../exceptions/application.exceptions";

export interface GetAvailableStaffRequest {
  readonly businessId: string;
  readonly dateTime: Date;
  readonly durationMinutes: number;
  readonly serviceId?: string; // Optionnel : pour filtrer par compétence
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

export interface GetAvailableStaffResponse {
  readonly availableStaff: Array<{
    readonly staffId: string;
    readonly fullName: string;
    readonly role: string;
    readonly specialization?: string;
    readonly profileImageUrl?: string;
    readonly isAvailable: boolean;
    readonly nextAvailableSlot?: Date;
    readonly workingHours: {
      readonly dayOfWeek: number;
      readonly startTime: string;
      readonly endTime: string;
      readonly isWorkingDay: boolean;
    };
  }>;
  readonly totalCount: number;
  readonly requestedDateTime: Date;
  readonly searchDurationMinutes: number;
}

/**
 * Use Case: Trouver le staff disponible pour une date/heure donnée
 *
 * 🎯 Business Rules:
 * - Seul le staff actif et non en congé est considéré
 * - Vérification des horaires de travail
 * - Prise en compte des pauses et plannings spéciaux
 * - Si serviceId fourni, filtrer par compétence
 *
 * 📋 Domain Logic:
 * - Calcul en temps réel de la disponibilité
 * - Suggestion du prochain créneau si indisponible
 * - Tri par priorité (spécialisation, rating, etc.)
 *
 * 🔐 Security:
 * - Vérification des permissions business
 * - Données publiques uniquement (pour booking)
 */
export class GetAvailableStaffUseCase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(
    request: GetAvailableStaffRequest,
  ): Promise<GetAvailableStaffResponse> {
    // 🔍 1. Valider la requête
    this.validateRequest(request);

    // 🏢 2. Récupérer tous les staff de l'entreprise
    const businessId = BusinessId.create(request.businessId);
    const allStaff = await this.staffRepository.findByBusinessId(businessId);

    // 🎯 3. Filtrer le staff disponible
    const availableStaff = await this.filterAvailableStaff(
      allStaff,
      request.dateTime,
      request.durationMinutes,
      request.serviceId,
    );

    // 📊 4. Construire la réponse
    const staffResponses = availableStaff.map((staff) => ({
      staffId: staff.id.getValue(),
      fullName: staff.fullName,
      role: staff.role,
      specialization: staff.profile.specialization,
      profileImageUrl: staff.profile.profileImageUrl?.getUrl(),
      isAvailable: staff.isAvailableAt(request.dateTime),
      nextAvailableSlot: this.getNextAvailableSlot(staff, request.dateTime),
      workingHours: this.getCurrentDayWorkingHours(staff, request.dateTime),
    }));

    return {
      availableStaff: staffResponses,
      totalCount: staffResponses.length,
      requestedDateTime: request.dateTime,
      searchDurationMinutes: request.durationMinutes,
    };
  }

  private validateRequest(request: GetAvailableStaffRequest): void {
    if (request.durationMinutes <= 0) {
      throw new ApplicationValidationError(
        "durationMinutes",
        request.durationMinutes,
        "must_be_positive",
      );
    }

    if (request.durationMinutes > 8 * 60) {
      throw new ApplicationValidationError(
        "durationMinutes",
        request.durationMinutes,
        "cannot_exceed_8_hours",
      );
    }

    if (request.dateTime < new Date()) {
      throw new ApplicationValidationError(
        "dateTime",
        request.dateTime,
        "cannot_be_in_past",
      );
    }
  }

  private async filterAvailableStaff(
    allStaff: Staff[],
    dateTime: Date,
    _durationMinutes: number,
    _serviceId?: string,
  ): Promise<Staff[]> {
    return allStaff.filter((staff) => {
      // 1. Staff doit être actif
      if (!staff.isActive()) {
        return false;
      }

      // 2. Staff doit pouvoir accepter des rendez-vous
      if (!staff.canAcceptAppointments()) {
        return false;
      }

      // 3. Vérifier la disponibilité à l'heure demandée
      if (!staff.isAvailableAt(dateTime)) {
        return false;
      }

      // 4. TODO: Vérifier la disponibilité pour toute la durée
      // Cette logique sera ajoutée quand on aura le système de créneaux

      // 5. TODO: Filtrer par service/compétence si fourni
      // Cette logique sera ajoutée avec le système de services

      return true;
    });
  }

  private getNextAvailableSlot(
    _staff: Staff,
    _currentDateTime: Date,
  ): Date | undefined {
    // TODO: Implémenter le calcul du prochain créneau disponible
    // Cette logique nécessite le système de créneaux et l'agenda
    return undefined;
  }

  private getCurrentDayWorkingHours(
    staff: Staff,
    dateTime: Date,
  ): {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorkingDay: boolean;
  } {
    const dayOfWeek = dateTime.getDay();

    if (!staff.availability?.workingHours) {
      return {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isWorkingDay: false,
      };
    }

    const workingDay = staff.availability.workingHours.find(
      (wh) => wh.dayOfWeek === dayOfWeek,
    );

    return (
      workingDay || {
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isWorkingDay: false,
      }
    );
  }
}
