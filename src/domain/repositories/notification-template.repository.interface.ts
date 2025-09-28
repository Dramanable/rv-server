/**
 * @fileoverview NotificationTemplate Repository Interface
 * @module Domain/Repositories
 * @version 1.0.0
 */

import {
  NotificationEventType,
  NotificationTemplate,
} from '../entities/notification-template.entity';
import { NotificationChannel } from '../value-objects/notification-channel.value-object';

/**
 * Critères de recherche pour les templates de notification
 */
export interface NotificationTemplateSearchCriteria {
  readonly eventType?: NotificationEventType;
  readonly language?: string;
  readonly businessId?: string;
  readonly isActive?: boolean;
  readonly channels?: readonly NotificationChannel[];
  readonly name?: string;
}

/**
 * Options de pagination pour les templates
 */
export interface NotificationTemplatePaginationOptions {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

/**
 * Résultat paginé de templates
 */
export interface PaginatedNotificationTemplates {
  readonly templates: readonly NotificationTemplate[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}

/**
 * Interface du repository des templates de notification
 * Définit le contrat pour la persistance des templates
 */
export interface INotificationTemplateRepository {
  /**
   * Sauvegarde un template
   */
  save(template: NotificationTemplate): Promise<NotificationTemplate>;

  /**
   * Récupère un template par son ID
   */
  findById(id: string): Promise<NotificationTemplate | null>;

  /**
   * Récupère un template par nom
   */
  findByName(name: string): Promise<NotificationTemplate | null>;

  /**
   * Recherche des templates avec critères et pagination
   */
  findByCriteria(
    criteria: NotificationTemplateSearchCriteria,
    pagination?: NotificationTemplatePaginationOptions,
  ): Promise<PaginatedNotificationTemplates>;

  /**
   * Récupère tous les templates actifs
   */
  findAllActive(): Promise<readonly NotificationTemplate[]>;

  /**
   * Récupère les templates par type d'événement
   */
  findByEventType(
    eventType: NotificationEventType,
  ): Promise<readonly NotificationTemplate[]>;

  /**
   * Récupère les templates par langue
   */
  findByLanguage(language: string): Promise<readonly NotificationTemplate[]>;

  /**
   * Récupère les templates globaux (non spécifiques à une entreprise)
   */
  findGlobalTemplates(): Promise<readonly NotificationTemplate[]>;

  /**
   * Récupère les templates d'une entreprise (incluant les globaux)
   */
  findByBusinessIdOrGlobal(
    businessId: string,
  ): Promise<readonly NotificationTemplate[]>;

  /**
   * Récupère les templates supportant un canal donné
   */
  findByChannel(
    channel: NotificationChannel,
  ): Promise<readonly NotificationTemplate[]>;

  /**
   * Trouve le meilleur template pour un événement donné
   * (priorité: spécifique entreprise + langue > global + langue > spécifique entreprise + langue par défaut)
   */
  findBestMatch(
    eventType: NotificationEventType,
    channel: NotificationChannel,
    language: string,
    businessId?: string,
  ): Promise<NotificationTemplate | null>;

  /**
   * Récupère tous les templates d'une entreprise
   */
  findByBusinessId(
    businessId: string,
  ): Promise<readonly NotificationTemplate[]>;

  /**
   * Vérifie l'existence d'un template
   */
  exists(id: string): Promise<boolean>;

  /**
   * Vérifie l'existence d'un template par nom
   */
  existsByName(name: string, excludeId?: string): Promise<boolean>;

  /**
   * Supprime un template par son ID
   */
  delete(id: string): Promise<void>;

  /**
   * Supprime tous les templates d'une entreprise
   */
  deleteByBusinessId(businessId: string): Promise<number>;

  /**
   * Compte le nombre de templates actifs
   */
  countActive(): Promise<number>;

  /**
   * Récupère les langues disponibles pour les templates
   */
  getAvailableLanguages(): Promise<readonly string[]>;

  /**
   * Récupère les types d'événements couverts par les templates
   */
  getCoveredEventTypes(): Promise<readonly NotificationEventType[]>;
}
