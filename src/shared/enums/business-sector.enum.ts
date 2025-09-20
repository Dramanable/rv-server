/**
 * 🏢 BUSINESS SECTOR ENUM
 *
 * Énumération des secteurs d'activité supportés par la plateforme
 * ✅ GDPR Compliant
 * ✅ Clean Architecture
 */
export enum BusinessSector {
  LEGAL = 'LEGAL', // Avocats, Notaires
  MEDICAL = 'MEDICAL', // Médecins, Dentistes
  HEALTH = 'HEALTH', // Cliniques, Physiothérapie
  BEAUTY = 'BEAUTY', // Coiffeurs, Esthétique
  CONSULTING = 'CONSULTING', // Consultants
  FINANCE = 'FINANCE', // Comptables, Conseillers
  EDUCATION = 'EDUCATION', // Formations, Cours
  WELLNESS = 'WELLNESS', // Massage, Bien-être
  AUTOMOTIVE = 'AUTOMOTIVE', // Garages, Contrôle technique
  OTHER = 'OTHER',
}

/**
 * 🏷️ BUSINESS SECTOR LABELS
 *
 * Labels lisibles pour chaque secteur d'activité
 */
export const BusinessSectorLabels: Record<BusinessSector, string> = {
  [BusinessSector.LEGAL]: 'Juridique',
  [BusinessSector.MEDICAL]: 'Médical',
  [BusinessSector.HEALTH]: 'Santé',
  [BusinessSector.BEAUTY]: 'Beauté & Esthétique',
  [BusinessSector.CONSULTING]: 'Conseil',
  [BusinessSector.FINANCE]: 'Finance',
  [BusinessSector.EDUCATION]: 'Éducation & Formation',
  [BusinessSector.WELLNESS]: 'Bien-être',
  [BusinessSector.AUTOMOTIVE]: 'Automobile',
  [BusinessSector.OTHER]: 'Autre',
};

/**
 * 📋 BUSINESS SECTOR DESCRIPTIONS
 *
 * Descriptions détaillées pour chaque secteur
 */
export const BusinessSectorDescriptions: Record<BusinessSector, string> = {
  [BusinessSector.LEGAL]: 'Avocats, Notaires, Huissiers, Experts juridiques',
  [BusinessSector.MEDICAL]: 'Médecins généralistes et spécialistes, Dentistes',
  [BusinessSector.HEALTH]:
    'Cliniques, Physiothérapie, Ostéopathie, Soins paramédicaux',
  [BusinessSector.BEAUTY]:
    'Coiffeurs, Esthéticiennes, Instituts de beauté, Barbiers',
  [BusinessSector.CONSULTING]: 'Consultants, Coachs, Experts-conseils',
  [BusinessSector.FINANCE]:
    'Comptables, Conseillers financiers, Experts-comptables',
  [BusinessSector.EDUCATION]:
    'Formations professionnelles, Cours particuliers, Écoles',
  [BusinessSector.WELLNESS]:
    'Massage thérapeutique, Spa, Relaxation, Méditation',
  [BusinessSector.AUTOMOTIVE]:
    'Garages automobiles, Contrôle technique, Réparation',
  [BusinessSector.OTHER]: "Autres secteurs d'activité non spécifiés",
};
