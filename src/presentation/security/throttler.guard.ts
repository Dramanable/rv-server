/**
 * 🛡️ Security Configuration - Presentation Layer
 * ✅ Rate limiting, throttling, et protection DDoS
 * ✅ Basé sur la documentation officielle NestJS Security
 */

import { ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerException, ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(context: ExecutionContext): Promise<void> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip || request.connection.remoteAddress;

    // Log des tentatives de brute force
    console.warn(`🚨 Rate limit exceeded from IP: ${ip}`);

    throw new ThrottlerException("Too many requests. Please try again later.");
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Tracker par IP + User-Agent pour plus de précision
    const ip = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";
    return Promise.resolve(
      `${ip}-${Buffer.from(userAgent).toString("base64").slice(0, 10)}`,
    );
  }
}
