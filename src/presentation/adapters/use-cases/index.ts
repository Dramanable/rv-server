/**
 * 📁 USE CASE ADAPTERS INDEX
 * ✅ Centralisation des adapters NestJS
 * ✅ Clean Architecture - Framework isolation
 * ✅ Export vers modules NestJS
 */

// Business Use Case Adapters
export { ListBusinessAdapter } from './list-business.adapter';
export { CreateBusinessAdapter } from './create-business.adapter';

// User Use Case Adapters  
export { CreateUserAdapter } from './create-user.adapter';

// Collection des adapters pour faciliter l'injection
export const USE_CASE_ADAPTERS = [
  ListBusinessAdapter,
  CreateBusinessAdapter,
  CreateUserAdapter,
] as const;
