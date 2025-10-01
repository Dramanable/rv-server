/**
 * ✅ CONFIRM APPOINTMENT USE CASE - CLEAN ARCHITECTURE
 * ✅ Use case pour confirmer un rendez-vous en attente
 * ✅ Clean Architecture - Application Layer
 */

import { Appointment } from "../../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/repositories/appointment.repository.interface";
import { AppointmentId } from "../../../domain/value-objects/appointment-id.value-object";
import { ApplicationValidationError } from "../../exceptions/application.exceptions";

// ===== REQUEST & RESPONSE =====

export interface ConfirmAppointmentRequest {
  readonly appointmentId: string;
  readonly requestingUserId: string;
  readonly confirmationMethod: "EMAIL" | "PHONE" | "SMS" | "IN_PERSON";
  readonly notes?: string;
}

export interface ConfirmAppointmentResponse {
  readonly appointment: Appointment;
  readonly message: string;
  readonly confirmationSent: boolean;
}

// ===== USE CASE =====

export class ConfirmAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: ConfirmAppointmentRequest,
  ): Promise<ConfirmAppointmentResponse> {
    // 1. Validation des paramètres d'entrée
    this.validateRequest(request);

    // 2. Récupération de l'appointment
    const appointmentId = AppointmentId.create(request.appointmentId);
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    if (!appointment) {
      throw new ApplicationValidationError(
        "appointment",
        "not_found",
        `Appointment with ID ${request.appointmentId} not found`,
      );
    }

    // 3. Vérification du statut (doit être REQUESTED)
    if (appointment.getStatus().toString() !== "REQUESTED") {
      throw new ApplicationValidationError(
        "appointment",
        "invalid_status",
        `Cannot confirm appointment with status ${appointment.getStatus()}. Status must be REQUESTED.`,
      );
    }

    // 4. Confirmation du rendez-vous
    const confirmedAppointment = appointment.confirm();

    // 5. Sauvegarde
    await this.appointmentRepository.save(confirmedAppointment);

    // 6. TODO: Envoi de notification de confirmation
    let confirmationSent = false;
    try {
      // await this.notificationService.sendConfirmationNotification(
      //   confirmedAppointment,
      //   request.confirmationMethod
      // );
      confirmationSent = true;
    } catch (error) {
      // Log error but don't fail the confirmation
      console.warn("Failed to send confirmation notification:", error);
    }

    return {
      appointment: confirmedAppointment,
      message: "Appointment confirmed successfully",
      confirmationSent,
    };
  }

  private validateRequest(request: ConfirmAppointmentRequest): void {
    if (!request.appointmentId) {
      throw new ApplicationValidationError(
        "validation",
        "required_field",
        "Appointment ID is required",
      );
    }

    if (!request.requestingUserId) {
      throw new ApplicationValidationError(
        "validation",
        "required_field",
        "Requesting user ID is required",
      );
    }

    const validMethods = ["EMAIL", "PHONE", "SMS", "IN_PERSON"];
    if (!validMethods.includes(request.confirmationMethod)) {
      throw new ApplicationValidationError(
        "validation",
        "invalid_value",
        `Invalid confirmation method. Must be one of: ${validMethods.join(", ")}`,
      );
    }
  }
}
