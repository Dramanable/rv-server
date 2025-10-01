/**
 * 🎯 PROSPECT TYPES - Presentation Layer
 * ✅ Types pour les mappers - Import depuis Use Cases existants
 */

// Re-export des types depuis les use cases avec export type
export type {
  CreateProspectRequest,
  CreateProspectResponse,
} from '@application/use-cases/prospects/create-prospect.use-case';

export type {
  UpdateProspectRequest,
  UpdateProspectResponse,
} from '@application/use-cases/prospects/update-prospect.use-case';

export type {
  ListProspectsRequest,
  ListProspectsResponse,
} from '@application/use-cases/prospects/list-prospects.use-case';

export type {
  GetProspectByIdRequest,
  GetProspectByIdResponse,
} from '@application/use-cases/prospects/get-prospect-by-id.use-case';

export type {
  DeleteProspectRequest,
  DeleteProspectResponse,
} from '@application/use-cases/prospects/delete-prospect.use-case';
