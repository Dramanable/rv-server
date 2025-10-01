/**
 * 📄 Business Sector DTOs - Presentation Layer
 *
 * Objets de transfert de données pour les opérations REST des secteurs d'activité.
 * Ces DTOs définissent la structure des requêtes et réponses HTTP.
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";

/**
 * 📋 DTO : Création de secteur d'activité
 */
export class CreateBusinessSectorDto {
  @ApiProperty({
    description: "Nom du secteur d'activité",
    example: "Technologies de l'Information",
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le nom est obligatoire" })
  @Length(2, 100, { message: "Le nom doit contenir entre 2 et 100 caractères" })
  @Matches(/^[a-zA-ZÀ-ÿ0-9\s\-'&.()]+$/, {
    message: "Le nom contient des caractères non autorisés",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly name!: string;

  @ApiProperty({
    description: "Description détaillée du secteur d'activité",
    example:
      "Développement logiciel, conseil en systèmes informatiques, services cloud",
    minLength: 10,
    maxLength: 500,
  })
  @IsString({ message: "La description doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "La description est obligatoire" })
  @Length(10, 500, {
    message: "La description doit contenir entre 10 et 500 caractères",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly description!: string;

  @ApiProperty({
    description:
      "Code unique du secteur (lettres majuscules, chiffres et underscores)",
    example: "IT_SERVICES",
    minLength: 2,
    maxLength: 20,
  })
  @IsString({ message: "Le code doit être une chaîne de caractères" })
  @IsNotEmpty({ message: "Le code est obligatoire" })
  @Length(2, 20, { message: "Le code doit contenir entre 2 et 20 caractères" })
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message:
      "Le code doit commencer par une majuscule et ne contenir que des majuscules, chiffres et underscores",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim().toUpperCase() : value,
  )
  readonly code!: string;
}

/**
 * 📋 DTO : Mise à jour de secteur d'activité
 */
export class UpdateBusinessSectorDto {
  @ApiPropertyOptional({
    description: "Nouveau nom du secteur d'activité",
    example: "Technologies de l'Information et Communication",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: "Le nom doit être une chaîne de caractères" })
  @Length(2, 100, { message: "Le nom doit contenir entre 2 et 100 caractères" })
  @Matches(/^[a-zA-ZÀ-ÿ0-9\s\-'&.()]+$/, {
    message: "Le nom contient des caractères non autorisés",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly name?: string;

  @ApiPropertyOptional({
    description: "Nouvelle description du secteur d'activité",
    example:
      "Développement logiciel, conseil en systèmes informatiques, services cloud et télécommunications",
    minLength: 10,
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: "La description doit être une chaîne de caractères" })
  @Length(10, 500, {
    message: "La description doit contenir entre 10 et 500 caractères",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly description?: string;
}

/**
 * 📋 DTO : Filtres de recherche des secteurs d'activité
 */
export class BusinessSectorFiltersDto {
  @ApiPropertyOptional({
    description: "Recherche textuelle dans le nom et la description",
    example: "technologie",
  })
  @IsOptional()
  @IsString({ message: "La recherche doit être une chaîne de caractères" })
  @Length(1, 100, {
    message: "La recherche doit contenir entre 1 et 100 caractères",
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === "string" ? value.trim() : value,
  )
  readonly search?: string;

  @ApiPropertyOptional({
    description: "Filtrer par statut actif/inactif",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "isActive doit être un booléen" })
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value;
  })
  readonly isActive?: boolean;

  @ApiPropertyOptional({
    description: "Filtrer par codes spécifiques",
    example: ["IT_SERVICES", "CONSULTING"],
    type: [String],
  })
  @IsOptional()
  @IsString({
    each: true,
    message: "Chaque code doit être une chaîne de caractères",
  })
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    each: true,
    message: "Chaque code doit être en majuscules avec underscores",
  })
  readonly codes?: string[];
}

/**
 * 📋 DTO : Options de tri
 */
export class BusinessSectorSortDto {
  @ApiPropertyOptional({
    description: "Champ de tri",
    example: "name",
    enum: ["name", "code", "createdAt", "updatedAt"],
  })
  @IsOptional()
  @IsString({ message: "Le champ de tri doit être une chaîne de caractères" })
  @IsIn(["name", "code", "createdAt", "updatedAt"], {
    message: "Le champ de tri doit être : name, code, createdAt ou updatedAt",
  })
  readonly field?: "name" | "code" | "createdAt" | "updatedAt";

  @ApiPropertyOptional({
    description: "Direction du tri",
    example: "ASC",
    enum: ["ASC", "DESC"],
  })
  @IsOptional()
  @IsString({ message: "La direction doit être une chaîne de caractères" })
  @IsIn(["ASC", "DESC"], {
    message: "La direction doit être ASC ou DESC",
  })
  readonly direction?: "ASC" | "DESC";
}

/**
 * 📋 DTO : Options de pagination
 */
export class BusinessSectorPaginationDto {
  @ApiPropertyOptional({
    description: "Numéro de page (commence à 1)",
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "La page doit être un nombre entier" })
  @Min(1, { message: "La page doit être supérieure ou égale à 1" })
  readonly page?: number;

  @ApiPropertyOptional({
    description: "Nombre d'éléments par page",
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: "La limite doit être un nombre entier" })
  @Min(1, { message: "La limite doit être supérieure ou égale à 1" })
  @Max(100, { message: "La limite ne peut pas dépasser 100" })
  readonly limit?: number;
}

/**
 * 📋 DTO : Requête de liste complète
 */
export class ListBusinessSectorsDto {
  @ApiPropertyOptional({
    description: "Options de pagination",
  })
  @IsOptional()
  readonly pagination?: BusinessSectorPaginationDto;

  @ApiPropertyOptional({
    description: "Options de tri",
  })
  @IsOptional()
  readonly sort?: BusinessSectorSortDto;

  @ApiPropertyOptional({
    description: "Filtres de recherche",
  })
  @IsOptional()
  readonly filters?: BusinessSectorFiltersDto;
}

/**
 * 📋 DTO : Suppression de secteur d'activité
 */
export class DeleteBusinessSectorDto {
  @ApiPropertyOptional({
    description: "Forcer la suppression même si le secteur est utilisé",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: "force doit être un booléen" })
  @Transform(({ value }) => {
    if (value === "true") return true;
    if (value === "false") return false;
    return value === true;
  })
  readonly force?: boolean;
}

/**
 * 📄 DTO : Secteur d'activité en réponse
 */
export class BusinessSectorResponseDto {
  @ApiProperty({
    description: "Identifiant unique du secteur",
    example: "uuid-123-456",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Nom du secteur d'activité",
    example: "Technologies de l'Information",
  })
  readonly name!: string;

  @ApiProperty({
    description: "Description du secteur d'activité",
    example: "Développement logiciel, conseil en systèmes informatiques",
  })
  readonly description!: string;

  @ApiProperty({
    description: "Code unique du secteur",
    example: "IT_SERVICES",
  })
  readonly code!: string;

  @ApiProperty({
    description: "Statut actif/inactif",
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: "Date de création",
    example: "2024-01-01T10:00:00Z",
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: "Identifiant du créateur",
    example: "user-uuid-789",
  })
  readonly createdBy!: string;

  @ApiPropertyOptional({
    description: "Date de dernière mise à jour",
    example: "2024-01-15T14:30:00Z",
  })
  readonly updatedAt?: Date;

  @ApiPropertyOptional({
    description: "Identifiant du dernier modificateur",
    example: "user-uuid-456",
  })
  readonly updatedBy?: string;
}

/**
 * 📊 DTO : Métadonnées de pagination
 */
export class BusinessSectorPaginationMetaDto {
  @ApiProperty({
    description: "Page courante",
    example: 1,
  })
  readonly currentPage!: number;

  @ApiProperty({
    description: "Nombre total de pages",
    example: 5,
  })
  readonly totalPages!: number;

  @ApiProperty({
    description: "Nombre total d'éléments",
    example: 95,
  })
  readonly totalItems!: number;

  @ApiProperty({
    description: "Nombre d'éléments par page",
    example: 20,
  })
  readonly itemsPerPage!: number;

  @ApiProperty({
    description: "Indique s'il y a une page suivante",
    example: true,
  })
  readonly hasNextPage!: boolean;

  @ApiProperty({
    description: "Indique s'il y a une page précédente",
    example: false,
  })
  readonly hasPrevPage!: boolean;
}

/**
 * 📋 DTO : Réponse de liste de secteurs d'activité
 */
export class ListBusinessSectorsResponseDto {
  @ApiProperty({
    description: "Liste des secteurs d'activité",
    type: [BusinessSectorResponseDto],
  })
  readonly data!: BusinessSectorResponseDto[];

  @ApiProperty({
    description: "Métadonnées de pagination",
    type: BusinessSectorPaginationMetaDto,
  })
  readonly meta!: BusinessSectorPaginationMetaDto;
}

/**
 * 📋 DTO : Réponse de création
 */
export class CreateBusinessSectorResponseDto {
  @ApiProperty({
    description: "Indique le succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Message de confirmation",
    example: "Business sector created successfully",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Secteur d'activité créé",
    type: BusinessSectorResponseDto,
  })
  readonly data!: BusinessSectorResponseDto;
}

/**
 * 📋 DTO : Réponse de mise à jour
 */
export class UpdateBusinessSectorResponseDto {
  @ApiProperty({
    description: "Indique le succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Message de confirmation",
    example: "Business sector updated successfully",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Secteur d'activité mis à jour",
    type: BusinessSectorResponseDto,
  })
  readonly data!: BusinessSectorResponseDto;
}

/**
 * 📋 DTO : Réponse de suppression
 */
export class DeleteBusinessSectorResponseDto {
  @ApiProperty({
    description: "Indique le succès de l'opération",
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: "Message de confirmation",
    example: "Business sector deactivated successfully",
  })
  readonly message!: string;

  @ApiProperty({
    description: "Date de suppression/désactivation",
    example: "2024-01-15T14:30:00Z",
  })
  readonly deletedAt!: Date;

  @ApiProperty({
    description: "Identifiant du secteur supprimé",
    example: "uuid-123-456",
  })
  readonly sectorId!: string;

  @ApiProperty({
    description: "Nom du secteur supprimé",
    example: "Technologies de l'Information",
  })
  readonly sectorName!: string;

  @ApiPropertyOptional({
    description: "Indique si la suppression a été forcée",
    example: false,
  })
  readonly wasForced?: boolean;
}
