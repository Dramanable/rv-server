import { DomainException } from './domain.exception';

/**
 * 🎯 Skill Domain Exceptions - Exceptions spécialisées pour les compétences
 *
 * Exceptions métier pour la gestion des compétences avec contexte détaillé.
 */

/**
 * Exception pour les erreurs de validation des compétences
 */
export class SkillValidationException extends DomainException {
  constructor(code: string, message: string, context?: Record<string, any>) {
    super(message, code, context);
    this.name = 'SkillValidationException';
  }
}

/**
 * Exception quand une compétence n'est pas trouvée
 */
export class SkillNotFoundException extends DomainException {
  constructor(skillId: string, businessId?: string) {
    super(`Skill not found: ${skillId}`, 'SKILL_NOT_FOUND', {
      skillId,
      businessId,
    });
    this.name = 'SkillNotFoundException';
  }
}

/**
 * Exception pour les conflits de noms de compétences
 */
export class SkillNameConflictException extends DomainException {
  constructor(skillName: string, businessId: string) {
    super(
      `Skill name already exists in business: ${skillName}`,
      'SKILL_NAME_CONFLICT',
      { skillName, businessId },
    );
    this.name = 'SkillNameConflictException';
  }
}

/**
 * Exception quand on tente de supprimer une compétence en cours d'utilisation
 */
export class SkillInUseException extends DomainException {
  constructor(
    skillId: string,
    usageContext: {
      staffMembersCount: number;
      servicesCount: number;
      appointmentsCount?: number;
    },
  ) {
    super(`Cannot delete skill in use: ${skillId}`, 'SKILL_IN_USE', {
      skillId,
      ...usageContext,
    });
    this.name = 'SkillInUseException';
  }
}

/**
 * Exception pour les opérations non autorisées sur les compétences
 */
export class SkillOperationNotAllowedException extends DomainException {
  constructor(
    operation: string,
    reason: string,
    context?: Record<string, any>,
  ) {
    super(
      `Skill operation not allowed: ${operation} - ${reason}`,
      'SKILL_OPERATION_NOT_ALLOWED',
      { operation, reason, ...context },
    );
    this.name = 'SkillOperationNotAllowedException';
  }
}

/**
 * Exception pour les compétences critiques
 */
export class CriticalSkillException extends DomainException {
  constructor(skillId: string, operation: string, reason: string) {
    super(
      `Critical skill operation restricted: ${operation} on ${skillId} - ${reason}`,
      'CRITICAL_SKILL_RESTRICTED',
      { skillId, operation, reason },
    );
    this.name = 'CriticalSkillException';
  }
}
