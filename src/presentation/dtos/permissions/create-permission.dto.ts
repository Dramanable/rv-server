/**
 * 🎯 DTO - CreatePermission
 * Clean Architecture - Presentation Layer
 * DTO pour la création d'une nouvelle permission
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Nom unique de la permission',
    example: 'MANAGE_APPOINTMENTS',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100)
  readonly name!: string;

  @ApiProperty({
    description: "Nom d'affichage de la permission",
    example: 'Gérer les rendez-vous',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @Length(3, 200)
  readonly displayName!: string;

  @ApiProperty({
    description: 'Description détaillée de la permission',
    example: 'Permet de créer, modifier et annuler les rendez-vous',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @Length(10, 1000)
  readonly description!: string;

  @ApiProperty({
    description: 'Catégorie de la permission',
    example: 'APPOINTMENTS',
    enum: ['BUSINESS', 'STAFF', 'SERVICES', 'APPOINTMENTS', 'USERS', 'SYSTEM'],
  })
  @IsString()
  readonly category!: string;

  @ApiProperty({
    description: "Indique si c'est une permission système",
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  readonly isSystemPermission?: boolean;
}
