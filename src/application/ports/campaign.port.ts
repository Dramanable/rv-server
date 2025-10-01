/**
 * 📊 CAMPAIGN SERVICE PORT - Interface pour service de campagnes
 *
 * ✅ Port pour la gestion des campagnes de notification
 * ✅ Support pour campagnes marketing et transactionnelles
 * ✅ Segmentation utilisateur et planification
 */

export interface ICampaignService {
  /**
   * Crée une nouvelle campagne de notification
   */
  createCampaign(campaign: CreateCampaignRequest): Promise<Campaign>;

  /**
   * Lance une campagne
   */
  launchCampaign(
    campaignId: string,
    options?: LaunchOptions,
  ): Promise<CampaignLaunchResult>;

  /**
   * Pause une campagne en cours
   */
  pauseCampaign(campaignId: string): Promise<void>;

  /**
   * Reprend une campagne pausée
   */
  resumeCampaign(campaignId: string): Promise<void>;

  /**
   * Arrête définitivement une campagne
   */
  stopCampaign(campaignId: string): Promise<void>;

  /**
   * Récupère les statistiques d'une campagne
   */
  getCampaignStats(campaignId: string): Promise<CampaignStats>;

  /**
   * Teste une campagne sur un échantillon
   */
  testCampaign(
    campaignId: string,
    testRecipients: string[],
  ): Promise<TestResult>;

  /**
   * Planifie une campagne pour plus tard
   */
  scheduleCampaign(campaignId: string, scheduledAt: Date): Promise<void>;

  /**
   * Met à jour le statut d'une campagne
   */
  updateCampaignStatus(campaignId: string, status: any): Promise<void>;

  /**
   * Récupère le statut d'une campagne
   */
  getCampaignStatus(campaignId: string): Promise<CampaignStatus | null>;

  /**
   * Annule une campagne
   */
  cancelCampaign(campaignId: string): Promise<void>;
}

export interface CreateCampaignRequest {
  readonly name: string;
  readonly description?: string;
  readonly type: CampaignType;
  readonly templateId: string;
  readonly segmentId?: string;
  readonly targetAudience: AudienceFilter;
  readonly channels: string[];
  readonly priority: "LOW" | "NORMAL" | "HIGH";
  readonly scheduledAt?: Date;
  readonly expiresAt?: Date;
  readonly metadata?: Record<string, any>;
}

export interface Campaign {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly type: CampaignType;
  readonly status: CampaignStatus;
  readonly templateId: string;
  readonly targetAudience: AudienceFilter;
  readonly channels: string[];
  readonly priority: "LOW" | "NORMAL" | "HIGH";
  readonly scheduledAt?: Date;
  readonly launchedAt?: Date;
  readonly completedAt?: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly createdBy: string;
}

export interface CampaignLaunchResult {
  readonly campaignId: string;
  readonly launchedAt: Date;
  readonly totalRecipients: number;
  readonly estimatedDeliveryTime: number;
  readonly batchId: string;
}

export interface CampaignStats {
  readonly campaignId: string;
  readonly totalSent: number;
  readonly totalDelivered: number;
  readonly totalFailed: number;
  readonly totalOpens: number;
  readonly totalClicks: number;
  readonly deliveryRate: number;
  readonly openRate: number;
  readonly clickRate: number;
  readonly bounceRate: number;
  readonly unsubscribeRate: number;
  readonly lastUpdated: Date;
}

export interface TestResult {
  readonly campaignId: string;
  readonly testResults: NotificationTestResult[];
  readonly totalTested: number;
  readonly successRate: number;
  readonly estimatedSuccess: number;
  readonly recommendations: string[];
}

export interface NotificationTestResult {
  readonly recipientId: string;
  readonly success: boolean;
  readonly error?: string;
  readonly deliveryTime?: number;
}

export interface AudienceFilter {
  readonly userSegments?: string[];
  readonly userRoles?: string[];
  readonly businessTypes?: string[];
  readonly locations?: string[];
  readonly ageRange?: { min: number; max: number };
  readonly joinDateRange?: { from: Date; to: Date };
  readonly customFilters?: Record<string, any>;
}

export interface LaunchOptions {
  readonly sendImmediately?: boolean;
  readonly batchSize?: number;
  readonly delayBetweenBatches?: number;
  readonly maxRetries?: number;
  readonly testMode?: boolean;
}

export enum CampaignType {
  TRANSACTIONAL = "TRANSACTIONAL",
  MARKETING = "MARKETING",
  SYSTEM = "SYSTEM",
  PROMOTIONAL = "PROMOTIONAL",
  EDUCATIONAL = "EDUCATIONAL",
  SURVEY = "SURVEY",
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}
