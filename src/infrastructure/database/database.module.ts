import { Module } from '@nestjs/common';
import { RepositoryFactory } from './repositories/repository.factory';

/**
 * 🗄️ Production Database Module
 * ✅ Clean Architecture compliant
 * ✅ SQL and NoSQL repositories via Factory Pattern
 * 🚫 No in-memory repositories - production only
 */
@Module({
  providers: [
    RepositoryFactory,
    {
      provide: 'BusinessRepository',
      useFactory: (factory: RepositoryFactory) =>
        factory.createBusinessRepository(),
      inject: [RepositoryFactory],
    },
    {
      provide: 'UserRepository',
      useFactory: (factory: RepositoryFactory) =>
        factory.createUserRepository(),
      inject: [RepositoryFactory],
    },
    {
      provide: 'CalendarRepository',
      useFactory: (factory: RepositoryFactory) =>
        factory.createCalendarRepository(),
      inject: [RepositoryFactory],
    },
  ],
  exports: [
    'BusinessRepository',
    'UserRepository',
    'CalendarRepository',
    RepositoryFactory,
  ],
})
export class DatabaseModule {}
