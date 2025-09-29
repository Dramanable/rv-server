/**
 * 🏛️ DOMAIN VALUE OBJECT - StatisticsPeriod
 *
 * Value Object pour représenter une période de statistiques
 * Gère les calculs de dates pour différents types de périodes
 */

import { DomainValidationError } from '../exceptions/domain.exceptions';

export enum PeriodType {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export class StatisticsPeriod {
  public readonly type: PeriodType;
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly label: string;

  constructor(
    type: PeriodType,
    startDate: Date,
    endDate: Date,
    label?: string,
  ) {
    this.validatePeriod(startDate, endDate);

    this.type = type;
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
    this.label = label || this.generateLabel();
  }

  /**
   * Factory method pour créer une période personnalisée
   */
  static createCustom(
    startDate: Date,
    endDate: Date,
    label?: string,
  ): StatisticsPeriod {
    return new StatisticsPeriod(PeriodType.CUSTOM, startDate, endDate, label);
  }

  /**
   * Factory method pour créer une période de la semaine courante
   */
  static createCurrentWeek(): StatisticsPeriod {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return new StatisticsPeriod(PeriodType.WEEK, startOfWeek, endOfWeek);
  }

  /**
   * Factory method pour créer une période du mois courant
   */
  static createCurrentMonth(): StatisticsPeriod {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return new StatisticsPeriod(PeriodType.MONTH, startOfMonth, endOfMonth);
  }

  /**
   * Factory method pour créer une période du trimestre courant
   */
  static createCurrentQuarter(): StatisticsPeriod {
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3);
    const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
    const endOfQuarter = new Date(
      now.getFullYear(),
      (currentQuarter + 1) * 3,
      0,
    );
    endOfQuarter.setHours(23, 59, 59, 999);

    return new StatisticsPeriod(
      PeriodType.QUARTER,
      startOfQuarter,
      endOfQuarter,
    );
  }

  /**
   * Factory method pour créer une période de l'année courante
   */
  static createCurrentYear(): StatisticsPeriod {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear(), 11, 31);
    endOfYear.setHours(23, 59, 59, 999);

    return new StatisticsPeriod(PeriodType.YEAR, startOfYear, endOfYear);
  }

  /**
   * Calcule le nombre de jours dans la période
   */
  get durationInDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Vérifie si la période contient une date donnée
   */
  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  /**
   * Génère un label automatique basé sur le type de période
   */
  private generateLabel(): string {
    const startDate = this.startDate;
    const endDate = this.endDate;

    switch (this.type) {
      case PeriodType.WEEK:
        return `Semaine du ${this.formatDate(startDate)} au ${this.formatDate(endDate)}`;
      case PeriodType.MONTH:
        return `${this.getMonthName(startDate.getMonth())} ${startDate.getFullYear()}`;
      case PeriodType.QUARTER: {
        const quarter = Math.floor(startDate.getMonth() / 3) + 1;
        return `T${quarter} ${startDate.getFullYear()}`;
      }
      case PeriodType.YEAR:
        return `Année ${startDate.getFullYear()}`;
      case PeriodType.CUSTOM:
        return `Du ${this.formatDate(startDate)} au ${this.formatDate(endDate)}`;
      default:
        return `Du ${this.formatDate(startDate)} au ${this.formatDate(endDate)}`;
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private getMonthName(monthIndex: number): string {
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    return months[monthIndex];
  }

  private validatePeriod(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
      throw new DomainValidationError(
        'Start date and end date must be valid Date objects',
      );
    }

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new DomainValidationError(
        'Start date and end date must be valid dates',
      );
    }

    if (startDate > endDate) {
      throw new DomainValidationError('Start date cannot be after end date');
    }

    // Validation business : la période ne peut pas être trop longue (max 5 ans)
    const maxDuration = 5 * 365 * 24 * 60 * 60 * 1000; // 5 ans en millisecondes
    if (endDate.getTime() - startDate.getTime() > maxDuration) {
      throw new DomainValidationError('Period duration cannot exceed 5 years');
    }
  }
}
