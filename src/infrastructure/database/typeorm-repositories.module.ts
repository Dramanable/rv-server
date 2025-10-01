/**
 * 🗄️ TypeORM Module - Real Database Implementation
 *
 * Modimport { RbacPermissionService } from '../services/rbac-permission.service';
import { TestPermissionService } from '../services/test-permission.service';

// Simple Permission Service
import { SimplePermissionService } from '../../application/services/simple-permission.service';pour les vraies implémentations TypeORM des repositories
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
import { PasswordResetCodeEntity } from './sql/postgresql/entities/password-reset-code.entity';
import { PermissionOrmEntity } from './sql/postgresql/entities/permission-orm.entity';
import { ProspectOrmEntity } from './sql/postgresql/entities/prospect-orm.entity';
import { ProfessionalRoleOrmEntity } from './sql/postgresql/entities/professional-role-orm.entity';
import { RefreshTokenOrmEntity } from './sql/postgresql/entities/refresh-token-orm.entity';
import { ServiceOrmEntity } from './sql/postgresql/entities/service-orm.entity';
import { ServiceTypeOrmEntity } from './sql/postgresql/entities/service-type-orm.entity';
import { SkillOrmEntity } from './sql/postgresql/entities/skill-orm.entity';
import { StaffOrmEntity } from './sql/postgresql/entities/staff-orm.entity';
import { UserOrmEntity } from './sql/postgresql/entities/user-orm.entity';

// 🎭 RBAC Entities
import { BusinessContextOrmEntity } from './sql/postgresql/entities/business-context-orm.entity';
import { RoleAssignmentOrmEntity } from './sql/postgresql/entities/role-assignment-orm.entity';

// 🔐 Permission Entities
import { UserPermissionOrmEntity } from './sql/postgresql/entities/user-permission-orm.entity';

// Repository Implementations
import { PasswordResetCodeRepository } from './sql/postgresql/repositories/password-reset-code.repository';
import { RefreshTokenOrmRepository } from './sql/postgresql/repositories/refresh-token-orm.repository';
import { TypeOrmAppointmentRepository } from './sql/postgresql/repositories/typeorm-appointment.repository';
import { TypeOrmBusinessRepository } from './sql/postgresql/repositories/typeorm-business.repository';
import { TypeOrmCalendarTypeRepository } from './sql/postgresql/repositories/typeorm-calendar-type.repository';
import { TypeOrmCalendarRepository } from './sql/postgresql/repositories/typeorm-calendar.repository';
import { TypeOrmPermissionRepository } from './sql/postgresql/repositories/typeorm-permission.repository';
import { TypeOrmProfessionalRoleRepository } from './sql/postgresql/repositories/typeorm-professional-role.repository';
import { TypeOrmProspectRepository } from './sql/postgresql/repositories/typeorm-prospect.repository';
import { TypeOrmServiceTypeRepository } from './sql/postgresql/repositories/typeorm-service-type.repository';
import { TypeOrmServiceRepository } from './sql/postgresql/repositories/typeorm-service.repository';
import { TypeOrmSkillRepository } from './sql/postgresql/repositories/typeorm-skill.repository';
import { TypeOrmStaffRepository } from './sql/postgresql/repositories/typeorm-staff.repository';
import { TypeOrmUserRepository } from './sql/postgresql/repositories/user.repository';

// � BusinessSector Repository Implementation
import { TypeOrmBusinessSectorRepository } from './sql/postgresql/repositories/typeorm-business-sector.repository';

// �🎭 RBAC Repository Implementations
import { TypeOrmRbacBusinessContextRepository } from './sql/postgresql/repositories/typeorm-rbac-business-context.repository';
import { TypeOrmRoleAssignmentRepository } from './sql/postgresql/repositories/typeorm-role-assignment.repository';

// Services nécessaires
import type { I18nService } from '../../application/ports/i18n.port';
import type { Logger } from '../../application/ports/logger.port';
import { ProductionI18nService } from '../i18n/production-i18n.service';

// 🔐 Permission Repositories
import { TypeOrmUserPermissionRepository } from './sql/postgresql/repositories/typeorm-user-permission.repository';

// 🛡️ RBAC Permission Service - Real Implementation
import { RbacPermissionService } from '../services/rbac-permission.service';
import { TestPermissionService } from '../services/test-permission.service';

// Permission Service
import { SimplePermissionService } from '../../application/services/simple-permission.service';

@Module({
  imports: [
    // Configuration TypeORM pour les entités spécifiques
    TypeOrmModule.forFeature([
      UserOrmEntity,
      RefreshTokenOrmEntity,
      PasswordResetCodeEntity,
      AppointmentOrmEntity,
      BusinessOrmEntity,
      BusinessSectorOrmEntity, // Décommenté pour activer la relation
      PermissionOrmEntity,
      ServiceOrmEntity,
      ServiceTypeOrmEntity, // ✅ ServiceType entity
      SkillOrmEntity, // ✅ Skill entity
      StaffOrmEntity,
      CalendarOrmEntity,
      CalendarTypeOrmEntity,
      ProspectOrmEntity, // ✅ Prospect entity for sales organization
      ProfessionalRoleOrmEntity, // ✅ Professional Role entity
      // 🎭 RBAC Entities
      RoleAssignmentOrmEntity,
      BusinessContextOrmEntity,
      // 🔐 Permission Entities
      UserPermissionOrmEntity,
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

    // BusinessSector Repository
    {
      provide: TOKENS.BUSINESS_SECTOR_REPOSITORY,
      useClass: TypeOrmBusinessSectorRepository,
    },

    // RefreshToken Repository (vraie implémentation TypeORM)
    {
      provide: TOKENS.REFRESH_TOKEN_REPOSITORY,
      useFactory: (refreshTokenRepository, logger: Logger) =>
        new RefreshTokenOrmRepository(refreshTokenRepository, logger),
      inject: [getRepositoryToken(RefreshTokenOrmEntity), TOKENS.LOGGER],
    },

    // Password Reset Code Repository
    {
      provide: TOKENS.PASSWORD_RESET_CODE_REPOSITORY,
      useClass: PasswordResetCodeRepository,
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

    // Skill Repository
    {
      provide: TOKENS.SKILL_REPOSITORY,
      useClass: TypeOrmSkillRepository,
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

    // Prospect Repository (✅ Prospect entity for sales organization)
    {
      provide: TOKENS.PROSPECT_REPOSITORY,
      useClass: TypeOrmProspectRepository,
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

    // 🛡️ TEST Permission Service - Simplified for Testing
    {
      provide: TOKENS.PERMISSION_SERVICE,
      useFactory: (logger: Logger, i18n: I18nService) =>
        new TestPermissionService(logger, i18n),
      inject: ['Logger', 'I18nService'],
    },

    // I18n Service
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: ProductionI18nService,
    },

    // 🔐 User Permission Repository
    {
      provide: TOKENS.USER_PERMISSION_REPOSITORY,
      useClass: TypeOrmUserPermissionRepository,
    },

    // 🔐 Simple Permission Service
    {
      provide: TOKENS.SIMPLE_PERMISSION_SERVICE,
      useFactory: (userPermissionRepository) =>
        new SimplePermissionService(userPermissionRepository),
      inject: [TOKENS.USER_PERMISSION_REPOSITORY],
    },
  ],
  exports: [
    TOKENS.USER_REPOSITORY,
    TOKENS.BUSINESS_SECTOR_REPOSITORY,
    TOKENS.REFRESH_TOKEN_REPOSITORY,
    TOKENS.PASSWORD_RESET_CODE_REPOSITORY, // ✅ Password Reset Code repository - AJOUTÉ
    TOKENS.PERMISSION_SERVICE,
    TOKENS.BUSINESS_REPOSITORY,
    TOKENS.SERVICE_REPOSITORY,
    TOKENS.SERVICE_TYPE_REPOSITORY, // ✅ ServiceType repository
    TOKENS.SKILL_REPOSITORY, // ✅ Skill repository
    TOKENS.STAFF_REPOSITORY,
    TOKENS.CALENDAR_REPOSITORY,
    TOKENS.CALENDAR_TYPE_REPOSITORY,
    TOKENS.APPOINTMENT_REPOSITORY,
    TOKENS.PROSPECT_REPOSITORY, // ✅ Prospect repository for sales organization
    TOKENS.PROFESSIONAL_ROLE_REPOSITORY, // ✅ Professional Role repository
    TOKENS.PERMISSION_REPOSITORY,
    // 🎭 RBAC Repositories
    TOKENS.ROLE_ASSIGNMENT_REPOSITORY,
    TOKENS.RBAC_BUSINESS_CONTEXT_REPOSITORY,
    // 🔐 Permission Repositories & Services
    TOKENS.USER_PERMISSION_REPOSITORY,
    TOKENS.SIMPLE_PERMISSION_SERVICE,
    // Services
    TOKENS.I18N_SERVICE,
  ],
})
export class TypeOrmRepositoriesModule {}
