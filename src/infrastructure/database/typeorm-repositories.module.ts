/**
 * 🗄️ TypeORM Module - Real Database Implementation
 *
 * Module pour les vraies implémentations TypeORM des repositories
 * Remplace les mocks du DatabaseModule par de vraies connexions DB
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

import { TOKENS } from '../../shared/constants/injection-tokens';
import { PinoLoggerModule } from '../logging/pino-logger.module';

// Entities TypeORM
import { AppointmentOrmEntity } from './sql/postgresql/entities/appointment-orm.entity';
import { BusinessOrmEntity } from './sql/postgresql/entities/business-orm.entity';
import { BusinessSectorOrmEntity } from './sql/postgresql/entities/business-sector-orm.entity';
import { CalendarOrmEntity } from './sql/postgresql/entities/calendar-orm.entity';
import { CalendarTypeOrmEntity } from './sql/postgresql/entities/calendar-type-orm.entity';
import { PermissionOrmEntity } from './sql/postgresql/entities/permission-orm.entity';
import { ProfessionalOrmEntity } from './sql/postgresql/entities/professional-orm.entity';
import { ProfessionalRoleOrmEntity } from './sql/postgresql/entities/professional-role-orm.entity';
import { RefreshTokenOrmEntity } from './sql/postgresql/entities/refresh-token-orm.entity';
import { ServiceOrmEntity } from './sql/postgresql/entities/service-orm.entity';
import { ServiceTypeOrmEntity } from './sql/postgresql/entities/service-type-orm.entity';
import { StaffOrmEntity } from './sql/postgresql/entities/staff-orm.entity';
import { UserOrmEntity } from './sql/postgresql/entities/user-orm.entity';

// 🎭 RBAC Entities
import { BusinessContextOrmEntity } from './sql/postgresql/entities/business-context-orm.entity';
import { RoleAssignmentOrmEntity } from './sql/postgresql/entities/role-assignment-orm.entity';

// Repository Implementations
import { RefreshTokenOrmRepository } from './sql/postgresql/repositories/refresh-token-orm.repository';
import { TypeOrmAppointmentRepository } from './sql/postgresql/repositories/typeorm-appointment.repository';
import { TypeOrmBusinessRepository } from './sql/postgresql/repositories/typeorm-business.repository';
import { TypeOrmCalendarTypeRepository } from './sql/postgresql/repositories/typeorm-calendar-type.repository';
import { TypeOrmCalendarRepository } from './sql/postgresql/repositories/typeorm-calendar.repository';
import { TypeOrmPermissionRepository } from './sql/postgresql/repositories/typeorm-permission.repository';
import { TypeOrmProfessionalRoleRepository } from './sql/postgresql/repositories/typeorm-professional-role.repository';
import { TypeOrmProfessionalRepository } from './sql/postgresql/repositories/typeorm-professional.repository';
import { TypeOrmServiceTypeRepository } from './sql/postgresql/repositories/typeorm-service-type.repository';
import { TypeOrmServiceRepository } from './sql/postgresql/repositories/typeorm-service.repository';
import { TypeOrmStaffRepository } from './sql/postgresql/repositories/typeorm-staff.repository';
import { TypeOrmUserRepository } from './sql/postgresql/repositories/user.repository';

// 🎭 RBAC Repository Implementations
import { TypeOrmRbacBusinessContextRepository } from './sql/postgresql/repositories/typeorm-rbac-business-context.repository';
import { TypeOrmRoleAssignmentRepository } from './sql/postgresql/repositories/typeorm-role-assignment.repository';

// Services nécessaires
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { ProductionI18nService } from '../i18n/production-i18n.service';

// 🛡️ RBAC Permission Service - Real Implementation
import { RbacPermissionService } from '../services/rbac-permission.service';

@Module({
  imports: [
    // Configuration TypeORM pour les entités spécifiques
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RefreshTokenOrmEntity,
      AppointmentOrmEntity,
      BusinessOrmEntity,
      BusinessSectorOrmEntity, // Décommenté pour activer la relation
      PermissionOrmEntity,
      ServiceOrmEntity,
      ServiceTypeOrmEntity, // ✅ ServiceType entity
      StaffOrmEntity,
      CalendarOrmEntity,
      CalendarTypeOrmEntity,
      ProfessionalOrmEntity, // ✅ Professional entity for actor separation
      ProfessionalRoleOrmEntity, // ✅ Professional Role entity
      // 🎭 RBAC Entities
      RoleAssignmentOrmEntity,
      BusinessContextOrmEntity,
    ]),
    // Import du PinoLoggerModule pour avoir accès au Logger
    PinoLoggerModule,
  ],
  providers: [
    // User Repository (vraie implémentation TypeORM)
    {
      provide: TOKENS.USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },

    // BusinessSector Repository (temporairement commenté à cause des problèmes de décorateurs TS 5.7)
    // {
    //   provide: TOKENS.BUSINESS_SECTOR_REPOSITORY,
    //   useClass: TypeOrmBusinessSectorRepository,
    // },

    // RefreshToken Repository (vraie implémentation TypeORM)
    {
      provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
      useFactory: (refreshTokenRepository, logger: Logger) =>
        new RefreshTokenOrmRepository(refreshTokenRepository, logger),
      inject: [getRepositoryToken(RefreshTokenOrmEntity), TOKENS.LOGGER],
    },

    // Business Repository
    {
      provide: TOKENS.BUSINESS_REPOSITORY,
      useClass: TypeOrmBusinessRepository,
    },

    // Service Repository
    {
      provide: TOKENS.SERVICE_REPOSITORY,
      useClass: TypeOrmServiceRepository,
    },

    // ServiceType Repository
    {
      provide: TOKENS.SERVICE_TYPE_REPOSITORY,
      useClass: TypeOrmServiceTypeRepository,
    },

    // Staff Repository
    {
      provide: TOKENS.STAFF_REPOSITORY,
      useClass: TypeOrmStaffRepository,
    },

    // Calendar Repository
    {
      provide: TOKENS.CALENDAR_REPOSITORY,
      useClass: TypeOrmCalendarRepository,
    },

    // CalendarType Repository
    {
      provide: TOKENS.CALENDAR_TYPE_REPOSITORY,
      useClass: TypeOrmCalendarTypeRepository,
    },

    // Appointment Repository
    {
      provide: TOKENS.APPOINTMENT_REPOSITORY,
      useClass: TypeOrmAppointmentRepository,
    },

    // Professional Repository (✅ Professional entity for actor separation)
    {
      provide: TOKENS.PROFESSIONAL_REPOSITORY,
      useClass: TypeOrmProfessionalRepository,
    },

    // Professional Role Repository
    {
      provide: TOKENS.PROFESSIONAL_ROLE_REPOSITORY,
      useClass: TypeOrmProfessionalRoleRepository,
    },

    // Permission Repository
    {
      provide: TOKENS.PERMISSION_REPOSITORY,
      useClass: TypeOrmPermissionRepository,
    },

    // 🎭 RBAC Repositories
    {
      provide: TOKENS.ROLE_ASSIGNMENT_REPOSITORY,
      useFactory: (ormRepository: any, logger: Logger, i18n: I18nService) =>
        new TypeOrmRoleAssignmentRepository(ormRepository, logger, i18n),
      inject: [
        getRepositoryToken(RoleAssignmentOrmEntity),
        'Logger',
        'I18nService',
      ],
    },

    {
      provide: TOKENS.RBAC_BUSINESS_CONTEXT_REPOSITORY,
      useFactory: (ormRepository: any, logger: Logger, i18n: I18nService) =>
        new TypeOrmRbacBusinessContextRepository(ormRepository, logger, i18n),
      inject: [
        getRepositoryToken(BusinessContextOrmEntity),
        'Logger',
        'I18nService',
      ],
    },

    // 🛡️ RBAC Permission Service - Real Implementation with Business Rules
    {
      provide: TOKENS.PERMISSION_SERVICE,
      useFactory: (
        roleAssignmentRepository: any,
        businessContextRepository: any,
        userRepository: any,
        logger: Logger,
        i18n: I18nService,
      ) =>
        new RbacPermissionService(
          roleAssignmentRepository,
          businessContextRepository,
          userRepository,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.ROLE_ASSIGNMENT_REPOSITORY,
        TOKENS.RBAC_BUSINESS_CONTEXT_REPOSITORY,
        TOKENS.USER_REPOSITORY,
        'Logger',
        'I18nService',
      ],
    },

    // I18n Service
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: ProductionI18nService,
    },
  ],
  exports: [
    TOKENS.USER_REPOSITORY,
    // TOKENS.BUSINESS_SECTOR_REPOSITORY, // Temporairement commenté
    TOKENS.REFRESH_TOKEN_REPOSITORY,
    TOKENS.PERMISSION_SERVICE,
    TOKENS.BUSINESS_REPOSITORY,
    TOKENS.SERVICE_REPOSITORY,
    TOKENS.SERVICE_TYPE_REPOSITORY, // ✅ ServiceType repository
    TOKENS.STAFF_REPOSITORY,
    TOKENS.CALENDAR_REPOSITORY,
    TOKENS.CALENDAR_TYPE_REPOSITORY,
    TOKENS.APPOINTMENT_REPOSITORY,
    TOKENS.PROFESSIONAL_REPOSITORY, // ✅ Professional repository for actor separation
    TOKENS.PROFESSIONAL_ROLE_REPOSITORY, // ✅ Professional Role repository
    TOKENS.PERMISSION_REPOSITORY,
    // 🎭 RBAC Repositories
    TOKENS.ROLE_ASSIGNMENT_REPOSITORY,
    TOKENS.RBAC_BUSINESS_CONTEXT_REPOSITORY,
    // Services
    TOKENS.I18N_SERVICE,
  ],
})
export class TypeOrmRepositoriesModule {}
