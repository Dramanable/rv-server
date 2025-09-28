/**
 * ✅ CONFIRM APPOINTMENT USE CASE - CLEAN ARCHITECTURE
 * ✅ Use case pour confirmer un rendez-vous en attente
 * ✅ Clean Architecture - Application Layer
 */

import { Appointment } from '../../../domain/entities/appointment.entity';
import { AppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import { AppointmentNotFoundError } from '../../exceptions/appointment.exceptions';

// ===== REQUEST & RESPONSE =====

export interface ConfirmAppointmentRequest {
  readonly appointmentId: string;
  readonly requestingUserId: string;
  readonly confirmationMethod: 'EMAIL' | 'PHONE' | 'SMS' | 'IN_PERSON';
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
    // TODO: Implémenter la logique de confirmation complète
    // - Validation du statut actuel (doit être REQUESTED)
    // - Transition vers CONFIRMED
    // - Envoi de notification de confirmation
    // - Audit trail de la confirmation

    throw new Error('ConfirmAppointmentUseCase not yet fully implemented');
  }
}
