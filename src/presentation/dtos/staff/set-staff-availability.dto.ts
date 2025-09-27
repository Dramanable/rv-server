import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

/**
 * 🔧 Set Staff Availability DTO
 *
 * DTO pour définir la disponibilité d'un membre du staff.
 * Utilise le Value Object WorkingHours pour structurer les données.
 */
export class SetStaffAvailabilityDto {
  @ApiProperty({
    description:
      'Working hours configuration with weekly schedule and special dates',
    type: 'object',
    additionalProperties: true,
    example: {
      weeklySchedule: {
        '1': {
          isOpen: true,
          timeSlots: [
            { startTime: '09:00', endTime: '12:00' },
            { startTime: '14:00', endTime: '18:00' },
          ],
        },
        '2': {
          isOpen: true,
          timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
        },
        '3': { isOpen: false, timeSlots: [] },
      },
      specialDates: [
        {
          date: '2024-01-15',
          isOpen: false,
          reason: 'Formation professionnelle',
        },
      ],
      timezone: 'Europe/Paris',
    },
  })
  @IsObject()
  readonly workingHours!: any;

  @ApiPropertyOptional({
    description: 'Optional correlation ID for request tracing',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @IsOptional()
  @IsString()
  readonly correlationId?: string;
}
