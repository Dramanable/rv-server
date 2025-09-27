/**
 * 🎭 ÉNUMÉRATIONS SPÉCIALISÉES - Rôles du Personnel
 *
 * Définit les rôles spécifiques du personnel pour l'entité Staff
 * Compatible avec UserRole mais plus granulaire pour les employés
 */

import { UserRole } from './user-role.enum';

/**
 * 🏥 Rôles du Personnel - Mapping avec UserRole
 */
export enum StaffRole {
  // 🔴 Direction & Propriété
  OWNER = 'OWNER', // = BUSINESS_OWNER
  DIRECTOR = 'DIRECTOR', // = BUSINESS_ADMIN

  // 🟡 Management Opérationnel
  SITE_MANAGER = 'SITE_MANAGER', // = LOCATION_MANAGER
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD', // = DEPARTMENT_HEAD
  TEAM_LEAD = 'TEAM_LEAD', // Sous-catégorie de DEPARTMENT_HEAD

  // 🟢 Praticiens Professionnels
  SENIOR_DOCTOR = 'SENIOR_DOCTOR', // = SENIOR_PRACTITIONER
  DOCTOR = 'DOCTOR', // = PRACTITIONER
  RESIDENT = 'RESIDENT', // = JUNIOR_PRACTITIONER

  SENIOR_DENTIST = 'SENIOR_DENTIST', // = SENIOR_PRACTITIONER
  DENTIST = 'DENTIST', // = PRACTITIONER
  DENTAL_STUDENT = 'DENTAL_STUDENT', // = JUNIOR_PRACTITIONER

  SENIOR_LAWYER = 'SENIOR_LAWYER', // = SENIOR_PRACTITIONER
  LAWYER = 'LAWYER', // = PRACTITIONER
  PARALEGAL = 'PARALEGAL', // = JUNIOR_PRACTITIONER

  SENIOR_THERAPIST = 'SENIOR_THERAPIST', // = SENIOR_PRACTITIONER
  THERAPIST = 'THERAPIST', // = PRACTITIONER
  THERAPY_INTERN = 'THERAPY_INTERN', // = JUNIOR_PRACTITIONER

  SENIOR_STYLIST = 'SENIOR_STYLIST', // = SENIOR_PRACTITIONER
  STYLIST = 'STYLIST', // = PRACTITIONER
  JUNIOR_STYLIST = 'JUNIOR_STYLIST', // = JUNIOR_PRACTITIONER

  SENIOR_CONSULTANT = 'SENIOR_CONSULTANT', // = SENIOR_PRACTITIONER
  CONSULTANT = 'CONSULTANT', // = PRACTITIONER
  JUNIOR_CONSULTANT = 'JUNIOR_CONSULTANT', // = JUNIOR_PRACTITIONER

  // 🔵 Personnel de Support Spécialisé
  HEAD_RECEPTIONIST = 'HEAD_RECEPTIONIST', // Réceptionniste chef
  RECEPTIONIST = 'RECEPTIONIST', // = RECEPTIONIST

  SENIOR_ASSISTANT = 'SENIOR_ASSISTANT', // Assistant expérimenté
  ASSISTANT = 'ASSISTANT', // = ASSISTANT

  APPOINTMENT_COORDINATOR = 'APPOINTMENT_COORDINATOR', // = SCHEDULER
  SCHEDULER = 'SCHEDULER', // = SCHEDULER

  // 🟣 Rôles Spécialisés par Domaine
  HYGIENIST = 'HYGIENIST', // Hygiéniste dentaire
  NURSE = 'NURSE', // Infirmière
  TECHNICIAN = 'TECHNICIAN', // Technicien
  INTERPRETER = 'INTERPRETER', // Interprète
  SECURITY = 'SECURITY', // Sécurité
  MAINTENANCE = 'MAINTENANCE', // Maintenance

  // 🔶 Rôles Temporaires
  SUBSTITUTE = 'SUBSTITUTE', // Remplaçant
  TEMP_STAFF = 'TEMP_STAFF', // Personnel temporaire
  INTERN = 'INTERN', // Stagiaire
  VOLUNTEER = 'VOLUNTEER', // Bénévole
}

/**
 * 📊 Statuts du Personnel
 */
export enum StaffStatus {
  ACTIVE = 'ACTIVE', // Actif
  INACTIVE = 'INACTIVE', // Inactif
  ON_LEAVE = 'ON_LEAVE', // En congé
  SUSPENDED = 'SUSPENDED', // Suspendu
  TERMINATED = 'TERMINATED', // Licencié
  RETIRED = 'RETIRED', // Retraité
  ON_PROBATION = 'ON_PROBATION', // Période d'essai
}

/**
 * 🎯 Mapping StaffRole vers UserRole
 * Permet la conversion automatique pour les permissions
 */
export const STAFF_TO_USER_ROLE_MAPPING: Record<
  StaffRole,
  import('./user-role.enum').UserRole
> = {
  // Direction
  [StaffRole.OWNER]: UserRole.BUSINESS_OWNER,
  [StaffRole.DIRECTOR]: UserRole.BUSINESS_ADMIN,

  // Management
  [StaffRole.SITE_MANAGER]: UserRole.LOCATION_MANAGER,
  [StaffRole.DEPARTMENT_HEAD]: UserRole.DEPARTMENT_HEAD,
  [StaffRole.TEAM_LEAD]: UserRole.DEPARTMENT_HEAD,

  // Praticiens Médicaux
  [StaffRole.SENIOR_DOCTOR]: UserRole.SENIOR_PRACTITIONER,
  [StaffRole.DOCTOR]: UserRole.PRACTITIONER,
  [StaffRole.RESIDENT]: UserRole.JUNIOR_PRACTITIONER,

  // Praticiens Dentaires
  [StaffRole.SENIOR_DENTIST]: UserRole.SENIOR_PRACTITIONER,
  [StaffRole.DENTIST]: UserRole.PRACTITIONER,
  [StaffRole.DENTAL_STUDENT]: UserRole.JUNIOR_PRACTITIONER,

  // Praticiens Juridiques
  [StaffRole.SENIOR_LAWYER]: UserRole.SENIOR_PRACTITIONER,
  [StaffRole.LAWYER]: UserRole.PRACTITIONER,
  [StaffRole.PARALEGAL]: UserRole.JUNIOR_PRACTITIONER,

  // Thérapeutes
  [StaffRole.SENIOR_THERAPIST]: UserRole.SENIOR_PRACTITIONER,
  [StaffRole.THERAPIST]: UserRole.PRACTITIONER,
  [StaffRole.THERAPY_INTERN]: UserRole.JUNIOR_PRACTITIONER,

  // Beauté
  [StaffRole.SENIOR_STYLIST]: UserRole.SENIOR_PRACTITIONER,
  [StaffRole.STYLIST]: UserRole.PRACTITIONER,
  [StaffRole.JUNIOR_STYLIST]: UserRole.JUNIOR_PRACTITIONER,

  // Conseil
  [StaffRole.SENIOR_CONSULTANT]: UserRole.SENIOR_PRACTITIONER,
  [StaffRole.CONSULTANT]: UserRole.PRACTITIONER,
  [StaffRole.JUNIOR_CONSULTANT]: UserRole.JUNIOR_PRACTITIONER,

  // Support
  [StaffRole.HEAD_RECEPTIONIST]: UserRole.RECEPTIONIST,
  [StaffRole.RECEPTIONIST]: UserRole.RECEPTIONIST,
  [StaffRole.SENIOR_ASSISTANT]: UserRole.ASSISTANT,
  [StaffRole.ASSISTANT]: UserRole.ASSISTANT,
  [StaffRole.APPOINTMENT_COORDINATOR]: UserRole.SCHEDULER,
  [StaffRole.SCHEDULER]: UserRole.SCHEDULER,

  // Spécialisés
  [StaffRole.HYGIENIST]: UserRole.PRACTITIONER,
  [StaffRole.NURSE]: UserRole.ASSISTANT,
  [StaffRole.TECHNICIAN]: UserRole.ASSISTANT,
  [StaffRole.INTERPRETER]: UserRole.ASSISTANT,
  [StaffRole.SECURITY]: UserRole.ASSISTANT,
  [StaffRole.MAINTENANCE]: UserRole.ASSISTANT,

  // Temporaires
  [StaffRole.SUBSTITUTE]: UserRole.PRACTITIONER,
  [StaffRole.TEMP_STAFF]: UserRole.ASSISTANT,
  [StaffRole.INTERN]: UserRole.JUNIOR_PRACTITIONER,
  [StaffRole.VOLUNTEER]: UserRole.ASSISTANT,
};

/**
 * 🎭 Groupes Fonctionnels de Rôles Staff
 */
export const STAFF_ROLE_GROUPS = {
  MANAGEMENT: [
    StaffRole.OWNER,
    StaffRole.DIRECTOR,
    StaffRole.SITE_MANAGER,
    StaffRole.DEPARTMENT_HEAD,
    StaffRole.TEAM_LEAD,
  ],

  MEDICAL_PRACTITIONERS: [
    StaffRole.SENIOR_DOCTOR,
    StaffRole.DOCTOR,
    StaffRole.RESIDENT,
    StaffRole.SENIOR_DENTIST,
    StaffRole.DENTIST,
    StaffRole.DENTAL_STUDENT,
    StaffRole.HYGIENIST,
    StaffRole.NURSE,
  ],

  LEGAL_PRACTITIONERS: [
    StaffRole.SENIOR_LAWYER,
    StaffRole.LAWYER,
    StaffRole.PARALEGAL,
  ],

  THERAPY_PRACTITIONERS: [
    StaffRole.SENIOR_THERAPIST,
    StaffRole.THERAPIST,
    StaffRole.THERAPY_INTERN,
  ],

  BEAUTY_PRACTITIONERS: [
    StaffRole.SENIOR_STYLIST,
    StaffRole.STYLIST,
    StaffRole.JUNIOR_STYLIST,
  ],

  CONSULTANTS: [
    StaffRole.SENIOR_CONSULTANT,
    StaffRole.CONSULTANT,
    StaffRole.JUNIOR_CONSULTANT,
  ],

  SUPPORT_STAFF: [
    StaffRole.HEAD_RECEPTIONIST,
    StaffRole.RECEPTIONIST,
    StaffRole.SENIOR_ASSISTANT,
    StaffRole.ASSISTANT,
    StaffRole.APPOINTMENT_COORDINATOR,
    StaffRole.SCHEDULER,
  ],

  TECHNICAL_STAFF: [
    StaffRole.TECHNICIAN,
    StaffRole.MAINTENANCE,
    StaffRole.SECURITY,
  ],

  TEMPORARY_STAFF: [
    StaffRole.SUBSTITUTE,
    StaffRole.TEMP_STAFF,
    StaffRole.INTERN,
    StaffRole.VOLUNTEER,
  ],
} as const;

/**
 * 🎯 Niveaux de Séniorité
 */
export enum SeniorityLevel {
  TRAINEE = 'TRAINEE', // Stagiaire/apprenti
  JUNIOR = 'JUNIOR', // Junior
  REGULAR = 'REGULAR', // Standard
  SENIOR = 'SENIOR', // Senior
  LEAD = 'LEAD', // Chef d'équipe
  MANAGER = 'MANAGER', // Manager
  DIRECTOR = 'DIRECTOR', // Directeur
  OWNER = 'OWNER', // Propriétaire
}

/**
 * 🏅 Certifications et Qualifications
 */
export enum CertificationType {
  // Médical
  MEDICAL_LICENSE = 'MEDICAL_LICENSE',
  DENTAL_LICENSE = 'DENTAL_LICENSE',
  NURSING_LICENSE = 'NURSING_LICENSE',
  PHARMACY_LICENSE = 'PHARMACY_LICENSE',

  // Juridique
  BAR_ADMISSION = 'BAR_ADMISSION',
  NOTARY_LICENSE = 'NOTARY_LICENSE',

  // Beauté & Bien-être
  COSMETOLOGY_LICENSE = 'COSMETOLOGY_LICENSE',
  MASSAGE_THERAPY_LICENSE = 'MASSAGE_THERAPY_LICENSE',
  FITNESS_CERTIFICATION = 'FITNESS_CERTIFICATION',

  // Éducation
  TEACHING_CERTIFICATION = 'TEACHING_CERTIFICATION',
  TRAINING_CERTIFICATION = 'TRAINING_CERTIFICATION',

  // Technique
  TECHNICAL_CERTIFICATION = 'TECHNICAL_CERTIFICATION',
  SAFETY_CERTIFICATION = 'SAFETY_CERTIFICATION',

  // Langues
  LANGUAGE_CERTIFICATION = 'LANGUAGE_CERTIFICATION',
  INTERPRETER_CERTIFICATION = 'INTERPRETER_CERTIFICATION',
}

/**
 * 🛠️ Utilitaires pour les Rôles Staff
 */
export class StaffRoleUtils {
  /**
   * Convertit un StaffRole vers le UserRole équivalent
   */
  static toUserRole(staffRole: StaffRole): import('./user-role.enum').UserRole {
    return STAFF_TO_USER_ROLE_MAPPING[staffRole];
  }

  /**
   * Détermine le niveau de séniorité d'un rôle
   */
  static getSeniorityLevel(staffRole: StaffRole): SeniorityLevel {
    if (staffRole === StaffRole.OWNER) return SeniorityLevel.OWNER;
    if (staffRole === StaffRole.DIRECTOR) return SeniorityLevel.DIRECTOR;

    if (
      [StaffRole.SITE_MANAGER, StaffRole.DEPARTMENT_HEAD].includes(staffRole)
    ) {
      return SeniorityLevel.MANAGER;
    }

    if (staffRole === StaffRole.TEAM_LEAD || staffRole.includes('HEAD_')) {
      return SeniorityLevel.LEAD;
    }

    if (staffRole.includes('SENIOR_')) {
      return SeniorityLevel.SENIOR;
    }

    if (
      staffRole.includes('JUNIOR_') ||
      staffRole.includes('STUDENT') ||
      staffRole === StaffRole.INTERN ||
      staffRole === StaffRole.RESIDENT
    ) {
      return SeniorityLevel.JUNIOR;
    }

    if (staffRole === StaffRole.VOLUNTEER || staffRole.includes('INTERN')) {
      return SeniorityLevel.TRAINEE;
    }

    return SeniorityLevel.REGULAR;
  }

  /**
   * Vérifie si un rôle est de type praticien
   */
  static isPractitionerRole(staffRole: StaffRole): boolean {
    const practitionerGroups: StaffRole[] = [
      ...STAFF_ROLE_GROUPS.MEDICAL_PRACTITIONERS,
      ...STAFF_ROLE_GROUPS.LEGAL_PRACTITIONERS,
      ...STAFF_ROLE_GROUPS.THERAPY_PRACTITIONERS,
      ...STAFF_ROLE_GROUPS.BEAUTY_PRACTITIONERS,
      ...STAFF_ROLE_GROUPS.CONSULTANTS,
    ];

    return practitionerGroups.includes(staffRole);
  }

  /**
   * Vérifie si un rôle nécessite une licence professionnelle
   */
  static requiresLicense(staffRole: StaffRole): boolean {
    const licensedRoles = [
      StaffRole.SENIOR_DOCTOR,
      StaffRole.DOCTOR,
      StaffRole.RESIDENT,
      StaffRole.SENIOR_DENTIST,
      StaffRole.DENTIST,
      StaffRole.SENIOR_LAWYER,
      StaffRole.LAWYER,
      StaffRole.HYGIENIST,
      StaffRole.NURSE,
      StaffRole.SENIOR_THERAPIST,
      StaffRole.THERAPIST,
    ];

    return licensedRoles.includes(staffRole);
  }

  /**
   * Obtient une description du rôle staff
   */
  static getDescription(staffRole: StaffRole): string {
    const descriptions: Record<StaffRole, string> = {
      [StaffRole.OWNER]: "Propriétaire - Responsable ultime de l'entreprise",
      [StaffRole.DIRECTOR]: 'Directeur - Direction générale et stratégie',
      [StaffRole.SITE_MANAGER]:
        "Gestionnaire de Site - Supervision opérationnelle d'un lieu",
      [StaffRole.DEPARTMENT_HEAD]:
        "Chef de Département - Direction d'une spécialité",
      [StaffRole.TEAM_LEAD]:
        "Chef d'Équipe - Leadership d'une équipe spécialisée",

      [StaffRole.SENIOR_DOCTOR]:
        'Médecin Senior - Expert médical avec mentorat',
      [StaffRole.DOCTOR]: 'Médecin - Praticien médical certifié',
      [StaffRole.RESIDENT]: 'Résident - Médecin en spécialisation',

      [StaffRole.SENIOR_DENTIST]:
        'Dentiste Senior - Expert dentaire avec mentorat',
      [StaffRole.DENTIST]: 'Dentiste - Praticien dentaire certifié',
      [StaffRole.DENTAL_STUDENT]: 'Étudiant Dentaire - En formation dentaire',

      [StaffRole.SENIOR_LAWYER]:
        'Avocat Senior - Expert juridique avec mentorat',
      [StaffRole.LAWYER]: 'Avocat - Praticien juridique certifié',
      [StaffRole.PARALEGAL]:
        'Assistant Juridique - Support juridique spécialisé',

      [StaffRole.SENIOR_THERAPIST]:
        'Thérapeute Senior - Expert thérapeutique avec mentorat',
      [StaffRole.THERAPIST]: 'Thérapeute - Praticien thérapeutique certifié',
      [StaffRole.THERAPY_INTERN]:
        'Stagiaire Thérapie - En formation thérapeutique',

      [StaffRole.SENIOR_STYLIST]:
        'Styliste Senior - Expert beauté avec mentorat',
      [StaffRole.STYLIST]: 'Styliste - Praticien beauté certifié',
      [StaffRole.JUNIOR_STYLIST]: 'Styliste Junior - En développement beauté',

      [StaffRole.SENIOR_CONSULTANT]:
        'Consultant Senior - Expert conseil avec mentorat',
      [StaffRole.CONSULTANT]: 'Consultant - Praticien conseil certifié',
      [StaffRole.JUNIOR_CONSULTANT]:
        'Consultant Junior - En développement conseil',

      [StaffRole.HEAD_RECEPTIONIST]:
        "Chef Réceptionniste - Supervision de l'accueil",
      [StaffRole.RECEPTIONIST]:
        'Réceptionniste - Accueil et gestion front office',
      [StaffRole.SENIOR_ASSISTANT]:
        'Assistant Senior - Support administratif expérimenté',
      [StaffRole.ASSISTANT]: 'Assistant - Support administratif général',
      [StaffRole.APPOINTMENT_COORDINATOR]:
        'Coordinateur RDV - Spécialiste planification',
      [StaffRole.SCHEDULER]: 'Planificateur - Gestion des horaires et créneaux',

      [StaffRole.HYGIENIST]: 'Hygiéniste - Soins préventifs dentaires',
      [StaffRole.NURSE]: 'Infirmier/ère - Soins infirmiers spécialisés',
      [StaffRole.TECHNICIAN]: 'Technicien - Support technique spécialisé',
      [StaffRole.INTERPRETER]: 'Interprète - Services de traduction',
      [StaffRole.SECURITY]: 'Sécurité - Surveillance et protection',
      [StaffRole.MAINTENANCE]: 'Maintenance - Entretien et réparations',

      [StaffRole.SUBSTITUTE]: 'Remplaçant - Personnel de remplacement',
      [StaffRole.TEMP_STAFF]: 'Personnel Temporaire - Mission courte durée',
      [StaffRole.INTERN]: 'Stagiaire - Formation pratique',
      [StaffRole.VOLUNTEER]: 'Bénévole - Service volontaire',
    };

    return descriptions[staffRole] || 'Rôle non défini';
  }
}
