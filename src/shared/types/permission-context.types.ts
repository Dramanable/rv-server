/**
 * 🎯 TYPES DE CONTEXTE POUR PERMISSIONS GRANULAIRES
 * 
 * Définit les contextes et contraintes pour l'application des permissions
 * dans un système de gestion de rendez-vous professionnel.
 */

import { UserRole, Permission, BusinessType } from '../enums/user-role.enum';

/**
 * 🏢 Contexte Organisationnel
 */
export interface OrganizationalContext {
  readonly businessId: string;
  readonly businessType: BusinessType;
  readonly locationId?: string;     // Site spécifique
  readonly departmentId?: string;   // Département spécifique
  readonly teamId?: string;         // Équipe spécifique
}

/**
 * 🕐 Contexte Temporel
 */
export interface TemporalContext {
  readonly timeWindow?: {
    start: Date;
    end: Date;
  };
  readonly dayOfWeek?: number[];    // 0-6 (Dimanche-Samedi)
  readonly timeOfDay?: {
    start: string;  // "HH:MM"
    end: string;    // "HH:MM"
  };
  readonly isEmergency?: boolean;   // Contexte d'urgence
}

/**
 * 🎭 Contexte Relationnel
 */
export interface RelationshipContext {
  readonly targetUserId?: string;          // Utilisateur cible de l'action
  readonly targetRole?: UserRole;          // Rôle de la cible
  readonly relationship?: RelationshipType; // Relation avec la cible
  readonly isOwnResource?: boolean;        // Ressource personnelle
}

/**
 * 💼 Types de Relations Professionnelles
 */
export enum RelationshipType {
  // Relations hiérarchiques
  DIRECT_REPORT = 'DIRECT_REPORT',         // Subordonné direct
  MANAGER = 'MANAGER',                     // Supérieur hiérarchique
  PEER = 'PEER',                          // Collègue de même niveau
  
  // Relations fonctionnelles
  MENTOR = 'MENTOR',                       // Mentor
  MENTEE = 'MENTEE',                      // Mentoré
  COLLABORATOR = 'COLLABORATOR',          // Collaborateur
  
  // Relations client-praticien
  ASSIGNED_CLIENT = 'ASSIGNED_CLIENT',     // Client assigné
  FAMILY_MEMBER = 'FAMILY_MEMBER',        // Membre de famille
  CORPORATE_EMPLOYEE = 'CORPORATE_EMPLOYEE', // Employé d'entreprise cliente
  
  // Relations spécialisées
  SUPERVISOR = 'SUPERVISOR',              // Superviseur
  TRAINEE = 'TRAINEE',                   // Stagiaire/formation
  SUBSTITUTE = 'SUBSTITUTE',             // Remplaçant
}

/**
 * 🔒 Contraintes de Permission
 */
export interface PermissionConstraint {
  readonly constraintType: ConstraintType;
  readonly value: string | number | boolean | Date;
  readonly message?: string;              // Message d'erreur personnalisé
}

export enum ConstraintType {
  // Contraintes temporelles
  MAX_ADVANCE_BOOKING = 'MAX_ADVANCE_BOOKING',     // Jours max à l'avance
  MIN_NOTICE_REQUIRED = 'MIN_NOTICE_REQUIRED',     // Préavis minimum (minutes)
  WORKING_HOURS_ONLY = 'WORKING_HOURS_ONLY',       // Horaires ouvrables seulement
  
  // Contraintes quantitatives
  MAX_DAILY_BOOKINGS = 'MAX_DAILY_BOOKINGS',       // Réservations max/jour
  MAX_CONCURRENT_ACTIONS = 'MAX_CONCURRENT_ACTIONS', // Actions simultanées max
  APPROVAL_REQUIRED = 'APPROVAL_REQUIRED',         // Approbation nécessaire
  
  // Contraintes contextuelles
  SAME_LOCATION_ONLY = 'SAME_LOCATION_ONLY',       // Même site seulement
  ASSIGNED_CLIENTS_ONLY = 'ASSIGNED_CLIENTS_ONLY', // Clients assignés seulement
  BUSINESS_HOURS_ONLY = 'BUSINESS_HOURS_ONLY',     // Heures d'ouverture seulement
}

/**
 * 🎯 Contexte Complet de Permission
 */
export interface PermissionContext {
  readonly userRole: UserRole;
  readonly userId: string;
  readonly permission: Permission;
  readonly organizational: OrganizationalContext;
  readonly temporal?: TemporalContext;
  readonly relationship?: RelationshipContext;
  readonly constraints?: PermissionConstraint[];
  readonly metadata?: Record<string, unknown>;
}

/**
 * 📋 Résultat d'Évaluation de Permission
 */
export interface PermissionEvaluation {
  readonly isAllowed: boolean;
  readonly reason?: string;
  readonly constraints?: PermissionConstraint[];
  readonly suggestions?: string[];
  readonly requiresApproval?: boolean;
  readonly approvalWorkflow?: ApprovalWorkflowStep[];
}

/**
 * 🔄 Workflow d'Approbation
 */
export interface ApprovalWorkflowStep {
  readonly stepOrder: number;
  readonly approverRole: UserRole;
  readonly approverUserId?: string;
  readonly isOptional: boolean;
  readonly estimatedTime?: number; // minutes
  readonly autoApprovalConditions?: {
    timeWindow?: TemporalContext;
    valueThreshold?: number;
    urgencyLevel?: UrgencyLevel;
  };
}

export enum UrgencyLevel {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
  EMERGENCY = 'EMERGENCY',
}

/**
 * 🎯 Configuration de Permission par Rôle et Contexte
 */
export interface RolePermissionConfig {
  readonly role: UserRole;
  readonly businessType: BusinessType;
  readonly permissions: PermissionRule[];
}

export interface PermissionRule {
  readonly permission: Permission;
  readonly isAllowed: boolean;
  readonly constraints?: PermissionConstraint[];
  readonly contextualRules?: ContextualRule[];
  readonly approvalRequired?: boolean;
  readonly approvalWorkflow?: ApprovalWorkflowStep[];
}

export interface ContextualRule {
  readonly condition: ContextualCondition;
  readonly action: ContextualAction;
  readonly priority: number;
}

export interface ContextualCondition {
  readonly type: 'TEMPORAL' | 'RELATIONAL' | 'ORGANIZATIONAL' | 'QUANTITATIVE';
  readonly field: string;
  readonly operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN' | 'NOT_IN' | 'BETWEEN';
  readonly value: unknown;
}

export interface ContextualAction {
  readonly type: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'ADD_CONSTRAINT' | 'MODIFY_PERMISSION';
  readonly parameters?: Record<string, unknown>;
  readonly message?: string;
}

/**
 * 🏗️ Interface du Service d'Évaluation de Permissions
 */
export interface PermissionEvaluator {
  /**
   * Évalue si une permission est accordée dans un contexte donné
   */
  evaluatePermission(context: PermissionContext): Promise<PermissionEvaluation>;
  
  /**
   * Obtient toutes les permissions effectives pour un utilisateur
   */
  getEffectivePermissions(
    userRole: UserRole,
    userId: string,
    organizationalContext: OrganizationalContext
  ): Promise<Permission[]>;
  
  /**
   * Vérifie les contraintes d'une permission
   */
  validateConstraints(
    permission: Permission,
    constraints: PermissionConstraint[],
    context: PermissionContext
  ): Promise<boolean>;
  
  /**
   * Obtient le workflow d'approbation pour une action
   */
  getApprovalWorkflow(
    permission: Permission,
    context: PermissionContext
  ): Promise<ApprovalWorkflowStep[]>;
}

/**
 * 🎯 Décorateurs de Permission (pour annotations sur méthodes)
 */
export interface RequirePermissionOptions {
  readonly permission: Permission;
  readonly allowSelf?: boolean;        // Autorise sur soi-même
  readonly sameLocation?: boolean;     // Même lieu requis
  readonly businessHoursOnly?: boolean; // Heures ouvrables seulement
  readonly emergencyOverride?: boolean; // Bypass en urgence
  readonly approvalRequired?: boolean;  // Approbation nécessaire
}

/**
 * 📊 Métriques et Audit de Permissions
 */
export interface PermissionAuditLog {
  readonly timestamp: Date;
  readonly userId: string;
  readonly userRole: UserRole;
  readonly permission: Permission;
  readonly context: PermissionContext;
  readonly result: PermissionEvaluation;
  readonly sessionId?: string;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

/**
 * 🎯 Types Utilitaires pour Gestion Avancée
 */
export type PermissionMatrix = Record<UserRole, Record<Permission, PermissionRule>>;

export type BusinessTypeMatrix = Record<BusinessType, Partial<PermissionMatrix>>;

export type ContextualPermissionMap = Map<string, PermissionEvaluation>; // Cache contextuel

/**
 * 🔄 État des Permissions Dynamiques
 */
export interface DynamicPermissionState {
  readonly userId: string;
  readonly role: UserRole;
  readonly temporaryPermissions?: {
    permission: Permission;
    expiresAt: Date;
    grantedBy: string;
    reason: string;
  }[];
  readonly suspendedPermissions?: {
    permission: Permission;
    suspendedAt: Date;
    suspendedBy: string;
    reason: string;
    resumesAt?: Date;
  }[];
  readonly delegatedPermissions?: {
    permission: Permission;
    delegatedTo: string;
    expiresAt: Date;
    constraints?: PermissionConstraint[];
  }[];
}
