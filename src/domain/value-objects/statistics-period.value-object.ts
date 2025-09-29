/**
 * 📅 STATISTICS PERIOD VALUE OBJECT
 *
 * Value Object pour représenter les périodes de statistiques avec validation métier.
 */

import { DomainValidationError } from '../exceptions/domain.exceptions';

export enum PeriodType {
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export interface StatisticsPeriodData {
  readonly type: PeriodType;
  readonly year: number;
  readonly month?: number; // 1-12 pour month/quarter
  readonly quarter?: number; // 1-4 pour quarter
  readonly weekStart?: string; // ISO date string pour week
  readonly weekEnd?: string; // ISO date string pour week
}

export class StatisticsPeriod {
  private constructor(
    private readonly _type: PeriodType,
    private readonly _year: number,
    private readonly _month?: number,
    private readonly _quarter?: number,
    private readonly _weekStart?: Date,
    private readonly _weekEnd?: Date,
  ) {}

  /**
   * Factory method pour période mensuelle
   */
  static createMonth(year: number, month: number): StatisticsPeriod {
    this.validateYear(year);
    this.validateMonth(month);

    return new StatisticsPeriod(PeriodType.MONTH, year, month);
  }

  /**
   * Factory method pour période hebdomadaire
   */
  static createWeek(weekStart: string): StatisticsPeriod {
    const startDate = new Date(weekStart);
    if (isNaN(startDate.getTime())) {
      throw new DomainValidationError('Invalid week start date format');
    }

    // Calculer la fin de semaine (6 jours après le début)
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return new StatisticsPeriod(
      PeriodType.WEEK,
      startDate.getFullYear(),
      undefined,
      undefined,
      startDate,
      endDate,
    );
  }

  /**
   * Factory method pour période trimestrielle
   */
  static createQuarter(year: number, quarter: number): StatisticsPeriod {
    this.validateYear(year);
    this.validateQuarter(quarter);

    return new StatisticsPeriod(PeriodType.QUARTER, year, undefined, quarter);
  }

  /**
   * Factory method pour période annuelle
   */
  static createYear(year: number): StatisticsPeriod {
    this.validateYear(year);

    return new StatisticsPeriod(PeriodType.YEAR, year);
  }

  /**
   * Factory method pour période courante
   */
  static createCurrent(type: PeriodType): StatisticsPeriod {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    switch (type) {
      case PeriodType.WEEK: {
        // Début de la semaine courante (lundi)
        const startOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(now.getDate() - daysToMonday);
        return this.createWeek(startOfWeek.toISOString().split('T')[0]);
      }

      case PeriodType.MONTH:
        return this.createMonth(currentYear, currentMonth);

      case PeriodType.QUARTER: {
        const currentQuarter = Math.ceil(currentMonth / 3);
        return this.createQuarter(currentYear, currentQuarter);
      }

      case PeriodType.YEAR:
        return this.createYear(currentYear);

      default:
        throw new DomainValidationError(
          `Unsupported period type: ${String(type)}`,
        );
    }
  }

  // Getters
  get type(): PeriodType {
    return this._type;
  }

  get year(): number {
    return this._year;
  }

  get month(): number | undefined {
    return this._month;
  }

  get quarter(): number | undefined {
    return this._quarter;
  }

  get weekStart(): Date | undefined {
    return this._weekStart ? new Date(this._weekStart) : undefined;
  }

  get weekEnd(): Date | undefined {
    return this._weekEnd ? new Date(this._weekEnd) : undefined;
  }

  /**
   * Obtient la date de début de la période
   */
  getStartDate(): Date {
    switch (this._type) {
      case PeriodType.WEEK:
        return this._weekStart!;

      case PeriodType.MONTH:
        return new Date(this._year, this._month! - 1, 1);

      case PeriodType.QUARTER: {
        const quarterStartMonth = (this._quarter! - 1) * 3;
        return new Date(this._year, quarterStartMonth, 1);
      }

      case PeriodType.YEAR:
        return new Date(this._year, 0, 1);

      default:
        throw new DomainValidationError(
          `Unknown period type: ${String(this._type)}`,
        );
    }
  }

  /**
   * Obtient la date de fin de la période
   */
  getEndDate(): Date {
    switch (this._type) {
      case PeriodType.WEEK:
        return this._weekEnd!;

      case PeriodType.MONTH:
        return new Date(this._year, this._month!, 0); // Dernier jour du mois

      case PeriodType.QUARTER: {
        const quarterEndMonth = this._quarter! * 3;
        return new Date(this._year, quarterEndMonth, 0); // Dernier jour du trimestre
      }

      case PeriodType.YEAR:
        return new Date(this._year, 11, 31); // 31 décembre

      default:
        throw new DomainValidationError(
          `Unknown period type: ${String(this._type)}`,
        );
    }
  }

  /**
   * Obtient une description lisible de la période
   */
  getDisplayName(): string {
    switch (this._type) {
      case PeriodType.WEEK: {
        const start = this._weekStart!.toLocaleDateString();
        const end = this._weekEnd!.toLocaleDateString();
        return `Semaine du ${start} au ${end}`;
      }

      case PeriodType.MONTH: {
        const monthNames = [
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
        return `${monthNames[this._month! - 1]} ${this._year}`;
      }

      case PeriodType.QUARTER:
        return `T${this._quarter} ${this._year}`;

      case PeriodType.YEAR:
        return `Année ${this._year}`;

      default:
        return `Période inconnue`;
    }
  }

  /**
   * Vérifie si la période est dans le passé
   */
  isPast(): boolean {
    const now = new Date();
    return this.getEndDate() < now;
  }

  /**
   * Vérifie si la période est courante
   */
  isCurrent(): boolean {
    const now = new Date();
    const start = this.getStartDate();
    const end = this.getEndDate();
    return start <= now && now <= end;
  }

  /**
   * Serialisation pour transfer
   */
  toData(): StatisticsPeriodData {
    return {
      type: this._type,
      year: this._year,
      month: this._month,
      quarter: this._quarter,
      weekStart: this._weekStart?.toISOString().split('T')[0],
      weekEnd: this._weekEnd?.toISOString().split('T')[0],
    };
  }

  /**
   * Validation de l'année
   */
  private static validateYear(year: number): void {
    const currentYear = new Date().getFullYear();
    if (year < 2000 || year > currentYear + 1) {
      throw new DomainValidationError(
        `Year must be between 2000 and ${currentYear + 1}`,
      );
    }
  }

  /**
   * Validation du mois
   */
  private static validateMonth(month: number): void {
    if (month < 1 || month > 12) {
      throw new DomainValidationError('Month must be between 1 and 12');
    }
  }

  /**
   * Validation du trimestre
   */
  private static validateQuarter(quarter: number): void {
    if (quarter < 1 || quarter > 4) {
      throw new DomainValidationError('Quarter must be between 1 and 4');
    }
  }

  /**
   * Égalité entre deux périodes
   */
  equals(other: StatisticsPeriod): boolean {
    return (
      this._type === other._type &&
      this._year === other._year &&
      this._month === other._month &&
      this._quarter === other._quarter &&
      this._weekStart?.getTime() === other._weekStart?.getTime() &&
      this._weekEnd?.getTime() === other._weekEnd?.getTime()
    );
  }
}
