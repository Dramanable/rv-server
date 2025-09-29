/**
 * 🎯 Staff Skills Value Object
 *
 * Représente les compétences d'un membre du staff avec niveaux et certifications.
 * Immutable, contient la logique de validation et de matching.
 */

import {
  InvalidValueError,
  RequiredValueError,
  ValueOutOfRangeError,
  DuplicateValueError,
  ValueNotFoundError,
} from '@domain/exceptions/value-object.exceptions';
export class StaffSkills {
  private constructor(private readonly _skillAssignments: SkillAssignment[]) {}

  /**
   * 🏗️ Factory method pour créer les compétences staff
   */
  static create(skillAssignments: SkillAssignment[]): StaffSkills {
    // Validation
    if (!skillAssignments || skillAssignments.length === 0) {
      throw new RequiredValueError('skillAssignments');
    }

    // Vérifier qu'il n'y a pas de doublons
    const skillIds = skillAssignments.map((sa) => sa.getSkillId());
    const uniqueSkillIds = new Set(skillIds);

    if (skillIds.length !== uniqueSkillIds.size) {
      throw new DuplicateValueError(
        'skillAssignment',
        'Un membre du staff ne peut pas avoir la même compétence assignée plusieurs fois',
      );
    }

    // Validation de chaque assignment
    skillAssignments.forEach((assignment) => {
      if (!assignment.isValid()) {
        throw new InvalidValueError(
          'skillAssignment',
          assignment.getSkillId(),
          `Assignment de compétence invalide: ${assignment.getSkillId()}`,
        );
      }
    });

    return new StaffSkills([...skillAssignments]);
  }

  /**
   * 🔄 Factory method pour reconstruire depuis persistence
   */
  static fromPersistence(
    data: Array<{
      skillId: string;
      skillName: string;
      skillCategory: string;
      proficiencyLevel: ProficiencyLevel;
      certificationLevel?: CertificationLevel;
      yearsOfExperience: number;
      lastUsed?: Date;
      isCertified: boolean;
      certificationExpiryDate?: Date;
      notes?: string;
    }>,
  ): StaffSkills {
    const assignments = data.map((item) =>
      SkillAssignment.reconstruct({
        skillId: item.skillId,
        skillName: item.skillName,
        skillCategory: item.skillCategory,
        proficiencyLevel: item.proficiencyLevel,
        certificationLevel: item.certificationLevel,
        yearsOfExperience: item.yearsOfExperience,
        lastUsed: item.lastUsed,
        isCertified: item.isCertified,
        certificationExpiryDate: item.certificationExpiryDate,
        notes: item.notes,
      }),
    );

    return new StaffSkills(assignments);
  }

  // ✅ Getters

  /**
   * Récupérer tous les assignments de compétences
   */
  getSkillAssignments(): SkillAssignment[] {
    return [...this._skillAssignments];
  }

  /**
   * Récupérer les IDs des compétences
   */
  getSkillIds(): string[] {
    return this._skillAssignments.map((sa) => sa.getSkillId());
  }

  /**
   * Compter le nombre de compétences
   */
  getSkillCount(): number {
    return this._skillAssignments.length;
  }

  // 🔍 Query Methods

  /**
   * Vérifier si le staff a une compétence spécifique
   */
  hasSkill(skillId: string): boolean {
    return this._skillAssignments.some((sa) => sa.getSkillId() === skillId);
  }

  /**
   * Récupérer un assignment de compétence spécifique
   */
  getSkillAssignment(skillId: string): SkillAssignment | null {
    return (
      this._skillAssignments.find((sa) => sa.getSkillId() === skillId) || null
    );
  }

  /**
   * Récupérer les compétences par catégorie
   */
  getSkillsByCategory(category: string): SkillAssignment[] {
    return this._skillAssignments.filter(
      (sa) => sa.getSkillCategory() === category,
    );
  }

  /**
   * Récupérer les compétences certifiées
   */
  getCertifiedSkills(): SkillAssignment[] {
    return this._skillAssignments.filter((sa) => sa.isCertified());
  }

  /**
   * Récupérer les compétences avec certification expirée
   */
  getExpiredCertifications(): SkillAssignment[] {
    return this._skillAssignments.filter((sa) => sa.hasCertificationExpired());
  }

  /**
   * Récupérer les compétences par niveau de maîtrise minimum
   */
  getSkillsByMinimumProficiency(minLevel: ProficiencyLevel): SkillAssignment[] {
    return this._skillAssignments.filter((sa) =>
      sa.meetsMinimumProficiency(minLevel),
    );
  }

  // 🔄 Business Logic Methods

  /**
   * Ajouter une nouvelle compétence
   */
  addSkill(skillAssignment: SkillAssignment): StaffSkills {
    if (this.hasSkill(skillAssignment.getSkillId())) {
      throw new DuplicateValueError(
        'skillAssignment',
        skillAssignment.getSkillId(),
      );
    }

    const newAssignments = [...this._skillAssignments, skillAssignment];
    return new StaffSkills(newAssignments);
  }

  /**
   * Mettre à jour une compétence existante
   */
  updateSkill(
    skillId: string,
    updates: {
      proficiencyLevel?: ProficiencyLevel;
      certificationLevel?: CertificationLevel;
      yearsOfExperience?: number;
      lastUsed?: Date;
      isCertified?: boolean;
      certificationExpiryDate?: Date;
      notes?: string;
    },
  ): StaffSkills {
    const assignmentIndex = this._skillAssignments.findIndex(
      (sa) => sa.getSkillId() === skillId,
    );

    if (assignmentIndex === -1) {
      throw new ValueNotFoundError('compétence', skillId);
    }

    const updatedAssignment =
      this._skillAssignments[assignmentIndex].update(updates);
    const newAssignments = [...this._skillAssignments];
    newAssignments[assignmentIndex] = updatedAssignment;

    return new StaffSkills(newAssignments);
  }

  /**
   * Supprimer une compétence
   */
  removeSkill(skillId: string): StaffSkills {
    const filteredAssignments = this._skillAssignments.filter(
      (sa) => sa.getSkillId() !== skillId,
    );

    if (filteredAssignments.length === this._skillAssignments.length) {
      throw new ValueNotFoundError('compétence', skillId);
    }

    if (filteredAssignments.length === 0) {
      throw new InvalidValueError(
        'skillAssignments',
        filteredAssignments.length,
        'Un membre du staff doit avoir au moins une compétence',
      );
    }

    return new StaffSkills(filteredAssignments);
  }

  /**
   * Vérifier si le staff correspond aux exigences d'une équipe
   */
  matchesTeamRequirements(requirements: {
    requiredSkills: Array<{
      skillId: string;
      minimumProficiency: ProficiencyLevel;
      requiresCertification?: boolean;
    }>;
  }): {
    matches: boolean;
    missingSkills: string[];
    insufficientProficiency: string[];
    missingCertifications: string[];
  } {
    const missingSkills: string[] = [];
    const insufficientProficiency: string[] = [];
    const missingCertifications: string[] = [];

    requirements.requiredSkills.forEach((req) => {
      const assignment = this.getSkillAssignment(req.skillId);

      if (!assignment) {
        missingSkills.push(req.skillId);
        return;
      }

      if (!assignment.meetsMinimumProficiency(req.minimumProficiency)) {
        insufficientProficiency.push(req.skillId);
      }

      if (req.requiresCertification && !assignment.isCertified()) {
        missingCertifications.push(req.skillId);
      }
    });

    const matches =
      missingSkills.length === 0 &&
      insufficientProficiency.length === 0 &&
      missingCertifications.length === 0;

    return {
      matches,
      missingSkills,
      insufficientProficiency,
      missingCertifications,
    };
  }

  // 📊 Analytics Methods

  /**
   * Calculer le score global de compétences
   */
  calculateOverallSkillScore(): number {
    if (this._skillAssignments.length === 0) return 0;

    const totalScore = this._skillAssignments.reduce((sum, assignment) => {
      return sum + assignment.calculateSkillScore();
    }, 0);

    return Math.round(totalScore / this._skillAssignments.length);
  }

  /**
   * Récupérer les statistiques des compétences
   */
  getSkillStatistics(): {
    totalSkills: number;
    certifiedSkills: number;
    expiredCertifications: number;
    averageProficiency: number;
    averageExperience: number;
    skillsByCategory: Record<string, number>;
  } {
    const stats = {
      totalSkills: this._skillAssignments.length,
      certifiedSkills: this.getCertifiedSkills().length,
      expiredCertifications: this.getExpiredCertifications().length,
      averageProficiency: 0,
      averageExperience: 0,
      skillsByCategory: {} as Record<string, number>,
    };

    if (this._skillAssignments.length > 0) {
      // Calcul des moyennes
      const totalProficiency = this._skillAssignments.reduce(
        (sum, assignment) => {
          return (
            sum + this.getProficiencyScore(assignment.getProficiencyLevel())
          );
        },
        0,
      );
      stats.averageProficiency = Math.round(
        totalProficiency / this._skillAssignments.length,
      );

      const totalExperience = this._skillAssignments.reduce(
        (sum, assignment) => {
          return sum + assignment.getYearsOfExperience();
        },
        0,
      );
      stats.averageExperience = Math.round(
        totalExperience / this._skillAssignments.length,
      );

      // Comptage par catégorie
      this._skillAssignments.forEach((assignment) => {
        const category = assignment.getSkillCategory();
        stats.skillsByCategory[category] =
          (stats.skillsByCategory[category] || 0) + 1;
      });
    }

    return stats;
  }

  private getProficiencyScore(level: ProficiencyLevel): number {
    const scores = {
      [ProficiencyLevel.BEGINNER]: 1,
      [ProficiencyLevel.INTERMEDIATE]: 2,
      [ProficiencyLevel.ADVANCED]: 3,
      [ProficiencyLevel.EXPERT]: 4,
      [ProficiencyLevel.MASTER]: 5,
    };
    return scores[level] || 1;
  }

  // 🔄 Domain Validation

  /**
   * Valider la cohérence des compétences
   */
  validate(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Vérifier qu'il y a au moins une compétence
    if (this._skillAssignments.length === 0) {
      errors.push('Un membre du staff doit avoir au moins une compétence');
    }

    // Valider chaque assignment
    this._skillAssignments.forEach((assignment, index) => {
      const validation = assignment.validate();
      if (!validation.isValid) {
        errors.push(`Assignment ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 🔄 Equality & Serialization

  /**
   * Égalité entre StaffSkills
   */
  equals(other: StaffSkills): boolean {
    if (this._skillAssignments.length !== other._skillAssignments.length) {
      return false;
    }

    return this._skillAssignments.every((assignment) => {
      const otherAssignment = other.getSkillAssignment(assignment.getSkillId());
      return otherAssignment && assignment.equals(otherAssignment);
    });
  }

  /**
   * Sérialisation pour persistence
   */
  toJSON(): object {
    return {
      skillAssignments: this._skillAssignments.map((assignment) =>
        assignment.toJSON(),
      ),
      totalSkills: this.getSkillCount(),
      overallScore: this.calculateOverallSkillScore(),
    };
  }
}

/**
 * 🎯 Skill Assignment - Assignment d'une compétence à un staff member
 */
export class SkillAssignment {
  private constructor(
    private readonly _skillId: string,
    private readonly _skillName: string,
    private readonly _skillCategory: string,
    private readonly _proficiencyLevel: ProficiencyLevel,
    private readonly _certificationLevel: CertificationLevel | undefined,
    private readonly _yearsOfExperience: number,
    private readonly _lastUsed: Date | undefined,
    private readonly _isCertified: boolean,
    private readonly _certificationExpiryDate: Date | undefined,
    private readonly _notes: string,
  ) {}

  static create(data: {
    skillId: string;
    skillName: string;
    skillCategory: string;
    proficiencyLevel: ProficiencyLevel;
    certificationLevel?: CertificationLevel;
    yearsOfExperience: number;
    lastUsed?: Date;
    isCertified?: boolean;
    certificationExpiryDate?: Date;
    notes?: string;
  }): SkillAssignment {
    // Validation
    if (!data.skillId || !data.skillName || !data.skillCategory) {
      throw new RequiredValueError('skillData');
    }

    if (data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
      throw new InvalidValueError(
        'yearsOfExperience',
        data.yearsOfExperience,
        "L'expérience doit être entre 0 et 50 ans",
      );
    }

    if (
      data.isCertified &&
      data.certificationExpiryDate &&
      data.certificationExpiryDate < new Date()
    ) {
      throw new InvalidValueError(
        'certificationExpiryDate',
        data.certificationExpiryDate,
        'Une certification expirée ne peut pas être marquée comme active',
      );
    }

    return new SkillAssignment(
      data.skillId,
      data.skillName,
      data.skillCategory,
      data.proficiencyLevel,
      data.certificationLevel,
      data.yearsOfExperience,
      data.lastUsed,
      data.isCertified || false,
      data.certificationExpiryDate,
      data.notes || '',
    );
  }

  static reconstruct(data: {
    skillId: string;
    skillName: string;
    skillCategory: string;
    proficiencyLevel: ProficiencyLevel;
    certificationLevel?: CertificationLevel;
    yearsOfExperience: number;
    lastUsed?: Date;
    isCertified: boolean;
    certificationExpiryDate?: Date;
    notes?: string;
  }): SkillAssignment {
    return new SkillAssignment(
      data.skillId,
      data.skillName,
      data.skillCategory,
      data.proficiencyLevel,
      data.certificationLevel,
      data.yearsOfExperience,
      data.lastUsed,
      data.isCertified,
      data.certificationExpiryDate,
      data.notes || '',
    );
  }

  // ✅ Getters
  getSkillId(): string {
    return this._skillId;
  }
  getSkillName(): string {
    return this._skillName;
  }
  getSkillCategory(): string {
    return this._skillCategory;
  }
  getProficiencyLevel(): ProficiencyLevel {
    return this._proficiencyLevel;
  }
  getCertificationLevel(): CertificationLevel | undefined {
    return this._certificationLevel;
  }
  getYearsOfExperience(): number {
    return this._yearsOfExperience;
  }
  getLastUsed(): Date | undefined {
    return this._lastUsed;
  }
  isCertified(): boolean {
    return this._isCertified;
  }
  getCertificationExpiryDate(): Date | undefined {
    return this._certificationExpiryDate;
  }
  getNotes(): string {
    return this._notes;
  }

  // 🔄 Business Methods

  meetsMinimumProficiency(minLevel: ProficiencyLevel): boolean {
    const levels = [
      ProficiencyLevel.BEGINNER,
      ProficiencyLevel.INTERMEDIATE,
      ProficiencyLevel.ADVANCED,
      ProficiencyLevel.EXPERT,
      ProficiencyLevel.MASTER,
    ];

    const currentIndex = levels.indexOf(this._proficiencyLevel);
    const minIndex = levels.indexOf(minLevel);

    return currentIndex >= minIndex;
  }

  hasCertificationExpired(): boolean {
    if (!this._isCertified || !this._certificationExpiryDate) {
      return false;
    }
    return this._certificationExpiryDate < new Date();
  }

  calculateSkillScore(): number {
    let score = 0;

    // Score basé sur le niveau de maîtrise (20-100 points)
    const proficiencyScores = {
      [ProficiencyLevel.BEGINNER]: 20,
      [ProficiencyLevel.INTERMEDIATE]: 40,
      [ProficiencyLevel.ADVANCED]: 60,
      [ProficiencyLevel.EXPERT]: 80,
      [ProficiencyLevel.MASTER]: 100,
    };
    score += proficiencyScores[this._proficiencyLevel] || 20;

    // Bonus pour l'expérience (max 20 points)
    score += Math.min(this._yearsOfExperience * 2, 20);

    // Bonus pour la certification (10 points)
    if (this._isCertified && !this.hasCertificationExpired()) {
      score += 10;
    }

    // Pénalité pour utilisation ancienne (max -10 points)
    if (this._lastUsed) {
      const monthsSinceUse =
        (Date.now() - this._lastUsed.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (monthsSinceUse > 12) {
        score -= Math.min(Math.floor(monthsSinceUse / 12) * 2, 10);
      }
    }

    return Math.max(score, 0); // Score minimum 0
  }

  update(updates: {
    proficiencyLevel?: ProficiencyLevel;
    certificationLevel?: CertificationLevel;
    yearsOfExperience?: number;
    lastUsed?: Date;
    isCertified?: boolean;
    certificationExpiryDate?: Date;
    notes?: string;
  }): SkillAssignment {
    return new SkillAssignment(
      this._skillId,
      this._skillName,
      this._skillCategory,
      updates.proficiencyLevel ?? this._proficiencyLevel,
      updates.certificationLevel ?? this._certificationLevel,
      updates.yearsOfExperience ?? this._yearsOfExperience,
      updates.lastUsed ?? this._lastUsed,
      updates.isCertified ?? this._isCertified,
      updates.certificationExpiryDate ?? this._certificationExpiryDate,
      updates.notes ?? this._notes,
    );
  }

  isValid(): boolean {
    return this.validate().isValid;
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this._skillId) errors.push('SkillId requis');
    if (!this._skillName) errors.push('Nom de compétence requis');
    if (!this._skillCategory) errors.push('Catégorie de compétence requise');
    if (this._yearsOfExperience < 0)
      errors.push("L'expérience ne peut pas être négative");

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  equals(other: SkillAssignment): boolean {
    return (
      this._skillId === other._skillId &&
      this._proficiencyLevel === other._proficiencyLevel &&
      this._yearsOfExperience === other._yearsOfExperience &&
      this._isCertified === other._isCertified
    );
  }

  toJSON(): object {
    return {
      skillId: this._skillId,
      skillName: this._skillName,
      skillCategory: this._skillCategory,
      proficiencyLevel: this._proficiencyLevel,
      certificationLevel: this._certificationLevel,
      yearsOfExperience: this._yearsOfExperience,
      lastUsed: this._lastUsed?.toISOString(),
      isCertified: this._isCertified,
      certificationExpiryDate: this._certificationExpiryDate?.toISOString(),
      notes: this._notes,
      skillScore: this.calculateSkillScore(),
    };
  }
}

/**
 * 🎯 Proficiency Level - Niveau de maîtrise d'une compétence
 */
export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER', // Débutant - 0-1 ans
  INTERMEDIATE = 'INTERMEDIATE', // Intermédiaire - 1-3 ans
  ADVANCED = 'ADVANCED', // Avancé - 3-7 ans
  EXPERT = 'EXPERT', // Expert - 7-15 ans
  MASTER = 'MASTER', // Maître - 15+ ans
}

/**
 * 🎯 Certification Level - Niveau de certification
 */
export enum CertificationLevel {
  BASIC = 'BASIC', // Certification de base
  INTERMEDIATE = 'INTERMEDIATE', // Certification intermédiaire
  ADVANCED = 'ADVANCED', // Certification avancée
  PROFESSIONAL = 'PROFESSIONAL', // Certification professionnelle
  EXPERT = 'EXPERT', // Certification expert
}
