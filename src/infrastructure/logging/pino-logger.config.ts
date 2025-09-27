/**
 * 🏗️ INFRASTRUCTURE - Pino Logger Configuration
 *
 * Configuration du logger Pino pour NestJS avec support i18n
 * Logging structuré haute performance avec contexte d'application
 */

import { Request } from "express";
import { IncomingMessage, ServerResponse } from "http";
import { Params } from "nestjs-pino";

export const createPinoConfig = (configService: {
  get: (key: string, defaultValue?: any) => any;
}): Params => ({
  pinoHttp: {
    level: configService.get("LOG_LEVEL", "info"),

    // 🎨 Pretty printing en développement
    transport:
      configService.get("NODE_ENV", "development") !== "production"
        ? {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "yyyy-mm-dd HH:MM:ss.l",
              ignore: "pid,hostname,req,res",
              messageFormat: "🚀 {operation} | {correlationId} | {msg}",
              errorLikeObjectKeys: ["err", "error"],
              singleLine: false,
            },
          }
        : undefined,

    // 🏷️ Formatage personnalisé pour les logs
    formatters: {
      level: (label: string) => ({ level: label }),

      // 📋 Format des logs avec contexte Clean Architecture
      log: (object: Record<string, unknown>) => {
        const {
          operation,
          correlationId,
          operationId,
          userId,
          requestingUserId,
          clientIp,
          userAgent,
          email,
          ...rest
        } = object;

        const result: Record<string, unknown> = {
          ...rest,
          // 📅 Timestamp ISO
          timestamp: new Date().toISOString(),
        };

        // 🎯 Contexte d'opération
        if (operation) result.operation = operation;
        if (correlationId) result.correlationId = correlationId;
        if (operationId) result.operationId = operationId;

        // 👤 Contexte utilisateur
        if (userId) result.userId = userId;
        if (requestingUserId) result.requestingUserId = requestingUserId;
        if (email) result.email = email;

        // 🌐 Contexte client
        if (clientIp) result.clientIp = clientIp;
        if (userAgent) result.userAgent = userAgent;

        return result;
      },
    },

    // 🔍 Customisation des logs de requêtes HTTP
    customLogLevel: (
      _req: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
      err?: Error,
    ) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return "silent";
      }
      return "info";
    },

    // 📝 Enrichissement automatique des logs de requêtes
    customReceivedMessage: (req: IncomingMessage) => {
      const request = req as Request;
      return `🔗 ${request.method || "UNKNOWN"} ${request.url || "/"}`;
    },

    customSuccessMessage: (
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
    ) => {
      const request = req as Request;
      return `✅ ${request.method || "UNKNOWN"} ${request.url || "/"} - ${res.statusCode}`;
    },

    customErrorMessage: (
      req: IncomingMessage,
      res: ServerResponse<IncomingMessage>,
      err: Error,
    ) => {
      const request = req as Request;
      return `❌ ${request.method || "UNKNOWN"} ${request.url || "/"} - ${res.statusCode} - ${err.message}`;
    },

    // 🎯 Ajout du correlationId aux logs de requêtes
    customAttributeKeys: {
      req: "request",
      res: "response",
      err: "error",
      responseTime: "duration",
    },

    // 🔧 Configuration de base
    base: {
      pid: false, // Pas besoin du PID en dev
    },

    // 🚫 Exclusion de certaines routes (health checks, etc.)
    autoLogging: {
      ignore: (req: IncomingMessage) => {
        const request = req as Request;
        return (
          request.url === "/health" ||
          request.url === "/metrics" ||
          request.url?.startsWith("/swagger")
        );
      },
    },

    // 🌍 Support de la redirection des logs
    redact: {
      paths: [
        "request.headers.authorization",
        "request.headers.cookie",
        'response.headers["set-cookie"]',
        "password",
        "hashedPassword",
        "token",
        "accessToken",
        "refreshToken",
      ],
      censor: "[REDACTED]",
    },
  },
});

// Legacy export for backward compatibility
export const pinoConfig: Params = createPinoConfig({
  get: (key: string, defaultValue?: any) => process.env[key] || defaultValue,
});
