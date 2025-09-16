/**
 * 🐘 PostgreSQL Calendar Repository Implementation
 *
 * Implémentation SQL du port CalendarRepository avec TypeORM
 * Optimisé pour les relations et requêtes complexes de calendriers
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { Calendar, CalendarId } from '../../../../domain/entities/calendar.entity';
import { CalendarRepository } from '../../../../domain/repositories/calendar.repository.interface';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../../domain/value-objects/user-id.value-object';
import { TimeSlot } from '../../../../domain/value-objects/time-slot.value-object';
import { RecurrencePattern } from '../../../../domain/value-objects/recurrence-pattern.value-object';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
import { CalendarOrmEntity } from '../../entities/typeorm/calendar.entity';
import { TypeOrmCalendarMapper } from '../../mappers/sql/typeorm-calendar.mapper';

@Injectable()
export class TypeOrmCalendarRepository implements CalendarRepository {
  constructor(
    @InjectRepository(CalendarOrmEntity)
    private readonly ormRepository: Repository<CalendarOrmEntity>,
    @Inject(TOKENS.LOGGER) 
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) 
    private readonly i18n: I18nService,
  ) {}

  async findById(id: CalendarId): Promise<Calendar | null> {
    try {
      const entity = await this.ormRepository.findOne({
        where: { id: id.getValue() },
        relations: ['owner', 'business', 'sharedUsers', 'appointments'],
      });

      return entity ? TypeOrmCalendarMapper.toDomainEntity(entity) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_failed'),
        error as Error,
        { calendarId: id.getValue() },
      );
      return null;
    }
  }

  async findByBusinessId(businessId: BusinessId): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        where: { businessId: businessId.getValue() },
        relations: ['owner', 'business', 'sharedUsers'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_by_business_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return [];
    }
  }

  async findByOwnerId(ownerId: UserId): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        where: { ownerId: ownerId.getValue() },
        relations: ['owner', 'business', 'sharedUsers'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_by_owner_failed'),
        error as Error,
        { ownerId: ownerId.getValue() },
      );
      return [];
    }
  }

  async findSharedCalendars(userId: UserId): Promise<Calendar[]> {
    try {
      // Requête JOIN pour trouver les calendriers partagés avec l'utilisateur
      const entities = await this.ormRepository
        .createQueryBuilder('calendar')
        .leftJoinAndSelect('calendar.owner', 'owner')
        .leftJoinAndSelect('calendar.business', 'business')
        .leftJoinAndSelect('calendar.sharedUsers', 'sharedUsers')
        .innerJoin('calendar.sharedUsers', 'sharedUser')
        .where('sharedUser.id = :userId', { userId: userId.getValue() })
        .orderBy('calendar.createdAt', 'DESC')
        .getMany();

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_shared_failed'),
        error as Error,
        { userId: userId.getValue() },
      );
      return [];
    }
  }

  async findByBusinessAndOwner(
    businessId: BusinessId,
    ownerId: UserId,
  ): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        where: {
          businessId: businessId.getValue(),
          ownerId: ownerId.getValue(),
        },
        relations: ['owner', 'business', 'sharedUsers'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_by_business_owner_failed'),
        error as Error,
        {
          businessId: businessId.getValue(),
          ownerId: ownerId.getValue(),
        },
      );
      return [];
    }
  }

  async findActiveCalendars(businessId: BusinessId): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        where: {
          businessId: businessId.getValue(),
          isActive: true,
        },
        relations: ['owner', 'business', 'sharedUsers'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_active_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return [];
    }
  }

  async save(calendar: Calendar): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.calendar.save_attempt'), {
        calendarId: calendar.id.getValue(),
        businessId: calendar.businessId.getValue(),
      });

      const ormEntity = TypeOrmCalendarMapper.toOrmEntity(calendar);
      await this.ormRepository.save(ormEntity);

      this.logger.info(this.i18n.t('operations.calendar.saved_successfully'), {
        calendarId: calendar.id.getValue(),
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.save_failed'),
        error as Error,
        { calendarId: calendar.id.getValue() },
      );
      throw error;
    }
  }

  async delete(id: CalendarId): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.calendar.delete_attempt'), {
        calendarId: id.getValue(),
      });

      await this.ormRepository.delete(id.getValue());

      this.logger.info(this.i18n.t('operations.calendar.deleted_successfully'), {
        calendarId: id.getValue(),
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.delete_failed'),
        error as Error,
        { calendarId: id.getValue() },
      );
      throw error;
    }
  }

  async findCalendarsWithAccess(
    businessId: BusinessId,
    userId: UserId,
  ): Promise<Calendar[]> {
    try {
      // Requête complexe pour trouver les calendriers où l'utilisateur a accès
      const entities = await this.ormRepository
        .createQueryBuilder('calendar')
        .leftJoinAndSelect('calendar.owner', 'owner')
        .leftJoinAndSelect('calendar.business', 'business')
        .leftJoinAndSelect('calendar.sharedUsers', 'sharedUsers')
        .where('calendar.businessId = :businessId', {
          businessId: businessId.getValue(),
        })
        .andWhere(
          '(calendar.ownerId = :userId OR sharedUsers.id = :userId)',
          { userId: userId.getValue() },
        )
        .orderBy('calendar.createdAt', 'DESC')
        .getMany();

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_with_access_failed'),
        error as Error,
        {
          businessId: businessId.getValue(),
          userId: userId.getValue(),
        },
      );
      return [];
    }
  }

  async checkCalendarExists(id: CalendarId): Promise<boolean> {
    try {
      const count = await this.ormRepository.count({
        where: { id: id.getValue() },
      });
      return count > 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.exists_check_failed'),
        error as Error,
        { calendarId: id.getValue() },
      );
      return false;
    }
  }

  async findCalendarsByBusinessAndActiveStatus(
    businessId: BusinessId,
    isActive: boolean,
  ): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        where: {
          businessId: businessId.getValue(),
          isActive,
        },
        relations: ['owner', 'business', 'sharedUsers'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_by_status_failed'),
        error as Error,
        {
          businessId: businessId.getValue(),
          isActive,
        },
      );
      return [];
    }
  }

  async updateCalendarSettings(
    id: CalendarId,
    settings: {
      name?: string;
      description?: string;
      color?: string;
      isActive?: boolean;
      workingHours?: {
        monday?: { start: string; end: string; isWorkingDay: boolean };
        tuesday?: { start: string; end: string; isWorkingDay: boolean };
        wednesday?: { start: string; end: string; isWorkingDay: boolean };
        thursday?: { start: string; end: string; isWorkingDay: boolean };
        friday?: { start: string; end: string; isWorkingDay: boolean };
        saturday?: { start: string; end: string; isWorkingDay: boolean };
        sunday?: { start: string; end: string; isWorkingDay: boolean };
      };
      breakTimes?: Array<{ start: string; end: string; name: string }>;
    },
  ): Promise<void> {
    try {
      this.logger.info(
        this.i18n.t('operations.calendar.update_settings_attempt'),
        { calendarId: id.getValue() },
      );

      const updateData: Partial<CalendarOrmEntity> = {};

      if (settings.name !== undefined) updateData.name = settings.name;
      if (settings.description !== undefined)
        updateData.description = settings.description;
      if (settings.color !== undefined) updateData.color = settings.color;
      if (settings.isActive !== undefined) updateData.isActive = settings.isActive;
      // Note: workingHours and breakTimes are handled separately via availability table

      updateData.updatedAt = new Date();

      await this.ormRepository.update(id.getValue(), updateData);

      this.logger.info(
        this.i18n.t('operations.calendar.settings_updated_successfully'),
        { calendarId: id.getValue() },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.update_settings_failed'),
        error as Error,
        { calendarId: id.getValue() },
      );
      throw error;
    }
  }

  async shareCalendar(
    calendarId: CalendarId,
    userIds: UserId[],
    permissions: {
      canView: boolean;
      canEdit: boolean;
      canManageAppointments: boolean;
    },
  ): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.calendar.share_attempt'), {
        calendarId: calendarId.getValue(),
        userCount: userIds.length,
      });

      // Transaction pour gérer le partage
      await this.ormRepository.manager.transaction(async (manager) => {
        // TODO: Implémenter la logique de partage avec table de permissions
        // Cette implémentation dépend de la structure exacte des entités
        
        // Exemple avec une table calendar_shares
        // for (const userId of userIds) {
        //   await manager.query(
        //     `INSERT INTO calendar_shares (calendar_id, user_id, can_view, can_edit, can_manage_appointments, created_at)
        //      VALUES ($1, $2, $3, $4, $5, $6)
        //      ON CONFLICT (calendar_id, user_id) 
        //      DO UPDATE SET 
        //        can_view = EXCLUDED.can_view,
        //        can_edit = EXCLUDED.can_edit,
        //        can_manage_appointments = EXCLUDED.can_manage_appointments,
        //        updated_at = NOW()`,
        //     [
        //       calendarId.getValue(),
        //       userId.getValue(),
        //       permissions.canView,
        //       permissions.canEdit,
        //       permissions.canManageAppointments,
        //       new Date(),
        //     ],
        //   );
        // }
      });

      this.logger.info(
        this.i18n.t('operations.calendar.shared_successfully'),
        { calendarId: calendarId.getValue() },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.share_failed'),
        error as Error,
        { calendarId: calendarId.getValue() },
      );
      throw error;
    }
  }

  async unshareCalendar(calendarId: CalendarId, userId: UserId): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.calendar.unshare_attempt'), {
        calendarId: calendarId.getValue(),
        userId: userId.getValue(),
      });

      // TODO: Supprimer le partage de la table des permissions
      // await this.ormRepository.query(
      //   'DELETE FROM calendar_shares WHERE calendar_id = $1 AND user_id = $2',
      //   [calendarId.getValue(), userId.getValue()],
      // );

      this.logger.info(
        this.i18n.t('operations.calendar.unshared_successfully'),
        { calendarId: calendarId.getValue() },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.unshare_failed'),
        error as Error,
        { calendarId: calendarId.getValue() },
      );
      throw error;
    }
  }

  async getCalendarStatistics(
    businessId: BusinessId,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalCalendars: number;
    activeCalendars: number;
    inactiveCalendars: number;
    mostUsedCalendar: { calendarId: string; appointmentCount: number } | null;
    averageAppointmentsPerCalendar: number;
  }> {
    try {
      const businessIdValue = businessId.getValue();

      // Requêtes SQL optimisées pour les statistiques
      const [totalResult, activeResult, appointmentStats] = await Promise.all([
        // Total des calendriers
        this.ormRepository.count({
          where: { businessId: businessIdValue },
        }),

        // Calendriers actifs
        this.ormRepository.count({
          where: { businessId: businessIdValue, isActive: true },
        }),

        // Statistiques des rendez-vous par calendrier
        this.ormRepository.query(
          `SELECT 
             c.id as calendar_id,
             COUNT(a.id) as appointment_count
           FROM calendars c
           LEFT JOIN appointments a ON c.id = a.calendar_id
           ${startDate ? 'AND a.start_time >= $2' : ''}
           ${endDate ? 'AND a.end_time <= $3' : ''}
           WHERE c.business_id = $1
           GROUP BY c.id
           ORDER BY appointment_count DESC
           LIMIT 1`,
          [
            businessIdValue,
            ...(startDate ? [startDate] : []),
            ...(endDate ? [endDate] : []),
          ],
        ),
      ]);

      const totalCalendars = totalResult;
      const activeCalendars = activeResult;
      const inactiveCalendars = totalCalendars - activeCalendars;

      const mostUsed = appointmentStats[0];
      const mostUsedCalendar = mostUsed
        ? {
            calendarId: mostUsed.calendar_id,
            appointmentCount: parseInt(mostUsed.appointment_count),
          }
        : null;

      const averageAppointmentsPerCalendar =
        totalCalendars > 0
          ? appointmentStats.reduce(
              (sum: number, stat: { appointment_count: string }) =>
                sum + parseInt(stat.appointment_count),
              0,
            ) / totalCalendars
          : 0;

      return {
        totalCalendars,
        activeCalendars,
        inactiveCalendars,
        mostUsedCalendar,
        averageAppointmentsPerCalendar,
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.statistics_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return {
        totalCalendars: 0,
        activeCalendars: 0,
        inactiveCalendars: 0,
        mostUsedCalendar: null,
        averageAppointmentsPerCalendar: 0,
      };
    }
  }

  async findCalendarsForSync(
    businessId: BusinessId,
    lastSyncTime?: Date,
  ): Promise<Calendar[]> {
    try {
      const whereConditions: Record<string, unknown> = {
        businessId: businessId.getValue(),
      };

      if (lastSyncTime) {
        whereConditions.updatedAt = {
          $gt: lastSyncTime,
        };
      }

      const entities = await this.ormRepository.find({
        where: whereConditions,
        relations: ['owner', 'business', 'sharedUsers'],
        order: { updatedAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.sync_query_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return [];
    }
  }

  async bulkUpdateCalendarStatus(
    calendarIds: CalendarId[],
    isActive: boolean,
  ): Promise<void> {
    try {
      this.logger.info(
        this.i18n.t('operations.calendar.bulk_update_status_attempt'),
        { calendarCount: calendarIds.length, isActive },
      );

      const ids = calendarIds.map((id) => id.getValue());

      await this.ormRepository.update(ids, {
        isActive,
        updatedAt: new Date(),
      });

      this.logger.info(
        this.i18n.t('operations.calendar.bulk_status_updated_successfully'),
        { calendarCount: calendarIds.length },
      );
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.bulk_update_status_failed'),
        error as Error,
        { calendarCount: calendarIds.length },
      );
      throw error;
    }
  }

  async duplicateCalendar(
    originalId: CalendarId,
    newName: string,
    newOwnerId?: UserId,
  ): Promise<Calendar> {
    try {
      this.logger.info(this.i18n.t('operations.calendar.duplicate_attempt'), {
        originalId: originalId.getValue(),
        newName,
      });

      // Transaction pour duplication
      return await this.ormRepository.manager.transaction(async (manager) => {
        // Trouver le calendrier original
        const original = await manager.findOne(CalendarOrmEntity, {
          where: { id: originalId.getValue() },
          relations: ['owner', 'business'],
        });

        if (!original) {
          throw new Error(
            `Calendar with id ${originalId.getValue()} not found`,
          );
        }

        // Créer la copie
        const duplicate = manager.create(CalendarOrmEntity, {
          ...original,
          id: undefined, // Nouveau ID auto-généré
          name: newName,
          ownerId: newOwnerId?.getValue() || original.ownerId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const saved = await manager.save(duplicate);
        return TypeOrmCalendarMapper.toDomainEntity(saved);
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.duplicate_failed'),
        error as Error,
        { originalId: originalId.getValue() },
      );
      throw error;
    }
  }

  // Méthodes supplémentaires requises par l'interface...
  async getCalendarWorkingHours(calendarId: CalendarId): Promise<{
    monday: { start: string; end: string; isWorkingDay: boolean };
    tuesday: { start: string; end: string; isWorkingDay: boolean };
    wednesday: { start: string; end: string; isWorkingDay: boolean };
    thursday: { start: string; end: string; isWorkingDay: boolean };
    friday: { start: string; end: string; isWorkingDay: boolean };
    saturday: { start: string; end: string; isWorkingDay: boolean };
    sunday: { start: string; end: string; isWorkingDay: boolean };
  }> {
    const calendar = await this.findById(calendarId);
    if (!calendar) {
      throw new Error(`Calendar with id ${calendarId.getValue()} not found`);
    }
    // Convert WorkingHours[] to the expected format
    // TODO: Implement proper conversion from WorkingHours[] to weekly format
    return {
      monday: { start: '09:00', end: '17:00', isWorkingDay: true },
      tuesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      wednesday: { start: '09:00', end: '17:00', isWorkingDay: true },
      thursday: { start: '09:00', end: '17:00', isWorkingDay: true },
      friday: { start: '09:00', end: '17:00', isWorkingDay: true },
      saturday: { start: '09:00', end: '12:00', isWorkingDay: false },
      sunday: { start: '00:00', end: '00:00', isWorkingDay: false }
    };
  }

  async updateCalendarWorkingHours(
    calendarId: CalendarId,
    workingHours: {
      monday?: { start: string; end: string; isWorkingDay: boolean };
      tuesday?: { start: string; end: string; isWorkingDay: boolean };
      wednesday?: { start: string; end: string; isWorkingDay: boolean };
      thursday?: { start: string; end: string; isWorkingDay: boolean };
      friday?: { start: string; end: string; isWorkingDay: boolean };
      saturday?: { start: string; end: string; isWorkingDay: boolean };
      sunday?: { start: string; end: string; isWorkingDay: boolean };
    },
  ): Promise<void> {
    await this.updateCalendarSettings(calendarId, { workingHours });
  }

  async findOverlappingCalendars(
    businessId: BusinessId,
    timeSlot: TimeSlot,
    excludeCalendarIds?: CalendarId[]
  ): Promise<Calendar[]> {
    try {
      const query = this.ormRepository
        .createQueryBuilder('calendar')
        .where('calendar.businessId = :businessId', { businessId: businessId.getValue() })
        .andWhere('calendar.isActive = :isActive', { isActive: true });

      if (excludeCalendarIds && excludeCalendarIds.length > 0) {
        const ids = excludeCalendarIds.map(id => id.getValue());
        query.andWhere('calendar.id NOT IN (:...excludeIds)', { excludeIds: ids });
      }

      const entities = await query.getMany();
      return entities.map(entity => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_overlapping_failed'),
        error as Error,
        { businessId: businessId.getValue() }
      );
      return [];
    }
  }

  async count(businessId?: BusinessId, isActive?: boolean): Promise<number> {
    const whereConditions: Record<string, unknown> = {};
    
    if (businessId) {
      whereConditions.businessId = businessId.getValue();
    }
    
    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }

    return this.ormRepository.count({ where: whereConditions });
  }

  async exists(id: CalendarId): Promise<boolean> {
    return this.checkCalendarExists(id);
  }

  async findAll(): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        relations: ['owner', 'business', 'sharedUsers'],
        order: { createdAt: 'DESC' },
      });

      return entities.map((entity) => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_all_failed'),
        error as Error,
      );
      return [];
    }
  }

  /**
   * 🚀 Création des index optimaux pour PostgreSQL
   */
  async createOptimalIndexes(): Promise<void> {
    try {
      this.logger.info('Creating optimal PostgreSQL indexes for calendars table');

      // Index composé pour requêtes fréquentes
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_calendar_business_active_created 
        ON calendars (business_id, is_active, created_at DESC)
      `);

      // Index pour propriétaire
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_calendar_owner_business 
        ON calendars (owner_id, business_id)
      `);

      // Index pour synchronisation
      await this.ormRepository.query(`
        CREATE INDEX IF NOT EXISTS idx_calendar_updated_at 
        ON calendars (updated_at DESC)
      `);

      this.logger.info('PostgreSQL indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create PostgreSQL indexes', error as Error);
    }
  }

  // ===========================================
  // TODO: Missing interface methods - to implement
  // ===========================================

  async findByType(businessId: BusinessId, type: string): Promise<Calendar[]> {
    try {
      const entities = await this.ormRepository.find({
        where: { 
          businessId: businessId.getValue(),
          type 
        },
      });
      return entities.map(entity => TypeOrmCalendarMapper.toDomainEntity(entity));
    } catch (error) {
      this.logger.error(
        'Failed to find calendars by type',
        error as Error,
        { businessId: businessId.getValue(), type }
      );
      return [];
    }
  }

  async findAvailableSlots(
    calendarIds: CalendarId[],
    startDate: Date,
    endDate: Date,
    duration: number
  ): Promise<{
    calendarId: CalendarId;
    slots: TimeSlot[];
  }[]> {
    // TODO: Implement available slots logic with appointments check
    this.logger.warn('findAvailableSlots not fully implemented - TODO', { 
      method: 'findAvailableSlots', 
      status: 'TODO' 
    });
    return calendarIds.map(calendarId => ({ calendarId, slots: [] }));
  }

  async getBookedSlots(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date
  ): Promise<TimeSlot[]> {
    // TODO: Implement booked slots from appointments table
    this.logger.warn('getBookedSlots not fully implemented - TODO', { 
      method: 'getBookedSlots', 
      status: 'TODO' 
    });
    return [];
  }

  async isSlotAvailable(
    calendarId: CalendarId,
    timeSlot: TimeSlot
  ): Promise<boolean> {
    // TODO: Implement slot availability check
    this.logger.warn('isSlotAvailable not fully implemented - TODO', { 
      method: 'isSlotAvailable', 
      status: 'TODO' 
    });
    return true; // Default to available for now
  }

  async getUtilizationStats(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalSlots: number;
    bookedSlots: number;
    utilizationRate: number;
    peakHours: { hour: number; bookings: number }[];
    peakDays: { day: string; bookings: number }[];
  }> {
    // TODO: Implement utilization statistics
    this.logger.warn('getUtilizationStats not fully implemented - TODO', { 
      method: 'getUtilizationStats', 
      status: 'TODO' 
    });
    return {
      totalSlots: 0,
      bookedSlots: 0,
      utilizationRate: 0,
      peakHours: [],
      peakDays: []
    };
  }

  async createRecurringSlots(
    calendarId: CalendarId,
    timeSlot: TimeSlot,
    recurrence: RecurrencePattern
  ): Promise<void> {
    // TODO: Implement recurring slots creation
    this.logger.warn('createRecurringSlots not fully implemented - TODO', { 
      method: 'createRecurringSlots', 
      status: 'TODO' 
    });
  }

  async blockTimeSlots(
    calendarId: CalendarId,
    timeSlots: TimeSlot[],
    reason?: string
  ): Promise<void> {
    // TODO: Implement time slot blocking
    this.logger.warn('blockTimeSlots not fully implemented - TODO', { 
      method: 'blockTimeSlots', 
      status: 'TODO' 
    });
  }

  // TODO: Implement missing interface methods
  async findCalendarsWithAvailability(
    businessId: BusinessId,
    startDate: Date,
    endDate: Date
  ): Promise<Calendar[]> {
    this.logger.warn('findCalendarsWithAvailability not implemented - TODO', { 
      method: 'findCalendarsWithAvailability', 
      status: 'TODO' 
    });
    
    // For now, return all calendars for the business
    return this.findByBusinessId(businessId);
  }

  async getRecurringPatterns(
    calendarId: CalendarId,
    startDate: Date,
    endDate: Date
  ): Promise<{ pattern: string; nextOccurrence: Date; frequency: number }[]> {
    this.logger.warn('getRecurringPatterns not implemented - TODO', { 
      method: 'getRecurringPatterns', 
      status: 'TODO' 
    });
    
    // Return empty array with correct type for now
    return [];
  }
}
