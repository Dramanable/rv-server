import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

/**
 * 🗑️ DTO pour supprimer un type de calendrier
 *
 * Validation stricte des paramètres de suppression
 */
export class DeleteCalendarTypeDto {
  @ApiProperty({
    description: "ID de l'entreprise pour validation des permissions",
    example: "business-123-uuid",
  })
  @IsString()
  @IsUUID()
  readonly businessId!: string;

  @ApiProperty({
    description: "ID de corrélation pour le traçage (optionnel)",
    example: "correlation-456-uuid",
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly correlationId?: string;
}
