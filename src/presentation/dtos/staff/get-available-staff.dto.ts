import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

/**
 * 🔍 Get Available Staff DTO
 *
 * DTO pour rechercher le staff disponible selon des critères spécifiques.
 * Permet de filtrer par période, compétences et autres critères métier.
 */
export class GetAvailableStaffDto {
  @ApiProperty({
    description: "Business ID to search staff in",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @IsUUID()
  readonly businessId!: string;

  @ApiProperty({
    description: "Start time for availability search (ISO 8601)",
    example: "2024-01-15T09:00:00Z",
  })
  @IsDateString()
  readonly startTime!: string;

  @ApiProperty({
    description: "End time for availability search (ISO 8601)",
    example: "2024-01-15T17:00:00Z",
  })
  @IsDateString()
  readonly endTime!: string;

  @ApiPropertyOptional({
    description: "Required skills for the service",
    type: [String],
    example: ["massage-therapy", "deep-tissue", "swedish-massage"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly requiredSkills?: string[];

  @ApiPropertyOptional({
    description: "Specific service type required",
    example: "MASSAGE_THERAPY",
  })
  @IsOptional()
  @IsString()
  readonly serviceType?: string;

  @ApiPropertyOptional({
    description: "Optional correlation ID for request tracing",
    example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  })
  @IsOptional()
  @IsString()
  readonly correlationId?: string;
}
