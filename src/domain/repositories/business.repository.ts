/**
 * 🏢 BUSINESS REPOSITORY INTERFACE
 * ✅ Port pour persistance Business
 * ✅ Clean Architecture compliance
 */

import { Business } from '../entities/business.entity';
import { BusinessId } from '../value-objects/business-id.value-object';

export interface BusinessRepository {
  findById(id: BusinessId): Promise<Business | null>;
  save(business: Business): Promise<Business>;
  findAll(): Promise<Business[]>;
  delete(id: BusinessId): Promise<void>;
}
