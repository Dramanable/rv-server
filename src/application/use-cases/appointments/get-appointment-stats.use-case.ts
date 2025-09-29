/**
 * 🔄 GET APPOINTMENT STATISTICS USE CASE - Application Layer
 *
 * Use case pour récupérer les statistiques d'appointments selon différents critères
 * Suit le pattern Result pour la gestion d'erreurs
 *
 * WORKFLOW :
 * 1. Valider l'autorisation selon le rôle utilisateur
 * 2. Construire les critères de filtrage
 * 3. Récupérer les données via le repository
 * 4. Construire les Value Objects de résultat
 * 5. Retourner les statistiques formatées
 */

import {
  AppointmentRepository,
  AppointmentStatisticsCriteria,
} from '../../../domain/repositories/appointment.repository.interface';
import { AppointmentStatistics } from '../../../domain/value-objects/appointment-statistics.vo';
import {
  StatisticsPeriod,
  PeriodType,
} from '../../../domain/value-objects/statistics-period.vo';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../domain/value-objects/user-id.value-object';
import { ServiceId } from '../../../domain/value-objects/service-id.value-object';
import { UserRole } from '../../../shared/enums/user-role.enum';
import { Result } from '../../../shared/result';

export interface GetAppointmentStatsCriteria {
  readonly businessId?: BusinessId;
  readonly staffId?: UserId;
  readonly serviceId?: ServiceId;
  readonly period: StatisticsPeriod;
}

export interface GetAppointmentStatsRequest {
  readonly userId: string;
  readonly userRole: UserRole;
  readonly businessId?: string;
  readonly staffId?: string;
  readonly serviceId?: string;
  readonly periodType: PeriodType;
  readonly startDate?: Date;
  readonly endDate?: Date;
}

export interface GetAppointmentStatsResponse {
  readonly statistics: AppointmentStatistics;
  readonly period: StatisticsPeriod;
  readonly criteria: GetAppointmentStatsCriteria;
}

export class GetAppointmentStatsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: GetAppointmentStatsRequest,
  ): Promise<Result<GetAppointmentStatsResponse, string>> {
    try {
      // 1. Validation des autorisations
      const authorizationResult = this.validateAuthorization(request);
      if (!authorizationResult.isSuccess) {
        return Result.failure(
          authorizationResult.error || 'Authorization failed',
        );
      }

      // 2. Construction de la période
      const period = this.buildPeriod(request);

      // 3. Construction des critères de filtrage
      const criteria = this.buildCriteria(request, period);

      // 4. Conversion vers les critères du repository
      const repositoryCriteria = this.convertToRepositoryCriteria(criteria);

      // 5. Récupération des statistiques
      const statisticsData =
        await this.appointmentRepository.getStatistics(repositoryCriteria);

      // 5. Construction des Value Objects
      const statistics = AppointmentStatistics.create(statisticsData);

      return Result.success({
        statistics,
        period,
        criteria,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      return Result.failure(
        `Failed to get appointment statistics: ${errorMessage}`,
      );
    }
  }

  private validateAuthorization(
    request: GetAppointmentStatsRequest,
  ): Result<void, string> {
    switch (request.userRole) {
      case UserRole.PLATFORM_ADMIN:
        // Platform admin peut voir toutes les statistiques
        return Result.success(void 0);

      case UserRole.BUSINESS_OWNER:
        // Business owner peut voir les stats de son business seulement
        if (!request.businessId) {
          return Result.failure('Business ID is required for business owner');
        }
        return Result.success(void 0);

      case UserRole.PRACTITIONER:
      case UserRole.SENIOR_PRACTITIONER:
      case UserRole.JUNIOR_PRACTITIONER:
        // Les praticiens peuvent voir leurs propres stats seulement
        if (!request.staffId || request.staffId !== request.userId) {
          return Result.failure(
            'Practitioners can only view their own statistics',
          );
        }
        return Result.success(void 0);

      case UserRole.REGULAR_CLIENT:
      case UserRole.VIP_CLIENT:
      case UserRole.CORPORATE_CLIENT:
      case UserRole.GUEST_CLIENT:
      default:
        return Result.failure(
          'Insufficient permissions to view appointment statistics',
        );
    }
  }

  private buildPeriod(request: GetAppointmentStatsRequest): StatisticsPeriod {
    switch (request.periodType) {
      case PeriodType.WEEK:
        return StatisticsPeriod.createCurrentWeek();
      case PeriodType.MONTH:
        return StatisticsPeriod.createCurrentMonth();
      case PeriodType.QUARTER:
        return StatisticsPeriod.createCurrentQuarter();
      case PeriodType.YEAR:
        return StatisticsPeriod.createCurrentYear();
      case PeriodType.CUSTOM:
        if (!request.startDate || !request.endDate) {
          throw new Error(
            'Start date and end date are required for custom period',
          );
        }
        return StatisticsPeriod.createCustom(
          request.startDate,
          request.endDate,
        );
      default:
        return StatisticsPeriod.createCurrentMonth(); // Défaut sur le mois courant
    }
  }

  private buildCriteria(
    request: GetAppointmentStatsRequest,
    period: StatisticsPeriod,
  ): GetAppointmentStatsCriteria {
    return {
      businessId: request.businessId
        ? BusinessId.create(request.businessId)
        : undefined,
      staffId: request.staffId ? UserId.create(request.staffId) : undefined,
      serviceId: request.serviceId
        ? ServiceId.create(request.serviceId)
        : undefined,
      period,
    };
  }

  private convertToRepositoryCriteria(
    criteria: GetAppointmentStatsCriteria,
  ): AppointmentStatisticsCriteria {
    return {
      businessId: criteria.businessId, // Peut être undefined pour PLATFORM_ADMIN
      staffId: criteria.staffId,
      serviceId: criteria.serviceId,
      period: criteria.period,
    };
  }
}
