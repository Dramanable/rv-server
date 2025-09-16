/**
 * 🍃 MongoDB Business Repository Implementation
 *
 * Implémentation NoSQL du port BusinessRepository avec Mongoose
 * Optimisé pour les données dénormalisées et requêtes flexibles
 */

import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import type { I18nService } from '../../../../application/ports/i18n.port';
import type { Logger } from '../../../../application/ports/logger.port';
import { Business, BusinessSector } from '../../../../domain/entities/business.entity';
import { BusinessRepository } from '../../../../domain/repositories/business.repository.interface';
import { BusinessId } from '../../../../domain/value-objects/business-id.value-object';
import { BusinessName } from '../../../../domain/value-objects/business-name.value-object';
import { TOKENS } from '../../../../shared/constants/injection-tokens';
import { Business as BusinessDocument, BusinessDocument as BusinessDoc } from '../../entities/mongo/business.schema';
import { MongoBusinessMapper } from '../../mappers/nosql/mongo-business.mapper';

// Interfaces pour les résultats d'agrégation
interface BusinessSearchResult {
  businesses?: BusinessDoc[];
  totalCount?: { count: number }[];
}

interface LocationSearchResult {
  business: BusinessDoc;
  distance: number;
}

interface BusinessStatistics {
  _id: string;
  totalAppointments: number;
  totalClients: number;
  totalStaff: number;
  totalServices: number;
  revenue: number;
}

@Injectable()
export class MongoBusinessRepository implements BusinessRepository {
  constructor(
    @InjectModel(BusinessDocument.name)
    private readonly businessModel: Model<BusinessDoc>,
    @Inject(TOKENS.LOGGER) 
    private readonly logger: Logger,
    @Inject(TOKENS.I18N_SERVICE) 
    private readonly i18n: I18nService,
  ) {}

  async save(business: Business): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.business.save_attempt'), {
        businessId: business.id.getValue(),
        businessName: business.name.getValue(),
      });

      const businessDoc = MongoBusinessMapper.toPersistenceEntity(business);

      // Upsert: update if exists, create if not
      await this.businessModel.findOneAndUpdate(
        { _id: business.id.getValue() },
        businessDoc,
        { upsert: true, new: true },
      );

      this.logger.info(this.i18n.t('operations.business.saved_successfully'), {
        businessId: business.id.getValue(),
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.save_failed'),
        error as Error,
        { businessId: business.id.getValue() },
      );
      throw error;
    }
  }

  async findById(id: BusinessId): Promise<Business | null> {
    try {
      const businessDoc = await this.businessModel
        .findById(id.getValue())
        .lean()
        .exec();

      return businessDoc ? MongoBusinessMapper.toDomainEntity(businessDoc) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.find_failed'),
        error as Error,
        { businessId: id.getValue() },
      );
      return null;
    }
  }

  async findByName(name: BusinessName): Promise<Business | null> {
    try {
      const businessDoc = await this.businessModel
        .findOne({ name: name.getValue() })
        .lean()
        .exec();

      return businessDoc ? MongoBusinessMapper.toDomainEntity(businessDoc) : null;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.find_by_name_failed'),
        error as Error,
        { businessName: name.getValue() },
      );
      return null;
    }
  }

  async delete(id: BusinessId): Promise<void> {
    try {
      this.logger.info(this.i18n.t('operations.business.delete_attempt'), {
        businessId: id.getValue(),
      });

      await this.businessModel.deleteOne({ _id: id.getValue() });

      this.logger.info(this.i18n.t('operations.business.deleted_successfully'), {
        businessId: id.getValue(),
      });
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.delete_failed'),
        error as Error,
        { businessId: id.getValue() },
      );
      throw error;
    }
  }

  async existsByName(name: BusinessName): Promise<boolean> {
    try {
      const count = await this.businessModel
        .countDocuments({ name: name.getValue() })
        .lean();
      return count > 0;
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.exists_check_failed'),
        error as Error,
        { businessName: name.getValue() },
      );
      return false;
    }
  }

  async findNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number,
  ): Promise<Business[]> {
    try {
      // Pipeline d'agrégation MongoDB pour recherche géospatiale
      const pipeline: PipelineStage[] = [
        // Stage 1: Geo-spatial search avec $geoNear
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude], // [lng, lat] pour MongoDB
            },
            distanceField: 'distance',
            maxDistance: radiusKm * 1000, // Convertir km en mètres
            spherical: true,
            distanceMultiplier: 0.001, // Convertir résultat en km
          },
        },

        // Stage 2: Tri par distance
        { $sort: { distance: 1 } },

        // Stage 3: Limitation optionnelle
        ...(limit ? [{ $limit: limit }] : []),

        // Stage 4: Projection pour optimiser le transfert
        {
          $project: {
            _id: 1,
            name: 1,
            sector: 1,
            address: 1,
            location: 1,
            contact: 1,
            owner: 1,
            staff: 1,
            services: 1,
            isActive: 1,
            createdAt: 1,
            updatedAt: 1,
            distance: 1, // Distance calculée
          },
        },
      ];

      const results = await this.businessModel
        .aggregate<LocationSearchResult>(pipeline)
        .exec();

      return results.map((result) => MongoBusinessMapper.toDomainEntity(result.business));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.location_search_failed'),
        error as Error,
        { latitude, longitude, radiusKm, limit },
      );
      return [];
    }
  }

  async getStatistics(businessId: BusinessId): Promise<{
    totalAppointments: number;
    totalClients: number;
    totalStaff: number;
    totalServices: number;
    revenue: number;
  }> {
    try {
      // Pipeline d'agrégation MongoDB pour calculer les statistiques
      const pipeline: PipelineStage[] = [
        // Stage 1: Match le business
        { $match: { _id: businessId.getValue() } },

        // Stage 2: Lookup des collections liées
        {
          $lookup: {
            from: 'appointments',
            localField: '_id',
            foreignField: 'businessId',
            as: 'appointments',
          },
        },
        {
          $lookup: {
            from: 'services',
            localField: '_id',
            foreignField: 'businessId',
            as: 'services',
          },
        },

        // Stage 3: Projection des statistiques calculées
        {
          $project: {
            totalAppointments: { $size: '$appointments' },
            totalClients: {
              $size: {
                $setUnion: [
                  {
                    $map: {
                      input: '$appointments',
                      as: 'appointment',
                      in: '$$appointment.clientEmail',
                    },
                  },
                ],
              },
            },
            totalStaff: { $size: '$staff' },
            totalServices: { $size: '$services' },
            revenue: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$appointments',
                      as: 'appointment',
                      cond: { $eq: ['$$appointment.status', 'COMPLETED'] },
                    },
                  },
                  as: 'completedAppointment',
                  in: {
                    $let: {
                      vars: {
                        service: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$services',
                                as: 'service',
                                cond: {
                                  $eq: [
                                    '$$service._id',
                                    '$$completedAppointment.serviceId',
                                  ],
                                },
                              },
                            },
                            0,
                          ],
                        },
                      },
                      in: { $ifNull: ['$$service.price', 0] },
                    },
                  },
                },
              },
            },
          },
        },
      ];

      const results = await this.businessModel
        .aggregate<BusinessStatistics>(pipeline)
        .exec();

      const stats = results[0];
      if (!stats) {
        return {
          totalAppointments: 0,
          totalClients: 0,
          totalStaff: 0,
          totalServices: 0,
          revenue: 0,
        };
      }

      return {
        totalAppointments: stats.totalAppointments,
        totalClients: stats.totalClients,
        totalStaff: stats.totalStaff,
        totalServices: stats.totalServices,
        revenue: stats.revenue,
      };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.statistics_failed'),
        error as Error,
        { businessId: businessId.getValue() },
      );
      return {
        totalAppointments: 0,
        totalClients: 0,
        totalStaff: 0,
        totalServices: 0,
        revenue: 0,
      };
    }
  }

  async findBySector(sector: BusinessSector): Promise<Business[]> {
    try {
      const businessDocs = await this.businessModel
        .find({ sector })
        .sort({ createdAt: -1 })
        .lean()
        .exec();

      return businessDocs.map((doc) => MongoBusinessMapper.toDomainEntity(doc));
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.find_by_sector_failed'),
        error as Error,
        { sector },
      );
      return [];
    }
  }

  async search(criteria: {
    name?: string;
    sector?: string;
    city?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{
    businesses: Business[];
    total: number;
  }> {
    try {
      const pipeline = this.buildSearchPipeline(criteria);

      const results = await this.businessModel
        .aggregate<BusinessSearchResult>(pipeline)
        .exec();

      const [result] = results;
      const businesses = (result?.businesses || []).map((doc) =>
        MongoBusinessMapper.toDomainEntity(doc),
      );
      const total = result?.totalCount?.[0]?.count || 0;

      return { businesses, total };
    } catch (error) {
      this.logger.error(
        this.i18n.t('operations.business.search_failed'),
        error as Error,
        { criteria },
      );
      return { businesses: [], total: 0 };
    }
  }

  /**
   * 🔧 Construction du pipeline de recherche MongoDB
   * Optimisé avec index et recherche textuelle
   */
  private buildSearchPipeline(criteria: {
    name?: string;
    sector?: string;
    city?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): PipelineStage[] {
    const matchStage: Record<string, unknown> = {};

    // Filtre par nom avec recherche textuelle
    if (criteria.name) {
      if (this.hasTextIndex()) {
        matchStage.$text = {
          $search: criteria.name,
          $caseSensitive: false,
        };
      } else {
        matchStage.name = { $regex: criteria.name, $options: 'i' };
      }
    }

    // Filtre par secteur
    if (criteria.sector) {
      matchStage.sector = criteria.sector as BusinessSector;
    }

    // Filtre par ville
    if (criteria.city) {
      matchStage['address.city'] = { $regex: criteria.city, $options: 'i' };
    }

    // Filtre par statut actif
    if (criteria.isActive !== undefined) {
      matchStage.isActive = criteria.isActive;
    }

    const pipeline: PipelineStage[] = [];

    // Stage 1: Match (filtres)
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // Stage 2: Score de pertinence pour recherche textuelle
    if (criteria.name && this.hasTextIndex()) {
      pipeline.push({
        $addFields: {
          score: { $meta: 'textScore' },
        },
      });
    }

    // Stage 3: Facet pour données + comptage
    pipeline.push({
      $facet: {
        // Données paginées
        businesses: [
          // Tri
          ...(criteria.name && this.hasTextIndex()
            ? [{ $sort: { score: { $meta: 'textScore' }, createdAt: -1 } }]
            : [{ $sort: { createdAt: -1 } }]),

          // Pagination
          ...(criteria.offset ? [{ $skip: criteria.offset }] : []),
          ...(criteria.limit ? [{ $limit: criteria.limit }] : []),

          // Projection
          {
            $project: {
              _id: 1,
              name: 1,
              sector: 1,
              address: 1,
              location: 1,
              contact: 1,
              owner: 1,
              staff: 1,
              services: 1,
              isActive: 1,
              createdAt: 1,
              updatedAt: 1,
              // Exclure le score
              score: 0,
            },
          },
        ],

        // Comptage total
        totalCount: [{ $count: 'count' }],
      },
    });

    return pipeline;
  }



  /**
   * 🔍 Vérification de l'existence d'un index textuel
   */
  private hasTextIndex(): boolean {
    // En production, vérifier dynamiquement les index
    return true; // Assumons qu'il existe
  }

  /**
   * 🚀 Création des index optimaux pour MongoDB
   */
  async createOptimalIndexes(): Promise<void> {
    try {
      this.logger.info('Creating optimal MongoDB indexes for businesses collection');

      // Index composé pour recherche fréquente
      await this.businessModel.collection.createIndex(
        { sector: 1, isActive: 1, createdAt: -1 },
        { name: 'sector_active_created_idx', background: true },
      );

      // Index géospatial 2dsphere pour recherche de proximité
      await this.businessModel.collection.createIndex(
        { location: '2dsphere' },
        { name: 'location_geo_idx', background: true },
      );

      // Index unique sur le nom
      await this.businessModel.collection.createIndex(
        { name: 1 },
        { unique: true, name: 'name_unique_idx', background: true },
      );

      // Index textuel pour recherche full-text
      await this.businessModel.collection.createIndex(
        {
          name: 'text',
          'address.city': 'text',
          'address.street': 'text',
        },
        {
          name: 'search_text_idx',
          background: true,
          weights: {
            name: 10,
            'address.city': 5,
            'address.street': 3,
          },
          default_language: 'french',
        },
      );

      // Index pour filtrage par ville
      await this.businessModel.collection.createIndex(
        { 'address.city': 1 },
        { name: 'city_idx', background: true },
      );

      this.logger.info('MongoDB indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create MongoDB indexes', error as Error);
    }
  }
}
