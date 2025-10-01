/**
 * 👨‍💼 RV Project Frontend SDK - Service de Gestion du Personnel
 *
 * Gestion des membres du personnel, disponibilités et compétences
 */

import { RVProjectClient } from '../client';
import { PaginatedResponse } from '../types';

export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED'
}

export enum AvailabilityType {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  BREAK = 'BREAK',
  LUNCH = 'LUNCH',
  MEETING = 'MEETING',
  OFF = 'OFF'
}

export interface StaffMember {
  readonly id: string;
  readonly userId: string;
  readonly businessId: string;
  readonly employeeId?: string;
  readonly position: string;
  readonly department?: string;
  readonly status: StaffStatus;
  readonly hireDate: string;
  readonly endDate?: string;
  readonly hourlyRate?: number;
  readonly currency?: string;
  readonly skills: string[];
  readonly services: string[];
  readonly workingHours: WorkingHours;
  readonly preferences: StaffPreferences;
  readonly user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
  };
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkingHours {
  readonly monday?: DaySchedule;
  readonly tuesday?: DaySchedule;
  readonly wednesday?: DaySchedule;
  readonly thursday?: DaySchedule;
  readonly friday?: DaySchedule;
  readonly saturday?: DaySchedule;
  readonly sunday?: DaySchedule;
}

export interface DaySchedule {
  readonly isWorking: boolean;
  readonly shifts: TimeSlot[];
}

export interface TimeSlot {
  readonly startTime: string; // HH:mm format
  readonly endTime: string;   // HH:mm format
}

export interface StaffPreferences {
  readonly maxAppointmentsPerDay?: number;
  readonly maxHoursPerDay?: number;
  readonly breakDuration?: number; // minutes
  readonly bufferTimeBetweenAppointments?: number; // minutes
  readonly allowOvertime?: boolean;
  readonly preferredServices?: string[];
  readonly notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface StaffAvailability {
  readonly id: string;
  readonly staffId: string;
  readonly date: string;
  readonly type: AvailabilityType;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly isRecurring: boolean;
  readonly recurringPattern?: string;
  readonly note?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateStaffRequest {
  readonly userId: string;
  readonly businessId: string;
  readonly employeeId?: string;
  readonly position: string;
  readonly department?: string;
  readonly hireDate: string;
  readonly hourlyRate?: number;
  readonly currency?: string;
  readonly skills?: string[];
  readonly services?: string[];
  readonly workingHours?: WorkingHours;
  readonly preferences?: StaffPreferences;
}

export interface UpdateStaffRequest {
  readonly position?: string;
  readonly department?: string;
  readonly status?: StaffStatus;
  readonly hourlyRate?: number;
  readonly endDate?: string;
  readonly skills?: string[];
  readonly services?: string[];
  readonly workingHours?: WorkingHours;
  readonly preferences?: StaffPreferences;
}

export interface ListStaffRequest {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
  readonly businessId?: string;
  readonly status?: StaffStatus;
  readonly position?: string;
  readonly department?: string;
  readonly search?: string;
  readonly skills?: string[];
  readonly services?: string[];
}

export interface SetAvailabilityRequest {
  readonly staffId: string;
  readonly date: string;
  readonly type: AvailabilityType;
  readonly startTime?: string;
  readonly endTime?: string;
  readonly isRecurring?: boolean;
  readonly recurringPattern?: string;
  readonly note?: string;
}

export class StaffService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les membres du personnel
   */
  async list(request: ListStaffRequest = {}): Promise<PaginatedResponse<StaffMember>> {
    const response = await this.client.post<PaginatedResponse<StaffMember>>(
      '/api/v1/staff/list',
      request
    );
    return response.data;
  }

  /**
   * 📄 Obtenir un membre du personnel par ID
   */
  async getById(id: string): Promise<StaffMember> {
    const response = await this.client.get<StaffMember>(`/api/v1/staff/${id}`);
    return response.data;
  }

  /**
   * ➕ Ajouter un nouveau membre du personnel
   */
  async create(request: CreateStaffRequest): Promise<StaffMember> {
    const response = await this.client.post<StaffMember>('/api/v1/staff', request);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un membre du personnel
   */
  async update(id: string, updates: UpdateStaffRequest): Promise<StaffMember> {
    const response = await this.client.put<StaffMember>(`/api/v1/staff/${id}`, updates);
    return response.data;
  }

  /**
   * 🗑️ Supprimer un membre du personnel
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/api/v1/staff/${id}`);
  }

  /**
   * 🎯 Assigner des compétences à un membre du personnel
   */
  async assignSkills(staffId: string, skillIds: string[]): Promise<StaffMember> {
    const response = await this.client.post<StaffMember>(
      `/api/v1/staff/${staffId}/skills`,
      { skillIds }
    );
    return response.data;
  }

  /**
   * 💼 Assigner des services à un membre du personnel
   */
  async assignServices(staffId: string, serviceIds: string[]): Promise<StaffMember> {
    const response = await this.client.post<StaffMember>(
      `/api/v1/staff/${staffId}/services`,
      { serviceIds }
    );
    return response.data;
  }

  /**
   * ⏰ Définir les horaires de travail
   */
  async setWorkingHours(staffId: string, workingHours: WorkingHours): Promise<StaffMember> {
    const response = await this.client.put<StaffMember>(
      `/api/v1/staff/${staffId}/working-hours`,
      { workingHours }
    );
    return response.data;
  }

  /**
   * 📅 Obtenir les disponibilités d'un membre du personnel
   */
  async getAvailabilities(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<StaffAvailability[]> {
    const response = await this.client.get<StaffAvailability[]>(
      `/api/v1/staff/${staffId}/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
    );
    return response.data;
  }

  /**
   * ✅ Définir la disponibilité d'un membre du personnel
   */
  async setAvailability(request: SetAvailabilityRequest): Promise<StaffAvailability> {
    const response = await this.client.post<StaffAvailability>(
      '/api/v1/staff/availability',
      request
    );
    return response.data;
  }

  /**
   * ❌ Supprimer une disponibilité
   */
  async deleteAvailability(availabilityId: string): Promise<void> {
    await this.client.delete(`/api/v1/staff/availability/${availabilityId}`);
  }

  /**
   * 📊 Obtenir les statistiques du personnel
   */
  async getStats(businessId?: string): Promise<{
    totalStaff: number;
    activeStaff: number;
    onLeaveStaff: number;
    byStatus: Record<StaffStatus, number>;
    byDepartment: Record<string, number>;
    averageHourlyRate: number;
    totalSkills: number;
    averageSkillsPerStaff: number;
  }> {
    const query = businessId ? `?businessId=${businessId}` : '';
    const response = await this.client.get<{
      totalStaff: number;
      activeStaff: number;
      onLeaveStaff: number;
      byStatus: Record<StaffStatus, number>;
      byDepartment: Record<string, number>;
      averageHourlyRate: number;
      totalSkills: number;
      averageSkillsPerStaff: number;
    }>(`/api/v1/staff/stats${query}`);
    return response.data;
  }

  /**
   * 🔍 Trouver le personnel disponible pour un service
   */
  async findAvailableForService(
    serviceId: string,
    date: Date,
    duration?: number
  ): Promise<StaffMember[]> {
    const response = await this.client.post<StaffMember[]>(
      '/api/v1/staff/available',
      {
        serviceId,
        date: date.toISOString(),
        duration
      }
    );
    return response.data;
  }

  /**
   * 📈 Obtenir la charge de travail d'un membre du personnel
   */
  async getWorkload(
    staffId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalHours: number;
    totalAppointments: number;
    dailyBreakdown: Array<{
      date: string;
      hours: number;
      appointments: number;
      occupancyRate: number;
    }>;
    averageOccupancyRate: number;
  }> {
    const response = await this.client.get<{
      totalHours: number;
      totalAppointments: number;
      dailyBreakdown: Array<{
        date: string;
        hours: number;
        appointments: number;
        occupancyRate: number;
      }>;
      averageOccupancyRate: number;
    }>(`/api/v1/staff/${staffId}/workload?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
    return response.data;
  }

  /**
   * 🎯 Obtenir les compétences disponibles
   */
  async getAvailableSkills(businessId?: string): Promise<Array<{
    id: string;
    name: string;
    category: string;
    description?: string;
  }>> {
    const query = businessId ? `?businessId=${businessId}` : '';
    const response = await this.client.get<Array<{
      id: string;
      name: string;
      category: string;
      description?: string;
    }>>(`/api/v1/staff/skills${query}`);
    return response.data;
  }

  /**
   * 🏢 Obtenir le personnel par business
   */
  async getByBusiness(businessId: string): Promise<StaffMember[]> {
    const response = await this.list({ businessId, limit: 100 });
    return [...response.data];
  }

  /**
   * 🔄 Changer le statut d'un membre du personnel
   */
  async changeStatus(staffId: string, status: StaffStatus, endDate?: string): Promise<StaffMember> {
    const body: any = { status };
    if (endDate) body.endDate = endDate;

    const response = await this.client.patch<StaffMember>(
      `/api/v1/staff/${staffId}/status`,
      body
    );
    return response.data;
  }

  /**
   * 🛡️ Méthodes utilitaires
   */
  static formatStaffName(staff: StaffMember): string {
    return `${staff.user.firstName} ${staff.user.lastName}`.trim();
  }

  static isStaffAvailable(staff: StaffMember, date: Date): boolean {
    if (staff.status !== StaffStatus.ACTIVE) return false;

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WorkingHours;
    const daySchedule = staff.workingHours[dayOfWeek];

    return daySchedule?.isWorking || false;
  }

  static getStaffOccupancyRate(workload: {
    totalHours: number;
    dailyBreakdown: Array<{ occupancyRate: number }>;
  }): number {
    if (workload.dailyBreakdown.length === 0) return 0;

    const totalOccupancy = workload.dailyBreakdown.reduce(
      (sum, day) => sum + day.occupancyRate,
      0
    );

    return totalOccupancy / workload.dailyBreakdown.length;
  }

  static filterBySkills(staff: StaffMember[], requiredSkills: string[]): StaffMember[] {
    return staff.filter(member =>
      requiredSkills.every(skill => member.skills.includes(skill))
    );
  }

  static groupByDepartment(staff: StaffMember[]): Record<string, StaffMember[]> {
    return staff.reduce((groups, member) => {
      const dept = member.department || 'Unassigned';
      if (!groups[dept]) groups[dept] = [];
      groups[dept].push(member);
      return groups;
    }, {} as Record<string, StaffMember[]>);
  }
}

export default StaffService;
