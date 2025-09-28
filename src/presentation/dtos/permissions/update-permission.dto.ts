/**
 * 🎯 DTO - UpdatePermission
 * Clean Architecture - Presentation Layer
 * DTO pour la mise à jour d'une permission existante
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: "Nom d'affichage de la permission",
    example: 'Gérer les rendez-vous (mis à jour)',
    minLength: 3,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(3, 200)
  readonly displayName?: string;

  @ApiPropertyOptional({
    description: 'Description détaillée de la permission',
    example:
      'Permet de créer, modifier, annuler et reprogrammer les rendez-vous',
    minLength: 10,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(10, 1000)
  readonly description?: string;

  @ApiPropertyOptional({
    description: 'Statut actif/inactif de la permission',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;
}
