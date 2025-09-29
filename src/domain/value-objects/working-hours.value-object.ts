import { InvalidValueError } from '../exceptions/value-object.exceptions';
import { WeekDay } from './time-slot.value-object';

export class WorkingHours {
  constructor(
    private readonly dayOfWeek: WeekDay,
    private readonly startTime: string, // "09:00"
    private readonly endTime: string, // "17:00"
    private readonly isWorkingDay: boolean = true,
    private readonly breaks: {
      start: string;
      end: string;
      name?: string;
    }[] = [],
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.isValidTimeFormat(this.startTime)) {
      throw new InvalidValueError(
        'startTime',
        this.startTime,
        'Invalid start time format. Use HH:MM',
      );
    }

    if (!this.isValidTimeFormat(this.endTime)) {
      throw new InvalidValueError(
        'endTime',
        this.endTime,
        'Invalid end time format. Use HH:MM',
      );
    }

    if (this.isWorkingDay && this.startTime >= this.endTime) {
      throw new InvalidValueError(
        'timeRange',
        `${this.startTime}-${this.endTime}`,
        'Start time must be before end time',
      );
    }

    // Valider les pauses
    this.breaks.forEach((breakTime) => {
      if (
        !this.isValidTimeFormat(breakTime.start) ||
        !this.isValidTimeFormat(breakTime.end)
      ) {
        throw new InvalidValueError(
          'breakTime',
          `${breakTime.start}-${breakTime.end}`,
          'Invalid break time format',
        );
      }

      if (breakTime.start >= breakTime.end) {
        throw new InvalidValueError(
          'breakTime',
          `${breakTime.start}-${breakTime.end}`,
          'Break start time must be before end time',
        );
      }

      if (this.isWorkingDay) {
        if (breakTime.start < this.startTime || breakTime.end > this.endTime) {
          throw new InvalidValueError(
            'breakTime',
            `${breakTime.start}-${breakTime.end}`,
            'Break must be within working hours',
          );
        }
      }
    });
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  static create(
    dayOfWeek: WeekDay,
    startTime: string,
    endTime: string,
    isWorkingDay: boolean = true,
    breaks: { start: string; end: string; name?: string }[] = [],
  ): WorkingHours {
    return new WorkingHours(
      dayOfWeek,
      startTime,
      endTime,
      isWorkingDay,
      breaks,
    );
  }

  // Factory methods for common schedules
  static createNonWorkingDay(dayOfWeek: WeekDay): WorkingHours {
    return new WorkingHours(dayOfWeek, '00:00', '00:00', false, []);
  }

  static createFullDay(
    dayOfWeek: WeekDay,
    startTime: string = '09:00',
    endTime: string = '17:00',
  ): WorkingHours {
    return new WorkingHours(dayOfWeek, startTime, endTime, true, []);
  }

  static createWithLunchBreak(
    dayOfWeek: WeekDay,
    startTime: string = '09:00',
    endTime: string = '17:00',
    lunchStart: string = '12:00',
    lunchEnd: string = '13:00',
  ): WorkingHours {
    const breaks = [{ start: lunchStart, end: lunchEnd, name: 'Lunch' }];
    return new WorkingHours(dayOfWeek, startTime, endTime, true, breaks);
  }

  // Getters
  getDayOfWeek(): WeekDay {
    return this.dayOfWeek;
  }

  getStartTime(): string {
    return this.startTime;
  }

  getEndTime(): string {
    return this.endTime;
  }

  isWorking(): boolean {
    return this.isWorkingDay;
  }

  getBreaks(): { start: string; end: string; name?: string }[] {
    return [...this.breaks];
  }

  // Business logic
  getTotalWorkingMinutes(): number {
    if (!this.isWorkingDay) return 0;

    const startMinutes = this.timeStringToMinutes(this.startTime);
    const endMinutes = this.timeStringToMinutes(this.endTime);
    let totalMinutes = endMinutes - startMinutes;

    // Soustraire les pauses
    this.breaks.forEach((breakTime) => {
      const breakStart = this.timeStringToMinutes(breakTime.start);
      const breakEnd = this.timeStringToMinutes(breakTime.end);
      totalMinutes -= breakEnd - breakStart;
    });

    return Math.max(0, totalMinutes);
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTimeString(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Generate time slots for this working day
  generateTimeSlots(
    date: Date,
    slotDuration: number = 30, // minutes
    bufferTime: number = 0, // minutes between slots
  ): Date[] {
    if (!this.isWorkingDay) return [];

    const slots: Date[] = [];
    const startMinutes = this.timeStringToMinutes(this.startTime);
    const endMinutes = this.timeStringToMinutes(this.endTime);

    for (
      let minutes = startMinutes;
      minutes < endMinutes;
      minutes += slotDuration + bufferTime
    ) {
      // Vérifier si le créneau chevauche avec une pause
      const slotEndMinutes = minutes + slotDuration;
      const overlapsBreak = this.breaks.some((breakTime) => {
        const breakStart = this.timeStringToMinutes(breakTime.start);
        const breakEnd = this.timeStringToMinutes(breakTime.end);
        return minutes < breakEnd && slotEndMinutes > breakStart;
      });

      if (!overlapsBreak && slotEndMinutes <= endMinutes) {
        const slotDate = new Date(date);
        slotDate.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
        slots.push(slotDate);
      }
    }

    return slots;
  }

  // Check if a specific time is within working hours
  isTimeWithinWorkingHours(time: string): boolean {
    if (!this.isWorkingDay) return false;

    const timeMinutes = this.timeStringToMinutes(time);
    const startMinutes = this.timeStringToMinutes(this.startTime);
    const endMinutes = this.timeStringToMinutes(this.endTime);

    if (timeMinutes < startMinutes || timeMinutes >= endMinutes) {
      return false;
    }

    // Vérifier si le temps est pendant une pause
    return !this.breaks.some((breakTime) => {
      const breakStart = this.timeStringToMinutes(breakTime.start);
      const breakEnd = this.timeStringToMinutes(breakTime.end);
      return timeMinutes >= breakStart && timeMinutes < breakEnd;
    });
  }

  // Get available time ranges (excluding breaks)
  getAvailableTimeRanges(): { start: string; end: string }[] {
    if (!this.isWorkingDay) return [];

    if (this.breaks.length === 0) {
      return [{ start: this.startTime, end: this.endTime }];
    }

    const ranges: { start: string; end: string }[] = [];
    const sortedBreaks = [...this.breaks].sort(
      (a, b) =>
        this.timeStringToMinutes(a.start) - this.timeStringToMinutes(b.start),
    );

    let currentStart = this.startTime;

    sortedBreaks.forEach((breakTime) => {
      if (currentStart < breakTime.start) {
        ranges.push({ start: currentStart, end: breakTime.start });
      }
      currentStart = breakTime.end;
    });

    if (currentStart < this.endTime) {
      ranges.push({ start: currentStart, end: this.endTime });
    }

    return ranges;
  }

  // Formatting
  format(): string {
    if (!this.isWorkingDay) {
      return 'Fermé';
    }

    let result = `${this.startTime} - ${this.endTime}`;

    if (this.breaks.length > 0) {
      const breakStrings = this.breaks.map(
        (b) => `${b.name || 'Pause'}: ${b.start}-${b.end}`,
      );
      result += ` (${breakStrings.join(', ')})`;
    }

    return result;
  }

  toString(): string {
    const dayNames = [
      'Dimanche',
      'Lundi',
      'Mardi',
      'Mercredi',
      'Jeudi',
      'Vendredi',
      'Samedi',
    ];
    return `${dayNames[this.dayOfWeek]}: ${this.format()}`;
  }
}
