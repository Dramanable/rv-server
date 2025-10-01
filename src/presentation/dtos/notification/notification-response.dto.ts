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

/**
 * DTO de réponse pour l'envoi en masse de notifications
 */
export class SendBulkNotificationResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données des notifications envoyées",
    type: "object",
    additionalProperties: true,
  })
  readonly data!: {
    readonly totalSent: number;
    readonly totalFailed: number;
    readonly successRate: number;
    readonly notificationIds: string[];
    readonly failedRecipients: string[];
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
 * DTO de réponse pour la liste des notifications
 */
export class ListNotificationsResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Liste des notifications",
    type: [NotificationDto],
  })
  readonly data!: NotificationDto[];

  @ApiProperty({
    description: "Métadonnées de pagination",
    type: "object",
    additionalProperties: true,
  })
  readonly meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

/**
 * DTO de réponse pour récupérer une notification par ID
 */
export class GetNotificationByIdResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données de la notification",
    type: NotificationDto,
  })
  readonly data!: NotificationDto;

  @ApiPropertyOptional({
    description: "Métadonnées de la réponse",
    type: "object",
    additionalProperties: true,
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * DTO de réponse pour marquer comme lue
 */
export class MarkAsReadResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données de confirmation",
    type: "object",
    additionalProperties: true,
  })
  readonly data!: {
    readonly id: string;
    readonly status: string;
    readonly readAt: string;
  };

  @ApiPropertyOptional({
    description: "Métadonnées de la réponse",
    type: "object",
    additionalProperties: true,
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * DTO de réponse pour suppression de notification
 */
export class DeleteNotificationResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données de confirmation de suppression",
    type: "object",
    additionalProperties: true,
  })
  readonly data!: {
    readonly id: string;
    readonly deletedAt: string;
  };

  @ApiPropertyOptional({
    description: "Métadonnées de la réponse",
    type: "object",
    additionalProperties: true,
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}

/**
 * DTO de réponse pour les analytics de notifications
 */
export class NotificationAnalyticsResponseDto {
  @ApiProperty({
    description: "Statut de succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Données analytiques des notifications",
    type: "object",
    additionalProperties: true,
  })
  readonly data!: {
    readonly totalSent: number;
    readonly totalDelivered: number;
    readonly totalRead: number;
    readonly totalFailed: number;
    readonly deliveryRate: number;
    readonly readRate: number;
    readonly channelStats: any;
    readonly templateStats: any;
  };

  @ApiPropertyOptional({
    description: "Métadonnées de la réponse",
    type: "object",
    additionalProperties: true,
  })
  readonly meta?: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
