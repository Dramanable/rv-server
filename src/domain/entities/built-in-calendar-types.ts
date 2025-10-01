import { BusinessId } from '../value-objects/business-id.value-object';
import { CalendarType } from './calendar-type.entity';

/**
 * 📅 Built-in Calendar Types
 *
 * Fournit les types de calendrier intégrés par défaut pour le système.
 * Ces types sont créés automatiquement lors de l'initialisation d'une nouvelle entreprise.
 */
export class BuiltInCalendarTypes {
  /**
   * Crée le type de calendrier BUSINESS (calendrier principal de l'entreprise)
   */
  static createBusinessType(
    businessId: BusinessId,
    _createdBy: string,
  ): CalendarType {
    return CalendarType.create({
      businessId,
      name: 'Calendrier Principal',
      code: 'BUSINESS',
      description:
        "Calendrier principal de l'entreprise pour la planification générale",
      icon: 'building',
      color: '#2563eb', // Bleu professionnel
      isBuiltin: true,
      isActive: true,
      sortOrder: 1,
    });
  }

  /**
   * Crée le type de calendrier STAFF (calendrier personnel des employés)
   */
  static createStaffType(
    businessId: BusinessId,
    _createdBy: string,
  ): CalendarType {
    return CalendarType.create({
      businessId,
      name: 'Calendrier Personnel',
      code: 'STAFF',
      description: 'Calendrier personnel pour les membres du personnel',
      icon: 'user',
      color: '#059669', // Vert pour le personnel
      isBuiltin: true,
      isActive: true,
      sortOrder: 2,
    });
  }

  /**
   * Crée le type de calendrier RESOURCE (ressources/équipements)
   */
  static createResourceType(
    businessId: BusinessId,
    _createdBy: string,
  ): CalendarType {
    return CalendarType.create({
      businessId,
      name: 'Calendrier Ressource',
      code: 'RESOURCE',
      description: 'Calendrier pour la gestion des ressources et équipements',
      icon: 'cog',
      color: '#dc2626', // Rouge pour les ressources
      isBuiltin: true,
      isActive: true,
      sortOrder: 3,
    });
  }

  /**
   * Crée le type de calendrier SERVICE (services spécialisés)
   */
  static createServiceType(
    businessId: BusinessId,
    _createdBy: string,
  ): CalendarType {
    return CalendarType.create({
      businessId,
      name: 'Calendrier Service',
      code: 'SERVICE',
      description: 'Calendrier spécialisé pour un service ou département',
      icon: 'briefcase',
      color: '#7c3aed', // Violet pour les services
      isBuiltin: true,
      isActive: true,
      sortOrder: 4,
    });
  }

  /**
   * Crée tous les types de calendrier par défaut pour une nouvelle entreprise
   */
  static createAllBuiltInTypes(
    businessId: BusinessId,
    createdBy: string,
  ): CalendarType[] {
    return [
      this.createBusinessType(businessId, createdBy),
      this.createStaffType(businessId, createdBy),
      this.createResourceType(businessId, createdBy),
      this.createServiceType(businessId, createdBy),
    ];
  }

  /**
   * Vérifie si un code correspond à un type intégré
   */
  static isBuiltInCode(code: string): boolean {
    return ['BUSINESS', 'STAFF', 'RESOURCE', 'SERVICE'].includes(
      code.toUpperCase(),
    );
  }

  /**
   * Obtient la liste des codes intégrés
   */
  static getBuiltInCodes(): string[] {
    return ['BUSINESS', 'STAFF', 'RESOURCE', 'SERVICE'];
  }
}
