/**
 * 🕐 DTOs pour la gestion des horaires d'ouverture Business
 *
 * DTOs pour les API de gestion des horaires :
 * - Consultation des horaires
 * - Mise à jour des horaires
 * - Gestion des dates spéciales
 * - Vérification de disponibilité
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsArray,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsIn,
  Matches,
  IsUUID,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ===== Base DTOs =====

export class TimeSlotDto {
  @ApiProperty({
    description: 'Heure de début au format HH:MM',
    example: '09:00',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  readonly start!: string;

  @ApiProperty({
    description: 'Heure de fin au format HH:MM',
    example: '17:30',
    pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  readonly end!: string;

  @ApiPropertyOptional({
    description: 'Nom optionnel du créneau',
    example: 'Matin',
  })
  @IsOptional()
  @IsString()
  readonly name?: string;
}

export class DayScheduleDto {
  @ApiProperty({
    description: 'Jour de la semaine (0=Dimanche, 1=Lundi, ...)',
    example: 1,
    minimum: 0,
    maximum: 6,
  })
  @IsIn([0, 1, 2, 3, 4, 5, 6])
  readonly dayOfWeek!: number;

  @ApiProperty({
    description: 'Le business est-il ouvert ce jour ?',
    example: true,
  })
  @IsBoolean()
  readonly isOpen!: boolean;

  @ApiProperty({
    description: 'Créneaux horaires pour ce jour',
    type: [TimeSlotDto],
    example: [
      { start: '09:00', end: '12:00', name: 'Matin' },
      { start: '14:00', end: '18:00', name: 'Après-midi' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  readonly timeSlots!: TimeSlotDto[];

  @ApiPropertyOptional({
    description: 'Note spéciale pour ce jour',
    example: 'Horaires étendus',
  })
  @IsOptional()
  @IsString()
  readonly specialNote?: string;
}

export class SpecialDateDto {
  @ApiProperty({
    description: 'Date spéciale au format ISO',
    example: '2024-12-25',
  })
  @IsDateString()
  readonly date!: string;

  @ApiProperty({
    description: 'Le business est-il ouvert à cette date ?',
    example: false,
  })
  @IsBoolean()
  readonly isOpen!: boolean;

  @ApiPropertyOptional({
    description: 'Créneaux horaires spéciaux pour cette date',
    type: [TimeSlotDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  readonly timeSlots?: TimeSlotDto[];

  @ApiProperty({
    description: 'Raison de cette date spéciale',
    example: 'Jour férié - Noël',
  })
  @IsString()
  @IsNotEmpty()
  readonly reason!: string;
}

// ===== Request DTOs =====

export class GetBusinessHoursDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly businessId!: string;
}

export class UpdateBusinessHoursDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly businessId!: string;

  @ApiProperty({
    description: 'Horaires hebdomadaires (7 jours)',
    type: [DayScheduleDto],
    example: [
      { dayOfWeek: 0, isOpen: false, timeSlots: [] },
      {
        dayOfWeek: 1,
        isOpen: true,
        timeSlots: [{ start: '09:00', end: '18:00' }],
      },
      {
        dayOfWeek: 2,
        isOpen: true,
        timeSlots: [{ start: '09:00', end: '18:00' }],
      },
      {
        dayOfWeek: 3,
        isOpen: true,
        timeSlots: [{ start: '09:00', end: '18:00' }],
      },
      {
        dayOfWeek: 4,
        isOpen: true,
        timeSlots: [{ start: '09:00', end: '18:00' }],
      },
      {
        dayOfWeek: 5,
        isOpen: true,
        timeSlots: [{ start: '09:00', end: '18:00' }],
      },
      { dayOfWeek: 6, isOpen: false, timeSlots: [] },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  readonly weeklySchedule!: DayScheduleDto[];

  @ApiPropertyOptional({
    description: 'Dates spéciales (optionnel)',
    type: [SpecialDateDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialDateDto)
  readonly specialDates?: SpecialDateDto[];

  @ApiPropertyOptional({
    description: 'Fuseau horaire',
    example: 'Europe/Paris',
    default: 'Europe/Paris',
  })
  @IsOptional()
  @IsString()
  readonly timezone?: string;
}

export class AddSpecialDateDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly businessId!: string;

  @ApiProperty({
    description: 'Date spéciale au format ISO',
    example: '2024-12-25',
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  readonly date!: Date;

  @ApiProperty({
    description: 'Le business est-il ouvert à cette date ?',
    example: false,
  })
  @IsBoolean()
  readonly isOpen!: boolean;

  @ApiPropertyOptional({
    description: 'Créneaux horaires pour cette date spéciale',
    type: [TimeSlotDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  readonly timeSlots?: TimeSlotDto[];

  @ApiProperty({
    description: 'Raison de cette date spéciale',
    example: 'Jour férié - Noël',
  })
  @IsString()
  @IsNotEmpty()
  readonly reason!: string;
}

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly businessId!: string;

  @ApiProperty({
    description: 'Date à vérifier au format ISO',
    example: '2024-03-15',
  })
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  readonly date!: Date;

  @ApiPropertyOptional({
    description: 'Heure spécifique à vérifier (format HH:MM)',
    example: '14:30',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:MM format',
  })
  readonly time?: string;
}

// ===== Response DTOs =====

export class BusinessHoursResponseDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Nom du business',
    example: 'Cabinet Médical Dupont',
  })
  readonly businessName!: string;

  @ApiProperty({
    description: 'Horaires hebdomadaires',
    type: [DayScheduleDto],
  })
  readonly weeklySchedule!: DayScheduleDto[];

  @ApiProperty({
    description: 'Dates spéciales',
    type: [SpecialDateDto],
  })
  readonly specialDates!: SpecialDateDto[];

  @ApiProperty({
    description: 'Fuseau horaire',
    example: 'Europe/Paris',
  })
  readonly timezone!: string;

  @ApiProperty({
    description: 'Le business est-il actuellement ouvert ?',
    example: true,
  })
  readonly isCurrentlyOpen!: boolean;

  @ApiPropertyOptional({
    description: "Prochaine heure d'ouverture si fermé",
    example: {
      date: '2024-03-18',
      time: '09:00',
    },
  })
  readonly nextOpeningTime?: {
    readonly date: string;
    readonly time: string;
  };
}

export class UpsertBusinessHoursResponseDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Message de confirmation',
    example: "Horaires d'ouverture mis à jour avec succès",
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Date de dernière mise à jour',
    example: '2024-03-15T10:30:00Z',
  })
  readonly updatedAt!: Date;
}

export class AddSpecialDateResponseDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Date spéciale ajoutée',
    type: SpecialDateDto,
  })
  readonly specialDate!: SpecialDateDto;

  @ApiProperty({
    description: 'Message de confirmation',
    example: 'Date spéciale ajoutée avec succès',
  })
  readonly message!: string;
}

export class AvailabilityResponseDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly businessId!: string;

  @ApiProperty({
    description: 'Date vérifiée',
    example: '2024-03-15',
  })
  readonly date!: string;

  @ApiProperty({
    description: 'Le business est-il ouvert à cette date ?',
    example: true,
  })
  readonly isOpenOnDate!: boolean;

  @ApiProperty({
    description: 'Créneaux disponibles pour cette date',
    type: [TimeSlotDto],
  })
  readonly availableTimeSlots!: TimeSlotDto[];

  @ApiPropertyOptional({
    description: "Le business est-il ouvert à l'heure spécifiée ?",
    example: true,
  })
  readonly isOpenAtTime?: boolean;

  @ApiPropertyOptional({
    description: "Prochain créneau disponible si fermé à l'heure demandée",
    type: TimeSlotDto,
  })
  readonly nextAvailableSlot?: TimeSlotDto;
}

// ===== Utility DTOs =====

export class BusinessHoursQuickSetupDto {
  @ApiProperty({
    description: 'ID du business',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  readonly businessId!: string;

  @ApiProperty({
    description: 'Type de configuration rapide',
    enum: [
      'standard_business',
      'medical_practice',
      'retail_store',
      'restaurant',
      '24_7',
      'closed',
    ],
    example: 'standard_business',
  })
  @IsIn([
    'standard_business',
    'medical_practice',
    'retail_store',
    'restaurant',
    '24_7',
    'closed',
  ])
  readonly preset!:
    | 'standard_business'
    | 'medical_practice'
    | 'retail_store'
    | 'restaurant'
    | '24_7'
    | 'closed';

  @ApiPropertyOptional({
    description: "Jours d'ouverture (0=Dimanche, 1=Lundi, ...)",
    example: [1, 2, 3, 4, 5],
    default: [1, 2, 3, 4, 5],
  })
  @IsOptional()
  @IsArray()
  @IsIn([0, 1, 2, 3, 4, 5, 6], { each: true })
  readonly openDays?: number[];

  @ApiPropertyOptional({
    description: "Heure d'ouverture par défaut",
    example: '09:00',
    default: '09:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  readonly openTime?: string;

  @ApiPropertyOptional({
    description: 'Heure de fermeture par défaut',
    example: '17:00',
    default: '17:00',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  readonly closeTime?: string;

  @ApiPropertyOptional({
    description: 'Pause déjeuner',
    example: { start: '12:00', end: '13:00' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TimeSlotDto)
  readonly lunchBreak?: {
    start: string;
    end: string;
  };
}
