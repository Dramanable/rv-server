/**
 * 🔧 TypeORM Configuration - Migrations & CLI
 * ✅ Node.js 24 compatible configuration
 * ✅ Clean Architecture - Infrastructure Layer
 */

import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

// Load environment variables for CLI usage
config();

const configService = new ConfigService();

// Default export for TypeORM CLI
export default new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST', 'localhost'),
  port: configService.get('DATABASE_PORT', 5432),
  username: configService.get('DATABASE_USERNAME', 'postgres'),
  password: configService.get('DATABASE_PASSWORD', 'postgres'),
  database: configService.get('DATABASE_NAME', 'rvproject'),

  // 📁 Entities - Clean Architecture paths
  entities: [
    path.join(__dirname, 'sql/postgresql/entities/**/*.entity.{ts,js}'),
  ],

  // 🔄 Migrations configuration
  migrations: [path.join(__dirname, 'sql/postgresql/migrations/**/*.{ts,js}')],

  // 🌱 Seeds (optional)
  subscribers: [
    path.join(__dirname, 'sql/postgresql/subscribers/**/*.{ts,js}'),
  ],

  // ⚙️ Configuration options
  synchronize: false, // Always false in production - use migrations
  logging: configService.get('NODE_ENV') === 'development',
  ssl:
    configService.get('NODE_ENV') === 'production'
      ? {
          rejectUnauthorized: false,
        }
      : false,

  // 🔄 Migration options
  migrationsRun: false, // Don't auto-run migrations
  migrationsTableName: 'migrations_history',

  // 📊 Schema options
  schema: configService.get('DB_SCHEMA', 'public'),

  // 🕒 Connection options
  connectTimeoutMS: 60000,
  extra: {
    connectionLimit: 10,
  },
});
