/**
 * 📅 APPOINTMENT REMINDER ENTITY - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Gestion des rappels pour différents acteurs
 */

import { AppointmentId } from "../value-objects/appointment-id.value-object";
import { UserId } from "../value-objects/user-id.value-object";
import { BusinessId } from "../value-objects/business-id.value-object";
import { NotificationChannel } from "../value-objects/notification-channel.value-object";
import { NotificationPriority } from "../value-objects/notification-priority.value-object";
import { ReminderSchedule } from "../value-objects/reminder-schedule.value-object";
import { ActorType } from "../value-objects/actor-type.value-object";
import { DomainError } from "./base/domain-error";

export interface CreateAppointmentReminderParams {
  readonly appointmentId: AppointmentId;
  readonly actorId: UserId;
  readonly actorType: ActorType;
  readonly businessId: BusinessId;
  readonly reminderSchedule: ReminderSchedule;
  readonly channels: NotificationChannel[];
  readonly priority: NotificationPriority;
  readonly createdBy: string;
}

export interface ReminderExecutionResult {
  readonly success: boolean;
  readonly channelResults: {
    readonly channel: NotificationChannel;
    readonly success: boolean;
    readonly messageId?: string;
    readonly error?: string;
  }[];
  readonly executedAt: Date;
  readonly nextScheduledAt?: Date;
}

export class AppointmentReminder {
  private constructor(
    private readonly _id: string,
    private readonly _appointmentId: AppointmentId,
    private readonly _actorId: UserId,
    private readonly _actorType: ActorType,
    private readonly _businessId: BusinessId,
    private _reminderSchedule: ReminderSchedule,
    private _channels: NotificationChannel[],
    private _priority: NotificationPriority,
    private _isActive: boolean,
    private _executionHistory: ReminderExecutionResult[],
    private _nextScheduledAt: Date | null,
    private readonly _createdBy: string,
    private _updatedBy: string,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(params: CreateAppointmentReminderParams): AppointmentReminder {
    // Validation métier
    if (params.channels.length === 0) {
      throw new DomainError("Au moins un canal de notification est requis");
    }

    // Calcul de la première exécution programmée
    const nextScheduledAt = params.reminderSchedule.calculateNextExecution();

    if (nextScheduledAt && nextScheduledAt <= new Date()) {
      throw new DomainError("La date de rappel doit être dans le futur");
    }

    const now = new Date();
    return new AppointmentReminder(
      this.generateId(),
      params.appointmentId,
      params.actorId,
      params.actorType,
      params.businessId,
      params.reminderSchedule,
      params.channels,
      params.priority,
      true, // isActive par défaut
      [], // executionHistory vide
      nextScheduledAt,
      params.createdBy,
      params.createdBy, // updatedBy = createdBy initialement
      now,
      now,
    );
  }

  // Méthode de reconstruction depuis persistence
  static reconstruct(data: {
    id: string;
    appointmentId: AppointmentId;
    actorId: UserId;
    actorType: ActorType;
    businessId: BusinessId;
    reminderSchedule: ReminderSchedule;
    channels: NotificationChannel[];
    priority: NotificationPriority;
    isActive: boolean;
    executionHistory: ReminderExecutionResult[];
    nextScheduledAt: Date | null;
    createdBy: string;
    updatedBy: string;
    createdAt: Date;
    updatedAt: Date;
  }): AppointmentReminder {
    return new AppointmentReminder(
      data.id,
      data.appointmentId,
      data.actorId,
      data.actorType,
      data.businessId,
      data.reminderSchedule,
      data.channels,
      data.priority,
      data.isActive,
      data.executionHistory,
      data.nextScheduledAt,
      data.createdBy,
      data.updatedBy,
      data.createdAt,
      data.updatedAt,
    );
  }

  // === MÉTHODES MÉTIER ===

  /**
   * Marque le rappel comme exécuté et planifie le suivant si nécessaire
   */
  markAsExecuted(result: ReminderExecutionResult, updatedBy: string): void {
    if (!this._isActive) {
      throw new DomainError("Impossible d'exécuter un rappel inactif");
    }

    // Ajouter à l'historique
    this._executionHistory.push(result);

    // Calculer la prochaine exécution si récurrent
    if (this._reminderSchedule.isRecurring()) {
      this._nextScheduledAt = this._reminderSchedule.calculateNextExecution();
    } else {
      this._nextScheduledAt = null;
      this._isActive = false; // Désactiver si unique
    }

    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Annule le rappel
   */
  cancel(updatedBy: string): void {
    if (!this._isActive) {
      throw new DomainError("Le rappel est déjà inactif");
    }

    this._isActive = false;
    this._nextScheduledAt = null;
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Met à jour la planification du rappel
   */
  updateSchedule(newSchedule: ReminderSchedule, updatedBy: string): void {
    if (!this._isActive) {
      throw new DomainError("Impossible de modifier un rappel inactif");
    }

    this._reminderSchedule = newSchedule;
    this._nextScheduledAt = newSchedule.calculateNextExecution();
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Met à jour les canaux de notification
   */
  updateChannels(newChannels: NotificationChannel[], updatedBy: string): void {
    if (newChannels.length === 0) {
      throw new DomainError("Au moins un canal de notification est requis");
    }

    this._channels = [...newChannels];
    this._updatedBy = updatedBy;
    this._updatedAt = new Date();
  }

  /**
   * Vérifie si le rappel doit être exécuté maintenant
   */
  shouldExecuteNow(): boolean {
    if (!this._isActive || !this._nextScheduledAt) {
      return false;
    }

    return this._nextScheduledAt <= new Date();
  }

  /**
   * Obtient les données contextuelles pour l'exécution
   */
  getExecutionContext(): {
    appointmentId: string;
    actorId: string;
    actorType: string;
    businessId: string;
    channels: string[];
    priority: string;
  } {
    return {
      appointmentId: this._appointmentId.getValue(),
      actorId: this._actorId.getValue(),
      actorType: this._actorType.getValue(),
      businessId: this._businessId.getValue(),
      channels: this._channels.map((c) => c.getValue()),
      priority: this._priority.getValue(),
    };
  }

  // === GETTERS ===
  getId(): string {
    return this._id;
  }
  getAppointmentId(): AppointmentId {
    return this._appointmentId;
  }
  getActorId(): UserId {
    return this._actorId;
  }
  getActorType(): ActorType {
    return this._actorType;
  }
  getBusinessId(): BusinessId {
    return this._businessId;
  }
  getReminderSchedule(): ReminderSchedule {
    return this._reminderSchedule;
  }
  getChannels(): NotificationChannel[] {
    return [...this._channels];
  }
  getPriority(): NotificationPriority {
    return this._priority;
  }
  isActive(): boolean {
    return this._isActive;
  }
  getExecutionHistory(): ReminderExecutionResult[] {
    return [...this._executionHistory];
  }
  getNextScheduledAt(): Date | null {
    return this._nextScheduledAt;
  }
  getCreatedBy(): string {
    return this._createdBy;
  }
  getUpdatedBy(): string {
    return this._updatedBy;
  }
  getCreatedAt(): Date {
    return this._createdAt;
  }
  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  // === PRIVATE METHODS ===
  private static generateId(): string {
    return `reminder_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  // === VALIDATION ===
  private validateForExecution(): void {
    if (!this._isActive) {
      throw new DomainError("Le rappel n'est pas actif");
    }

    if (!this.shouldExecuteNow()) {
      throw new DomainError("Le rappel n'est pas encore prêt à être exécuté");
    }
  }

  // === MÉTHODES UTILITAIRES ===

  /**
   * Convertit l'entité en objet plain pour serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this._id,
      appointmentId: this._appointmentId.getValue(),
      actorId: this._actorId.getValue(),
      actorType: this._actorType.getValue(),
      businessId: this._businessId.getValue(),
      reminderSchedule: this._reminderSchedule.toJSON(),
      channels: this._channels.map((c) => c.getValue()),
      priority: this._priority.getValue(),
      isActive: this._isActive,
      executionHistory: this._executionHistory,
      nextScheduledAt: this._nextScheduledAt?.toISOString() || null,
      createdBy: this._createdBy,
      updatedBy: this._updatedBy,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
    };
  }
}
