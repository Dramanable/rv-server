/**
 * 📊 BUSINESS SIZE ENUM - Domain Layer
 * ✅ Clean Architecture - Pure Domain Logic
 * ✅ Taille des entreprises prospects pour la tarification
 */

export enum BusinessSizeEnum {
  SMALL = 'SMALL', // 1-5 employés
  MEDIUM = 'MEDIUM', // 6-20 employés
  LARGE = 'LARGE', // 21-100 employés
  ENTERPRISE = 'ENTERPRISE', // 100+ employés
}

export class BusinessSize {
  /**
   * 🎯 Obtenir le libellé français de la taille
   */
  static getLabel(size: BusinessSizeEnum): string {
    const labels: Record<BusinessSizeEnum, string> = {
      [BusinessSizeEnum.SMALL]: 'Petite entreprise (1-5 employés)',
      [BusinessSizeEnum.MEDIUM]: 'Moyenne entreprise (6-20 employés)',
      [BusinessSizeEnum.LARGE]: 'Grande entreprise (21-100 employés)',
      [BusinessSizeEnum.ENTERPRISE]: 'Très grande entreprise (100+ employés)',
    };

    return labels[size] || size;
  }

  /**
   * 📊 Obtenir la remise associée à la taille
   */
  static getDiscount(size: BusinessSizeEnum): number {
    const discounts: Record<BusinessSizeEnum, number> = {
      [BusinessSizeEnum.SMALL]: 0, // Pas de remise
      [BusinessSizeEnum.MEDIUM]: 0.1, // 10% de remise
      [BusinessSizeEnum.LARGE]: 0.2, // 20% de remise
      [BusinessSizeEnum.ENTERPRISE]: 0.3, // 30% de remise
    };

    return discounts[size] || 0;
  }

  /**
   * 🎯 Calculer la taille basée sur le nombre d'employés
   */
  static fromStaffCount(staffCount: number): BusinessSizeEnum {
    if (staffCount <= 5) return BusinessSizeEnum.SMALL;
    if (staffCount <= 20) return BusinessSizeEnum.MEDIUM;
    if (staffCount <= 100) return BusinessSizeEnum.LARGE;
    return BusinessSizeEnum.ENTERPRISE;
  }

  /**
   * 📈 Obtenir les bornes min/max pour une taille
   */
  static getStaffRange(size: BusinessSizeEnum): { min: number; max: number } {
    const ranges: Record<BusinessSizeEnum, { min: number; max: number }> = {
      [BusinessSizeEnum.SMALL]: { min: 1, max: 5 },
      [BusinessSizeEnum.MEDIUM]: { min: 6, max: 20 },
      [BusinessSizeEnum.LARGE]: { min: 21, max: 100 },
      [BusinessSizeEnum.ENTERPRISE]: { min: 101, max: Number.MAX_SAFE_INTEGER },
    };

    return ranges[size] || { min: 1, max: 1 };
  }

  /**
   * 💰 Obtenir le prix de base par utilisateur selon la taille
   */
  static getBasePrice(size: BusinessSizeEnum): number {
    const basePrices: Record<BusinessSizeEnum, number> = {
      [BusinessSizeEnum.SMALL]: 29, // 29€/utilisateur/mois
      [BusinessSizeEnum.MEDIUM]: 26, // 26€/utilisateur/mois (10% de remise)
      [BusinessSizeEnum.LARGE]: 23, // 23€/utilisateur/mois (20% de remise)
      [BusinessSizeEnum.ENTERPRISE]: 20, // 20€/utilisateur/mois (30% de remise)
    };

    return basePrices[size] || 29;
  }

  /**
   * 🎨 Obtenir la couleur associée à la taille (pour UI)
   */
  static getColor(size: BusinessSizeEnum): string {
    const colors: Record<BusinessSizeEnum, string> = {
      [BusinessSizeEnum.SMALL]: '#10B981', // Vert
      [BusinessSizeEnum.MEDIUM]: '#3B82F6', // Bleu
      [BusinessSizeEnum.LARGE]: '#8B5CF6', // Violet
      [BusinessSizeEnum.ENTERPRISE]: '#F59E0B', // Orange
    };

    return colors[size] || '#6B7280';
  }

  /**
   * 📊 Obtenir l'icône associée à la taille
   */
  static getIcon(size: BusinessSizeEnum): string {
    const icons: Record<BusinessSizeEnum, string> = {
      [BusinessSizeEnum.SMALL]: '🏪',
      [BusinessSizeEnum.MEDIUM]: '🏢',
      [BusinessSizeEnum.LARGE]: '🏬',
      [BusinessSizeEnum.ENTERPRISE]: '🏭',
    };

    return icons[size] || '🏪';
  }
}
