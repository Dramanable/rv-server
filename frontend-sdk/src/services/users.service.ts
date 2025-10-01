/**
 * 👥 Users Service - Gestion des Utilisateurs
 *
 * Service pour la gestion des utilisateurs
 * dans le système RV Project
 *
 * @version 1.0.0
 */

import { RVProjectClient } from '../client';

// Enums
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export enum UserRole {
  PLATFORM_ADMIN = 'PLATFORM_ADMIN',
  BUSINESS_OWNER = 'BUSINESS_OWNER',
  BUSINESS_ADMIN = 'BUSINESS_ADMIN',
  STAFF_MEMBER = 'STAFF_MEMBER',
  CLIENT = 'CLIENT'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY'
}

export enum NotificationPreference {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP'
}

// Interfaces
export interface User {
  readonly id: string;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly dateOfBirth?: string;
  readonly gender?: Gender;
  readonly avatar?: string;
  readonly bio?: string;
  readonly address?: {
    readonly street?: string;
    readonly city?: string;
    readonly zipCode?: string;
    readonly country?: string;
  };
  readonly role: UserRole;
  readonly status: UserStatus;
  readonly isVerified: boolean;
  readonly emailVerifiedAt?: string;
  readonly phoneVerifiedAt?: string;
  readonly lastLoginAt?: string;
  readonly loginCount: number;
  readonly language: string;
  readonly timezone: string;
  readonly notificationPreferences: readonly NotificationPreference[];
  readonly privacySettings: {
    readonly profileVisible: boolean;
    readonly emailVisible: boolean;
    readonly phoneVisible: boolean;
    readonly allowMarketing: boolean;
  };
  readonly twoFactorEnabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;

  // Statistiques utilisateur
  readonly stats?: {
    readonly totalAppointments: number;
    readonly completedAppointments: number;
    readonly cancelledAppointments: number;
    readonly noShowAppointments: number;
    readonly averageRating: number;
    readonly reviewCount: number;
  };

  // Données business associées (pour les utilisateurs business)
  readonly businesses?: readonly {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly joinedAt: string;
  }[];
}

export interface CreateUserDto {
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone?: string;
  readonly dateOfBirth?: string;
  readonly gender?: Gender;
  readonly password: string;
  readonly role?: UserRole;
  readonly language?: string;
  readonly timezone?: string;
  readonly bio?: string;
  readonly address?: {
    readonly street?: string;
    readonly city?: string;
    readonly zipCode?: string;
    readonly country?: string;
  };
  readonly notificationPreferences?: readonly NotificationPreference[];
  readonly privacySettings?: {
    readonly profileVisible?: boolean;
    readonly emailVisible?: boolean;
    readonly phoneVisible?: boolean;
    readonly allowMarketing?: boolean;
  };
}

export interface UpdateUserDto {
  readonly firstName?: string;
  readonly lastName?: string;
  readonly phone?: string;
  readonly dateOfBirth?: string;
  readonly gender?: Gender;
  readonly bio?: string;
  readonly address?: {
    readonly street?: string;
    readonly city?: string;
    readonly zipCode?: string;
    readonly country?: string;
  };
  readonly language?: string;
  readonly timezone?: string;
  readonly notificationPreferences?: readonly NotificationPreference[];
  readonly privacySettings?: {
    readonly profileVisible?: boolean;
    readonly emailVisible?: boolean;
    readonly phoneVisible?: boolean;
    readonly allowMarketing?: boolean;
  };
}

export interface UpdateUserPasswordDto {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export interface ListUsersDto {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'email' | 'lastLoginAt' | 'loginCount';
  readonly sortOrder?: 'asc' | 'desc';
  readonly search?: string;
  readonly role?: UserRole;
  readonly status?: UserStatus;
  readonly isVerified?: boolean;
  readonly hasAvatar?: boolean;
  readonly language?: string;
  readonly country?: string;
  readonly gender?: Gender;
  readonly ageMin?: number;
  readonly ageMax?: number;
  readonly registeredAfter?: string;
  readonly registeredBefore?: string;
  readonly lastLoginAfter?: string;
  readonly lastLoginBefore?: string;
}

export interface ListUsersResponse {
  readonly data: readonly User[];
  readonly meta: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface CreateUserResponse {
  readonly success: boolean;
  readonly data: User;
  readonly message: string;
}

export interface UpdateUserResponse {
  readonly success: boolean;
  readonly data: User;
  readonly message: string;
}

export interface DeleteUserResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface UserStats {
  readonly totalUsers: number;
  readonly activeUsers: number;
  readonly verifiedUsers: number;
  readonly newUsersThisMonth: number;
  readonly usersByRole: Record<UserRole, number>;
  readonly usersByStatus: Record<UserStatus, number>;
  readonly usersByCountry: readonly {
    readonly country: string;
    readonly count: number;
  }[];
  readonly averageAge: number;
  readonly genderDistribution: Record<Gender, number>;
  readonly registrationTrend: readonly {
    readonly date: string;
    readonly count: number;
  }[];
}

export interface VerifyEmailResponse {
  readonly success: boolean;
  readonly message: string;
}

export interface ResetPasswordResponse {
  readonly success: boolean;
  readonly message: string;
}

/**
 * 👥 Service principal pour la gestion des utilisateurs
 */
export default class UsersService {
  constructor(private client: RVProjectClient) {}

  /**
   * 📋 Lister les utilisateurs avec filtrage avancé
   */
  async list(params: ListUsersDto = {}): Promise<ListUsersResponse> {
    const response = await this.client.post('/api/v1/users/list', params);
    return response.data;
  }

  /**
   * 📄 Obtenir un utilisateur par ID
   */
  async getById(id: string): Promise<User> {
    const response = await this.client.get(`/api/v1/users/${id}`);
    return response.data.data;
  }

  /**
   * ➕ Créer un nouvel utilisateur
   */
  async create(data: CreateUserDto): Promise<CreateUserResponse> {
    const response = await this.client.post('/api/v1/users', data);
    return response.data;
  }

  /**
   * ✏️ Mettre à jour un utilisateur
   */
  async update(id: string, data: UpdateUserDto): Promise<UpdateUserResponse> {
    const response = await this.client.put(`/api/v1/users/${id}`, data);
    return response.data;
  }

  /**
   * 🔒 Changer le mot de passe d'un utilisateur
   */
  async updatePassword(id: string, data: UpdateUserPasswordDto): Promise<UpdateUserResponse> {
    const response = await this.client.patch(`/api/v1/users/${id}/password`, data);
    return response.data;
  }

  /**
   * 🗑️ Supprimer un utilisateur
   */
  async delete(id: string): Promise<DeleteUserResponse> {
    const response = await this.client.delete(`/api/v1/users/${id}`);
    return response.data;
  }

  /**
   * 📧 Obtenir un utilisateur par email
   */
  async getByEmail(email: string): Promise<User | null> {
    try {
      const response = await this.client.get(`/api/v1/users/email/${encodeURIComponent(email)}`);
      return response.data.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 👔 Obtenir les utilisateurs par rôle
   */
  async getByRole(role: UserRole): Promise<User[]> {
    const response = await this.list({ role, limit: 100 });
    return [...response.data];
  }

  /**
   * ✅ Obtenir les utilisateurs actifs
   */
  async getActiveUsers(): Promise<User[]> {
    const response = await this.list({ status: UserStatus.ACTIVE, limit: 100 });
    return [...response.data];
  }

  /**
   * ✅ Obtenir les utilisateurs vérifiés
   */
  async getVerifiedUsers(): Promise<User[]> {
    const response = await this.list({ isVerified: true, limit: 100 });
    return [...response.data];
  }

  /**
   * 🌍 Obtenir les utilisateurs par pays
   */
  async getByCountry(country: string): Promise<User[]> {
    const response = await this.list({ country, limit: 100 });
    return [...response.data];
  }

  /**
   * 🗣️ Obtenir les utilisateurs par langue
   */
  async getByLanguage(language: string): Promise<User[]> {
    const response = await this.list({ language, limit: 100 });
    return [...response.data];
  }

  /**
   * 🎂 Obtenir les utilisateurs par tranche d'âge
   */
  async getByAgeRange(minAge: number, maxAge: number): Promise<User[]> {
    const response = await this.list({ ageMin: minAge, ageMax: maxAge, limit: 100 });
    return [...response.data];
  }

  /**
   * 🔄 Changer le statut d'un utilisateur
   */
  async changeStatus(userId: string, status: UserStatus, reason?: string): Promise<UpdateUserResponse> {
    const response = await this.client.patch(`/api/v1/users/${userId}/status`, {
      status,
      reason
    });
    return response.data;
  }

  /**
   * ✅ Activer un utilisateur
   */
  async activate(userId: string): Promise<UpdateUserResponse> {
    return this.changeStatus(userId, UserStatus.ACTIVE, 'User activated');
  }

  /**
   * ⏸️ Désactiver un utilisateur
   */
  async deactivate(userId: string, reason?: string): Promise<UpdateUserResponse> {
    return this.changeStatus(userId, UserStatus.INACTIVE, reason || 'User deactivated');
  }

  /**
   * ⛔ Suspendre un utilisateur
   */
  async suspend(userId: string, reason?: string): Promise<UpdateUserResponse> {
    return this.changeStatus(userId, UserStatus.SUSPENDED, reason || 'User suspended');
  }

  /**
   * 📧 Vérifier l'email d'un utilisateur
   */
  async verifyEmail(token: string): Promise<VerifyEmailResponse> {
    const response = await this.client.post('/api/v1/users/verify-email', { token });
    return response.data;
  }

  /**
   * 🔄 Renvoyer l'email de vérification
   */
  async resendVerificationEmail(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/api/v1/users/${userId}/resend-verification`);
    return response.data;
  }

  /**
   * 🔐 Activer l'authentification à deux facteurs
   */
  async enableTwoFactor(userId: string): Promise<{ success: boolean; qrCode: string; backupCodes: string[] }> {
    const response = await this.client.post(`/api/v1/users/${userId}/enable-2fa`);
    return response.data;
  }

  /**
   * 🔐 Désactiver l'authentification à deux facteurs
   */
  async disableTwoFactor(userId: string, code: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post(`/api/v1/users/${userId}/disable-2fa`, { code });
    return response.data;
  }

  /**
   * 🖼️ Télécharger un avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<{ success: boolean; avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await this.client.post(`/api/v1/users/${userId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * 🗑️ Supprimer l'avatar
   */
  async deleteAvatar(userId: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.delete(`/api/v1/users/${userId}/avatar`);
    return response.data;
  }

  /**
   * 📊 Obtenir les statistiques des utilisateurs
   */
  async getStats(): Promise<UserStats> {
    const response = await this.client.get('/api/v1/users/stats');
    return response.data.data;
  }

  /**
   * 🔍 Rechercher des utilisateurs
   */
  async search(query: string): Promise<User[]> {
    const response = await this.list({ search: query, limit: 50 });
    return [...response.data];
  }

  /**
   * 📅 Obtenir les nouveaux utilisateurs
   */
  async getNewUsers(days: number = 7): Promise<User[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const registeredAfter = date.toISOString();

    const response = await this.list({ registeredAfter, limit: 100 });
    return [...response.data];
  }

  /**
   * 🏆 Obtenir les utilisateurs les plus actifs
   */
  async getMostActiveUsers(limit: number = 10): Promise<User[]> {
    const response = await this.list({
      sortBy: 'loginCount',
      sortOrder: 'desc',
      limit
    });
    return [...response.data];
  }

  /**
   * 🏷️ Obtenir tous les rôles d'utilisateur
   */
  static getRoles(): UserRole[] {
    return Object.values(UserRole);
  }

  /**
   * 🏷️ Obtenir tous les statuts d'utilisateur
   */
  static getStatuses(): UserStatus[] {
    return Object.values(UserStatus);
  }

  /**
   * 🏷️ Obtenir tous les genres
   */
  static getGenders(): Gender[] {
    return Object.values(Gender);
  }

  /**
   * 🔔 Obtenir toutes les préférences de notification
   */
  static getNotificationPreferences(): NotificationPreference[] {
    return Object.values(NotificationPreference);
  }

  /**
   * 🎨 Obtenir la couleur pour un statut
   */
  static getStatusColor(status: UserStatus): string {
    const colors: Record<UserStatus, string> = {
      [UserStatus.ACTIVE]: '#22C55E',        // Vert
      [UserStatus.INACTIVE]: '#6B7280',      // Gris
      [UserStatus.PENDING]: '#F59E0B',       // Orange
      [UserStatus.SUSPENDED]: '#EF4444',     // Rouge
      [UserStatus.DELETED]: '#1F2937'        // Noir
    };
    return colors[status] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un statut
   */
  static getStatusIcon(status: UserStatus): string {
    const icons: Record<UserStatus, string> = {
      [UserStatus.ACTIVE]: '✅',
      [UserStatus.INACTIVE]: '⚫',
      [UserStatus.PENDING]: '⏳',
      [UserStatus.SUSPENDED]: '⛔',
      [UserStatus.DELETED]: '🗑️'
    };
    return icons[status] || '❓';
  }

  /**
   * 🎨 Obtenir la couleur pour un rôle
   */
  static getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
      [UserRole.PLATFORM_ADMIN]: '#DC2626',    // Rouge
      [UserRole.BUSINESS_OWNER]: '#7C3AED',    // Violet
      [UserRole.BUSINESS_ADMIN]: '#2563EB',    // Bleu
      [UserRole.STAFF_MEMBER]: '#16A34A',      // Vert
      [UserRole.CLIENT]: '#6366F1'             // Indigo
    };
    return colors[role] || '#6B7280';
  }

  /**
   * 🎨 Obtenir l'icône pour un rôle
   */
  static getRoleIcon(role: UserRole): string {
    const icons: Record<UserRole, string> = {
      [UserRole.PLATFORM_ADMIN]: '👑',
      [UserRole.BUSINESS_OWNER]: '🏢',
      [UserRole.BUSINESS_ADMIN]: '👨‍💼',
      [UserRole.STAFF_MEMBER]: '👥',
      [UserRole.CLIENT]: '👤'
    };
    return icons[role] || '❓';
  }

  /**
   * ✅ Valider les données utilisateur
   */
  static validateUserData(data: CreateUserDto | UpdateUserDto): string[] {
    const errors: string[] = [];

    if ('email' in data && data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        errors.push('Format d\'email invalide');
      }
    }

    if ('phone' in data && data.phone) {
      const phoneRegex = /^\+?[\d\s-()]{10,}$/;
      if (!phoneRegex.test(data.phone)) {
        errors.push('Format de téléphone invalide');
      }
    }

    if ('dateOfBirth' in data && data.dateOfBirth) {
      const birthDate = new Date(data.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 13 || age > 120) {
        errors.push('L\'âge doit être entre 13 et 120 ans');
      }
    }

    if ('password' in data && data.password) {
      if (data.password.length < 8) {
        errors.push('Le mot de passe doit contenir au moins 8 caractères');
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
        errors.push('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre');
      }
    }

    return errors;
  }

  /**
   * 🔧 Utilitaires pour les utilisateurs
   */
  static readonly utils = {
    /**
     * Obtenir le nom complet d'un utilisateur
     */
    getFullName: (user: User): string => {
      return `${user.firstName} ${user.lastName}`;
    },

    /**
     * Obtenir les initiales d'un utilisateur
     */
    getInitials: (user: User): string => {
      const firstName = user.firstName.charAt(0).toUpperCase();
      const lastName = user.lastName.charAt(0).toUpperCase();
      return `${firstName}${lastName}`;
    },

    /**
     * Calculer l'âge d'un utilisateur
     */
    calculateAge: (user: User): number | null => {
      if (!user.dateOfBirth) return null;

      const birthDate = new Date(user.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age;
    },

    /**
     * Vérifier si un utilisateur est actif
     */
    isActive: (user: User): boolean => {
      return user.status === UserStatus.ACTIVE;
    },

    /**
     * Vérifier si un utilisateur est vérifié
     */
    isVerified: (user: User): boolean => {
      return user.isVerified;
    },

    /**
     * Obtenir le temps depuis la dernière connexion
     */
    getLastLoginText: (user: User): string => {
      if (!user.lastLoginAt) return 'Jamais connecté';

      const lastLogin = new Date(user.lastLoginAt);
      const now = new Date();
      const diffTime = now.getTime() - lastLogin.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Aujourd\'hui';
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
      if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
      return `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;
    },

    /**
     * Formater l'adresse complète
     */
    formatAddress: (user: User): string => {
      if (!user.address) return '';

      const parts = [
        user.address.street,
        user.address.city,
        user.address.zipCode,
        user.address.country
      ].filter(Boolean);

      return parts.join(', ');
    },

    /**
     * Vérifier si l'utilisateur a des préférences de notification
     */
    hasNotificationPreference: (user: User, preference: NotificationPreference): boolean => {
      return user.notificationPreferences.includes(preference);
    },

    /**
     * Obtenir l'URL de l'avatar ou une valeur par défaut
     */
    getAvatarUrl: (user: User, defaultUrl?: string): string => {
      return user.avatar || defaultUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(UsersService.utils.getFullName(user))}&background=random`;
    }
  };
}
