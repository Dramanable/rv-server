/**
 * 🔄 MAPPERS MODULE - Infrastructure Layer
 *
 * Module dédié aux mappers pour Clean Architecture
 * Fournit les services de mapping entre les couches
 */

import { Module } from '@nestjs/common';
import { AuthResponseMapper, UserMapper } from './domain-mappers';

@Module({
  providers: [
    // Mappers en tant que services
    {
      provide: 'USER_MAPPER',
      useValue: UserMapper,
    },
    {
      provide: 'AUTH_RESPONSE_MAPPER',
      useValue: AuthResponseMapper,
    },
  ],
  exports: ['USER_MAPPER', 'AUTH_RESPONSE_MAPPER'],
})
export class MappersModule {}
