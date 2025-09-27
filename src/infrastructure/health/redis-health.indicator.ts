import { Injectable, Inject } from "@nestjs/common";
import { HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Redis } from "ioredis";

const REDIS_CLIENT_TOKEN = "REDIS_CLIENT";

/**
 * 🔴 Redis Health Indicator
 *
 * Indicateur de santé personnalisé pour Redis avec vérifications avancées
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(REDIS_CLIENT_TOKEN) private readonly redis: Redis) {
    super();
  }

  /**
   * Vérification basique de Redis (ping)
   */
  async pingCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.ping();
      const isHealthy = result === "PONG";

      return this.getStatus(key, isHealthy, {
        status: isHealthy ? "up" : "down",
        response: result,
      });
    } catch (error) {
      return this.getStatus(key, false, {
        status: "down",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Vérification avancée de Redis (lecture/écriture)
   */
  async readWriteCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      const testKey = `health:check:${Date.now()}`;
      const testValue = "health-check-value";

      // Test d'écriture
      await this.redis.setex(testKey, 10, testValue);

      // Test de lecture
      const result = await this.redis.get(testKey);

      // Nettoyage
      await this.redis.del(testKey);

      const isHealthy = result === testValue;

      return this.getStatus(key, isHealthy, {
        status: isHealthy ? "up" : "down",
        operation: "read-write",
        testPassed: isHealthy,
      });
    } catch (error) {
      return this.getStatus(key, false, {
        status: "down",
        operation: "read-write",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Vérification avec métriques Redis
   */
  async detailedCheck(key: string): Promise<HealthIndicatorResult> {
    try {
      const info = await this.redis.info("memory");
      const memoryLines = info.split("\n");
      const usedMemory = memoryLines
        .find((line) => line.startsWith("used_memory_human:"))
        ?.split(":")[1]
        ?.trim();

      const clientsInfo = await this.redis.info("clients");
      const clientLines = clientsInfo.split("\n");
      const connectedClients = clientLines
        .find((line) => line.startsWith("connected_clients:"))
        ?.split(":")[1]
        ?.trim();

      return this.getStatus(key, true, {
        status: "up",
        memory_used: usedMemory || "unknown",
        connected_clients: connectedClients || "unknown",
        details: "full-metrics",
      });
    } catch (error) {
      return this.getStatus(key, false, {
        status: "down",
        details: "metrics-failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
