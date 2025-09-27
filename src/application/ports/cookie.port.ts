/**
 * 🍪 COOKIE PORT - Interface pour la gestion des cookies
 */

import { Request, Response } from 'express';

export interface CookieOptions {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  secure?: boolean;
  signed?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

export interface ICookieService {
  /**
   * Définit un cookie avec options
   */
  setCookie(
    response: Response,
    name: string,
    value: string,
    options?: CookieOptions,
  ): void;

  /**
   * Récupère un cookie depuis la requête
   */
  getCookie(request: Request, name: string): string | undefined;

  /**
   * Supprime un cookie
   */
  clearCookie(response: Response, name: string, options?: CookieOptions): void;
}
