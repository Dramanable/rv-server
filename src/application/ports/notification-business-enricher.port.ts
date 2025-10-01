/**
 * 🏢 NOTIFICATION BUSINESS ENRICHER PORT
 * ✅ Interface pour l'enrichissement des templates avec données business
 * ✅ Support business info complètes (logo, contact, branding)
 * ✅ Architecture Clean - Port dans Application Layer
 */

import { TemplateVariables } from '@domain/value-objects/notification-template.value-object';

export interface EnrichBusinessDataRequest {
  readonly businessId: string;
  readonly baseVariables: TemplateVariables;
  readonly language?: string;
}

/**
 * Port pour l'enrichissement des templates de notification avec les données business
 */
export interface INotificationBusinessEnricher {
  /**
   * Enrichit les variables de template avec toutes les données business
   * @param request - Données de la requête d'enrichissement
   * @returns Variables enrichies avec les données business complètes
   */
  enrichTemplateWithBusinessData(
    request: EnrichBusinessDataRequest,
  ): Promise<TemplateVariables>;
}
