/**
 * 🌍 CORS Factory - Clean Architecture
 * ✅ Configuration CORS avec ConfigService
 * ✅ Type-safe et environment-specific
 */

import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";
import { AppConfigService } from "../../infrastructure/config/app-config.service";

export class CorsFactory {
  static create(configService: AppConfigService): CorsOptions {
    const frontendUrl = configService.getFrontendUrl();
    const isProduction = configService.isProduction();

    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:4200",
      "http://localhost:5173", // Vite dev server
      ...(frontendUrl ? [frontendUrl] : []),
      ...(isProduction ? [] : ["http://localhost:8080"]), // Dev only
    ].filter(Boolean);

    return {
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void,
      ) => {
        // Permettre les requêtes sans origin (mobile apps, Postman, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          const error = new Error(
            `CORS: Origin ${origin} not allowed by CORS policy`,
          );
          callback(error);
        }
      },
      credentials: true, // Permettre les cookies
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-API-Key",
        "Cache-Control",
      ],
      exposedHeaders: ["X-Total-Count", "X-Page-Count"],
      maxAge: 86400, // 24 heures
      preflightContinue: false,
      optionsSuccessStatus: 204,
    };
  }
}
