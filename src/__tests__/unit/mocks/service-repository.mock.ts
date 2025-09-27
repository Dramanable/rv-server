/**
 * 🧪 MOCK CENTRALISÉ - ServiceRepository
 *
 * Mock réutilisable du ServiceRepository pour tous les tests
 * Respecte exactement l'interface ServiceRepository
 */

import type { ServiceRepository } from "@domain/repositories/service.repository.interface";

export const createMockServiceRepository =
  (): jest.Mocked<ServiceRepository> => {
    return {
      findById: jest.fn().mockResolvedValue(null),
      findByBusinessId: jest.fn().mockResolvedValue([]),
      findActiveByBusinessId: jest.fn().mockResolvedValue([]),
      findByCategory: jest.fn().mockResolvedValue([]),
      findByStaffId: jest.fn().mockResolvedValue([]),
      search: jest.fn().mockResolvedValue({ services: [], total: 0 }),
      save: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
      findByName: jest.fn().mockResolvedValue(null),
      existsByName: jest.fn().mockResolvedValue(false),
      findPopularServices: jest.fn().mockResolvedValue([]),
      getServiceStatistics: jest.fn().mockResolvedValue({
        totalBookings: 0,
        completedBookings: 0,
        cancelledBookings: 0,
        averageRating: 0,
        totalRevenue: 0,
      }),
      getBusinessServiceStatistics: jest.fn().mockResolvedValue({
        totalServices: 0,
        activeServices: 0,
        averagePrice: 0,
        averageDuration: 0,
      }),
    } as jest.Mocked<ServiceRepository>;
  };
