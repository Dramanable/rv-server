/**
 * 🏛️ DOMAIN VALUE OBJECT - AppointmentStatistics
 *
 * Value Object pour représenter les statistiques d'appointments
 * Contient toutes les métriques calculées avec les règles business
 */

import { DomainValidationError } from "../exceptions/domain.exceptions";

export interface AppointmentStatisticsData {
  readonly totalAppointments: number;
  readonly confirmedAppointments: number;
  readonly canceledAppointments: number;
  readonly completedAppointments: number;
  readonly pendingAppointments: number;
  readonly noShowAppointments: number;
  readonly totalRevenue: number;
  readonly averageAppointmentValue: number;
}

export class AppointmentStatistics {
  public readonly totalAppointments: number;
  public readonly confirmedAppointments: number;
  public readonly canceledAppointments: number;
  public readonly completedAppointments: number;
  public readonly pendingAppointments: number;
  public readonly noShowAppointments: number;
  public readonly totalRevenue: number;
  public readonly averageAppointmentValue: number;

  constructor(data: AppointmentStatisticsData) {
    this.validateStatistics(data);

    this.totalAppointments = data.totalAppointments;
    this.confirmedAppointments = data.confirmedAppointments;
    this.canceledAppointments = data.canceledAppointments;
    this.completedAppointments = data.completedAppointments;
    this.pendingAppointments = data.pendingAppointments;
    this.noShowAppointments = data.noShowAppointments;
    this.totalRevenue = data.totalRevenue;
    this.averageAppointmentValue = data.averageAppointmentValue;
  }

  /**
   * Factory method pour créer des statistiques
   */
  static create(data: AppointmentStatisticsData): AppointmentStatistics {
    return new AppointmentStatistics(data);
  }

  /**
   * Calcule le taux de confirmation (confirmed / total)
   */
  get confirmationRate(): number {
    if (this.totalAppointments === 0) return 0;
    return Number(
      ((this.confirmedAppointments / this.totalAppointments) * 100).toFixed(2),
    );
  }

  /**
   * Calcule le taux de completion (completed / total)
   */
  get completionRate(): number {
    if (this.totalAppointments === 0) return 0;
    return Number(
      ((this.completedAppointments / this.totalAppointments) * 100).toFixed(2),
    );
  }

  /**
   * Calcule le taux d'annulation (canceled / total)
   */
  get cancellationRate(): number {
    if (this.totalAppointments === 0) return 0;
    return Number(
      ((this.canceledAppointments / this.totalAppointments) * 100).toFixed(2),
    );
  }

  /**
   * Vérifie si les performances sont bonnes (completion > 80% et cancellation < 20%)
   */
  get isHighPerformance(): boolean {
    return this.completionRate > 80 && this.cancellationRate < 20;
  }

  /**
   * Vérifie si les statistiques nécessitent une attention (cancellation > 30%)
   */
  get requiresAttention(): boolean {
    return this.cancellationRate > 30;
  }

  private validateStatistics(data: AppointmentStatisticsData): void {
    if (data.totalAppointments < 0) {
      throw new DomainValidationError("Total appointments cannot be negative");
    }

    if (data.confirmedAppointments < 0) {
      throw new DomainValidationError(
        "Confirmed appointments cannot be negative",
      );
    }

    if (data.canceledAppointments < 0) {
      throw new DomainValidationError(
        "Canceled appointments cannot be negative",
      );
    }

    if (data.completedAppointments < 0) {
      throw new DomainValidationError(
        "Completed appointments cannot be negative",
      );
    }

    if (data.totalRevenue < 0) {
      throw new DomainValidationError("Total revenue cannot be negative");
    }

    if (data.averageAppointmentValue < 0) {
      throw new DomainValidationError(
        "Average appointment value cannot be negative",
      );
    }

    // Validation business : la somme des statuts ne peut pas dépasser le total
    const statusSum =
      data.confirmedAppointments +
      data.canceledAppointments +
      data.completedAppointments +
      data.pendingAppointments +
      data.noShowAppointments;

    if (statusSum > data.totalAppointments) {
      throw new DomainValidationError(
        "Sum of appointment statuses cannot exceed total appointments",
      );
    }
  }
}
