/**
 * 🏥 PRACTITIONER AVAILABILITY MANAGEMENT USE CASE - APPLICATION LAYER
 *
 * Version GREEN simplifiée pour TDD - Phase GREEN
 */

import { IPermissionService } from '@application/ports/permission.service.interface';
import { Logger } from '@application/ports/logger.port';
import { I18nService } from '@application/ports/i18n.port';
import { StaffRepository } from '@domain/repositories/staff.repository.interface';
import { IRoleAssignmentRepository } from '@domain/repositories/role-assignment.repository.interface';
import { AppointmentRepository } from '@domain/repositories/appointment.repository.interface';
import { Permission, UserRole } from '@shared/enums/user-role.enum';
import { InsufficientPermissionsError } from '@application/exceptions/application.exceptions';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { Appointment } from '@domain/entities/appointment.entity';

// === USE CASE INTERFACES ===

export interface TimeSlot {
  readonly startTime: string; // HH:MM format
  readonly endTime: string; // HH:MM format
}

export interface BreakPeriod {
  readonly startTime: string; // HH:MM format
  readonly endTime: string; // HH:MM format
  readonly reason?: string;
}

export interface DayAvailability {
  readonly dayOfWeek: number; // 0-6 (0 = Dimanche)
  readonly isAvailable: boolean;
  readonly timeSlots: TimeSlot[];
  readonly breakPeriods: BreakPeriod[];
}

export interface AvailabilityPeriod {
  readonly startDate: Date;
  readonly endDate: Date;
  readonly availabilities: DayAvailability[];
  readonly exceptions: Array<{
    readonly date: Date;
    readonly isAvailable: boolean;
    readonly reason: string;
    readonly timeSlots?: TimeSlot[];
  }>;
}

export interface SetPractitionerAvailabilityRequest {
  readonly requestingUserId: string;
  readonly practitionerId: string;
  readonly businessId: string;
  readonly availability: AvailabilityPeriod;
  readonly effectiveDate: Date;
  readonly notifyClients: boolean;
  readonly autoRescheduleConflicts: boolean;
  readonly locationId?: string;
  readonly departmentId?: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface ConflictingAppointment {
  readonly appointmentId: string;
  readonly clientId: string;
  readonly scheduledTime: Date;
  readonly reason: string;
  readonly status:
    | 'REQUIRES_MANUAL_INTERVENTION'
    | 'RESCHEDULED'
    | 'AUTO_CANCELLED';
  readonly newScheduledTime?: Date;
}

export interface NotificationResult {
  readonly type: 'CLIENT_NOTIFIED' | 'STAFF_NOTIFIED' | 'ADMIN_NOTIFIED';
  readonly recipientId: string;
  readonly message: string;
  readonly sentAt: Date;
}

export interface SetPractitionerAvailabilityResponse {
  readonly practitionerId: string;
  readonly availability: AvailabilityPeriod;
  readonly conflictingAppointments: ConflictingAppointment[];
  readonly notificationsSent: NotificationResult[];
  readonly updatedAt: Date;
}

// === USE CASE IMPLEMENTATION - GREEN PHASE (MINIMAL) ===

export class SetPractitionerAvailabilityUseCase {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly roleAssignmentRepository: IRoleAssignmentRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly permissionService: IPermissionService,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    request: SetPractitionerAvailabilityRequest,
  ): Promise<SetPractitionerAvailabilityResponse> {
    this.logger.info('Setting practitioner availability', {
      requestingUserId: request.requestingUserId,
      practitionerId: request.practitionerId,
      businessId: request.businessId,
      effectiveDate: request.effectiveDate.toISOString(),
      correlationId: request.correlationId,
    });

    try {
      // 🔐 VÉRIFICATION DES PERMISSIONS
      await this.validatePermissions(request);

      // 🏥 VÉRIFICATION DU PRACTITIONER
      const practitioner = await this.validatePractitioner(request);

      // ⏰ VALIDATION DES DISPONIBILITÉS
      this.validateAvailabilityData(request.availability);

      // 🚨 DÉTECTION DES CONFLITS
      const conflictingAppointments =
        await this.detectConflictingAppointments(request);

      // 🔄 GESTION DES CONFLITS
      const resolvedConflicts = await this.resolveConflicts(
        conflictingAppointments,
        request,
      );

      // 💾 SAUVEGARDER LES DISPONIBILITÉS
      await this.saveAvailability(request, practitioner);

      // 📧 NOTIFICATIONS
      const notificationsSent = await this.sendNotifications(
        request,
        resolvedConflicts,
      );

      this.logger.info('Practitioner availability set successfully', {
        practitionerId: request.practitionerId,
        conflictsResolved: resolvedConflicts.length,
        notificationsSent: notificationsSent.length,
        correlationId: request.correlationId,
      });

      return {
        practitionerId: request.practitionerId,
        availability: request.availability,
        conflictingAppointments: resolvedConflicts,
        notificationsSent,
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to set practitioner availability',
        error as Error,
        {
          requestingUserId: request.requestingUserId,
          practitionerId: request.practitionerId,
          correlationId: request.correlationId,
        },
      );
      throw error;
    }
  }

  // === MÉTHODES PRIVÉES - GREEN PHASE (MINIMAL) ===

  private async validatePermissions(
    request: SetPractitionerAvailabilityRequest,
  ): Promise<void> {
    // Si c'est le même utilisateur, il doit avoir la permission de gérer ses propres disponibilités
    if (request.requestingUserId === request.practitionerId) {
      await this.permissionService.requirePermission(
        request.requestingUserId,
        Permission.SET_OWN_AVAILABILITY,
        {
          businessId: request.businessId,
          correlationId: request.correlationId,
        },
      );
      return;
    }

    // Sinon, vérifier les rôles
    const requestingUserRoles =
      await this.roleAssignmentRepository.findByUserId(
        request.requestingUserId,
      );

    const targetUserRoles = await this.roleAssignmentRepository.findByUserId(
      request.practitionerId,
    );

    // Vérifications de base pour les tests
    if (!requestingUserRoles || requestingUserRoles.length === 0) {
      throw new Error('Requesting user has no roles');
    }

    if (!targetUserRoles || targetUserRoles.length === 0) {
      throw new InsufficientPermissionsError(
        this.i18n.translate('availability.targetMustBePractitioner'),
        'TARGET_MUST_BE_PRACTITIONER',
      );
    }

    // Vérifier que l'utilisateur demandeur a un rôle senior
    const hasSeniorRole = requestingUserRoles.some((assignment) =>
      [
        UserRole.SENIOR_PRACTITIONER,
        UserRole.DEPARTMENT_HEAD,
        UserRole.SUPER_ADMIN,
      ].includes(assignment.getRole()),
    );

    const targetIsPractitioner = targetUserRoles.some((assignment) =>
      [
        UserRole.SENIOR_PRACTITIONER,
        UserRole.PRACTITIONER,
        UserRole.JUNIOR_PRACTITIONER,
      ].includes(assignment.getRole()),
    );

    if (!hasSeniorRole) {
      throw new InsufficientPermissionsError(
        this.i18n.translate('permissions.cannotManageOtherPractitioners'),
        'CANNOT_MANAGE_OTHER_PRACTITIONERS',
      );
    }

    if (!targetIsPractitioner) {
      throw new Error(
        this.i18n.translate('availability.targetMustBePractitioner'),
      );
    }
  }

  private async validatePractitioner(
    request: SetPractitionerAvailabilityRequest,
  ) {
    const practitionerUserId = new UserId(request.practitionerId);

    const practitioner =
      await this.staffRepository.findById(practitionerUserId);

    if (!practitioner) {
      throw new Error(
        this.i18n.translate('staff.practitionerNotFound', {
          id: request.practitionerId,
        }),
      );
    }

    if (!practitioner.isActive()) {
      throw new Error(
        this.i18n.translate('staff.practitionerNotActive', {
          id: request.practitionerId,
        }),
      );
    }

    // Vérifier que l'utilisateur est vraiment un praticien
    const roleAssignments = await this.roleAssignmentRepository.findByUserId(
      request.practitionerId,
    );

    if (!roleAssignments || roleAssignments.length === 0) {
      throw new Error(
        this.i18n.translate('staff.notAPractitioner', {
          id: request.practitionerId,
        }),
      );
    }

    const isPractitioner = roleAssignments.some((assignment) =>
      [
        UserRole.SENIOR_PRACTITIONER,
        UserRole.PRACTITIONER,
        UserRole.JUNIOR_PRACTITIONER,
      ].includes(assignment.getRole()),
    );

    if (!isPractitioner) {
      throw new Error(
        this.i18n.translate('staff.notAPractitioner', {
          id: request.practitionerId,
        }),
      );
    }

    return practitioner;
  }

  private validateAvailabilityData(availability: AvailabilityPeriod): void {
    // 1. Validation des dates
    if (availability.startDate >= availability.endDate) {
      throw new Error(this.i18n.translate('availability.invalidDateRange'));
    }

    // 2. Validation des disponibilités par jour
    availability.availabilities.forEach((dayAvail, index) => {
      // 3. Validation des créneaux horaires
      dayAvail.timeSlots.forEach((slot) => {
        if (slot.startTime >= slot.endTime) {
          throw new Error(
            this.i18n.translate('availability.invalidTimeSlot', {
              day: index,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }),
          );
        }
      });

      // 4. Validation des pauses (doivent être dans les créneaux de travail)
      dayAvail.breakPeriods.forEach((breakPeriod) => {
        const isBreakInWorkingHours = dayAvail.timeSlots.some((slot) => {
          return (
            breakPeriod.startTime >= slot.startTime &&
            breakPeriod.endTime <= slot.endTime
          );
        });

        if (!isBreakInWorkingHours) {
          throw new Error(
            this.i18n.translate('availability.breakOutsideWorkingHours', {
              day: index,
              breakStart: breakPeriod.startTime,
              breakEnd: breakPeriod.endTime,
            }),
          );
        }
      });
    });
  }

  private async detectConflictingAppointments(
    request: SetPractitionerAvailabilityRequest,
  ): Promise<ConflictingAppointment[]> {
    // Récupérer les rendez-vous existants du praticien (utiliser findByStaffId existante)
    const existingAppointments = await this.appointmentRepository.findByStaffId(
      new UserId(request.practitionerId),
      {
        startDate: request.availability.startDate,
        endDate: request.availability.endDate || new Date('2099-12-31'),
      },
    );

    const conflicts: ConflictingAppointment[] = [];

    existingAppointments.forEach((appointment: Appointment) => {
      const appointmentDate = appointment.getScheduledAt();
      const dayOfWeek = appointmentDate.getDay();

      // Trouver la disponibilité pour ce jour
      const dayAvailability = request.availability.availabilities.find(
        (avail) => avail.dayOfWeek === dayOfWeek,
      );

      if (!dayAvailability?.isAvailable) {
        conflicts.push({
          appointmentId: appointment.getId().getValue(),
          clientId: appointment.getClientInfo().email.getValue(),
          scheduledTime: appointmentDate,
          reason: 'Practitioner not available on this day',
          status: 'REQUIRES_MANUAL_INTERVENTION',
        });
        return;
      }

      // Vérifier si l'heure du RDV est dans les créneaux disponibles
      const appointmentTime = appointmentDate.toTimeString().substring(0, 5);
      const isInAvailableSlot = dayAvailability.timeSlots.some(
        (slot) =>
          appointmentTime >= slot.startTime && appointmentTime <= slot.endTime,
      );

      const isDuringBreak = dayAvailability.breakPeriods.some(
        (breakPeriod) =>
          appointmentTime >= breakPeriod.startTime &&
          appointmentTime <= breakPeriod.endTime,
      );

      if (!isInAvailableSlot || isDuringBreak) {
        conflicts.push({
          appointmentId: appointment.getId().getValue(),
          clientId: appointment.getClientInfo().email.getValue(),
          scheduledTime: appointmentDate,
          reason: isDuringBreak
            ? 'Appointment during break period'
            : 'Appointment outside available time slots',
          status: 'REQUIRES_MANUAL_INTERVENTION',
        });
      }
    });

    return conflicts;
  }

  private async resolveConflicts(
    conflicts: ConflictingAppointment[],
    request: SetPractitionerAvailabilityRequest,
  ): Promise<ConflictingAppointment[]> {
    const resolvedConflicts: ConflictingAppointment[] = [];

    for (const conflict of conflicts) {
      if (request.autoRescheduleConflicts) {
        // Tentative de reprogrammation automatique
        const newSlot = await this.findAlternativeSlot(
          request.practitionerId,
          conflict.scheduledTime,
          request.availability,
        );

        if (newSlot) {
          resolvedConflicts.push({
            ...conflict,
            status: 'RESCHEDULED',
            newScheduledTime: newSlot,
          });
        } else {
          resolvedConflicts.push({
            ...conflict,
            status: 'REQUIRES_MANUAL_INTERVENTION',
          });
        }
      } else {
        // Marquer pour intervention manuelle
        resolvedConflicts.push({
          ...conflict,
          status: 'REQUIRES_MANUAL_INTERVENTION',
        });
      }
    }

    return resolvedConflicts;
  }

  private async findAlternativeSlot(
    practitionerId: string,
    originalTime: Date,
    availability: AvailabilityPeriod,
  ): Promise<Date | null> {
    // Rechercher un créneau alternatif dans la même semaine
    const startOfWeek = new Date(originalTime);
    startOfWeek.setDate(originalTime.getDate() - originalTime.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Chercher les créneaux disponibles
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(startOfWeek);
      checkDate.setDate(startOfWeek.getDate() + i);

      const dayAvailability = availability.availabilities.find(
        (avail) => avail.dayOfWeek === checkDate.getDay(),
      );

      if (dayAvailability?.isAvailable) {
        for (const timeSlot of dayAvailability.timeSlots) {
          const proposedDateTime = new Date(checkDate);
          const [hours, minutes] = timeSlot.startTime.split(':');
          proposedDateTime.setHours(
            parseInt(hours, 10),
            parseInt(minutes, 10),
            0,
            0,
          );

          // Vérifier si ce créneau est libre
          const hasConflict = await this.appointmentRepository.search({
            startDate: proposedDateTime,
            endDate: new Date(proposedDateTime.getTime() + 60 * 60 * 1000), // +1 heure
            staffId: new UserId(practitionerId),
          });

          if (hasConflict.appointments.length === 0) {
            return proposedDateTime;
          }
        }
      }
    }

    return null; // Aucun créneau alternatif trouvé
  }

  private async saveAvailability(
    request: SetPractitionerAvailabilityRequest,
    practitioner: any,
  ): Promise<void> {
    // TODO: Implémenter la sauvegarde des disponibilités
    // Pour maintenant, on log juste l'action
    this.logger.info('Availability data would be saved here', {
      practitionerId: request.practitionerId,
      availability: request.availability,
      correlationId: request.correlationId,
    });
  }

  private async sendNotifications(
    request: SetPractitionerAvailabilityRequest,
    conflicts: ConflictingAppointment[],
  ): Promise<NotificationResult[]> {
    const notifications: NotificationResult[] = [];

    if (request.notifyClients && conflicts.length > 0) {
      // TODO: Implémenter les notifications clients
      this.logger.info('Would send notifications to affected clients', {
        conflictCount: conflicts.length,
        correlationId: request.correlationId,
      });
    }

    return notifications;
  }
}
