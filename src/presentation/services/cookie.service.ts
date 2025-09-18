/**
 * 🍪 COOKIE SERVICE - Service de gestion des cookies HTTP (Couche Presentation)
 *
 * ✅ Responsabilité : Gestion des cookies HTTP pour l'interface web
 * ✅ Couche : Presentation (détails d'implémentation HTTP)
 * ❌ Ne doit PAS être utilisé dans Domain/Application/Infrastructure
 */

import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import type { Logger } from '../../application/ports/logger.port';
import { TOKENS } from '../../shared/constants/injection-tokens';

/**
 * 🔧 Options pour la configuration des cookies
 */
export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  domain?: string;
}

/**
 * 🍪 Service de gestion des cookies pour la couche Presentation
 */
@Injectable()
export class PresentationCookieService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(TOKENS.LOGGER) private readonly logger: Logger,
  ) {}

  /**
   * 🔐 Définir un cookie avec des options sécurisées par défaut
   */
  setCookie(
    response: Response,
    name: string,
    value: string,
    options?: CookieOptions,
  ): void {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    };

    const finalOptions = { ...defaultOptions, ...options };

    response.cookie(name, value, finalOptions);

    this.logger.debug('Cookie set', {
      name,
      secure: finalOptions.secure,
      httpOnly: finalOptions.httpOnly,
      sameSite: finalOptions.sameSite,
    });
  }

  /**
   * 📖 Lire un cookie depuis la requête
   */
  getCookie(request: Request, name: string): string | undefined {
    const value = request.cookies?.[name];

    if (value) {
      this.logger.debug('Cookie retrieved', { name });
    }

    return value;
  }

  /**
   * 🧹 Supprimer un cookie
   */
  clearCookie(response: Response, name: string, options?: CookieOptions): void {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    };

    const finalOptions = { ...defaultOptions, ...options };

    response.clearCookie(name, finalOptions);

    this.logger.debug('Cookie cleared', { name });
  }

  /**
   * 🔐 Configure les cookies d'authentification
   * ✅ Méthode spécialisée pour gérer les tokens d'authentification
   */
  setAuthenticationCookies(
    response: Response,
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    },
    rememberMe: boolean,
  ): void {
    const isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';

    // 🔑 Access Token Cookie - Même durée que le JWT
    const accessTokenMaxAge = tokens.expiresIn * 1000; // seconds to milliseconds
    this.setCookie(response, 'accessToken', tokens.accessToken, {
      maxAge: accessTokenMaxAge,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
    });

    // 🔄 Refresh Token Cookie - Durée selon rememberMe
    const refreshTokenMaxAge = rememberMe
      ? 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      : undefined; // Session cookie si pas rememberMe

    this.setCookie(response, 'refreshToken', tokens.refreshToken, {
      maxAge: refreshTokenMaxAge,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/auth/refresh', // Restreint aux endpoints de refresh
    });

    this.logger.debug('Authentication cookies configured', {
      accessTokenMaxAge,
      refreshTokenMaxAge: refreshTokenMaxAge || 'session',
      isProduction,
      rememberMe,
    });
  }

  /**
   * 🧹 Supprime tous les cookies d'authentification (logout)
   */
  clearAuthenticationCookies(response: Response): void {
    this.clearCookie(response, 'accessToken', { path: '/' });
    this.clearCookie(response, 'refreshToken', { path: '/auth/refresh' });

    this.logger.debug('Authentication cookies cleared');
  }
}
