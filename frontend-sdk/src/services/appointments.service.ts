/**
 * 📅 RV Project Frontend SDK - Service Appointments
 *
 * Gestion complète des rendez-vous et créneaux
 */

import { addDays, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { RVProjectClient } from '../client';
import {
    ApiResponse,
    Appointment,
    AppointmentStatus,
    AvailableSlot,
    BookAppointmentRequest,
    ClientInfo,
    GetAvailableSlotsRequest,
    PaginatedResponse,
    SearchAppointmentsRequest,
    UpdateAppointmentRequest
} from '../types';

export class AppointmentsService {
  constructor(private client: RVProjectClient) {}

  // ==========================================
  // 📅 Gestion des Rendez-vous
  // ==========================================

  /**
   * Réserver un nouveau rendez-vous
   */
  async bookAppointment(request: BookAppointmentRequest): Promise<Appointment> {
    const response = await this.client.post<ApiResponse<Appointment>>('/appointments', request);
    return response.data.data;
  }

  /**
   * Obtenir un rendez-vous par ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await this.client.get<ApiResponse<Appointment>>(`/appointments/${id}`);
    return response.data.data;
  }

  /**
   * Mettre à jour un rendez-vous
   */
  async updateAppointment(id: string, updates: UpdateAppointmentRequest): Promise<Appointment> {
    const response = await this.client.put<ApiResponse<Appointment>>(`/appointments/${id}`, updates);
    return response.data.data;
  }

  /**
   * Annuler un rendez-vous
   */
  async cancelAppointment(id: string, reason?: string): Promise<Appointment> {
    const response = await this.client.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, {
      reason
    });
    return response.data.data;
  }

  /**
   * Confirmer un rendez-vous
   */
  async confirmAppointment(id: string): Promise<Appointment> {
    const response = await this.client.patch<ApiResponse<Appointment>>(`/appointments/${id}/confirm`);
    return response.data.data;
  }

  /**
   * Marquer un rendez-vous comme terminé
   */
  async completeAppointment(id: string, notes?: string): Promise<Appointment> {
    const response = await this.client.patch<ApiResponse<Appointment>>(`/appointments/${id}/complete`, {
      internalNotes: notes
    });
    return response.data.data;
  }

  /**
   * Marquer un rendez-vous comme "no show"
   */
  async markNoShow(id: string): Promise<Appointment> {
    const response = await this.client.patch<ApiResponse<Appointment>>(`/appointments/${id}/no-show`);
    return response.data.data;
  }

  /**
   * Reprogrammer un rendez-vous
   */
  async rescheduleAppointment(id: string, newDateTime: string): Promise<Appointment> {
    const response = await this.client.patch<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, {
      scheduledAt: newDateTime
    });
    return response.data.data;
  }

  // ==========================================
  // 🔍 Recherche et Filtrage
  // ==========================================

  /**
   * Rechercher des rendez-vous avec filtres avancés
   */
  async searchAppointments(request: SearchAppointmentsRequest = {}): Promise<PaginatedResponse<Appointment>> {
    const response = await this.client.post<ApiResponse<PaginatedResponse<Appointment>>>(
      '/appointments/list',
      request
    );
    return response.data.data;
  }

  /**
   * Obtenir les rendez-vous d'une entreprise
   */
  async getBusinessAppointments(
    businessId: string,
    dateFrom?: string,
    dateTo?: string,
    status?: AppointmentStatus
  ): Promise<Appointment[]> {
    const searchParams: SearchAppointmentsRequest = {
      businessId,
      limit: 100,
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
      ...(status && { status })
    };

    const result = await this.searchAppointments(searchParams);
    return result.data as Appointment[];
  }

  /**
   * Obtenir les rendez-vous d'un client
   */
  async getClientAppointments(clientEmail: string, activeOnly: boolean = true): Promise<Appointment[]> {
    const searchParams: SearchAppointmentsRequest = {
      clientEmail,
      limit: 100,
      ...(activeOnly && { status: AppointmentStatus.CONFIRMED })
    };

    const result = await this.searchAppointments(searchParams);
    return result.data as Appointment[];
  }

  /**
   * Obtenir les rendez-vous du jour
   */
  async getTodayAppointments(businessId: string): Promise<Appointment[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    return this.getBusinessAppointments(businessId, today, today);
  }

  /**
   * Obtenir les prochains rendez-vous
   */
  async getUpcomingAppointments(businessId: string, days: number = 7): Promise<Appointment[]> {
    const today = format(new Date(), 'yyyy-MM-dd');
    const endDate = format(addDays(new Date(), days), 'yyyy-MM-dd');

    return this.getBusinessAppointments(businessId, today, endDate, AppointmentStatus.CONFIRMED);
  }

  // ==========================================
  // 🕒 Gestion des Créneaux Disponibles
  // ==========================================

  /**
   * Obtenir les créneaux disponibles pour un service
   */
  async getAvailableSlots(request: GetAvailableSlotsRequest): Promise<AvailableSlot[]> {
    const response = await this.client.post<ApiResponse<AvailableSlot[]>>('/appointments/available-slots', request);
    return response.data.data;
  }

  /**
   * Vérifier la disponibilité d'un créneau spécifique
   */
  async checkSlotAvailability(
    businessId: string,
    serviceId: string,
    dateTime: string,
    staffMemberId?: string
  ): Promise<boolean> {
    try {
      const date = format(parseISO(dateTime), 'yyyy-MM-dd');
      const slotsRequest: GetAvailableSlotsRequest = {
        businessId,
        serviceId,
        date,
        ...(staffMemberId && { staffMemberId })
      };

      const slots = await this.getAvailableSlots(slotsRequest);

      return slots.some(slot => slot.start === dateTime);
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtenir les créneaux disponibles pour plusieurs jours
   */
  async getAvailableSlotsForRange(
    businessId: string,
    serviceId: string,
    startDate: string,
    endDate: string,
    staffMemberId?: string
  ): Promise<Record<string, AvailableSlot[]>> {
    const slots: Record<string, AvailableSlot[]> = {};
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    let currentDate = start;

    while (!isAfter(currentDate, end)) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');

      try {
        const slotsRequest: GetAvailableSlotsRequest = {
          businessId,
          serviceId,
          date: dateStr,
          ...(staffMemberId && { staffMemberId })
        };

        const daySlots = await this.getAvailableSlots(slotsRequest);
        slots[dateStr] = daySlots;
      } catch (error) {
        slots[dateStr] = [];
      }

      currentDate = addDays(currentDate, 1);
    }

    return slots;
  }

  // ==========================================
  // 🔧 Validation et Utilitaires
  // ==========================================

  /**
   * Valider les données de réservation côté client
   */
  validateBookingData(data: BookAppointmentRequest): string[] {
    const errors: string[] = [];

    // Validation IDs
    if (!this.isValidUUID(data.businessId)) {
      errors.push('Invalid business ID');
    }

    if (!this.isValidUUID(data.serviceId)) {
      errors.push('Invalid service ID');
    }

    if (data.staffMemberId && !this.isValidUUID(data.staffMemberId)) {
      errors.push('Invalid staff member ID');
    }

    // Validation date/heure
    if (!data.scheduledAt) {
      errors.push('Scheduled date and time is required');
    } else {
      try {
        const scheduledDate = parseISO(data.scheduledAt);
        const now = new Date();

        if (isBefore(scheduledDate, now)) {
          errors.push('Cannot book appointments in the past');
        }

        if (isAfter(scheduledDate, addDays(now, 365))) {
          errors.push('Cannot book appointments more than a year in advance');
        }
      } catch (error) {
        errors.push('Invalid date/time format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)');
      }
    }

    // Validation client info
    const clientErrors = this.validateClientInfo(data.clientInfo);
    errors.push(...clientErrors);

    return errors;
  }

  /**
   * Valider les informations client
   */
  validateClientInfo(clientInfo: ClientInfo): string[] {
    const errors: string[] = [];

    if (!clientInfo.firstName.trim()) {
      errors.push('Client first name is required');
    } else if (clientInfo.firstName.length < 2) {
      errors.push('Client first name must be at least 2 characters');
    }

    if (!clientInfo.lastName.trim()) {
      errors.push('Client last name is required');
    } else if (clientInfo.lastName.length < 2) {
      errors.push('Client last name must be at least 2 characters');
    }

    if (!clientInfo.email.trim()) {
      errors.push('Client email is required');
    } else if (!this.isValidEmail(clientInfo.email)) {
      errors.push('Invalid client email format');
    }

    if (clientInfo.phone && !this.isValidPhone(clientInfo.phone)) {
      errors.push('Invalid client phone number format');
    }

    return errors;
  }

  /**
   * Validation UUID
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Validation email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation téléphone
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  // ==========================================
  // 📊 Formatage et Utilitaires d'Affichage
  // ==========================================

  /**
   * Formater la date/heure d'un rendez-vous pour l'affichage
   */
  static formatAppointmentDateTime(appointment: Appointment, locale: string = 'fr-FR'): string {
    const date = parseISO(appointment.scheduledAt);

    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  /**
   * Formater une date courte pour l'affichage
   */
  static formatAppointmentDate(appointment: Appointment): string {
    return format(parseISO(appointment.scheduledAt), 'dd/MM/yyyy');
  }

  /**
   * Formater l'heure pour l'affichage
   */
  static formatAppointmentTime(appointment: Appointment): string {
    return format(parseISO(appointment.scheduledAt), 'HH:mm');
  }

  /**
   * Obtenir le nom complet du client
   */
  static getClientFullName(appointment: Appointment): string {
    return `${appointment.clientInfo.firstName} ${appointment.clientInfo.lastName}`.trim();
  }

  /**
   * Obtenir une description du statut pour l'affichage
   */
  static getStatusLabel(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'En attente',
      [AppointmentStatus.CONFIRMED]: 'Confirmé',
      [AppointmentStatus.IN_PROGRESS]: 'En cours',
      [AppointmentStatus.COMPLETED]: 'Terminé',
      [AppointmentStatus.CANCELLED]: 'Annulé',
      [AppointmentStatus.NO_SHOW]: 'Absent',
      [AppointmentStatus.RESCHEDULED]: 'Reprogrammé'
    };

    return labels[status] || status;
  }

  /**
   * Obtenir la couleur associée au statut
   */
  static getStatusColor(status: AppointmentStatus): string {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: '#f59e0b',
      [AppointmentStatus.CONFIRMED]: '#10b981',
      [AppointmentStatus.IN_PROGRESS]: '#3b82f6',
      [AppointmentStatus.COMPLETED]: '#6b7280',
      [AppointmentStatus.CANCELLED]: '#ef4444',
      [AppointmentStatus.NO_SHOW]: '#dc2626',
      [AppointmentStatus.RESCHEDULED]: '#8b5cf6'
    };

    return colors[status] || '#6b7280';
  }

  /**
   * Vérifier si un rendez-vous peut être annulé
   */
  static canBeCancelled(appointment: Appointment): boolean {
    const cancelableStatuses = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED];

    if (!cancelableStatuses.includes(appointment.status)) {
      return false;
    }

    // Vérifier si le rendez-vous n'est pas dans le passé
    const appointmentDate = parseISO(appointment.scheduledAt);
    return isAfter(appointmentDate, new Date());
  }

  /**
   * Vérifier si un rendez-vous peut être reprogrammé
   */
  static canBeRescheduled(appointment: Appointment): boolean {
    const reschedulableStatuses = [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED];
    return reschedulableStatuses.includes(appointment.status);
  }

  /**
   * Calculer le temps restant avant un rendez-vous
   */
  static getTimeUntilAppointment(appointment: Appointment): {
    days: number;
    hours: number;
    minutes: number;
    isPast: boolean;
  } {
    const appointmentDate = parseISO(appointment.scheduledAt);
    const now = new Date();
    const diff = appointmentDate.getTime() - now.getTime();

    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, isPast: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, isPast: false };
  }

  /**
   * Grouper les rendez-vous par date
   */
  static groupAppointmentsByDate(appointments: Appointment[]): Record<string, Appointment[]> {
    const grouped: Record<string, Appointment[]> = {};

    appointments.forEach(appointment => {
      const dateKey = this.formatAppointmentDate(appointment);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }

      grouped[dateKey].push(appointment);
    });

    // Trier les rendez-vous de chaque jour par heure
    Object.keys(grouped).forEach(date => {
      const appointments = grouped[date];
      if (appointments) {
        appointments.sort((a, b) =>
          parseISO(a.scheduledAt).getTime() - parseISO(b.scheduledAt).getTime()
        );
      }
    });

    return grouped;
  }

  /**
   * Filtrer les rendez-vous par statut
   */
  static filterByStatus(appointments: Appointment[], status: AppointmentStatus): Appointment[] {
    return appointments.filter(appointment => appointment.status === status);
  }

  /**
   * Obtenir les statistiques des rendez-vous
   */
  static getAppointmentStats(appointments: Appointment[]): {
    total: number;
    byStatus: Record<AppointmentStatus, number>;
    thisWeek: number;
    thisMonth: number;
  } {
    const stats = {
      total: appointments.length,
      byStatus: {} as Record<AppointmentStatus, number>,
      thisWeek: 0,
      thisMonth: 0
    };

    const now = new Date();
    const startOfWeek = startOfDay(new Date(now.setDate(now.getDate() - now.getDay())));
    const startOfMonth = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));

    appointments.forEach(appointment => {
      // Compter par statut
      stats.byStatus[appointment.status] = (stats.byStatus[appointment.status] || 0) + 1;

      const appointmentDate = parseISO(appointment.scheduledAt);

      // Compter cette semaine
      if (isAfter(appointmentDate, startOfWeek)) {
        stats.thisWeek++;
      }

      // Compter ce mois
      if (isAfter(appointmentDate, startOfMonth)) {
        stats.thisMonth++;
      }
    });

    return stats;
  }
}

export default AppointmentsService;
