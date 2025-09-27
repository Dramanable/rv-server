/**
 * @fileoverview Campaign Service - Mock Implementation
 * @module Infrastructure/Services
 * @version 1.0.0
 */

/**
 * Interface pour le service de campagne
 */
export interface ICampaignService {
  /**
   * Crée une nouvelle campagne
   */
  createCampaign(campaignData: any): Promise<string>;

  /**
   * Suit le statut d'une campagne
   */
  trackCampaign(campaignId: string, metrics: any): Promise<void>;

  /**
   * Obtient les statistiques d'une campagne
   */
  getCampaignStats(campaignId: string): Promise<any>;
}

/**
 * Implémentation mock du service de campagne
 * TODO: Remplacer par une vraie implémentation
 */
export class MockCampaignService implements ICampaignService {
  async createCampaign(campaignData: any): Promise<string> {
    // Mock: génère un ID de campagne unique
    return `campaign-${Date.now()}`;
  }

  async trackCampaign(campaignId: string, metrics: any): Promise<void> {
    // Mock: ne fait rien pour l'instant
    console.log(`Tracking campaign ${campaignId}:`, metrics);
  }

  async getCampaignStats(campaignId: string): Promise<any> {
    // Mock: retourne des stats fictives
    return {
      campaignId,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
    };
  }
}
