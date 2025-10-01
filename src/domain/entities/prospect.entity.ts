/**
 * 🎯 PROSPECT ENTITY - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Représente un prospect commercial pour l'éditeur SaaS
 */

import { Email } from '@domain/value-objects/email.value-object';
import { Phone } from '@domain/value-objects/phone.value-object';
import { Money } from '@domain/value-objects/money.value-object';
import { ProspectId } from '@domain/value-objects/prospect-id.value-object';
import { UserId } from '@domain/value-objects/user-id.value-object';
import { ProspectStatus } from '@domain/value-objects/prospect-status.value-object';
import { BusinessSizeEnum } from '@domain/enums/business-size.enum';
import { ProspectValidationError } from '@domain/exceptions/prospect.exceptions';

export interface CreateProspectParams {
  readonly businessName: string;
  readonly contactEmail: string;
  readonly contactPhone: string;
  readonly contactName: string;
  readonly assignedSalesRep: string;
  readonly estimatedValue: number;
  readonly currency: string;
  readonly notes?: string;
  readonly source?: string;
  readonly businessSize?: BusinessSizeEnum;
  readonly staffCount?: number;
  readonly currentSolution?: string;
}

export interface ReconstructProspectParams {
  readonly id: ProspectId;
  readonly businessName: string;
  readonly contactEmail: Email;
  readonly contactPhone: Phone;
  readonly contactName: string;
  readonly status: ProspectStatus;
  readonly assignedSalesRep: UserId;
  readonly estimatedValue: Money;
  readonly notes: string;
  readonly source: string;
  readonly businessSize: BusinessSizeEnum;
  readonly staffCount: number;
  readonly currentSolution?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly convertedAt?: Date;
}

export class Prospect {
  private constructor(
    private readonly _id: ProspectId,
    private _businessName: string,
    private readonly _contactEmail: Email,
    private _contactPhone: Phone,
    private _contactName: string,
    private _status: ProspectStatus,
    private _assignedSalesRep: UserId,
    private _estimatedValue: Money,
    private _notes: string,
    private readonly _source: string,
    private _businessSize: BusinessSizeEnum,
    private _staffCount: number,
    private _currentSolution: string | undefined,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _convertedAt: Date | undefined,
  ) {
    this.validateProspect();
  }

  /**
   * 🆕 Factory method pour créer un nouveau prospect
   */
  static create(params: CreateProspectParams): Prospect {
    if (!params.businessName?.trim()) {
      throw new ProspectValidationError('Business name is required');
    }

    if (!params.contactName?.trim()) {
      throw new ProspectValidationError('Contact name is required');
    }

    if (params.estimatedValue < 0) {
      throw new ProspectValidationError('Estimated value must be positive');
    }

    const now = new Date();

    return new Prospect(
      ProspectId.generate(),
      params.businessName.trim(),
      Email.create(params.contactEmail),
      Phone.create(params.contactPhone),
      params.contactName.trim(),
      ProspectStatus.lead(),
      UserId.create(params.assignedSalesRep),
      Money.create(params.estimatedValue, params.currency || 'EUR'),
      params.notes?.trim() || '',
      params.source || 'DIRECT',
      params.businessSize || BusinessSizeEnum.SMALL,
      params.staffCount || 1,
      params.currentSolution,
      now,
      now,
      undefined,
    );
  }

  /**
   * 🔄 Factory method pour reconstruire depuis persistence
   */
  static reconstruct(params: ReconstructProspectParams): Prospect {
    return new Prospect(
      params.id,
      params.businessName,
      params.contactEmail,
      params.contactPhone,
      params.contactName,
      params.status,
      params.assignedSalesRep,
      params.estimatedValue,
      params.notes,
      params.source,
      params.businessSize,
      params.staffCount,
      params.currentSolution,
      params.createdAt,
      params.updatedAt,
      params.convertedAt,
    );
  }

  /**
   * 📞 Assigner le prospect à un commercial
   */
  assignTo(salesRepId: UserId): void {
    if (!salesRepId?.getValue()) {
      throw new ProspectValidationError('Sales rep ID is required');
    }

    this._assignedSalesRep = salesRepId;
    this._updatedAt = new Date();
  }

  /**
   * 📈 Changer le statut du prospect
   */
  updateStatus(newStatus: ProspectStatus): void {
    if (!newStatus) {
      throw new ProspectValidationError('Status is required');
    }

    // Règle métier : Vérifier les transitions de statut autorisées
    if (!this._status.canTransitionTo(newStatus)) {
      throw new ProspectValidationError(
        `Cannot transition from ${this._status.getValue()} to ${newStatus.getValue()}`,
      );
    }

    const previousStatus = this._status;
    this._status = newStatus;
    this._updatedAt = new Date();

    // Si conversion en client, marquer la date
    if (newStatus.isClosedWon()) {
      this._convertedAt = new Date();
    }
  }

  /**
   * 📝 Ajouter une note commerciale
   */
  addNote(note: string): void {
    if (!note?.trim()) {
      throw new ProspectValidationError('Note cannot be empty');
    }

    const timestamp = new Date().toISOString();
    this._notes += `\n[${timestamp}] ${note.trim()}`;
    this._updatedAt = new Date();
  }

  /**
   * 💰 Mettre à jour la valeur estimée
   */
  updateEstimatedValue(amount: number, currency?: string): void {
    if (amount < 0) {
      throw new ProspectValidationError('Estimated value must be positive');
    }

    this._estimatedValue = Money.create(
      amount,
      currency || this._estimatedValue.getCurrency(),
    );
    this._updatedAt = new Date();
  }

  /**
   * 👥 Mettre à jour le nombre de personnel
   */
  updateStaffCount(staffCount: number): void {
    if (staffCount < 1) {
      throw new ProspectValidationError('Staff count must be at least 1');
    }

    this._staffCount = staffCount;
    this._businessSize = this.calculateBusinessSize(staffCount);
    this._updatedAt = new Date();
  }

  /**
   * 📊 Calculer la taille d'entreprise basée sur le nombre de personnel
   */
  private calculateBusinessSize(staffCount: number): BusinessSizeEnum {
    if (staffCount <= 5) return BusinessSizeEnum.SMALL;
    if (staffCount <= 20) return BusinessSizeEnum.MEDIUM;
    if (staffCount <= 100) return BusinessSizeEnum.LARGE;
    return BusinessSizeEnum.ENTERPRISE;
  }

  /**
   * ✅ Validation métier du prospect
   */
  private validateProspect(): void {
    if (!this._businessName?.trim()) {
      throw new ProspectValidationError('Business name is required');
    }

    if (!this._contactName?.trim()) {
      throw new ProspectValidationError('Contact name is required');
    }

    if (this._staffCount < 1) {
      throw new ProspectValidationError('Staff count must be at least 1');
    }
  }

  /**
   * 🎯 Calculer le prix mensuel estimé basé sur le nombre de personnel
   */
  getEstimatedMonthlyPrice(): Money {
    const basePrice = 29; // Prix de base par utilisateur
    let pricePerUser = basePrice;

    // Remises selon la taille
    switch (this._businessSize) {
      case BusinessSizeEnum.SMALL:
        pricePerUser = basePrice; // Pas de remise
        break;
      case BusinessSizeEnum.MEDIUM:
        pricePerUser = basePrice * 0.9; // 10% de remise
        break;
      case BusinessSizeEnum.LARGE:
        pricePerUser = basePrice * 0.8; // 20% de remise
        break;
      case BusinessSizeEnum.ENTERPRISE:
        pricePerUser = basePrice * 0.7; // 30% de remise
        break;
    }

    const monthlyAmount = pricePerUser * this._staffCount;
    return Money.create(monthlyAmount, this._estimatedValue.getCurrency());
  }

  /**
   * 📊 Calculer le potentiel annuel
   */
  getAnnualRevenuePotential(): Money {
    const monthlyPrice = this.getEstimatedMonthlyPrice();
    return Money.create(
      monthlyPrice.getAmount() * 12,
      monthlyPrice.getCurrency(),
    );
  }

  /**
   * 🎯 Vérifier si le prospect est chaud (high priority)
   */
  isHotProspect(): boolean {
    return (
      this._status.isInProgress() &&
      this._staffCount >= 10 &&
      this._estimatedValue.getAmount() >= 1000
    );
  }

  // Getters
  getId(): ProspectId {
    return this._id;
  }

  getBusinessName(): string {
    return this._businessName;
  }

  getContactEmail(): Email {
    return this._contactEmail;
  }

  getContactPhone(): Phone {
    return this._contactPhone;
  }

  getContactName(): string {
    return this._contactName;
  }

  getStatus(): ProspectStatus {
    return this._status;
  }

  getAssignedSalesRep(): UserId {
    return this._assignedSalesRep;
  }

  getEstimatedValue(): Money {
    return this._estimatedValue;
  }

  getNotes(): string {
    return this._notes;
  }

  getSource(): string {
    return this._source;
  }

  getBusinessSize(): BusinessSizeEnum {
    return this._businessSize;
  }

  getStaffCount(): number {
    return this._staffCount;
  }

  getCurrentSolution(): string | undefined {
    return this._currentSolution;
  }

  getCreatedAt(): Date {
    return this._createdAt;
  }

  getUpdatedAt(): Date {
    return this._updatedAt;
  }

  getConvertedAt(): Date | undefined {
    return this._convertedAt;
  }

  /**
   * 🔄 Conversion pour serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this._id.getValue(),
      businessName: this._businessName,
      contactEmail: this._contactEmail.getValue(),
      contactPhone: this._contactPhone.getValue(),
      contactName: this._contactName,
      status: this._status.getValue(),
      assignedSalesRep: this._assignedSalesRep.getValue(),
      estimatedValue: this._estimatedValue.toJSON(),
      notes: this._notes,
      source: this._source,
      businessSize: this._businessSize,
      staffCount: this._staffCount,
      currentSolution: this._currentSolution,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      convertedAt: this._convertedAt?.toISOString(),
      estimatedMonthlyPrice: this.getEstimatedMonthlyPrice().toJSON(),
      annualRevenuePotential: this.getAnnualRevenuePotential().toJSON(),
      isHotProspect: this.isHotProspect(),
    };
  }
}
