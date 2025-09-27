/**
 * 🔍 Get Professional DTO - Validation & Swagger
 *
 * DTO pour récupérer un professionnel par ID avec documentation Swagger.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class GetProfessionalByIdDto {
  @ApiProperty({
    description: "Professional unique identifier",
    example: "123e4567-e89b-12d3-a456-426614174000",
    format: "uuid",
  })
  @IsUUID(4, { message: "Professional ID must be a valid UUID" })
  readonly id!: string;
}

/**
 * 📄 Get Professional Response DTO
 */
export class GetProfessionalResponseDto {
  @ApiProperty({
    description: "Operation success status",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Professional data",
    type: "object",
    properties: {
      id: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      businessId: {
        type: "string",
        format: "uuid",
        example: "123e4567-e89b-12d3-a456-426614174000",
      },
      firstName: {
        type: "string",
        example: "Dr. Marie",
      },
      lastName: {
        type: "string",
        example: "Dubois",
      },
      email: {
        type: "string",
        format: "email",
        example: "marie.dubois@medical-center.fr",
      },
      phone: {
        type: "string",
        example: "+33123456789",
        nullable: true,
      },
      specialization: {
        type: "string",
        example: "Cardiologue",
      },
      licenseNumber: {
        type: "string",
        example: "CERT-2024-12345",
        nullable: true,
      },
      biography: {
        type: "string",
        example:
          "Experienced cardiologist with 10+ years in preventive medicine.",
        nullable: true,
      },
      profileImageUrl: {
        type: "string",
        format: "url",
        example: "https://s3.amazonaws.com/bucket/professionals/profile.jpg",
        nullable: true,
      },
      isAvailable: {
        type: "boolean",
        example: true,
      },
      createdAt: {
        type: "string",
        format: "date-time",
        example: "2024-09-24T10:30:00.000Z",
      },
      updatedAt: {
        type: "string",
        format: "date-time",
        example: "2024-09-24T10:30:00.000Z",
      },
    },
  })
  readonly data!: {
    readonly id: string;
    readonly businessId: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly email: string;
    readonly phone?: string;
    readonly specialization: string;
    readonly licenseNumber?: string;
    readonly biography?: string;
    readonly profileImageUrl?: string;
    readonly isAvailable: boolean;
    readonly createdAt: string;
    readonly updatedAt: string;
  };

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
