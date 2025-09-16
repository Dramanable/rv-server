export enum TimeSlotStatus {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  BLOCKED = 'BLOCKED',
  MAINTENANCE = 'MAINTENANCE'
}

export enum RecurrenceType {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

export enum WeekDay {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

export class TimeSlot {
  constructor(
    private readonly startTime: Date,
    private readonly endTime: Date,
    private readonly status: TimeSlotStatus = TimeSlotStatus.AVAILABLE,
    private readonly metadata?: {
      appointmentId?: string;
      reason?: string;
      isBreak?: boolean;
      isLunch?: boolean;
    }
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.startTime >= this.endTime) {
      throw new Error('Start time must be before end time');
    }

    const diffMinutes = (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
    if (diffMinutes < 5) {
      throw new Error('Time slot must be at least 5 minutes');
    }

    if (diffMinutes > 480) { // 8 heures max
      throw new Error('Time slot cannot exceed 8 hours');
    }
  }

  static create(startTime: Date, endTime: Date, status?: TimeSlotStatus): TimeSlot {
    return new TimeSlot(startTime, endTime, status);
  }

  // Getters
  getStartTime(): Date {
    return new Date(this.startTime);
  }

  getEndTime(): Date {
    return new Date(this.endTime);
  }

  getStatus(): TimeSlotStatus {
    return this.status;
  }

  getDurationMinutes(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60);
  }

  getMetadata(): any {
    return this.metadata ? { ...this.metadata } : undefined;
  }

  // Business logic
  isAvailable(): boolean {
    return this.status === TimeSlotStatus.AVAILABLE;
  }

  isBooked(): boolean {
    return this.status === TimeSlotStatus.BOOKED;
  }

  isBlocked(): boolean {
    return this.status === TimeSlotStatus.BLOCKED || this.status === TimeSlotStatus.MAINTENANCE;
  }

  overlaps(other: TimeSlot): boolean {
    return this.startTime < other.endTime && other.startTime < this.endTime;
  }

  contains(dateTime: Date): boolean {
    return dateTime >= this.startTime && dateTime < this.endTime;
  }

  canFit(duration: number): boolean {
    return this.isAvailable() && this.getDurationMinutes() >= duration;
  }

  // Operations
  split(splitTime: Date): TimeSlot[] {
    if (!this.contains(splitTime)) {
      throw new Error('Split time must be within the time slot');
    }

    if (splitTime.getTime() === this.startTime.getTime() || 
        splitTime.getTime() === this.endTime.getTime()) {
      return [this];
    }

    return [
      new TimeSlot(this.startTime, splitTime, this.status, this.metadata),
      new TimeSlot(splitTime, this.endTime, this.status, this.metadata)
    ];
  }

  merge(other: TimeSlot): TimeSlot {
    if (!this.canMerge(other)) {
      throw new Error('Time slots cannot be merged');
    }

    const newStart = this.startTime < other.startTime ? this.startTime : other.startTime;
    const newEnd = this.endTime > other.endTime ? this.endTime : other.endTime;

    return new TimeSlot(newStart, newEnd, this.status, this.metadata);
  }

  canMerge(other: TimeSlot): boolean {
    return this.status === other.status && 
           (this.overlaps(other) || this.isAdjacent(other));
  }

  private isAdjacent(other: TimeSlot): boolean {
    return this.endTime.getTime() === other.startTime.getTime() ||
           other.endTime.getTime() === this.startTime.getTime();
  }

  // Formatting
  format(): string {
    const start = this.startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const end = this.endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return `${start} - ${end}`;
  }

  toString(): string {
    return `TimeSlot(${this.format()}, ${this.status})`;
  }
}
