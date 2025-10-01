/**
 * 🔐 RV Project Frontend SDK - Service d'Authentification
 *
 * Gestion complète de l'authentification avec cookies HttpOnly
 * Conforme à l'API qui utilise des cookies sécurisés
 */

import { RVProjectClient } from '../client';
import {
    LoginRequest,
    RegisterRequest,
    UpdateUserRequest,
    User
} from '../types';

export class AuthService {
  constructor(private client: RVProjectClient) {}

  /**
   * 🍪 Connexion utilisateur avec cookies HttpOnly
   */
  async login(request: LoginRequest): Promise<User> {
    const response = await this.client.post<User>('/auth/login', request);
    return response.data;
  }

  /**
   * Connexion rapide avec email/password
   */
  async quickLogin(email: string, password: string, rememberMe: boolean = false): Promise<User> {
    return this.login({ email, password, rememberMe });
  }

  /**
   * 🍪 Inscription d'un nouvel utilisateur avec auto-login
   */
  async register(request: RegisterRequest): Promise<User> {
    const response = await this.client.post<User>('/auth/register', request);
    return response.data;
  }

  /**
   * 🍪 Déconnexion utilisateur - supprime les cookies
   */
  async logout(logoutAllDevices: boolean = false): Promise<void> {
    await this.client.post('/auth/logout', { logoutAllDevices });
  }

  /**
   * 🍪 Obtenir l'utilisateur actuel (vérifie les cookies)
   */
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    return response.data;
  }

  /**
   * 🍪 Refresh automatique des tokens via cookies
   */
  async refreshTokens(): Promise<boolean> {
    try {
      await this.client.post('/auth/refresh', {});
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(updates: UpdateUserRequest): Promise<User> {
    const response = await this.client.put<User>('/auth/profile', updates);
    return response.data;
  }

  /**
   * Changer le mot de passe
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.client.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  /**
   * 📧 Demander une réinitialisation de mot de passe (endpoint API réel)
   */
  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/auth/password-reset/request', { email });
    return response.data;
  }

  /**
   * ✅ Vérifier le token de réinitialisation de mot de passe
   */
  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const response = await this.client.post('/auth/password-reset/verify', { token });
    return response.data;
  }

  /**
   * 🔒 Compléter la réinitialisation de mot de passe (endpoint API réel)
   */
  async completePasswordReset(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/auth/password-reset/complete', {
      token,
      newPassword
    });
    return response.data;
  }

  /**
   * @deprecated Utiliser requestPasswordReset à la place
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.completePasswordReset(token, newPassword);
  }

  /**
   * Vérifier l'email avec un token
   */
  async verifyEmail(token: string): Promise<void> {
    await this.client.post('/auth/verify-email', { token });
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendEmailVerification(): Promise<void> {
    await this.client.post('/auth/resend-verification');
  }

  /**
   * 🍪 Vérifier l'état de l'authentification
   * Tente d'obtenir l'utilisateur actuel pour vérifier la validité des cookies
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user?: User }> {
    try {
      const user = await this.getCurrentUser();
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }

  /**
   * Valider les données de connexion côté client
   */
  validateLoginData(email: string, password: string): string[] {
    const errors: string[] = [];

    if (!email.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(email)) {
      errors.push('Invalid email format');
    }

    if (!password.trim()) {
      errors.push('Password is required');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters');
    }

    return errors;
  }

  /**
   * Valider les données d'inscription côté client
   */
  validateRegistrationData(data: RegisterRequest): string[] {
    const errors: string[] = [];

    // Validation email
    if (!data.email.trim()) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Validation mot de passe
    if (!data.password.trim()) {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.push('Password must contain at least one lowercase letter, one uppercase letter, and one number');
    }

    // Validation nom/prénom
    if (!data.firstName.trim()) {
      errors.push('First name is required');
    } else if (data.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!data.lastName.trim()) {
      errors.push('Last name is required');
    } else if (data.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    // Validation username
    if (!data.username.trim()) {
      errors.push('Username is required');
    } else if (data.username.length < 3) {
      errors.push('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_-]+$/.test(data.username)) {
      errors.push('Username can only contain letters, numbers, hyphens, and underscores');
    }

    // Validation téléphone (optionnel)
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid phone number format');
    }

    return errors;
  }

  /**
   * Validation d'email simple
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validation de numéro de téléphone
   */
  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  /**
   * Formater le nom d'utilisateur pour l'affichage
   */
  static formatUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`.trim() || user.username || user.email;
  }

  /**
   * Obtenir les initiales de l'utilisateur
   */
  static getUserInitials(user: User): string {
    const firstName = user.firstName?.charAt(0)?.toUpperCase() || '';
    const lastName = user.lastName?.charAt(0)?.toUpperCase() || '';

    if (firstName && lastName) {
      return firstName + lastName;
    }

    if (firstName) {
      return firstName;
    }

    return user.username?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?';
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  static hasRole(user: User, role: string): boolean {
    return user.role === role;
  }

  /**
   * Vérifier si l'utilisateur est un admin
   */
  static isAdmin(user: User): boolean {
    return user.role === 'PLATFORM_ADMIN';
  }

  /**
   * Vérifier si l'utilisateur est propriétaire d'entreprise
   */
  static isBusinessOwner(user: User): boolean {
    return user.role === 'BUSINESS_OWNER';
  }

  /**
   * Vérifier si l'utilisateur est un membre du personnel
   */
  static isStaffMember(user: User): boolean {
    return user.role === 'STAFF_MEMBER';
  }

  /**
   * Vérifier si l'utilisateur est un client
   */
  static isClient(user: User): boolean {
    return user.role === 'CLIENT';
  }
}

export default AuthService;
