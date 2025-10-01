/**
 * 📊 PROSPECT STATUS VALUE OBJECT - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Représente le statut d'un prospect dans le pipeline commercial
 */

import { ProspectValidationError } from '@domain/exceptions/prospect.exceptions';

export enum ProspectStatusEnum {
  LEAD = 'LEAD', // 🆕 Nouveau lead
  CONTACTED = 'CONTACTED', // 📞 Contact établi
  QUALIFIED = 'QUALIFIED', // ✅ Prospect qualifié
  DEMO_SCHEDULED = 'DEMO_SCHEDULED', // 📅 Démo planifiée
  DEMO_COMPLETED = 'DEMO_COMPLETED', // ✅ Démo réalisée
  PROPOSAL_SENT = 'PROPOSAL_SENT', // 📋 Proposition envoyée
  NEGOTIATION = 'NEGOTIATION', // 💬 Négociation en cours
  CLOSED_WON = 'CLOSED_WON', // 🎉 Gagné (converti en client)
  CLOSED_LOST = 'CLOSED_LOST', // ❌ Perdu
  ON_HOLD = 'ON_HOLD', // ⏸️ En attente
  NURTURING = 'NURTURING', // 🌱 En maturation
}

export class ProspectStatus {
  private readonly _value: ProspectStatusEnum;

  private constructor(value: ProspectStatusEnum) {
    this._value = value;
  }

  // Factory methods pour chaque statut
  static lead(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.LEAD);
  }

  static contacted(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.CONTACTED);
  }

  static qualified(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.QUALIFIED);
  }

  static demoScheduled(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.DEMO_SCHEDULED);
  }

  static demoCompleted(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.DEMO_COMPLETED);
  }

  static proposalSent(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.PROPOSAL_SENT);
  }

  static negotiation(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.NEGOTIATION);
  }

  static closedWon(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.CLOSED_WON);
  }

  static closedLost(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.CLOSED_LOST);
  }

  static onHold(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.ON_HOLD);
  }

  static nurturing(): ProspectStatus {
    return new ProspectStatus(ProspectStatusEnum.NURTURING);
  }

  static fromString(value: string): ProspectStatus {
    const enumValue = Object.values(ProspectStatusEnum).find(
      (status) => status === value.toUpperCase(),
    );

    if (!enumValue) {
      throw new ProspectValidationError(`Invalid prospect status: ${value}`);
    }

    return new ProspectStatus(enumValue);
  }

  /**
   * 🔄 Vérifier si une transition de statut est autorisée
   */
  canTransitionTo(newStatus: ProspectStatus): boolean {
    const current = this._value;
    const target = newStatus._value;

    // Matrice des transitions autorisées
    const allowedTransitions: Record<ProspectStatusEnum, ProspectStatusEnum[]> =
      {
        [ProspectStatusEnum.LEAD]: [
          ProspectStatusEnum.CONTACTED,
          ProspectStatusEnum.QUALIFIED,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.CONTACTED]: [
          ProspectStatusEnum.QUALIFIED,
          ProspectStatusEnum.DEMO_SCHEDULED,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.QUALIFIED]: [
          ProspectStatusEnum.DEMO_SCHEDULED,
          ProspectStatusEnum.PROPOSAL_SENT,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.DEMO_SCHEDULED]: [
          ProspectStatusEnum.DEMO_COMPLETED,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.DEMO_COMPLETED]: [
          ProspectStatusEnum.PROPOSAL_SENT,
          ProspectStatusEnum.NEGOTIATION,
          ProspectStatusEnum.CLOSED_WON,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.PROPOSAL_SENT]: [
          ProspectStatusEnum.NEGOTIATION,
          ProspectStatusEnum.CLOSED_WON,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.NEGOTIATION]: [
          ProspectStatusEnum.PROPOSAL_SENT,
          ProspectStatusEnum.CLOSED_WON,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.ON_HOLD,
        ],
        [ProspectStatusEnum.CLOSED_WON]: [], // État final - pas de transition
        [ProspectStatusEnum.CLOSED_LOST]: [
          ProspectStatusEnum.NURTURING, // Peut être remis en nurturing
          ProspectStatusEnum.LEAD, // Peut redevenir lead
        ],
        [ProspectStatusEnum.ON_HOLD]: [
          ProspectStatusEnum.CONTACTED,
          ProspectStatusEnum.QUALIFIED,
          ProspectStatusEnum.DEMO_SCHEDULED,
          ProspectStatusEnum.PROPOSAL_SENT,
          ProspectStatusEnum.NEGOTIATION,
          ProspectStatusEnum.CLOSED_LOST,
          ProspectStatusEnum.NURTURING,
        ],
        [ProspectStatusEnum.NURTURING]: [
          ProspectStatusEnum.CONTACTED,
          ProspectStatusEnum.QUALIFIED,
          ProspectStatusEnum.DEMO_SCHEDULED,
          ProspectStatusEnum.CLOSED_LOST,
        ],
      };

    return allowedTransitions[current]?.includes(target) || false;
  }

  /**
   * 🎯 Vérifier si le prospect est actif (en cours de traitement)
   */
  isActive(): boolean {
    return ![
      ProspectStatusEnum.CLOSED_WON,
      ProspectStatusEnum.CLOSED_LOST,
    ].includes(this._value);
  }

  /**
   * 📈 Vérifier si le prospect est en progression
   */
  isInProgress(): boolean {
    return [
      ProspectStatusEnum.QUALIFIED,
      ProspectStatusEnum.DEMO_SCHEDULED,
      ProspectStatusEnum.DEMO_COMPLETED,
      ProspectStatusEnum.PROPOSAL_SENT,
      ProspectStatusEnum.NEGOTIATION,
    ].includes(this._value);
  }

  /**
   * 🎉 Vérifier si le prospect est converti
   */
  isClosedWon(): boolean {
    return this._value === ProspectStatusEnum.CLOSED_WON;
  }

  /**
   * ❌ Vérifier si le prospect est perdu
   */
  isClosedLost(): boolean {
    return this._value === ProspectStatusEnum.CLOSED_LOST;
  }

  /**
   * ✅ Vérifier si le prospect est fermé (gagné ou perdu)
   */
  isClosed(): boolean {
    return this.isClosedWon() || this.isClosedLost();
  }

  /**
   * 🎯 Obtenir la priorité du statut pour le tri
   */
  getPriority(): number {
    const priorities: Record<ProspectStatusEnum, number> = {
      [ProspectStatusEnum.NEGOTIATION]: 1, // Plus haute priorité
      [ProspectStatusEnum.PROPOSAL_SENT]: 2,
      [ProspectStatusEnum.DEMO_SCHEDULED]: 3,
      [ProspectStatusEnum.DEMO_COMPLETED]: 4,
      [ProspectStatusEnum.QUALIFIED]: 5,
      [ProspectStatusEnum.CONTACTED]: 6,
      [ProspectStatusEnum.LEAD]: 7,
      [ProspectStatusEnum.ON_HOLD]: 8,
      [ProspectStatusEnum.NURTURING]: 9,
      [ProspectStatusEnum.CLOSED_WON]: 10,
      [ProspectStatusEnum.CLOSED_LOST]: 11, // Plus basse priorité
    };

    return priorities[this._value] || 99;
  }

  /**
   * 🎨 Obtenir la couleur associée au statut (pour UI)
   */
  getColor(): string {
    const colors: Record<ProspectStatusEnum, string> = {
      [ProspectStatusEnum.LEAD]: '#6B7280', // Gris
      [ProspectStatusEnum.CONTACTED]: '#3B82F6', // Bleu
      [ProspectStatusEnum.QUALIFIED]: '#8B5CF6', // Violet
      [ProspectStatusEnum.DEMO_SCHEDULED]: '#F59E0B', // Orange
      [ProspectStatusEnum.DEMO_COMPLETED]: '#10B981', // Vert clair
      [ProspectStatusEnum.PROPOSAL_SENT]: '#06B6D4', // Cyan
      [ProspectStatusEnum.NEGOTIATION]: '#F97316', // Orange foncé
      [ProspectStatusEnum.CLOSED_WON]: '#059669', // Vert foncé
      [ProspectStatusEnum.CLOSED_LOST]: '#DC2626', // Rouge
      [ProspectStatusEnum.ON_HOLD]: '#9CA3AF', // Gris clair
      [ProspectStatusEnum.NURTURING]: '#84CC16', // Lime
    };

    return colors[this._value] || '#6B7280';
  }

  /**
   * 📄 Obtenir le libellé français du statut
   */
  getLabel(): string {
    const labels: Record<ProspectStatusEnum, string> = {
      [ProspectStatusEnum.LEAD]: 'Nouveau lead',
      [ProspectStatusEnum.CONTACTED]: 'Contacté',
      [ProspectStatusEnum.QUALIFIED]: 'Qualifié',
      [ProspectStatusEnum.DEMO_SCHEDULED]: 'Démo planifiée',
      [ProspectStatusEnum.DEMO_COMPLETED]: 'Démo réalisée',
      [ProspectStatusEnum.PROPOSAL_SENT]: 'Proposition envoyée',
      [ProspectStatusEnum.NEGOTIATION]: 'Négociation',
      [ProspectStatusEnum.CLOSED_WON]: 'Gagné',
      [ProspectStatusEnum.CLOSED_LOST]: 'Perdu',
      [ProspectStatusEnum.ON_HOLD]: 'En attente',
      [ProspectStatusEnum.NURTURING]: 'En maturation',
    };

    return labels[this._value] || this._value;
  }

  getValue(): string {
    return this._value;
  }

  equals(other: ProspectStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}
