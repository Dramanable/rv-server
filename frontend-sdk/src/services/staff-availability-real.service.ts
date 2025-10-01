/**
 * 📅 Staff Availability Service - Gestion des Disponibilités
 *
 * Service pour la gestion des disponibilités du personnel
 * Compatible avec les endpoints API réels
 *
 * @version 2.0.0 - CORRIGÉ POUR VRAIS ENDPOINTS
 */

import { RVProjectClient } from '../client';

// Types de base
export interface TimeSlot {
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
}

export interface StaffAvailabilitySlot {
  id: string;
  staffId: string;
  date: string; // Format "YYYY-MM-DD"
  timeSlot: TimeSlot;
  isAvailable: boolean;
  type: 'WORK' | 'BREAK' | 'UNAVAILABLE' | 'BLOCKED';
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilitySearchFilters {
  businessId?: string;
  serviceId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  minimumDuration?: number; // en minutes
  includeBreaks?: boolean;
}

export interface AvailableStaffMember {
  staffId: string;
  staffName: string;
  availableSlots: TimeSlot[];
  totalSlots: number;
  utilizationRate: number; // 0-100%
}

export interface SetAvailabilityRequest {
  date: string; // "YYYY-MM-DD"
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    type: 'WORK' | 'BREAK' | 'UNAVAILABLE' | 'BLOCKED';
    reason?: string;
  }>;
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: 'WEEKLY' | 'MONTHLY';
    endDate?: string;
    weekdays?: string[]; // ["MONDAY", "TUESDAY", ...]
  };
}

/**
 * 📅 Service de gestion des disponibilités du personnel
 * Utilise les endpoints API réels : /api/v1/staff/availability/*
 */
class StaffAvailabilityService {
  constructor(private readonly client: RVProjectClient) {}

  /**
   * 📋 Get Staff Member Availability
   * Endpoint: GET /api/v1/staff/availability/{staffId}
   */
  async getStaffAvailability(
    staffId: string,
    params?: {
      startDate?: string; // "YYYY-MM-DD"
      endDate?: string;   // "YYYY-MM-DD"
      includeBlocked?: boolean;
    }
  ): Promise<{
    staffId: string;
    staffName: string;
    availability: StaffAvailabilitySlot[];
    summary: {
      totalHours: number;
      availableHours: number;
      blockedHours: number;
      utilizationRate: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.set('startDate', params.startDate);
    if (params?.endDate) queryParams.set('endDate', params.endDate);
    if (params?.includeBlocked !== undefined) queryParams.set('includeBlocked', params.includeBlocked.toString());

    const url = `/api/v1/staff/availability/${staffId}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await this.client.get<{
      staffId: string;
      staffName: string;
      availability: StaffAvailabilitySlot[];
      summary: {
        totalHours: number;
        availableHours: number;
        blockedHours: number;
        utilizationRate: number;
      };
    }>(url);
    return response.data;
  }

  /**
   * 🔍 Search Available Staff with Filters
   * Endpoint: POST /api/v1/staff/availability/search
   */
  async searchAvailableStaff(filters: AvailabilitySearchFilters): Promise<{
    availableStaff: AvailableStaffMember[];
    searchCriteria: AvailabilitySearchFilters;
    totalFound: number;
    searchDate: string;
  }> {
    const response = await this.client.post<{
      availableStaff: AvailableStaffMember[];
      searchCriteria: AvailabilitySearchFilters;
      totalFound: number;
      searchDate: string;
    }>('/api/v1/staff/availability/search', filters);
    return response.data;
  }

  /**
   * 🔧 Set Staff Member Availability
   * Endpoint: POST /api/v1/staff/availability/{staffId}/set
   */
  async setStaffAvailability(
    staffId: string,
    availability: SetAvailabilityRequest
  ): Promise<{
    success: boolean;
    staffId: string;
    slotsCreated: number;
    slotsUpdated: number;
    conflicts: Array<{
      date: string;
      timeSlot: TimeSlot;
      reason: string;
    }>;
    message: string;
  }> {
    const response = await this.client.post<{
      success: boolean;
      staffId: string;
      slotsCreated: number;
      slotsUpdated: number;
      conflicts: Array<{
        date: string;
        timeSlot: TimeSlot;
        reason: string;
      }>;
      message: string;
    }>(`/api/v1/staff/availability/${staffId}/set`, availability);
    return response.data;
  }

  /**
   * 🗓️ Méthodes utilitaires pour la gestion des disponibilités
   */

  /**
   * Vérifier si un staff est disponible à un créneau donné
   */
  async isStaffAvailable(
    staffId: string,
    date: string,
    timeSlot: TimeSlot
  ): Promise<boolean> {
    try {
      const availability = await this.getStaffAvailability(staffId, {
        startDate: date,
        endDate: date
      });

      return availability.availability.some(slot =>
        slot.date === date &&
        slot.timeSlot.startTime <= timeSlot.startTime &&
        slot.timeSlot.endTime >= timeSlot.endTime &&
        slot.isAvailable &&
        slot.type === 'WORK'
      );
    } catch {
      return false;
    }
  }

  /**
   * Obtenir les créneaux libres d'un staff pour une date
   */
  async getFreeSlots(
    staffId: string,
    date: string,
    slotDuration: number = 60
  ): Promise<TimeSlot[]> {
    const availability = await this.getStaffAvailability(staffId, {
      startDate: date,
      endDate: date
    });

    return availability.availability
      .filter(slot => slot.isAvailable && slot.type === 'WORK')
      .map(slot => slot.timeSlot)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  /**
   * Rechercher le meilleur créneau disponible
   */
  async findBestAvailableSlot(filters: {
    businessId: string;
    serviceId?: string;
    preferredDate?: string;
    duration: number;
    staffPreferences?: string[];
  }): Promise<{
    staffId: string;
    staffName: string;
    suggestedSlot: TimeSlot;
    date: string;
    confidence: number; // 0-100%
  } | null> {
    const searchResults = await this.searchAvailableStaff({
      businessId: filters.businessId,
      serviceId: filters.serviceId,
      date: filters.preferredDate,
      minimumDuration: filters.duration
    });

    if (searchResults.availableStaff.length === 0) {
      return null;
    }

    // Logique de sélection du meilleur créneau
    const bestStaff = searchResults.availableStaff[0];
    const bestSlot = bestStaff.availableSlots[0];

    return {
      staffId: bestStaff.staffId,
      staffName: bestStaff.staffName,
      suggestedSlot: bestSlot,
      date: filters.preferredDate || new Date().toISOString().split('T')[0],
      confidence: Math.min(100, bestStaff.utilizationRate + 20)
    };
  }

  /**
   * 📊 Obtenir des statistiques de disponibilité
   */
  async getAvailabilityStats(
    businessId: string,
    filters?: {
      startDate?: string;
      endDate?: string;
      staffIds?: string[];
    }
  ): Promise<{
    totalStaff: number;
    averageUtilization: number;
    busyHours: number;
    availableHours: number;
    peakHours: Array<{
      hour: string;
      utilization: number;
    }>;
    staffStats: Array<{
      staffId: string;
      staffName: string;
      utilization: number;
      totalHours: number;
    }>;
  }> {
    // Cette méthode utiliserait la recherche pour calculer les stats
    const searchResult = await this.searchAvailableStaff({
      businessId,
      ...filters
    });

    // Calculs basiques (dans une vraie implémentation, ce serait fait côté serveur)
    const totalStaff = searchResult.availableStaff.length;
    const averageUtilization = totalStaff > 0
      ? searchResult.availableStaff.reduce((sum, staff) => sum + staff.utilizationRate, 0) / totalStaff
      : 0;

    return {
      totalStaff,
      averageUtilization,
      busyHours: 0, // À calculer
      availableHours: 0, // À calculer
      peakHours: [], // À calculer
      staffStats: searchResult.availableStaff.map(staff => ({
        staffId: staff.staffId,
        staffName: staff.staffName,
        utilization: staff.utilizationRate,
        totalHours: staff.totalSlots * 0.5 // Estimation
      }))
    };
  }
}

export default StaffAvailabilityService;
