/**
 * 🔗 SHARED TYPES - Request Types
 *
 * Types pour les requêtes HTTP étendues avec informations utilisateur
 */

import { Request } from "express";
import {
  UserNotAuthenticatedError,
  UserNotAuthenticatedNoFallbackError,
} from "../exceptions/shared.exceptions";

/**
 * Interface pour les informations utilisateur dans la requête
 */
export interface RequestUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Requête Express étendue avec informations utilisateur
 */
export interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

/**
 * Type guard pour vérifier si une requête a un utilisateur authentifié
 */
export function isAuthenticatedRequest(
  req: Request,
): req is AuthenticatedRequest {
  return req.user !== undefined && req.user !== null;
}

/**
 * Helper pour extraire l'ID utilisateur de manière sûre
 */
export function getUserIdFromRequest(req: Request): string {
  if (isAuthenticatedRequest(req)) {
    return req.user.id;
  }
  throw new UserNotAuthenticatedError();
}

/**
 * Helper pour extraire l'ID utilisateur avec fallback
 */
export function getUserIdFromRequestSafe(
  req: Request,
  fallback?: string,
): string {
  if (isAuthenticatedRequest(req)) {
    return req.user.id;
  }
  if (fallback) {
    return fallback;
  }
  throw new UserNotAuthenticatedNoFallbackError();
}
