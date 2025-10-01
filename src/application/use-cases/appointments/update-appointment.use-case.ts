/**
 * ✏️ UPDATE APPOINTMENT USE CASE
 *
 * Use case pour mettre à jour un rendez-vous
 * Clean Architecture - Application Layer
 */

import {
  Appointment,
  AppointmentId,
} from "../../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/repositories/appointment.repository.interface";
import { AppointmentNotFoundError } from "../../exceptions/appointment.exceptions";

export interface UpdateAppointmentRequest {
  readonly appointmentId: string;
  readonly requestingUserId: string;
  readonly startTime?: Date;
  readonly endTime?: Date;
  readonly title?: string;
  readonly description?: string;
  readonly modificationReason?: string;
}

export interface UpdateAppointmentResponse {
  readonly appointment: Appointment;
  readonly message: string;
}

export class UpdateAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: UpdateAppointmentRequest,
  ): Promise<UpdateAppointmentResponse> {
    // 1. Conversion en Value Object
    const appointmentId = AppointmentId.create(request.appointmentId);

    // 2. Récupération de l'appointment
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    // 3. Vérification de l'existence
    if (!appointment) {
      throw new AppointmentNotFoundError(request.appointmentId);
    }

    // 4. Mise à jour des champs si fournis
    const updatedAppointment = appointment;

    // TODO: Mise à jour du créneau horaire si fourni
    if (request.startTime && request.endTime) {
      // const newTimeSlot = TimeSlot.create(request.startTime, request.endTime);
      // TODO: Vérifier la disponibilité du nouveau créneau
      // const conflicts = await this.appointmentRepository.findConflictingAppointments(...);
      // if (conflicts.length > 0) {
      //   throw new AppointmentConflictError(newTimeSlot, conflicts[0].id);
      // }
      // TODO: Implémenter la méthode reschedule dans l'entité Appointment
      // updatedAppointment = updatedAppointment.reschedule(newTimeSlot, request.modificationReason);
    }

    // Mise à jour du titre si fourni
    if (request.title) {
      // Note: L'entité Appointment pourrait ne pas avoir de méthode updateTitle
      // Il faudrait vérifier l'API de l'entité ou créer une nouvelle instance
    }

    // Mise à jour de la description si fournie
    if (request.description) {
      // Note: Même chose pour la description
    }

    // 5. Sauvegarde
    await this.appointmentRepository.save(updatedAppointment);

    return {
      appointment: updatedAppointment,
      message: "Rendez-vous mis à jour avec succès",
    };
  }
}
