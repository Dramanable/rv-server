/**
 * 📅 RV Project Frontend SDK - Service des Types de Calendrier
 *
 * Gestion des types de calendriers pour l'organisation des rendez-vous
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum CalendarTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum CalendarTypeColor {
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  RED = 'RED',
  YELLOW = 'YELLOW',
  PURPLE = 'PURPLE',
  ORANGE = 'ORANGE',
  PINK = 'PINK',
  CYAN = 'CYAN',
  GRAY = 'GRAY',
}

export interface CalendarType {
  readonly id: string;
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly color: CalendarTypeColor;
  readonly status: CalendarTypeStatus;
  readonly isDefault: boolean;
  readonly displayOrder: number;
  readonly settings: {
    readonly allowOverlapping: boolean;
    readonly maxConcurrentAppointments: number;
    readonly requireConfirmation: boolean;
    readonly autoAcceptBookings: boolean;
    readonly bufferTime: number; // en minutes
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCalendarTypeRequest {
  readonly businessId: string;
  readonly name: string;
  readonly description?: string;
  readonly color: CalendarTypeColor;
  readonly settings?: {
    readonly allowOverlapping?: boolean;
    readonly maxConcurrentAppointments?: number;
    readonly requireConfirmation?: boolean;
    readonly autoAcceptBookings?: boolean;
    readonly bufferTime?: number;
  };
  readonly displayOrder?: number;
}

export interface UpdateCalendarTypeRequest {
  readonly name?: string;
  readonly description?: string;
  readonly color?: CalendarTypeColor;
  readonly status?: CalendarTypeStatus;
  readonly settings?: {
    readonly allowOverlapping?: boolean;
    readonly maxConcurrentAppointments?: number;
    readonly requireConfirmation?: boolean;
    readonly autoAcceptBookings?: boolean;
    readonly bufferTime?: number;
  };
  readonly displayOrder?: number;
}

export interface ListCalendarTypesRequest {
  readonly businessId: string;
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly status?: CalendarTypeStatus;
  readonly search?: string;
}

export class CalendarTypesService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister tous les types de calendrier
   */
  async list(
    request: ListCalendarTypesRequest,
  ): Promise<PaginatedResponse<CalendarType>> {
    const response = await this.client.post<PaginatedResponse<CalendarType>>(
      '/api/v1/calendar-types/list',
      request,
    );
    return response.data;
  }

  /**
   * 📄 Obtenir un type de calendrier par ID
   */
  async getById(id: string): Promise<CalendarType> {
    const response = await this.client.get<CalendarType>(
      `/api/v1/calendar-types/${id}`,
    );
    return response.data;
  }

  /**
   * ➕ Créer un nouveau type de calendrier
   */
  async create(request: CreateCalendarTypeRequest): Promise<CalendarType> {
    const response = await this.client.post<CalendarType>(
      '/api/v1/calendar-types',
      request,
    );
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un type de calendrier
   */
  async update(
    id: string,
    updates: UpdateCalendarTypeRequest,
  ): Promise<CalendarType> {
    const response = await this.client.put<CalendarType>(
      `/api/v1/calendar-types/${id}`,
      updates,
    );
    return response.data;
  }

  /**
   * 🗑️ Supprimer un type de calendrier
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/calendar-types/${id}`);
  }

  /**
   * ❤️ Calendar Types Health Check
   * Endpoint: GET /api/v1/calendar-types/health
   */
  async health(): Promise<{
    status: 'ok' | 'error';
    timestamp: string;
    totalTypes: number;
    activeTypes: number;
    businessCount: number;
  }> {
    const response = await this.client.get<{
      status: 'ok' | 'error';
      timestamp: string;
      totalTypes: number;
      activeTypes: number;
      businessCount: number;
    }>('/api/v1/calendar-types/health');
    return response.data;
  }

  /**
   * 🏢 Obtenir tous les types de calendrier d'un business
   */
  async getByBusiness(businessId: string): Promise<CalendarType[]> {
    const response = await this.list({
      businessId,
      limit: 100,
    });
    return [...response.data];
  }

  /**
   * ⭐ Définir un type comme défaut
   */
  async setDefault(id: string): Promise<CalendarType> {
    const response = await this.client.post<CalendarType>(
      `/api/v1/calendar-types/${id}/set-default`,
    );
    return response.data;
  }

  /**
   * 🔄 Réorganiser les types de calendrier
   */
  async reorder(
    businessId: string,
    orders: { id: string; displayOrder: number }[],
  ): Promise<CalendarType[]> {
    const response = await this.client.post<CalendarType[]>(
      '/api/v1/calendar-types/reorder',
      {
        businessId,
        orders,
      },
    );
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques des types de calendrier
   */
  async getStats(businessId: string): Promise<{
    totalTypes: number;
    activeTypes: number;
    inactiveTypes: number;
    defaultType: CalendarType | null;
    byColor: Record<CalendarTypeColor, number>;
    byStatus: Record<CalendarTypeStatus, number>;
    appointmentCounts: Array<{
      typeId: string;
      typeName: string;
      appointmentCount: number;
    }>;
  }> {
    const response = await this.client.get<{
      totalTypes: number;
      activeTypes: number;
      inactiveTypes: number;
      defaultType: CalendarType | null;
      byColor: Record<CalendarTypeColor, number>;
      byStatus: Record<CalendarTypeStatus, number>;
      appointmentCounts: Array<{
        typeId: string;
        typeName: string;
        appointmentCount: number;
      }>;
    }>(`/api/v1/calendar-types/stats?businessId=${businessId}`);
    return response.data;
  }

  /**
   * 🔄 Dupliquer un type de calendrier
   */
  async duplicate(id: string, newName: string): Promise<CalendarType> {
    const response = await this.client.post<CalendarType>(
      `/api/v1/calendar-types/${id}/duplicate`,
      { name: newName },
    );
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires pour les types de calendrier
   */
  static getStatusDisplayName(status: CalendarTypeStatus): string {
    const names: Record<CalendarTypeStatus, string> = {
      [CalendarTypeStatus.ACTIVE]: 'Actif',
      [CalendarTypeStatus.INACTIVE]: 'Inactif',
      [CalendarTypeStatus.ARCHIVED]: 'Archivé',
    };
    return names[status];
  }

  static getColorDisplayName(color: CalendarTypeColor): string {
    const names: Record<CalendarTypeColor, string> = {
      [CalendarTypeColor.BLUE]: 'Bleu',
      [CalendarTypeColor.GREEN]: 'Vert',
      [CalendarTypeColor.RED]: 'Rouge',
      [CalendarTypeColor.YELLOW]: 'Jaune',
      [CalendarTypeColor.PURPLE]: 'Violet',
      [CalendarTypeColor.ORANGE]: 'Orange',
      [CalendarTypeColor.PINK]: 'Rose',
      [CalendarTypeColor.CYAN]: 'Cyan',
      [CalendarTypeColor.GRAY]: 'Gris',
    };
    return names[color];
  }

  static getColorHex(color: CalendarTypeColor): string {
    const colors: Record<CalendarTypeColor, string> = {
      [CalendarTypeColor.BLUE]: '#3B82F6',
      [CalendarTypeColor.GREEN]: '#10B981',
      [CalendarTypeColor.RED]: '#EF4444',
      [CalendarTypeColor.YELLOW]: '#F59E0B',
      [CalendarTypeColor.PURPLE]: '#8B5CF6',
      [CalendarTypeColor.ORANGE]: '#F97316',
      [CalendarTypeColor.PINK]: '#EC4899',
      [CalendarTypeColor.CYAN]: '#06B6D4',
      [CalendarTypeColor.GRAY]: '#6B7280',
    };
    return colors[color];
  }

  static isActive(calendarType: CalendarType): boolean {
    return calendarType.status === CalendarTypeStatus.ACTIVE;
  }

  static canBeDeleted(calendarType: CalendarType): boolean {
    // Ne peut pas supprimer le type par défaut
    return !calendarType.isDefault;
  }

  static sortByDisplayOrder(types: CalendarType[]): CalendarType[] {
    return [...types].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  static filterActive(types: CalendarType[]): CalendarType[] {
    return types.filter((type) => this.isActive(type));
  }

  static getDefaultType(types: CalendarType[]): CalendarType | null {
    const defaultType = types.find((type) => type.isDefault);
    return defaultType || null;
  }

  static validateSettings(settings: {
    allowOverlapping?: boolean;
    maxConcurrentAppointments?: number;
    requireConfirmation?: boolean;
    autoAcceptBookings?: boolean;
    bufferTime?: number;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (settings.maxConcurrentAppointments !== undefined) {
      if (settings.maxConcurrentAppointments < 1) {
        errors.push(
          'Le nombre maximum de rendez-vous simultanés doit être au moins 1',
        );
      }
      if (settings.maxConcurrentAppointments > 100) {
        errors.push(
          'Le nombre maximum de rendez-vous simultanés ne peut pas dépasser 100',
        );
      }
    }

    if (settings.bufferTime !== undefined) {
      if (settings.bufferTime < 0) {
        errors.push('Le temps de tampon ne peut pas être négatif');
      }
      if (settings.bufferTime > 120) {
        errors.push('Le temps de tampon ne peut pas dépasser 120 minutes');
      }
    }

    if (settings.requireConfirmation && settings.autoAcceptBookings) {
      errors.push(
        'Ne peut pas à la fois exiger une confirmation et accepter automatiquement les réservations',
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static formatBufferTime(minutes: number): string {
    if (minutes === 0) return 'Aucun';
    if (minutes < 60) return `${minutes} min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}min`;
    }
  }

  static generateNextOrder(existingTypes: CalendarType[]): number {
    if (existingTypes.length === 0) return 1;
    const maxOrder = Math.max(
      ...existingTypes.map((type) => type.displayOrder),
    );
    return maxOrder + 1;
  }
}

export default CalendarTypesService;
