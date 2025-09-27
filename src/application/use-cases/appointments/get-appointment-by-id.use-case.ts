/**
 * 📄 GET APPOINTMENT BY ID USE CASE
 *
 * Use case pour récupérer un rendez-vous par son identifiant
 * Clean Architecture - Application Layer
 */

import {
  Appointment,
  AppointmentId,
} from "../../../domain/entities/appointment.entity";
import { AppointmentRepository } from "../../../domain/repositories/appointment.repository.interface";
import { AppointmentNotFoundError } from "../../exceptions/appointment.exceptions";

export interface GetAppointmentByIdRequest {
  readonly appointmentId: string;
  readonly requestingUserId: string;
}

export interface GetAppointmentByIdResponse {
  readonly appointment: Appointment;
}

export class GetAppointmentByIdUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: GetAppointmentByIdRequest,
  ): Promise<GetAppointmentByIdResponse> {
    // 1. Conversion en Value Object
    const appointmentId = AppointmentId.create(request.appointmentId);

    // 2. Récupération de l'appointment
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    // 3. Vérification de l'existence
    if (!appointment) {
      throw new AppointmentNotFoundError(request.appointmentId);
    }

    // 4. TODO: Vérification des permissions (si nécessaire)
    // Selon les règles métier, vérifier si l'utilisateur peut voir ce rendez-vous

    return {
      appointment,
    };
  }
}
