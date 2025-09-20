/**
 * 📄 Business Sector Use Case Types
 *
 * Types centralisés pour tous les use cases de secteurs d'activité
 */

// Re-exports from individual use cases
export type {
  CreateBusinessSectorRequest,
  CreateBusinessSectorResponse,
} from './create-business-sector.use-case';

export type {
  ListBusinessSectorsRequest,
  ListBusinessSectorsResponse,
} from './list-business-sectors.use-case';

export type {
  UpdateBusinessSectorRequest,
  UpdateBusinessSectorResponse,
} from './update-business-sector.use-case';

export type {
  DeleteBusinessSectorRequest,
  DeleteBusinessSectorResponse,
} from './delete-business-sector.use-case';
