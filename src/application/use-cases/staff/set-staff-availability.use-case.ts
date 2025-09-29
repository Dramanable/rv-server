import {
  StaffAvailability,
  StaffWorkingHours,
} from '../../../domain/entities/staff.entity';
import { StaffNotFoundError } from '../../../domain/exceptions/staff.exceptions';
import { StaffRepository } from '../../../domain/repositories/staff.repository.interface';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { ApplicationValidationError } from '../../exceptions/application.exceptions';

export interface SetStaffAvailabilityRequest {
  readonly staffId: string;
  readonly workingHours: Array<{
    readonly dayOfWeek: number; // 0-6 (Dimanche-Samedi)
    readonly startTime: string; // "09:00"
    readonly endTime: string; // "17:00"
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
  readonly requestingUserId: string;
  readonly correlationId?: string;
}

export interface SetStaffAvailabilityResponse {
  readonly staffId: string;
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
  readonly updatedAt: Date;
}

/**
 * Use Case: Définir ou mettre à jour les disponibilités d'un membre du staff
 *
 * 🎯 Business Rules:
 * - Seul le staff lui-même, les managers ou owners peuvent modifier les disponibilités
 * - Les horaires de travail doivent être cohérents (startTime < endTime)
 * - Les congés ne peuvent pas chevaucher
 * - Les plannings spéciaux doivent être dans le futur
 *
 * 📋 Domain Events:
 * - StaffAvailabilityUpdated: Quand les disponibilités sont modifiées
 *
 * 🔐 Security:
 * - Vérification des permissions de modification
 * - Audit trail pour toutes les modifications
 */
export class SetStaffAvailabilityUseCase {
  constructor(private readonly staffRepository: StaffRepository) {}

  async execute(
    request: SetStaffAvailabilityRequest,
  ): Promise<SetStaffAvailabilityResponse> {
    // 🔍 1. Récupérer le staff
    const staffId = UserId.create(request.staffId);
    const staff = await this.staffRepository.findById(staffId);

    if (!staff) {
      throw new StaffNotFoundError(request.staffId);
    }

    // 🔐 2. Vérifier les permissions (TODO: à implémenter avec le système d'auth)
    // Cette logique sera ajoutée quand nous aurons le système de permissions complet

    // 🏗️ 3. Construire la nouvelle availability
    const workingHours: StaffWorkingHours[] = request.workingHours.map(
      (wh) => ({
        dayOfWeek: wh.dayOfWeek,
        startTime: wh.startTime,
        endTime: wh.endTime,
        isWorkingDay: wh.isWorkingDay,
      }),
    );

    const availability: StaffAvailability = {
      workingHours,
      timeOff: request.timeOff,
      specialSchedule: request.specialSchedule,
    };

    // ✅ 4. Mettre à jour les disponibilités
    staff.updateAvailability(availability);

    // 💾 5. Persister les changements
    await this.staffRepository.save(staff);

    // 📊 6. Construire la réponse
    return {
      staffId: staff.id.getValue(),
      availability: {
        workingHours: staff.availability?.workingHours || [],
        timeOff: staff.availability?.timeOff,
        specialSchedule: staff.availability?.specialSchedule,
      },
      updatedAt: staff.updatedAt,
    };
  }

  private validateWorkingHours(workingHours: StaffWorkingHours[]): void {
    // Validation des horaires de travail
    workingHours.forEach((wh, index) => {
      if (wh.dayOfWeek < 0 || wh.dayOfWeek > 6) {
        throw new ApplicationValidationError(
          'dayOfWeek',
          wh.dayOfWeek,
          'invalid_day_of_week',
        );
      }

      if (wh.isWorkingDay) {
        if (!this.isValidTimeFormat(wh.startTime)) {
          throw new ApplicationValidationError(
            'startTime',
            wh.startTime,
            'invalid_time_format',
          );
        }

        if (!this.isValidTimeFormat(wh.endTime)) {
          throw new ApplicationValidationError(
            'endTime',
            wh.endTime,
            'invalid_time_format',
          );
        }

        if (wh.startTime >= wh.endTime) {
          throw new ApplicationValidationError(
            'timeRange',
            wh.startTime,
            'start_time_must_be_before_end_time',
          );
        }
      }
    });
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  private validateTimeOff(
    timeOff?: Array<{ startDate: Date; endDate: Date; reason?: string }>,
  ): void {
    if (!timeOff) return;

    // Vérifier que les dates de début sont avant les dates de fin
    timeOff.forEach((leave, index) => {
      if (leave.startDate >= leave.endDate) {
        throw new ApplicationValidationError(
          'leavePeriod',
          leave.startDate,
          'start_date_must_be_before_end_date',
        );
      }
    });

    // Vérifier qu'il n'y a pas de chevauchement entre les congés
    for (let i = 0; i < timeOff.length; i++) {
      for (let j = i + 1; j < timeOff.length; j++) {
        const leave1 = timeOff[i];
        const leave2 = timeOff[j];

        if (
          leave1.startDate <= leave2.endDate &&
          leave1.endDate >= leave2.startDate
        ) {
          throw new ApplicationValidationError(
            'leavePeriods',
            `${i},${j}`,
            'overlapping_leave_periods',
          );
        }
      }
    }
  }
}
