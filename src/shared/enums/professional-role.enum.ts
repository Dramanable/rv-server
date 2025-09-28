/**
 * 🏥 Professional Roles in Team Services
 *
 * Définit les rôles professionnels disponibles pour les services multi-professionnels.
 * Chaque rôle a des responsabilités et compétences spécifiques.
 */
export enum ProfessionalRole {
  // 👨‍⚕️ Rôles Médicaux
  DOCTOR = 'DOCTOR',
  SURGEON = 'SURGEON',
  SPECIALIST = 'SPECIALIST',
  NURSE = 'NURSE',
  ANESTHESIOLOGIST = 'ANESTHESIOLOGIST',

  // 🦷 Rôles Dentaires
  DENTIST = 'DENTIST',
  ORTHODONTIST = 'ORTHODONTIST',
  DENTAL_HYGIENIST = 'DENTAL_HYGIENIST',
  DENTAL_ASSISTANT = 'DENTAL_ASSISTANT',

  // 🧠 Rôles Psychologiques/Psychiatriques
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  PSYCHIATRIST = 'PSYCHIATRIST',
  THERAPIST = 'THERAPIST',
  COUNSELOR = 'COUNSELOR',

  // 💪 Rôles Kinésithérapie/Réhabilitation
  PHYSIOTHERAPIST = 'PHYSIOTHERAPIST',
  OCCUPATIONAL_THERAPIST = 'OCCUPATIONAL_THERAPIST',
  SPEECH_THERAPIST = 'SPEECH_THERAPIST',

  // ⚖️ Rôles Juridiques
  LAWYER = 'LAWYER',
  PARALEGAL = 'PARALEGAL',
  LEGAL_ASSISTANT = 'LEGAL_ASSISTANT',
  NOTARY = 'NOTARY',

  // 💼 Rôles Consultatifs
  CONSULTANT = 'CONSULTANT',
  ADVISOR = 'ADVISOR',
  ANALYST = 'ANALYST',
  PROJECT_MANAGER = 'PROJECT_MANAGER',

  // 🎓 Rôles Éducatifs
  TEACHER = 'TEACHER',
  TUTOR = 'TUTOR',
  TRAINING_SPECIALIST = 'TRAINING_SPECIALIST',

  // 🔧 Rôles Techniques de Support
  TECHNICIAN = 'TECHNICIAN',
  ASSISTANT = 'ASSISTANT',
  COORDINATOR = 'COORDINATOR',
  INTERPRETER = 'INTERPRETER',
}

/**
 * 🎯 Utility class for ProfessionalRole management
 */
export class ProfessionalRoleUtils {
  /**
   * Get display name for professional role
   */
  static getDisplayName(role: ProfessionalRole): string {
    const displayNames: Record<ProfessionalRole, string> = {
      [ProfessionalRole.DOCTOR]: 'Médecin',
      [ProfessionalRole.SURGEON]: 'Chirurgien',
      [ProfessionalRole.SPECIALIST]: 'Spécialiste',
      [ProfessionalRole.NURSE]: 'Infirmier(ère)',
      [ProfessionalRole.ANESTHESIOLOGIST]: 'Anesthésiste',

      [ProfessionalRole.DENTIST]: 'Dentiste',
      [ProfessionalRole.ORTHODONTIST]: 'Orthodontiste',
      [ProfessionalRole.DENTAL_HYGIENIST]: 'Hygiéniste Dentaire',
      [ProfessionalRole.DENTAL_ASSISTANT]: 'Assistant(e) Dentaire',

      [ProfessionalRole.PSYCHOLOGIST]: 'Psychologue',
      [ProfessionalRole.PSYCHIATRIST]: 'Psychiatre',
      [ProfessionalRole.THERAPIST]: 'Thérapeute',
      [ProfessionalRole.COUNSELOR]: 'Conseiller',

      [ProfessionalRole.PHYSIOTHERAPIST]: 'Kinésithérapeute',
      [ProfessionalRole.OCCUPATIONAL_THERAPIST]: 'Ergothérapeute',
      [ProfessionalRole.SPEECH_THERAPIST]: 'Orthophoniste',

      [ProfessionalRole.LAWYER]: 'Avocat',
      [ProfessionalRole.PARALEGAL]: 'Juriste',
      [ProfessionalRole.LEGAL_ASSISTANT]: 'Assistant(e) Juridique',
      [ProfessionalRole.NOTARY]: 'Notaire',

      [ProfessionalRole.CONSULTANT]: 'Consultant',
      [ProfessionalRole.ADVISOR]: 'Conseiller',
      [ProfessionalRole.ANALYST]: 'Analyste',
      [ProfessionalRole.PROJECT_MANAGER]: 'Chef de Projet',

      [ProfessionalRole.TEACHER]: 'Enseignant',
      [ProfessionalRole.TUTOR]: 'Tuteur',
      [ProfessionalRole.TRAINING_SPECIALIST]: 'Spécialiste Formation',

      [ProfessionalRole.TECHNICIAN]: 'Technicien',
      [ProfessionalRole.ASSISTANT]: 'Assistant(e)',
      [ProfessionalRole.COORDINATOR]: 'Coordinateur',
      [ProfessionalRole.INTERPRETER]: 'Interprète',
    };

    return displayNames[role] || role;
  }

  /**
   * Check if role can lead a team
   */
  static canLead(role: ProfessionalRole): boolean {
    const leadRoles = [
      ProfessionalRole.DOCTOR,
      ProfessionalRole.SURGEON,
      ProfessionalRole.SPECIALIST,
      ProfessionalRole.DENTIST,
      ProfessionalRole.PSYCHOLOGIST,
      ProfessionalRole.PSYCHIATRIST,
      ProfessionalRole.LAWYER,
      ProfessionalRole.CONSULTANT,
      ProfessionalRole.PROJECT_MANAGER,
      ProfessionalRole.TEACHER,
    ];

    return leadRoles.includes(role);
  }

  /**
   * Get compatible assistant roles for a lead role
   */
  static getCompatibleAssistants(
    leadRole: ProfessionalRole,
  ): ProfessionalRole[] {
    const compatibilities: Partial<
      Record<ProfessionalRole, ProfessionalRole[]>
    > = {
      [ProfessionalRole.DOCTOR]: [
        ProfessionalRole.NURSE,
        ProfessionalRole.ASSISTANT,
      ],
      [ProfessionalRole.SURGEON]: [
        ProfessionalRole.NURSE,
        ProfessionalRole.ANESTHESIOLOGIST,
        ProfessionalRole.TECHNICIAN,
      ],
      [ProfessionalRole.DENTIST]: [
        ProfessionalRole.DENTAL_HYGIENIST,
        ProfessionalRole.DENTAL_ASSISTANT,
      ],
      [ProfessionalRole.LAWYER]: [
        ProfessionalRole.PARALEGAL,
        ProfessionalRole.LEGAL_ASSISTANT,
      ],
      [ProfessionalRole.CONSULTANT]: [
        ProfessionalRole.ANALYST,
        ProfessionalRole.ASSISTANT,
      ],
      [ProfessionalRole.PROJECT_MANAGER]: [
        ProfessionalRole.COORDINATOR,
        ProfessionalRole.ASSISTANT,
      ],
    };

    return compatibilities[leadRole] || [];
  }

  /**
   * Get all available professional roles
   */
  static getAllRoles(): ProfessionalRole[] {
    return Object.values(ProfessionalRole);
  }

  /**
   * Validate if role exists
   */
  static isValidRole(role: string): role is ProfessionalRole {
    return Object.values(ProfessionalRole).includes(role as ProfessionalRole);
  }
}
