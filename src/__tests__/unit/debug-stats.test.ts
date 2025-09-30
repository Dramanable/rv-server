/**
 * Debug test simple pour identifier le problème
 */

import {
  GetAppointmentStatsRequest,
  GetAppointmentStatsUseCase,
} from '../../application/use-cases/appointments/get-appointment-stats.use-case';
import { AppointmentStatisticsCriteria } from '../../domain/repositories/appointment.repository.interface';
import { AppointmentStatisticsData } from '../../domain/value-objects/appointment-statistics.vo';
import { PeriodType } from '../../domain/value-objects/statistics-period.vo';
import { UserRole } from '../../shared/enums/user-role.enum';

// Mock simple
class SimpleMockRepository {
  async getStatistics(
    criteria: AppointmentStatisticsCriteria,
  ): Promise<AppointmentStatisticsData> {
    return {
      totalAppointments: 100,
      confirmedAppointments: 70, // 70
      pendingAppointments: 15, // + 15
      canceledAppointments: 10, // + 10
      completedAppointments: 4, // + 4
      noShowAppointments: 1, // + 1 = 100 ✅
      totalRevenue: 5000,
      averageAppointmentValue: 50,
    };
  }
}

describe('Debug Stats Test', () => {
  it('should debug platform admin stats', async () => {
    console.log('🔍 Debug test starting...');

    const mockRepository = new SimpleMockRepository();
    const useCase = new GetAppointmentStatsUseCase(mockRepository as any);

    const request: GetAppointmentStatsRequest = {
      userId: 'test-id',
      userRole: UserRole.PLATFORM_ADMIN,
      periodType: PeriodType.MONTH,
    };

    console.log('🔍 About to execute useCase...');

    try {
      const result = await useCase.execute(request);
      console.log('🔍 Result:', JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
    } catch (error) {
      console.log('🚨 Error caught:', error);
      throw error;
    }
  });
});
