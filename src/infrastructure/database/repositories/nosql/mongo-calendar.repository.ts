/**
 * 🍃 MongoDB Calendar Repository Implementation
 *
 * Implémentation N      return calendars.map((doc) => MongoCalendarMapper.toDomainEntity(doc));SQL du port CalendarRepository avec Mongoose
 * Optimisé pour les données dénormalisées et requêtes flexibles de calendriers
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { Calendar, CalendarId } from '../../../../domain/entities/calendar.entity';
import { CalendarRepository } from '../../../../domain/repositories/calendar.repository.interface';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { UserId } from '../../../../domain/value-objects/user-id.value-object';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
import { Calendar as CalendarDocument, CalendarDocument as CalendarDoc } from '../../entities/mongo/calendar.schema';
import { MongoCalendarMapper } from '../../mappers/nosql/mongo-calendar.mapper';

// Interfaces pour les résultats d'agrégation
interface CalendarStatisticsResult {
  _id: string;
  totalCalendars: number;
  activeCalendars: number;
  inactiveCalendars: number;
  appointmentStats?: Array<{
    calendarId: string;
    appointmentCount: number;
  }>;
}

interface CalendarWithAppointments extends CalendarDoc {
  appointmentCount?: number;
}

@Injectable()
export class MongoCalendarRepository implements CalendarRepository {
  constructor(
    @InjectModel(CalendarDocument.name)
    private readonly calendarModel: Model<CalendarDoc>,
    @Inject(TOKENS.LOGGER) 
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) 
    private readonly i18n: I18nService,
  ) {}

  async findById(id: CalendarId): Promise<Calendar | null> {
    try {
      const calendarDoc = await this.calendarModel
        .findById(id.getValue())
        .lean()
        .exec();

      return calendarDoc ? MongoCalendarMapper.toDomainEntity(calendarDoc) : null;
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
      const calendarDocs = await this.calendarModel
        .find({ businessId: businessId.getValue() })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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
      const calendarDocs = await this.calendarModel
        .find({ ownerId: ownerId.getValue() })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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
      // MongoDB query pour trouver les calendriers partagés
      const calendarDocs = await this.calendarModel
        .find({
          'sharedUsers.userId': userId.getValue(),
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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
      const calendarDocs = await this.calendarModel
        .find({
          businessId: businessId.getValue(),
          ownerId: ownerId.getValue(),
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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
      const calendarDocs = await this.calendarModel
        .find({
          businessId: businessId.getValue(),
          isActive: true,
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_active_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return [];
    }
  }

  async save(calendar: Calendar): Promise<Calendar> {
    const mongoCalendar = MongoCalendarMapper.toPersistenceEntity(calendar);
    const saved = await this.calendarModel.create(mongoCalendar);
    return MongoCalendarMapper.toDomainEntity(saved);
  }

  async delete(id: CalendarId): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.calendar.delete_attempt'), {
        calendarId: id.getValue(),
      });

      await this.calendarModel.deleteOne({ _id: id.getValue() });

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
      // MongoDB query complexe pour l'accès aux calendriers
      const calendarDocs = await this.calendarModel
        .find({
          businessId: businessId.getValue(),
          $or: [
            { ownerId: userId.getValue() },
            { 'sharedUsers.userId': userId.getValue() },
          ],
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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
      const count = await this.calendarModel
        .countDocuments({ _id: id.getValue() })
        .lean();
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
      const calendarDocs = await this.calendarModel
        .find({
          businessId: businessId.getValue(),
          isActive,
        })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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

      const updateData: Partial<CalendarDoc> = {
        ...settings,
        updatedAt: new Date(),
      };

      await this.calendarModel.findByIdAndUpdate(id.getValue(), updateData);

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

      // MongoDB update avec $addToSet pour éviter les doublons
      const sharedUsers = userIds.map((userId) => ({
        userId: userId.getValue(),
        permissions,
        sharedAt: new Date(),
      }));

      await this.calendarModel.findByIdAndUpdate(calendarId.getValue(), {
        $addToSet: {
          sharedUsers: { $each: sharedUsers },
        },
        updatedAt: new Date(),
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

      // MongoDB update avec $pull pour retirer l'utilisateur
      await this.calendarModel.findByIdAndUpdate(calendarId.getValue(), {
        $pull: {
          sharedUsers: { userId: userId.getValue() },
        },
        updatedAt: new Date(),
      });

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
      // Pipeline d'agrégation MongoDB pour calculer les statistiques
      const pipeline: PipelineStage[] = [
        // Stage 1: Match les calendriers du business
        { $match: { businessId: businessId.getValue() } },

        // Stage 2: Lookup des rendez-vous
        {
          $lookup: {
            from: 'appointments',
            let: { calendarId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$calendarId', '$$calendarId'] },
                  ...(startDate && { startTime: { $gte: startDate } }),
                  ...(endDate && { endTime: { $lte: endDate } }),
                },
              },
            ],
            as: 'appointments',
          },
        },

        // Stage 3: Calcul des statistiques
        {
          $group: {
            _id: null,
            totalCalendars: { $sum: 1 },
            activeCalendars: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
            },
            inactiveCalendars: {
              $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] },
            },
            calendarStats: {
              $push: {
                calendarId: '$_id',
                appointmentCount: { $size: '$appointments' },
              },
            },
            totalAppointments: { $sum: { $size: '$appointments' } },
          },
        },

        // Stage 4: Calcul du calendrier le plus utilisé
        {
          $project: {
            totalCalendars: 1,
            activeCalendars: 1,
            inactiveCalendars: 1,
            mostUsedCalendar: {
              $let: {
                vars: {
                  maxStat: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$calendarStats',
                          as: 'stat',
                          cond: {
                            $eq: [
                              '$$stat.appointmentCount',
                              { $max: '$calendarStats.appointmentCount' },
                            ],
                          },
                        },
                      },
                      0,
                    ],
                  },
                },
                in: {
                  $cond: [
                    { $gt: ['$$maxStat.appointmentCount', 0] },
                    '$$maxStat',
                    null,
                  ],
                },
              },
            },
            averageAppointmentsPerCalendar: {
              $cond: [
                { $gt: ['$totalCalendars', 0] },
                { $divide: ['$totalAppointments', '$totalCalendars'] },
                0,
              ],
            },
          },
        },
      ];

      const results = await this.calendarModel
        .aggregate<CalendarStatisticsResult>(pipeline)
        .exec();

      const stats = results[0];
      if (!stats) {
        return {
          totalCalendars: 0,
          activeCalendars: 0,
          inactiveCalendars: 0,
          mostUsedCalendar: null,
          averageAppointmentsPerCalendar: 0,
        };
      }

      return {
        totalCalendars: stats.totalCalendars,
        activeCalendars: stats.activeCalendars,
        inactiveCalendars: stats.inactiveCalendars,
        mostUsedCalendar: stats.appointmentStats?.[0] || null,
        averageAppointmentsPerCalendar: stats.appointmentStats?.[0]
          ? stats.appointmentStats.reduce((sum, stat) => sum + stat.appointmentCount, 0) / stats.totalCalendars
          : 0,
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
      const matchConditions: Record<string, unknown> = {
        businessId: businessId.getValue(),
      };

      if (lastSyncTime) {
        matchConditions.updatedAt = { $gt: lastSyncTime };
      }

      const calendarDocs = await this.calendarModel
        .find(matchConditions)
        .sort({ updatedAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
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

      await this.calendarModel.updateMany(
        { _id: { $in: ids } },
        { isActive, updatedAt: new Date() },
      );

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

      // Trouver le calendrier original
      const original = await this.calendarModel
        .findById(originalId.getValue())
        .lean()
        .exec();

      if (!original) {
        throw new Error(
          `Calendar with id ${originalId.getValue()} not found`,
        );
      }

      // Créer la copie
      const duplicate = {
        ...original,
        _id: undefined, // MongoDB génère un nouvel ObjectId
        name: newName,
        ownerId: newOwnerId?.getValue() || original.ownerId,
        sharedUsers: [], // Pas de partage pour la copie
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const saved = await this.calendarModel.create(duplicate);
      return MongoCalendarMapper.toDomainEntity(saved.toObject());
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.duplicate_failed'),
        error as Error,
        { originalId: originalId.getValue() },
      );
      throw error;
    }
  }

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
    return calendar.workingHours;
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
    userId: UserId,
    startTime: Date,
    endTime: Date,
  ): Promise<Calendar[]> {
    // Pour MongoDB, cette requête nécessiterait une agrégation complexe avec lookup
    // Pour l'instant, retournons les calendriers avec accès
    return this.findCalendarsWithAccess(businessId, userId);
  }

  async count(businessId?: BusinessId, isActive?: boolean): Promise<number> {
    const matchConditions: Record<string, unknown> = {};
    
    if (businessId) {
      matchConditions.businessId = businessId.getValue();
    }
    
    if (isActive !== undefined) {
      matchConditions.isActive = isActive;
    }

    return this.calendarModel.countDocuments(matchConditions);
  }

  async exists(id: CalendarId): Promise<boolean> {
    return this.checkCalendarExists(id);
  }

  async findAll(): Promise<Calendar[]> {
    try {
      const calendarDocs = await this.calendarModel
        .find({})
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return calendarDocs.map((doc) => MongoCalendarMapper.toDomainEntity(doc));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.calendar.find_all_failed'),
        error as Error,
      );
      return [];
    }
  }



  /**
   * 🚀 Création des index optimaux pour MongoDB
   */
  async createOptimalIndexes(): Promise<void> {
    try {
      this.logger.info('Creating optimal MongoDB indexes for calendars collection');

      // Index composé pour requêtes fréquentes
      await this.calendarModel.collection.createIndex(
        { businessId: 1, isActive: 1, createdAt: -1 },
        { name: 'business_active_created_idx', background: true },
      );

      // Index pour propriétaire
      await this.calendarModel.collection.createIndex(
        { ownerId: 1, businessId: 1 },
        { name: 'owner_business_idx', background: true },
      );

      // Index pour partage
      await this.calendarModel.collection.createIndex(
        { 'sharedUsers.userId': 1 },
        { name: 'shared_users_idx', background: true },
      );

      // Index pour synchronisation
      await this.calendarModel.collection.createIndex(
        { updatedAt: -1 },
        { name: 'updated_at_idx', background: true },
      );

      // Index composé pour accès utilisateur
      await this.calendarModel.collection.createIndex(
        { businessId: 1, ownerId: 1, 'sharedUsers.userId': 1 },
        { name: 'access_composite_idx', background: true },
      );

      this.logger.info('MongoDB indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create MongoDB indexes', error as Error);
    }
  }
}
