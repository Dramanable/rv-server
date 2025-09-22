/**
 * @fileoverview Send Bulk Notification Response DTO
 * @module Presentation/DTOs/Notification
 * @version 1.0.0
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BulkNotificationPreviewResultsDto {
  @ApiProperty({
    description: 'List of recipient IDs in preview',
    type: [String],
    example: ['user_123', 'user_456', 'user_789'],
  })
  readonly recipients!: string[];

  @ApiProperty({
    description: 'Sample notification content generated',
    type: [String],
    example: [
      'Hello John, your appointment is confirmed for tomorrow at 2:30 PM',
      'Hello Mary, your appointment is confirmed for tomorrow at 3:00 PM',
    ],
  })
  readonly sampleNotifications!: string[];

  @ApiProperty({
    description: 'Estimated cost for the campaign',
    type: 'number',
    example: 15.75,
  })
  readonly estimatedCost!: number;
}

export class SendBulkNotificationDataDto {
  @ApiProperty({
    description: 'Unique campaign identifier',
    example: 'campaign_123e4567-e89b-12d3-a456-426614174000',
  })
  readonly campaignId!: string;

  @ApiProperty({
    description: 'Total number of recipients',
    example: 1250,
  })
  readonly totalRecipients!: number;

  @ApiProperty({
    description: 'Number of batches created',
    example: 25,
  })
  readonly batchesCount!: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    example: 3,
  })
  readonly estimatedDuration!: number;

  @ApiPropertyOptional({
    description: 'Preview results if requested',
    type: BulkNotificationPreviewResultsDto,
  })
  readonly previewResults?: BulkNotificationPreviewResultsDto;
}

export class SendBulkNotificationResponseDto {
  @ApiProperty({
    description: 'Success indicator',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Bulk notification campaign data',
    type: SendBulkNotificationDataDto,
  })
  readonly data!: SendBulkNotificationDataDto;
}
