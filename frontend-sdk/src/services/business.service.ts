/**
 * 🏢 RV Project Frontend SDK - Service Business
 *
 * Gestion des entreprises et secteurs d'activité
 */

import { RVProjectClient } from '../client';
import {
    Address,
    ApiResponse,
    Business,
    BusinessHours,
    BusinessSector,
    ContactInfo,
    CreateBusinessRequest,
    PaginatedResponse,
    SearchBusinessRequest,
    TimeSlot,
    UpdateBusinessRequest
} from '../types';

export class BusinessService {
  constructor(private client: RVProjectClient) {}

  // ==========================================
  // 🏢 Gestion des Entreprises
  // ==========================================

  /**
   * Rechercher des entreprises avec filtres avancés
   */
  async searchBusinesses(request: SearchBusinessRequest = {}): Promise<PaginatedResponse<Business>> {
    const response = await this.client.post<ApiResponse<PaginatedResponse<Business>>>(
      '/businesses/list',
      request
    );
    return response.data.data;
  }

  /**
   * Obtenir une entreprise par ID
   */
  async getBusinessById(id: string): Promise<Business> {
    const response = await this.client.get<ApiResponse<Business>>(`/businesses/${id}`);
    return response.data.data;
  }

  /**
   * Créer une nouvelle entreprise
   */
  async createBusiness(request: CreateBusinessRequest): Promise<Business> {
    const response = await this.client.post<ApiResponse<Business>>('/businesses', request);
    return response.data.data;
  }

  /**
   * Mettre à jour une entreprise
   */
  async updateBusiness(id: string, updates: UpdateBusinessRequest): Promise<Business> {
    const response = await this.client.put<ApiResponse<Business>>(`/businesses/${id}`, updates);
    return response.data.data;
  }

  /**
   * Supprimer une entreprise
   */
  async deleteBusiness(id: string): Promise<void> {
    await this.client.delete(`/businesses/${id}`);
  }

  /**
   * Obtenir les entreprises de l'utilisateur connecté
   */
  async getMyBusinesses(): Promise<Business[]> {
    const response = await this.client.get<ApiResponse<Business[]>>('/businesses/my');
    return response.data.data;
  }

  /**
   * Recherche rapide d'entreprises par nom
   */
  async quickSearchByName(name: string, limit: number = 10): Promise<Business[]> {
    const result = await this.searchBusinesses({
      search: name,
      limit,
      isActive: true
    });
    return result.data as Business[];
  }

  /**
   * Recherche d'entreprises par secteur
   */
  async getBusinessesBySector(businessSectorId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Business>> {
    return this.searchBusinesses({
      businessSectorId,
      page,
      limit,
      isActive: true
    });
  }

  /**
   * Recherche d'entreprises par ville
   */
  async getBusinessesByCity(city: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Business>> {
    return this.searchBusinesses({
      city,
      page,
      limit,
      isActive: true
    });
  }

  // ==========================================
  // 🏭 Gestion des Secteurs d'Activité
  // ==========================================

  /**
   * Obtenir tous les secteurs d'activité actifs
   */
  async getActiveBusinessSectors(): Promise<BusinessSector[]> {
    const response = await this.client.get<ApiResponse<BusinessSector[]>>('/business-sectors/active');
    return response.data.data;
  }

  /**
   * Obtenir un secteur d'activité par ID
   */
  async getBusinessSectorById(id: string): Promise<BusinessSector> {
    const response = await this.client.get<ApiResponse<BusinessSector>>(`/business-sectors/${id}`);
    return response.data.data;
  }

  /**
   * Rechercher des secteurs d'activité
   */
  async searchBusinessSectors(search?: string): Promise<BusinessSector[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await this.client.get<ApiResponse<BusinessSector[]>>(`/business-sectors${params}`);
    return response.data.data;
  }

  // ==========================================
  // 🔧 Utilitaires Business
  // ==========================================

  /**
   * Valider les données d'entreprise côté client
   */
  validateBusinessData(data: CreateBusinessRequest | UpdateBusinessRequest): string[] {
    const errors: string[] = [];

    // Validation nom d'entreprise
    if ('name' in data && data.name !== undefined) {
      if (!data.name.trim()) {
        errors.push('Business name is required');
      } else if (data.name.length < 2) {
        errors.push('Business name must be at least 2 characters');
      } else if (data.name.length > 100) {
        errors.push('Business name must not exceed 100 characters');
      }
    }

    // Validation secteur d'activité
    if ('businessSectorId' in data && data.businessSectorId !== undefined) {
      if (!data.businessSectorId.trim()) {
        errors.push('Business sector is required');
      } else if (!this.isValidUUID(data.businessSectorId)) {
        errors.push('Invalid business sector ID');
      }
    }

    // Validation adresse
    if ('address' in data && data.address) {
      const addressErrors = this.validateAddress(data.address);
      errors.push(...addressErrors);
    }

    // Validation contact info
    if ('contactInfo' in data && data.contactInfo) {
      const contactErrors = this.validateContactInfo(data.contactInfo);
      errors.push(...contactErrors);
    }

    // Validation horaires
    if ('businessHours' in data && data.businessHours) {
      const hoursErrors = this.validateBusinessHours(data.businessHours);
      errors.push(...hoursErrors);
    }

    return errors;
  }

  /**
   * Valider une adresse
   */
  private validateAddress(address: Address | Partial<Address>): string[] {
    const errors: string[] = [];

    if ('street' in address && address.street !== undefined) {
      if (!address.street.trim()) {
        errors.push('Street address is required');
      } else if (address.street.length > 200) {
        errors.push('Street address must not exceed 200 characters');
      }
    }

    if ('city' in address && address.city !== undefined) {
      if (!address.city.trim()) {
        errors.push('City is required');
      } else if (address.city.length > 100) {
        errors.push('City name must not exceed 100 characters');
      }
    }

    if ('postalCode' in address && address.postalCode !== undefined) {
      if (!address.postalCode.trim()) {
        errors.push('Postal code is required');
      } else if (!/^[\w\s-]{3,10}$/.test(address.postalCode)) {
        errors.push('Invalid postal code format');
      }
    }

    if ('country' in address && address.country !== undefined) {
      if (!address.country.trim()) {
        errors.push('Country is required');
      } else if (address.country.length > 50) {
        errors.push('Country name must not exceed 50 characters');
      }
    }

    return errors;
  }

  /**
   * Valider les informations de contact
   */
  private validateContactInfo(contactInfo: ContactInfo | Partial<ContactInfo>): string[] {
    const errors: string[] = [];

    if ('email' in contactInfo && contactInfo.email) {
      if (!this.isValidEmail(contactInfo.email)) {
        errors.push('Invalid email format');
      }
    }

    if ('phone' in contactInfo && contactInfo.phone) {
      if (!this.isValidPhone(contactInfo.phone)) {
        errors.push('Invalid phone number format');
      }
    }

    if ('website' in contactInfo && contactInfo.website) {
      if (!this.isValidURL(contactInfo.website)) {
        errors.push('Invalid website URL format');
      }
    }

    return errors;
  }

  /**
   * Valider les horaires d'ouverture
   */
  private validateBusinessHours(businessHours: BusinessHours | Partial<BusinessHours>): string[] {
    const errors: string[] = [];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

    days.forEach(day => {
      if (day in businessHours && businessHours[day]) {
        const timeSlots = businessHours[day];
        if (timeSlots) {
          timeSlots.forEach((slot, index) => {
            const slotErrors = this.validateTimeSlot(slot, `${day}[${index}]`);
            errors.push(...slotErrors);
          });
        }
      }
    });

    return errors;
  }

  /**
   * Valider un créneau horaire
   */
  private validateTimeSlot(slot: TimeSlot, context: string): string[] {
    const errors: string[] = [];

    if (!this.isValidTimeFormat(slot.start)) {
      errors.push(`Invalid start time format for ${context}`);
    }

    if (!this.isValidTimeFormat(slot.end)) {
      errors.push(`Invalid end time format for ${context}`);
    }

    if (this.isValidTimeFormat(slot.start) && this.isValidTimeFormat(slot.end)) {
      if (this.timeToMinutes(slot.start) >= this.timeToMinutes(slot.end)) {
        errors.push(`Start time must be before end time for ${context}`);
      }
    }

    return errors;
  }

  /**
   * Validation UUID
   */
  private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Validation email
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation téléphone
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Validation URL
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validation format d'heure (HH:mm)
   */
  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Convertir heure en minutes depuis minuit
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  /**
   * Formater l'adresse pour l'affichage
   */
  static formatAddress(address: Address): string {
    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.country
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Formater les horaires d'ouverture pour l'affichage
   */
  static formatBusinessHours(businessHours: BusinessHours): string {
    const dayNames = {
      monday: 'Lundi',
      tuesday: 'Mardi',
      wednesday: 'Mercredi',
      thursday: 'Jeudi',
      friday: 'Vendredi',
      saturday: 'Samedi',
      sunday: 'Dimanche'
    };

    const formatted: string[] = [];

    Object.entries(dayNames).forEach(([key, dayName]) => {
      const dayKey = key as keyof BusinessHours;
      const slots = businessHours[dayKey];

      if (slots && slots.length > 0) {
        const timeRanges = slots.map(slot => `${slot.start}-${slot.end}`).join(', ');
        formatted.push(`${dayName}: ${timeRanges}`);
      } else {
        formatted.push(`${dayName}: Fermé`);
      }
    });

    return formatted.join('\n');
  }

  /**
   * Vérifier si l'entreprise est ouverte à un moment donné
   */
  static isBusinessOpen(businessHours: BusinessHours, date: Date): boolean {
    const dayOfWeek = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const currentMinutes = date.getHours() * 60 + date.getMinutes();

    const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayKey = dayKeys[dayOfWeek] as keyof BusinessHours;

    const slots = businessHours[dayKey];

    if (!slots || slots.length === 0) {
      return false;
    }

    return slots.some(slot => {
      const startMinutes = this.timeToMinutes(slot.start);
      const endMinutes = this.timeToMinutes(slot.end);
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    });
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }
}

export default BusinessService;
