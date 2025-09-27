/**
 * 🕐 BusinessHours Value Object
 *
 * Gestion flexible des heures d'ouverture/fermeture :
 * - Heures différentes par jour de la semaine
 * - Support pour jours sans activité (fermé)
 * - Gestion des pauses et horaires complexes
 * - Validation stricte des horaires
 */

export interface TimeSlot {
  start: string; // Format HH:MM (ex: "09:00")
  end: string; // Format HH:MM (ex: "17:30")
  name?: string; // Nom optionnel de la période
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, etc.
  isOpen: boolean; // true = ouvert, false = fermé
  timeSlots: TimeSlot[]; // Créneaux horaires (peut être vide si fermé)
  specialNote?: string; // Note spéciale pour ce jour
}

export interface SpecialDate {
  date: Date;
  isOpen: boolean;
  timeSlots?: TimeSlot[];
  reason: string; // Raison (ex: "Jour férié", "Formation", "Événement spécial")
}

export class BusinessHours {
  private static readonly TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  private static readonly DAY_NAMES = [
    'Dimanche',
    'Lundi',
    'Mardi',
    'Mercredi',
    'Jeudi',
    'Vendredi',
    'Samedi',
  ];

  constructor(
    private readonly weeklySchedule: DaySchedule[],
    private readonly specialDates: SpecialDate[] = [],
    private readonly timezone: string = 'Europe/Paris',
  ) {
    this.validate();
  }

  private validate(): void {
    // Vérifier que nous avons 7 jours
    if (this.weeklySchedule.length !== 7) {
      throw new Error('Weekly schedule must contain exactly 7 days');
    }

    // Vérifier que les jours sont dans l'ordre (0-6)
    for (let i = 0; i < 7; i++) {
      if (this.weeklySchedule[i].dayOfWeek !== i) {
        throw new Error(`Day at index ${i} must have dayOfWeek = ${i}`);
      }
    }

    // Valider chaque jour
    this.weeklySchedule.forEach((day) => this.validateDaySchedule(day));

    // Valider les dates spéciales
    this.specialDates.forEach((special) => this.validateSpecialDate(special));
  }

  private validateDaySchedule(day: DaySchedule): void {
    if (day.dayOfWeek < 0 || day.dayOfWeek > 6) {
      throw new Error('dayOfWeek must be between 0 and 6');
    }

    if (!day.isOpen && day.timeSlots.length > 0) {
      throw new Error('Closed day cannot have time slots');
    }

    if (day.isOpen && day.timeSlots.length === 0) {
      throw new Error('Open day must have at least one time slot');
    }

    // Valider chaque créneau
    day.timeSlots.forEach((slot) => this.validateTimeSlot(slot));

    // Vérifier qu'il n'y a pas de chevauchements
    this.validateNoOverlaps(day.timeSlots);
  }

  private validateTimeSlot(slot: TimeSlot): void {
    if (!BusinessHours.TIME_REGEX.test(slot.start)) {
      throw new Error(`Invalid start time format: ${slot.start}. Use HH:MM`);
    }

    if (!BusinessHours.TIME_REGEX.test(slot.end)) {
      throw new Error(`Invalid end time format: ${slot.end}. Use HH:MM`);
    }

    if (this.timeToMinutes(slot.start) >= this.timeToMinutes(slot.end)) {
      throw new Error(
        `Start time ${slot.start} must be before end time ${slot.end}`,
      );
    }
  }

  private validateSpecialDate(special: SpecialDate): void {
    if (
      special.isOpen &&
      (!special.timeSlots || special.timeSlots.length === 0)
    ) {
      throw new Error('Open special date must have time slots');
    }

    if (!special.isOpen && special.timeSlots && special.timeSlots.length > 0) {
      throw new Error('Closed special date cannot have time slots');
    }

    if (special.timeSlots) {
      special.timeSlots.forEach((slot) => this.validateTimeSlot(slot));
      this.validateNoOverlaps(special.timeSlots);
    }
  }

  private validateNoOverlaps(slots: TimeSlot[]): void {
    const sortedSlots = [...slots].sort(
      (a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start),
    );

    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const current = sortedSlots[i];
      const next = sortedSlots[i + 1];

      if (this.timeToMinutes(current.end) > this.timeToMinutes(next.start)) {
        throw new Error(
          `Time slots overlap: ${current.start}-${current.end} and ${next.start}-${next.end}`,
        );
      }
    }
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Factory methods
  static createStandardWeek(
    openDays: number[], // [1, 2, 3, 4, 5] pour Lun-Ven
    openTime: string = '09:00',
    closeTime: string = '17:00',
    lunchBreak?: { start: string; end: string },
  ): BusinessHours {
    const weeklySchedule: DaySchedule[] = [];

    for (let day = 0; day < 7; day++) {
      if (openDays.includes(day)) {
        let timeSlots: TimeSlot[];

        if (lunchBreak) {
          // Diviser en deux créneaux avec pause déjeuner
          timeSlots = [
            { start: openTime, end: lunchBreak.start, name: 'Matin' },
            { start: lunchBreak.end, end: closeTime, name: 'Après-midi' },
          ];
        } else {
          // Un seul créneau
          timeSlots = [{ start: openTime, end: closeTime }];
        }

        weeklySchedule.push({
          dayOfWeek: day,
          isOpen: true,
          timeSlots,
        });
      } else {
        // Jour fermé
        weeklySchedule.push({
          dayOfWeek: day,
          isOpen: false,
          timeSlots: [],
        });
      }
    }

    return new BusinessHours(weeklySchedule);
  }

  static createAlwaysClosed(): BusinessHours {
    const weeklySchedule: DaySchedule[] = [];
    for (let day = 0; day < 7; day++) {
      weeklySchedule.push({
        dayOfWeek: day,
        isOpen: false,
        timeSlots: [],
      });
    }
    return new BusinessHours(weeklySchedule);
  }

  static create24Hours(openDays: number[]): BusinessHours {
    const schedule = Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      isOpen: openDays.includes(i),
      timeSlots: openDays.includes(i)
        ? [{ start: '00:00', end: '23:59', name: '24h/24' }]
        : [],
    }));

    return new BusinessHours(schedule, [], 'Europe/Paris');
  }

  /**
   * Créer BusinessHours depuis des données de base de données
   */
  static fromDatabaseData(data: {
    weekly_schedule: Record<
      string,
      {
        is_open: boolean;
        time_slots: Array<{
          start_time: string;
          end_time: string;
        }>;
      }
    >;
    special_dates: Array<{
      date: string;
      type: 'CLOSED' | 'SPECIAL_HOURS' | 'HOLIDAY' | 'MAINTENANCE';
      label?: string;
      time_slots?: Array<{
        start_time: string;
        end_time: string;
      }>;
    }>;
    timezone: string;
  }): BusinessHours {
    // Convertir weekly_schedule en DaySchedule[]
    const weeklySchedule: DaySchedule[] = Array.from({ length: 7 }, (_, i) => {
      const dayData = data.weekly_schedule[i.toString()];
      return {
        dayOfWeek: i,
        isOpen: dayData?.is_open || false,
        timeSlots:
          dayData?.time_slots?.map((slot) => ({
            start: slot.start_time,
            end: slot.end_time,
          })) || [],
      };
    });

    // Convertir special_dates en SpecialDate[]
    const specialDates: SpecialDate[] = data.special_dates.map((special) => ({
      date: new Date(special.date),
      isOpen: special.type !== 'CLOSED',
      timeSlots:
        special.time_slots?.map((slot) => ({
          start: slot.start_time,
          end: slot.end_time,
        })) || [],
      reason: special.label || special.type,
    }));

    return new BusinessHours(weeklySchedule, specialDates, data.timezone);
  }

  // Getters
  getWeeklySchedule(): DaySchedule[] {
    return [...this.weeklySchedule];
  }

  getSpecialDates(): SpecialDate[] {
    return [...this.specialDates];
  }

  getTimezone(): string {
    return this.timezone;
  }

  // Business logic
  isOpenOnDay(dayOfWeek: number): boolean {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('dayOfWeek must be between 0 and 6');
    }
    return this.weeklySchedule[dayOfWeek].isOpen;
  }

  isOpenOnDate(date: Date): boolean {
    // Vérifier d'abord les dates spéciales
    const specialDate = this.specialDates.find(
      (special) => special.date.toDateString() === date.toDateString(),
    );

    if (specialDate) {
      return specialDate.isOpen;
    }

    // Sinon, utiliser l'horaire normal
    return this.isOpenOnDay(date.getDay());
  }

  getTimeSlotsForDay(dayOfWeek: number): TimeSlot[] {
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new Error('dayOfWeek must be between 0 and 6');
    }
    return [...this.weeklySchedule[dayOfWeek].timeSlots];
  }

  getTimeSlotsForDate(date: Date): TimeSlot[] {
    // Vérifier d'abord les dates spéciales
    const specialDate = this.specialDates.find(
      (special) => special.date.toDateString() === date.toDateString(),
    );

    if (specialDate) {
      return specialDate.timeSlots ? [...specialDate.timeSlots] : [];
    }

    // Sinon, utiliser l'horaire normal
    return this.getTimeSlotsForDay(date.getDay());
  }

  isOpenAt(date: Date, time: string): boolean {
    if (!BusinessHours.TIME_REGEX.test(time)) {
      throw new Error(`Invalid time format: ${time}. Use HH:MM`);
    }

    const timeSlots = this.getTimeSlotsForDate(date);
    const timeMinutes = this.timeToMinutes(time);

    return timeSlots.some((slot) => {
      const startMinutes = this.timeToMinutes(slot.start);
      const endMinutes = this.timeToMinutes(slot.end);
      return timeMinutes >= startMinutes && timeMinutes < endMinutes;
    });
  }

  getTotalOpenMinutesForDay(dayOfWeek: number): number {
    const timeSlots = this.getTimeSlotsForDay(dayOfWeek);
    return timeSlots.reduce((total, slot) => {
      return (
        total + (this.timeToMinutes(slot.end) - this.timeToMinutes(slot.start))
      );
    }, 0);
  }

  getTotalOpenMinutesForWeek(): number {
    return this.weeklySchedule.reduce((total, day) => {
      return total + this.getTotalOpenMinutesForDay(day.dayOfWeek);
    }, 0);
  }

  getOpenDays(): number[] {
    return this.weeklySchedule
      .filter((day) => day.isOpen)
      .map((day) => day.dayOfWeek);
  }

  getClosedDays(): number[] {
    return this.weeklySchedule
      .filter((day) => !day.isOpen)
      .map((day) => day.dayOfWeek);
  }

  // Modification methods (return new instance for immutability)
  withSpecialDate(specialDate: SpecialDate): BusinessHours {
    const newSpecialDates = [...this.specialDates, specialDate];
    return new BusinessHours(
      this.weeklySchedule,
      newSpecialDates,
      this.timezone,
    );
  }

  withUpdatedDay(
    dayOfWeek: number,
    schedule: Omit<DaySchedule, 'dayOfWeek'>,
  ): BusinessHours {
    const newWeeklySchedule = [...this.weeklySchedule];
    newWeeklySchedule[dayOfWeek] = {
      dayOfWeek,
      ...schedule,
    };
    return new BusinessHours(
      newWeeklySchedule,
      this.specialDates,
      this.timezone,
    );
  }

  withoutSpecialDate(date: Date): BusinessHours {
    const newSpecialDates = this.specialDates.filter(
      (special) => special.date.toDateString() !== date.toDateString(),
    );
    return new BusinessHours(
      this.weeklySchedule,
      newSpecialDates,
      this.timezone,
    );
  }

  // Formatting and display
  formatDay(dayOfWeek: number): string {
    const day = this.weeklySchedule[dayOfWeek];
    const dayName = BusinessHours.DAY_NAMES[dayOfWeek];

    if (!day.isOpen) {
      return `${dayName}: Fermé`;
    }

    const slotsText = day.timeSlots
      .map(
        (slot) =>
          `${slot.start}-${slot.end}${slot.name ? ` (${slot.name})` : ''}`,
      )
      .join(', ');

    return `${dayName}: ${slotsText}`;
  }

  formatWeek(): string {
    return this.weeklySchedule
      .map((day) => this.formatDay(day.dayOfWeek))
      .join('\n');
  }

  formatSpecialDates(): string {
    if (this.specialDates.length === 0) {
      return 'Aucune date spéciale définie';
    }

    return this.specialDates
      .map((special) => {
        const dateStr = special.date.toLocaleDateString('fr-FR');
        if (!special.isOpen) {
          return `${dateStr}: Fermé (${special.reason})`;
        }

        const slotsText =
          special.timeSlots
            ?.map((slot) => `${slot.start}-${slot.end}`)
            .join(', ') || '';

        return `${dateStr}: ${slotsText} (${special.reason})`;
      })
      .join('\n');
  }

  // Statistics
  getAverageOpenHoursPerDay(): number {
    const totalMinutes = this.getTotalOpenMinutesForWeek();
    return Math.round((totalMinutes / 7 / 60) * 100) / 100; // Arrondi à 2 décimales
  }

  getOpenDaysCount(): number {
    return this.getOpenDays().length;
  }

  // Comparison
  equals(other: BusinessHours): boolean {
    if (this.timezone !== other.timezone) return false;

    // Comparer les horaires hebdomadaires
    for (let i = 0; i < 7; i++) {
      const thisDay = this.weeklySchedule[i];
      const otherDay = other.weeklySchedule[i];

      if (thisDay.isOpen !== otherDay.isOpen) return false;
      if (thisDay.timeSlots.length !== otherDay.timeSlots.length) return false;

      for (let j = 0; j < thisDay.timeSlots.length; j++) {
        const thisSlot = thisDay.timeSlots[j];
        const otherSlot = otherDay.timeSlots[j];

        if (
          thisSlot.start !== otherSlot.start ||
          thisSlot.end !== otherSlot.end
        ) {
          return false;
        }
      }
    }

    // Comparer les dates spéciales (simplifié)
    return this.specialDates.length === other.specialDates.length;
  }

  toString(): string {
    return `BusinessHours(${this.getOpenDaysCount()} jours ouverts, ${this.getAverageOpenHoursPerDay()}h/jour en moyenne)`;
  }
}
