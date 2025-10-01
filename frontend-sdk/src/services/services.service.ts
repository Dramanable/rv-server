/**
 * 💼 RV Project Frontend SDK - Service Services
 *
 * Gestion des prestations et services business
 */

import { RVProjectClient } from '../client';
import {
  ApiResponse,
  CreateServiceRequest,
  Money,
  PaginatedResponse,
  PricingConfig,
  PricingType,
  SearchServicesRequest,
  Service,
  ServiceSettings,
  ServiceStatus,
  UpdateServiceRequest,
  VariablePricing,
} from '../types';

export class ServicesService {
  constructor(private client: RVProjectClient) {}

  // ==========================================
  // 💼 Gestion des Services
  // ==========================================

  /**
   * Rechercher des services avec filtres avancés
   */
  async searchServices(
    request: SearchServicesRequest = {},
  ): Promise<PaginatedResponse<Service>> {
    const response = await this.client.post<
      ApiResponse<PaginatedResponse<Service>>
    >('/services/list', request);
    return response.data.data;
  }

  /**
   * Obtenir un service par ID
   */
  async getServiceById(id: string): Promise<Service> {
    const response = await this.client.get<ApiResponse<Service>>(
      `/services/${id}`,
    );
    return response.data.data;
  }

  /**
   * Créer un nouveau service
   */
  async createService(request: CreateServiceRequest): Promise<Service> {
    const response = await this.client.post<ApiResponse<Service>>(
      '/services',
      request,
    );
    return response.data.data;
  }

  /**
   * Mettre à jour un service
   */
  async updateService(
    id: string,
    updates: UpdateServiceRequest,
  ): Promise<Service> {
    const response = await this.client.put<ApiResponse<Service>>(
      `/services/${id}`,
      updates,
    );
    return response.data.data;
  }

  /**
   * Supprimer un service
   */
  async deleteService(id: string): Promise<void> {
    await this.client.delete(`/services/${id}`);
  }

  /**
   * Obtenir les services d'une entreprise
   */
  async getServicesByBusiness(
    businessId: string,
    activeOnly: boolean = true,
  ): Promise<Service[]> {
    const result = await this.searchServices(
      activeOnly
        ? { businessId, status: ServiceStatus.ACTIVE, limit: 100 }
        : { businessId, limit: 100 },
    );
    return result.data as Service[];
  }

  /**
   * Obtenir les services réservables en ligne
   */
  async getBookableServices(
    businessId: string,
    filters: Partial<SearchServicesRequest> = {},
  ): Promise<Service[]> {
    const result = await this.searchServices({
      businessId,
      isOnlineBookingEnabled: true,
      status: ServiceStatus.ACTIVE,
      ...filters,
      limit: 100,
    });
    return result.data as Service[];
  }

  /**
   * Recherche rapide de services par nom
   */
  async quickSearchByName(
    businessId: string,
    name: string,
    limit: number = 10,
  ): Promise<Service[]> {
    const result = await this.searchServices({
      businessId,
      search: name,
      status: ServiceStatus.ACTIVE,
      limit,
    });
    return result.data as Service[];
  }

  /**
   * Obtenir les services par catégorie
   */
  async getServicesByCategory(
    businessId: string,
    category: string,
  ): Promise<Service[]> {
    const result = await this.searchServices({
      businessId,
      category,
      status: ServiceStatus.ACTIVE,
      limit: 100,
    });
    return result.data as Service[];
  }

  // ==========================================
  // 💰 Calculs de Pricing
  // ==========================================

  /**
   * Calculer le prix d'un service avec options sélectionnées
   */
  calculateServicePrice(
    service: Service,
    selectedOptions: Record<string, string> = {},
  ): {
    basePrice: Money;
    additions: { name: string; price: Money }[];
    totalPrice: Money;
  } {
    const { pricingConfig } = service;
    const basePrice = pricingConfig.basePrice;
    const additions: { name: string; price: Money }[] = [];
    let totalAmount = basePrice.amount;

    if (
      pricingConfig.type === PricingType.VARIABLE &&
      pricingConfig.variablePricing
    ) {
      const { factors, calculationMethod } = pricingConfig.variablePricing;

      factors.forEach((factor) => {
        const selectedValue = selectedOptions[factor.name];
        if (selectedValue) {
          const option = factor.options.find(
            (opt) => opt.label === selectedValue,
          );
          if (option) {
            const additionAmount = option.priceModifier;

            if (calculationMethod === 'ADDITIVE') {
              totalAmount += additionAmount;
            } else if (calculationMethod === 'MULTIPLICATIVE') {
              totalAmount *= 1 + additionAmount / 100;
            }

            if (additionAmount !== 0) {
              additions.push({
                name: `${factor.name}: ${option.label}`,
                price: {
                  amount: additionAmount,
                  currency: basePrice.currency,
                },
              });
            }
          }
        }
      });
    }

    return {
      basePrice,
      additions,
      totalPrice: {
        amount: Math.round(totalAmount * 100) / 100, // Arrondir à 2 décimales
        currency: basePrice.currency,
      },
    };
  }

  /**
   * Obtenir les options de pricing disponibles pour un service
   */
  getPricingOptions(service: Service): Record<string, string[]> {
    const options: Record<string, string[]> = {};

    if (
      service.pricingConfig.type === PricingType.VARIABLE &&
      service.pricingConfig.variablePricing
    ) {
      service.pricingConfig.variablePricing.factors.forEach((factor) => {
        options[factor.name] = factor.options.map((opt) => opt.label);
      });
    }

    return options;
  }

  /**
   * Vérifier si un service nécessite une sélection d'options
   */
  requiresOptionSelection(service: Service): boolean {
    if (
      service.pricingConfig.type !== PricingType.VARIABLE ||
      !service.pricingConfig.variablePricing
    ) {
      return false;
    }

    return service.pricingConfig.variablePricing.factors.some(
      (factor) => factor.required,
    );
  }

  /**
   * Valider les options sélectionnées pour un service
   */
  validateSelectedOptions(
    service: Service,
    selectedOptions: Record<string, string>,
  ): string[] {
    const errors: string[] = [];

    if (
      service.pricingConfig.type !== PricingType.VARIABLE ||
      !service.pricingConfig.variablePricing
    ) {
      return errors;
    }

    service.pricingConfig.variablePricing.factors.forEach((factor) => {
      const selectedValue = selectedOptions[factor.name];

      if (factor.required && !selectedValue) {
        errors.push(`${factor.name} is required`);
        return;
      }

      if (selectedValue) {
        const isValidOption = factor.options.some(
          (opt) => opt.label === selectedValue,
        );
        if (!isValidOption) {
          errors.push(`Invalid option for ${factor.name}: ${selectedValue}`);
        }
      }
    });

    return errors;
  }

  // ==========================================
  // 🔧 Validation et Utilitaires
  // ==========================================

  /**
   * Valider les données de service côté client
   */
  validateServiceData(
    data: CreateServiceRequest | UpdateServiceRequest,
  ): string[] {
    const errors: string[] = [];

    // Validation nom du service
    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Service name is required');
      } else if (data.name.length < 2) {
        errors.push('Service name must be at least 2 characters');
      } else if (data.name.length > 100) {
        errors.push('Service name must not exceed 100 characters');
      }
    }

    // Validation durée
    if ('duration' in data && data.duration !== undefined) {
      if (!Number.isInteger(data.duration) || data.duration <= 0) {
        errors.push('Duration must be a positive integer (in minutes)');
      } else if (data.duration > 24 * 60) {
        errors.push('Duration cannot exceed 24 hours');
      }
    }

    // Validation configuration de pricing
    if ('pricingConfig' in data && data.pricingConfig) {
      const pricingErrors = this.validatePricingConfig(data.pricingConfig);
      errors.push(...pricingErrors);
    }

    // Validation paramètres du service
    if ('settings' in data && data.settings) {
      const settingsErrors = this.validateServiceSettings(data.settings);
      errors.push(...settingsErrors);
    }

    return errors;
  }

  /**
   * Valider la configuration de pricing
   */
  private validatePricingConfig(
    config: PricingConfig | Partial<PricingConfig>,
  ): string[] {
    const errors: string[] = [];

    // Validation prix de base
    if ('basePrice' in config && config.basePrice) {
      if (config.basePrice.amount < 0) {
        errors.push('Base price cannot be negative');
      }
      if (
        !config.basePrice.currency ||
        config.basePrice.currency.length !== 3
      ) {
        errors.push('Currency must be a valid 3-letter code (e.g., EUR, USD)');
      }
    }

    // Validation pricing variable
    if ('variablePricing' in config && config.variablePricing) {
      const variableErrors = this.validateVariablePricing(
        config.variablePricing,
      );
      errors.push(...variableErrors);
    }

    return errors;
  }

  /**
   * Valider la configuration de pricing variable
   */
  private validateVariablePricing(
    config: VariablePricing | Partial<VariablePricing>,
  ): string[] {
    const errors: string[] = [];

    if ('factors' in config && config.factors) {
      config.factors.forEach((factor, index) => {
        if (!factor.name.trim()) {
          errors.push(`Factor ${index + 1}: name is required`);
        }

        if (!factor.options || factor.options.length === 0) {
          errors.push(`Factor ${index + 1}: at least one option is required`);
        } else {
          factor.options.forEach((option, optIndex) => {
            if (!option.label.trim()) {
              errors.push(
                `Factor ${index + 1}, Option ${optIndex + 1}: label is required`,
              );
            }
            if (typeof option.priceModifier !== 'number') {
              errors.push(
                `Factor ${index + 1}, Option ${optIndex + 1}: price modifier must be a number`,
              );
            }
          });
        }
      });
    }

    return errors;
  }

  /**
   * Valider les paramètres du service
   */
  private validateServiceSettings(
    settings: ServiceSettings | Partial<ServiceSettings>,
  ): string[] {
    const errors: string[] = [];

    if (
      'maxAdvanceBookingDays' in settings &&
      settings.maxAdvanceBookingDays !== undefined
    ) {
      if (
        settings.maxAdvanceBookingDays < 0 ||
        settings.maxAdvanceBookingDays > 365
      ) {
        errors.push('Max advance booking days must be between 0 and 365');
      }
    }

    if (
      'minAdvanceBookingHours' in settings &&
      settings.minAdvanceBookingHours !== undefined
    ) {
      if (
        settings.minAdvanceBookingHours < 0 ||
        settings.minAdvanceBookingHours > 168
      ) {
        errors.push(
          'Min advance booking hours must be between 0 and 168 (1 week)',
        );
      }
    }

    return errors;
  }

  /**
   * Formater le prix pour l'affichage
   */
  static formatPrice(money: Money): string {
    const formatter = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    return formatter.format(money.amount);
  }

  /**
   * Formater la durée pour l'affichage
   */
  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h${remainingMinutes < 10 ? '0' : ''}${remainingMinutes}`;
  }

  /**
   * Obtenir une description du pricing pour l'affichage
   */
  static getPricingDescription(pricingConfig: PricingConfig): string {
    switch (pricingConfig.type) {
      case PricingType.FIXED:
        return `Prix fixe : ${this.formatPrice(pricingConfig.basePrice)}`;

      case PricingType.VARIABLE:
        return `À partir de ${this.formatPrice(pricingConfig.basePrice)} (prix variable)`;

      case PricingType.PACKAGE:
        return `Forfait : ${this.formatPrice(pricingConfig.basePrice)}`;

      case PricingType.FREE:
        return 'Gratuit';

      default:
        return 'Prix sur demande';
    }
  }

  /**
   * Vérifier si un service peut être réservé en ligne
   */
  static canBeBookedOnline(service: Service): boolean {
    return (
      service.status === ServiceStatus.ACTIVE &&
      service.settings.isOnlineBookingEnabled
    );
  }

  /**
   * Vérifier si un service nécessite une approbation
   */
  static requiresApproval(service: Service): boolean {
    return service.settings.requiresApproval;
  }

  /**
   * Obtenir les tags de service formatés
   */
  static formatTags(service: Service): string {
    if (!service.tags || service.tags.length === 0) {
      return '';
    }

    return service.tags.join(', ');
  }

  /**
   * Obtenir une description courte du service
   */
  static getShortDescription(
    service: Service,
    maxLength: number = 100,
  ): string {
    if (!service.description) {
      return '';
    }

    if (service.description.length <= maxLength) {
      return service.description;
    }

    return service.description.substring(0, maxLength - 3) + '...';
  }
}

export default ServicesService;
