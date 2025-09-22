/**
 * 🕐 Use Case : Gestion des Horaires d'Ouverture Business
 *
 * Permet de :
 * - Consulter les horaires actuels
 * - Mettre à jour les horaires hebdomadaires
 * - Ajouter/modifier des dates spéciales
 * - Vérifier la disponibilité
 */

import {
  BusinessHours,
  DaySchedule,
  SpecialDate,
} from '../../../domain/value-objects/business-hours.value-object';
import { BusinessId } from '../../../domain/value-objects/business-id.value-object';
import { BusinessRepository } from '../../../domain/repositories/business.repository.interface';
import {
  BusinessNotFoundError,
  BusinessValidationError,
} from '../../exceptions/application.exceptions';
import { I18nService } from '../../ports/i18n.port';
import { Logger } from '../../ports/logger.port';

// Request & Response DTOs
export interface GetBusinessHoursRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
}

export interface GetBusinessHoursResponse {
  readonly businessId: string;
  readonly businessName: string;
  readonly weeklySchedule: DaySchedule[];
  readonly specialDates: SpecialDate[];
  readonly timezone: string;
  readonly isCurrentlyOpen: boolean;
  readonly nextOpeningTime?: {
    readonly date: string;
    readonly time: string;
  };
}

export interface UpdateBusinessHoursRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly weeklySchedule: DaySchedule[];
  readonly specialDates?: SpecialDate[];
  readonly timezone?: string;
}

export interface UpdateBusinessHoursResponse {
  readonly businessId: string;
  readonly message: string;
  readonly updatedAt: Date;
}

export interface AddSpecialDateRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly date: Date;
  readonly isOpen: boolean;
  readonly timeSlots?: Array<{ start: string; end: string; name?: string }>;
  readonly reason: string;
}

export interface AddSpecialDateResponse {
  readonly businessId: string;
  readonly specialDate: SpecialDate;
  readonly message: string;
}

export interface CheckBusinessAvailabilityRequest {
  readonly businessId: string;
  readonly date: Date;
  readonly time?: string;
}

export interface CheckBusinessAvailabilityResponse {
  readonly businessId: string;
  readonly date: Date;
  readonly isOpenOnDate: boolean;
  readonly availableTimeSlots: Array<{
    start: string;
    end: string;
    name?: string;
  }>;
  readonly isOpenAtTime?: boolean;
  readonly nextAvailableSlot?: { start: string; end: string };
}

export class ManageBusinessHoursUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly logger: Logger,
    private readonly i18n: I18nService,
  ) {}

  async getBusinessHours(
    request: GetBusinessHoursRequest,
  ): Promise<GetBusinessHoursResponse> {
    console.log('Getting business hours', {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
    });

    // 1. Récupérer le business
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new BusinessNotFoundError(
        this.i18n.translate('business.errors.notFound', {
          id: request.businessId,
        }),
      );
    }

    // 2. Vérifier les permissions (propriétaire ou admin)
    await this.checkBusinessAccessPermission(
      business,
      request.requestingUserId,
    );

    // 3. Récupérer les horaires
    const businessHours = business.businessHours;
    const now = new Date();

    // 4. Vérifier si ouvert actuellement
    const isCurrentlyOpen = business.isOpenAt(now, this.formatTime(now));

    // 5. Trouver la prochaine ouverture si fermé
    let nextOpeningTime: { date: string; time: string } | undefined;
    if (!isCurrentlyOpen) {
      nextOpeningTime = this.findNextOpeningTime(businessHours, now);
    }

    const response: GetBusinessHoursResponse = {
      businessId: request.businessId,
      businessName: business.name.getValue(),
      weeklySchedule: businessHours.getWeeklySchedule(),
      specialDates: businessHours.getSpecialDates(),
      timezone: businessHours.getTimezone(),
      isCurrentlyOpen,
      nextOpeningTime,
    };

    console.log('Business hours retrieved successfully', {
      businessId: request.businessId,
    });
    return response;
  }

  async updateBusinessHours(
    request: UpdateBusinessHoursRequest,
  ): Promise<UpdateBusinessHoursResponse> {
    this.logger.debug('Updating business hours', {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
    });

    // 1. Récupérer le business
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new BusinessNotFoundError(
        this.i18n.translate('business.errors.notFound', {
          id: request.businessId,
        }),
      );
    }

    // 2. Vérifier les permissions
    await this.checkBusinessAccessPermission(
      business,
      request.requestingUserId,
    );

    // 3. Valider et créer les nouveaux horaires
    try {
      const newBusinessHours = new BusinessHours(
        request.weeklySchedule,
        request.specialDates || business.businessHours.getSpecialDates(),
        request.timezone || business.businessHours.getTimezone(),
      );

      // 4. Mettre à jour le business
      business.updateBusinessHours(newBusinessHours);

      // 5. Sauvegarder
      await this.businessRepository.save(business);

      const response: UpdateBusinessHoursResponse = {
        businessId: request.businessId,
        message: this.i18n.translate('business.hours.updated'),
        updatedAt: business.updatedAt,
      };

      this.logger.info('Business hours updated successfully', {
        businessId: request.businessId,
        openDaysCount: newBusinessHours.getOpenDaysCount(),
      });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        'Failed to update business hours',
        error instanceof Error ? error : new Error(errorMessage),
        {
          businessId: request.businessId,
          errorMessage: errorMessage,
        },
      );

      throw new BusinessValidationError(
        'businessHours',
        request.weeklySchedule,
        errorMessage,
      );
    }
  }

  async addSpecialDate(
    request: AddSpecialDateRequest,
  ): Promise<AddSpecialDateResponse> {
    this.logger.debug('Adding special date', {
      businessId: request.businessId,
      date: request.date.toISOString(),
      isOpen: request.isOpen,
    });

    // 1. Récupérer le business
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new BusinessNotFoundError(
        this.i18n.translate('business.errors.notFound', {
          id: request.businessId,
        }),
      );
    }

    // 2. Vérifier les permissions
    await this.checkBusinessAccessPermission(
      business,
      request.requestingUserId,
    );

    // 3. Créer la date spéciale
    const specialDate: SpecialDate = {
      date: request.date,
      isOpen: request.isOpen,
      timeSlots: request.timeSlots || undefined,
      reason: request.reason,
    };

    try {
      // 4. Ajouter à businessHours
      const updatedHours = business.businessHours.withSpecialDate(specialDate);
      business.updateBusinessHours(updatedHours);

      // 5. Sauvegarder
      await this.businessRepository.save(business);

      const response: AddSpecialDateResponse = {
        businessId: request.businessId,
        specialDate,
        message: this.i18n.translate('business.hours.specialDateAdded'),
      };

      this.logger.info('Special date added successfully', {
        businessId: request.businessId,
        date: request.date.toISOString(),
        reason: request.reason,
      });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error('Failed to add special date', undefined, {
        businessId: request.businessId,
        error: errorMessage,
      });

      throw new BusinessValidationError(
        'specialDate',
        request.date,
        errorMessage,
      );
    }
  }

  async checkAvailability(
    request: CheckBusinessAvailabilityRequest,
  ): Promise<CheckBusinessAvailabilityResponse> {
    // 1. Récupérer le business (accès public pour vérification disponibilité)
    const businessId = BusinessId.create(request.businessId);
    const business = await this.businessRepository.findById(businessId);

    if (!business) {
      throw new BusinessNotFoundError(
        this.i18n.translate('business.errors.notFound', {
          id: request.businessId,
        }),
      );
    }

    // 2. Vérifier si le business peut accepter des RDV
    if (!business.canAcceptAppointments()) {
      return {
        businessId: request.businessId,
        date: request.date,
        isOpenOnDate: false,
        availableTimeSlots: [],
        isOpenAtTime: false,
      };
    }

    // 3. Vérifier la disponibilité pour la date
    const isOpenOnDate = business.isOpenOnDate(request.date);
    const availableTimeSlots = business.getTimeSlotsForDate(request.date);

    // 4. Vérifier l'heure spécifique si fournie
    let isOpenAtTime: boolean | undefined;
    if (request.time) {
      isOpenAtTime = business.isOpenAt(request.date, request.time);
    }

    // 5. Trouver le prochain créneau disponible si fermé à l'heure demandée
    let nextAvailableSlot: { start: string; end: string } | undefined;
    if (request.time && !isOpenAtTime && availableTimeSlots.length > 0) {
      nextAvailableSlot = this.findNextAvailableSlot(
        availableTimeSlots,
        request.time,
      );
    }

    return {
      businessId: request.businessId,
      date: request.date,
      isOpenOnDate,
      availableTimeSlots,
      isOpenAtTime,
      nextAvailableSlot,
    };
  }

  // Private helper methods
  private async checkBusinessAccessPermission(
    business: any,
    requestingUserId: string,
  ): Promise<void> {
    // TODO: Implémenter la vérification des permissions
    // - Propriétaire du business
    // - Admin de l'organisation
    // - Super admin

    // Pour l'instant, on permet l'accès (à implémenter selon la logique métier)
    this.logger.debug('Checking business access permission', {
      businessId: business.id.getValue(),
      requestingUserId,
    });
  }

  private formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5); // HH:MM
  }

  private findNextOpeningTime(
    businessHours: BusinessHours,
    fromDate: Date,
  ): { date: string; time: string } | undefined {
    // Chercher dans les 7 prochains jours
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(fromDate);
      checkDate.setDate(checkDate.getDate() + i);

      if (businessHours.isOpenOnDate(checkDate)) {
        const timeSlots = businessHours.getTimeSlotsForDate(checkDate);
        if (timeSlots.length > 0) {
          // Si c'est aujourd'hui, vérifier si il y a encore des créneaux ouverts
          if (i === 0) {
            const currentTime = this.formatTime(fromDate);
            const availableSlot = this.findNextAvailableSlot(
              timeSlots,
              currentTime,
            );
            if (availableSlot) {
              return {
                date: checkDate.toISOString().split('T')[0],
                time: availableSlot.start,
              };
            }
          } else {
            // Jour suivant, prendre le premier créneau
            return {
              date: checkDate.toISOString().split('T')[0],
              time: timeSlots[0].start,
            };
          }
        }
      }
    }

    return undefined; // Aucune ouverture dans les 7 prochains jours
  }

  private findNextAvailableSlot(
    timeSlots: Array<{ start: string; end: string }>,
    currentTime: string,
  ): { start: string; end: string } | undefined {
    return timeSlots.find((slot) => slot.start > currentTime);
  }
}
