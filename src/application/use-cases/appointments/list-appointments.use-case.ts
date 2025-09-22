/**
 * 📋 LIST APPOINTMENTS USE CASE
 *
 * Use case pour récupérer une liste paginée des rendez-vous avec filtres avancés
 * Clean Architecture - Application Layer
 */

import { AppointmentRepository } from '../../../domain/repositories/appointment.repository.interface';
import {
  Appointment,
  AppointmentStatus,
} from '../../../domain/entities/appointment.entity';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';

export interface ListAppointmentsRequest {
  readonly requestingUserId: string;
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
  };
  readonly sorting: {
    readonly sortBy: string;
    readonly sortOrder: 'asc' | 'desc';
  };
  readonly filters: {
    readonly search?: string;
    readonly businessId?: string;
    readonly status?: string;
    readonly fromDate?: Date;
    readonly toDate?: Date;
  };
}

export interface ListAppointmentsResponse {
  readonly appointments: Appointment[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(
    request: ListAppointmentsRequest,
  ): Promise<ListAppointmentsResponse> {
    // 1. Validation des paramètres de pagination
    const page = Math.max(1, request.pagination.page);
    const limit = Math.min(100, Math.max(1, request.pagination.limit));
    const offset = (page - 1) * limit;

    // 2. Construction des critères de recherche
    const searchCriteria = {
      businessId: request.filters.businessId
        ? BusinessId.create(request.filters.businessId)
        : undefined,
      status: request.filters.status
        ? [request.filters.status as AppointmentStatus]
        : undefined,
      startDate: request.filters.fromDate,
      endDate: request.filters.toDate,
      limit,
      offset,
    };

    // 3. Récupération des appointments avec comptage total
    const result = await this.appointmentRepository.search(searchCriteria);
    const { appointments, total: totalCount } = result;

    // 4. Calcul des métadonnées de pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      appointments,
      meta: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    };
  }
}
