/**
 * 📊 APPOINTMENT STATISTICS REPOSITORY - TypeORM Implementation
 *
 * Implémentation simplifiée pour la fonctionnalité statistiques
 * Focus sur la méthode getStatistics uniquement
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentStatisticsCriteria } from '../../../../../domain/repositories/appointment.repository.interface';
import { AppointmentStatisticsData } from '../../../../../domain/value-objects/appointment-statistics.vo';
import { AppointmentOrmEntity } from '../entities/appointment-orm.entity';

@Injectable()
export class TypeOrmAppointmentStatisticsRepository {
  constructor(
    @InjectRepository(AppointmentOrmEntity)
    private readonly repository: Repository<AppointmentOrmEntity>,
  ) {}

  /**
   * 📊 GET STATISTICS - Implémentation pour les statistiques d'appointments
   */
  async getStatistics(
    criteria: AppointmentStatisticsCriteria,
  ): Promise<AppointmentStatisticsData> {
    try {
      // 1. Construction de la requête de base
      let queryBuilder = this.repository
        .createQueryBuilder('appointment')
        .where('appointment.business_id = :businessId', {
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
      throw new Error(`Failed to get appointment statistics: ${errorMessage}`);
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
