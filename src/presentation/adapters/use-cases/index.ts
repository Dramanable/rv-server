/**
 * 📁 USE CASE ADAPTERS INDEX
 * ✅ Centralisation des adapters NestJS
 * ✅ Clean Architecture - Framework isolation
 * ✅ Export vers modules NestJS
 */

// Business Use Case Adapters
export { ListBusinessAdapter } from './list-business.adapter';
export { CreateBusinessAdapter } from './create-business.adapter';

// User Use Case Adapters (à créer)
// export { CreateUserAdapter } from './create-user.adapter';
// export { UpdateUserAdapter } from './update-user.adapter';
// export { GetUserAdapter } from './get-user.adapter';
// export { SearchUsersAdapter } from './search-users.adapter';
// export { DeleteUserAdapter } from './delete-user.adapter';

// Staff Use Case Adapters (à créer) 
// export { CreateStaffAdapter } from './create-staff.adapter';

// Service Use Case Adapters (à créer)
// export { CreateServiceAdapter } from './create-service.adapter';

// Calendar Use Case Adapters (à créer)
// export { CreateCalendarAdapter } from './create-calendar.adapter';

// Collection des adapters pour faciliter l'injection
export const USE_CASE_ADAPTERS = [
  ListBusinessAdapter,
  CreateBusinessAdapter,
  // Ajouter les autres adapters au fur et à mesure
] as const;
