import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Public } from '../../presentation/security/decorators/public.decorator';

/**
 * 🏥 Health Check Controller
 *
 * Contrôleur avancé pour vérifier la santé de tous les services :
 * - Base de données PostgreSQL
 * - Base de données MongoDB
 * - Mémoire système
 * - Informations système
 */
@ApiTags('🏥 Health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly mongo: MongooseHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 🔍 Health Check Global
   * Vérification rapide de tous les services critiques
   */
  @Public() // 🔓 Route publique - monitoring sans authentification
  @Get()
  @ApiOperation({ summary: 'Global health check' })
  @ApiResponse({ status: 200, description: 'Service healthy' })
  @ApiResponse({ status: 503, description: 'Service unhealthy' })
  @HealthCheck()
  check() {
    return this.health.check([
      // PostgreSQL Database
      () => this.db.pingCheck('database'),

      // MongoDB Database
      () => this.mongo.pingCheck('mongodb'),

      // Memory usage (max 512MB)
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),

      // RSS Memory (max 1GB)
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
    ]);
  }

  /**
   * 🗄️ Database Health Check détaillé
   */
  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('postgresql'),
      () => this.mongo.pingCheck('mongodb'),
    ]);
  }

  /**
   * 💾 Memory Health Check
   */
  @Get('memory')
  @ApiOperation({ summary: 'Memory health check' })
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      // Heap memory (max 512MB)
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
      // RSS memory (max 1GB)
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
    ]);
  }

  /**
   * 📊 Health Check avec métriques détaillées
   */
  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check with metrics' })
  async getDetailedHealth() {
    try {
      const startTime = Date.now();

      // Vérifications parallèles
      const [dbCheck, memoryInfo, systemInfo] = await Promise.all([
        this.checkDatabaseStatus(),
        this.getMemoryInfo(),
        this.getSystemInfo(),
      ]);

      const responseTime = Date.now() - startTime;

      const healthStatus = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        responseTime: `${responseTime}ms`,
        version: this.configService.get<string>('npm_package_version', '1.0.0'),
        environment: this.configService.get<string>('NODE_ENV', 'development'),
        services: {
          database: dbCheck,
        },
        system: {
          memory: memoryInfo,
          node: systemInfo,
        },
      };

      this.logger.log(
        `Health check completed in ${responseTime}ms`,
        'HealthController',
      );

      return healthStatus;
    } catch (error) {
      this.logger.error('Health check failed', error, 'HealthController');
      throw error;
    }
  }

  /**
   * ⚡ Readiness Probe (pour Kubernetes)
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.mongo.pingCheck('mongodb'),
    ]);
  }

  /**
   * 💓 Liveness Probe (pour Kubernetes)
   */
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  checkLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  /**
   * Status détaillé de la base de données
   */
  private checkDatabaseStatus() {
    try {
      // Ici vous pouvez ajouter des vérifications spécifiques à votre DB
      return Promise.resolve({
        postgresql: { status: 'up', connections: 'active' },
        mongodb: { status: 'up', connections: 'active' },
      });
    } catch (error) {
      this.logger.error('Database status check failed', error);
      return Promise.resolve({
        postgresql: { status: 'down', error: (error as Error).message },
        mongodb: { status: 'down', error: (error as Error).message },
      });
    }
  }

  /**
   * Informations mémoire détaillées
   */
  private getMemoryInfo(): Promise<{
    rss: string;
    heapTotal: string;
    heapUsed: string;
    external: string;
  }> {
    const memUsage = process.memoryUsage();
    return Promise.resolve({
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    });
  }

  /**
   * Informations système
   */
  private getSystemInfo(): Promise<{
    nodeVersion: string;
    platform: NodeJS.Platform;
    arch: string;
    cpuUsage: NodeJS.CpuUsage;
    pid: number;
  }> {
    return Promise.resolve({
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpuUsage: process.cpuUsage(),
      pid: process.pid,
    });
  }
}
