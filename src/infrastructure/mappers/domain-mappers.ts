/**
 * 🔄 MAPPERS CLEAN ARCHITECTURE - Infrastructure Layer
 *
 * Mappers statiques pour conversion entre couches :
 * - Domain ↔ Infrastructure (TypeORM, MongoDB)
 * - Domain ↔ Presentation (DTOs)
 *
 * ✅ Respect strict de Clean Architecture
 * ✅ Performance optimisée (pas de reflection)
 * ✅ Type-safe avec TypeScript strict
 */

// Domain Entities
import { InfrastructureException } from "../../shared/exceptions/shared.exceptions";
import { BusinessSector as BusinessSectorEntity } from "../../domain/entities/business-sector.entity";
import {
  Business,
  BusinessBranding,
} from "../../domain/entities/business.entity";
import { Service } from "../../domain/entities/service.entity";
import { Staff } from "../../domain/entities/staff.entity";
import { User } from "../../domain/entities/user.entity";

// Domain Value Objects
import { BusinessGallery } from "../../domain/value-objects/business-gallery.value-object";
import { BusinessHours } from "../../domain/value-objects/business-hours.value-object";

// Domain Value Objects
import { Address } from "../../domain/value-objects/address.value-object";
import { BusinessId } from "../../domain/value-objects/business-id.value-object";
import { BusinessName } from "../../domain/value-objects/business-name.value-object";
import { Email as EmailVO } from "../../domain/value-objects/email.value-object";
import { Email } from "../../domain/value-objects/email.vo";
import {
  CloudProvider,
  FileUrl,
} from "../../domain/value-objects/file-url.value-object";
import { Money } from "../../domain/value-objects/money.value-object";
import { Phone } from "../../domain/value-objects/phone.value-object";
import { PricingConfig } from "../../domain/value-objects/pricing-config.value-object";
import { ServiceId } from "../../domain/value-objects/service-id.value-object";
import { UserId } from "../../domain/value-objects/user-id.value-object";

// Shared Enums
import { UserRole } from "../../shared/enums/user-role.enum";

// Infrastructure Entities
import { BusinessOrmEntity } from "../database/sql/postgresql/entities/business-orm.entity";
import { BusinessSectorOrmEntity } from "../database/sql/postgresql/entities/business-sector-orm.entity";
import { ServiceOrmEntity } from "../database/sql/postgresql/entities/service-orm.entity";
import { StaffOrmEntity } from "../database/sql/postgresql/entities/staff-orm.entity";
import { UserOrmEntity } from "../database/sql/postgresql/entities/user-orm.entity";

// Presentation DTOs
import {
  LoginResponseDto,
  RegisterResponseDto,
} from "../../presentation/dtos/auth.dto";
import { UserResponseDto } from "../../presentation/dtos/user.dto";

/**
 * 🏛️ USER MAPPERS - Domain ↔ Infrastructure ↔ Presentation
 */
export class UserMapper {
  /**
   * Domain User → TypeORM UserOrmEntity
   */
  static toTypeOrmEntity(domainUser: User): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = domainUser.id;
    entity.email = domainUser.email.getValue();
    entity.firstName =
      domainUser.firstName || domainUser.name.split(" ")[0] || domainUser.name;
    entity.lastName =
      domainUser.lastName ||
      domainUser.name.split(" ").slice(1).join(" ") ||
      "";
    entity.hashedPassword = domainUser.hashedPassword || "";
    entity.role = domainUser.role;
    entity.isActive = domainUser.isActive ?? true;
    entity.isVerified = domainUser.isVerified ?? false;
    entity.username = domainUser.username;
    entity.createdAt = domainUser.createdAt;
    entity.updatedAt = domainUser.updatedAt || new Date();
    return entity;
  }

  /**
   * TypeORM UserOrmEntity → Domain User
   */
  static fromTypeOrmEntity(entity: UserOrmEntity): User {
    // Construction sécurisée du nom complet
    const firstName = entity.firstName || "";
    const lastName = entity.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    // Assurer qu'il y a au moins un nom valide
    const safeName = fullName || entity.username || "Unknown User";

    return User.createWithHashedPassword(
      entity.id,
      Email.create(entity.email),
      safeName,
      entity.role as UserRole,
      entity.hashedPassword,
      entity.createdAt,
      entity.updatedAt,
      entity.username,
      entity.isActive,
      entity.isVerified,
      false, // passwordChangeRequired par défaut
    );
  }

  /**
   * Domain User → UserResponseDto (Presentation)
   */
  static toResponseDto(domainUser: User): UserResponseDto {
    // Parse du nom complet en prénom/nom
    const nameParts = domainUser.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return {
      id: domainUser.id,
      email: domainUser.email.getValue(),
      firstName,
      lastName,
      role: domainUser.role as any, // Cast temporaire pour éviter les erreurs d'enum
      phone: undefined, // Optionnel
      isActive: domainUser.isActive ?? true,
      isVerified: domainUser.isVerified ?? false,
      createdAt: domainUser.createdAt.toISOString(),
      updatedAt:
        domainUser.updatedAt?.toISOString() ??
        domainUser.createdAt.toISOString(),
    };
  }

  /**
   * Array mapping - Domain Users → UserResponseDto[]
   */
  static toResponseDtoArray(domainUsers: User[]): UserResponseDto[] {
    return domainUsers.map((user) => this.toResponseDto(user));
  }

  /**
   * Array mapping - TypeORM Entities → Domain Users
   */
  static fromTypeOrmEntityArray(entities: UserOrmEntity[]): User[] {
    return entities.map((entity) => this.fromTypeOrmEntity(entity));
  }
}

/**
 * 🔐 AUTH RESPONSE MAPPERS - Use Cases Results → DTOs
 */
export class AuthResponseMapper {
  /**
   * Login Use Case Result → LoginResponseDto
   */
  static toLoginResponseDto(
    user: User,
    message: string,
    // tokens ne sont pas exposés dans la réponse (HttpOnly cookies)
  ): LoginResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      message,
      // tokens omis volontairement - gérés par cookies HttpOnly
    };
  }

  /**
   * Register Use Case Result → RegisterResponseDto
   */
  static toRegisterResponseDto(
    user: User,
    message: string,
  ): RegisterResponseDto {
    return {
      user: UserMapper.toResponseDto(user),
      message,
      // tokens omis volontairement - gérés par cookies HttpOnly
    };
  }
}

/**
 * 🎯 SERVICE MAPPERS - Domain ↔ Infrastructure
 */
export class ServiceMapper {
  /**
   * Domain Service → TypeORM ServiceOrmEntity
   */
  static toTypeOrmEntity(domainService: Service): ServiceOrmEntity {
    const entity = new ServiceOrmEntity();

    entity.id = domainService.id.getValue();
    entity.business_id = domainService.businessId.getValue();
    entity.name = domainService.name;
    entity.description = domainService.description;
    entity.status = domainService.status;

    // Mapper le pricing avec PricingConfig
    const basePrice = domainService.getBasePrice();
    entity.pricing = {
      base_price: basePrice
        ? {
            amount: basePrice.getAmount(),
            currency: basePrice.getCurrency(),
          }
        : null,
      discount_price: null, // Supprimé car remplacé par PricingConfig
      packages: domainService.packages.map((pkg: any) => ({
        name: pkg.name,
        sessions: pkg.sessions,
        price: {
          amount: pkg.price.getAmount(),
          currency: pkg.price.getCurrency(),
        },
        validity_days: pkg.validityDays,
      })),
    };

    // Mapper la configuration de pricing flexible
    const pricingConfigJson = domainService.pricingConfig.toJSON();
    entity.pricing_config = {
      type: pricingConfigJson.type,
      visibility: pricingConfigJson.visibility,
      basePrice: pricingConfigJson.basePrice,
      rules: pricingConfigJson.rules,
      description: pricingConfigJson.description,
    };

    // Mapper le scheduling
    const scheduling = domainService.scheduling;
    entity.scheduling = {
      duration: scheduling.duration,
      buffer_time_before: scheduling.bufferTimeBefore,
      buffer_time_after: scheduling.bufferTimeAfter,
      allow_online_booking: scheduling.allowOnlineBooking,
      requires_approval: scheduling.requiresApproval,
      advance_booking_limit: scheduling.advanceBookingLimit,
      cancellation_deadline: scheduling.cancellationDeadline,
    };

    // Mapper les requirements
    entity.requirements = domainService.requirements
      ? {
          preparation_instructions:
            domainService.requirements.preparationInstructions,
          contraindications: domainService.requirements.contraindications,
          required_documents: domainService.requirements.requiredDocuments,
          minimum_age: domainService.requirements.minimumAge,
          maximum_age: domainService.requirements.maximumAge,
          special_requirements: domainService.requirements.specialRequirements,
        }
      : null;

    entity.image_url = domainService.imageUrl?.getUrl() || null;
    entity.assigned_staff_ids = domainService.assignedStaffIds.map((id) =>
      id.getValue(),
    );
    entity.created_at = domainService.createdAt;
    entity.updated_at = domainService.updatedAt;

    return entity;
  }

  /**
   * TypeORM ServiceOrmEntity → Domain Service
   */
  static fromTypeOrmEntity(entity: ServiceOrmEntity): Service {
    const serviceId = ServiceId.create(entity.id);
    const businessId = BusinessId.create(entity.business_id);

    // Reconstruire PricingConfig depuis les données persistées
    const pricingConfig = PricingConfig.fromJSON(entity.pricing_config);

    // Reconstruire les packages séparément
    const packages =
      entity.pricing.packages?.map((pkg) => ({
        name: pkg.name,
        sessions: pkg.sessions,
        price: Money.create(pkg.price.amount, pkg.price.currency),
        validityDays: pkg.validity_days,
      })) || [];

    const scheduling = {
      duration: entity.scheduling.duration,
      bufferTimeBefore: entity.scheduling.buffer_time_before,
      bufferTimeAfter: entity.scheduling.buffer_time_after,
      allowOnlineBooking: entity.scheduling.allow_online_booking,
      requiresApproval: entity.scheduling.requires_approval,
      advanceBookingLimit: entity.scheduling.advance_booking_limit,
      cancellationDeadline: entity.scheduling.cancellation_deadline,
    };

    const requirements = entity.requirements
      ? {
          preparationInstructions: entity.requirements.preparation_instructions,
          contraindications: entity.requirements.contraindications,
          requiredDocuments: entity.requirements.required_documents,
          minimumAge: entity.requirements.minimum_age,
          maximumAge: entity.requirements.maximum_age,
          specialRequirements: entity.requirements.special_requirements,
        }
      : undefined;

    const assignedStaffIds = entity.assigned_staff_ids.map((id) =>
      UserId.create(id),
    );
    // Créer FileUrl avec provider par défaut (simplification pour maintenant)
    const imageUrl = entity.image_url
      ? FileUrl.create(
          entity.image_url,
          CloudProvider.AWS_S3,
          "default-bucket",
          entity.image_url.split("/").pop() || "file",
        )
      : undefined;

    return new Service(
      serviceId,
      businessId,
      entity.name,
      entity.description,
      entity.category as any, // Cast temporaire
      pricingConfig,
      scheduling,
      requirements,
      imageUrl,
      assignedStaffIds,
      packages,
      entity.status as any,
      entity.created_at,
      entity.updated_at,
    );
  }

  /**
   * Array mapping - TypeORM Entities → Domain Services
   */
  static fromTypeOrmEntityArray(entities: ServiceOrmEntity[]): Service[] {
    return entities.map((entity) => this.fromTypeOrmEntity(entity));
  }
}

/**
 * 👥 STAFF MAPPERS - Domain ↔ Infrastructure
 */
export class StaffMapper {
  /**
   * Domain Staff → TypeORM StaffOrmEntity
   */
  static toTypeOrmEntity(domainStaff: Staff): StaffOrmEntity {
    const entity = new StaffOrmEntity();

    entity.id = domainStaff.id.getValue();
    entity.business_id = domainStaff.businessId.getValue();
    entity.role = domainStaff.role;
    entity.email = domainStaff.email.getValue();
    entity.phone = domainStaff.phone?.getValue() || null;
    entity.status = domainStaff.status;
    entity.hire_date = domainStaff.hireDate;
    entity.created_at = domainStaff.createdAt;
    entity.updated_at = domainStaff.updatedAt;

    // Mapper le profile
    const profile = domainStaff.profile;
    entity.profile = {
      first_name: profile.firstName,
      last_name: profile.lastName,
      title: profile.title,
      specialization: profile.specialization,
      bio: profile.bio,
      profile_image_url: profile.profileImageUrl?.getUrl(),
      certifications: profile.certifications,
      languages: profile.languages,
    };

    // Mapper l'availability
    if (domainStaff.availability) {
      const availability = domainStaff.availability;
      entity.availability = {
        working_hours: availability.workingHours.map((wh) => ({
          day_of_week: wh.dayOfWeek,
          start_time: wh.startTime,
          end_time: wh.endTime,
          is_working_day: wh.isWorkingDay,
        })),
        time_off: availability.timeOff?.map((to) => ({
          start_date: to.startDate.toISOString(),
          end_date: to.endDate.toISOString(),
          reason: to.reason,
        })),
        special_schedule: availability.specialSchedule?.map((ss) => ({
          date: ss.date.toISOString(),
          start_time: ss.startTime,
          end_time: ss.endTime,
          is_available: ss.isAvailable,
        })),
      };
    } else {
      entity.availability = null;
    }

    // Mapper calendar integration
    if (domainStaff.calendarIntegration) {
      const ci = domainStaff.calendarIntegration;
      entity.calendar_integration = {
        calendar_id: ci.calendarId,
        sync_with_business_calendar: ci.syncWithBusinessCalendar,
        override_business_rules: ci.overrideBusinessRules,
        personal_booking_rules: ci.personalBookingRules
          ? {
              require_approval: ci.personalBookingRules.requireApproval,
              minimum_notice: ci.personalBookingRules.minimumNotice,
              maximum_advance_booking:
                ci.personalBookingRules.maximumAdvanceBooking,
            }
          : undefined,
      };
    } else {
      entity.calendar_integration = null;
    }

    return entity;
  }

  /**
   * TypeORM StaffOrmEntity → Domain Staff
   */
  static fromTypeOrmEntity(entity: StaffOrmEntity): Staff {
    const staffId = UserId.create(entity.id);
    const businessId = BusinessId.create(entity.business_id);
    const email = EmailVO.create(entity.email);
    const phone = entity.phone ? Phone.create(entity.phone) : undefined;

    // Mapper le profile
    const profile = {
      firstName: entity.profile.first_name,
      lastName: entity.profile.last_name,
      title: entity.profile.title,
      specialization: entity.profile.specialization,
      bio: entity.profile.bio,
      profileImageUrl: entity.profile.profile_image_url
        ? FileUrl.create(
            entity.profile.profile_image_url,
            CloudProvider.AWS_S3,
            "default-bucket",
            entity.profile.profile_image_url.split("/").pop() || "file",
          )
        : undefined,
      certifications: entity.profile.certifications,
      languages: entity.profile.languages,
    };

    // Mapper l'availability
    let availability = undefined;
    if (entity.availability) {
      availability = {
        workingHours: entity.availability.working_hours.map((wh) => ({
          dayOfWeek: wh.day_of_week,
          startTime: wh.start_time,
          endTime: wh.end_time,
          isWorkingDay: wh.is_working_day,
        })),
        timeOff: entity.availability.time_off?.map((to) => ({
          startDate: new Date(to.start_date),
          endDate: new Date(to.end_date),
          reason: to.reason,
        })),
        specialSchedule: entity.availability.special_schedule?.map((ss) => ({
          date: new Date(ss.date),
          startTime: ss.start_time,
          endTime: ss.end_time,
          isAvailable: ss.is_available,
        })),
      };
    }

    // Mapper calendar integration
    let calendarIntegration = undefined;
    if (entity.calendar_integration) {
      calendarIntegration = {
        calendarId: entity.calendar_integration.calendar_id,
        syncWithBusinessCalendar:
          entity.calendar_integration.sync_with_business_calendar,
        overrideBusinessRules:
          entity.calendar_integration.override_business_rules,
        personalBookingRules: entity.calendar_integration.personal_booking_rules
          ? {
              requireApproval:
                entity.calendar_integration.personal_booking_rules
                  .require_approval,
              minimumNotice:
                entity.calendar_integration.personal_booking_rules
                  .minimum_notice,
              maximumAdvanceBooking:
                entity.calendar_integration.personal_booking_rules
                  .maximum_advance_booking,
            }
          : undefined,
      };
    }

    return new Staff(
      staffId,
      businessId,
      profile,
      entity.role,
      email,
      phone,
      availability,
      entity.status as any,
      entity.hire_date,
      entity.created_at,
      entity.updated_at,
      calendarIntegration,
    );
  }

  /**
   * Array mapping - TypeORM Entities → Domain Staff
   */
  static fromTypeOrmEntityArray(entities: StaffOrmEntity[]): Staff[] {
    return entities.map((entity) => this.fromTypeOrmEntity(entity));
  }
}

/**
 * 🏢 BUSINESS MAPPERS - Domain ↔ Infrastructure
 */
export class BusinessMapper {
  /**
   * Domain Business → TypeORM BusinessOrmEntity
   */
  static toTypeOrmEntity(domainBusiness: Business): BusinessOrmEntity {
    const entity = new BusinessOrmEntity();

    entity.id = domainBusiness.id.getValue();
    entity.name = domainBusiness.name.getValue();
    entity.description = domainBusiness.description;
    entity.slogan = domainBusiness.slogan || null;
    entity.business_sector_id = domainBusiness.sector?.id || null; // ID du secteur ou null
    entity.status = domainBusiness.status;

    // Primary fields
    entity.primary_email = domainBusiness.contactInfo.primaryEmail.getValue();
    entity.primary_phone = domainBusiness.contactInfo.primaryPhone.getValue();

    // Contact info mapping
    entity.contact_info = {
      primary_email: domainBusiness.contactInfo.primaryEmail.getValue(),
      secondary_emails:
        domainBusiness.contactInfo.secondaryEmails?.map((e) => e.getValue()) ||
        [],
      primary_phone: domainBusiness.contactInfo.primaryPhone.getValue(),
      secondary_phones:
        domainBusiness.contactInfo.secondaryPhones?.map((p) => p.getValue()) ||
        [],
      website: domainBusiness.contactInfo.website,
      social_media: domainBusiness.contactInfo.socialMedia,
    };

    // Address mapping
    entity.address = {
      street: domainBusiness.address.getStreet(),
      city: domainBusiness.address.getCity(),
      postal_code: domainBusiness.address.getPostalCode(),
      country: domainBusiness.address.getCountry(),
      region: domainBusiness.address.getRegion(),
    };

    // Branding mapping
    entity.branding = domainBusiness.branding
      ? {
          logo_url: domainBusiness.branding.logoUrl?.getUrl(),
          cover_image_url: domainBusiness.branding.coverImageUrl?.getUrl(),
          brand_colors: domainBusiness.branding.brandColors,
        }
      : null;

    // Settings mapping
    entity.settings = {
      timezone: domainBusiness.settings.timezone,
      currency: domainBusiness.settings.currency,
      language: domainBusiness.settings.language,
      appointment_settings: {
        default_duration:
          domainBusiness.settings.appointmentSettings.defaultDuration,
        buffer_time: domainBusiness.settings.appointmentSettings.bufferTime,
        advance_booking_limit:
          domainBusiness.settings.appointmentSettings.advanceBookingLimit,
        cancellation_policy:
          domainBusiness.settings.appointmentSettings.cancellationPolicy,
      },
      notification_settings: {
        email_notifications:
          domainBusiness.settings.notificationSettings.emailNotifications,
        sms_notifications:
          domainBusiness.settings.notificationSettings.smsNotifications,
        reminder_time:
          domainBusiness.settings.notificationSettings.reminderTime,
      },
    };

    // Business Hours mapping - Converter Domain BusinessHours vers JSON
    const businessHours = domainBusiness.businessHours;
    entity.business_hours = {
      weekly_schedule: businessHours.getWeeklySchedule().reduce(
        (acc, day) => {
          acc[day.dayOfWeek.toString()] = {
            is_open: day.isOpen,
            time_slots: day.timeSlots.map((slot) => ({
              start_time: slot.start,
              end_time: slot.end,
            })),
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
      special_dates: businessHours.getSpecialDates().map((special) => ({
        date: special.date.toISOString().split("T")[0], // Format YYYY-MM-DD
        type: special.isOpen ? "SPECIAL_HOURS" : "CLOSED",
        label: special.reason,
        time_slots:
          special.timeSlots?.map((slot) => ({
            start_time: slot.start,
            end_time: slot.end,
          })) || [],
      })),
      timezone: businessHours.getTimezone(),
    };

    entity.logo_url = domainBusiness.branding?.logoUrl?.getUrl() || null;
    entity.created_at = domainBusiness.createdAt;
    entity.updated_at = domainBusiness.updatedAt;

    return entity;
  }

  /**
   * TypeORM BusinessOrmEntity → Domain Business
   */
  static fromTypeOrmEntity(entity: BusinessOrmEntity): Business {
    const businessId = BusinessId.create(entity.id);

    if (!entity.name) {
      throw new InfrastructureException(
        `Business name is undefined for id: ${entity.id}`,
        "BUSINESS_NAME_UNDEFINED",
      );
    }

    const businessName = BusinessName.create(entity.name);

    const contactInfo = {
      primaryEmail: EmailVO.create(
        entity.contact_info?.primary_email ||
          entity.primary_email ||
          "no-email@example.com",
      ),
      secondaryEmails:
        entity.contact_info?.secondary_emails?.map((e: string) =>
          EmailVO.create(e),
        ) || [],
      primaryPhone: Phone.create(
        entity.contact_info?.primary_phone ||
          entity.primary_phone ||
          "+33000000000",
      ),
      secondaryPhones:
        entity.contact_info?.secondary_phones?.map((p: string) =>
          Phone.create(p),
        ) || [],
      website: entity.contact_info?.website || "https://example.com",
      socialMedia:
        entity.contact_info?.social_media ||
        (entity.contact_info as any)?.social ||
        {},
    };

    const address = Address.create({
      street: entity.address?.street || "Unknown Street",
      city: entity.address?.city || "Unknown City",
      postalCode:
        entity.address?.postal_code ||
        (entity.address as any)?.zipCode ||
        "00000",
      country: entity.address?.country || "Unknown Country",
      region: entity.address?.region || (entity.address as any)?.state || "",
    });

    const branding: BusinessBranding = entity.branding
      ? {
          logoUrl: entity.branding.logo_url
            ? FileUrl.create(
                entity.branding.logo_url,
                CloudProvider.AWS_S3,
                "uploads",
                entity.branding.logo_url,
              )
            : undefined,
          coverImageUrl: entity.branding.cover_image_url
            ? FileUrl.create(
                entity.branding.cover_image_url,
                CloudProvider.AWS_S3,
                "uploads",
                entity.branding.cover_image_url,
              )
            : undefined,
          brandColors:
            (entity.branding.brand_colors?.primary ||
              (entity.branding as any).primaryColor) &&
            (entity.branding.brand_colors?.secondary ||
              (entity.branding as any).secondaryColor)
              ? {
                  primary:
                    entity.branding.brand_colors?.primary ||
                    (entity.branding as any).primaryColor,
                  secondary:
                    entity.branding.brand_colors?.secondary ||
                    (entity.branding as any).secondaryColor,
                  accent:
                    entity.branding.brand_colors?.accent ||
                    (entity.branding as any).accentColor,
                }
              : undefined,
        }
      : {};

    const settings = {
      timezone: entity.settings?.timezone || "Europe/Paris",
      currency: entity.settings?.currency || "EUR",
      language: entity.settings?.language || "fr",
      appointmentSettings: {
        defaultDuration:
          entity.settings?.appointment_settings?.default_duration || 30,
        bufferTime: entity.settings?.appointment_settings?.buffer_time || 15,
        advanceBookingLimit:
          entity.settings?.appointment_settings?.advance_booking_limit || 30,
        cancellationPolicy:
          entity.settings?.appointment_settings?.cancellation_policy ||
          "Standard policy",
      },
      notificationSettings: {
        emailNotifications:
          entity.settings?.notification_settings?.email_notifications ?? true,
        smsNotifications:
          entity.settings?.notification_settings?.sms_notifications ?? false,
        reminderTime:
          entity.settings?.notification_settings?.reminder_time || 24,
      },
    };

    // Créer BusinessHours à partir des données ORM
    let businessHours;
    try {
      businessHours = BusinessHours.fromDatabaseData({
        weekly_schedule:
          (entity.business_hours as any)?.weeklySchedule ||
          entity.business_hours?.weekly_schedule ||
          [],
        special_dates:
          (entity.business_hours as any)?.specialDates ||
          entity.business_hours?.special_dates ||
          [],
        timezone: entity.business_hours?.timezone || "Europe/Paris",
      });
    } catch (error) {
      // Fallback to default business hours (Monday to Friday, 9-17)
      businessHours = BusinessHours.create24Hours([1, 2, 3, 4, 5]);
    }

    // Mapper le secteur d'activité
    // Conversion de la relation BusinessSector vers l'entité domain
    const businessSector = entity.businessSector
      ? BusinessSectorMapper.fromTypeOrmEntity(entity.businessSector)
      : null; // null si relation non chargée

    // Create default gallery and SEO profile for now
    const gallery = BusinessGallery.empty();
    const seoProfile = null; // Will be loaded separately if needed

    return new Business(
      businessId,
      businessName,
      entity.description,
      entity.slogan || "",
      businessSector,
      branding,
      gallery, // Position 7
      seoProfile, // Position 8
      address, // Position 9
      contactInfo, // Position 10
      settings, // Position 11
      {
        timezone: "Europe/Paris",
        currency: "EUR",
        locale: "fr-FR",
        firstDayOfWeek: 1,
        businessWeekDays: [1, 2, 3, 4, 5],
      } as any, // Position 12 - Temp config object
      businessHours, // Position 12
      entity.status as any, // Position 13
      entity.created_at, // Position 14
      entity.updated_at, // Position 15
    );
  }

  /**
   * Array mapping - TypeORM Entities → Domain Business
   */
  static fromTypeOrmEntityArray(entities: BusinessOrmEntity[]): Business[] {
    return entities.map((entity) => this.fromTypeOrmEntity(entity));
  }
}

/**
 * 🔄 GENERIC MAPPER INTERFACE
 * Interface générique pour standardiser les mappers
 */
export interface DomainMapper<TDomain, TInfra, TDto> {
  toInfrastructure(domain: TDomain): TInfra;
  toDomain(infra: TInfra): TDomain;
  toDto(domain: TDomain): TDto;
  toDtoArray(domains: TDomain[]): TDto[];
}

/**
 *  BUSINESS SECTOR MAPPER
 * Mapping entre BusinessSectorOrmEntity ↔ BusinessSector
 */
export class BusinessSectorMapper {
  /**
   * Domain BusinessSectorEntity → TypeORM BusinessSectorOrmEntity
   */
  static toTypeOrmEntity(
    domain: BusinessSectorEntity,
  ): BusinessSectorOrmEntity {
    const entity = new BusinessSectorOrmEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.code = domain.code;
    entity.isActive = domain.isActive;
    entity.createdBy = domain.createdBy;
    entity.createdAt = domain.createdAt;

    if (domain.updatedBy) {
      entity.updatedBy = domain.updatedBy;
    }
    if (domain.updatedAt) {
      entity.updatedAt = domain.updatedAt;
    }

    return entity;
  }

  /**
   * TypeORM BusinessSectorOrmEntity → Domain BusinessSectorEntity
   */
  static fromTypeOrmEntity(
    entity: BusinessSectorOrmEntity,
  ): BusinessSectorEntity {
    return BusinessSectorEntity.restore(
      entity.id,
      entity.name,
      entity.description || "",
      entity.code,
      entity.isActive,
      entity.createdAt,
      entity.createdBy,
      entity.updatedAt,
      entity.updatedBy,
    );
  }

  /**
   * Array mapping - Domain BusinessSectorEntities → TypeORM Entities
   */
  static toTypeOrmEntities(
    domains: BusinessSectorEntity[],
  ): BusinessSectorOrmEntity[] {
    return domains.map((domain) => this.toTypeOrmEntity(domain));
  }

  /**
   * Array mapping - TypeORM Entities → Domain BusinessSectorEntities
   */
  static fromTypeOrmEntities(
    entities: BusinessSectorOrmEntity[],
  ): BusinessSectorEntity[] {
    return entities.map((entity) => this.fromTypeOrmEntity(entity));
  }
}

/**
 * 🎯 EXPORT CENTRALISÉ
 */
export const Mappers = {
  User: UserMapper,
  Service: ServiceMapper,
  Staff: StaffMapper,
  Business: BusinessMapper,
  AuthResponse: AuthResponseMapper,
  BusinessSector: BusinessSectorMapper,
} as const;

/**
 * 🛡️ VALIDATION HELPERS
 * Utilitaires pour valider les mappings
 */
export class MapperValidator {
  /**
   * Valide qu'un objet n'est pas null/undefined avant mapping
   */
  static validateNotNull<T>(obj: T | null | undefined, entityName: string): T {
    if (obj === null || obj === undefined) {
      throw new InfrastructureException(
        `Cannot map ${entityName}: object is null or undefined`,
        "ENTITY_NULL_OR_UNDEFINED",
      );
    }
    return obj;
  }

  /**
   * Valide qu'un array n'est pas null/undefined avant mapping
   */
  static validateArray<T>(
    arr: T[] | null | undefined,
    entityName: string,
  ): T[] {
    if (arr === null || arr === undefined) {
      throw new InfrastructureException(
        `Cannot map ${entityName} array: array is null or undefined`,
        "ENTITY_ARRAY_NULL_OR_UNDEFINED",
      );
    }
    return arr;
  }
}
