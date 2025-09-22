import { BusinessId } from '../value-objects/business-id.value-object';
import { FileUrl } from '../value-objects/file-url.value-object';
import { Money } from '../value-objects/money.value-object';
import { ServiceId } from '../value-objects/service-id.value-object';
import { UserId } from '../value-objects/user-id.value-object';
import { PricingConfig } from '../value-objects/pricing-config.value-object';

export enum ServiceCategory {
  CONSULTATION = 'CONSULTATION',
  TREATMENT = 'TREATMENT',
  PROCEDURE = 'PROCEDURE',
  EXAMINATION = 'EXAMINATION',
  THERAPY = 'THERAPY',
  MAINTENANCE = 'MAINTENANCE',
  EMERGENCY = 'EMERGENCY',
  FOLLOWUP = 'FOLLOWUP',
  OTHER = 'OTHER',
}

export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT',
}

// ServicePricing remplacé par PricingConfig pour plus de flexibilité
export interface ServicePackage {
  name: string;
  sessions: number;
  price: Money;
  validityDays: number;
}

export interface ServiceRequirements {
  preparationInstructions?: string;
  contraindications?: string[];
  requiredDocuments?: string[];
  minimumAge?: number;
  maximumAge?: number;
  specialRequirements?: string;
}

export interface ServiceScheduling {
  duration: number; // en minutes
  bufferTimeBefore?: number; // temps de préparation
  bufferTimeAfter?: number; // temps de nettoyage
  allowOnlineBooking: boolean;
  requiresApproval: boolean;
  advanceBookingLimit?: number; // jours à l'avance
  cancellationDeadline?: number; // heures avant
}

export class Service {
  constructor(
    private readonly _id: ServiceId,
    private readonly _businessId: BusinessId,
    private readonly _name: string,
    private readonly _description: string,
    private readonly _category: ServiceCategory,
    private readonly _pricingConfig: PricingConfig,
    private readonly _scheduling: ServiceScheduling,
    private _requirements?: ServiceRequirements,
    private readonly _imageUrl?: FileUrl,
    private _assignedStaffIds: UserId[] = [],
    private _packages: ServicePackage[] = [],
    private _status: ServiceStatus = ServiceStatus.DRAFT,
    private readonly _createdAt: Date = new Date(),
    private _updatedAt: Date = new Date(),
  ) {}

  // Getters
  get id(): ServiceId {
    return this._id;
  }

  get businessId(): BusinessId {
    return this._businessId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get category(): ServiceCategory {
    return this._category;
  }

  get pricingConfig(): PricingConfig {
    return this._pricingConfig;
  }

  get packages(): readonly ServicePackage[] {
    return this._packages;
  }

  get scheduling(): ServiceScheduling {
    return this._scheduling;
  }

  get requirements(): ServiceRequirements | undefined {
    return this._requirements;
  }

  get imageUrl(): FileUrl | undefined {
    return this._imageUrl;
  }

  get assignedStaffIds(): UserId[] {
    return [...this._assignedStaffIds];
  }

  get status(): ServiceStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Factory method
  static create(data: {
    businessId: BusinessId;
    name: string;
    description: string;
    category: ServiceCategory;
    basePrice: number;
    currency: string;
    duration: number;
    allowOnlineBooking?: boolean;
    requiresApproval?: boolean;
    assignedStaffIds?: UserId[];
  }): Service {
    const pricingConfig = PricingConfig.createFixed(
      Money.create(data.basePrice, data.currency),
    );

    const scheduling: ServiceScheduling = {
      duration: data.duration,
      allowOnlineBooking: data.allowOnlineBooking ?? true,
      requiresApproval: data.requiresApproval ?? false,
    };

    return new Service(
      ServiceId.generate(),
      data.businessId,
      data.name,
      data.description,
      data.category,
      pricingConfig,
      scheduling,
      undefined,
      undefined,
      data.assignedStaffIds || [],
    );
  }

  // Business rules
  public isActive(): boolean {
    return this._status === ServiceStatus.ACTIVE;
  }

  public isBookable(): boolean {
    return this.isActive() && this._scheduling.allowOnlineBooking;
  }

  public canBeBookedBy(clientAge?: number): boolean {
    if (!this.isBookable()) return false;

    if (
      this._requirements?.minimumAge &&
      clientAge &&
      clientAge < this._requirements.minimumAge
    ) {
      return false;
    }

    if (
      this._requirements?.maximumAge &&
      clientAge &&
      clientAge > this._requirements.maximumAge
    ) {
      return false;
    }

    return true;
  }

  public requiresStaffApproval(): boolean {
    return this._scheduling.requiresApproval;
  }

  public getTotalDuration(): number {
    const bufferBefore = this._scheduling.bufferTimeBefore || 0;
    const bufferAfter = this._scheduling.bufferTimeAfter || 0;
    return this._scheduling.duration + bufferBefore + bufferAfter;
  }

  public getEffectivePrice(
    packageName?: string,
    durationMinutes?: number,
  ): Money {
    if (packageName) {
      const pkg = this._packages.find(
        (p: ServicePackage) => p.name === packageName,
      );
      if (pkg) {
        // Prix par session du package
        return Money.create(
          pkg.price.getAmount() / pkg.sessions,
          pkg.price.getCurrency(),
        );
      }
    }

    // Utiliser la configuration de pricing flexible
    const duration = durationMinutes || this._scheduling.duration;
    return this._pricingConfig.calculatePrice(duration);
  }

  // Domain methods
  public assignStaff(staffId: UserId): void {
    if (!this._assignedStaffIds.includes(staffId)) {
      this._assignedStaffIds.push(staffId);
      this._updatedAt = new Date();
    }
  }

  public unassignStaff(staffId: UserId): void {
    const index = this._assignedStaffIds.indexOf(staffId);
    if (index > -1) {
      this._assignedStaffIds.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  public updatePricingConfig(pricingConfig: PricingConfig): void {
    (this as any)._pricingConfig = pricingConfig;
    this._updatedAt = new Date();
  }

  public updateScheduling(scheduling: Partial<ServiceScheduling>): void {
    Object.assign(this._scheduling, scheduling);
    this._updatedAt = new Date();
  }

  public updateRequirements(requirements: ServiceRequirements): void {
    this._requirements = requirements;
    this._updatedAt = new Date();
  }

  public addPackage(packageData: ServicePackage): void {
    // Vérifier si le package existe déjà
    const existingPackage = this._packages.find(
      (p: ServicePackage) => p.name === packageData.name,
    );

    if (existingPackage) {
      throw new Error(`Package '${packageData.name}' already exists`);
    }

    this._packages.push(packageData);
    this._updatedAt = new Date();
  }

  public removePackage(packageName: string): void {
    this._packages = this._packages.filter(
      (p: ServicePackage) => p.name !== packageName,
    );
    this._updatedAt = new Date();
  }

  // Nouvelles méthodes de pricing flexibles
  public getBasePrice(): Money | null {
    return this._pricingConfig.getBasePrice();
  }

  public isFree(): boolean {
    return this._pricingConfig.isFree();
  }

  public isPriceVisibleToUser(
    isAuthenticated: boolean,
    isStaff: boolean = false,
  ): boolean {
    return this._pricingConfig.isVisibleToUser(isAuthenticated, isStaff);
  }

  public isPriceVisibleToPublic(): boolean {
    return this._pricingConfig.isVisibleToPublic();
  }

  public activate(): void {
    if (this._assignedStaffIds.length === 0) {
      throw new Error('Cannot activate service without assigned staff');
    }
    this._status = ServiceStatus.ACTIVE;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    this._status = ServiceStatus.INACTIVE;
    this._updatedAt = new Date();
  }

  public publish(): void {
    this.activate();
  }

  public unpublish(): void {
    this.deactivate();
  }

  public updateBasicInfo(updates: {
    name?: string;
    description?: string;
    category?: ServiceCategory;
  }): void {
    if (updates.name !== undefined) {
      (this as any)._name = updates.name;
    }
    if (updates.description !== undefined) {
      (this as any)._description = updates.description;
    }
    if (updates.category !== undefined) {
      (this as any)._category = updates.category;
    }
    this._updatedAt = new Date();
  }

  /**
   * Vérifie si le service peut être supprimé
   * Un service peut être supprimé s'il n'est pas actif
   */
  public canBeDeleted(): boolean {
    return this._status !== ServiceStatus.ACTIVE;
  }

  // Méthode pour forcer l'ID (utilisé pour les tests)
  public forceId(id: ServiceId): void {
    (this as any)._id = id;
  }
}
