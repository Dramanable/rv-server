// DTOs de base pour les opérations d'appointment
export * from './appointment-operations.dto';
export * from './appointment-response.dto';
export * from './book-appointment.dto';

// DTOs avancés pour opérations spécifiques (éviter les conflits de noms)
export {
  ConfirmAppointmentDto,
  ConfirmAppointmentResponseDto,
  UpdateAppointmentStatusDto,
  UpdateAppointmentStatusResponseDto,
} from './appointment-advanced.dto';
