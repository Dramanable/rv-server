/**
 * @fileoverview Notification DTOs pour la couche présentation
 * @module Presentation/DTOs/Notification
 * @version 1.0.0
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  IsInt,
  Min,
  Max,
  IsIn,
  IsArray,
  ValidateNested,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";
import { NotificationTemplateType } from "../../../domain/value-objects/notification-template.value-object";

/**
 * DTO pour envoyer une notification simple
 */
export class SendNotificationDto {
  @ApiProperty({
    description: "ID du destinataire de la notification",
    example: "user-123",
  })
  @IsString()
  @IsNotEmpty()
  readonly recipientId!: string;

  @ApiProperty({
    description: "Type de template de notification",
    enum: NotificationTemplateType,
    example: NotificationTemplateType.APPOINTMENT_CONFIRMATION,
  })
  @IsEnum(NotificationTemplateType)
  readonly templateType!: NotificationTemplateType;

  @ApiProperty({
    description: "Variables dynamiques pour le template",
    type: "object",
    additionalProperties: true,
    example: {
      clientName: "Jean Dupont",
      businessName: "Salon Belle Vue",
      appointmentDate: "15 janvier 2025",
      appointmentTime: "14:30",
      serviceName: "Coupe de cheveux",
    },
  })
  @IsObject()
  readonly variables!: Record<string, any>;

  @ApiPropertyOptional({
    description: "Langue de la notification (fr/en)",
    example: "fr",
    default: "fr",
  })
  @IsOptional()
  @IsString()
  @IsIn(["fr", "en"])
  readonly language?: string = "fr";

  @ApiPropertyOptional({
    description: "Canal de notification prioritaire",
    example: "EMAIL",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly preferredChannel?: string;

  @ApiPropertyOptional({
    description: "Priorité de la notification",
    example: "NORMAL",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["LOW", "NORMAL", "HIGH", "URGENT"])
  readonly priority?: string = "NORMAL";

  @ApiPropertyOptional({
    description: "Date de programmation (optionnelle pour envoi différé)",
    example: "2025-01-20T10:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly scheduledAt?: string;

  @ApiPropertyOptional({
    description: "Métadonnées additionnelles",
    type: "object",
    additionalProperties: true,
    example: {
      appointmentId: "appointment-123",
      businessId: "business-456",
    },
  })
  @IsOptional()
  @IsObject()
  readonly metadata?: Record<string, any>;
}

/**
 * DTO pour envoyer des notifications en masse
 */
export class SendBulkNotificationDto {
  @ApiProperty({
    description: "Liste des IDs des destinataires",
    type: [String],
    example: ["user-123", "user-456", "user-789"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  readonly recipientIds!: string[];

  @ApiProperty({
    description: "Type de template de notification",
    enum: NotificationTemplateType,
    example: NotificationTemplateType.APPOINTMENT_REMINDER,
  })
  @IsEnum(NotificationTemplateType)
  readonly templateType!: NotificationTemplateType;

  @ApiProperty({
    description: "Variables communes pour tous les destinataires",
    type: "object",
    additionalProperties: true,
    example: {
      businessName: "Salon Belle Vue",
      promotionEndDate: "31 janvier 2025",
    },
  })
  @IsObject()
  readonly commonVariables!: Record<string, any>;

  @ApiPropertyOptional({
    description: "Variables spécifiques par destinataire",
    type: "object",
    additionalProperties: true,
    example: {
      "user-123": { clientName: "Jean Dupont", appointmentTime: "14:30" },
      "user-456": { clientName: "Marie Martin", appointmentTime: "15:00" },
    },
  })
  @IsOptional()
  @IsObject()
  readonly recipientVariables?: Record<string, Record<string, any>>;

  @ApiPropertyOptional({
    description: "Langue de la notification (fr/en)",
    example: "fr",
    default: "fr",
  })
  @IsOptional()
  @IsString()
  @IsIn(["fr", "en"])
  readonly language?: string = "fr";

  @ApiPropertyOptional({
    description: "Canal de notification prioritaire",
    example: "EMAIL",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly preferredChannel?: string;

  @ApiPropertyOptional({
    description: "Priorité de la notification",
    example: "NORMAL",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
  })
  @IsOptional()
  @IsString()
  @IsIn(["LOW", "NORMAL", "HIGH", "URGENT"])
  readonly priority?: string = "NORMAL";
}

/**
 * DTO pour rechercher des notifications avec filtres avancés
 */
export class ListNotificationsDto {
  @ApiPropertyOptional({
    description: "Numéro de page",
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiPropertyOptional({
    description: "Champ de tri",
    enum: ["createdAt", "scheduledAt", "priority", "status"],
    default: "createdAt",
    example: "createdAt",
  })
  @IsOptional()
  @IsString()
  @IsIn(["createdAt", "scheduledAt", "priority", "status"])
  readonly sortBy?: string = "createdAt";

  @ApiPropertyOptional({
    description: "Ordre de tri",
    enum: ["asc", "desc"],
    default: "desc",
    example: "desc",
  })
  @IsOptional()
  @IsString()
  @IsIn(["asc", "desc"])
  readonly sortOrder?: "asc" | "desc" = "desc";

  @ApiPropertyOptional({
    description: "Filtrer par destinataire",
    example: "user-123",
  })
  @IsOptional()
  @IsString()
  readonly recipientId?: string;

  @ApiPropertyOptional({
    description: "Filtrer par statut",
    enum: ["PENDING", "SENT", "DELIVERED", "FAILED", "READ"],
    example: "SENT",
  })
  @IsOptional()
  @IsString()
  @IsIn(["PENDING", "SENT", "DELIVERED", "FAILED", "READ"])
  readonly status?: string;

  @ApiPropertyOptional({
    description: "Filtrer par canal",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
    example: "EMAIL",
  })
  @IsOptional()
  @IsString()
  @IsIn(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly channel?: string;

  @ApiPropertyOptional({
    description: "Filtrer par priorité",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
    example: "HIGH",
  })
  @IsOptional()
  @IsString()
  @IsIn(["LOW", "NORMAL", "HIGH", "URGENT"])
  readonly priority?: string;

  @ApiPropertyOptional({
    description: "Filtrer par type de template",
    enum: NotificationTemplateType,
    example: NotificationTemplateType.APPOINTMENT_CONFIRMATION,
  })
  @IsOptional()
  @IsEnum(NotificationTemplateType)
  readonly templateType?: NotificationTemplateType;

  @ApiPropertyOptional({
    description: "Date de début pour la recherche",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly dateFrom?: string;

  @ApiPropertyOptional({
    description: "Date de fin pour la recherche",
    example: "2025-01-31T23:59:59.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly dateTo?: string;

  @ApiPropertyOptional({
    description: "Recherche textuelle dans le contenu",
    example: "rendez-vous",
  })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional({
    description: "Inclure seulement les non lues",
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly unreadOnly?: boolean = false;
}

/**
 * DTO pour marquer une notification comme lue
 */
export class MarkNotificationAsReadDto {
  @ApiProperty({
    description: "ID de la notification à marquer comme lue",
    example: "notification-123",
  })
  @IsString()
  @IsUUID()
  readonly notificationId!: string;
}

/**
 * DTO pour marquer plusieurs notifications comme lues
 */
export class MarkMultipleNotificationsAsReadDto {
  @ApiProperty({
    description: "Liste des IDs des notifications à marquer comme lues",
    type: [String],
    example: ["notification-123", "notification-456"],
  })
  @IsArray()
  @IsString({ each: true })
  @IsUUID(undefined, { each: true })
  readonly notificationIds!: string[];
}

/**
 * DTO pour les statistiques de notifications
 */
export class GetNotificationAnalyticsDto {
  @ApiPropertyOptional({
    description: "Date de début pour les statistiques",
    example: "2025-01-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly dateFrom?: string;

  @ApiPropertyOptional({
    description: "Date de fin pour les statistiques",
    example: "2025-01-31T23:59:59.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly dateTo?: string;

  @ApiPropertyOptional({
    description: "Filtrer par destinataire",
    example: "user-123",
  })
  @IsOptional()
  @IsString()
  readonly recipientId?: string;

  @ApiPropertyOptional({
    description: "Filtrer par type de template",
    enum: NotificationTemplateType,
    example: NotificationTemplateType.APPOINTMENT_CONFIRMATION,
  })
  @IsOptional()
  @IsEnum(NotificationTemplateType)
  readonly templateType?: NotificationTemplateType;

  @ApiPropertyOptional({
    description: "Granularité des statistiques",
    enum: ["daily", "weekly", "monthly"],
    default: "daily",
    example: "daily",
  })
  @IsOptional()
  @IsString()
  @IsIn(["daily", "weekly", "monthly"])
  readonly granularity?: string = "daily";
}
