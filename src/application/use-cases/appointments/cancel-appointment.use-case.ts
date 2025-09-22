/**
 * ❌ CANCEL APPOINTMENT USE CASE
 *
 * Use case pour annuler un rendez-vous avec gestion des notifications
 * Clean Architecture - Application Layer
 */

import { AppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import {
  Appointment,
  AppointmentId,
  AppointmentStatus,
} from '../../../domain/entities/appointment.entity';
import {
  AppointmentNotFoundError,
  AppointmentAlreadyCancelledError,
} from '../../exceptions/appointment.exceptions';

export interface CancelAppointmentRequest {
  readonly appointmentId: string;
  readonly reason: string;
  readonly notifyClient: boolean;
  readonly requestingUserId: string;
}

export interface CancelAppointmentResponse {
  readonly success: boolean;
  readonly message: string;
  readonly refundAmount?: number;
}

export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: CancelAppointmentRequest,
  ): Promise<CancelAppointmentResponse> {
    // 1. Conversion en Value Object
    const appointmentId = AppointmentId.create(request.appointmentId);

    // 2. Récupération de l'appointment
    const appointment =
      await this.appointmentRepository.findById(appointmentId);

    // 3. Vérification de l'existence
    if (!appointment) {
      throw new AppointmentNotFoundError(request.appointmentId);
    }

    // 4. Vérification du statut (ne peut pas annuler un appointment déjà annulé)
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new AppointmentAlreadyCancelledError(request.appointmentId);
    }

    // 5. Annulation du rendez-vous
    appointment.cancel(request.reason);

    // 6. Sauvegarde
    await this.appointmentRepository.save(appointment);

    // 7. TODO: Notification du client si demandé
    if (request.notifyClient) {
      // await this.notificationService.sendCancellationNotification(appointment);
    }

    // 8. TODO: Calcul du remboursement éventuel
    let refundAmount: number | undefined;
    // refundAmount = await this.calculateRefund(appointment);

    return {
      success: true,
      message: 'Rendez-vous annulé avec succès',
      refundAmount,
    };
  }
}
