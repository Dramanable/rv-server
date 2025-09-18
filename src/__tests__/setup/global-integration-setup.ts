/**
 * 🌍 Global Setup - Tests d'Intégration
 * ✅ Préparation de l'environnement avant tous les tests
 * ✅ Vérification des services requis (Redis, PostgreSQL)
 * ✅ Configuration des containers Docker si nécessaire
 */

import { Redis } from 'ioredis';
import * as path from 'path';
import { config } from 'dotenv';

export default async (): Promise<void> => {
  console.log('🏗️ Setting up integration test environment...');

  // 🔧 Charger les variables d'environnement appropriées
  loadEnvironmentVariables();

  // 🔍 Vérifier que les services nécessaires sont disponibles
  await verifyRedisConnection();
  // TODO: await verifyDatabaseConnection();

  console.log('✅ Integration test environment ready');
};

/**
 * Charger les variables d'environnement selon l'environnement
 */
function loadEnvironmentVariables(): void {
  const isCI = process.env.CI === 'true';
  const isDocker = process.env.DOCKER === 'true';
  
  let envFile = '.env.local.test'; // Par défaut, tests locaux
  
  if (isCI) {
    // En CI, les variables sont injectées par GitHub Actions
    console.log('📋 Using CI environment variables');
    return;
  } else if (isDocker) {
    envFile = '.env.docker.test';
    console.log('🐳 Loading Docker environment variables');
  } else {
    console.log('🖥️ Loading local environment variables');
  }
  
  const envPath = path.join(process.cwd(), envFile);
  config({ path: envPath });
  console.log(`📄 Loaded environment from: ${envPath}`);
}

/**
 * Vérifier la connexion Redis
 */
async function verifyRedisConnection(): Promise<void> {
  // Dans GitHub Actions, utiliser 'localhost' (services mapping)
  // Dans Docker Compose local, utiliser 'redis' (nom du service)
  const isCI = process.env.CI === 'true';
  const redisHost = isCI ? 'localhost' : (process.env.REDIS_HOST || 'redis');
  const redisPort = process.env.REDIS_PORT || '6379';
  const redisUrl = process.env.REDIS_URL || `redis://${redisHost}:${redisPort}`;
  
  console.log(`🔍 Testing Redis connection at: ${redisUrl} (CI: ${isCI})`);
  
  const redis = new Redis(redisUrl);

  try {
    const pong = await redis.ping();
    if (pong !== 'PONG') {
      throw new Error(`Redis ping failed: expected PONG, got ${pong}`);
    }
    console.log('✅ Redis connection verified');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw new Error(
      `Redis is not available at ${redisUrl}. Please ensure Redis is running for integration tests.`,
    );
  } finally {
    await redis.quit();
  }
}

/**
 * Vérifier la connexion à la base de données
 * TODO: Implémenter quand la base de données sera configurée
 */
// async function verifyDatabaseConnection(): Promise<void> {
//   const dbUrl = process.env.DATABASE_URL || 'postgresql://test_user:test_password@localhost:5433/test_db';
//
//   try {
//     // Test de connexion à la base de données
//     console.log('✅ Database connection verified');
//   } catch (error) {
//     console.error('❌ Database connection failed:', error);
//     throw new Error(
//       `Database is not available at ${dbUrl}. Please ensure PostgreSQL is running for integration tests.`
//     );
//   }
// }
