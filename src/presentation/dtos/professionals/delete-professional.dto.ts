/**
 * 🗑️ Delete Professional DTO - Validation & Swagger
 *
 * DTO pour la suppression d'un professionnel avec documentation Swagger.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class DeleteProfessionalDto {
  @ApiProperty({
    description: "Professional unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsUUID(4, { message: "Professional ID must be a valid UUID" })
  readonly id!: string;
}

/**
 * 📄 Delete Professional Response DTO
 */
export class DeleteProfessionalResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Deletion confirmation message",
    example: "Professional deleted successfully",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Deleted professional ID for confirmation",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  readonly deletedId!: string;

  @ApiProperty({
    description: "Additional metadata",
    type: "object",
    properties: {
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2024-09-24T10:30:00.000Z",
      },
      correlationId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
    },
    additionalProperties: true,
  })
  readonly meta!: {
    readonly timestamp: string;
    readonly correlationId: string;
  };
}
