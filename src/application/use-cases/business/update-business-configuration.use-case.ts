/**
 * 🎯 Update Business Configuration Use Case
 *
 * Application layer use case for updating business configuration (timezone, currency, locale)
 */

import { BusinessConfiguration } from '@domain/value-objects/business-configuration.value-object';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { BusinessRepository } from '@domain/repositories/business.repository';
import { ApplicationValidationError } from '@application/exceptions/application.exceptions';
import { I18nService } from '@application/ports/i18n.port';
import { Logger } from '@application/ports/logger.port';

export interface UpdateBusinessConfigurationRequest {
  readonly businessId: string;
  readonly requestingUserId: string;
  readonly timezone?: string;
  readonly currency?: string;
  readonly locale?: string;
  readonly firstDayOfWeek?: number;
  readonly businessWeekDays?: number[];
  readonly dateFormat?: string;
  readonly timeFormat?: string;
  readonly numberFormat?: string;
  readonly correlationId: string;
  readonly timestamp: Date;
}

export interface UpdateBusinessConfigurationResponse {
  readonly configuration: BusinessConfiguration;
  readonly updatedAt: Date;
}

export class UpdateBusinessConfigurationUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly i18nService: I18nService,
    private readonly logger: Logger,
  ) {}

  async execute(
    request: UpdateBusinessConfigurationRequest,
  ): Promise<UpdateBusinessConfigurationResponse> {
    this.logger.info('Starting business configuration update', {
      businessId: request.businessId,
      requestingUserId: request.requestingUserId,
      correlationId: request.correlationId,
      hasTimezone: !!request.timezone,
      hasCurrency: !!request.currency,
      hasLocale: !!request.locale,
    });

    try {
      // 1. Validation des paramètres d'entrée
      this.validateRequest(request);

      // 2. Récupération du business
      const businessId = BusinessId.create(request.businessId);
      const business = await this.businessRepository.findById(businessId);
      if (!business) {
        throw new ApplicationValidationError(
          'businessId',
          request.businessId,
          'Business not found',
        );
      }

      // 3. Vérification des permissions
      await this.checkPermissions(business, request.requestingUserId);

      // 4. Construction de la nouvelle configuration
      const currentConfig = business.configuration;
      const updatedConfigData = {
        timezone: request.timezone || currentConfig.getTimezone().getValue(),
        currency: request.currency || currentConfig.getCurrency().getCode(),
        locale: request.locale || currentConfig.getLocale(),
        firstDayOfWeek:
          request.firstDayOfWeek ?? currentConfig.getFirstDayOfWeek(),
        businessWeekDays:
          request.businessWeekDays || currentConfig.getBusinessWeekDays(),
        dateFormat: request.dateFormat || currentConfig.getDateFormat(),
        timeFormat: request.timeFormat || currentConfig.getTimeFormat(),
        numberFormat: request.numberFormat || currentConfig.getNumberFormat(),
      };

      // 5. Validation et création de la nouvelle configuration
      const newConfiguration = BusinessConfiguration.create(updatedConfigData);

      // 6. Mise à jour de l'entité business
      const updatedBusiness = business.updateConfiguration(newConfiguration);

      // 7. Sauvegarde
      await this.businessRepository.save(updatedBusiness);

      this.logger.info('Business configuration updated successfully', {
        businessId: request.businessId,
        correlationId: request.correlationId,
        changes: this.getChanges(currentConfig, newConfiguration),
      });

      return {
        configuration: newConfiguration,
        updatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        'Failed to update business configuration',
        error instanceof Error ? error : new Error('Unknown error'),
      );
      throw error;
    }
  }

  private validateRequest(request: UpdateBusinessConfigurationRequest): void {
    if (!request.businessId || request.businessId.trim().length === 0) {
      throw new ApplicationValidationError(
        'businessId',
        request.businessId,
        'Business ID is required',
      );
    }

    if (
      !request.requestingUserId ||
      request.requestingUserId.trim().length === 0
    ) {
      throw new ApplicationValidationError(
        'requestingUserId',
        request.requestingUserId,
        'Requesting user ID is required',
      );
    }

    // Validation des valeurs optionnelles si présentes
    if (
      request.firstDayOfWeek !== undefined &&
      (request.firstDayOfWeek < 0 || request.firstDayOfWeek > 6)
    ) {
      throw new ApplicationValidationError(
        'firstDayOfWeek',
        request.firstDayOfWeek,
        'First day of week must be between 0 and 6',
      );
    }

    if (request.businessWeekDays && request.businessWeekDays.length === 0) {
      throw new ApplicationValidationError(
        'businessWeekDays',
        request.businessWeekDays,
        'Business week days cannot be empty',
      );
    }
  }

  private async checkPermissions(
    business: any,
    requestingUserId: string,
  ): Promise<void> {
    // TODO: Implémenter la vérification des permissions
    // - Propriétaire du business
    // - Admin de l'organisation
    // - Super admin

    this.logger.debug('Checking business configuration permissions', {
      businessId: business.id.getValue(),
      requestingUserId,
    });

    // Pour l'instant, on permet l'accès (à implémenter selon la logique métier)
  }

  private getChanges(
    oldConfig: BusinessConfiguration,
    newConfig: BusinessConfiguration,
  ): Record<string, any> {
    const changes: Record<string, any> = {};

    if (!oldConfig.getTimezone().equals(newConfig.getTimezone())) {
      changes.timezone = {
        from: oldConfig.getTimezone().getValue(),
        to: newConfig.getTimezone().getValue(),
      };
    }

    if (!oldConfig.getCurrency().equals(newConfig.getCurrency())) {
      changes.currency = {
        from: oldConfig.getCurrency().getCode(),
        to: newConfig.getCurrency().getCode(),
      };
    }

    if (oldConfig.getLocale() !== newConfig.getLocale()) {
      changes.locale = {
        from: oldConfig.getLocale(),
        to: newConfig.getLocale(),
      };
    }

    if (oldConfig.getFirstDayOfWeek() !== newConfig.getFirstDayOfWeek()) {
      changes.firstDayOfWeek = {
        from: oldConfig.getFirstDayOfWeek(),
        to: newConfig.getFirstDayOfWeek(),
      };
    }

    const oldWeekDays = JSON.stringify(oldConfig.getBusinessWeekDays());
    const newWeekDays = JSON.stringify(newConfig.getBusinessWeekDays());
    if (oldWeekDays !== newWeekDays) {
      changes.businessWeekDays = {
        from: oldConfig.getBusinessWeekDays(),
        to: newConfig.getBusinessWeekDays(),
      };
    }

    return changes;
  }
}
