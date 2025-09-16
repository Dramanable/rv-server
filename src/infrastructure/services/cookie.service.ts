/**
 * 🍪 COOKIE SERVICE - Service pour la gestion des cookies
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import {
  ICookieService,
  CookieOptions,
} from '../../application/ports/cookie.port';

@Injectable()
export class CookieService implements ICookieService {
  constructor(private readonly configService: ConfigService) {}

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
  }

  getCookie(request: Request, name: string): string | undefined {
    return request.cookies?.[name];
  }

  clearCookie(response: Response, name: string, options?: CookieOptions): void {
    const defaultOptions: CookieOptions = {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    };

    const finalOptions = { ...defaultOptions, ...options };

    response.clearCookie(name, finalOptions);
  }
}
