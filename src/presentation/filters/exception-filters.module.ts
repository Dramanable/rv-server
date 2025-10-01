/**
 * 🚨 Exception Filters Module - Configuration centralisée de la gestion d'exceptions
 *
 * Regroupe tous les Exception Filters pour une gestion précise et standardisée
 * des erreurs selon les principes NestJS et Clean Architecture
 */

import { DatabaseModule } from "@infrastructure/database/database.module";
import { Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { ApplicationExceptionFilter } from "./application-exception.filter";
import { DomainExceptionFilter } from "./domain-exception.filter";
import { GlobalExceptionFilter } from "./global-exception.filter";
import { InfrastructureExceptionFilter } from "./infrastructure-exception.filter";
import { ValidationExceptionFilter } from "./validation-exception.filter";

@Module({
  imports: [
    // Import du module Database qui fournit I18N_SERVICE
    DatabaseModule,
  ],
  providers: [
    // 🎯 Ordre important : du plus spécifique au plus général

    // 1. Domain Exceptions (règles métier)
    {
      provide: APP_FILTER,
      useClass: DomainExceptionFilter,
    },

    // 2. Application Exceptions (orchestration)
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter,
    },

    // 3. Validation Exceptions (DTO validation)
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },

    // 4. Infrastructure Exceptions (base de données, services externes)
    {
      provide: APP_FILTER,
      useClass: InfrastructureExceptionFilter,
    },

    // 5. Global Exception Filter (catch-all pour les erreurs non gérées)
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class ExceptionFiltersModule {}

/**
 * 📋 Ordre d'exécution des Exception Filters
 *
 * NestJS exécute les filters dans l'ordre inverse de déclaration :
 * 1. GlobalExceptionFilter (catch-all) - dernier recours
 * 2. InfrastructureExceptionFilter - erreurs techniques
 * 3. ValidationExceptionFilter - validation HTTP/DTO
 * 4. ApplicationExceptionFilter - erreurs d'orchestration
 * 5. DomainExceptionFilter - violations règles métier (priorité)
 *
 * Cette configuration garantit que chaque type d'exception est traité
 * par le filter le plus spécialisé disponible.
 */
