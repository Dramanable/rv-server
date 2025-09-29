import {
  Appointment,
  AppointmentId,
  AppointmentStatus,
} from '../../../../../domain/entities/appointment.entity';
import {
  AppointmentRepository,
  AppointmentSearchCriteria,
  AppointmentStatistics,
  AppointmentStatisticsCriteria,
} from '../../../../../domain/repositories/appointment.repository.interface';
import { AppointmentStatisticsData } from '../../../../../domain/value-objects/appointment-statistics.vo';
import { BusinessId } from '../../../../../domain/value-objects/business-id.value-object';
import { CalendarId } from '../../../../../domain/value-objects/calendar-id.value-object';
import { Email } from '../../../../../domain/value-objects/email.value-object';
import { ServiceId } from '../../../../../domain/value-objects/service-id.value-object';
import { UserId } from '../../../../../domain/value-objects/user-id.value-object';
import { AppointmentOrmEntity } from '../entities/appointment-orm.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// Placeholder exception class pour éviter les erreurs de compilation
class InfrastructureException extends Error {
  constructor(message: string, code?: string, context?: any) {
    super(message);
    this.name = 'InfrastructureException';
  }
}

/**
 * 📅 APPOINTMENT REPOSITORY - TypeORM Implementation
 * ✅ Clean Architecture compliant - Infrastructure layer
 * ✅ Implements domain interface (partial implementation for MVP)
 * ✅ Uses dedicated mapper for Domain ↔ ORM conversion
 */

@Injectable()
export class TypeOrmAppointmentRepository implements AppointmentRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly repository: Repository<AppointmentOrmEntity>,
  ) {}

  /**
   * 💾 SAVE - Sauvegarde un rendez-vous (create ou update)
   */
  async save(appointment: Appointment): Promise<void> {
    // 1. Conversion Domain → ORM via Mapper
    const ormEntity = AppointmentOrmMapper.toOrmEntity(appointment);

    // 2. Persistence en base
    await this.repository.save(ormEntity);
  }

  /**
   * 🔍 FIND BY ID - Recherche par identifiant unique
   */
  async findById(id: AppointmentId): Promise<Appointment | null> {
    const ormEntity = await this.repository.findOne({
      where: { id: id.getValue() },
      relations: [
        'business',
        'calendar',
        'service',
        'assignedStaff',
        'parentAppointment',
      ],
    });

    if (!ormEntity) return null;

    return AppointmentOrmMapper.toDomainEntity(ormEntity);
  }

  /**
   * 🔍 FIND CONFLICTING APPOINTMENTS - Détecte les conflits de créneaux
   */
  async findConflictingAppointments(
    calendarId: CalendarId,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: AppointmentId,
  ): Promise<Appointment[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('appointment')
      .where('appointment.calendar_id = :calendarId', {
        calendarId: calendarId.getValue(),
      })
      .andWhere('appointment.status NOT IN (:...excludedStatuses)', {
        excludedStatuses: ['cancelled', 'no_show'],
      })
      .andWhere(
        '(appointment.start_time < :endTime AND appointment.end_time > :startTime)',
        { startTime, endTime },
      );

    if (excludeAppointmentId) {
      queryBuilder.andWhere('appointment.id != :excludeId', {
        excludeId: excludeAppointmentId.getValue(),
      });
    }

    const ormEntities = await queryBuilder.getMany();
    return AppointmentOrmMapper.toDomainEntities(ormEntities);
  }

  /**
   * 🗑️ DELETE - Suppression par ID
   */
  async delete(id: AppointmentId): Promise<void> {
    await this.repository.delete(id.getValue());
  }

  /**
   * 📊 COUNT - Comptage avec critères
   */
  async count(criteria: AppointmentSearchCriteria): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('appointment');

    if (criteria.businessId) {
      queryBuilder.andWhere('appointment.business_id = :businessId', {
        businessId: criteria.businessId.getValue(),
      });
    }

    if (criteria.calendarId) {
      queryBuilder.andWhere('appointment.calendar_id = :calendarId', {
        calendarId: criteria.calendarId.getValue(),
      });
    }

    if (criteria.status && criteria.status.length > 0) {
      queryBuilder.andWhere('appointment.status IN (:...statuses)', {
        statuses: criteria.status,
      });
    }

    if (criteria.startDate) {
      queryBuilder.andWhere('appointment.start_time >= :startDate', {
        startDate: criteria.startDate,
      });
    }

    if (criteria.endDate) {
      queryBuilder.andWhere('appointment.end_time <= :endDate', {
        endDate: criteria.endDate,
      });
    }

    return await queryBuilder.getCount();
  }

  // ==========================================
  // 🚧 MÉTHODES NON IMPLÉMENTÉES (TODO MVP)
  // ==========================================

  async findByBusinessId(
    businessId: BusinessId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findByBusinessId not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findByCalendarId(
    calendarId: CalendarId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findByCalendarId not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findByServiceId(
    serviceId: ServiceId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findByServiceId not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findByClientEmail(
    email: Email,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findByClientEmail not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findByStaffId(
    staffId: UserId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findByStaffId not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findByStatus(
    status: AppointmentStatus[],
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findByStatus not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async search(criteria: AppointmentSearchCriteria): Promise<{
    appointments: Appointment[];
    total: number;
  }> {
    throw new InfrastructureException(
      'search not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findAvailableSlots(
    calendarId: CalendarId,
    serviceId: ServiceId,
    date: Date,
    duration: number,
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    throw new InfrastructureException(
      'findAvailableSlots not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async getUpcomingAppointments(
    businessId: BusinessId,
    hours?: number,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'getUpcomingAppointments not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async getOverdueAppointments(businessId: BusinessId): Promise<Appointment[]> {
    throw new InfrastructureException(
      'getOverdueAppointments not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findRecurringAppointments(
    businessId: BusinessId,
    parentAppointmentId?: AppointmentId,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findRecurringAppointments not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async getAppointmentsForReminders(
    businessId: BusinessId,
    reminderTime: Date,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'getAppointmentsForReminders not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async bulkUpdateStatus(
    appointmentIds: AppointmentId[],
    status: AppointmentStatus,
    reason?: string,
  ): Promise<void> {
    throw new InfrastructureException(
      'bulkUpdateStatus not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async bulkCancel(
    appointmentIds: AppointmentId[],
    reason?: string,
  ): Promise<void> {
    throw new InfrastructureException(
      'bulkCancel not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async getClientHistory(
    email: Email,
    businessId?: BusinessId,
    limit?: number,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'getClientHistory not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async findAppointmentsNeedingFollowUp(
    businessId: BusinessId,
    daysSinceCompletion: number,
  ): Promise<Appointment[]> {
    throw new InfrastructureException(
      'findAppointmentsNeedingFollowUp not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async getCalendarUtilization(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalSlots: number;
    bookedSlots: number;
    availableSlots: number;
    utilizationPercentage: number;
    peakTimes: { time: string; bookingCount: number }[];
  }> {
    throw new InfrastructureException(
      'getCalendarUtilization not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  async export(criteria: AppointmentSearchCriteria): Promise<Appointment[]> {
    throw new InfrastructureException(
      'export not implemented yet - TODO Phase 2',
      'NOT_IMPLEMENTED',
    );
  }

  /**
   * 📊 GET STATISTICS (Ancienne signature) - Pour compatibilité
   */
  async getStatistics(
    businessId: BusinessId,
    startDate: Date,
    endDate: Date,
  ): Promise<AppointmentStatistics>;

  /**
   * 📊 GET STATISTICS (Nouvelle signature) - Pour notre Use Case
   */
  async getStatistics(
    criteria: AppointmentStatisticsCriteria,
  ): Promise<AppointmentStatisticsData>;

  /**
   * 📊 GET STATISTICS - Implémentation
   */
  async getStatistics(
    businessIdOrCriteria: BusinessId | AppointmentStatisticsCriteria,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AppointmentStatistics | AppointmentStatisticsData> {
    // Si c'est l'ancienne signature (3 paramètres)
    if (startDate && endDate && businessIdOrCriteria instanceof BusinessId) {
      throw new InfrastructureException(
        'getStatistics (legacy signature) not implemented yet - TODO Phase 2',
        'NOT_IMPLEMENTED',
      );
    }

    // Nouvelle signature avec AppointmentStatisticsCriteria
    const criteria = businessIdOrCriteria as AppointmentStatisticsCriteria;
    try {
      // 1. Construction de la requête de base
      let queryBuilder = this.repository
        .createQueryBuilder('appointment')
        .where('appointment.businessId = :businessId', {
          businessId: criteria.businessId.getValue(),
        });

      // 2. Filtrage par période temporelle
      const startDate = criteria.period.startDate;
      const endDate = criteria.period.endDate;

      queryBuilder = queryBuilder.andWhere(
        'appointment.start_time >= :startDate AND appointment.start_time <= :endDate',
        { startDate, endDate },
      );

      // 3. Filtres optionnels
      if (criteria.staffId) {
        queryBuilder = queryBuilder.andWhere(
          'appointment.staff_id = :staffId',
          {
            staffId: criteria.staffId.getValue(),
          },
        );
      }

      if (criteria.serviceId) {
        queryBuilder = queryBuilder.andWhere(
          'appointment.service_id = :serviceId',
          {
            serviceId: criteria.serviceId.getValue(),
          },
        );
      }

      // 4. Calculs des statistiques de base
      const totalAppointments = await this.getTotalAppointments(queryBuilder);
      const statusCounts = await this.getStatusCounts(queryBuilder);

      // 5. Construction de la réponse selon notre interface
      const statisticsData: AppointmentStatisticsData = {
        totalAppointments,
        confirmedAppointments: statusCounts.confirmed || 0,
        canceledAppointments:
          statusCounts.canceled || statusCounts.cancelled || 0,
        completedAppointments: statusCounts.completed || 0,
        pendingAppointments: statusCounts.pending || 0,
        noShowAppointments: statusCounts.no_show || statusCounts.noShow || 0,
        totalRevenue: 0, // TODO: Implémenter quand la colonne revenue sera disponible
        averageAppointmentValue: 0, // TODO: Calculer quand totalRevenue sera disponible
      };

      return statisticsData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InfrastructureException(
        `Failed to get appointment statistics: ${errorMessage}`,
        'DATABASE_ERROR',
        { error: errorMessage },
      );
    }
  }

  /**
   * Méthodes helper privées pour les calculs de statistiques
   */
  private async getTotalAppointments(queryBuilder: any): Promise<number> {
    const result = await queryBuilder.getCount();
    return result;
  }

  private async getStatusCounts(
    queryBuilder: any,
  ): Promise<Record<string, number>> {
    const results = await queryBuilder
      .select('appointment.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('appointment.status')
      .getRawMany();

    const statusCounts: Record<string, number> = {};
    results.forEach((row: any) => {
      statusCounts[row.status] = parseInt(row.count, 10);
    });

    return statusCounts;
  }
}
