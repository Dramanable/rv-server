/**
 * 🍃 MongoDB User Repository Implementation
 *
 * Implémentation MongoDB du port UserRepository avec Mongoose
 * Utilise l'agrégation MongoDB pour des performances optimales
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { User as DomainUser } from '../../../../domain/entities/user.entity';
import { UserRepository } from '../../../../domain/repositories/user.repository.interface';
import { Email } from '../../../../domain/value-objects/email.vo';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
import { UserRole } from '../../../../shared/enums/user-role.enum';
import { PaginatedResult } from '../../../../shared/types/pagination.types';
import { UserQueryParams } from '../../../../shared/types/user-query.types';
import { User, UserDocument } from '../../entities/mongo/user.schema';
import { MongoUserMapper } from '../../mappers/nosql/mongo-user.mapper';

// Interfaces pour le retour des agrégations MongoDB
interface UserAggregationResult {
  users?: UserDocument[];
  totalCount?: { count: number }[];
}

interface SearchAggregationResult {
  users?: (UserDocument & { relevanceScore?: number })[];
  totalCount?: { count: number }[];
}

interface StatsAggregationResult {
  total: { count: number }[];
  byRole: { _id: UserRole; count: number }[];
  activityStatus: { _id: string; count: number }[];
  recentSignups: { count: number }[];
}

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Inject(TOKENS.LOGGER) private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) private readonly i18n: I18nService,
  ) {}

  // Méthodes temporaires pour satisfaire l'interface - TODO: implémenter complètement
  async delete(id: string): Promise<void> {
    await this.userModel.deleteOne({ _id: id });
  }

  async findAll(
    params?: UserQueryParams,
  ): Promise<PaginatedResult<DomainUser>> {
    if (!params) {
      return this.findWithPagination(1, 10);
    }
    return this.findWithPagination(params.page, params.limit, {
      role: params.filters?.role as UserRole,
      search: params.search?.query,
    });
  }

  async search(params: UserQueryParams): Promise<PaginatedResult<DomainUser>> {
    return this.searchUsers(
      params.search?.query || '',
      { role: params.filters?.role as UserRole },
      params.page,
      params.limit,
    );
  }

  async findByRole(
    role: UserRole,
    params?: UserQueryParams,
  ): Promise<PaginatedResult<DomainUser>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    return this.findWithPagination(page, limit, { role });
  }

  async emailExists(email: Email): Promise<boolean> {
    const count = await this.userModel
      .countDocuments({
        email: email.value.toLowerCase(),
      })
      .lean();
    return count > 0;
  }

  async countSuperAdmins(): Promise<number> {
    return this.userModel.countDocuments({ role: UserRole.PLATFORM_ADMIN });
  }

  async count(): Promise<number> {
    return this.userModel.countDocuments();
  }

  async countWithFilters(params: UserQueryParams): Promise<number> {
    const filter: Record<string, unknown> = {};
    if (params.filters?.role) filter.role = params.filters.role;
    if (params.search?.query) {
      filter.$or = [
        { name: { $regex: params.search.query, $options: 'i' } },
        { email: { $regex: params.search.query, $options: 'i' } },
      ];
    }
    return this.userModel.countDocuments(filter);
  }

  async update(user: DomainUser): Promise<DomainUser> {
    const mongoUser = MongoUserMapper.toPersistenceEntity(user);
    const updated = await this.userModel
      .findOneAndUpdate({ _id: user.id }, mongoUser, { new: true, lean: true })
      .exec();
    if (!updated) throw new Error('User not found');
    return MongoUserMapper.toDomainEntity(updated);
  }

  async updateBatch(users: DomainUser[]): Promise<DomainUser[]> {
    const operations = users.map((user) => ({
      updateOne: {
        filter: { _id: user.id },
        update: MongoUserMapper.toPersistenceEntity(user),
      },
    }));
    await this.userModel.bulkWrite(operations);
    return users;
  }

  async deleteBatch(ids: string[]): Promise<void> {
    await this.userModel.deleteMany({ _id: { $in: ids } });
  }

  async export(params?: UserQueryParams): Promise<DomainUser[]> {
    // Utilise l'agrégation pour un export optimal avec indexes
    const pipeline: PipelineStage[] = [];

    // Stage 1: Match/Filter
    const matchStage: Record<string, unknown> = {};
    if (params?.filters?.role) matchStage.role = params.filters.role;
    if (params?.search?.query) {
      matchStage.$or = [
        { name: { $regex: params.search.query, $options: 'i' } },
        { email: { $regex: params.search.query, $options: 'i' } },
      ];
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Stage 2: Sort pour ordre cohérent
    pipeline.push({ $sort: { createdAt: -1 } });

    // Stage 3: Project pour optimiser les données exportées
    pipeline.push({
      $project: {
        _id: 1,
        email: 1,
        name: 1,
        hashedPassword: 1,
        role: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    });

    const users = await this.userModel.aggregate<UserDocument>(pipeline).exec();
    return users.map((user) => MongoUserMapper.toDomainEntity(user));
  }

  async save(user: DomainUser): Promise<DomainUser> {
    try {
      this.logger.info(this.i18n.t('operations.user.save_attempt'), {
        userId: user.id,
        email: user.email.value,
      });

      const userDoc = MongoUserMapper.toPersistenceEntity(user);

      // Upsert: update if exists, create if not
      const savedUser = await this.userModel
        .findOneAndUpdate({ _id: user.id }, userDoc, {
          upsert: true,
          new: true,
          lean: true,
        })
        .exec();

      if (!savedUser) {
        throw new Error('Failed to save user');
      }

      this.logger.info(this.i18n.t('operations.user.saved_successfully'), {
        userId: savedUser._id,
      });

      return MongoUserMapper.toDomainEntity(savedUser);
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.save_failed'),
        error as Error,
        {
          userId: user.id,
        },
      );
      throw error;
    }
  }

  async findById(id: string): Promise<DomainUser | null> {
    try {
      const user = await this.userModel.findById(id).lean().exec();
      return user ? MongoUserMapper.toDomainEntity(user) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.find_failed'),
        error as Error,
        {
          userId: id,
        },
      );
      return null;
    }
  }

  async findByEmail(email: Email): Promise<DomainUser | null> {
    try {
      const user = await this.userModel
        .findOne({
          email: email.value.toLowerCase(),
        })
        .lean()
        .exec();
      return user ? MongoUserMapper.toDomainEntity(user) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.find_by_email_failed'),
        error as Error,
        {
          email,
        },
      );
      return null;
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.userModel
        .countDocuments({
          email: email.toLowerCase(),
        })
        .lean();
      return count > 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.exists_check_failed'),
        error as Error,
        {
          email,
        },
      );
      return false;
    }
  }

  async findWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: { role?: UserRole; search?: string },
  ): Promise<PaginatedResult<DomainUser>> {
    try {
      const skip = (page - 1) * limit;

      // 🚀 Pipeline d'agrégation MongoDB pour performance optimale
      const pipeline = this.buildAggregationPipeline(filters, skip, limit);

      const results = await this.userModel.aggregate(pipeline);
      const [result] = results as UserAggregationResult[];

      const users = result?.users || [];
      const totalCountArray = result?.totalCount || [];
      const total = totalCountArray[0]?.count || 0;

      const data = users.map((user: UserDocument) => MongoUserMapper.toDomainEntity(user));

      return {
        data,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
          nextPage: page * limit < total ? page + 1 : undefined,
          previousPage: page > 1 ? page - 1 : undefined,
        },
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.pagination_failed'),
        error as Error,
        {
          page,
          limit,
          filters,
        },
      );
      throw error;
    }
  }

  /**
   * 🔧 Construction du pipeline d'agrégation MongoDB
   * Optimisé pour performance avec index et recherche textuelle
   */
  private buildAggregationPipeline(
    filters?: { role?: UserRole; search?: string },
    skip: number = 0,
    limit: number = 10,
  ): PipelineStage[] {
    const pipeline: PipelineStage[] = [];

    // 🎯 Stage 1: Match/Filter
    const matchStage: Record<string, unknown> = {};

    if (filters?.role) {
      matchStage.role = filters.role;
    }

    if (filters?.search) {
      // Utilise $text si index textuel disponible, sinon regex
      if (this.hasTextIndex()) {
        matchStage.$text = {
          $search: filters.search,
          $caseSensitive: false,
          $diacriticSensitive: false,
        };
      } else {
        matchStage.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage } as PipelineStage);
    }

    // 🔢 Stage 2: Score de pertinence pour recherche textuelle
    if (filters?.search && this.hasTextIndex()) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' },
        },
      } as PipelineStage);
    }

    // 📊 Stage 3: Facet pour données + comptage en parallèle
    pipeline.push({
      $facet: {
        // Données paginées
        users: [
          // Tri par pertinence si recherche, sinon par date
          ...(filters?.search && this.hasTextIndex()
            ? [{ $sort: { score: { $meta: 'textScore' }, createdAt: -1 } }]
            : [{ $sort: { createdAt: -1 } }]),
          { $skip: skip },
          { $limit: limit },
          // Projection pour optimiser le transfert de données
          {
            $project: {
              _id: 1,
              email: 1,
              name: 1,
              hashedPassword: 1,
              role: 1,
              isActive: 1,
              createdAt: 1,
              updatedAt: 1,
              // Exclure le score de la réponse finale
              score: 0,
            },
          },
        ],

        // Comptage total (sans pagination)
        totalCount: [{ $count: 'count' }],
      },
    } as PipelineStage);

    return pipeline;
  }

  /**
   * 🔍 Recherche textuelle avancée avec agrégation
   * Utilise les index MongoDB pour performance optimale
   */
  async searchUsers(
    searchTerm: string,
    filters?: { role?: UserRole },
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<DomainUser & { relevanceScore?: number }>> {
    try {
      const skip = (page - 1) * limit;

      const pipeline: PipelineStage[] = [
        // 🎯 Recherche textuelle avec score de pertinence
        {
          $match: {
            $text: {
              $search: searchTerm,
              $caseSensitive: false,
            },
            ...(filters?.role && { role: filters.role }),
          },
        },

        // 📊 Ajout du score de pertinence
        {
          $addFields: {
            relevanceScore: { $meta: 'textScore' },
          },
        },

        // 📈 Tri par pertinence + date
        {
          $sort: {
            relevanceScore: { $meta: 'textScore' },
            createdAt: -1,
          },
        },

        // 📄 Facet pour pagination + comptage
        {
          $facet: {
            users: [{ $skip: skip }, { $limit: limit }],
            totalCount: [{ $count: 'count' }],
          },
        },
      ];

      const results =
        await this.userModel.aggregate<SearchAggregationResult>(pipeline);
      const [result] = results;

      const users = result?.users || [];
      const total = result?.totalCount?.[0]?.count || 0;

      const data = users.map((user) => {
        const domainUser = MongoUserMapper.toDomainEntity(user);
        return Object.assign(domainUser, {
          relevanceScore: user.relevanceScore,
        });
      });

      return {
        data,
        meta: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page * limit < total,
          hasPreviousPage: page > 1,
          nextPage: page * limit < total ? page + 1 : undefined,
          previousPage: page > 1 ? page - 1 : undefined,
        },
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.search_failed'),
        error as Error,
        {
          searchTerm,
          filters,
          page,
          limit,
        },
      );
      throw error;
    }
  }

  /**
   * 📊 Statistiques utilisateurs avec agrégation
   */
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    active: number;
    inactive: number;
    recentSignups: number; // 30 derniers jours
  }> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const pipeline: PipelineStage[] = [
        {
          $facet: {
            // Comptage total
            total: [{ $count: 'count' }],

            // Répartition par rôle
            byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],

            // Comptage actifs/inactifs
            activityStatus: [
              { $group: { _id: '$isActive', count: { $sum: 1 } } },
            ],

            // Inscriptions récentes (30 jours)
            recentSignups: [
              { $match: { createdAt: { $gte: thirtyDaysAgo } } },
              { $count: 'count' },
            ],
          },
        },
      ];

      const results =
        await this.userModel.aggregate<StatsAggregationResult>(pipeline);
      const [result] = results;

      if (!result) {
        throw new Error('No aggregation results returned');
      }

      // Transformation des résultats
      const total = result.total[0]?.count || 0;

      const byRole = {} as Record<UserRole, number>;
      Object.values(UserRole).forEach((role) => (byRole[role] = 0));
      result.byRole.forEach((item) => {
        byRole[item._id] = item.count;
      });

      const activityMap = result.activityStatus.reduce(
        (acc: Record<string, number>, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>,
      );

      const recentSignups = result.recentSignups[0]?.count || 0;

      return {
        total,
        byRole,
        active: activityMap['true'] || 0,
        inactive: activityMap['false'] || 0,
        recentSignups,
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.user.stats_failed'),
        error as Error,
      );
      throw error;
    }
  }

  /**
   * 🚀 Création des index optimaux pour MongoDB
   * À appeler lors de l'initialisation de l'application
   */
  async createOptimalIndexes(): Promise<void> {
    try {
      this.logger.info('Creating optimal MongoDB indexes for users collection');

      // Index composé pour recherche + rôle + activité
      await this.userModel.collection.createIndex(
        { role: 1, isActive: 1, createdAt: -1 },
        {
          name: 'role_active_created_idx',
          background: true,
        },
      );

      // Index unique pour email (déjà géré par le schéma mais renforcement)
      await this.userModel.collection.createIndex(
        { email: 1 },
        {
          unique: true,
          name: 'email_unique_idx',
          background: true,
        },
      );

      // Index textuel pour recherche full-text
      await this.userModel.collection.createIndex(
        {
          name: 'text',
          email: 'text',
        },
        {
          name: 'search_text_idx',
          background: true,
          weights: {
            name: 10, // Nom plus important que email
            email: 5,
          },
          default_language: 'french', // Support multilingue
        },
      );

      // Index pour les requêtes de comptage par rôle
      await this.userModel.collection.createIndex(
        { role: 1 },
        {
          name: 'role_idx',
          background: true,
        },
      );

      // Index pour les requêtes temporelles (inscriptions récentes)
      await this.userModel.collection.createIndex(
        { createdAt: -1 },
        {
          name: 'created_date_idx',
          background: true,
        },
      );

      this.logger.info('MongoDB indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create MongoDB indexes', error as Error);
      // Ne pas faire échouer l'application pour les index
    }
  }

  /**
   * 📊 Analyse des performances des requêtes
   */
  async explainQuery(filters?: {
    role?: UserRole;
    search?: string;
  }): Promise<unknown> {
    try {
      const pipeline = this.buildAggregationPipeline(filters, 0, 10);

      // Utilise explain() pour analyser les performances
      const explanation = await this.userModel
        .aggregate(pipeline)
        .explain('executionStats');

      this.logger.info('Query performance analysis', {
        filters,
        explanation: JSON.stringify(explanation),
      });

      return explanation;
    } catch (error) {
      this.logger.error('Query explanation failed', error as Error, {
        filters,
      });
      throw error;
    }
  }

  /**
   * 🔍 Vérification de l'existence d'un index textuel
   */
  private hasTextIndex(): boolean {
    // En production, vérifier dynamiquement les index
    // Pour l'instant, assumons qu'il existe
    return true;
  }



  /**
   * 🔍 Trouve un utilisateur par nom d'utilisateur
   */
  async findByUsername(username: string): Promise<DomainUser | null> {
    if (!username?.trim()) return null;

    try {
      const userDoc = await this.userModel
        .findOne({ username: username.trim() })
        .lean()
        .exec();

      return userDoc ? MongoUserMapper.toDomainEntity(userDoc) : null;
    } catch (error) {
      this.logger.error('🔴 Erreur lors de la recherche par username', error as Error, {
        operation: 'MongoUserRepository.findByUsername',
        username: username.trim(),
      });
      throw error;
    }
  }

  /**
   * ✅ Vérifie si un nom d'utilisateur existe
   */
  async existsByUsername(username: string): Promise<boolean> {
    if (!username?.trim()) return false;

    try {
      const count = await this.userModel
        .countDocuments({ username: username.trim() })
        .exec();

      return count > 0;
    } catch (error) {
      this.logger.error('🔴 Erreur lors de la vérification username', error as Error, {
        operation: 'MongoUserRepository.existsByUsername',
        username: username.trim(),
      });
      return false; // Retour sécurisé
    }
  }

  /**
   * 🔑 Met à jour le mot de passe d'un utilisateur
   */
  async updatePassword(id: string, passwordHash: string): Promise<void> {
    try {
      await this.userModel
        .updateOne(
          { _id: id },
          {
            $set: {
              hashedPassword: passwordHash,
              updatedAt: new Date(),
            },
          }
        )
        .exec();

      this.logger.info(this.i18n.t('infrastructure.user.password_updated'), {
        operation: 'MongoUserRepository.updatePassword',
        userId: id,
      });
    } catch (error) {
      this.logger.error('🔴 Erreur lors de la mise à jour mot de passe', error as Error, {
        operation: 'MongoUserRepository.updatePassword',
        userId: id,
      });
      throw error;
    }
  }

  /**
   * 🔄 Met à jour le statut actif d'un utilisateur
   */
  async updateActiveStatus(id: string, isActive: boolean): Promise<void> {
    try {
      await this.userModel
        .updateOne(
          { _id: id },
          {
            $set: {
              isActive,
              updatedAt: new Date(),
            },
          }
        )
        .exec();

      this.logger.info(this.i18n.t('infrastructure.user.status_updated'), {
        operation: 'MongoUserRepository.updateActiveStatus',
        userId: id,
        isActive,
      });
    } catch (error) {
      this.logger.error('🔴 Erreur lors de la mise à jour statut', error as Error, {
        operation: 'MongoUserRepository.updateActiveStatus',
        userId: id,
      });
      throw error;
    }
  }
}
