/**
 * 🎨 PRESENTATION MODULE - Couche de presentation Clean Architecture
 * ✅ Controllers HTTP
 * ✅ Security Guards & Pipes
 * ✅ Use Cases injection
 * ✅ Swagger configuration
 */

import { Module } from '@nestjs/common';

// 🏗️ Modules d'infrastructure
import { DatabaseModule } from '@infrastructure/database/database.module';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

// 📝 Tokens pour l'injection de dépendances
import { APPLICATION_TOKENS, TOKENS } from '@shared/constants/injection-tokens';

// 💼 Use Cases pour l'inversion de dépendances (Presentation Layer responsability)
// Auth Use Cases
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { LogoutUseCase } from '@application/use-cases/auth/logout.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import { RegisterUseCase } from '@application/use-cases/auth/register.use-case';

// User Use Cases
import { CreateUserUseCase } from '@application/use-cases/users/create-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/users/delete-user.use-case';
import { GetMeUseCase } from '@application/use-cases/users/get-me.use-case';
import { GetUserByIdUseCase } from '@application/use-cases/users/get-user-by-id.use-case';
import { ListUsersUseCase } from '@application/use-cases/users/list-users.use-case';
import { UpdateUserUseCase } from '@application/use-cases/users/update-user.use-case';

// Business Sector Use Cases
import { CreateBusinessSectorUseCase } from '@application/use-cases/business-sectors/create-business-sector.use-case';
import { DeleteBusinessSectorUseCase } from '@application/use-cases/business-sectors/delete-business-sector.use-case';
import { ListBusinessSectorsUseCase } from '@application/use-cases/business-sectors/list-business-sectors.use-case';
import { UpdateBusinessSectorUseCase } from '@application/use-cases/business-sectors/update-business-sector.use-case';

// Business Use Cases
import { CreateBusinessUseCase } from '@application/use-cases/business/create-business.use-case';
import { GetBusinessUseCase } from '@application/use-cases/business/get-business.use-case';
import { ListBusinessUseCase } from '@application/use-cases/business/list-business.use-case';
import { ManageBusinessHoursUseCase } from '@application/use-cases/business/manage-business-hours.use-case';
import { UpdateBusinessUseCase } from '@application/use-cases/business/update-business.use-case';

// Calendar Use Cases
import { CreateCalendarUseCase } from '@application/use-cases/calendar/create-calendar.use-case';
import { DeleteCalendarUseCase } from '@application/use-cases/calendar/delete-calendar.use-case';
import { GetCalendarByIdUseCase } from '@application/use-cases/calendar/get-calendar-by-id.use-case';
import { ListCalendarsUseCase } from '@application/use-cases/calendar/list-calendars.use-case';
import { UpdateCalendarUseCase } from '@application/use-cases/calendar/update-calendar.use-case';

// 🌩️ AWS S3 Image Management Use Cases
import { AddImageToBusinessGalleryUseCase } from '@application/use-cases/business/add-image-to-gallery.use-case';
import { UpdateBusinessSeoProfileUseCase } from '@application/use-cases/business/update-business-seo.use-case';
import { UploadBusinessImageUseCase } from '@application/use-cases/business/upload-business-image.use-case';

// 🖼️ Business Gallery Use Cases
import { CreateBusinessGalleryUseCase } from '@application/use-cases/business/create-business-gallery.use-case';
import { DeleteBusinessGalleryUseCase } from '@application/use-cases/business/delete-business-gallery.use-case';
import { GetBusinessGalleryUseCase } from '@application/use-cases/business/get-business-gallery.use-case';
import { UpdateBusinessGalleryUseCase } from '@application/use-cases/business/update-business-gallery.use-case';

// Service Use Cases
import { CreateServiceUseCase } from '@application/use-cases/service/create-service.use-case';
import { DeleteServiceUseCase } from '@application/use-cases/service/delete-service.use-case';
import { GetServiceUseCase } from '@application/use-cases/service/get-service.use-case';
import { ListServicesUseCase } from '@application/use-cases/service/list-services.use-case';
import { UpdateServiceUseCase } from '@application/use-cases/service/update-service.use-case';

// ServiceType Use Cases
import { CreateServiceTypeUseCase } from '@application/use-cases/service-types/create-service-type.use-case';
import { DeleteServiceTypeUseCase } from '@application/use-cases/service-types/delete-service-type.use-case';
// import { GetServiceTypeByIdUseCase } from '@application/use-cases/service-types/get-service-type-by-id.use-case';
import { ListServiceTypesUseCase } from '@application/use-cases/service-types/list-service-types.use-case';
import { UpdateServiceTypeUseCase } from '@application/use-cases/service-types/update-service-type.use-case';

// Staff Use Cases
import { CreateStaffUseCase } from '@application/use-cases/staff/create-staff.use-case';
import { DeleteStaffUseCase } from '@application/use-cases/staff/delete-staff.use-case';
import { GetStaffUseCase } from '@application/use-cases/staff/get-staff.use-case';
import { ListStaffUseCase } from '@application/use-cases/staff/list-staff.use-case';
import { UpdateStaffUseCase } from '@application/use-cases/staff/update-staff.use-case';
// 📅 Staff Availability Use Cases - NEW
import { GetAvailableStaffUseCase } from '@application/use-cases/staff/get-available-staff.use-case';
import { GetStaffAvailabilityUseCase } from '@application/use-cases/staff/get-staff-availability.use-case';
import { SetStaffAvailabilityUseCase } from '@application/use-cases/staff/set-staff-availability.use-case';

// Appointment Use Cases
import { BookAppointmentUseCase } from '@application/use-cases/appointments/book-appointment.use-case';
import { CancelAppointmentUseCase } from '@application/use-cases/appointments/cancel-appointment.use-case';
import { GetAppointmentByIdUseCase } from '@application/use-cases/appointments/get-appointment-by-id.use-case';
import { GetAvailableSlotsUseCase } from '@application/use-cases/appointments/get-available-slots-simple.use-case';
import { ListAppointmentsUseCase } from '@application/use-cases/appointments/list-appointments.use-case';
import { UpdateAppointmentUseCase } from '@application/use-cases/appointments/update-appointment.use-case';

// Notification Use Cases
import { SendBulkNotificationUseCase } from '@application/use-cases/notification/send-bulk-notification.use-case';
import { SendNotificationUseCase } from '@application/use-cases/notification/send-notification.use-case';

import { CreatePermissionUseCase } from '@application/use-cases/permissions/create-permission.use-case';
import { DeletePermissionUseCase } from '@application/use-cases/permissions/delete-permission.use-case';
import { GetPermissionByIdUseCase } from '@application/use-cases/permissions/get-permission-by-id.use-case';
import { ListPermissionsUseCase } from '@application/use-cases/permissions/list-permissions.use-case';
import { UpdatePermissionUseCase } from '@application/use-cases/permissions/update-permission.use-case';

// CalendarType Use Cases
import { CreateCalendarTypeUseCase } from '@application/use-cases/calendar-types/create-calendar-type.use-case';
import { DeleteCalendarTypeUseCase } from '@application/use-cases/calendar-types/delete-calendar-type.use-case';
import { GetCalendarTypeByIdUseCase } from '@application/use-cases/calendar-types/get-calendar-type-by-id.use-case';
import { ListCalendarTypesUseCase } from '@application/use-cases/calendar-types/list-calendar-types.use-case';
import { UpdateCalendarTypeUseCase } from '@application/use-cases/calendar-types/update-calendar-type.use-case';

// Professional Use Cases
import { CreateProfessionalUseCase } from '@application/use-cases/professionals/create-professional.use-case';
import { DeleteProfessionalUseCase } from '@application/use-cases/professionals/delete-professional.use-case';
import { GetProfessionalByIdUseCase } from '@application/use-cases/professionals/get-professional-by-id.use-case';
import { ListProfessionalsUseCase } from '@application/use-cases/professionals/list-professionals.use-case';
import { UpdateProfessionalUseCase } from '@application/use-cases/professionals/update-professional.use-case';

// Practitioner Use Cases
import { SetPractitionerAvailabilityUseCase } from '@application/use-cases/practitioners/set-practitioner-availability.use-case';

// Role Management Use Cases
import { AssignRoleUseCase } from '@application/use-cases/role-management/assign-role.use-case';

// 🎮 Controllers
import { AppointmentController } from './controllers/appointment.controller';
import { AuthController } from './controllers/auth.controller';
import { BusinessGalleryController } from './controllers/business-gallery.controller';
import { BusinessHoursController } from './controllers/business-hours.controller';
import { BusinessImageController } from './controllers/business-image.controller';
import { BusinessSectorController } from './controllers/business-sector.controller';
import { BusinessController } from './controllers/business.controller';
import { CalendarTypesController } from './controllers/calendar-types.controller';
import { CalendarController } from './controllers/calendar.controller';
import { NotificationController } from './controllers/notification.controller';
import { PermissionController } from './controllers/permission.controller';
import { ProfessionalController } from './controllers/professional.controller';
import { RoleManagementController } from './controllers/role-management.controller';
// import { ServiceTypeController } from './controllers/service-type.controller'; // Temporarily disabled
import { ServiceController } from './controllers/service.controller';
// Removed ServiceTestController - debugging completed
import { StaffAvailabilityController } from './controllers/staff-availability.controller';
import { StaffController } from './controllers/staff.controller';
import { UserController } from './controllers/user.controller';

// 🛡️ Security
import { JwtAuthGuard } from './security/guards/jwt-auth.guard';
import { RolesGuard } from './security/guards/roles.guard';
import { NotificationRateLimitGuard } from './security/notification-rate-limit.guard';
import { JwtStrategy } from './security/strategies/jwt.strategy';
import { SecurityValidationPipe } from './security/validation.pipe';

// 🔧 Services
import { MockI18nService } from '@application/mocks/mock-i18n.service';
import { AuditService } from '@infrastructure/services/audit.service';
import { PresentationCookieService } from './services/cookie.service';

@Module({
  imports: [
    // 🏗️ Infrastructure module pour tous les services nécessaires
    InfrastructureModule,
    // 🗄️ Database module pour les repositories (avec mocks BusinessSector)
    DatabaseModule,
  ],
  controllers: [
    AuthController,
    UserController,
    BusinessController,
    BusinessHoursController,
    BusinessSectorController,
    CalendarController,
    CalendarTypesController,
    ServiceController,
    // ServiceTestController removed - debugging completed
    // ServiceTypeController, // Temporarily disabled
    StaffController,
    StaffAvailabilityController,
    BusinessImageController,
    BusinessGalleryController,
    AppointmentController,
    NotificationController,
    ProfessionalController,
    PermissionController,
    RoleManagementController,
  ],
  providers: [
    // 🛡️ Security providers
    JwtAuthGuard,
    JwtStrategy,
    SecurityValidationPipe,
    RolesGuard,
    NotificationRateLimitGuard,

    // 🍪 Cookie Service
    PresentationCookieService,

    // 🌍 I18n Service avec token d'injection
    {
      provide: TOKENS.I18N_SERVICE,
      useClass: MockI18nService,
    },

    // 🔍 Audit Service avec token d'injection
    {
      provide: TOKENS.AUDIT_SERVICE,
      useClass: AuditService,
    },

    // 💼 USE CASES - Inversion de Dépendances (Presentation Layer responsability)
    // 📋 Authentication Use Cases
    {
      provide: TOKENS.LOGIN_USE_CASE,
      useFactory: (
        userRepo,
        passwordHasher,
        authService,
        configService,
        logger,
        i18n,
        userCacheService,
      ) =>
        new LoginUseCase(
          userRepo,
          passwordHasher,
          authService,
          configService,
          logger,
          i18n,
          userCacheService,
        ),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_HASHER,
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE,
      ],
    },
    {
      provide: TOKENS.REGISTER_USE_CASE,
      useFactory: (
        userRepo,
        passwordHasher,
        authService,
        configService,
        logger,
        i18n,
        userCacheService,
      ) =>
        new RegisterUseCase(
          userRepo,
          passwordHasher,
          authService,
          configService,
          logger,
          i18n,
          userCacheService,
        ),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PASSWORD_HASHER,
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.USER_CACHE_SERVICE,
      ],
    },
    {
      provide: TOKENS.REFRESH_TOKEN_USE_CASE,
      useFactory: (authService, configService, logger, i18n) =>
        new RefreshTokenUseCase(authService, configService, logger, i18n),
      inject: [
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.LOGOUT_USE_CASE,
      useFactory: (authService, configService, logger, i18n) =>
        new LogoutUseCase(authService, configService, logger, i18n),
      inject: [
        TOKENS.AUTH_SERVICE,
        TOKENS.APP_CONFIG,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    // 👤 User Management Use Cases
    {
      provide: TOKENS.GET_ME_USE_CASE,
      useFactory: () => new GetMeUseCase(),
      inject: [],
    },
    {
      provide: TOKENS.LIST_USERS_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new ListUsersUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.CREATE_USER_USE_CASE,
      useFactory: (userRepo, logger, i18n, permissionService) =>
        new CreateUserUseCase(userRepo, logger, i18n, permissionService),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_USER_BY_ID_USE_CASE,
      useFactory: (userRepo, logger, i18n) =>
        new GetUserByIdUseCase(userRepo, logger, i18n),
      inject: [TOKENS.USER_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.UPDATE_USER_USE_CASE,
      useFactory: (userRepo, permissionService, logger, i18n) =>
        new UpdateUserUseCase(userRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_USER_USE_CASE,
      useFactory: (userRepo, permissionService, logger, i18n) =>
        new DeleteUserUseCase(userRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.USER_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 🏢 Business Sector Use Cases
    {
      provide: TOKENS.CREATE_BUSINESS_SECTOR_USE_CASE,
      useFactory: (businessSectorRepo, logger, i18n, permissionService) =>
        new CreateBusinessSectorUseCase(
          businessSectorRepo,
          logger,
          i18n,
          permissionService,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_BUSINESS_SECTORS_USE_CASE,
      useFactory: (businessSectorRepo, permissionService, logger, i18n) =>
        new ListBusinessSectorsUseCase(
          businessSectorRepo,
          permissionService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_BUSINESS_SECTOR_USE_CASE,
      useFactory: (businessSectorRepo, logger, i18n, permissionService) =>
        new UpdateBusinessSectorUseCase(
          businessSectorRepo,
          logger,
          i18n,
          permissionService,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_BUSINESS_SECTOR_USE_CASE,
      useFactory: (businessSectorRepo, permissionService, logger) =>
        new DeleteBusinessSectorUseCase(
          businessSectorRepo,
          permissionService,
          logger,
        ),
      inject: [
        TOKENS.BUSINESS_SECTOR_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
      ],
    },

    // 🏢 Business Use Cases - RBAC avec IPermissionService
    {
      provide: TOKENS.CREATE_BUSINESS_USE_CASE,
      useFactory: (businessRepo, permissionService, logger, i18n) =>
        new CreateBusinessUseCase(
          businessRepo,
          permissionService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_BUSINESS_USE_CASE,
      useFactory: (businessRepo, permissionService, logger, i18n) =>
        new GetBusinessUseCase(businessRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_BUSINESS_USE_CASE,
      useFactory: (businessRepo, permissionService, logger, i18n) =>
        new ListBusinessUseCase(businessRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_BUSINESS_USE_CASE,
      useFactory: (businessRepo, permissionService, logger, i18n) =>
        new UpdateBusinessUseCase(
          businessRepo,
          permissionService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.MANAGE_BUSINESS_HOURS_USE_CASE,
      useFactory: (businessRepo, logger, i18n) =>
        new ManageBusinessHoursUseCase(businessRepo, logger, i18n),
      inject: [TOKENS.BUSINESS_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },

    // 📅 Calendar Use Cases
    {
      provide: TOKENS.CREATE_CALENDAR_USE_CASE,
      useFactory: (calendarRepo, businessRepo, userRepo, logger, i18n) =>
        new CreateCalendarUseCase(
          calendarRepo,
          businessRepo,
          userRepo,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.USER_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_CALENDAR_USE_CASE,
      useFactory: (calendarRepo, userRepo, logger, i18n) =>
        new GetCalendarByIdUseCase(calendarRepo, userRepo, logger, i18n),
      inject: [
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.USER_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_CALENDARS_USE_CASE,
      useFactory: (calendarRepo, userRepo, logger, i18n) =>
        new ListCalendarsUseCase(calendarRepo, userRepo, logger, i18n),
      inject: [
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.USER_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_CALENDAR_USE_CASE,
      useFactory: (calendarRepo, businessRepo, logger, i18n) =>
        new UpdateCalendarUseCase(calendarRepo, businessRepo, logger, i18n),
      inject: [
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_CALENDAR_USE_CASE,
      useFactory: (calendarRepo, businessRepo, appointmentRepo, logger, i18n) =>
        new DeleteCalendarUseCase(
          calendarRepo,
          businessRepo,
          appointmentRepo,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.APPOINTMENT_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 💼 Service Use Cases - RESTORED
    {
      provide: TOKENS.CREATE_SERVICE_USE_CASE,
      useFactory: (
        serviceRepo,
        businessRepo,
        permissionService,
        logger,
        i18n,
      ) =>
        new CreateServiceUseCase(
          serviceRepo,
          businessRepo,
          permissionService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.SERVICE_REPOSITORY,
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_SERVICE_USE_CASE,
      useFactory: (serviceRepo) => new GetServiceUseCase(serviceRepo),
      inject: [TOKENS.SERVICE_REPOSITORY],
    },
    {
      provide: TOKENS.LIST_SERVICES_USE_CASE,
      useFactory: (serviceRepo, permissionService, logger, i18n) =>
        new ListServicesUseCase(serviceRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.SERVICE_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_SERVICE_USE_CASE,
      useFactory: (serviceRepo, permissionService, logger, i18n) =>
        new UpdateServiceUseCase(serviceRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.SERVICE_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_SERVICE_USE_CASE,
      useFactory: (serviceRepo, permissionService, logger, i18n) =>
        new DeleteServiceUseCase(serviceRepo, permissionService, logger, i18n),
      inject: [
        TOKENS.SERVICE_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 🏷️ ServiceType Use Cases - RE-ENABLED after implementing ServiceType repository
    {
      provide: TOKENS.CREATE_SERVICE_TYPE_USE_CASE,
      useFactory: (
        serviceTypeRepo,
        logger,
        i18n,
        auditService,
        permissionService,
      ) =>
        new CreateServiceTypeUseCase(
          serviceTypeRepo,
          logger,
          i18n,
          auditService,
          permissionService,
        ),
      inject: [
        TOKENS.SERVICE_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.AUDIT_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    /*
    {
      provide: TOKENS.GET_SERVICE_TYPE_BY_ID_USE_CASE,
      useFactory: (serviceTypeRepo, logger, i18n) =>
        new GetServiceTypeByIdUseCase(serviceTypeRepo, logger, i18n),
      inject: [
        TOKENS.SERVICE_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    */
    {
      provide: TOKENS.LIST_SERVICE_TYPES_USE_CASE,
      useFactory: (serviceTypeRepo, logger, i18n) =>
        new ListServiceTypesUseCase(serviceTypeRepo, logger, i18n),
      inject: [
        TOKENS.SERVICE_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_SERVICE_TYPE_USE_CASE,
      useFactory: (serviceTypeRepo, logger, i18n) =>
        new UpdateServiceTypeUseCase(serviceTypeRepo, logger, i18n),
      inject: [
        TOKENS.SERVICE_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_SERVICE_TYPE_USE_CASE,
      useFactory: (serviceTypeRepo, logger, i18n) =>
        new DeleteServiceTypeUseCase(serviceTypeRepo, logger, i18n),
      inject: [
        TOKENS.SERVICE_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 👨‍💼 Staff Use Cases
    {
      provide: TOKENS.CREATE_STAFF_USE_CASE,
      useFactory: (staffRepo, userRepo, businessRepo, logger, i18n) =>
        new CreateStaffUseCase(staffRepo, userRepo, businessRepo, logger, i18n),
      inject: [
        TOKENS.STAFF_REPOSITORY,
        TOKENS.USER_REPOSITORY,
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_STAFF_USE_CASE,
      useFactory: (staffRepo, logger, i18n) =>
        new GetStaffUseCase(staffRepo, logger, i18n),
      inject: [TOKENS.STAFF_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.LIST_STAFF_USE_CASE,
      useFactory: (staffRepo, logger, i18n, permissionService) =>
        new ListStaffUseCase(staffRepo, logger, i18n, permissionService),
      inject: [
        TOKENS.STAFF_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_STAFF_USE_CASE,
      useFactory: (staffRepo, logger, i18n, permissionService) =>
        new UpdateStaffUseCase(staffRepo, logger, i18n, permissionService),
      inject: [
        TOKENS.STAFF_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_STAFF_USE_CASE,
      useFactory: (staffRepo, logger, i18n, permissionService) =>
        new DeleteStaffUseCase(staffRepo, logger, i18n, permissionService),
      inject: [
        TOKENS.STAFF_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.PERMISSION_SERVICE,
      ],
    },

    // 📅 Staff Availability Use Cases - NEW
    // ✅ Staff Availability Use Cases
    {
      provide: APPLICATION_TOKENS.SET_STAFF_AVAILABILITY_USE_CASE,
      useFactory: (staffRepository) =>
        new SetStaffAvailabilityUseCase(staffRepository),
      inject: [TOKENS.STAFF_REPOSITORY],
    },
    {
      provide: APPLICATION_TOKENS.GET_STAFF_AVAILABILITY_USE_CASE,
      useFactory: (staffRepository) =>
        new GetStaffAvailabilityUseCase(staffRepository),
      inject: [TOKENS.STAFF_REPOSITORY],
    },
    {
      provide: APPLICATION_TOKENS.GET_AVAILABLE_STAFF_USE_CASE,
      useFactory: (staffRepository) =>
        new GetAvailableStaffUseCase(staffRepository),
      inject: [TOKENS.STAFF_REPOSITORY],
    },

    // 📅 Appointment Use Cases
    {
      provide: TOKENS.BOOK_APPOINTMENT_USE_CASE,
      useFactory: (
        appointmentRepo: any,
        serviceRepo: any,
        calendarRepo: any,
        staffRepo: any,
        businessRepo: any,
        logger: any,
        i18n: any,
      ) =>
        new BookAppointmentUseCase(
          appointmentRepo,
          serviceRepo,
          calendarRepo,
          staffRepo,
          businessRepo,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.APPOINTMENT_REPOSITORY,
        TOKENS.SERVICE_REPOSITORY,
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.STAFF_REPOSITORY,
        TOKENS.BUSINESS_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_AVAILABLE_SLOTS_USE_CASE,
      useFactory: (
        calendarRepo,
        serviceRepo,
        appointmentRepo,
        staffRepo,
        logger,
        i18n,
      ) =>
        new GetAvailableSlotsUseCase(
          calendarRepo,
          serviceRepo,
          appointmentRepo,
          staffRepo,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.CALENDAR_REPOSITORY,
        TOKENS.SERVICE_REPOSITORY,
        TOKENS.APPOINTMENT_REPOSITORY,
        TOKENS.STAFF_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_APPOINTMENTS_USE_CASE,
      useClass: ListAppointmentsUseCase,
    },
    {
      provide: TOKENS.GET_APPOINTMENT_BY_ID_USE_CASE,
      useClass: GetAppointmentByIdUseCase,
    },
    {
      provide: TOKENS.UPDATE_APPOINTMENT_USE_CASE,
      useClass: UpdateAppointmentUseCase,
    },
    {
      provide: TOKENS.CANCEL_APPOINTMENT_USE_CASE,
      useClass: CancelAppointmentUseCase,
    },

    // 📢 Notification Use Cases
    {
      provide: TOKENS.SEND_NOTIFICATION_USE_CASE,
      useFactory: (notificationRepo, notificationService, logger, i18n) =>
        new SendNotificationUseCase(
          notificationRepo,
          notificationService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.NOTIFICATION_REPOSITORY,
        TOKENS.NOTIFICATION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.SEND_BULK_NOTIFICATION_USE_CASE,
      useFactory: (
        notificationRepo,
        notificationService,
        userSegmentationService,
        campaignService,
        logger,
        i18n,
      ) =>
        new SendBulkNotificationUseCase(
          notificationRepo,
          notificationService,
          userSegmentationService,
          campaignService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.NOTIFICATION_REPOSITORY,
        TOKENS.NOTIFICATION_SERVICE,
        TOKENS.USER_SEGMENTATION_SERVICE,
        TOKENS.CAMPAIGN_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 🌩️ AWS S3 Image Management Use Cases
    {
      provide: TOKENS.UPLOAD_BUSINESS_IMAGE_USE_CASE,
      useFactory: (businessRepo, s3Service) =>
        new UploadBusinessImageUseCase(businessRepo, s3Service),
      inject: [TOKENS.BUSINESS_REPOSITORY, TOKENS.AWS_S3_IMAGE_SERVICE],
    },
    {
      provide: TOKENS.ADD_IMAGE_TO_GALLERY_USE_CASE,
      useFactory: (businessRepo) =>
        new AddImageToBusinessGalleryUseCase(businessRepo),
      inject: [TOKENS.BUSINESS_REPOSITORY],
    },
    {
      provide: TOKENS.UPDATE_BUSINESS_SEO_USE_CASE,
      useFactory: (businessRepo) =>
        new UpdateBusinessSeoProfileUseCase(businessRepo),
      inject: [TOKENS.BUSINESS_REPOSITORY],
    },

    // 🖼️ Business Gallery Use Cases
    {
      provide: TOKENS.CREATE_BUSINESS_GALLERY_USE_CASE,
      useFactory: (businessRepo, logger, i18n) =>
        new CreateBusinessGalleryUseCase(businessRepo, logger, i18n),
      inject: [TOKENS.BUSINESS_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.GET_BUSINESS_GALLERY_USE_CASE,
      useFactory: (businessRepo, logger, i18n) =>
        new GetBusinessGalleryUseCase(businessRepo, logger, i18n),
      inject: [TOKENS.BUSINESS_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.UPDATE_BUSINESS_GALLERY_USE_CASE,
      useFactory: (businessRepo, logger, i18n) =>
        new UpdateBusinessGalleryUseCase(businessRepo, logger, i18n),
      inject: [TOKENS.BUSINESS_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },
    {
      provide: TOKENS.DELETE_BUSINESS_GALLERY_USE_CASE,
      useFactory: (businessRepo, logger, i18n) =>
        new DeleteBusinessGalleryUseCase(businessRepo, logger, i18n),
      inject: [TOKENS.BUSINESS_REPOSITORY, TOKENS.LOGGER, TOKENS.I18N_SERVICE],
    },

    // 📅 CalendarType Use Cases
    {
      provide: TOKENS.CREATE_CALENDAR_TYPE_USE_CASE,
      useFactory: (calendarTypeRepo, logger, i18n, auditService) =>
        new CreateCalendarTypeUseCase(
          calendarTypeRepo,
          logger,
          i18n,
          auditService,
        ),
      inject: [
        TOKENS.CALENDAR_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.AUDIT_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_CALENDAR_TYPE_BY_ID_USE_CASE,
      useFactory: (calendarTypeRepo, logger, i18n) =>
        new GetCalendarTypeByIdUseCase(calendarTypeRepo, logger, i18n),
      inject: [
        TOKENS.CALENDAR_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_CALENDAR_TYPE_USE_CASE,
      useFactory: (calendarTypeRepo, logger, i18n, auditService) =>
        new UpdateCalendarTypeUseCase(
          calendarTypeRepo,
          logger,
          i18n,
          auditService,
        ),
      inject: [
        TOKENS.CALENDAR_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.AUDIT_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_CALENDAR_TYPE_USE_CASE,
      useFactory: (calendarTypeRepo, logger, i18n, auditService) =>
        new DeleteCalendarTypeUseCase(
          calendarTypeRepo,
          logger,
          i18n,
          auditService,
        ),
      inject: [
        TOKENS.CALENDAR_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.AUDIT_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_CALENDAR_TYPES_USE_CASE,
      useFactory: (calendarTypeRepo, logger, i18n) =>
        new ListCalendarTypesUseCase(calendarTypeRepo, logger, i18n),
      inject: [
        TOKENS.CALENDAR_TYPE_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 👨‍💼 Professional Use Cases
    {
      provide: TOKENS.CREATE_PROFESSIONAL_USE_CASE,
      useFactory: (professionalRepo, logger, i18n, auditService) =>
        new CreateProfessionalUseCase(
          professionalRepo,
          logger,
          i18n,
          auditService,
        ),
      inject: [
        TOKENS.PROFESSIONAL_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.AUDIT_SERVICE,
      ],
    },
    {
      provide: TOKENS.GET_PROFESSIONAL_BY_ID_USE_CASE,
      useFactory: (professionalRepo, logger, i18n) =>
        new GetProfessionalByIdUseCase(professionalRepo, logger, i18n),
      inject: [
        TOKENS.PROFESSIONAL_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.UPDATE_PROFESSIONAL_USE_CASE,
      useFactory: (professionalRepo, logger, i18n) =>
        new UpdateProfessionalUseCase(professionalRepo, logger, i18n),
      inject: [
        TOKENS.PROFESSIONAL_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.DELETE_PROFESSIONAL_USE_CASE,
      useFactory: (professionalRepo, logger, i18n) =>
        new DeleteProfessionalUseCase(professionalRepo, logger, i18n),
      inject: [
        TOKENS.PROFESSIONAL_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },
    {
      provide: TOKENS.LIST_PROFESSIONALS_USE_CASE,
      useFactory: (professionalRepo, logger, i18n, auditService) =>
        new ListProfessionalsUseCase(
          professionalRepo,
          logger,
          i18n,
          auditService,
        ),
      inject: [
        TOKENS.PROFESSIONAL_REPOSITORY,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
        TOKENS.AUDIT_SERVICE,
      ],
    },

    // 👨‍⚕️ Practitioner Use Cases
    {
      provide: TOKENS.SET_PRACTITIONER_AVAILABILITY_USE_CASE,
      useFactory: (
        staffRepository,
        appointmentRepository,
        roleAssignmentRepository,
        permissionService,
        logger,
        i18n,
      ) =>
        new SetPractitionerAvailabilityUseCase(
          staffRepository,
          appointmentRepository,
          roleAssignmentRepository,
          permissionService,
          logger,
          i18n,
        ),
      inject: [
        TOKENS.STAFF_REPOSITORY,
        TOKENS.APPOINTMENT_REPOSITORY,
        TOKENS.ROLE_ASSIGNMENT_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
        TOKENS.LOGGER,
        TOKENS.I18N_SERVICE,
      ],
    },

    // 🔐 Permission Use Cases
    {
      provide: TOKENS.CREATE_PERMISSION_USE_CASE,
      useFactory: (permissionRepo) =>
        new CreatePermissionUseCase(permissionRepo),
      inject: [TOKENS.PERMISSION_REPOSITORY],
    },
    {
      provide: TOKENS.GET_PERMISSION_BY_ID_USE_CASE,
      useFactory: (permissionRepo) =>
        new GetPermissionByIdUseCase(permissionRepo),
      inject: [TOKENS.PERMISSION_REPOSITORY],
    },
    {
      provide: TOKENS.LIST_PERMISSIONS_USE_CASE,
      useFactory: (permissionRepo) =>
        new ListPermissionsUseCase(permissionRepo),
      inject: [TOKENS.PERMISSION_REPOSITORY],
    },
    {
      provide: TOKENS.UPDATE_PERMISSION_USE_CASE,
      useFactory: (permissionRepo) =>
        new UpdatePermissionUseCase(permissionRepo),
      inject: [TOKENS.PERMISSION_REPOSITORY],
    },
    {
      provide: TOKENS.DELETE_PERMISSION_USE_CASE,
      useFactory: (permissionRepo) =>
        new DeletePermissionUseCase(permissionRepo),
      inject: [TOKENS.PERMISSION_REPOSITORY],
    },

    // 🎭 RBAC Use Cases
    {
      provide: TOKENS.ASSIGN_ROLE_USE_CASE,
      useFactory: (
        roleAssignmentRepo,
        businessContextRepo,
        permissionService,
      ) =>
        new AssignRoleUseCase(
          roleAssignmentRepo,
          businessContextRepo,
          permissionService,
        ),
      inject: [
        TOKENS.ROLE_ASSIGNMENT_REPOSITORY,
        TOKENS.RBAC_BUSINESS_CONTEXT_REPOSITORY,
        TOKENS.PERMISSION_SERVICE,
      ],
    },
  ],
  exports: [JwtAuthGuard, SecurityValidationPipe],
})
export class PresentationModule {}
