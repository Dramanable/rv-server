/**
 * 🔐 Permissions System
 *
 * Définition granulaire des permissions pour chaque rôle
 */

export enum Permission {
  // Gestion des utilisateurs
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  UPDATE_USERS = 'update_users',
  DELETE_USERS = 'delete_users',

  // Gestion des rôles
  MANAGE_ROLES = 'manage_roles',
  ASSIGN_ROLES = 'assign_roles',

  // Administration système
  ACCESS_ADMIN_PANEL = 'access_admin_panel',
  MANAGE_SYSTEM = 'manage_system',
  VIEW_LOGS = 'view_logs',
  MANAGE_SETTINGS = 'manage_settings',

  // Gestion des équipes
  MANAGE_TEAM = 'manage_team',
  VIEW_TEAM = 'view_team',

  // Permissions de base
  VIEW_PROFILE = 'view_profile',
  UPDATE_PROFILE = 'update_profile',
  CHANGE_PASSWORD = 'change_password',
}
