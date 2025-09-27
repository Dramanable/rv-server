/**
 * @fileoverview Send Notification DTO
 * @module Presentation/DTOs/Notification
 * @version 1.0.0
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from "class-validator";

/**
 * DTO pour les métadonnées de notification
 */
export class NotificationMetadataDto {
  @ApiPropertyOptional({
    description: "ID du rendez-vous associé",
    example: "appointment_123e4567-e89b-12d3-a456-426614174000",
  })
  @IsOptional()
  @IsString()
  readonly appointmentId?: string;

  @ApiPropertyOptional({
    description: "ID de l'entreprise concernée",
    example: "business_456e7890-e89b-12d3-a456-426614174001",
  })
  @IsOptional()
  @IsString()
  readonly businessId?: string;

  @ApiPropertyOptional({
    description: "ID du service concerné",
    example: "service_789e0123-e89b-12d3-a456-426614174002",
  })
  @IsOptional()
  @IsString()
  readonly serviceId?: string;

  @ApiPropertyOptional({
    description: "ID du personnel concerné",
    example: "staff_012e3456-e89b-12d3-a456-426614174003",
  })
  @IsOptional()
  @IsString()
  readonly staffId?: string;

  @ApiPropertyOptional({
    description: "ID du template utilisé",
    example: "template_appointment_reminder",
  })
  @IsOptional()
  @IsString()
  readonly templateId?: string;

  @ApiPropertyOptional({
    description: "Type d'événement original",
    example: "APPOINTMENT_CONFIRMED",
  })
  @IsOptional()
  @IsString()
  readonly originalEventType?: string;

  @ApiPropertyOptional({
    description: "ID de corrélation pour le tracing",
    example: "corr_345e6789-e89b-12d3-a456-426614174004",
  })
  @IsOptional()
  @IsString()
  readonly correlationId?: string;
}

/**
 * DTO principal pour l'envoi de notifications
 */
export class SendNotificationDto {
  @ApiProperty({
    description: "ID du destinataire de la notification",
    example: "user_123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly recipientId!: string;

  @ApiProperty({
    description: "Titre de la notification",
    example: "Confirmation de rendez-vous",
    minLength: 1,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 200)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly title!: string;

  @ApiProperty({
    description: "Contenu de la notification",
    example: "Votre rendez-vous du 23/09/2025 à 14h30 est confirmé.",
    minLength: 1,
    maxLength: 5000,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 5000)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly content!: string;

  @ApiProperty({
    description: "Canal de diffusion de la notification",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
    example: "EMAIL",
  })
  @IsEnum(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly channel!: string;

  @ApiPropertyOptional({
    description: "Priorité de la notification",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
    default: "NORMAL",
    example: "HIGH",
  })
  @IsOptional()
  @IsEnum(["LOW", "NORMAL", "HIGH", "URGENT"])
  readonly priority?: string;

  @ApiPropertyOptional({
    description: "Métadonnées additionnelles pour la notification",
    type: NotificationMetadataDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationMetadataDto)
  readonly metadata?: NotificationMetadataDto;

  @ApiPropertyOptional({
    description: "Date et heure de planification (ISO 8601)",
    example: "2025-09-23T14:30:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly scheduledFor?: string;
}
