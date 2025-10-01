import { ApiProperty } from "@nestjs/swagger";

/**
 * 📅 Staff Availability Response DTO
 *
 * DTO de réponse pour les disponibilités d'un membre du staff.
 * Structure les WorkingHours de manière lisible pour l'API.
 */
export class StaffAvailabilityResponseDto {
  @ApiProperty({
    description: "Staff member ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  readonly staffId!: string;

  @ApiProperty({
    description: "Working hours configuration",
    type: "object",
    additionalProperties: true,
    example: {
      weeklySchedule: {
        "1": {
          isOpen: true,
          timeSlots: [
            { startTime: "09:00", endTime: "12:00" },
            { startTime: "14:00", endTime: "18:00" },
          ],
        },
        "2": {
          isOpen: true,
          timeSlots: [{ startTime: "09:00", endTime: "17:00" }],
        },
      },
      specialDates: [
        {
          date: "2024-01-15",
          isOpen: false,
          reason: "Formation professionnelle",
        },
      ],
      timezone: "Europe/Paris",
    },
  })
  readonly workingHours!: any;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-10T14:30:00Z",
  })
  readonly lastUpdated!: string;

  @ApiProperty({
    description: "User who last updated the availability",
    example: "manager-uuid-123",
  })
  readonly updatedBy!: string;

  /**
   * Factory method pour créer le DTO depuis le domaine
   */
  static fromDomain(domainResult: any): StaffAvailabilityResponseDto {
    return {
      staffId: domainResult.staffId,
      workingHours: domainResult.workingHours,
      lastUpdated:
        domainResult.lastUpdated?.toISOString() || new Date().toISOString(),
      updatedBy: domainResult.updatedBy || "system",
    };
  }
}
