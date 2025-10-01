/**
 * @fileoverview Notification Services Module - Infrastructure Layer
 * @module Infrastructure/Modules
 * @version 1.0.0
 */

import { Module } from '@nestjs/common';
import { TOKENS } from '../../shared/constants/injection-tokens';

// Imports des services de notification
import { MockCampaignService } from '../services/campaign.service';
import { MockUserSegmentationService } from '../services/user-segmentation.service';

// ✅ NOUVEAU - Services Email et Notification Mock
import { MockEmailService } from '../email/mock-email.service';
import { MockNotificationService } from '../notifications/mock-notification.service';

@Module({
  providers: [
    // User Segmentation Service
    {
      provide: TOKENS.USER_SEGMENTATION_SERVICE,
      useClass: MockUserSegmentationService,
    },

    // Campaign Service
    {
      provide: TOKENS.CAMPAIGN_SERVICE,
      useClass: MockCampaignService,
    },

    // ✅ Email Service Mock - Complet et fonctionnel
    {
      provide: TOKENS.EMAIL_SERVICE,
      useClass: MockEmailService,
    },

    // ✅ Notification Service Mock - Interface complète INotificationService
    {
      provide: TOKENS.NOTIFICATION_SERVICE,
      useClass: MockNotificationService,
    },
  ],
  exports: [
    TOKENS.USER_SEGMENTATION_SERVICE,
    TOKENS.CAMPAIGN_SERVICE,
    TOKENS.EMAIL_SERVICE,
    TOKENS.NOTIFICATION_SERVICE,
  ],
})
export class NotificationServicesModule {}
