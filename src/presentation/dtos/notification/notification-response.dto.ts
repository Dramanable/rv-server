/**
 * @fileoverview Notification Response DTOs
 * @module Presentation/DTOs/Notification
 * @version 1.0.0
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO de réponse pour l'envoi de notification
 */
export class SendNotificationResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données de la notification envoyée",
    type: "object",
    additionalProperties: true,
  })
  readonly data!: {
    readonly id: string;
    readonly status: string;
    readonly sentAt?: string;
    readonly scheduledFor?: string;
    readonly estimatedDelivery?: string;
  };

  @ApiPropertyOptional({
    description: "Métadonnées de la réponse",
    type: "object",
    additionalProperties: true,
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
    readonly processingTime: number;
  };
}

/**
 * DTO de notification complète
 */
export class NotificationDto {
  @ApiProperty({
    description: "ID unique de la notification",
    example: "notif_123e4567-e89b-12d3-a456-426614174000",
  })
  readonly id!: string;

  @ApiProperty({
    description: "ID du destinataire",
    example: "user_123e4567-e89b-12d3-a456-426614174000",
  })
  readonly recipientId!: string;

  @ApiProperty({
    description: "Titre de la notification",
    example: "Confirmation de rendez-vous",
  })
  readonly title!: string;

  @ApiProperty({
    description: "Contenu de la notification",
    example: "Votre rendez-vous du 23/09/2025 à 14h30 est confirmé.",
  })
  readonly content!: string;

  @ApiProperty({
    description: "Canal de diffusion",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
    example: "EMAIL",
  })
  readonly channel!: string;

  @ApiProperty({
    description: "Priorité de la notification",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
    example: "HIGH",
  })
  readonly priority!: string;

  @ApiProperty({
    description: "Statut actuel de la notification",
    enum: ["PENDING", "SENT", "DELIVERED", "READ", "FAILED"],
    example: "SENT",
  })
  readonly status!: string;

  @ApiPropertyOptional({
    description: "Date et heure d'envoi",
    example: "2025-09-22T10:30:00.000Z",
  })
  readonly sentAt?: string;

  @ApiPropertyOptional({
    description: "Date et heure de livraison",
    example: "2025-09-22T10:30:15.000Z",
  })
  readonly deliveredAt?: string;

  @ApiPropertyOptional({
    description: "Date et heure de lecture",
    example: "2025-09-22T10:35:00.000Z",
  })
  readonly readAt?: string;

  @ApiPropertyOptional({
    description: "Raison de l'échec (si applicable)",
    example: "Email address not found",
  })
  readonly failureReason?: string;

  @ApiPropertyOptional({
    description: "Nombre de tentatives de relivraison",
    example: 0,
  })
  readonly retryCount?: number;

  @ApiPropertyOptional({
    description: "Date et heure de planification",
    example: "2025-09-23T14:30:00.000Z",
  })
  readonly scheduledFor?: string;

  @ApiPropertyOptional({
    description: "Métadonnées de la notification",
    type: "object",
    additionalProperties: true,
  })
  readonly metadata?: any;

  @ApiProperty({
    description: "Date de création",
    example: "2025-09-22T10:30:00.000Z",
  })
  readonly createdAt!: string;

  @ApiProperty({
    description: "Date de dernière mise à jour",
    example: "2025-09-22T10:30:15.000Z",
  })
  readonly updatedAt!: string;
}
