/**
 * 🔐 SERVICE D'ÉVALUATION DE PERMISSIONS - Implémentation Exemple
 *
 * Démontre l'utilisation du nouveau système de rôles et permissions
 * avec évaluation contextuelle et workflow d'approbation.
 */

import {
  BusinessType,
  Permission,
  RoleUtils,
  UserRole,
} from '../../shared/enums/user-role.enum';

import {
  ApprovalWorkflowStep,
  OrganizationalContext,
  PermissionContext,
  PermissionEvaluation,
  PermissionEvaluator,
  RelationshipType,
  TemporalContext,
  UrgencyLevel,
} from '../../shared/types/permission-context.types';

/**
 * 🎯 Implémentation du Service d'Évaluation de Permissions
 */
export class BusinessPermissionEvaluator implements PermissionEvaluator {
  /**
   * Évalue si une permission est accordée dans un contexte donné
   */
  async evaluatePermission(
    context: PermissionContext,
  ): Promise<PermissionEvaluation> {
    // 1. Vérification de base du rôle utilisateur
    const hasBasePermission = RoleUtils.hasPermission(
      context.userRole,
      context.permission,
    );

    if (!hasBasePermission) {
      return {
        isAllowed: false,
        reason: `Le rôle ${context.userRole} ne possède pas la permission ${context.permission}`,
      };
    }

    // 2. Évaluation contextuelle
    const contextualEvaluation =
      await this.evaluateContextualConstraints(context);
    if (!contextualEvaluation.isAllowed) {
      return contextualEvaluation;
    }

    // 3. Vérification des contraintes spécifiques
    const constraintEvaluation =
      await this.evaluateBusinessConstraints(context);
    if (!constraintEvaluation.isAllowed) {
      return constraintEvaluation;
    }

    // 4. Détermination du workflow d'approbation
    const requiresApproval = await this.shouldRequireApproval(context);
    const approvalWorkflow = requiresApproval
      ? await this.getApprovalWorkflow(context.permission, context)
      : undefined;

    return {
      isAllowed: true,
      requiresApproval,
      approvalWorkflow,
      suggestions: await this.generateSuggestions(context),
    };
  }

  /**
   * Évalue les contraintes contextuelles
   */
  private async evaluateContextualConstraints(
    context: PermissionContext,
  ): Promise<PermissionEvaluation> {
    // Contraintes temporelles
    if (context.temporal) {
      const temporalCheck = this.checkTemporalConstraints(context);
      if (!temporalCheck.isAllowed) {
        return temporalCheck;
      }
    }

    // Contraintes relationnelles
    if (context.relationship) {
      const relationshipCheck =
        await this.checkRelationshipConstraints(context);
      if (!relationshipCheck.isAllowed) {
        return relationshipCheck;
      }
    }

    return { isAllowed: true };
  }

  /**
   * Vérifie les contraintes temporelles
   */
  private checkTemporalConstraints(
    context: PermissionContext,
  ): PermissionEvaluation {
    const temporal = context.temporal!;
    const now = new Date();

    // Vérification d'urgence
    if (temporal.isEmergency && this.canOverrideInEmergency(context.userRole)) {
      return {
        isAllowed: true,
        reason: "Accès d'urgence accordé",
      };
    }

    // Vérification des heures ouvrables
    if (temporal.timeOfDay) {
      const currentTime = now.toTimeString().substring(0, 5); // "HH:MM"
      const { start, end } = temporal.timeOfDay;

      if (currentTime < start || currentTime > end) {
        // Vérifier si le rôle peut opérer en dehors des heures
        if (!this.canWorkOutsideHours(context.userRole)) {
          return {
            isAllowed: false,
            reason: `Action non autorisée en dehors des heures ouvrables (${start}-${end})`,
            suggestions: [
              "Programmer l'action pour les heures ouvrables",
              "Demander une approbation d'urgence",
            ],
          };
        }
      }
    }

    return { isAllowed: true };
  }

  /**
   * Vérifie les contraintes relationnelles
   */
  private async checkRelationshipConstraints(
    context: PermissionContext,
  ): Promise<PermissionEvaluation> {
    const relationship = context.relationship!;

    // Action sur soi-même toujours autorisée (si permission de base OK)
    if (relationship.isOwnResource) {
      return { isAllowed: true };
    }

    // Vérification hiérarchique
    if (relationship.targetRole) {
      const canActOnRole = RoleUtils.canActOnRole(
        context.userRole,
        relationship.targetRole,
      );
      if (!canActOnRole) {
        return {
          isAllowed: false,
          reason: `Niveau hiérarchique insuffisant pour agir sur le rôle ${relationship.targetRole}`,
        };
      }
    }

    // Vérification des relations spéciales
    if (relationship.relationship) {
      const relationshipCheck = this.checkSpecialRelationships(
        context,
        relationship.relationship,
      );
      if (!relationshipCheck.isAllowed) {
        return relationshipCheck;
      }
    }

    return { isAllowed: true };
  }

  /**
   * Vérifie les relations spéciales (mentor/mentoré, famille, etc.)
   */
  private checkSpecialRelationships(
    context: PermissionContext,
    relationshipType: RelationshipType,
  ): PermissionEvaluation {
    switch (relationshipType) {
      case RelationshipType.FAMILY_MEMBER:
        // Les clients peuvent réserver pour leur famille
        if (RoleUtils.isClientRole(context.userRole)) {
          return { isAllowed: true };
        }
        return {
          isAllowed: false,
          reason: 'Seuls les clients peuvent réserver pour leur famille',
        };

      case RelationshipType.MENTEE:
        // Les praticiens seniors peuvent agir pour leurs mentorés
        if (context.userRole === UserRole.SENIOR_PRACTITIONER) {
          return { isAllowed: true };
        }
        return {
          isAllowed: false,
          reason:
            'Seuls les praticiens seniors peuvent superviser des mentorés',
        };

      case RelationshipType.ASSIGNED_CLIENT:
        // Les praticiens peuvent agir sur leurs clients assignés
        if (RoleUtils.isPractitionerRole(context.userRole)) {
          return { isAllowed: true };
        }
        return {
          isAllowed: false,
          reason: 'Action limitée aux clients assignés',
        };

      default:
        return { isAllowed: true };
    }
  }

  /**
   * Évalue les contraintes métier spécifiques
   */
  private async evaluateBusinessConstraints(
    context: PermissionContext,
  ): Promise<PermissionEvaluation> {
    const { businessType } = context.organizational;

    // Contraintes spécifiques par secteur
    switch (businessType) {
      case BusinessType.MEDICAL_CLINIC:
        return this.evaluateMedicalConstraints(context);

      case BusinessType.LAW_FIRM:
        return this.evaluateLegalConstraints(context);

      case BusinessType.BEAUTY_SALON:
        return this.evaluateBeautyConstraints(context);

      default:
        return { isAllowed: true };
    }
  }

  /**
   * Contraintes spécifiques au secteur médical
   */
  private evaluateMedicalConstraints(
    context: PermissionContext,
  ): PermissionEvaluation {
    // Exemple : Accès au dossier médical nécessite d'être praticien
    if (context.permission === Permission.VIEW_CLIENT_HISTORY) {
      if (
        !RoleUtils.isPractitionerRole(context.userRole) &&
        !RoleUtils.isManagementRole(context.userRole)
      ) {
        return {
          isAllowed: false,
          reason:
            "L'accès au dossier médical nécessite d'être praticien ou manager",
        };
      }
    }

    // Exemple : Modification des notes médicales nécessite une licence
    if (context.permission === Permission.MANAGE_CLIENT_NOTES) {
      if (context.userRole === UserRole.JUNIOR_PRACTITIONER) {
        return {
          isAllowed: true,
          requiresApproval: true,
          reason: 'Les notes du praticien junior nécessitent une validation',
        };
      }
    }

    return { isAllowed: true };
  }

  /**
   * Contraintes spécifiques au secteur juridique
   */
  private evaluateLegalConstraints(
    context: PermissionContext,
  ): PermissionEvaluation {
    // Exemple : Accès aux dossiers confidentiels
    if (context.permission === Permission.VIEW_CLIENT_HISTORY) {
      // Vérifier l'habilitation secret
      if (context.metadata?.requiresSecretClearance) {
        return {
          isAllowed: false,
          reason: 'Dossier classifié - habilitation requise',
          requiresApproval: true,
        };
      }
    }

    return { isAllowed: true };
  }

  /**
   * Contraintes spécifiques au secteur beauté
   */
  private evaluateBeautyConstraints(
    context: PermissionContext,
  ): PermissionEvaluation {
    // Exemple : Certains services nécessitent une certification
    if (context.permission === Permission.CONFIRM_APPOINTMENTS) {
      const serviceType = context.metadata?.serviceType as string;
      if (
        serviceType?.includes('chemical') &&
        context.userRole === UserRole.JUNIOR_PRACTITIONER
      ) {
        return {
          isAllowed: false,
          reason: 'Les traitements chimiques nécessitent un praticien certifié',
          suggestions: ["Demander supervision d'un praticien senior"],
        };
      }
    }

    return { isAllowed: true };
  }

  /**
   * Détermine si une approbation est nécessaire
   */
  private async shouldRequireApproval(
    context: PermissionContext,
  ): Promise<boolean> {
    // Approbation pour les actions sensibles
    const sensitivePermissions = [
      Permission.FIRE_STAFF,
      Permission.ISSUE_REFUNDS,
      Permission.EXPORT_CLIENT_DATA,
    ];

    if (sensitivePermissions.includes(context.permission)) {
      return true;
    }

    // Approbation pour les praticiens juniors
    if (context.userRole === UserRole.JUNIOR_PRACTITIONER) {
      const needsApprovalForJunior = [
        Permission.MANAGE_CLIENT_NOTES,
        Permission.CONFIRM_APPOINTMENTS,
      ];
      return needsApprovalForJunior.includes(context.permission);
    }

    // Approbation pour les actions hors heures
    if (context.temporal?.timeOfDay) {
      const isOutsideHours = this.isOutsideBusinessHours(context.temporal);
      return isOutsideHours && !this.canWorkOutsideHours(context.userRole);
    }

    return false;
  }

  /**
   * Obtient le workflow d'approbation
   */
  async getApprovalWorkflow(
    permission: Permission,
    context: PermissionContext,
  ): Promise<ApprovalWorkflowStep[]> {
    const workflow: ApprovalWorkflowStep[] = [];

    // Workflow basique : approbation par le niveau supérieur
    const approverRole = this.getApproverRole(context.userRole);
    if (approverRole) {
      workflow.push({
        stepOrder: 1,
        approverRole,
        isOptional: false,
        estimatedTime: 60, // 1 heure
      });
    }

    // Workflow spécial pour les actions critiques
    if (this.isCriticalPermission(permission)) {
      // Double approbation requise
      workflow.push({
        stepOrder: 2,
        approverRole: UserRole.BUSINESS_OWNER,
        isOptional: false,
        estimatedTime: 120, // 2 heures
        autoApprovalConditions: {
          urgencyLevel: UrgencyLevel.EMERGENCY,
        },
      });
    }

    return workflow;
  }

  /**
   * Obtient les permissions effectives avec contexte
   */
  async getEffectivePermissions(
    userRole: UserRole,
    userId: string,
    organizationalContext: OrganizationalContext,
  ): Promise<Permission[]> {
    // Permissions de base du rôle
    const basePermissions = RoleUtils.getRolePermissions(userRole);

    // Permissions spécifiques au type d'entreprise
    const businessPermissions = RoleUtils.getBusinessTypePermissions(
      organizationalContext.businessType,
    );

    // Fusion des permissions
    const allPermissions = [
      ...new Set([...basePermissions, ...businessPermissions]),
    ];

    // Filtrage selon le contexte (ex: location, département)
    return this.filterPermissionsByContext(
      allPermissions,
      organizationalContext,
    );
  }

  /**
   * Valide les contraintes d'une permission
   */
  async validateConstraints(
    permission: Permission,
    constraints: any[],
    context: PermissionContext,
  ): Promise<boolean> {
    for (const constraint of constraints) {
      const isValid = await this.validateSingleConstraint(constraint, context);
      if (!isValid) {
        return false;
      }
    }

    return true;
  }

  // === MÉTHODES UTILITAIRES ===

  private canOverrideInEmergency(role: UserRole): boolean {
    return (
      RoleUtils.isManagementRole(role) || RoleUtils.isPractitionerRole(role)
    );
  }

  private canWorkOutsideHours(role: UserRole): boolean {
    return [
      UserRole.BUSINESS_OWNER,
      UserRole.BUSINESS_ADMIN,
      UserRole.SENIOR_PRACTITIONER,
    ].includes(role);
  }

  private isOutsideBusinessHours(temporal: TemporalContext): boolean {
    // Implémentation simplifiée
    const now = new Date();
    const hour = now.getHours();
    return hour < 8 || hour > 18; // En dehors de 8h-18h
  }

  private getApproverRole(requestorRole: UserRole): UserRole | undefined {
    // Map vers le niveau hiérarchique supérieur
    const approverMap: Partial<Record<UserRole, UserRole>> = {
      [UserRole.JUNIOR_PRACTITIONER]: UserRole.SENIOR_PRACTITIONER,
      [UserRole.PRACTITIONER]: UserRole.DEPARTMENT_HEAD,
      [UserRole.ASSISTANT]: UserRole.LOCATION_MANAGER,
      [UserRole.RECEPTIONIST]: UserRole.LOCATION_MANAGER,
      [UserRole.LOCATION_MANAGER]: UserRole.BUSINESS_ADMIN,
    };

    return approverMap[requestorRole];
  }

  private isCriticalPermission(permission: Permission): boolean {
    return [
      Permission.FIRE_STAFF,
      Permission.EXPORT_CLIENT_DATA,
      Permission.MANAGE_SYSTEM_SETTINGS,
    ].includes(permission);
  }

  private async filterPermissionsByContext(
    permissions: Permission[],
    context: OrganizationalContext,
  ): Promise<Permission[]> {
    // Filtrage selon le contexte organisationnel
    // Ex: un manager de site ne peut gérer que son site
    return permissions; // Implémentation simplifiée
  }

  private async validateSingleConstraint(
    constraint: any,
    context: PermissionContext,
  ): Promise<boolean> {
    // Validation des contraintes individuelles
    return true; // Implémentation simplifiée
  }

  private async generateSuggestions(
    context: PermissionContext,
  ): Promise<string[]> {
    const suggestions: string[] = [];

    // Suggestions contextuelles
    if (context.userRole === UserRole.JUNIOR_PRACTITIONER) {
      suggestions.push('Demander une supervision par un praticien senior');
    }

    if (context.temporal?.isEmergency) {
      suggestions.push("Utiliser la procédure d'urgence si disponible");
    }

    return suggestions;
  }
}

/**
 * 🎯 Exemple d'utilisation du service
 */
export class PermissionUsageExample {
  static async demonstrateUsage() {
    const evaluator = new BusinessPermissionEvaluator();

    // Exemple 1: Praticien junior voulant modifier des notes médicales
    const juniorContext: PermissionContext = {
      userRole: UserRole.JUNIOR_PRACTITIONER,
      userId: 'junior-doc-123',
      permission: Permission.MANAGE_CLIENT_NOTES,
      organizational: {
        businessId: 'clinic-456',
        businessType: BusinessType.MEDICAL_CLINIC,
        locationId: 'location-789',
        departmentId: 'cardiology',
      },
      relationship: {
        targetUserId: 'patient-321',
        relationship: RelationshipType.ASSIGNED_CLIENT,
      },
    };

    const result1 = await evaluator.evaluatePermission(juniorContext);
    console.log('Praticien junior - Notes médicales:', result1);
    // Résultat attendu: isAllowed: true, requiresApproval: true

    // Exemple 2: Client régulier voulant réserver pour sa famille
    const clientContext: PermissionContext = {
      userRole: UserRole.REGULAR_CLIENT,
      userId: 'client-456',
      permission: Permission.BOOK_FOR_OTHERS,
      organizational: {
        businessId: 'clinic-456',
        businessType: BusinessType.MEDICAL_CLINIC,
      },
      relationship: {
        targetUserId: 'family-member-789',
        relationship: RelationshipType.FAMILY_MEMBER,
      },
    };

    const result2 = await evaluator.evaluatePermission(clientContext);
    console.log('Client - Réservation famille:', result2);
    // Résultat attendu: isAllowed: true, requiresApproval: false

    // Exemple 3: Action en dehors des heures ouvrables
    const afterHoursContext: PermissionContext = {
      userRole: UserRole.RECEPTIONIST,
      userId: 'receptionist-123',
      permission: Permission.BOOK_ANY_APPOINTMENT,
      organizational: {
        businessId: 'clinic-456',
        businessType: BusinessType.MEDICAL_CLINIC,
      },
      temporal: {
        timeOfDay: { start: '08:00', end: '18:00' },
        isEmergency: false,
      },
    };

    const result3 = await evaluator.evaluatePermission(afterHoursContext);
    console.log('Réceptionniste - Hors heures:', result3);
    // Résultat attendu: isAllowed: false, suggestions incluses
  }
}
