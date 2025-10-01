/**
 * 🎭 ACTOR TYPE VALUE OBJECT - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Représente les différents types d'acteurs du système
 */

export enum ActorTypeEnum {
  CLIENT = "CLIENT",
  STAFF = "STAFF",
  ADMIN = "ADMIN",
  BUSINESS_OWNER = "BUSINESS_OWNER",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
  // 🆕 Nouveaux rôles éditeur SaaS
  SUPER_ADMIN = "SUPER_ADMIN",
  SALES_MANAGER = "SALES_MANAGER",
  SALES_REP = "SALES_REP",
}

export class ActorType {
  private readonly _value: ActorTypeEnum;

  private constructor(value: ActorTypeEnum) {
    this._value = value;
  }

  static client(): ActorType {
    return new ActorType(ActorTypeEnum.CLIENT);
  }

  static staff(): ActorType {
    return new ActorType(ActorTypeEnum.STAFF);
  }

  static admin(): ActorType {
    return new ActorType(ActorTypeEnum.ADMIN);
  }

  static businessOwner(): ActorType {
    return new ActorType(ActorTypeEnum.BUSINESS_OWNER);
  }

  static platformAdmin(): ActorType {
    return new ActorType(ActorTypeEnum.PLATFORM_ADMIN);
  }

  static superAdmin(): ActorType {
    return new ActorType(ActorTypeEnum.SUPER_ADMIN);
  }

  static salesManager(): ActorType {
    return new ActorType(ActorTypeEnum.SALES_MANAGER);
  }

  static salesRep(): ActorType {
    return new ActorType(ActorTypeEnum.SALES_REP);
  }

  static fromString(value: string): ActorType {
    const enumValue = Object.values(ActorTypeEnum).find(
      (type) => type.toString() === value.toUpperCase(),
    );

    if (!enumValue) {
      throw new Error(`Type d'acteur invalide: ${value}`);
    }

    return new ActorType(enumValue);
  }

  getValue(): string {
    return this._value;
  }

  /**
   * Vérifie si l'acteur peut recevoir des notifications par email
   */
  canReceiveEmailNotifications(): boolean {
    return true; // Tous les acteurs peuvent recevoir des emails
  }

  /**
   * Vérifie si l'acteur peut recevoir des notifications par SMS
   */
  canReceiveSmsNotifications(): boolean {
    // Tous sauf PLATFORM_ADMIN (qui gère le système)
    return this._value !== ActorTypeEnum.PLATFORM_ADMIN;
  }

  /**
   * Vérifie si l'acteur peut recevoir des notifications push
   */
  canReceivePushNotifications(): boolean {
    return true; // Tous les acteurs peuvent recevoir des push
  }

  /**
   * Obtient les notifications par défaut pour ce type d'acteur
   */
  getDefaultNotificationPreferences(): {
    email: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  } {
    switch (this._value) {
      case ActorTypeEnum.CLIENT:
        return { email: true, sms: true, push: true, inApp: true };

      case ActorTypeEnum.STAFF:
        return { email: true, sms: true, push: true, inApp: true };

      case ActorTypeEnum.ADMIN:
      case ActorTypeEnum.BUSINESS_OWNER:
        return { email: true, sms: false, push: true, inApp: true };

      case ActorTypeEnum.PLATFORM_ADMIN:
        return { email: true, sms: false, push: false, inApp: true };

      case ActorTypeEnum.SUPER_ADMIN:
        return { email: true, sms: false, push: true, inApp: true };

      case ActorTypeEnum.SALES_MANAGER:
      case ActorTypeEnum.SALES_REP:
        return { email: true, sms: true, push: true, inApp: true };

      default:
        return { email: true, sms: false, push: false, inApp: true };
    }
  }

  /**
   * Obtient la priorité par défaut des notifications pour cet acteur
   */
  getDefaultNotificationPriority(): string {
    switch (this._value) {
      case ActorTypeEnum.CLIENT:
        return "HIGH"; // Les clients ont la priorité pour les notifications

      case ActorTypeEnum.STAFF:
        return "HIGH"; // Notifications importantes pour le staff

      case ActorTypeEnum.ADMIN:
      case ActorTypeEnum.BUSINESS_OWNER:
        return "NORMAL"; // Priorité normale pour l'administration

      case ActorTypeEnum.PLATFORM_ADMIN:
        return "LOW"; // Priorité basse pour l'admin plateforme

      case ActorTypeEnum.SUPER_ADMIN:
        return "HIGH"; // Priorité haute pour le super admin

      case ActorTypeEnum.SALES_MANAGER:
        return "HIGH"; // Priorité haute pour les managers commerciaux

      case ActorTypeEnum.SALES_REP:
        return "NORMAL"; // Priorité normale pour les commerciaux

      default:
        return "NORMAL";
    }
  }

  /**
   * Vérifie si ce type d'acteur est un utilisateur métier
   */
  isBusinessUser(): boolean {
    return [
      ActorTypeEnum.STAFF,
      ActorTypeEnum.ADMIN,
      ActorTypeEnum.BUSINESS_OWNER,
    ].includes(this._value);
  }

  /**
   * Vérifie si ce type d'acteur est un client
   */
  isClient(): boolean {
    return this._value === ActorTypeEnum.CLIENT;
  }

  /**
   * Vérifie si ce type d'acteur a des permissions administratives
   */
  hasAdminPermissions(): boolean {
    return [
      ActorTypeEnum.ADMIN,
      ActorTypeEnum.BUSINESS_OWNER,
      ActorTypeEnum.PLATFORM_ADMIN,
      ActorTypeEnum.SUPER_ADMIN,
    ].includes(this._value);
  }

  /**
   * Vérifie si ce type d'acteur est un rôle éditeur SaaS
   */
  isPublisherRole(): boolean {
    return [
      ActorTypeEnum.SUPER_ADMIN,
      ActorTypeEnum.SALES_MANAGER,
      ActorTypeEnum.SALES_REP,
    ].includes(this._value);
  }

  /**
   * Vérifie si ce type d'acteur est un rôle tenant (client du SaaS)
   */
  isTenantRole(): boolean {
    return [
      ActorTypeEnum.CLIENT,
      ActorTypeEnum.STAFF,
      ActorTypeEnum.ADMIN,
      ActorTypeEnum.BUSINESS_OWNER,
    ].includes(this._value);
  }

  /**
   * Vérifie si ce type d'acteur est un rôle commercial
   */
  isSalesRole(): boolean {
    return [ActorTypeEnum.SALES_MANAGER, ActorTypeEnum.SALES_REP].includes(
      this._value,
    );
  }

  equals(other: ActorType): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}
