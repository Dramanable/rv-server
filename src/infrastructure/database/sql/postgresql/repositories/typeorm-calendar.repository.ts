/**
 * 📅 Calendar TypeORM Repository - Infrastructure Layer
 *
 * Implémentation concrète du repository Calendar avec TypeORM
 * Couche Infrastructure - Persistence des données
 *
 * ✅ Implémente l'interface domain CalendarRepository
 * ✅ Conversion entité ORM ↔ entité Domain
 * ✅ Gestion des erreurs et logging
 */

import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Calendar } from "../../../../../domain/entities/calendar.entity";
import { CalendarRepository } from "../../../../../domain/repositories/calendar.repository.interface";
import { BusinessId } from "../../../../../domain/value-objects/business-id.value-object";
import { CalendarId } from "../../../../../domain/value-objects/calendar-id.value-object";
import { TimeSlot } from "../../../../../domain/value-objects/time-slot.value-object";
import { UserId } from "../../../../../domain/value-objects/user-id.value-object";
import { CalendarOrmMapper } from "../../../../mappers/calendar-orm.mapper";
import { CalendarOrmEntity } from "../entities/calendar-orm.entity";

@Injectable()
export class TypeOrmCalendarRepository implements CalendarRepository {
  constructor(
    @InjectRepository(CalendarOrmEntity)
    private readonly ormRepository: Repository<CalendarOrmEntity>,
  ) {}

  async findById(id: CalendarId): Promise<Calendar | null> {
    try {
      const calendarId = id.getValue();
      const ormEntity = await this.ormRepository.findOne({
        where: { id: calendarId },
      });

      return ormEntity
        ? CalendarOrmMapper.toDomainPlainObject(ormEntity)
        : null;
    } catch (error) {
      throw new Error(
        `Failed to find calendar by id: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findByBusinessId(businessId: BusinessId): Promise<Calendar[]> {
    try {
      const businessIdValue = businessId.getValue();
      const ormEntities = await this.ormRepository.find({
        where: { business_id: businessIdValue },
      });

      return CalendarOrmMapper.toDomainPlainObjects(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find calendars by business id: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findByOwnerId(ownerId: UserId): Promise<Calendar[]> {
    try {
      const ownerIdValue = ownerId.getValue();
      const ormEntities = await this.ormRepository.find({
        where: { owner_id: ownerIdValue },
      });

      return CalendarOrmMapper.toDomainPlainObjects(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find calendars by owner id: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findByType(businessId: BusinessId, type: string): Promise<Calendar[]> {
    try {
      const businessIdValue = businessId.getValue();
      const ormEntities = await this.ormRepository.find({
        where: {
          business_id: businessIdValue,
          type,
        },
      });

      return CalendarOrmMapper.toDomainPlainObjects(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find calendars by type: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async save(calendar: Calendar): Promise<void> {
    try {
      // Convertir l'entité domain vers ORM via mapper
      const ormEntity = CalendarOrmMapper.toOrmEntity(calendar);

      // Sauvegarder dans la base
      await this.ormRepository.save(ormEntity);
    } catch (error) {
      throw new Error(
        `Failed to save calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async delete(id: CalendarId): Promise<void> {
    try {
      const calendarId = id.getValue();
      const result = await this.ormRepository.delete(calendarId);

      if (result.affected === 0) {
        throw new Error(`Calendar with id ${calendarId} not found`);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete calendar: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findAvailableSlots(
    calendarIds: CalendarId[],
    startDate: Date,
    endDate: Date,
    duration: number,
  ): Promise<
    {
      calendarId: CalendarId;
      slots: TimeSlot[];
    }[]
  > {
    try {
      const results: { calendarId: CalendarId; slots: TimeSlot[] }[] = [];

      for (const calendarId of calendarIds) {
        const calendar = await this.findById(calendarId);
        if (!calendar) {
          continue;
        }

        // Logique simple pour trouver les créneaux disponibles
        const slots: TimeSlot[] = [];
        const current = new Date(startDate);

        while (current < endDate) {
          const slotEnd = new Date(current.getTime() + duration * 60 * 1000);

          // Vérifier si le créneau est dans les heures de travail
          if (this.isWithinWorkingHours(calendar, current, slotEnd)) {
            // Créer un TimeSlot - implémentation simplifiée
            const timeSlot = TimeSlot.create(new Date(current), slotEnd);
            slots.push(timeSlot);
          }

          // Avancer d'une heure
          current.setHours(current.getHours() + 1);
        }

        results.push({ calendarId, slots });
      }

      return results;
    } catch (error) {
      throw new Error(
        `Failed to find available slots: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getBookedSlots(
    _calendarId: CalendarId,
    _startDate: Date,
    _endDate: Date,
  ): Promise<TimeSlot[]> {
    try {
      // Pour l'instant, retourner un tableau vide
      // À implémenter quand l'entité Appointment sera intégrée
      return [];
    } catch (error) {
      throw new Error(
        `Failed to get booked slots: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async isSlotAvailable(
    calendarId: CalendarId,
    _timeSlot: TimeSlot,
  ): Promise<boolean> {
    try {
      // Logique simplifiée - vérifier seulement que le calendrier existe
      const calendar = await this.findById(calendarId);
      return calendar !== null;
    } catch (error) {
      throw new Error(
        `Failed to check slot availability: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findOverlappingCalendars(
    businessId: BusinessId,
    _timeSlot: TimeSlot,
    excludeCalendarIds?: CalendarId[],
  ): Promise<Calendar[]> {
    try {
      const businessIdValue = businessId.getValue();
      let query = this.ormRepository
        .createQueryBuilder("calendar")
        .where("calendar.business_id = :businessId", {
          businessId: businessIdValue,
        });

      if (excludeCalendarIds && excludeCalendarIds.length > 0) {
        const excludeIds = excludeCalendarIds.map((id) => id.getValue());
        query = query.andWhere("calendar.id NOT IN (:...excludeIds)", {
          excludeIds,
        });
      }

      const ormEntities = await query.getMany();
      return CalendarOrmMapper.toDomainPlainObjects(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find overlapping calendars: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getUtilizationStats(
    _calendarId: CalendarId,
    _startDate: Date,
    _endDate: Date,
  ): Promise<{
    totalSlots: number;
    bookedSlots: number;
    utilizationRate: number;
    peakHours: { hour: number; bookings: number }[];
    peakDays: { day: string; bookings: number }[];
  }> {
    try {
      // Implémentation par défaut - à développer avec les données réelles
      return {
        totalSlots: 0,
        bookedSlots: 0,
        utilizationRate: 0,
        peakHours: [],
        peakDays: [],
      };
    } catch (error) {
      throw new Error(
        `Failed to get utilization stats: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async findCalendarsWithAvailability(
    businessId: BusinessId,
    _startDate: Date,
    _endDate: Date,
    _duration: number,
  ): Promise<Calendar[]> {
    try {
      const businessIdValue = businessId.getValue();
      const ormEntities = await this.ormRepository.find({
        where: { business_id: businessIdValue },
      });

      // Pour l'instant, retourner tous les calendriers du business
      // À améliorer avec la vérification réelle de disponibilité
      return CalendarOrmMapper.toDomainPlainObjects(ormEntities);
    } catch (error) {
      throw new Error(
        `Failed to find calendars with availability: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  async getRecurringPatterns(
    _calendarId: CalendarId,
    _startDate: Date,
    _endDate: Date,
  ): Promise<
    {
      pattern: string;
      nextOccurrence: Date;
      frequency: number;
    }[]
  > {
    try {
      // Implémentation par défaut - à développer selon les besoins
      return [];
    } catch (error) {
      throw new Error(
        `Failed to get recurring patterns: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Vérifier si un créneau est dans les heures de travail
   * Logique simplifiée - à améliorer selon les besoins métier
   */
  private isWithinWorkingHours(
    _calendar: Calendar,
    start: Date,
    end: Date,
  ): boolean {
    const startHour = start.getHours();
    const endHour = end.getHours();

    // Horaires par défaut : 9h-17h en semaine
    const workingStart = 9;
    const workingEnd = 17;
    const isWeekday = start.getDay() >= 1 && start.getDay() <= 5;

    return isWeekday && startHour >= workingStart && endHour <= workingEnd;
  }
}
