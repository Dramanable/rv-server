import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * 🎯 ProspectResponseDto - DTO de réponse pour un prospect
 *
 * Structure de données renvoyée par l'API pour représenter
 * un prospect avec tous ses détails.
 */
export class ProspectResponseDto {
  @ApiProperty({
    description: "Identifiant unique du prospect",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  readonly id!: string;

  @ApiProperty({
    description: "Nom de l'entreprise prospect",
    example: "TechCorp Solutions",
  })
  readonly businessName!: string;

  @ApiProperty({
    description: "Nom du contact principal",
    example: "Jean Dupont",
  })
  readonly contactName!: string;

  @ApiProperty({
    description: "Adresse email du contact",
    example: "jean.dupont@techcorp.com",
  })
  readonly email!: string;

  @ApiPropertyOptional({
    description: "Numéro de téléphone",
    example: "+33 1 23 45 67 89",
  })
  readonly phone?: string;

  @ApiPropertyOptional({
    description: "Description de l'entreprise",
    example: "Entreprise spécialisée dans les solutions IT pour PME",
  })
  readonly description?: string;

  @ApiProperty({
    description: "Taille de l'entreprise",
    enum: ["SMALL", "MEDIUM", "LARGE", "ENTERPRISE"],
    example: "MEDIUM",
  })
  readonly businessSize!: string;

  @ApiProperty({
    description: "Nombre estimé d'employés",
    example: 25,
  })
  readonly estimatedStaffCount!: number;

  @ApiProperty({
    description: "Valeur estimée du deal",
    example: 5000.0,
  })
  readonly estimatedValue!: number;

  @ApiProperty({
    description: "Devise pour la valeur estimée",
    example: "EUR",
  })
  readonly estimatedValueCurrency!: string;

  @ApiProperty({
    description: "Statut du prospect",
    enum: [
      "LEAD",
      "CONTACTED",
      "QUALIFIED",
      "PROPOSAL",
      "NEGOTIATION",
      "CLOSED_WON",
      "CLOSED_LOST",
    ],
    example: "QUALIFIED",
  })
  readonly status!: string;

  @ApiPropertyOptional({
    description: "Source d'acquisition",
    example: "WEBSITE",
  })
  readonly source?: string;

  @ApiPropertyOptional({
    description: "ID du commercial assigné",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  readonly assignedSalesRep?: string;

  @ApiPropertyOptional({
    description: "Date du dernier contact",
    example: "2024-01-15T10:30:00Z",
  })
  readonly lastContactDate?: string;

  @ApiPropertyOptional({
    description: "Notes sur le prospect",
    example: "Client potentiel très intéressé par nos solutions RubbyView",
  })
  readonly notes?: string;

  @ApiPropertyOptional({
    description: "Configuration de tarification proposée",
    example: {
      type: "MONTHLY_SUBSCRIPTION",
      basePrice: { amount: 29, currency: "EUR" },
      perUserPrice: { amount: 15, currency: "EUR" },
    },
    type: "object",
    additionalProperties: true,
  })
  readonly pricingProposal?: any;

  @ApiPropertyOptional({
    description: "Prix mensuel proposé",
    example: 750.0,
  })
  readonly proposedMonthlyPrice?: number;

  @ApiPropertyOptional({
    description: "Devise pour le prix proposé",
    example: "EUR",
  })
  readonly proposedCurrency?: string;

  @ApiPropertyOptional({
    description: "Date de closing espérée",
    example: "2024-03-15T00:00:00Z",
  })
  readonly expectedClosingDate?: string;

  @ApiProperty({
    description: "Score de priorité (0-100)",
    example: 75,
  })
  readonly priorityScore!: number;

  @ApiProperty({
    description: "Nombre d'interactions avec ce prospect",
    example: 5,
  })
  readonly interactionCount!: number;

  @ApiPropertyOptional({
    description: "Date du premier contact",
    example: "2024-01-10T14:20:00Z",
  })
  readonly firstContactDate?: string;

  @ApiPropertyOptional({
    description: "Tags associés au prospect",
    example: ["ENTERPRISE", "HIGH_VALUE", "URGENT"],
    type: "array",
    items: { type: "string" },
  })
  readonly tags?: string[];

  @ApiPropertyOptional({
    description: "Champs personnalisés",
    example: {
      industrie: "IT",
      tailleEquipe: "25-50",
      budget: "5000-10000",
    },
    type: "object",
    additionalProperties: true,
  })
  readonly customFields?: any;

  // 📊 MÉTADONNÉES
  @ApiProperty({
    description: "ID de l'utilisateur qui a créé ce prospect",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  readonly createdBy!: string;

  @ApiProperty({
    description: "ID de l'utilisateur qui a modifié ce prospect en dernier",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  readonly updatedBy!: string;

  @ApiProperty({
    description: "Date de création",
    example: "2024-01-10T14:20:00Z",
  })
  readonly createdAt!: string;

  @ApiProperty({
    description: "Date de dernière modification",
    example: "2024-01-15T16:45:00Z",
  })
  readonly updatedAt!: string;

  @ApiPropertyOptional({
    description: "Date de suppression (soft delete)",
    example: "2024-02-01T09:30:00Z",
  })
  readonly deletedAt?: string;

  @ApiPropertyOptional({
    description: "ID de l'utilisateur qui a supprimé ce prospect",
    example: "550e8400-e29b-41d4-a716-446655440003",
  })
  readonly deletedBy?: string;

  @ApiPropertyOptional({
    description: "Raison de la suppression",
    example: "Prospect converti en client",
  })
  readonly deletionReason?: string;
}
