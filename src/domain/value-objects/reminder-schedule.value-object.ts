/**
 * 📅 REMINDER SCHEDULE VALUE OBJECT - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Gestion des planifications de rappels (unique ou récurrent)
 */

export enum ReminderFrequency {
  ONCE = "ONCE",
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
}

export interface ScheduleParams {
  readonly frequency: ReminderFrequency;
  readonly appointmentStartTime: Date;
  readonly reminderOffsetHours: number; // Heures avant le RDV
  readonly maxReminders?: number; // Limite pour les récurrents
}

export class ReminderSchedule {
  private readonly _frequency: ReminderFrequency;
  private readonly _appointmentStartTime: Date;
  private readonly _reminderOffsetHours: number;
  private readonly _maxReminders: number;
  private _executionCount: number;

  private constructor(
    frequency: ReminderFrequency,
    appointmentStartTime: Date,
    reminderOffsetHours: number,
    maxReminders: number = 1,
    executionCount: number = 0,
  ) {
    this._frequency = frequency;
    this._appointmentStartTime = appointmentStartTime;
    this._reminderOffsetHours = reminderOffsetHours;
    this._maxReminders = maxReminders;
    this._executionCount = executionCount;
  }

  static create(params: ScheduleParams): ReminderSchedule {
    // Validation
    if (params.reminderOffsetHours < 0) {
      throw new Error("L'offset de rappel ne peut pas être négatif");
    }

    if (params.reminderOffsetHours > 168) {
      // 7 jours max
      throw new Error(
        "L'offset de rappel ne peut pas dépasser 168 heures (7 jours)",
      );
    }

    if (params.appointmentStartTime <= new Date()) {
      throw new Error("La date de rendez-vous doit être dans le futur");
    }

    const maxReminders = params.maxReminders || 1;
    if (maxReminders < 1) {
      throw new Error("Le nombre maximum de rappels doit être au moins 1");
    }

    return new ReminderSchedule(
      params.frequency,
      params.appointmentStartTime,
      params.reminderOffsetHours,
      maxReminders,
      0,
    );
  }

  /**
   * Crée un rappel unique (par défaut)
   */
  static createOnce(
    appointmentStartTime: Date,
    reminderOffsetHours: number,
  ): ReminderSchedule {
    return ReminderSchedule.create({
      frequency: ReminderFrequency.ONCE,
      appointmentStartTime,
      reminderOffsetHours,
      maxReminders: 1,
    });
  }

  /**
   * Crée des rappels multiples (24h, 2h, 30min avant)
   */
  static createMultipleReminders(
    appointmentStartTime: Date,
  ): ReminderSchedule[] {
    const reminders: ReminderSchedule[] = [];

    // 24h avant
    if (this.isValidOffset(appointmentStartTime, 24)) {
      reminders.push(ReminderSchedule.createOnce(appointmentStartTime, 24));
    }

    // 2h avant
    if (this.isValidOffset(appointmentStartTime, 2)) {
      reminders.push(ReminderSchedule.createOnce(appointmentStartTime, 2));
    }

    // 30min avant
    if (this.isValidOffset(appointmentStartTime, 0.5)) {
      reminders.push(ReminderSchedule.createOnce(appointmentStartTime, 0.5));
    }

    return reminders;
  }

  private static isValidOffset(
    appointmentTime: Date,
    offsetHours: number,
  ): boolean {
    const reminderTime = new Date(
      appointmentTime.getTime() - offsetHours * 60 * 60 * 1000,
    );
    return reminderTime > new Date();
  }

  /**
   * Calcule la prochaine date d'exécution
   */
  calculateNextExecution(): Date | null {
    // Si on a atteint le maximum d'exécutions
    if (this._executionCount >= this._maxReminders) {
      return null;
    }

    const baseReminderTime = new Date(
      this._appointmentStartTime.getTime() -
        this._reminderOffsetHours * 60 * 60 * 1000,
    );

    switch (this._frequency) {
      case ReminderFrequency.ONCE:
        return this._executionCount === 0 ? baseReminderTime : null;

      case ReminderFrequency.HOURLY:
        return new Date(
          baseReminderTime.getTime() + this._executionCount * 60 * 60 * 1000,
        );

      case ReminderFrequency.DAILY:
        return new Date(
          baseReminderTime.getTime() +
            this._executionCount * 24 * 60 * 60 * 1000,
        );

      case ReminderFrequency.WEEKLY:
        return new Date(
          baseReminderTime.getTime() +
            this._executionCount * 7 * 24 * 60 * 60 * 1000,
        );

      default:
        return null;
    }
  }

  /**
   * Marque une exécution comme réalisée
   */
  markExecuted(): void {
    this._executionCount++;
  }

  /**
   * Vérifie si le schedule est récurrent
   */
  isRecurring(): boolean {
    return this._frequency !== ReminderFrequency.ONCE && this._maxReminders > 1;
  }

  /**
   * Vérifie si le schedule est terminé
   */
  isCompleted(): boolean {
    return this._executionCount >= this._maxReminders;
  }

  /**
   * Obtient le temps restant avant le prochain rappel
   */
  getTimeUntilNextExecution(): number | null {
    const nextExecution = this.calculateNextExecution();
    if (!nextExecution) {
      return null;
    }

    return nextExecution.getTime() - Date.now();
  }

  /**
   * Reconstruction depuis persistence
   */
  static reconstruct(data: {
    frequency: string;
    appointmentStartTime: Date;
    reminderOffsetHours: number;
    maxReminders: number;
    executionCount: number;
  }): ReminderSchedule {
    const frequency =
      Object.values(ReminderFrequency).find(
        (f) => f.toString() === data.frequency?.toString(),
      ) || ReminderFrequency.ONCE;

    return new ReminderSchedule(
      frequency,
      data.appointmentStartTime,
      data.reminderOffsetHours,
      data.maxReminders,
      data.executionCount,
    );
  }

  // === GETTERS ===
  getFrequency(): ReminderFrequency {
    return this._frequency;
  }
  getAppointmentStartTime(): Date {
    return this._appointmentStartTime;
  }
  getReminderOffsetHours(): number {
    return this._reminderOffsetHours;
  }
  getMaxReminders(): number {
    return this._maxReminders;
  }
  getExecutionCount(): number {
    return this._executionCount;
  }

  // === MÉTHODES UTILITAIRES ===

  equals(other: ReminderSchedule): boolean {
    return (
      this._frequency === other._frequency &&
      this._appointmentStartTime.getTime() ===
        other._appointmentStartTime.getTime() &&
      this._reminderOffsetHours === other._reminderOffsetHours &&
      this._maxReminders === other._maxReminders
    );
  }

  toString(): string {
    return `${this._frequency} - ${this._reminderOffsetHours}h before appointment`;
  }

  toJSON(): Record<string, any> {
    return {
      frequency: this._frequency,
      appointmentStartTime: this._appointmentStartTime.toISOString(),
      reminderOffsetHours: this._reminderOffsetHours,
      maxReminders: this._maxReminders,
      executionCount: this._executionCount,
    };
  }
}
