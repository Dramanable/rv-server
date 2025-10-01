/**
 * 🏪 PROSPECT REPOSITORY INTERFACE - Domain Layer
 * ✅ Clean Architecture - Domain Port
 * ✅ Interface pour la persistence des prospects commerciaux
 */

import { Prospect } from '@domain/entities/prospect.entity';
import { ProspectId } from '@domain/value-objects/prospect-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';
import { BusinessSizeEnum } from '@domain/enums/business-size.enum';

export interface ProspectFilters {
  readonly status?: ProspectStatus;
  readonly assignedSalesRep?: UserId;
  readonly businessSize?: BusinessSizeEnum;
  readonly source?: string;
  readonly minEstimatedValue?: number;
  readonly maxEstimatedValue?: number;
  readonly minStaffCount?: number;
  readonly maxStaffCount?: number;
  readonly search?: string; // Recherche dans businessName, contactName, contactEmail
  readonly isHotProspect?: boolean;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
  readonly updatedAfter?: Date;
  readonly updatedBefore?: Date;
}

export interface ProspectSortOptions {
  readonly field:
    | 'businessName'
    | 'contactName'
    | 'status'
    | 'estimatedValue'
    | 'staffCount'
    | 'createdAt'
    | 'updatedAt';
  readonly direction: 'ASC' | 'DESC';
}

export interface ProspectPaginationOptions {
  readonly page: number;
  readonly limit: number;
}

export interface ProspectSearchResult {
  readonly prospects: Prospect[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

export interface IProspectRepository {
  /**
   * 💾 Enregistrer un prospect
   */
  save(prospect: Prospect): Promise<Prospect>;

  /**
   * 🔍 Trouver un prospect par ID
   */
  findById(id: ProspectId): Promise<Prospect | null>;

  /**
   * 📋 Trouver tous les prospects avec filtres et pagination
   */
  findAll(
    filters?: ProspectFilters,
    sortOptions?: ProspectSortOptions,
    paginationOptions?: ProspectPaginationOptions,
  ): Promise<ProspectSearchResult>;

  /**
   * 👨‍💼 Trouver les prospects assignés à un commercial
   */
  findByAssignedSalesRep(
    salesRepId: UserId,
    filters?: Omit<ProspectFilters, 'assignedSalesRep'>,
    sortOptions?: ProspectSortOptions,
    paginationOptions?: ProspectPaginationOptions,
  ): Promise<ProspectSearchResult>;

  /**
   * 📊 Trouver les prospects par statut
   */
  findByStatus(
    status: ProspectStatus,
    filters?: Omit<ProspectFilters, 'status'>,
    sortOptions?: ProspectSortOptions,
    paginationOptions?: ProspectPaginationOptions,
  ): Promise<ProspectSearchResult>;

  /**
   * 🔥 Trouver les prospects chauds (hot prospects)
   */
  findHotProspects(
    salesRepId?: UserId,
    paginationOptions?: ProspectPaginationOptions,
  ): Promise<ProspectSearchResult>;

  /**
   * 📈 Compter les prospects par statut
   */
  countByStatus(): Promise<Record<string, number>>;

  /**
   * 📊 Compter les prospects par commercial
   */
  countBySalesRep(): Promise<Record<string, number>>;

  /**
   * 💰 Calculer la valeur totale du pipeline
   */
  getTotalPipelineValue(salesRepId?: UserId): Promise<number>;

  /**
   * 📅 Trouver les prospects créés dans une période
   */
  findByDateRange(
    startDate: Date,
    endDate: Date,
    filters?: ProspectFilters,
    sortOptions?: ProspectSortOptions,
    paginationOptions?: ProspectPaginationOptions,
  ): Promise<ProspectSearchResult>;

  /**
   * 🔍 Recherche textuelle dans les prospects
   */
  searchByText(
    searchTerm: string,
    filters?: Omit<ProspectFilters, 'search'>,
    sortOptions?: ProspectSortOptions,
    paginationOptions?: ProspectPaginationOptions,
  ): Promise<ProspectSearchResult>;

  /**
   * 🗑️ Supprimer un prospect
   */
  delete(id: ProspectId): Promise<void>;

  /**
   * 📈 Obtenir les métriques du pipeline
   */
  getPipelineMetrics(salesRepId?: UserId): Promise<{
    totalProspects: number;
    activeProspects: number;
    closedWonProspects: number;
    closedLostProspects: number;
    conversionRate: number;
    averageDealValue: number;
    totalPipelineValue: number;
    averageStaffCount: number;
  }>;

  /**
   * 📊 Obtenir les statistiques par taille d'entreprise
   */
  getStatsByBusinessSize(): Promise<
    Record<
      BusinessSizeEnum,
      {
        count: number;
        totalValue: number;
        averageValue: number;
        conversionRate: number;
      }
    >
  >;

  /**
   * 📈 Obtenir les prospects convertis dans une période
   */
  getConvertedProspects(
    startDate: Date,
    endDate: Date,
    salesRepId?: UserId,
  ): Promise<Prospect[]>;

  /**
   * ⏰ Trouver les prospects sans activité récente
   */
  findStaleProspects(
    daysWithoutActivity: number,
    excludeStatuses?: ProspectStatus[],
  ): Promise<Prospect[]>;

  /**
   * 📧 Vérifier si un email contact existe déjà
   */
  existsByContactEmail(email: string): Promise<boolean>;

  /**
   * 🏢 Vérifier si un nom d'entreprise existe déjà
   */
  existsByBusinessName(businessName: string): Promise<boolean>;
}
