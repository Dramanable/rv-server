/**
 * 📝 SET PRACTITIONER AVAILABILITY DTOs
 *
 * DTOs pour la gestion de la disponibilité des praticiens
 * Validation stricte avec class-validator et documentation Swagger
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from "class-validator";

// 🕐 DTO pour les créneaux horaires
export class TimeSlotDto {
  @ApiProperty({
    description: "Heure de début du créneau",
    example: "09:00",
    pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  readonly startTime!: string;

  @ApiProperty({
    description: "Heure de fin du créneau",
    example: "12:00",
    pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  readonly endTime!: string;
}

// 🚫 DTO pour les périodes de pause
export class BreakPeriodDto {
  @ApiProperty({
    description: "Heure de début de la pause",
    example: "10:30",
    pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  readonly startTime!: string;

  @ApiProperty({
    description: "Heure de fin de la pause",
    example: "10:45",
    pattern: "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$",
  })
  @IsString()
  @IsNotEmpty()
  readonly endTime!: string;
}

// 📅 DTO pour les disponibilités par jour
export class DayAvailabilityDto {
  @ApiProperty({
    description: "Jour de la semaine (0=Dimanche, 1=Lundi, ..., 6=Samedi)",
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsInt()
  @Min(0)
  @Max(6)
  readonly dayOfWeek!: number;

  @ApiProperty({
    description: "Le praticien est-il disponible ce jour-là",
    example: true,
  })
  @IsBoolean()
  readonly isAvailable!: boolean;

  @ApiProperty({
    description: "Créneaux horaires de travail pour cette journée",
    type: [TimeSlotDto],
    example: [
      { startTime: "09:00", endTime: "12:00" },
      { startTime: "14:00", endTime: "17:00" },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  readonly timeSlots!: TimeSlotDto[];

  @ApiPropertyOptional({
    description: "Périodes de pause dans la journée",
    type: [BreakPeriodDto],
    example: [{ startTime: "10:30", endTime: "10:45" }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BreakPeriodDto)
  readonly breakPeriods?: BreakPeriodDto[];
}

// 📋 DTO principal pour définir la disponibilité
export class AvailabilityConfigDto {
  @ApiProperty({
    description: "Date de début de la période de disponibilité",
    example: "2025-10-01",
    type: String,
    format: "date",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  readonly startDate!: Date;

  @ApiProperty({
    description: "Date de fin de la période de disponibilité",
    example: "2025-12-31",
    type: String,
    format: "date",
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  readonly endDate!: Date;

  @ApiProperty({
    description: "Configuration de disponibilité par jour de la semaine",
    type: [DayAvailabilityDto],
    example: [
      {
        dayOfWeek: 1,
        isAvailable: true,
        timeSlots: [
          { startTime: "09:00", endTime: "12:00" },
          { startTime: "14:00", endTime: "17:00" },
        ],
        breakPeriods: [{ startTime: "10:30", endTime: "10:45" }],
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayAvailabilityDto)
  readonly availabilities!: DayAvailabilityDto[];

  @ApiPropertyOptional({
    description: "Exceptions et jours spéciaux (vacances, formations, etc.)",
    type: "array",
    items: { type: "object", additionalProperties: true },
    example: [],
  })
  @IsOptional()
  @IsArray()
  readonly exceptions?: any[];
}

// 📝 DTO de requête pour définir la disponibilité
export class SetPractitionerAvailabilityDto {
  @ApiProperty({
    description: "ID du praticien dont on définit la disponibilité",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    format: "uuid",
  })
  @IsUUID(4)
  @IsNotEmpty()
  readonly practitionerId!: string;

  @ApiProperty({
    description: "ID de l'entreprise",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d481",
    format: "uuid",
  })
  @IsUUID(4)
  @IsNotEmpty()
  readonly businessId!: string;

  @ApiProperty({
    description: "Configuration complète de la disponibilité",
    type: AvailabilityConfigDto,
  })
  @ValidateNested()
  @Type(() => AvailabilityConfigDto)
  readonly availability!: AvailabilityConfigDto;

  @ApiPropertyOptional({
    description:
      "ID de l'utilisateur qui fait la demande (optionnel, déduit du token JWT)",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    format: "uuid",
  })
  @IsOptional()
  @IsUUID(4)
  readonly requestingUserId?: string;

  @ApiPropertyOptional({
    description: "Date effective de la nouvelle disponibilité",
    example: "2025-10-01T00:00:00.000Z",
    type: String,
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  readonly effectiveDate?: Date;

  @ApiPropertyOptional({
    description: "Notifier les clients des changements de disponibilité",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly notifyClients?: boolean = false;

  @ApiPropertyOptional({
    description: "Reprogrammer automatiquement les conflits détectés",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly autoRescheduleConflicts?: boolean = false;

  @ApiProperty({
    description: "ID de corrélation pour le suivi des logs",
    example: "correlation-abc-123",
  })
  @IsString()
  @IsNotEmpty()
  readonly correlationId!: string;

  @ApiPropertyOptional({
    description: "Timestamp de la requête",
    example: "2025-09-26T10:00:00.000Z",
    type: String,
    format: "date-time",
  })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  readonly timestamp?: Date;
}

// 🎯 DTO de réponse - informations sur les conflits
export class ConflictingAppointmentDto {
  @ApiProperty({
    description: "ID du rendez-vous en conflit",
    example: "appointment-123",
  })
  readonly appointmentId!: string;

  @ApiProperty({
    description: "ID du client concerné",
    example: "client-456",
  })
  readonly clientId!: string;

  @ApiProperty({
    description: "Statut du conflit",
    example: "RESCHEDULED",
    enum: ["RESCHEDULED", "REQUIRES_MANUAL_INTERVENTION"],
  })
  readonly status!: "RESCHEDULED" | "REQUIRES_MANUAL_INTERVENTION";

  @ApiPropertyOptional({
    description: "Nouvelle heure programmée si reprogrammé automatiquement",
    example: "2025-10-15T14:00:00.000Z",
    type: String,
    format: "date-time",
  })
  readonly newScheduledTime?: Date;
}

// ✅ DTO de réponse principale
export class SetPractitionerAvailabilityResponseDto {
  @ApiProperty({
    description: "Succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "ID du praticien",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  readonly practitionerId!: string;

  @ApiProperty({
    description: "Nombre total de créneaux disponibles créés",
    example: 8,
  })
  readonly availableSlots!: number;

  @ApiProperty({
    description: "Nombre de conflits détectés avec les rendez-vous existants",
    example: 2,
  })
  readonly conflictsDetected!: number;

  @ApiProperty({
    description: "Nombre de conflits résolus automatiquement",
    example: 1,
  })
  readonly conflictsResolved!: number;

  @ApiPropertyOptional({
    description: "Détails des rendez-vous en conflit",
    type: [ConflictingAppointmentDto],
    example: [
      {
        appointmentId: "appointment-123",
        clientId: "client-456",
        status: "RESCHEDULED",
        newScheduledTime: "2025-10-15T14:00:00.000Z",
      },
    ],
  })
  readonly conflictingAppointments?: ConflictingAppointmentDto[];

  @ApiPropertyOptional({
    description: "Liste des IDs des notifications envoyées",
    type: [String],
    example: ["notification-abc", "notification-def"],
  })
  readonly notificationsSent?: string[];

  @ApiProperty({
    description: "Message de confirmation",
    example: "Availability updated successfully",
  })
  readonly message!: string;
}
