/**
 * 🎯 RV Project Frontend SDK
 *
 * SDK complet pour l'intégration avec l'API RV Project
 *
 * @version 1.0.0
 * @author RV Project Team
 */

// Export des types principaux
export * from './types';

// Export du client HTTP
export { RVProjectClient } from './client';

// Export des services
export { AppointmentsService } from './services/appointments.service';
export { AuthService } from './services/auth.service';
export { default as BusinessConfigurationService } from './services/business-configuration.service';
export { default as BusinessGalleriesService } from './services/business-galleries.service';
export { default as BusinessHoursRealService } from './services/business-hours-real.service';
export { default as BusinessHoursService } from './services/business-hours.service';
export { default as BusinessImageService } from './services/business-image.service';
export { default as BusinessSectorsService } from './services/business-sectors.service';
export { BusinessService } from './services/business.service';
export { default as CalendarTypesService } from './services/calendar-types.service';
export { default as CalendarsService } from './services/calendars.service';
export { default as GalleryService } from './services/gallery.service';
export { default as HealthService } from './services/health.service';
export { default as NotificationService } from './services/notifications.service';
export { default as PermissionService } from './services/permissions.service';
export { default as ProfessionalRolesService } from './services/professional-roles.service';
export { default as ProfessionalsService } from './services/professionals.service';
export { default as RoleAssignmentsService } from './services/role-assignments.service';
export { default as RoleService } from './services/roles.service';
export { default as ServiceTypesService } from './services/service-types.service';
export { ServicesService } from './services/services.service';
export { default as SkillsService } from './services/skills.service';
export { default as StaffAvailabilityService } from './services/staff-availability-real.service';
export { default as StaffService } from './services/staff.service';
export { default as UsersService } from './services/users.service';

// Export de la classe SDK principale
import { RVProjectClient } from './client';
import { AppointmentsService } from './services/appointments.service';
import { AuthService } from './services/auth.service';
import BusinessConfigurationService from './services/business-configuration.service';
import BusinessGalleriesService from './services/business-galleries.service';
import BusinessHoursRealService from './services/business-hours-real.service';
import BusinessHoursService from './services/business-hours.service';
import BusinessImageService from './services/business-image.service';
import BusinessSectorsService from './services/business-sectors.service';
import { BusinessService } from './services/business.service';
import CalendarTypesService from './services/calendar-types.service';
import CalendarsService from './services/calendars.service';
import GalleryService from './services/gallery.service';
import HealthService from './services/health.service';
import NotificationService from './services/notifications.service';
import PermissionService from './services/permissions.service';
import ProfessionalRolesService from './services/professional-roles.service';
import ProfessionalsService from './services/professionals.service';
import RoleAssignmentsService from './services/role-assignments.service';
import RoleService from './services/roles.service';
import ServiceTypesService from './services/service-types.service';
import { ServicesService } from './services/services.service';
import SkillsService from './services/skills.service';
import StaffAvailabilityService from './services/staff-availability-real.service';
import StaffService from './services/staff.service';
import UsersService from './services/users.service';
import { RVProjectConfig } from './types';

/**
 * 🚀 Classe principale du SDK RV Project
 *
 * Point d'entrée unique pour toutes les opérations de l'API
 */
export class RVProjectSDK {
  private client: RVProjectClient;

  // Services disponibles
  public readonly auth: AuthService;
  public readonly business: BusinessService;
  public readonly services: ServicesService;
  public readonly appointments: AppointmentsService;
  public readonly notifications: NotificationService;
  public readonly permissions: PermissionService;
  public readonly staff: StaffService;
  public readonly roles: RoleService;
  public readonly gallery: GalleryService;
  public readonly businessImage: BusinessImageService;
  public readonly health: HealthService;
  public readonly businessHours: BusinessHoursService;
  public readonly calendarTypes: CalendarTypesService;
  public readonly calendars: CalendarsService;
  public readonly serviceTypes: ServiceTypesService;
  public readonly skills: SkillsService;
  public readonly staffAvailability: StaffAvailabilityService;
  public readonly businessConfiguration: BusinessConfigurationService;
  public readonly businessSectors: BusinessSectorsService;
  public readonly businessGalleries: BusinessGalleriesService;
  public readonly businessHoursReal: BusinessHoursRealService;
  public readonly professionalRoles: ProfessionalRolesService;
  public readonly professionals: ProfessionalsService;
  public readonly roleAssignments: RoleAssignmentsService;
  public readonly users: UsersService;

  constructor(config: RVProjectConfig) {
    // Initialiser le client HTTP
    this.client = new RVProjectClient(config);

    // Initialiser tous les services
    this.auth = new AuthService(this.client);
    this.business = new BusinessService(this.client);
    this.services = new ServicesService(this.client);
    this.appointments = new AppointmentsService(this.client);
    this.notifications = new NotificationService(this.client);
    this.permissions = new PermissionService(this.client);
    this.staff = new StaffService(this.client);
    this.roles = new RoleService(this.client);
    this.gallery = new GalleryService(this.client);
    this.businessImage = new BusinessImageService(this.client);
    this.health = new HealthService(this.client);
    this.businessHours = new BusinessHoursService(this.client);
    this.calendarTypes = new CalendarTypesService(this.client);
    this.calendars = new CalendarsService(this.client);
    this.serviceTypes = new ServiceTypesService(this.client);
    this.skills = new SkillsService(this.client);
    this.staffAvailability = new StaffAvailabilityService(this.client);
    this.businessConfiguration = new BusinessConfigurationService(this.client);
    this.businessSectors = new BusinessSectorsService(this.client);
    this.businessGalleries = new BusinessGalleriesService(this.client);
    this.businessHoursReal = new BusinessHoursRealService(this.client);
    this.professionalRoles = new ProfessionalRolesService(this.client);
    this.professionals = new ProfessionalsService(this.client);
    this.roleAssignments = new RoleAssignmentsService(this.client);
    this.users = new UsersService(this.client);
  }

  /**
   * 🔧 Configurer le token d'authentification
   */
  setAuthToken(token: string): void {
    (this.client as any).authToken = token;
  }

  /**
   * 🗑️ Supprimer le token d'authentification
   */
  clearAuthToken(): void {
    // Les cookies sont gérés automatiquement par le navigateur
    // Pas d'action nécessaire côté client
  }

  /**
   * 📊 Obtenir les informations de configuration
   */
  getConfig(): RVProjectConfig {
    return (this.client as any).config;
  }

  /**
   * 🔄 Mettre à jour la configuration
   */
  updateConfig(updates: Partial<RVProjectConfig>): void {
    Object.assign((this.client as any).config, updates);
  }

  /**
   * ❤️ Vérifier la santé de l'API
   */
  async healthCheck(): Promise<{ status: 'ok' | 'error'; timestamp: string }> {
    try {
      await this.client.get('/health');
      return {
        status: 'ok',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 🧹 Nettoyer les ressources (optionnel)
   */
  destroy(): void {
    // Pas de nettoyage spécial nécessaire pour axios
  }
}

// Export par défaut de la classe SDK
export default RVProjectSDK;

// Export des helpers utilitaires
export const createSDK = (config: RVProjectConfig): RVProjectSDK => {
  return new RVProjectSDK(config);
};

/**
 * 🔧 Factory function pour créer rapidement un SDK
 *
 * @example
 * ```typescript
 * const sdk = createRVProjectSDK({
 *   baseURL: 'https://api.rvproject.com',
 *   apiKey: 'your-api-key'
 * });
 * ```
 */
export const createRVProjectSDK = createSDK;

/**
 * 📱 Version du SDK
 */
export const SDK_VERSION = '1.0.0';

/**
 * 🏷️ Métadonnées du SDK
 */
export const SDK_INFO = {
  name: '@rvproject/frontend-sdk',
  version: SDK_VERSION,
  description: 'Official TypeScript SDK for RV Project API',
  author: 'RV Project Team',
  license: 'MIT'
} as const;
