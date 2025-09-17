/**
 * 🏛️ APPLICATION MODULE - Services Application Layer
 * ✅ Clean Architecture compliant
 * ✅ Services purs de la couche application
 */

import { Module } from '@nestjs/common';
import { UserCacheService } from './services/user-cache.service';
import { TOKENS } from '../shared/constants/injection-tokens';

@Module({
  providers: [
    // 💾 Service de cache utilisateur
    {
      provide: TOKENS.USER_CACHE_SERVICE,
      useClass: UserCacheService,
    },
  ],
  exports: [TOKENS.USER_CACHE_SERVICE],
})
export class ApplicationModule {}
