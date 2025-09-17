/**
 * 🏢 Business DTOs - Minimal Version
 *
 * DTOs minimaux pour faire fonctionner le controller business
 */

import { IsString, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBusinessDto {
  @ApiProperty({ example: 'Cabinet Médical Centre Ville' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'Cabinet médical spécialisé en médecine générale' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'contact@cabinet-centreville.fr' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+33123456789' })
  @IsPhoneNumber('FR')
  phone!: string;

  @ApiProperty({ example: '123 rue de la Paix, 75001 Paris, France' })
  @IsString()
  address!: string;
}

export class UpdateBusinessDto {
  @ApiProperty({ example: 'Nouveau nom du cabinet' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Nouvelle description' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class BusinessResponseDto {
  @ApiProperty({ example: 'uuid-123' })
  id!: string;

  @ApiProperty({ example: 'Cabinet Médical Centre Ville' })
  name!: string;

  @ApiProperty({ example: 'Cabinet médical spécialisé en médecine générale' })
  description!: string;

  @ApiProperty({ example: 'contact@cabinet-centreville.fr' })
  email!: string;

  @ApiProperty({ example: '+33123456789' })
  phone!: string;

  @ApiProperty({ example: '123 rue de la Paix, 75001 Paris, France' })
  address!: string;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({ example: true })
  isActive!: boolean;
}

export class BusinessListQueryDto {
  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  page?: number;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  limit?: number;

  @ApiProperty({ required: false, example: 'cabinet' })
  @IsOptional()
  search?: string;

  @ApiProperty({ required: false, example: 'ACTIVE' })
  @IsOptional()
  status?: string;
}

export class PaginatedBusinessResponseDto {
  @ApiProperty({ type: [BusinessResponseDto] })
  data!: BusinessResponseDto[];

  @ApiProperty({
    example: {
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
      hasNext: true,
      hasPrevious: false,
    },
  })
  meta!: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}
