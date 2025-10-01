import {
  ServiceStaffAssignmentError,
  ServiceValidationError,
} from "../exceptions/service.exceptions";
import { BusinessId } from "../value-objects/business-id.value-object";
import { FileUrl } from "../value-objects/file-url.value-object";
import { Money } from "../value-objects/money.value-object";
import { PricingConfig } from "../value-objects/pricing-config.value-object";
import { ServiceId } from "../value-objects/service-id.value-object";
import { ServiceTypeId } from "../value-objects/service-type-id.value-object";
import { UserId } from "../value-objects/user-id.value-object";

export enum ServiceStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  DRAFT = "DRAFT",
}

// ServicePricing remplacé par PricingConfig pour plus de flexibilité
export interface ServicePackage {
  name: string;
  sessions: number;
  price: Money;
  validityDays: number;
}

// ✅ Questionnaire dynamique pour infos supplémentaires à la prise de RDV
export enum QuestionType {
  TEXT = "TEXT", // Texte libre
  NUMBER = "NUMBER", // Nombre
  EMAIL = "EMAIL", // Email
  PHONE = "PHONE", // Téléphone
  DATE = "DATE", // Date
  BOOLEAN = "BOOLEAN", // Oui/Non
  SELECT = "SELECT", // Liste déroulante
  MULTISELECT = "MULTISELECT", // Sélection multiple
  TEXTAREA = "TEXTAREA", // Texte long
  FILE = "FILE", // Upload de fichier
}

export interface QuestionOption {
  value: string;
  label: string;
}

export interface BookingQuestion {
  id: string; // UUID unique de la question
  label: string; // Libellé de la question
  type: QuestionType; // Type de question
  required: boolean; // Obligatoire ou optionnel
  options?: QuestionOption[]; // Options pour SELECT/MULTISELECT
  placeholder?: string; // Texte d'aide
  validation?: {
    // Règles de validation
    minLength?: number;
    maxLength?: number;
    pattern?: string; // Regex pour validation
    minValue?: number;
    maxValue?: number;
  };
  conditionalDisplay?: {
    // Affichage conditionnel
    dependsOn: string; // ID de la question parente
    showWhen: string | string[]; // Valeur(s) qui déclenchent l'affichage
  };
  order: number; // Ordre d'affichage
}

export interface ServiceRequirements {
  preparationInstructions?: string;
  contraindications?: string[];
  requiredDocuments?: string[];
  minimumAge?: number;
  maximumAge?: number;
  specialRequirements?: string;

  // ✅ NOUVEAU - Questionnaire dynamique pour prise de RDV
  bookingQuestionnaire?: BookingQuestion[];

  // ✅ Paramètres du questionnaire
  questionnaireSettings?: {
    title?: string; // Titre du questionnaire
    description?: string; // Description/instructions
    showProgressBar: boolean; // Afficher barre de progression
    allowSaveAndContinue: boolean; // Permettre sauvegarde partielle
    submitButtonText?: string; // Texte bouton validation
  };
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
    private _serviceTypeIds: ServiceTypeId[], // ✅ Many-to-many relation avec ServiceType
    private readonly _pricingConfig: PricingConfig,
    private readonly _scheduling: ServiceScheduling,
    private _requirements?: ServiceRequirements,
    private readonly _imageUrl?: FileUrl,
    private readonly _assignedStaffIds: UserId[] = [],
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

  // ✅ New getter for service type IDs
  getServiceTypeIds(): readonly ServiceTypeId[] {
    return this._serviceTypeIds;
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
    serviceTypeIds: ServiceTypeId[]; // ✅ Many-to-many relation with ServiceType
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

    // ✅ Handle serviceTypeIds - many-to-many with ServiceType entities
    const serviceTypeIds = data.serviceTypeIds;

    // ✅ VALIDATION CRITIQUE : Service doit avoir au moins un ServiceType
    if (serviceTypeIds.length === 0) {
      throw new ServiceValidationError(
        "Service must have at least one ServiceType",
      );
    }

    return new Service(
      ServiceId.generate(),
      data.businessId,
      data.name,
      data.description,
      serviceTypeIds, // ✅ Many-to-many relation avec ServiceType
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

  public getDefaultDuration(): number {
    return this._scheduling.duration;
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
      throw new ServiceValidationError(
        `Package '${packageData.name}' already exists`,
      );
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
      throw new ServiceStaffAssignmentError(
        "Cannot activate service without assigned staff",
      );
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
    category?: string;
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

  // ✅ NEW - Méthodes pour gestion many-to-many des ServiceTypes
  public addServiceType(serviceTypeId: ServiceTypeId): void {
    // Vérifier si le type existe déjà
    const exists = this._serviceTypeIds.some((id) => id.equals(serviceTypeId));

    if (!exists) {
      this._serviceTypeIds.push(serviceTypeId);
      this._updatedAt = new Date();
    }
  }

  public removeServiceType(serviceTypeId: ServiceTypeId): void {
    // Ne pas permettre de supprimer le dernier ServiceType
    if (this._serviceTypeIds.length <= 1) {
      throw new ServiceValidationError(
        "Service must have at least one ServiceType",
      );
    }

    const index = this._serviceTypeIds.findIndex((id) =>
      id.equals(serviceTypeId),
    );

    if (index > -1) {
      this._serviceTypeIds.splice(index, 1);
      this._updatedAt = new Date();
    }
  }

  public updateServiceTypes(newServiceTypeIds: ServiceTypeId[]): void {
    if (newServiceTypeIds.length === 0) {
      throw new ServiceValidationError(
        "Service must have at least one ServiceType",
      );
    }

    this._serviceTypeIds = [...newServiceTypeIds];
    this._updatedAt = new Date();
  }

  public hasServiceType(serviceTypeId: ServiceTypeId): boolean {
    return this._serviceTypeIds.some((id) => id.equals(serviceTypeId));
  }

  // ✅ NOUVEAU - Gestion des questionnaires de prise de RDV
  public hasBookingQuestionnaire(): boolean {
    return Boolean(this._requirements?.bookingQuestionnaire?.length);
  }

  public getBookingQuestionnaire(): BookingQuestion[] {
    return this._requirements?.bookingQuestionnaire || [];
  }

  public addBookingQuestion(question: Omit<BookingQuestion, "id">): void {
    if (!this._requirements) {
      this._requirements = {};
    }

    if (!this._requirements.bookingQuestionnaire) {
      this._requirements.bookingQuestionnaire = [];
    }

    const newQuestion: BookingQuestion = {
      ...question,
      id: this.generateQuestionId(),
    };

    this._requirements.bookingQuestionnaire.push(newQuestion);
    this._requirements.bookingQuestionnaire.sort((a, b) => a.order - b.order);
    this._updatedAt = new Date();
  }

  public updateBookingQuestion(
    questionId: string,
    updates: Partial<Omit<BookingQuestion, "id">>,
  ): void {
    if (!this._requirements?.bookingQuestionnaire) {
      throw new ServiceValidationError("Service has no booking questionnaire");
    }

    const questionIndex = this._requirements.bookingQuestionnaire.findIndex(
      (q) => q.id === questionId,
    );
    if (questionIndex === -1) {
      throw new ServiceValidationError(`Question ${questionId} not found`);
    }

    this._requirements.bookingQuestionnaire[questionIndex] = {
      ...this._requirements.bookingQuestionnaire[questionIndex],
      ...updates,
    };

    // Re-trier si l'ordre a changé
    if (updates.order !== undefined) {
      this._requirements.bookingQuestionnaire.sort((a, b) => a.order - b.order);
    }

    this._updatedAt = new Date();
  }

  public removeBookingQuestion(questionId: string): void {
    if (!this._requirements?.bookingQuestionnaire) {
      throw new ServiceValidationError("Service has no booking questionnaire");
    }

    const initialLength = this._requirements.bookingQuestionnaire.length;
    this._requirements.bookingQuestionnaire =
      this._requirements.bookingQuestionnaire.filter(
        (q) => q.id !== questionId,
      );

    if (this._requirements.bookingQuestionnaire.length === initialLength) {
      throw new ServiceValidationError(`Question ${questionId} not found`);
    }

    this._updatedAt = new Date();
  }

  public setQuestionnaireSettings(
    settings: ServiceRequirements["questionnaireSettings"],
  ): void {
    if (!this._requirements) {
      this._requirements = {};
    }

    this._requirements.questionnaireSettings = settings;
    this._updatedAt = new Date();
  }

  public getRequiredQuestions(): BookingQuestion[] {
    return this.getBookingQuestionnaire().filter((q) => q.required);
  }

  public validateQuestionnaireStructure(): {
    isValid: boolean;
    errors: string[];
  } {
    const questions = this.getBookingQuestionnaire();
    const errors: string[] = [];

    // Vérifier les dépendances conditionnelles
    questions.forEach((question) => {
      if (question.conditionalDisplay) {
        const parentExists = questions.some(
          (q) => q.id === question.conditionalDisplay!.dependsOn,
        );
        if (!parentExists) {
          errors.push(
            `Question "${question.label}" has invalid conditional dependency`,
          );
        }
      }

      // Vérifier les options pour SELECT/MULTISELECT
      if (
        (question.type === QuestionType.SELECT ||
          question.type === QuestionType.MULTISELECT) &&
        (!question.options || question.options.length === 0)
      ) {
        errors.push(
          `Question "${question.label}" of type ${question.type} must have options`,
        );
      }
    });

    // Vérifier les ordres uniques
    const orders = questions.map((q) => q.order);
    const uniqueOrders = new Set(orders);
    if (orders.length !== uniqueOrders.size) {
      errors.push("Questions must have unique order values");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private generateQuestionId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
