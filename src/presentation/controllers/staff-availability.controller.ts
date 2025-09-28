import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetUser } from '@presentation/security/decorators/get-user.decorator';
import { TOKENS } from '@shared/constants/injection-tokens';
import { RoleBasedGuard } from '../security/guards/role-based.guard';

// Use Cases
import { GetAvailableStaffUseCase } from '@application/use-cases/staff/get-available-staff.use-case';
import { GetStaffAvailabilityUseCase } from '@application/use-cases/staff/get-staff-availability.use-case';
import { SetStaffAvailabilityUseCase } from '@application/use-cases/staff/set-staff-availability.use-case';

// DTOs
import { AvailableStaffListResponseDto } from '@presentation/dtos/staff/available-staff-list-response.dto';
import { GetAvailableStaffDto } from '@presentation/dtos/staff/get-available-staff.dto';
import { SetStaffAvailabilityDto } from '@presentation/dtos/staff/set-staff-availability.dto';
import { StaffAvailabilityResponseDto } from '@presentation/dtos/staff/staff-availability-response.dto';

// Domain Types
import { User } from '@domain/entities/user.entity';

/**
 * 📅 Staff Availability Controller
 *
 * Gère les disponibilités du personnel selon les règles métier strictes :
 * - Définition des créneaux disponibles par staff
 * - Consultation des disponibilités individuelles
 * - Recherche de staff disponible selon critères
 * - Respect des WorkingHours et contraintes métier
 */
@ApiTags('👨‍💼 Staff Availability Management')
@Controller('staff/availability')
@ApiBearerAuth()
@UseGuards(RoleBasedGuard)
export class StaffAvailabilityController {
  constructor(
    @Inject(TOKENS.SET_STAFF_AVAILABILITY_USE_CASE)
    private readonly setStaffAvailabilityUseCase: SetStaffAvailabilityUseCase,

    @Inject(TOKENS.GET_STAFF_AVAILABILITY_USE_CASE)
    private readonly getStaffAvailabilityUseCase: GetStaffAvailabilityUseCase,

    @Inject(TOKENS.GET_AVAILABLE_STAFF_USE_CASE)
    private readonly getAvailableStaffUseCase: GetAvailableStaffUseCase,
  ) {}

  /**
   * 🔧 Définir la disponibilité d'un membre du staff
   */
  @Post(':staffId/set')
  @ApiOperation({
    summary: '🔧 Set Staff Member Availability',
    description: `
      **Définir les créneaux de disponibilité** d'un membre du personnel.

      ## 🎯 Fonctionnalités

      ### 📅 **Types de disponibilité supportés**
      - **Créneaux récurrents** : Horaires hebdomadaires réguliers
      - **Dates spécifiques** : Disponibilités ponctuelles
      - **Exceptions** : Congés, absences, indisponibilités
      - **Périodes bloquées** : Formations, réunions

      ### ⚙️ **WorkingHours Structure**
      \`\`\`json
      {
        "weeklySchedule": {
          "1": {
            "isOpen": true,
            "timeSlots": [
              {"startTime": "09:00", "endTime": "12:00"},
              {"startTime": "14:00", "endTime": "18:00"}
            ]
          }
        },
        "specialDates": [
          {
            "date": "2024-01-15",
            "isOpen": false,
            "reason": "Formation"
          }
        ],
        "timezone": "Europe/Paris"
      }
      \`\`\`

      ### 🔐 **Permissions requises**
      - **MANAGE_STAFF** : Gestionnaires d'équipe
      - **MANAGE_OWN_AVAILABILITY** : Staff peut gérer sa propre disponibilité
      - **ADMIN** : Accès complet

      ### 📋 **Règles métier**
      - ✅ Créneaux ne peuvent pas se chevaucher
      - ✅ Respect des limites business (horaires entreprise)
      - ✅ Validation timezone
      - ✅ Audit trail complet (who, when, what)
    `,
  })
  @ApiParam({
    name: 'staffId',
    description: 'UUID du membre du staff',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Staff availability set successfully',
    type: StaffAvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid availability data or overlapping slots',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      '🚫 Insufficient permissions to manage this staff availability',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '👤 Staff member not found',
  })
  async setStaffAvailability(
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @Body() dto: SetStaffAvailabilityDto,
    @GetUser() user: User,
  ): Promise<StaffAvailabilityResponseDto> {
    const result = await this.setStaffAvailabilityUseCase.execute({
      staffId,
      workingHours: dto.workingHours,
      requestingUserId: user.id,
      correlationId: dto.correlationId,
    });

    return StaffAvailabilityResponseDto.fromDomain(result);
  }

  /**
   * 📋 Récupérer la disponibilité d'un membre du staff
   */
  @Get(':staffId')
  @ApiOperation({
    summary: '📋 Get Staff Member Availability',
    description: `
      **Récupérer les créneaux de disponibilité** d'un membre du personnel.

      ## 🎯 Fonctionnalités

      ### 📊 **Informations retournées**
      - **WorkingHours complets** : Créneaux hebdomadaires et exceptions
      - **Métadonnées** : Dernière modification, timezone, règles
      - **État actuel** : Disponible maintenant, prochaine disponibilité
      - **Statistiques** : Heures totales par semaine

      ### 🔍 **Cas d'usage**
      - **Frontend** : Affichage calendrier personnel
      - **Planning** : Optimisation répartition des tâches
      - **Reporting** : Analyse des disponibilités équipe
      - **Intégration** : Sync avec calendriers externes

      ### 🔐 **Visibilité selon rôles**
      - **Staff** : Peut voir sa propre disponibilité
      - **Manager** : Peut voir toute son équipe
      - **Admin** : Visibilité complète entreprise
    `,
  })
  @ApiParam({
    name: 'staffId',
    description: 'UUID du membre du staff',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Staff availability retrieved successfully',
    type: StaffAvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions to view this staff availability',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '👤 Staff member not found',
  })
  async getStaffAvailability(
    @Param('staffId', ParseUUIDPipe) staffId: string,
    @GetUser() user: User,
  ): Promise<StaffAvailabilityResponseDto> {
    const result = await this.getStaffAvailabilityUseCase.execute({
      staffId,
      requestingUserId: user.id,
    });

    return StaffAvailabilityResponseDto.fromDomain(result);
  }

  /**
   * 🔍 Rechercher le staff disponible selon critères
   */
  @Post('search')
  @ApiOperation({
    summary: '🔍 Search Available Staff with Filters',
    description: `
      **Recherche avancée du personnel disponible** selon critères métier.

      ## 🎯 Fonctionnalités

      ### 🎛️ **Filtres de recherche**
      - **Période** : Date/heure début et fin
      - **Compétences** : Skills requis pour le service
      - **Localisation** : Proximité géographique
      - **Rôle** : Type de professionnel recherché
      - **Charge de travail** : Capacité résiduelle

      ### 📊 **Algorithme de matching**
      1. **Disponibilité temporelle** : Créneaux libres dans la période
      2. **Compétences métier** : Match avec services demandés
      3. **Capacité** : Vérification charge de travail
      4. **Préférences** : Priorité selon historique performance

      ### 🎯 **Résultat optimisé**
      - **Tri intelligent** : Meilleur match en premier
      - **Score de compatibilité** : Indicateur de pertinence
      - **Alternatives** : Suggestions proches si pas de match parfait
      - **Métadonnées** : Prochaine disponibilité, charge actuelle

      ### 📋 **Cas d'usage**
      - **Prise de RDV** : Proposer créneaux optimaux
      - **Planification** : Répartition optimale des tâches
      - **Substitution** : Remplacement en cas d'urgence
      - **Reporting** : Analyse de la capacité équipe

      ### 🔄 **Performance et cache**
      - **Cache Redis** : Résultats fréquents mis en cache
      - **Index optimisés** : Requêtes rapides sur gros volumes
      - **Pagination** : Gestion efficace de nombreux résultats
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Available staff found successfully',
    type: AvailableStaffListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid search criteria',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions to search staff',
  })
  async searchAvailableStaff(
    @Body() dto: GetAvailableStaffDto,
    @GetUser() user: User,
  ): Promise<AvailableStaffListResponseDto> {
    const startDate = new Date(dto.startTime);
    const endDate = new Date(dto.endTime);
    const durationMinutes = Math.round(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60),
    );

    const result = await this.getAvailableStaffUseCase.execute({
      businessId: dto.businessId,
      dateTime: startDate,
      durationMinutes: durationMinutes,
      serviceId: dto.serviceType, // Mapping serviceType -> serviceId
      requestingUserId: user.id,
      correlationId: dto.correlationId,
    });

    return AvailableStaffListResponseDto.fromDomain(result);
  }
}
