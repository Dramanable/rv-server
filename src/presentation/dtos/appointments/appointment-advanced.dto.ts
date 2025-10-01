/**
 * 🔄 UPDATE APPOINTMENT STATUS DTOs
 * ✅ DTOs pour la mise à jour de statut de rendez-vous
 * ✅ Validation complète avec class-validator
 * ✅ Documentation Swagger
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../../domain/entities/appointment.entity';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'New status for the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsEnum(AppointmentStatus)
  @IsNotEmpty()
  readonly newStatus!: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Reason for status change (required for cancellation)',
    example: 'Client requested cancellation',
  })
  @IsOptional()
  @IsString()
  readonly reason?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the status change',
    example: 'Session completed successfully, client satisfied',
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class UpdateAppointmentStatusResponseDto {
  @ApiProperty({
    description: 'Updated appointment data',
    type: 'object',
    additionalProperties: true,
  })
  readonly appointment!: any;

  @ApiProperty({
    description: 'Previous status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.REQUESTED,
  })
  readonly previousStatus!: AppointmentStatus;

  @ApiProperty({
    description: 'New status of the appointment',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  readonly newStatus!: AppointmentStatus;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment confirmed successfully',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Whether notification was sent to client',
    example: true,
  })
  readonly notificationSent!: boolean;
}

export class ConfirmAppointmentDto {
  @ApiProperty({
    description: 'Method used for confirmation',
    enum: ['EMAIL', 'PHONE', 'SMS', 'IN_PERSON'],
    example: 'EMAIL',
  })
  @IsEnum(['EMAIL', 'PHONE', 'SMS', 'IN_PERSON'])
  @IsNotEmpty()
  readonly confirmationMethod!: 'EMAIL' | 'PHONE' | 'SMS' | 'IN_PERSON';

  @ApiPropertyOptional({
    description: 'Additional notes for the confirmation',
    example: 'Client confirmed via phone call',
  })
  @IsOptional()
  @IsString()
  readonly notes?: string;
}

export class ConfirmAppointmentResponseDto {
  @ApiProperty({
    description: 'Confirmed appointment data',
    type: 'object',
    additionalProperties: true,
  })
  readonly appointment!: any;

  @ApiProperty({
    description: 'Success message',
    example: 'Appointment confirmed successfully',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Whether confirmation notification was sent',
    example: true,
  })
  readonly confirmationSent!: boolean;
}

// Les DTOs ListAppointmentsDto et ListAppointmentsResponseDto
// sont déjà définis dans appointment-operations.dto.ts et appointment-response.dto.ts
// Pas de duplication ici
