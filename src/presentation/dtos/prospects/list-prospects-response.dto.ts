import { ApiProperty } from "@nestjs/swagger";
import { ProspectResponseDto } from "./prospect-response.dto";

/**
 * 🎯 ListProspectsResponseDto - DTO de réponse pour la liste paginée des prospects
 *
 * Contient les données des prospects et les métadonnées de pagination
 * pour une navigation efficace dans les résultats.
 */
export class ListProspectsResponseDto {
  @ApiProperty({
    description: "Liste des prospects",
    type: [ProspectResponseDto],
  })
  readonly data!: ProspectResponseDto[];

  @ApiProperty({
    description: "Métadonnées de pagination",
    example: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 47,
      itemsPerPage: 10,
      hasNextPage: true,
      hasPrevPage: false,
    },
  })
  readonly meta!: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };

  @ApiProperty({
    description: "Indicateur de succès",
    example: true,
  })
  readonly success!: boolean;
}
