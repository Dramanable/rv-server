/**
 * 🏛️ DOMAIN ENUMS - Professional Appointment System User Roles & Permissions
 *
 * Système de rôles et permissions pour gestion de rendez-vous professionnels
 * Conçu pour avocats, dentistes, cliniques, centres médicaux, salons, etc.
 */

/**
 * 🎭 Rôles Utilisateurs - Architecture Hiérarchique
 */
export enum UserRole {
  // 🔴 Niveau Enterprise (Plateforme)
  PLATFORM_ADMIN = 'PLATFORM_ADMIN', // Admin plateforme multi-tenant
  
  // 🟠 Niveau Business (Entreprise)
  BUSINESS_OWNER = 'BUSINESS_OWNER',     // Propriétaire principal
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',     // Administrateur délégué
  
  // 🟡 Niveau Management (Gestion)
  LOCATION_MANAGER = 'LOCATION_MANAGER', // Gestionnaire de site
  DEPARTMENT_HEAD = 'DEPARTMENT_HEAD',   // Chef de département/service
  
  // 🟢 Niveau Opérationnel (Praticiens)
  SENIOR_PRACTITIONER = 'SENIOR_PRACTITIONER', // Praticien senior
  PRACTITIONER = 'PRACTITIONER',               // Praticien standard
  JUNIOR_PRACTITIONER = 'JUNIOR_PRACTITIONER', // Praticien junior/stagiaire
  
  // 🔵 Niveau Support (Personnel de soutien)
  RECEPTIONIST = 'RECEPTIONIST',         // Réceptionniste
  ASSISTANT = 'ASSISTANT',               // Assistant(e)
  SCHEDULER = 'SCHEDULER',               // Planificateur/coordinateur
  
  // 🟣 Niveau Externe (Clients)
  CORPORATE_CLIENT = 'CORPORATE_CLIENT', // Client entreprise (RH, etc.)
  REGULAR_CLIENT = 'REGULAR_CLIENT',     // Client particulier
  VIP_CLIENT = 'VIP_CLIENT',             // Client VIP/Premium
  GUEST_CLIENT = 'GUEST_CLIENT',         // Client invité (sans compte)
}

/**
 * 🎯 Permissions Granulaires - Organisées par Domaine Fonctionnel
 */
export enum Permission {
  // 🏢 === BUSINESS MANAGEMENT ===
  CONFIGURE_BUSINESS_SETTINGS = 'CONFIGURE_BUSINESS_SETTINGS',
  MANAGE_BUSINESS_LOCATIONS = 'MANAGE_BUSINESS_LOCATIONS',
  MANAGE_BUSINESS_BRANDING = 'MANAGE_BUSINESS_BRANDING',
  VIEW_BUSINESS_ANALYTICS = 'VIEW_BUSINESS_ANALYTICS',
  MANAGE_BILLING_SETTINGS = 'MANAGE_BILLING_SETTINGS',
  
  // 👥 === STAFF MANAGEMENT ===
  MANAGE_ALL_STAFF = 'MANAGE_ALL_STAFF',
  HIRE_STAFF = 'HIRE_STAFF',
  FIRE_STAFF = 'FIRE_STAFF',
  ASSIGN_ROLES = 'ASSIGN_ROLES',
  VIEW_STAFF_PERFORMANCE = 'VIEW_STAFF_PERFORMANCE',
  APPROVE_STAFF_LEAVE = 'APPROVE_STAFF_LEAVE',
  
  // 📅 === CALENDAR MANAGEMENT ===
  CONFIGURE_BUSINESS_CALENDAR = 'CONFIGURE_BUSINESS_CALENDAR',
  MANAGE_CALENDAR_RULES = 'MANAGE_CALENDAR_RULES',
  OVERRIDE_CALENDAR_RULES = 'OVERRIDE_CALENDAR_RULES',
  BLOCK_TIME_SLOTS = 'BLOCK_TIME_SLOTS',
  MANAGE_HOLIDAYS = 'MANAGE_HOLIDAYS',
  VIEW_ALL_CALENDARS = 'VIEW_ALL_CALENDARS',
  
  // 🛎️ === SERVICE MANAGEMENT ===
  MANAGE_SERVICE_CATALOG = 'MANAGE_SERVICE_CATALOG',
  CREATE_SERVICES = 'CREATE_SERVICES',
  UPDATE_SERVICE_PRICING = 'UPDATE_SERVICE_PRICING',
  MANAGE_SERVICE_PACKAGES = 'MANAGE_SERVICE_PACKAGES',
  ASSIGN_SERVICES_TO_STAFF = 'ASSIGN_SERVICES_TO_STAFF',
  
  // 📞 === APPOINTMENT MANAGEMENT ===
  BOOK_ANY_APPOINTMENT = 'BOOK_ANY_APPOINTMENT',
  BOOK_FOR_OTHERS = 'BOOK_FOR_OTHERS',
  RESCHEDULE_ANY_APPOINTMENT = 'RESCHEDULE_ANY_APPOINTMENT',
  CANCEL_ANY_APPOINTMENT = 'CANCEL_ANY_APPOINTMENT',
  CONFIRM_APPOINTMENTS = 'CONFIRM_APPOINTMENTS',
  VIEW_ALL_APPOINTMENTS = 'VIEW_ALL_APPOINTMENTS',
  MANAGE_WAITING_LIST = 'MANAGE_WAITING_LIST',
  
  // 👤 === CLIENT MANAGEMENT ===
  MANAGE_ALL_CLIENTS = 'MANAGE_ALL_CLIENTS',
  VIEW_CLIENT_HISTORY = 'VIEW_CLIENT_HISTORY',
  CREATE_CLIENT_ACCOUNTS = 'CREATE_CLIENT_ACCOUNTS',
  EXPORT_CLIENT_DATA = 'EXPORT_CLIENT_DATA',
  MANAGE_CLIENT_NOTES = 'MANAGE_CLIENT_NOTES',
  
  // 💰 === FINANCIAL MANAGEMENT ===
  MANAGE_PRICING = 'MANAGE_PRICING',
  VIEW_FINANCIAL_REPORTS = 'VIEW_FINANCIAL_REPORTS',
  PROCESS_PAYMENTS = 'PROCESS_PAYMENTS',
  ISSUE_REFUNDS = 'ISSUE_REFUNDS',
  MANAGE_DISCOUNTS = 'MANAGE_DISCOUNTS',
  
  // 📊 === REPORTING & ANALYTICS ===
  VIEW_DETAILED_REPORTS = 'VIEW_DETAILED_REPORTS',
  EXPORT_DATA = 'EXPORT_DATA',
  VIEW_STAFF_UTILIZATION = 'VIEW_STAFF_UTILIZATION',
  VIEW_REVENUE_ANALYTICS = 'VIEW_REVENUE_ANALYTICS',
  GENERATE_CUSTOM_REPORTS = 'GENERATE_CUSTOM_REPORTS',
  
  // 🔧 === FACILITY MANAGEMENT ===
  MANAGE_FACILITIES = 'MANAGE_FACILITIES',
  ASSIGN_EQUIPMENT = 'ASSIGN_EQUIPMENT',
  BOOK_FACILITIES = 'BOOK_FACILITIES',
  MAINTAIN_EQUIPMENT = 'MAINTAIN_EQUIPMENT',
  
  // 📢 === COMMUNICATION ===
  SEND_BULK_NOTIFICATIONS = 'SEND_BULK_NOTIFICATIONS',
  MANAGE_EMAIL_TEMPLATES = 'MANAGE_EMAIL_TEMPLATES',
  ACCESS_CLIENT_COMMUNICATIONS = 'ACCESS_CLIENT_COMMUNICATIONS',
  
  // 🎯 === PERSONAL PERMISSIONS (Self-Service) ===
  MANAGE_OWN_SCHEDULE = 'MANAGE_OWN_SCHEDULE',
  VIEW_OWN_APPOINTMENTS = 'VIEW_OWN_APPOINTMENTS',
  UPDATE_OWN_PROFILE = 'UPDATE_OWN_PROFILE',
  SET_OWN_AVAILABILITY = 'SET_OWN_AVAILABILITY',
  REQUEST_LEAVE = 'REQUEST_LEAVE',
  
  // 🏥 === CLIENT PERMISSIONS ===
  BOOK_APPOINTMENT = 'BOOK_APPOINTMENT',
  CANCEL_OWN_APPOINTMENTS = 'CANCEL_OWN_APPOINTMENTS',
  RESCHEDULE_OWN_APPOINTMENTS = 'RESCHEDULE_OWN_APPOINTMENTS',
  VIEW_SERVICE_CATALOG = 'VIEW_SERVICE_CATALOG',
  BOOK_FOR_FAMILY_MEMBER = 'BOOK_FOR_FAMILY_MEMBER',
  JOIN_WAITING_LIST = 'JOIN_WAITING_LIST',
  
  // 🔒 === SYSTEM ADMINISTRATION ===
  MANAGE_SYSTEM_SETTINGS = 'MANAGE_SYSTEM_SETTINGS',
  VIEW_SYSTEM_LOGS = 'VIEW_SYSTEM_LOGS',
  MANAGE_INTEGRATIONS = 'MANAGE_INTEGRATIONS',
  BACKUP_DATA = 'BACKUP_DATA',
}

/**
 * 🎯 Contexte Métier - Types d'Entreprises Supportées
 */
export enum BusinessType {
  MEDICAL_CLINIC = 'MEDICAL_CLINIC',           // Clinique médicale
  DENTAL_OFFICE = 'DENTAL_OFFICE',             // Cabinet dentaire
  LAW_FIRM = 'LAW_FIRM',                       // Cabinet d'avocat
  BEAUTY_SALON = 'BEAUTY_SALON',               // Salon de beauté
  THERAPY_CENTER = 'THERAPY_CENTER',           // Centre de thérapie
  VETERINARY_CLINIC = 'VETERINARY_CLINIC',     // Clinique vétérinaire
  CONSULTING_FIRM = 'CONSULTING_FIRM',         // Cabinet conseil
  WELLNESS_CENTER = 'WELLNESS_CENTER',         // Centre bien-être
  FITNESS_CENTER = 'FITNESS_CENTER',           // Centre de fitness
  EDUCATIONAL_CENTER = 'EDUCATIONAL_CENTER',   // Centre éducatif
}

/**
 * 📋 Mapping Hiérarchique des Rôles vers leurs Permissions
 * 
 * 🔑 Principe: Plus le rôle est élevé hiérarchiquement, plus il hérite des permissions inférieures
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  
  // 🔴 === PLATFORM ADMIN === (Super-utilisateur système)
  [UserRole.PLATFORM_ADMIN]: [
    // Toutes les permissions - accès complet à tous les tenants
    ...Object.values(Permission)
  ],

  // 🟠 === BUSINESS OWNER === (Propriétaire principal)
  [UserRole.BUSINESS_OWNER]: [
    // Business Management
    Permission.CONFIGURE_BUSINESS_SETTINGS,
    Permission.MANAGE_BUSINESS_LOCATIONS,
    Permission.MANAGE_BUSINESS_BRANDING,
    Permission.VIEW_BUSINESS_ANALYTICS,
    Permission.MANAGE_BILLING_SETTINGS,
    
    // Staff Management - Contrôle total
    Permission.MANAGE_ALL_STAFF,
    Permission.HIRE_STAFF,
    Permission.FIRE_STAFF,
    Permission.ASSIGN_ROLES,
    Permission.VIEW_STAFF_PERFORMANCE,
    Permission.APPROVE_STAFF_LEAVE,
    
    // Calendar Management - Configuration complète
    Permission.CONFIGURE_BUSINESS_CALENDAR,
    Permission.MANAGE_CALENDAR_RULES,
    Permission.OVERRIDE_CALENDAR_RULES,
    Permission.BLOCK_TIME_SLOTS,
    Permission.MANAGE_HOLIDAYS,
    Permission.VIEW_ALL_CALENDARS,
    
    // Service Management
    Permission.MANAGE_SERVICE_CATALOG,
    Permission.CREATE_SERVICES,
    Permission.UPDATE_SERVICE_PRICING,
    Permission.MANAGE_SERVICE_PACKAGES,
    Permission.ASSIGN_SERVICES_TO_STAFF,
    
    // Appointment Management
    Permission.BOOK_ANY_APPOINTMENT,
    Permission.BOOK_FOR_OTHERS,
    Permission.RESCHEDULE_ANY_APPOINTMENT,
    Permission.CANCEL_ANY_APPOINTMENT,
    Permission.CONFIRM_APPOINTMENTS,
    Permission.VIEW_ALL_APPOINTMENTS,
    Permission.MANAGE_WAITING_LIST,
    
    // Client Management
    Permission.MANAGE_ALL_CLIENTS,
    Permission.VIEW_CLIENT_HISTORY,
    Permission.CREATE_CLIENT_ACCOUNTS,
    Permission.EXPORT_CLIENT_DATA,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Financial Management - Accès complet
    Permission.MANAGE_PRICING,
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.PROCESS_PAYMENTS,
    Permission.ISSUE_REFUNDS,
    Permission.MANAGE_DISCOUNTS,
    
    // Reporting & Analytics
    Permission.VIEW_DETAILED_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_STAFF_UTILIZATION,
    Permission.VIEW_REVENUE_ANALYTICS,
    Permission.GENERATE_CUSTOM_REPORTS,
    
    // Facility Management
    Permission.MANAGE_FACILITIES,
    Permission.ASSIGN_EQUIPMENT,
    Permission.BOOK_FACILITIES,
    Permission.MAINTAIN_EQUIPMENT,
    
    // Communication
    Permission.SEND_BULK_NOTIFICATIONS,
    Permission.MANAGE_EMAIL_TEMPLATES,
    Permission.ACCESS_CLIENT_COMMUNICATIONS,
    
    // Personal
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.SET_OWN_AVAILABILITY,
  ],

  // 🟠 === BUSINESS ADMIN === (Administrateur délégué)
  [UserRole.BUSINESS_ADMIN]: [
    // Presque toutes les permissions sauf certaines critiques
    Permission.CONFIGURE_BUSINESS_SETTINGS, // Limité selon contexte
    Permission.MANAGE_BUSINESS_LOCATIONS,
    Permission.VIEW_BUSINESS_ANALYTICS,
    
    // Staff Management - Limité
    Permission.MANAGE_ALL_STAFF,
    Permission.ASSIGN_ROLES, // Sauf roles de niveau égal/supérieur
    Permission.VIEW_STAFF_PERFORMANCE,
    Permission.APPROVE_STAFF_LEAVE,
    
    // Calendar Management
    Permission.MANAGE_CALENDAR_RULES,
    Permission.BLOCK_TIME_SLOTS,
    Permission.MANAGE_HOLIDAYS,
    Permission.VIEW_ALL_CALENDARS,
    
    // Service Management
    Permission.MANAGE_SERVICE_CATALOG,
    Permission.CREATE_SERVICES,
    Permission.UPDATE_SERVICE_PRICING,
    Permission.ASSIGN_SERVICES_TO_STAFF,
    
    // Appointment Management
    Permission.BOOK_ANY_APPOINTMENT,
    Permission.BOOK_FOR_OTHERS,
    Permission.RESCHEDULE_ANY_APPOINTMENT,
    Permission.CANCEL_ANY_APPOINTMENT,
    Permission.CONFIRM_APPOINTMENTS,
    Permission.VIEW_ALL_APPOINTMENTS,
    Permission.MANAGE_WAITING_LIST,
    
    // Client Management
    Permission.MANAGE_ALL_CLIENTS,
    Permission.VIEW_CLIENT_HISTORY,
    Permission.CREATE_CLIENT_ACCOUNTS,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Financial - Limité
    Permission.VIEW_FINANCIAL_REPORTS,
    Permission.PROCESS_PAYMENTS,
    Permission.MANAGE_DISCOUNTS,
    
    // Reporting
    Permission.VIEW_DETAILED_REPORTS,
    Permission.EXPORT_DATA,
    Permission.VIEW_STAFF_UTILIZATION,
    Permission.GENERATE_CUSTOM_REPORTS,
    
    // Facility
    Permission.MANAGE_FACILITIES,
    Permission.BOOK_FACILITIES,
    
    // Communication
    Permission.SEND_BULK_NOTIFICATIONS,
    Permission.ACCESS_CLIENT_COMMUNICATIONS,
    
    // Personal
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.SET_OWN_AVAILABILITY,
  ],

  // 🟡 === LOCATION MANAGER === (Gestionnaire de site)
  [UserRole.LOCATION_MANAGER]: [
    // Gestion de site spécifique
    Permission.VIEW_BUSINESS_ANALYTICS, // Site spécifique
    
    // Staff Management - Site spécifique
    Permission.VIEW_STAFF_PERFORMANCE, // Son site seulement
    Permission.APPROVE_STAFF_LEAVE,    // Son équipe seulement
    
    // Calendar - Site spécifique
    Permission.MANAGE_CALENDAR_RULES,  // Son site seulement
    Permission.BLOCK_TIME_SLOTS,
    Permission.VIEW_ALL_CALENDARS,     // Site spécifique
    
    // Services
    Permission.ASSIGN_SERVICES_TO_STAFF, // Son site
    
    // Appointments - Site spécifique
    Permission.BOOK_ANY_APPOINTMENT,
    Permission.RESCHEDULE_ANY_APPOINTMENT,
    Permission.CANCEL_ANY_APPOINTMENT,
    Permission.CONFIRM_APPOINTMENTS,
    Permission.VIEW_ALL_APPOINTMENTS,  // Site spécifique
    Permission.MANAGE_WAITING_LIST,
    
    // Clients - Site spécifique
    Permission.VIEW_CLIENT_HISTORY,
    Permission.CREATE_CLIENT_ACCOUNTS,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Financial - Limité
    Permission.PROCESS_PAYMENTS,
    
    // Reporting - Site spécifique
    Permission.VIEW_DETAILED_REPORTS,
    Permission.VIEW_STAFF_UTILIZATION,
    
    // Facilities - Site spécifique
    Permission.BOOK_FACILITIES,
    Permission.MAINTAIN_EQUIPMENT,
    
    // Communication
    Permission.ACCESS_CLIENT_COMMUNICATIONS,
    
    // Personal
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.SET_OWN_AVAILABILITY,
  ],

  // 🟡 === DEPARTMENT HEAD === (Chef de département)
  [UserRole.DEPARTMENT_HEAD]: [
    // Staff Management - Département spécifique
    Permission.VIEW_STAFF_PERFORMANCE, // Son département
    Permission.APPROVE_STAFF_LEAVE,
    
    // Calendar - Département
    Permission.BLOCK_TIME_SLOTS,
    Permission.VIEW_ALL_CALENDARS,
    
    // Services - Département
    Permission.ASSIGN_SERVICES_TO_STAFF,
    
    // Appointments - Département
    Permission.RESCHEDULE_ANY_APPOINTMENT,
    Permission.CANCEL_ANY_APPOINTMENT,
    Permission.CONFIRM_APPOINTMENTS,
    Permission.VIEW_ALL_APPOINTMENTS, // Département
    Permission.MANAGE_WAITING_LIST,
    
    // Clients
    Permission.VIEW_CLIENT_HISTORY,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Reporting - Département
    Permission.VIEW_DETAILED_REPORTS,
    Permission.VIEW_STAFF_UTILIZATION,
    
    // Personal
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.SET_OWN_AVAILABILITY,
  ],

  // 🟢 === SENIOR PRACTITIONER === (Praticien senior)
  [UserRole.SENIOR_PRACTITIONER]: [
    // Calendar - Personnel + guidance équipe
    Permission.BLOCK_TIME_SLOTS, // Ses créneaux + orientation junior
    
    // Appointments - Étendues
    Permission.RESCHEDULE_ANY_APPOINTMENT, // Limité à ses clients + junior
    Permission.CONFIRM_APPOINTMENTS,
    Permission.VIEW_ALL_APPOINTMENTS, // Équipe sous supervision
    
    // Clients - Étendues
    Permission.VIEW_CLIENT_HISTORY,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Mentoring (implicite via business rules)
    
    // Personal - Complet
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.SET_OWN_AVAILABILITY,
    Permission.REQUEST_LEAVE,
  ],

  // 🟢 === PRACTITIONER === (Praticien standard)
  [UserRole.PRACTITIONER]: [
    // Appointments - Ses clients seulement
    Permission.CONFIRM_APPOINTMENTS, // Ses RDV seulement
    
    // Clients - Ses clients
    Permission.VIEW_CLIENT_HISTORY, // Clients assignés
    Permission.MANAGE_CLIENT_NOTES, // Clients assignés
    
    // Personal - Complet
    Permission.MANAGE_OWN_SCHEDULE,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.SET_OWN_AVAILABILITY,
    Permission.REQUEST_LEAVE,
  ],

  // 🟢 === JUNIOR PRACTITIONER === (Praticien junior/stagiaire)
  [UserRole.JUNIOR_PRACTITIONER]: [
    // Limité - sous supervision
    
    // Clients - Très limité
    Permission.VIEW_CLIENT_HISTORY, // Clients assignés seulement
    
    // Personal - Basique
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.UPDATE_OWN_PROFILE,
    Permission.REQUEST_LEAVE, // Avec approbation
  ],

  // 🔵 === RECEPTIONIST === (Réceptionniste)
  [UserRole.RECEPTIONIST]: [
    // Appointments - Front office
    Permission.BOOK_ANY_APPOINTMENT,
    Permission.BOOK_FOR_OTHERS,
    Permission.RESCHEDULE_ANY_APPOINTMENT,
    Permission.CANCEL_ANY_APPOINTMENT,
    Permission.CONFIRM_APPOINTMENTS,
    Permission.VIEW_ALL_APPOINTMENTS,
    Permission.MANAGE_WAITING_LIST,
    
    // Clients - Front office
    Permission.VIEW_CLIENT_HISTORY,
    Permission.CREATE_CLIENT_ACCOUNTS,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Financial - Paiements
    Permission.PROCESS_PAYMENTS,
    
    // Communication
    Permission.ACCESS_CLIENT_COMMUNICATIONS,
    
    // Personal
    Permission.UPDATE_OWN_PROFILE,
  ],

  // 🔵 === ASSISTANT === (Assistant(e))
  [UserRole.ASSISTANT]: [
    // Support aux praticiens
    
    // Appointments - Support
    Permission.VIEW_ALL_APPOINTMENTS, // Selon assignment
    Permission.MANAGE_WAITING_LIST,
    
    // Clients - Support
    Permission.VIEW_CLIENT_HISTORY,
    Permission.MANAGE_CLIENT_NOTES,
    
    // Communication
    Permission.ACCESS_CLIENT_COMMUNICATIONS,
    
    // Personal
    Permission.UPDATE_OWN_PROFILE,
  ],

  // 🔵 === SCHEDULER === (Planificateur)
  [UserRole.SCHEDULER]: [
    // Spécialisé dans la planification
    
    // Calendar
    Permission.VIEW_ALL_CALENDARS,
    
    // Appointments - Planification avancée
    Permission.BOOK_ANY_APPOINTMENT,
    Permission.RESCHEDULE_ANY_APPOINTMENT,
    Permission.VIEW_ALL_APPOINTMENTS,
    Permission.MANAGE_WAITING_LIST,
    
    // Clients - Planification
    Permission.VIEW_CLIENT_HISTORY,
    
    // Reporting - Utilisation
    Permission.VIEW_STAFF_UTILIZATION,
    
    // Personal
    Permission.UPDATE_OWN_PROFILE,
  ],

  // 🟣 === CORPORATE CLIENT === (Client entreprise)
  [UserRole.CORPORATE_CLIENT]: [
    // Réservations avancées pour employés
    Permission.BOOK_APPOINTMENT,
    Permission.BOOK_FOR_OTHERS, // Employés de l'entreprise
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.RESCHEDULE_OWN_APPOINTMENTS,
    Permission.CANCEL_OWN_APPOINTMENTS,
    Permission.VIEW_SERVICE_CATALOG,
    Permission.JOIN_WAITING_LIST,
  ],

  // 🟣 === VIP CLIENT === (Client VIP)
  [UserRole.VIP_CLIENT]: [
    // Privilèges étendus
    Permission.BOOK_APPOINTMENT,
    Permission.BOOK_FOR_FAMILY_MEMBER,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.RESCHEDULE_OWN_APPOINTMENTS,
    Permission.CANCEL_OWN_APPOINTMENTS,
    Permission.VIEW_SERVICE_CATALOG,
    Permission.JOIN_WAITING_LIST,
    // Accès prioritaire (via business rules)
  ],

  // 🟣 === REGULAR CLIENT === (Client particulier)
  [UserRole.REGULAR_CLIENT]: [
    // Permissions client standard
    Permission.BOOK_APPOINTMENT,
    Permission.BOOK_FOR_FAMILY_MEMBER,
    Permission.VIEW_OWN_APPOINTMENTS,
    Permission.RESCHEDULE_OWN_APPOINTMENTS,
    Permission.CANCEL_OWN_APPOINTMENTS,
    Permission.VIEW_SERVICE_CATALOG,
    Permission.JOIN_WAITING_LIST,
  ],

  // 🟣 === GUEST CLIENT === (Client invité)
  [UserRole.GUEST_CLIENT]: [
    // Permissions très limitées
    Permission.BOOK_APPOINTMENT, // Avec limitations
    Permission.VIEW_SERVICE_CATALOG,
  ],
};

/**
 * 🏗️ Hiérarchie des Rôles - Ordre d'autorité décroissante
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.PLATFORM_ADMIN]: 1000,
  [UserRole.BUSINESS_OWNER]: 900,
  [UserRole.BUSINESS_ADMIN]: 800,
  [UserRole.LOCATION_MANAGER]: 700,
  [UserRole.DEPARTMENT_HEAD]: 600,
  [UserRole.SENIOR_PRACTITIONER]: 500,
  [UserRole.PRACTITIONER]: 400,
  [UserRole.JUNIOR_PRACTITIONER]: 300,
  [UserRole.SCHEDULER]: 250,
  [UserRole.RECEPTIONIST]: 200,
  [UserRole.ASSISTANT]: 150,
  [UserRole.CORPORATE_CLIENT]: 100,
  [UserRole.VIP_CLIENT]: 80,
  [UserRole.REGULAR_CLIENT]: 60,
  [UserRole.GUEST_CLIENT]: 40,
};

/**
 * 🎯 Groupes Fonctionnels de Rôles
 */
export const ROLE_GROUPS = {
  MANAGEMENT: [
    UserRole.PLATFORM_ADMIN,
    UserRole.BUSINESS_OWNER,
    UserRole.BUSINESS_ADMIN,
    UserRole.LOCATION_MANAGER,
    UserRole.DEPARTMENT_HEAD,
  ],
  PRACTITIONERS: [
    UserRole.SENIOR_PRACTITIONER,
    UserRole.PRACTITIONER,
    UserRole.JUNIOR_PRACTITIONER,
  ],
  SUPPORT_STAFF: [
    UserRole.RECEPTIONIST,
    UserRole.ASSISTANT,
    UserRole.SCHEDULER,
  ],
  CLIENTS: [
    UserRole.CORPORATE_CLIENT,
    UserRole.VIP_CLIENT,
    UserRole.REGULAR_CLIENT,
    UserRole.GUEST_CLIENT,
  ],
} as const;

/**
 * 🏥 Permissions Spécialisées par Type d'Entreprise
 */
export const BUSINESS_TYPE_PERMISSIONS: Record<BusinessType, Permission[]> = {
  [BusinessType.MEDICAL_CLINIC]: [
    // Permissions médicales spécialisées
    Permission.VIEW_CLIENT_HISTORY, // Dossier médical
    Permission.MANAGE_CLIENT_NOTES, // Notes médicales
    Permission.CONFIRM_APPOINTMENTS, // Confirmation RDV médical
  ],
  
  [BusinessType.DENTAL_OFFICE]: [
    Permission.VIEW_CLIENT_HISTORY,
    Permission.MANAGE_CLIENT_NOTES,
    Permission.MANAGE_FACILITIES, // Équipements dentaires
  ],
  
  [BusinessType.LAW_FIRM]: [
    Permission.MANAGE_CLIENT_NOTES, // Notes confidentielles
    Permission.VIEW_CLIENT_HISTORY, // Dossiers clients
    Permission.BOOK_FOR_OTHERS, // Secrétaire juridique
  ],
  
  [BusinessType.BEAUTY_SALON]: [
    Permission.MANAGE_SERVICE_PACKAGES, // Forfaits beauté
    Permission.BOOK_FOR_FAMILY_MEMBER,
    Permission.JOIN_WAITING_LIST,
  ],
  
  [BusinessType.THERAPY_CENTER]: [
    Permission.VIEW_CLIENT_HISTORY,
    Permission.MANAGE_CLIENT_NOTES,
    Permission.REQUEST_LEAVE, // Thérapie continue
  ],
  
  [BusinessType.VETERINARY_CLINIC]: [
    Permission.BOOK_FOR_OTHERS, // Propriétaires d'animaux
    Permission.MANAGE_CLIENT_NOTES, // Dossier animal
    Permission.VIEW_CLIENT_HISTORY,
  ],
  
  [BusinessType.CONSULTING_FIRM]: [
    Permission.BOOK_FOR_OTHERS,
    Permission.MANAGE_SERVICE_PACKAGES,
    Permission.VIEW_DETAILED_REPORTS,
  ],
  
  [BusinessType.WELLNESS_CENTER]: [
    Permission.MANAGE_SERVICE_PACKAGES,
    Permission.JOIN_WAITING_LIST,
    Permission.BOOK_FOR_FAMILY_MEMBER,
  ],
  
  [BusinessType.FITNESS_CENTER]: [
    Permission.MANAGE_SERVICE_PACKAGES,
    Permission.BOOK_FACILITIES, // Salles de sport
    Permission.JOIN_WAITING_LIST,
  ],
  
  [BusinessType.EDUCATIONAL_CENTER]: [
    Permission.BOOK_FOR_OTHERS, // Parents/tuteurs
    Permission.MANAGE_SERVICE_PACKAGES, // Cours/formations
    Permission.VIEW_DETAILED_REPORTS,
  ],
};

/**
 * 🛠️ Utilitaires pour la Gestion des Rôles et Permissions
 */
export class RoleUtils {
  
  /**
   * Vérifie si un rôle a une permission spécifique
   */
  static hasPermission(role: UserRole, permission: Permission): boolean {
    return ROLE_PERMISSIONS[role]?.includes(permission) || false;
  }
  
  /**
   * Vérifie si le rôle A peut agir sur le rôle B (hiérarchie)
   */
  static canActOnRole(actorRole: UserRole, targetRole: UserRole): boolean {
    return ROLE_HIERARCHY[actorRole] > ROLE_HIERARCHY[targetRole];
  }
  
  /**
   * Obtient toutes les permissions d'un rôle
   */
  static getRolePermissions(role: UserRole): Permission[] {
    return [...(ROLE_PERMISSIONS[role] || [])];
  }
  
  /**
   * Vérifie si un rôle appartient à un groupe fonctionnel
   */
  static isInGroup(role: UserRole, groupName: keyof typeof ROLE_GROUPS): boolean {
    return (ROLE_GROUPS[groupName] as readonly UserRole[]).includes(role);
  }
  
  /**
   * Obtient le niveau hiérarchique d'un rôle
   */
  static getRoleLevel(role: UserRole): number {
    return ROLE_HIERARCHY[role] || 0;
  }
  
  /**
   * Détermine si c'est un rôle de management
   */
  static isManagementRole(role: UserRole): boolean {
    return this.isInGroup(role, 'MANAGEMENT');
  }
  
  /**
   * Détermine si c'est un rôle de praticien
   */
  static isPractitionerRole(role: UserRole): boolean {
    return this.isInGroup(role, 'PRACTITIONERS');
  }
  
  /**
   * Détermine si c'est un rôle client
   */
  static isClientRole(role: UserRole): boolean {
    return this.isInGroup(role, 'CLIENTS');
  }
  
  /**
   * Détermine si c'est un rôle de personnel de support
   */
  static isSupportRole(role: UserRole): boolean {
    return this.isInGroup(role, 'SUPPORT_STAFF');
  }
  
  /**
   * Obtient les permissions supplémentaires selon le type d'entreprise
   */
  static getBusinessTypePermissions(businessType: BusinessType): Permission[] {
    return [...(BUSINESS_TYPE_PERMISSIONS[businessType] || [])];
  }
  
  /**
   * Combine les permissions de base du rôle avec celles du type d'entreprise
   */
  static getEffectivePermissions(
    role: UserRole, 
    businessType: BusinessType
  ): Permission[] {
    const basePermissions = this.getRolePermissions(role);
    const businessPermissions = this.getBusinessTypePermissions(businessType);
    
    // Fusion sans doublons
    const uniquePermissions = new Set([...basePermissions, ...businessPermissions]);
    return Array.from(uniquePermissions);
  }
  
  /**
   * Filtre les rôles accessibles pour un rôle donné (pour assignation)
   */
  static getAssignableRoles(actorRole: UserRole): UserRole[] {
    const actorLevel = this.getRoleLevel(actorRole);
    
    return Object.values(UserRole).filter(role => {
      const targetLevel = this.getRoleLevel(role);
      return targetLevel < actorLevel;
    });
  }
  
  /**
   * Obtient une description textuelle du rôle
   */
  static getRoleDescription(role: UserRole): string {
    const descriptions: Record<UserRole, string> = {
      [UserRole.PLATFORM_ADMIN]: 'Administrateur Plateforme - Accès complet multi-tenant',
      [UserRole.BUSINESS_OWNER]: 'Propriétaire - Contrôle total de l\'entreprise',
      [UserRole.BUSINESS_ADMIN]: 'Administrateur - Gestion déléguée de l\'entreprise',
      [UserRole.LOCATION_MANAGER]: 'Gestionnaire de Site - Supervision d\'un lieu',
      [UserRole.DEPARTMENT_HEAD]: 'Chef de Département - Direction d\'équipe spécialisée',
      [UserRole.SENIOR_PRACTITIONER]: 'Praticien Senior - Expert avec mentorat',
      [UserRole.PRACTITIONER]: 'Praticien - Professionnel certifié',
      [UserRole.JUNIOR_PRACTITIONER]: 'Praticien Junior - En formation/supervision',
      [UserRole.RECEPTIONIST]: 'Réceptionniste - Accueil et gestion front office',
      [UserRole.ASSISTANT]: 'Assistant(e) - Support aux praticiens',
      [UserRole.SCHEDULER]: 'Planificateur - Spécialiste de la planification',
      [UserRole.CORPORATE_CLIENT]: 'Client Entreprise - Réservations pour employés',
      [UserRole.VIP_CLIENT]: 'Client VIP - Privilèges étendus',
      [UserRole.REGULAR_CLIENT]: 'Client - Accès standard aux services',
      [UserRole.GUEST_CLIENT]: 'Invité - Accès limité sans compte',
    };
    
    return descriptions[role] || 'Rôle non défini';
  }
}
