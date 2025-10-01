/**
 * 📋 LIST PROSPECTS USE CASE - Application Layer
 * ✅ Clean Architecture - Use Case Layer
 * ✅ Lister les prospects avec filtres et pagination
 */

import { Prospect } from '@domain/entities/prospect.entity';
import {
  IProspectRepository,
  ProspectFilters,
  ProspectSortOptions,
} from '@domain/repositories/prospect.repository';
import {
  ProspectStatus,
  ProspectStatusEnum,
} from '@domain/value-objects/prospect-status.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import {
  BusinessSizeEnum,
  BusinessSize,
} from '@domain/enums/business-size.enum';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { IPermissionService } from '@application/ports/permission.port';
import { ProspectPermissionError } from '@domain/exceptions/prospect.exceptions';

export interface ListProspectsRequest {
  // 🔍 Filtres de recherche
  readonly search?: string;
  readonly status?: string;
  readonly assignedSalesRep?: string;
  readonly businessSize?: BusinessSizeEnum;
  readonly source?: string;
  readonly minEstimatedValue?: number;
  readonly maxEstimatedValue?: number;
  readonly minStaffCount?: number;
  readonly maxStaffCount?: number;
  readonly isHotProspect?: boolean;
  readonly createdAfter?: string; // ISO string
  readonly createdBefore?: string; // ISO string

  // 📊 Tri et pagination
  readonly sortBy?:
    | 'businessName'
    | 'contactName'
    | 'status'
    | 'estimatedValue'
    | 'staffCount'
    | 'createdAt'
    | 'updatedAt';
  readonly sortOrder?: 'asc' | 'desc';
  readonly page?: number;
  readonly limit?: number;

  // 🔐 Contexte de sécurité obligatoire
  readonly requestingUserId: string;
  readonly requestingUserRole?: string; // Rôle utilisateur pour vérifications spéciales
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface ProspectSummary {
  readonly id: string;
  readonly businessName: string;
  readonly contactEmail: string;
  readonly contactName: string;
  readonly status: {
    readonly value: string;
    readonly label: string;
    readonly color: string;
    readonly priority: number;
  };
  readonly assignedSalesRep: string;
  readonly estimatedValue: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly estimatedMonthlyPrice: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly annualRevenuePotential: {
    readonly amount: number;
    readonly currency: string;
  };
  readonly businessSize: {
    readonly value: BusinessSizeEnum;
    readonly label: string;
    readonly icon: string;
  };
  readonly staffCount: number;
  readonly source: string;
  readonly isHotProspect: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ListProspectsResponse {
  readonly data: ProspectSummary[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
  readonly filters: {
    readonly applied: Record<string, unknown>;
    readonly available: {
      readonly statuses: Array<{ value: string; label: string; color: string }>;
      readonly businessSizes: Array<{
        value: BusinessSizeEnum;
        label: string;
        icon: string;
      }>;
      readonly sources: string[];
    };
  };
  readonly summary: {
    readonly totalValue: number;
    readonly averageValue: number;
    readonly hotProspectsCount: number;
    readonly conversionRate: number;
  };
}

export class ListProspectsUseCase {
  constructor(
    private readonly prospectRepository: IProspectRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(request: ListProspectsRequest): Promise<ListProspectsResponse> {
    this.logger.info('Listing prospects with filters', {
      filters: {
        search: request.search,
        status: request.status,
        assignedSalesRep: request.assignedSalesRep,
        businessSize: request.businessSize,
      },
      pagination: {
        page: request.page || 1,
        limit: request.limit || 10,
      },
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
    });

    try {
      // 🔐 ÉTAPE 1 : Vérifier les permissions et ajuster les filtres
      const finalFilters =
        await this.validatePermissionsAndAdjustFilters(request);

      // 🔍 ÉTAPE 2 : Construire les options de recherche
      const sortOptions = this.buildSortOptions(request);
      const paginationOptions = this.buildPaginationOptions(request);

      // 📋 ÉTAPE 3 : Récupérer les prospects
      const searchResult = await this.prospectRepository.findAll(
        finalFilters,
        sortOptions,
        paginationOptions,
      );

      // 📊 ÉTAPE 4 : Récupérer les métriques additionnelles
      const summary = await this.buildSummary(searchResult.prospects);

      this.logger.info('Prospects listed successfully', {
        totalFound: searchResult.total,
        page: searchResult.page,
        correlationId: request.correlationId,
      });

      // 📤 ÉTAPE 5 : Construire la réponse
      return this.buildResponse(searchResult, summary, request);
    } catch (error) {
      this.logger.error(
        'Failed to list prospects',
        error instanceof Error ? error : new Error(String(error)),
        {
          requestingUserId: request.requestingUserId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  /**
   * 🔐 Valider les permissions et ajuster les filtres selon le rôle
   */
  private async validatePermissionsAndAdjustFilters(
    request: ListProspectsRequest,
  ): Promise<ProspectFilters> {
    // 🎯 RÈGLE SPÉCIALE : ADMIN et SUPER_ADMIN ont toutes les permissions
    const isSystemAdmin =
      request.requestingUserRole === 'ADMIN' ||
      request.requestingUserRole === 'SUPER_ADMIN';

    if (!isSystemAdmin) {
      // Vérifier la permission de base seulement pour les utilisateurs non-admin
      const hasPermission = await this.permissionService.hasPermission(
        request.requestingUserId,
        'VIEW_PROSPECTS',
      );

      if (!hasPermission) {
        throw new ProspectPermissionError(
          request.requestingUserId,
          'view prospects',
        );
      }
    } else {
      this.logger.info('Admin user bypassing permission check', {
        userId: request.requestingUserId,
        role: request.requestingUserRole,
        correlationId: request.correlationId,
      });
    }

    // Construire les filtres de base
    const baseFilters = {
      search: request.search,
      businessSize: request.businessSize,
      source: request.source,
      minEstimatedValue: request.minEstimatedValue,
      maxEstimatedValue: request.maxEstimatedValue,
      minStaffCount: request.minStaffCount,
      maxStaffCount: request.maxStaffCount,
      isHotProspect: request.isHotProspect,
      createdAfter: request.createdAfter
        ? new Date(request.createdAfter)
        : undefined,
      createdBefore: request.createdBefore
        ? new Date(request.createdBefore)
        : undefined,
    };

    // Ajouter filtre de statut si spécifié
    const statusFilter = request.status
      ? { status: ProspectStatus.fromString(request.status) }
      : {};

    // Vérifier si l'utilisateur peut voir tous les prospects ou seulement les siens
    const canViewAllProspects = await this.permissionService.hasPermission(
      request.requestingUserId,
      'VIEW_ALL_PROSPECTS',
    );

    // Construire filtre assignedSalesRep selon permissions
    let assignedSalesRepFilter = {};
    if (!canViewAllProspects) {
      // Commercial : ne peut voir que ses prospects
      assignedSalesRepFilter = {
        assignedSalesRep: UserId.create(request.requestingUserId),
      };
    } else if (request.assignedSalesRep) {
      // Manager/Admin : peut filtrer par commercial spécifique
      assignedSalesRepFilter = {
        assignedSalesRep: UserId.create(request.assignedSalesRep),
      };
    }

    return {
      ...baseFilters,
      ...statusFilter,
      ...assignedSalesRepFilter,
    };
  }

  /**
   * 📊 Construire les options de tri
   */
  private buildSortOptions(request: ListProspectsRequest): ProspectSortOptions {
    return {
      field: request.sortBy || 'updatedAt',
      direction: request.sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
    };
  }

  /**
   * 📄 Construire les options de pagination
   */
  private buildPaginationOptions(request: ListProspectsRequest) {
    const page = Math.max(1, request.page || 1);
    const limit = Math.min(100, Math.max(1, request.limit || 10));

    return { page, limit };
  }

  /**
   * 📊 Construire le résumé statistique
   */
  private async buildSummary(prospects: Prospect[]) {
    const totalValue = prospects.reduce(
      (sum, prospect) => sum + prospect.getEstimatedValue().getAmount(),
      0,
    );

    const averageValue =
      prospects.length > 0 ? totalValue / prospects.length : 0;

    const hotProspectsCount = prospects.filter((prospect) =>
      prospect.isHotProspect(),
    ).length;

    const closedProspects = prospects.filter((prospect) =>
      prospect.getStatus().isClosed(),
    );
    const wonProspects = prospects.filter((prospect) =>
      prospect.getStatus().isClosedWon(),
    );

    const conversionRate =
      closedProspects.length > 0
        ? (wonProspects.length / closedProspects.length) * 100
        : 0;

    return {
      totalValue,
      averageValue,
      hotProspectsCount,
      conversionRate,
    };
  }

  /**
   * 📤 Construire la réponse complète
   */
  private buildResponse(
    searchResult: {
      prospects: Prospect[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
    summary: {
      totalValue: number;
      averageValue: number;
      hotProspectsCount: number;
      conversionRate: number;
    },
    request: ListProspectsRequest,
  ): ListProspectsResponse {
    // Convertir les prospects en résumés
    const data: ProspectSummary[] = searchResult.prospects.map((prospect) => ({
      id: prospect.getId().getValue(),
      businessName: prospect.getBusinessName(),
      contactEmail: prospect.getContactEmail().getValue(),
      contactName: prospect.getContactName(),
      status: {
        value: prospect.getStatus().getValue(),
        label: prospect.getStatus().getLabel(),
        color: prospect.getStatus().getColor(),
        priority: prospect.getStatus().getPriority(),
      },
      assignedSalesRep: prospect.getAssignedSalesRep().getValue(),
      estimatedValue: {
        amount: prospect.getEstimatedValue().getAmount(),
        currency: prospect.getEstimatedValue().getCurrency(),
      },
      estimatedMonthlyPrice: {
        amount: prospect.getEstimatedMonthlyPrice().getAmount(),
        currency: prospect.getEstimatedMonthlyPrice().getCurrency(),
      },
      annualRevenuePotential: {
        amount: prospect.getAnnualRevenuePotential().getAmount(),
        currency: prospect.getAnnualRevenuePotential().getCurrency(),
      },
      businessSize: {
        value: prospect.getBusinessSize(),
        label: BusinessSize.getLabel(prospect.getBusinessSize()),
        icon: BusinessSize.getIcon(prospect.getBusinessSize()),
      },
      staffCount: prospect.getStaffCount(),
      source: prospect.getSource(),
      isHotProspect: prospect.isHotProspect(),
      createdAt: prospect.getCreatedAt().toISOString(),
      updatedAt: prospect.getUpdatedAt().toISOString(),
    }));

    // Métadonnées de pagination
    const meta = {
      currentPage: searchResult.page,
      totalPages: searchResult.totalPages,
      totalItems: searchResult.total,
      itemsPerPage: searchResult.limit,
      hasNextPage: searchResult.page < searchResult.totalPages,
      hasPrevPage: searchResult.page > 1,
    };

    // Filtres appliqués et disponibles
    const filters = {
      applied: {
        search: request.search,
        status: request.status,
        assignedSalesRep: request.assignedSalesRep,
        businessSize: request.businessSize,
        source: request.source,
        minEstimatedValue: request.minEstimatedValue,
        maxEstimatedValue: request.maxEstimatedValue,
        minStaffCount: request.minStaffCount,
        maxStaffCount: request.maxStaffCount,
        isHotProspect: request.isHotProspect,
      },
      available: {
        statuses: Object.values(ProspectStatusEnum).map((status) => {
          const statusObj = ProspectStatus.fromString(status);
          return {
            value: status,
            label: statusObj.getLabel(),
            color: statusObj.getColor(),
          };
        }),
        businessSizes: Object.values(BusinessSizeEnum).map((size) => ({
          value: size,
          label: BusinessSize.getLabel(size),
          icon: BusinessSize.getIcon(size),
        })),
        sources: [
          'DIRECT',
          'WEBSITE',
          'REFERRAL',
          'ADVERTISING',
          'SOCIAL_MEDIA',
          'COLD_CALLING',
          'EMAIL_CAMPAIGN',
        ],
      },
    };

    return {
      data,
      meta,
      filters,
      summary,
    };
  }
}
