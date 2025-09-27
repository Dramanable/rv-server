import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { RoleBasedGuard } from '../security/guards/role-based.guard';
import { RequirePractitioner } from '../security/decorators/roles.decorator';
import { GetUser } from '../security/decorators/get-user.decorator';
import { User } from '../../domain/entities/user.entity';
import { TOKENS } from '../../shared/constants/injection-tokens';
import { SetPractitionerAvailabilityUseCase } from '../../application/use-cases/practitioners/set-practitioner-availability.use-case';
import {
  SetPractitionerAvailabilityDto,
  SetPractitionerAvailabilityResponseDto,
} from '../dtos/practitioners/set-practitioner-availability.dto';

/**
 * 👨‍⚕️ Practitioner Management Controller
 *
 * Gestion des praticiens et de leurs disponibilités dans le système.
 *
 * Fonctionnalités :
 * - ✅ Définition des disponibilités praticiens
 * - 🔄 Gestion des conflits horaires
 * - 📊 Validation des créneaux
 * - 🔐 Permissions granulaires par contexte business
 */
@ApiTags('👨‍⚕️ Practitioner Management')
@Controller('api/v1/practitioners')
@UseGuards(RoleBasedGuard)
@ApiBearerAuth()
export class PractitionerController {
  constructor(
    @Inject(TOKENS.SET_PRACTITIONER_AVAILABILITY_USE_CASE)
    private readonly setPractitionerAvailabilityUseCase: SetPractitionerAvailabilityUseCase,
  ) {}

  /**
   * 📅 Définir les disponibilités d'un praticien
   *
   * Permet à un praticien ou manager de configurer les créneaux de disponibilité
   * avec validation automatique des conflits et règles métier.
   */
  @Post('availability')
  @RequirePractitioner()
  @ApiOperation({
    summary: '📅 Set Practitioner Availability',
    description: `
      **Configure les disponibilités d'un praticien** avec validation complète.

      ## 🎯 Fonctionnalités

      ### ✅ **Validation métier**
      - **Conflits détectés** : Chevauchements avec rendez-vous existants
      - **Règles horaires** : Heures de travail valides, pauses cohérentes
      - **Permissions** : Seuls les praticiens/managers autorisés

      ### 📊 **Types de disponibilités**
      - **Récurrente** : Créneaux répétés (ex: lundi-vendredi 9h-17h)
      - **Ponctuelle** : Dates spécifiques (ex: congés, formation)
      - **Exceptions** : Modifications ponctuelles des récurrences

      ### 🔐 **Sécurité & Permissions**
      - **JWT** : Token Bearer obligatoire
      - **RBAC** : Permissions \`MANAGE_PRACTITIONER_AVAILABILITY\`
      - **Context** : Scoped par business et rôle utilisateur

      ## 📋 **Exemple d'utilisation**

      \`\`\`typescript
      const availability = {
        practitionerId: "uuid-of-practitioner",
        businessId: "uuid-of-business",
        availabilityData: {
          type: "RECURRING",
          recurring: {
            daysOfWeek: [1, 2, 3, 4, 5], // Lundi à Vendredi
            startTime: "09:00",
            endTime: "17:00",
            breakPeriods: [{
              startTime: "12:00",
              endTime: "13:00",
              name: "Pause déjeuner"
            }]
          }
        },
        effectiveFrom: "2024-01-01T00:00:00Z",
        effectiveTo: "2024-12-31T23:59:59Z"
      };

      await practitionerAPI.setAvailability(availability);
      \`\`\`

      ## ⚠️ **Règles métier**
      - **Non-rétroactif** : Pas de modification du passé
      - **Conflits** : Détection automatique avec rendez-vous
      - **Notifications** : Clients prévenus des changements
      - **Audit** : Toutes modifications tracées
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ Availability set successfully',
    type: SetPractitionerAvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid availability data or business rules violation',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        error: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'AVAILABILITY_CONFLICT' },
            message: {
              type: 'string',
              example: 'Conflict detected with existing appointments',
            },
            field: { type: 'string', example: 'availabilityData' },
            timestamp: { type: 'string', example: '2024-01-15T10:30:00Z' },
            correlationId: { type: 'string', example: 'uuid-correlation-id' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      '🚫 Insufficient permissions to manage practitioner availability',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: '❓ Practitioner or business not found',
  })
  async setAvailability(
    @Body() dto: SetPractitionerAvailabilityDto,
    @GetUser() user: User,
  ): Promise<SetPractitionerAvailabilityResponseDto> {
    const request = {
      practitionerId: dto.practitionerId,
      businessId: dto.businessId,
      availability: {
        startDate: dto.availability.startDate,
        endDate: dto.availability.endDate,
        availabilities: dto.availability.availabilities,
        exceptions: dto.availability.exceptions || [],
      },
      effectiveDate: dto.effectiveDate,
      notifyClients: dto.notifyClients,
      autoRescheduleConflicts: dto.autoRescheduleConflicts,
      requestingUserId: user.id,
      correlationId: dto.correlationId,
      timestamp: dto.timestamp,
    };

    const result =
      await this.setPractitionerAvailabilityUseCase.execute(request);

    return {
      success: result.success,
      practitionerId: result.practitionerId,
      availableSlots: result.availableSlots,
      conflictsDetected: result.conflictsDetected,
      conflictsResolved: result.conflictsResolved,
      conflictingAppointments: result.conflictingAppointments?.map(
        (appointment) => ({
          appointmentId: appointment.appointmentId,
          clientId: appointment.clientId,
          status: appointment.status as
            | 'RESCHEDULED'
            | 'REQUIRES_MANUAL_INTERVENTION',
          newScheduledTime: appointment.newScheduledTime,
        }),
      ),
      notificationsSent: result.notificationsSent,
      message: 'Availability updated successfully',
    };
  }
}
