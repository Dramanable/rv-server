import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

/**
 * Critères de segmentation pour cibler les destinataires
 */
export class SegmentationCriteriaDto {
  @ApiPropertyOptional({
    description: "Filtrer par rôles utilisateur",
    enum: ["SUPER_ADMIN", "ADMIN", "BUSINESS_OWNER", "STAFF", "CLIENT"],
    isArray: true,
    example: ["CLIENT", "STAFF"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly userRole?: string[];

  @ApiPropertyOptional({
    description: "Filtrer par business ID spécifique",
    type: [String],
    example: ["business_123", "business_456"],
  })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  readonly businessId?: string[];

  @ApiPropertyOptional({
    description: "Utilisateurs actifs après cette date",
    format: "date-time",
    example: "2025-09-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly lastActivityAfter?: string;

  @ApiPropertyOptional({
    description: "Utilisateurs actifs avant cette date",
    format: "date-time",
    example: "2025-09-22T23:59:59.999Z",
  })
  @IsOptional()
  @IsDateString()
  readonly lastActivityBefore?: string;

  @ApiPropertyOptional({
    description: "Filtrer par canal de communication préféré",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
    example: "EMAIL",
  })
  @IsOptional()
  @IsEnum(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly preferredChannel?: string;

  @ApiPropertyOptional({
    description: "Utilisateurs ayant des rendez-vous dans cette période",
    type: "object",
    properties: {
      from: { type: "string", format: "date-time" },
      to: { type: "string", format: "date-time" },
    },
    example: {
      from: "2025-09-23T00:00:00.000Z",
      to: "2025-09-23T23:59:59.999Z",
    },
  })
  @IsOptional()
  @IsObject()
  readonly appointmentDateRange?: {
    from: string;
    to: string;
  };

  @ApiPropertyOptional({
    description: "Inclure/exclure les utilisateurs inactifs",
    example: false,
  })
  @IsOptional()
  readonly includeInactive?: boolean;
}

/**
 * Destinataire individuel avec variables personnalisées
 */
export class BulkRecipientDto {
  @ApiProperty({
    description: "ID unique du destinataire",
    example: "user_123e4567-e89b-12d3-a456-426614174000",
  })
  @IsString()
  @IsUUID(4)
  readonly recipientId!: string;

  @ApiPropertyOptional({
    description: "Variables spécifiques à ce destinataire",
    type: "object",
    additionalProperties: true,
    example: {
      clientName: "Jean Dupont",
      appointmentDate: "23/09/2025",
      appointmentTime: "14h30",
      serviceName: "Consultation médicale",
    },
  })
  @IsOptional()
  @IsObject()
  readonly variables?: Record<
    string,
    string | number | boolean | Date | undefined
  >;

  @ApiPropertyOptional({
    description: "Canal de communication spécifique pour ce destinataire",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
    example: "SMS",
  })
  @IsOptional()
  @IsEnum(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly channel?: string;

  @ApiPropertyOptional({
    description: "Priorité spécifique pour ce destinataire",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
    example: "HIGH",
  })
  @IsOptional()
  @IsEnum(["LOW", "NORMAL", "HIGH", "URGENT"])
  readonly priority?: string;
}

/**
 * DTO pour l'envoi de notifications en lot (campagne)
 */
export class SendBulkNotificationDto {
  @ApiProperty({
    description: "Type de template à utiliser",
    enum: [
      "APPOINTMENT_CONFIRMATION",
      "APPOINTMENT_REMINDER",
      "APPOINTMENT_CANCELLATION",
      "WELCOME_MESSAGE",
      "SYSTEM_MAINTENANCE",
      "CUSTOM",
    ],
    example: "APPOINTMENT_REMINDER",
  })
  @IsString()
  @IsEnum([
    "APPOINTMENT_CONFIRMATION",
    "APPOINTMENT_REMINDER",
    "APPOINTMENT_CANCELLATION",
    "WELCOME_MESSAGE",
    "SYSTEM_MAINTENANCE",
    "CUSTOM",
  ])
  readonly templateType!: string;

  @ApiProperty({
    description: "Canal de communication par défaut",
    enum: ["EMAIL", "SMS", "PUSH", "IN_APP"],
    example: "EMAIL",
  })
  @IsString()
  @IsEnum(["EMAIL", "SMS", "PUSH", "IN_APP"])
  readonly defaultChannel!: string;

  @ApiProperty({
    description: "Priorité par défaut des notifications",
    enum: ["LOW", "NORMAL", "HIGH", "URGENT"],
    example: "NORMAL",
  })
  @IsString()
  @IsEnum(["LOW", "NORMAL", "HIGH", "URGENT"])
  readonly priority!: string;

  @ApiProperty({
    description: "Nom de la campagne (pour le suivi)",
    minLength: 3,
    maxLength: 100,
    example: "Rappels de rendez-vous du 23/09/2025",
  })
  @IsString()
  @Length(3, 100)
  readonly campaignName!: string;

  @ApiPropertyOptional({
    description: "Critères de segmentation automatique",
    type: SegmentationCriteriaDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SegmentationCriteriaDto)
  readonly segmentation?: SegmentationCriteriaDto;

  @ApiPropertyOptional({
    description:
      "Liste explicite de destinataires (alternative à la segmentation)",
    type: [BulkRecipientDto],
    maxItems: 10000,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkRecipientDto)
  readonly recipients?: BulkRecipientDto[];

  @ApiPropertyOptional({
    description: "Variables communes à tous les destinataires",
    type: "object",
    additionalProperties: true,
    example: {
      businessName: "Cabinet Médical Dupont",
      businessPhone: "+33 1 23 45 67 89",
      businessAddress: "123 Rue de la Santé, 75013 Paris",
      supportEmail: "support@cabinet-dupont.fr",
    },
  })
  @IsOptional()
  @IsObject()
  readonly commonVariables?: Record<
    string,
    string | number | boolean | Date | undefined
  >;

  @ApiPropertyOptional({
    description: "Template personnalisé (requis si templateType = CUSTOM)",
    type: "object",
    properties: {
      subject: { type: "string", description: "Sujet du message" },
      content: { type: "string", description: "Contenu du message" },
      language: {
        type: "string",
        description: "Langue du template",
        example: "fr",
      },
    },
    example: {
      subject: "Message personnalisé - {{businessName}}",
      content: "Bonjour {{clientName}}, nous vous informons que...",
      language: "fr",
    },
  })
  @IsOptional()
  @IsObject()
  readonly customTemplate?: {
    subject: string;
    content: string;
    language?: string;
  };

  @ApiPropertyOptional({
    description: "Taille des lots pour le traitement (défaut: 100)",
    minimum: 1,
    maximum: 1000,
    example: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  readonly batchSize?: number;

  @ApiPropertyOptional({
    description: "Limite d'envois par minute (défaut: 500)",
    minimum: 1,
    maximum: 10000,
    example: 500,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  readonly rateLimitPerMinute?: number;

  @ApiPropertyOptional({
    description: "Programmer l'envoi à une date précise",
    format: "date-time",
    example: "2025-09-23T08:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  readonly scheduledAt?: string;

  @ApiPropertyOptional({
    description: "Mode prévisualisation uniquement (aucun envoi réel)",
    example: false,
  })
  @IsOptional()
  readonly previewOnly?: boolean;
}
