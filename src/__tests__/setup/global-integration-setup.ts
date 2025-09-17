/**
 * 🌍 Global Setup - Tests d'Intégration
 * ✅ Préparation de l'environnement avant tous les tests
 * ✅ Vérification des services requis (Redis, PostgreSQL)
 * ✅ Configuration des containers Docker si nécessaire
 */

import { Redis } from 'ioredis';

export default async (): Promise<void> => {
  console.log('🏗️ Setting up integration test environment...');
  
  // 🔍 Vérifier que les services nécessaires sont disponibles
  await verifyRedisConnection();
  // TODO: await verifyDatabaseConnection();
  
  console.log('✅ Integration test environment ready');
};

/**
 * Vérifier la connexion Redis
 */
async function verifyRedisConnection(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380';
  const redis = new Redis(redisUrl);
  
  try {
    await redis.ping();
    console.log('✅ Redis connection verified');
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    throw new Error(
      `Redis is not available at ${redisUrl}. Please ensure Redis is running for integration tests.`
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
