/**
 * 🔄 UPDATE APPOINTMENT STATUS USE CASE
 * ✅ Use case pour mettre à jour le statut d'un rendez-vous
 * ✅ Clean Architecture - Application Layer
 * ✅ Support tous les changements de statut : CONFIRMED → COMPLETED, REQUESTED → CANCELLED, etc.
 */

import {
  Appointment,
  AppointmentStatus,
} from "../../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/repositories/appointment.repository.interface";
import { AppointmentId } from "../../../domain/value-objects/appointment-id.value-object";
import { ApplicationValidationError } from "../../exceptions/application.exceptions";
import {
  AppointmentException,
  AppointmentNotFoundError,
} from "../../exceptions/appointment.exceptions";

export interface UpdateAppointmentStatusRequest {
  readonly appointmentId: string;
  readonly newStatus: AppointmentStatus;
  readonly reason?: string;
  readonly notes?: string;
  readonly requestingUserId: string;
  readonly correlationId: string;
}

export interface UpdateAppointmentStatusResponse {
  readonly appointment: Appointment;
  readonly previousStatus: AppointmentStatus;
  readonly newStatus: AppointmentStatus;
  readonly message: string;
  readonly notificationSent: boolean;
}

export class UpdateAppointmentStatusUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: UpdateAppointmentStatusRequest,
  ): Promise<UpdateAppointmentStatusResponse> {
    // 1. Validation des paramètres d'entrée
    this.validateRequest(request);

    // 2. Récupération de l'appointment
    const appointmentId = AppointmentId.create(request.appointmentId);
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new AppointmentNotFoundError(request.appointmentId);
    }

    // 3. Sauvegarde du statut précédent
    const previousStatus = appointment.getStatus();

    // 4. Validation de la transition de statut
    this.validateStatusTransition(previousStatus, request.newStatus);

    // 5. Mise à jour du statut selon le type
    let updatedAppointment: Appointment;

    switch (request.newStatus) {
      case AppointmentStatus.CONFIRMED:
        updatedAppointment = appointment.confirm();
        break;

      case AppointmentStatus.CANCELLED:
        updatedAppointment = appointment.cancel(request.reason);
        break;

      case AppointmentStatus.COMPLETED:
        updatedAppointment = appointment.complete(request.notes);
        break;

      case AppointmentStatus.NO_SHOW:
        updatedAppointment = appointment.markNoShow(request.reason);
        break;

      default:
        throw new AppointmentException(
          `Status transition to ${request.newStatus} not implemented`,
          "STATUS_TRANSITION_NOT_IMPLEMENTED",
        );
    }

    // 6. Sauvegarde
    await this.appointmentRepository.save(updatedAppointment);

    // 7. Envoi de notification (TODO: à implémenter)
    let notificationSent = false;
    try {
      // await this.notificationService.sendStatusChangeNotification(
      //   updatedAppointment,
      //   previousStatus,
      //   request.newStatus
      // );
      notificationSent = true;
    } catch (error) {
      console.warn("Failed to send status change notification:", error);
    }

    return {
      appointment: updatedAppointment,
      previousStatus,
      newStatus: request.newStatus,
      message: this.getStatusChangeMessage(previousStatus, request.newStatus),
      notificationSent,
    };
  }

  private validateRequest(request: UpdateAppointmentStatusRequest): void {
    if (!request.appointmentId) {
      throw new ApplicationValidationError(
        "validation",
        "required_field",
        "Appointment ID is required",
      );
    }

    if (!request.newStatus) {
      throw new ApplicationValidationError(
        "validation",
        "required_field",
        "New status is required",
      );
    }

    if (!request.requestingUserId) {
      throw new ApplicationValidationError(
        "validation",
        "required_field",
        "Requesting user ID is required",
      );
    }

    const validStatuses = Object.values(AppointmentStatus);
    if (!validStatuses.includes(request.newStatus)) {
      throw new ApplicationValidationError(
        "validation",
        "invalid_value",
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
    }
  }

  private validateStatusTransition(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ): void {
    // Règles de transition de statut
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.REQUESTED]: [
        AppointmentStatus.CONFIRMED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.CONFIRMED]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
        AppointmentStatus.NO_SHOW,
        AppointmentStatus.IN_PROGRESS,
      ],
      [AppointmentStatus.IN_PROGRESS]: [
        AppointmentStatus.COMPLETED,
        AppointmentStatus.CANCELLED,
      ],
      [AppointmentStatus.CANCELLED]: [], // Statut final
      [AppointmentStatus.COMPLETED]: [], // Statut final
      [AppointmentStatus.NO_SHOW]: [AppointmentStatus.COMPLETED], // Peut être corrigé
    };

    if (currentStatus === newStatus) {
      throw new AppointmentException(
        `Appointment is already in status ${newStatus}`,
        "STATUS_ALREADY_SET",
      );
    }

    const allowedTransitions = validTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new AppointmentException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
        "INVALID_STATUS_TRANSITION",
      );
    }
  }

  private getStatusChangeMessage(
    previousStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ): string {
    const messages: Record<string, string> = {
      [`${AppointmentStatus.REQUESTED}-${AppointmentStatus.CONFIRMED}`]:
        "Appointment confirmed successfully",
      [`${AppointmentStatus.REQUESTED}-${AppointmentStatus.CANCELLED}`]:
        "Appointment cancelled",
      [`${AppointmentStatus.CONFIRMED}-${AppointmentStatus.COMPLETED}`]:
        "Appointment marked as completed",
      [`${AppointmentStatus.CONFIRMED}-${AppointmentStatus.CANCELLED}`]:
        "Confirmed appointment cancelled",
      [`${AppointmentStatus.CONFIRMED}-${AppointmentStatus.NO_SHOW}`]:
        "Appointment marked as no-show",
      [`${AppointmentStatus.NO_SHOW}-${AppointmentStatus.COMPLETED}`]:
        "No-show appointment corrected to completed",
    };

    const key = `${previousStatus}-${newStatus}`;
    return (
      messages[key] || `Status updated from ${previousStatus} to ${newStatus}`
    );
  }
}
