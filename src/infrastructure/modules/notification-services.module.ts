/**
 * @fileoverview Notification Services Module - Infrastructure Layer
 * @module Infrastructure/Modules
 * @version 1.0.0
 */

import { Module } from "@nestjs/common";
import { TOKENS } from "@shared/constants/injection-tokens";

// Imports des services de notification
import { MockCampaignService } from "../services/campaign.service";
import { MockUserSegmentationService } from "../services/user-segmentation.service";

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

    // Notification Service (placeholder - à remplacer par vraie implémentation)
    {
      provide: TOKENS.NOTIFICATION_SERVICE,
      useValue: {
        send: async (notification: any) => {
          console.log("Mock notification sent:", notification);
          return { success: true, messageId: `msg-${Date.now()}` };
        },
        sendBulk: async (notifications: any[]) => {
          console.log("Mock bulk notifications sent:", notifications.length);
          return notifications.map((_, index) => ({
            success: true,
            messageId: `bulk-msg-${Date.now()}-${index}`,
          }));
        },
      },
    },
  ],
  exports: [
    TOKENS.USER_SEGMENTATION_SERVICE,
    TOKENS.CAMPAIGN_SERVICE,
    TOKENS.NOTIFICATION_SERVICE,
  ],
})
export class NotificationServicesModule {}
