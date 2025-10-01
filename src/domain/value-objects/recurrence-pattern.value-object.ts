import {
  InvalidValueError,
  RequiredValueError,
} from "@domain/exceptions/value-object.exceptions";
import { RecurrenceType, WeekDay } from "./time-slot.value-object";

export interface RecurrenceRule {
  type: RecurrenceType;
  interval: number; // Every X days/weeks/months
  endDate?: Date;
  occurrences?: number; // Max number of occurrences
  daysOfWeek?: WeekDay[]; // For weekly recurrence
  dayOfMonth?: number; // For monthly recurrence (1-31)
  monthOfYear?: number; // For yearly recurrence (1-12)
  exceptions?: Date[]; // Dates to exclude
}

export class RecurrencePattern {
  constructor(private readonly rule: RecurrenceRule) {
    this.validate();
  }

  private validate(): void {
    if (this.rule.interval < 1) {
      throw new InvalidValueError(
        "interval",
        this.rule.interval,
        "Interval must be at least 1",
      );
    }

    if (this.rule.occurrences && this.rule.occurrences < 1) {
      throw new InvalidValueError(
        "occurrences",
        this.rule.occurrences,
        "Occurrences must be at least 1",
      );
    }

    if (this.rule.endDate && this.rule.occurrences) {
      throw new InvalidValueError(
        "endDate_occurrences",
        { endDate: this.rule.endDate, occurrences: this.rule.occurrences },
        "Cannot specify both endDate and occurrences",
      );
    }

    switch (this.rule.type) {
      case RecurrenceType.WEEKLY:
        if (!this.rule.daysOfWeek || this.rule.daysOfWeek.length === 0) {
          throw new RequiredValueError("daysOfWeek");
        }
        break;

      case RecurrenceType.MONTHLY:
        if (
          !this.rule.dayOfMonth ||
          this.rule.dayOfMonth < 1 ||
          this.rule.dayOfMonth > 31
        ) {
          throw new InvalidValueError(
            "dayOfMonth",
            this.rule.dayOfMonth,
            "Monthly recurrence requires valid dayOfMonth (1-31)",
          );
        }
        break;

      case RecurrenceType.YEARLY:
        if (
          !this.rule.monthOfYear ||
          this.rule.monthOfYear < 1 ||
          this.rule.monthOfYear > 12
        ) {
          throw new InvalidValueError(
            "monthOfYear",
            this.rule.monthOfYear,
            "Yearly recurrence requires valid monthOfYear (1-12)",
          );
        }
        if (
          !this.rule.dayOfMonth ||
          this.rule.dayOfMonth < 1 ||
          this.rule.dayOfMonth > 31
        ) {
          throw new InvalidValueError(
            "dayOfMonth",
            this.rule.dayOfMonth,
            "Yearly recurrence requires valid dayOfMonth (1-31)",
          );
        }
        break;
    }
  }

  static create(rule: RecurrenceRule): RecurrencePattern {
    return new RecurrencePattern(rule);
  }

  // Factory methods for common patterns
  static daily(interval: number = 1, endDate?: Date): RecurrencePattern {
    return new RecurrencePattern({
      type: RecurrenceType.DAILY,
      interval,
      endDate,
    });
  }

  static weekly(
    daysOfWeek: WeekDay[],
    interval: number = 1,
    endDate?: Date,
  ): RecurrencePattern {
    return new RecurrencePattern({
      type: RecurrenceType.WEEKLY,
      interval,
      daysOfWeek,
      endDate,
    });
  }

  static monthly(
    dayOfMonth: number,
    interval: number = 1,
    endDate?: Date,
  ): RecurrencePattern {
    return new RecurrencePattern({
      type: RecurrenceType.MONTHLY,
      interval,
      dayOfMonth,
      endDate,
    });
  }

  static yearly(
    monthOfYear: number,
    dayOfMonth: number,
    interval: number = 1,
  ): RecurrencePattern {
    return new RecurrencePattern({
      type: RecurrenceType.YEARLY,
      interval,
      monthOfYear,
      dayOfMonth,
    });
  }

  // Generate dates based on recurrence pattern
  generateDates(startDate: Date, maxDates: number = 100): Date[] {
    if (this.rule.type === RecurrenceType.NONE) {
      return [startDate];
    }

    const dates: Date[] = [];
    let currentDate = new Date(startDate);
    let count = 0;

    while (count < maxDates) {
      // Check if we've reached the end conditions
      if (this.rule.endDate && currentDate > this.rule.endDate) {
        break;
      }

      if (this.rule.occurrences && count >= this.rule.occurrences) {
        break;
      }

      // Check if current date is not an exception
      if (!this.isException(currentDate)) {
        dates.push(new Date(currentDate));
      }

      // Calculate next date based on recurrence type
      currentDate = this.getNextDate(currentDate);
      count++;

      // Safety check to prevent infinite loops
      if (count > 1000) {
        throw new InvalidValueError(
          "recurrenceCount",
          count,
          "Recurrence pattern generated too many dates",
        );
      }
    }

    return dates;
  }

  private getNextDate(currentDate: Date): Date {
    const nextDate = new Date(currentDate);

    switch (this.rule.type) {
      case RecurrenceType.DAILY:
        nextDate.setDate(nextDate.getDate() + this.rule.interval);
        break;

      case RecurrenceType.WEEKLY: {
        // Find next occurrence based on days of week
        let daysToAdd = 1;
        const currentDay = nextDate.getDay();

        // Look for next day in the pattern
        while (daysToAdd <= 7) {
          const checkDay = (currentDay + daysToAdd) % 7;
          if (this.rule.daysOfWeek!.includes(checkDay as WeekDay)) {
            break;
          }
          daysToAdd++;
        }

        // If we've gone through a full week, move to next interval
        if (daysToAdd > 7) {
          daysToAdd = 7 * this.rule.interval;
        }

        nextDate.setDate(nextDate.getDate() + daysToAdd);
        break;
      }

      case RecurrenceType.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + this.rule.interval);
        nextDate.setDate(this.rule.dayOfMonth!);

        // Handle months with fewer days
        if (nextDate.getDate() !== this.rule.dayOfMonth) {
          nextDate.setDate(0); // Go to last day of previous month
        }
        break;

      case RecurrenceType.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + this.rule.interval);
        nextDate.setMonth(this.rule.monthOfYear! - 1);
        nextDate.setDate(this.rule.dayOfMonth!);

        // Handle leap years for Feb 29
        if (nextDate.getMonth() !== this.rule.monthOfYear! - 1) {
          nextDate.setDate(0); // Go to last day of February
        }
        break;

      default:
        throw new InvalidValueError(
          "recurrenceType",
          this.rule.type,
          `Unsupported recurrence type: ${this.rule.type}`,
        );
    }

    return nextDate;
  }

  // Check if a date matches this recurrence pattern
  matchesPattern(date: Date, referenceDate: Date): boolean {
    if (this.isException(date)) {
      return false;
    }

    if (this.rule.endDate && date > this.rule.endDate) {
      return false;
    }

    switch (this.rule.type) {
      case RecurrenceType.NONE:
        return date.toDateString() === referenceDate.toDateString();

      case RecurrenceType.DAILY: {
        const daysDiff = Math.floor(
          (date.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        return daysDiff >= 0 && daysDiff % this.rule.interval === 0;
      }

      case RecurrenceType.WEEKLY: {
        const weeksDiff = Math.floor(
          (date.getTime() - referenceDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7),
        );
        return (
          weeksDiff >= 0 &&
          weeksDiff % this.rule.interval === 0 &&
          this.rule.daysOfWeek!.includes(date.getDay() as WeekDay)
        );
      }

      case RecurrenceType.MONTHLY:
        return (
          date.getDate() === this.rule.dayOfMonth &&
          this.isCorrectMonthInterval(date, referenceDate)
        );

      case RecurrenceType.YEARLY:
        return (
          date.getDate() === this.rule.dayOfMonth &&
          date.getMonth() === this.rule.monthOfYear! - 1 &&
          this.isCorrectYearInterval(date, referenceDate)
        );

      default:
        return false;
    }
  }

  private isCorrectMonthInterval(date: Date, referenceDate: Date): boolean {
    const monthsDiff =
      (date.getFullYear() - referenceDate.getFullYear()) * 12 +
      (date.getMonth() - referenceDate.getMonth());
    return monthsDiff >= 0 && monthsDiff % this.rule.interval === 0;
  }

  private isCorrectYearInterval(date: Date, referenceDate: Date): boolean {
    const yearsDiff = date.getFullYear() - referenceDate.getFullYear();
    return yearsDiff >= 0 && yearsDiff % this.rule.interval === 0;
  }

  private isException(date: Date): boolean {
    if (!this.rule.exceptions) return false;

    return this.rule.exceptions.some(
      (exception) => exception.toDateString() === date.toDateString(),
    );
  }

  // Get next occurrence after a given date
  getNextOccurrence(afterDate: Date, referenceDate: Date): Date | null {
    let currentDate = new Date(afterDate);
    currentDate.setDate(currentDate.getDate() + 1); // Start from next day

    const maxIterations = 1000;
    let iterations = 0;

    while (iterations < maxIterations) {
      if (this.matchesPattern(currentDate, referenceDate)) {
        return currentDate;
      }

      currentDate = this.getNextDate(currentDate);
      iterations++;
    }

    return null; // No next occurrence found
  }

  // Add exception date
  addException(exceptionDate: Date): RecurrencePattern {
    const newExceptions = [...(this.rule.exceptions || []), exceptionDate];
    return new RecurrencePattern({
      ...this.rule,
      exceptions: newExceptions,
    });
  }

  // Get rule details
  getRule(): RecurrenceRule {
    return { ...this.rule };
  }

  // Human readable description
  describe(): string {
    switch (this.rule.type) {
      case RecurrenceType.NONE:
        return "Une seule fois";

      case RecurrenceType.DAILY:
        return this.rule.interval === 1
          ? "Tous les jours"
          : `Tous les ${this.rule.interval} jours`;

      case RecurrenceType.WEEKLY: {
        const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
        const days = this.rule
          .daysOfWeek!.map((day) => dayNames[day])
          .join(", ");
        return this.rule.interval === 1
          ? `Chaque semaine le ${days}`
          : `Toutes les ${this.rule.interval} semaines le ${days}`;
      }

      case RecurrenceType.MONTHLY:
        return this.rule.interval === 1
          ? `Le ${this.rule.dayOfMonth} de chaque mois`
          : `Le ${this.rule.dayOfMonth} tous les ${this.rule.interval} mois`;

      case RecurrenceType.YEARLY: {
        const monthNames = [
          "Janvier",
          "Février",
          "Mars",
          "Avril",
          "Mai",
          "Juin",
          "Juillet",
          "Août",
          "Septembre",
          "Octobre",
          "Novembre",
          "Décembre",
        ];
        return `Le ${this.rule.dayOfMonth} ${monthNames[this.rule.monthOfYear! - 1]} chaque année`;
      }

      default:
        return "Récurrence personnalisée";
    }
  }
}
