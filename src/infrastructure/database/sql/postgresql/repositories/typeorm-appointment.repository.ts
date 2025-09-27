import {
  Appointment,
  AppointmentId,
  AppointmentStatus,
} from "@domain/entities/appointment.entity";
import {
  AppointmentRepository,
  AppointmentSearchCriteria,
  AppointmentStatistics,
} from "@domain/repositories/appointment.repository.interface";
import { BusinessId } from "@domain/value-objects/business-id.value-object";
import { CalendarId } from "@domain/value-objects/calendar-id.value-object";
import { Email } from "@domain/value-objects/email.value-object";
import { ServiceId } from "@domain/value-objects/service-id.value-object";
import { UserId } from "@domain/value-objects/user-id.value-object";
import { AppointmentOrmEntity } from "@infrastructure/database/sql/postgresql/entities/appointment-orm.entity";
import { AppointmentOrmMapper } from "@infrastructure/mappers/appointment-orm.mapper";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

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
        "business",
        "calendar",
        "service",
        "assignedStaff",
        "parentAppointment",
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
      .createQueryBuilder("appointment")
      .where("appointment.calendar_id = :calendarId", {
        calendarId: calendarId.getValue(),
      })
      .andWhere("appointment.status NOT IN (:...excludedStatuses)", {
        excludedStatuses: ["cancelled", "no_show"],
      })
      .andWhere(
        "(appointment.start_time < :endTime AND appointment.end_time > :startTime)",
        { startTime, endTime },
      );

    if (excludeAppointmentId) {
      queryBuilder.andWhere("appointment.id != :excludeId", {
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
    const queryBuilder = this.repository.createQueryBuilder("appointment");

    if (criteria.businessId) {
      queryBuilder.andWhere("appointment.business_id = :businessId", {
        businessId: criteria.businessId.getValue(),
      });
    }

    if (criteria.calendarId) {
      queryBuilder.andWhere("appointment.calendar_id = :calendarId", {
        calendarId: criteria.calendarId.getValue(),
      });
    }

    if (criteria.status && criteria.status.length > 0) {
      queryBuilder.andWhere("appointment.status IN (:...statuses)", {
        statuses: criteria.status,
      });
    }

    if (criteria.startDate) {
      queryBuilder.andWhere("appointment.start_time >= :startDate", {
        startDate: criteria.startDate,
      });
    }

    if (criteria.endDate) {
      queryBuilder.andWhere("appointment.end_time <= :endDate", {
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
    throw new Error("findByBusinessId not implemented yet - TODO Phase 2");
  }

  async findByCalendarId(
    calendarId: CalendarId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Appointment[]> {
    throw new Error("findByCalendarId not implemented yet - TODO Phase 2");
  }

  async findByServiceId(
    serviceId: ServiceId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new Error("findByServiceId not implemented yet - TODO Phase 2");
  }

  async findByClientEmail(
    email: Email,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new Error("findByClientEmail not implemented yet - TODO Phase 2");
  }

  async findByStaffId(
    staffId: UserId,
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new Error("findByStaffId not implemented yet - TODO Phase 2");
  }

  async findByStatus(
    status: AppointmentStatus[],
    criteria?: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    throw new Error("findByStatus not implemented yet - TODO Phase 2");
  }

  async search(criteria: AppointmentSearchCriteria): Promise<{
    appointments: Appointment[];
    total: number;
  }> {
    throw new Error("search not implemented yet - TODO Phase 2");
  }

  async findAvailableSlots(
    calendarId: CalendarId,
    serviceId: ServiceId,
    date: Date,
    duration: number,
  ): Promise<{ startTime: Date; endTime: Date }[]> {
    throw new Error("findAvailableSlots not implemented yet - TODO Phase 2");
  }

  async getStatistics(
    businessId: BusinessId,
    startDate: Date,
    endDate: Date,
  ): Promise<AppointmentStatistics> {
    throw new Error("getStatistics not implemented yet - TODO Phase 2");
  }

  async getUpcomingAppointments(
    businessId: BusinessId,
    hours?: number,
  ): Promise<Appointment[]> {
    throw new Error(
      "getUpcomingAppointments not implemented yet - TODO Phase 2",
    );
  }

  async getOverdueAppointments(businessId: BusinessId): Promise<Appointment[]> {
    throw new Error(
      "getOverdueAppointments not implemented yet - TODO Phase 2",
    );
  }

  async findRecurringAppointments(
    businessId: BusinessId,
    parentAppointmentId?: AppointmentId,
  ): Promise<Appointment[]> {
    throw new Error(
      "findRecurringAppointments not implemented yet - TODO Phase 2",
    );
  }

  async getAppointmentsForReminders(
    businessId: BusinessId,
    reminderTime: Date,
  ): Promise<Appointment[]> {
    throw new Error(
      "getAppointmentsForReminders not implemented yet - TODO Phase 2",
    );
  }

  async bulkUpdateStatus(
    appointmentIds: AppointmentId[],
    status: AppointmentStatus,
    reason?: string,
  ): Promise<void> {
    throw new Error("bulkUpdateStatus not implemented yet - TODO Phase 2");
  }

  async bulkCancel(
    appointmentIds: AppointmentId[],
    reason?: string,
  ): Promise<void> {
    throw new Error("bulkCancel not implemented yet - TODO Phase 2");
  }

  async getClientHistory(
    email: Email,
    businessId?: BusinessId,
    limit?: number,
  ): Promise<Appointment[]> {
    throw new Error("getClientHistory not implemented yet - TODO Phase 2");
  }

  async findAppointmentsNeedingFollowUp(
    businessId: BusinessId,
    daysSinceCompletion: number,
  ): Promise<Appointment[]> {
    throw new Error(
      "findAppointmentsNeedingFollowUp not implemented yet - TODO Phase 2",
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
    throw new Error(
      "getCalendarUtilization not implemented yet - TODO Phase 2",
    );
  }

  async export(criteria: AppointmentSearchCriteria): Promise<Appointment[]> {
    throw new Error("export not implemented yet - TODO Phase 2");
  }
}
