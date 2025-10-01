import { ApiProperty } from "@nestjs/swagger";

/**
 * 👤 Available Staff Member DTO
 *
 * Représente un membre du staff disponible avec ses métadonnées.
 */
export class AvailableStaffMemberDto {
  @ApiProperty({
    description: "Staff member ID",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Staff member name",
    example: "Marie Dubois",
  })
  readonly name!: string;

  @ApiProperty({
    description: "Staff role",
    example: "THERAPIST",
  })
  readonly role!: string;

  @ApiProperty({
    description: "Staff skills",
    type: [String],
    example: ["massage-therapy", "deep-tissue", "aromatherapy"],
  })
  readonly skills!: string[];

  @ApiProperty({
    description: "Available time slots for the requested period",
    type: "array",
    items: {
      type: "object",
      properties: {
        startTime: { type: "string", example: "09:00" },
        endTime: { type: "string", example: "12:00" },
      },
    },
    example: [
      { startTime: "09:00", endTime: "12:00" },
      { startTime: "14:00", endTime: "17:00" },
    ],
  })
  readonly availableSlots!: Array<{ startTime: string; endTime: string }>;

  @ApiProperty({
    description: "Compatibility score (0-100)",
    example: 95,
  })
  readonly compatibilityScore!: number;

  @ApiProperty({
    description: "Current workload percentage",
    example: 75,
  })
  readonly workloadPercentage!: number;
}

/**
 * 📋 Available Staff List Response DTO
 *
 * DTO de réponse pour la liste du staff disponible avec métadonnées de recherche.
 */
export class AvailableStaffListResponseDto {
  @ApiProperty({
    description: "List of available staff members",
    type: [AvailableStaffMemberDto],
  })
  readonly staff!: AvailableStaffMemberDto[];

  @ApiProperty({
    description: "Search metadata",
    example: {
      searchPeriod: {
        startTime: "2024-01-15T09:00:00Z",
        endTime: "2024-01-15T17:00:00Z",
      },
      totalFound: 5,
      bestMatch: {
        staffId: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        score: 98,
      },
    },
  })
  readonly searchMetadata!: {
    searchPeriod: {
      startTime: string;
      endTime: string;
    };
    totalFound: number;
    bestMatch?: {
      staffId: string;
      score: number;
    };
  };

  /**
   * Factory method pour créer le DTO depuis le domaine
   */
  static fromDomain(domainResult: any): AvailableStaffListResponseDto {
    return {
      staff:
        domainResult.staff?.map((member: any) => ({
          id: member.id,
          name: member.name || "Unknown Staff",
          role: member.role || "STAFF",
          skills: member.skills || [],
          availableSlots: member.availableSlots || [],
          compatibilityScore: member.compatibilityScore || 0,
          workloadPercentage: member.workloadPercentage || 0,
        })) || [],
      searchMetadata: {
        searchPeriod: {
          startTime:
            domainResult.searchPeriod?.startTime || new Date().toISOString(),
          endTime:
            domainResult.searchPeriod?.endTime || new Date().toISOString(),
        },
        totalFound: domainResult.totalFound || 0,
        bestMatch: domainResult.bestMatch || undefined,
      },
    };
  }
}
