import { StaffNotFoundError } from "../../../domain/exceptions/staff.exceptions";
import { StaffRepository } from "../../../domain/repositories/staff.repository.interface";
import { UserId } from "../../../domain/value-objects/user-id.value-object";

export interface GetStaffAvailabilityRequest {
  readonly staffId: string;
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

export interface GetStaffAvailabilityResponse {
  readonly staffId: string;
  readonly fullName: string;
  readonly availability: {
    readonly workingHours: Array<{
      readonly dayOfWeek: number;
      readonly startTime: string;
      readonly endTime: string;
      readonly isWorkingDay: boolean;
    }>;
    readonly timeOff?: Array<{
      readonly startDate: Date;
      readonly endDate: Date;
      readonly reason?: string;
    }>;
    readonly specialSchedule?: Array<{
      readonly date: Date;
      readonly startTime?: string;
      readonly endTime?: string;
      readonly isAvailable: boolean;
    }>;
  };
  readonly status: string;
  readonly lastUpdated: Date;
}

/**
 * Use Case: Récupérer les disponibilités d'un membre du staff
 *
 * 🎯 Business Rules:
 * - Tout le monde peut consulter les disponibilités (pour booking)
 * - Les détails personnels peuvent être limités selon les permissions
 * - Retourne les disponibilités actuelles et à venir
 *
 * 📋 Domain Logic:
 * - Calcul de la disponibilité en temps réel
 * - Gestion des congés et plannings spéciaux
 *
 * 🔐 Security:
 * - Pas de données sensibles exposées
 * - Audit des consultations si nécessaire
 */
export class GetStaffAvailabilityUseCase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(
    request: GetStaffAvailabilityRequest,
  ): Promise<GetStaffAvailabilityResponse> {
    // 🔍 1. Récupérer le staff
    const staffId = UserId.create(request.staffId);
    const staff = await this.staffRepository.findById(staffId);

    if (!staff) {
      throw new StaffNotFoundError(request.staffId);
    }

    // 🔐 2. Vérifier les permissions de lecture si nécessaire
    // Pour l'instant, on autorise la lecture des disponibilités pour tous (booking)

    // 📊 3. Construire la réponse
    return {
      staffId: staff.id.getValue(),
      fullName: staff.fullName,
      availability: {
        workingHours: staff.availability?.workingHours || [],
        timeOff: staff.availability?.timeOff || [],
        specialSchedule: staff.availability?.specialSchedule || [],
      },
      status: staff.status,
      lastUpdated: staff.updatedAt,
    };
  }
}
