/**
 * 🎯 PROSPECT USE CASE TYPES - Application Layer
 *
 * Types et interfaces pour les use cases de gestion des prospects
 * dans le contexte de l'organisation SaaS interne.
 */

// ➕ CREATE PROSPECT TYPES
export interface CreateProspectRequest {
  readonly businessName: string;
  readonly contactName: string;
  readonly email: string;
  readonly phone?: string;
  readonly description?: string;
  readonly businessSize: string;
  readonly estimatedStaffCount?: number;
  readonly estimatedValue?: number;
  readonly estimatedValueCurrency?: string;
  readonly status?: string;
  readonly source?: string;
  readonly assignedSalesRep?: string;
  readonly lastContactDate?: Date;
  readonly notes?: string;
  readonly pricingProposal?: any;
  readonly proposedMonthlyPrice?: number;
  readonly proposedCurrency?: string;
  readonly expectedClosingDate?: Date;
  readonly priorityScore?: number;
  readonly firstContactDate?: Date;
  readonly tags?: string[];
  readonly customFields?: any;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

// 📄 GET PROSPECT TYPES
export interface GetProspectRequest {
  readonly prospectId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

// 🔍 LIST PROSPECTS TYPES
export interface ListProspectsRequest {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly search?: string;
    readonly status?: string;
    readonly businessSize?: string;
    readonly assignedSalesRep?: string;
    readonly source?: string;
    readonly minPriorityScore?: number;
    readonly minEstimatedValue?: number;
    readonly hasProposal?: boolean;
    readonly createdAfter?: Date;
    readonly createdBefore?: Date;
    readonly lastContactAfter?: Date;
  };
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface ListProspectsResponse {
  readonly data: any[]; // Will be Prospect[] entities
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

// ✏️ UPDATE PROSPECT TYPES
export interface UpdateProspectRequest {
  readonly prospectId: string;
  readonly updates: {
    readonly businessName?: string;
    readonly contactName?: string;
    readonly email?: string;
    readonly phone?: string;
    readonly description?: string;
    readonly businessSize?: string;
    readonly estimatedStaffCount?: number;
    readonly estimatedValue?: number;
    readonly estimatedValueCurrency?: string;
    readonly status?: string;
    readonly source?: string;
    readonly assignedSalesRep?: string;
    readonly lastContactDate?: Date;
    readonly notes?: string;
    readonly pricingProposal?: any;
    readonly proposedMonthlyPrice?: number;
    readonly proposedCurrency?: string;
    readonly expectedClosingDate?: Date;
    readonly priorityScore?: number;
    readonly firstContactDate?: Date;
    readonly tags?: string[];
    readonly customFields?: any;
  };
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

// 🗑️ DELETE PROSPECT TYPES
export interface DeleteProspectRequest {
  readonly prospectId: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}
