/**
 * 🛡️ JWT AUTH GUARD - Presentation Layer Security Guard
 *
 * Guard d'authentification JWT utilisant Passport.js
 * Couche présentation/sécurité - gestion des requêtes HTTP et cookies
 */

import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import {
  AuthenticatedUser,
  isAuthenticatedUser,
  isAuthenticationError,
} from "../types/guard.types";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // Log de la tentative d'authentification
    this.logger.debug("JWT authentication attempt", {
      method: request.method,
      path: request.path,
      ip: request.ip,
      hasAuthHeader: !!request.headers.authorization,
      hasCookie: !!(request.cookies as Record<string, unknown> | undefined)
        ?.accessToken,
    });

    // Extraire le token du header Authorization ou des cookies
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      this.logger.warn("No authentication token found", {
        method: request.method,
        path: request.path,
        ip: request.ip,
      });
      return false;
    }

    try {
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown authentication error";

      this.logger.error("JWT authentication failed", {
        method: request.method,
        path: request.path,
        ip: request.ip,
        error: errorMessage,
      });
      return false;
    }
  }

  handleRequest<TUser = AuthenticatedUser>(
    err: unknown,
    user: unknown,
    info: unknown,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();

    // Contexte de logging pour la requête
    const requestContext = {
      method: request.method,
      path: request.path,
      ip: request.ip,
      userAgent: request.get("User-Agent"),
    };

    // ❌ Gestion des erreurs d'authentification
    if (err) {
      const errorMessage = isAuthenticationError(err)
        ? err.message
        : "Authentication failed";

      this.logger.warn("JWT authentication error", {
        ...requestContext,
        error: errorMessage,
        errorName: isAuthenticationError(err) ? err.name : "Unknown",
      });

      throw new UnauthorizedException(errorMessage);
    }

    // ❌ Utilisateur non trouvé ou invalide
    if (!user || !isAuthenticatedUser(user)) {
      const infoMessage =
        typeof info === "object" && info !== null && "message" in info
          ? String((info as { message: unknown }).message)
          : "No user in JWT payload";

      this.logger.warn("JWT authentication failed - no user found", {
        ...requestContext,
        reason: infoMessage,
      });

      throw new UnauthorizedException("Invalid authentication token");
    }

    // ✅ Authentification réussie
    this.logger.debug("JWT authentication successful", {
      ...requestContext,
      userId: user.id,
      userEmail: typeof user.email === "string" ? user.email : user.email.value,
      userRole: user.role,
    });

    return user as TUser;
  }

  /**
   * 🔍 Extraire le token JWT de la requête (header Authorization ou cookies)
   */
  private extractTokenFromRequest(request: Request): string | null {
    // Vérifier le header Authorization
    const authHeader = request.headers.authorization;
    if (
      authHeader &&
      typeof authHeader === "string" &&
      authHeader.startsWith("Bearer ")
    ) {
      return authHeader.substring(7);
    }

    // Vérifier les cookies avec nom par défaut (même que dans .env)
    const cookies = request.cookies as Record<string, unknown> | undefined;
    const cookieName = process.env.ACCESS_TOKEN_COOKIE_NAME || "accessToken";
    if (cookies && typeof cookies[cookieName] === "string") {
      return cookies[cookieName];
    }

    return null;
  }
}
