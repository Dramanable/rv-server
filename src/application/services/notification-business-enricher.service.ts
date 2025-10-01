/**
 * 🏢 NOTIFICATION BUSINESS ENRICHER SERVICE
 * ✅ Enrichit les templates de notification avec les données business
 * ✅ Support logo, images, contact info complètes
 * ✅ Intégration i18n pour templates multilingues
 */

import { Business } from '@domain/entities/business.entity';
import { BusinessRepository } from '@domain/repositories/business.repository';
import { BusinessId } from '@domain/value-objects/business-id.value-object';
import { TemplateVariables } from '@domain/value-objects/notification-template.value-object';
import {
  INotificationBusinessEnricher,
  EnrichBusinessDataRequest,
} from '@application/ports/notification-business-enricher.port';

export class NotificationBusinessEnricherService
  implements INotificationBusinessEnricher
{
  constructor(private readonly businessRepository: BusinessRepository) {}

  /**
   * Enrichit les variables de template avec toutes les données business
   */
  async enrichTemplateWithBusinessData(
    request: EnrichBusinessDataRequest,
  ): Promise<TemplateVariables> {
    // Récupérer les données de l'entreprise
    const business = await this.businessRepository.findById(
      BusinessId.fromString(request.businessId),
    );

    if (!business) {
      throw new Error(`Business not found: ${request.businessId}`);
    }

    // Extraire les variables métier
    const businessVariables = this.extractBusinessVariables(business);

    // Enrichir avec les informations patient/client
    const clientBeneficiaryVariables = this.extractClientBeneficiaryVariables(
      request.baseVariables,
    );

    // Combiner avec les variables de base
    const enrichedVariables: TemplateVariables = {
      ...request.baseVariables,
      ...businessVariables,
      ...clientBeneficiaryVariables,
    };

    return enrichedVariables;
  }

  /**
   * Extrait et enrichit les variables client/bénéficiaire pour les rendez-vous
   * Gère les cas où une personne réserve pour elle-même ou pour un proche
   */
  private extractClientBeneficiaryVariables(
    baseVariables: TemplateVariables,
  ): Partial<TemplateVariables> {
    // Si appointmentData est présent et contient des informations bookedBy
    if (
      baseVariables.appointmentData &&
      typeof baseVariables.appointmentData === 'object'
    ) {
      const appointmentData = baseVariables.appointmentData as any;
      const clientInfo = appointmentData.clientInfo;
      const bookedBy = clientInfo?.bookedBy;

      if (bookedBy) {
        // C'est un rendez-vous pris pour quelqu'un d'autre
        const beneficiaryName =
          `${clientInfo.firstName} ${clientInfo.lastName}`.trim();
        const clientName = `${bookedBy.firstName} ${bookedBy.lastName}`.trim();

        return {
          // Informations du bénéficiaire (celui qui reçoit le service)
          beneficiaryName,
          beneficiaryAge: clientInfo.dateOfBirth
            ? this.calculateAge(clientInfo.dateOfBirth).toString()
            : undefined,

          // Informations du client (celui qui a réservé)
          clientName,

          // Relation et contexte
          relationshipToBeneficiary: this.formatRelationship(
            bookedBy.relationship,
          ),
          relationshipDescription: bookedBy.relationshipDescription,
          isBookingForSelf: false,

          // Messages contextuels adaptés
          contextualGreeting: `Bonjour ${clientName}`,
          contextualSubject: `Rendez-vous de ${beneficiaryName}`,

          // ✅ Alias pour compatibilité avec templates existants
          patientName: beneficiaryName,
          patientAge: clientInfo.dateOfBirth
            ? this.calculateAge(clientInfo.dateOfBirth).toString()
            : undefined,
          relationshipToPatient: this.formatRelationship(bookedBy.relationship),
        };
      } else {
        // Rendez-vous pour soi-même
        const beneficiaryName =
          `${clientInfo.firstName} ${clientInfo.lastName}`.trim();

        return {
          beneficiaryName,
          clientName: beneficiaryName, // Même personne
          beneficiaryAge: clientInfo.dateOfBirth
            ? this.calculateAge(clientInfo.dateOfBirth).toString()
            : undefined,
          relationshipToBeneficiary: 'self',
          isBookingForSelf: true,
          contextualGreeting: `Bonjour ${beneficiaryName}`,
          contextualSubject: `Votre rendez-vous`,

          // ✅ Alias pour compatibilité avec templates existants
          patientName: beneficiaryName,
          patientAge: clientInfo.dateOfBirth
            ? this.calculateAge(clientInfo.dateOfBirth).toString()
            : undefined,
          relationshipToPatient: 'self',
        };
      }
    }

    // Par défaut, utiliser les variables existantes
    const defaultName = String(
      baseVariables.clientName || baseVariables.userName || '',
    );
    return {
      beneficiaryName: defaultName,
      clientName: defaultName,
      isBookingForSelf: true,
      relationshipToBeneficiary: 'self',
      // Alias pour compatibilité
      patientName: defaultName,
      relationshipToPatient: 'self',
    };
  }

  /**
   * Formate la relation en français lisible
   */
  private formatRelationship(relationship: string): string {
    const relationshipMap: Record<string, string> = {
      SPOUSE: 'conjoint(e)',
      PARENT: 'parent',
      CHILD: 'enfant',
      SIBLING: 'frère/sœur',
      GUARDIAN: 'tuteur/tutrice',
      FAMILY_MEMBER: 'membre de la famille',
      FRIEND: 'ami(e)',
      OTHER: 'proche',
    };

    return relationshipMap[relationship] || relationship.toLowerCase();
  }

  /**
   * Calcule l'âge depuis une date de naissance
   */
  private calculateAge(dateOfBirth: Date | string): number {
    const birthDate =
      typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Extrait toutes les variables business depuis l'entité
   */
  private extractBusinessVariables(
    business: Business,
  ): Partial<TemplateVariables> {
    const address = business.address;
    const contactInfo = business.contactInfo;
    const settings = business.settings;
    const branding = business.branding;
    const gallery = business.gallery;

    // Extraire les URLs d'images
    const logoUrl = branding?.logoUrl?.getUrl();
    const coverImageUrl = branding?.coverImageUrl?.getUrl();

    return {
      businessName: business.name.getValue(),
      businessEmail: contactInfo?.primaryEmail?.getValue(),
      businessPhone: contactInfo?.primaryPhone?.getValue(),
      businessAddress: address ? address.getFullAddress() : undefined,
      businessWebsite: contactInfo?.website,
      businessDescription: business.description,
      // Images et branding
      businessLogo: logoUrl,
      businessCoverImage: coverImageUrl,
      brandPrimaryColor: branding?.brandColors?.primary || '#007bff',
      brandSecondaryColor: branding?.brandColors?.secondary || '#6c757d',
      // Réseaux sociaux depuis contactInfo
      facebookUrl: contactInfo?.socialMedia?.facebook,
      twitterUrl: contactInfo?.socialMedia?.twitter,
      instagramUrl: contactInfo?.socialMedia?.instagram,
      linkedinUrl: contactInfo?.socialMedia?.linkedin,
      // Informations supplémentaires
      businessTimezone: settings?.timezone,
      businessLocale: settings?.language,
      // URLs d'action
      ...this.generateBusinessActionUrls(business.id.getValue()),
    };
  }

  private generateBusinessActionUrls(
    businessId: string,
  ): Partial<TemplateVariables> {
    const baseUrl = process.env.FRONTEND_BASE_URL || 'https://app.example.com';

    return {
      bookingUrl: `${baseUrl}/business/${businessId}/book`,
      cancelUrl: `${baseUrl}/appointments/cancel`,
      rescheduleUrl: `${baseUrl}/appointments/reschedule`,
      confirmUrl: `${baseUrl}/appointments/confirm`,
      businessProfileUrl: `${baseUrl}/business/${businessId}`,
      businessServicesUrl: `${baseUrl}/business/${businessId}/services`,
    };
  }

  /**
   * Valide que toutes les variables business requises sont présentes
   */
  validateBusinessVariables(variables: TemplateVariables): {
    isValid: boolean;
    missingVariables: string[];
  } {
    const requiredBusinessVariables = [
      'businessName',
      'businessPhone',
      'businessEmail',
      'businessAddress',
      'businessCity',
    ];

    const missingVariables = requiredBusinessVariables.filter(
      (variable) => !variables[variable],
    );

    return {
      isValid: missingVariables.length === 0,
      missingVariables,
    };
  }
}
