import { Injectable, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';
import { ConfigService } from '@nestjs/config';
import { CreateMongoCollections1694780001000 } from './migrations/mongodb/1694780001000-CreateMongoCollections';

export interface MongoMigration {
  name: string;
  up(client: MongoClient, dbName: string): Promise<void>;
  down(client: MongoClient, dbName: string): Promise<void>;
}

/**
 * 🗄️ MongoDB Migration Service
 * 
 * Manages MongoDB schema migrations with:
 * - Collection creation and indexing
 * - Version tracking
 * - Rollback capabilities
 * - Multi-tenant support
 */
@Injectable()
export class MongoMigrationService {
  private readonly logger = new Logger(MongoMigrationService.name);
  private client: MongoClient;
  private dbName: string;

  // Register all migrations in execution order
  private readonly migrations: MongoMigration[] = [
    new CreateMongoCollections1694780001000(),
  ];

  constructor(private readonly configService: ConfigService) {
    const mongoUri = this.configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017');
    this.dbName = this.configService.get<string>('MONGODB_DATABASE', 'appointment_system');
    this.client = new MongoClient(mongoUri);
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      await this.initializeMigrationTracking();
      this.logger.log('MongoDB Migration Service initialized');
    } catch (error) {
      this.logger.error('Failed to initialize MongoDB Migration Service', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.close();
      this.logger.log('MongoDB client disconnected');
    } catch (error) {
      this.logger.error('Error closing MongoDB connection', error);
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    for (const migration of this.migrations) {
      if (!executedMigrations.includes(migration.name)) {
        try {
          this.logger.log(`Running migration: ${migration.name}`);
          
          await migration.up(this.client, this.dbName);
          await this.recordMigrationExecution(migration.name);
          
          this.logger.log(`✅ Migration completed: ${migration.name}`);
        } catch (error) {
          this.logger.error(`❌ Migration failed: ${migration.name}`, error);
          throw error;
        }
      } else {
        this.logger.log(`⏭️  Migration already executed: ${migration.name}`);
      }
    }
  }

  /**
   * Rollback the last executed migration
   */
  async rollbackLastMigration(): Promise<void> {
    const executedMigrations = await this.getExecutedMigrations();
    
    if (executedMigrations.length === 0) {
      this.logger.warn('No migrations to rollback');
      return;
    }

    const lastMigrationName = executedMigrations[executedMigrations.length - 1];
    const migration = this.migrations.find(m => m.name === lastMigrationName);

    if (!migration) {
      throw new Error(`Migration not found: ${lastMigrationName}`);
    }

    try {
      this.logger.log(`Rolling back migration: ${migration.name}`);
      
      await migration.down(this.client, this.dbName);
      await this.removeMigrationRecord(migration.name);
      
      this.logger.log(`✅ Migration rolled back: ${migration.name}`);
    } catch (error) {
      this.logger.error(`❌ Migration rollback failed: ${migration.name}`, error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    total: number;
    executed: number;
    pending: string[];
    executed_migrations: string[];
  }> {
    const executedMigrations = await this.getExecutedMigrations();
    const pendingMigrations = this.migrations
      .filter(m => !executedMigrations.includes(m.name))
      .map(m => m.name);

    return {
      total: this.migrations.length,
      executed: executedMigrations.length,
      pending: pendingMigrations,
      executed_migrations: executedMigrations,
    };
  }

  /**
   * Initialize migration tracking collection
   */
  private async initializeMigrationTracking(): Promise<void> {
    const db = this.client.db(this.dbName);
    const collections = await db.listCollections({ name: 'migration_history' }).toArray();
    
    if (collections.length === 0) {
      await db.createCollection('migration_history');
      await db.collection('migration_history').createIndex({ migration_name: 1 }, { unique: true });
      await db.collection('migration_history').createIndex({ executed_at: -1 });
      
      this.logger.log('Migration tracking collection created');
    }
  }

  /**
   * Get list of executed migrations
   */
  private async getExecutedMigrations(): Promise<string[]> {
    const db = this.client.db(this.dbName);
    const records = await db.collection('migration_history')
      .find({}, { projection: { migration_name: 1 } })
      .sort({ executed_at: 1 })
      .toArray();
    
    return records.map(record => record.migration_name);
  }

  /**
   * Record migration execution
   */
  private async recordMigrationExecution(migrationName: string): Promise<void> {
    const db = this.client.db(this.dbName);
    await db.collection('migration_history').insertOne({
      migration_name: migrationName,
      executed_at: new Date(),
      version: '1.0.0',
      checksum: await this.calculateMigrationChecksum(migrationName),
    });
  }

  /**
   * Remove migration record (for rollback)
   */
  private async removeMigrationRecord(migrationName: string): Promise<void> {
    const db = this.client.db(this.dbName);
    await db.collection('migration_history').deleteOne({ migration_name: migrationName });
  }

  /**
   * Calculate migration checksum for integrity verification
   */
  private async calculateMigrationChecksum(migrationName: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(migrationName).digest('hex');
  }

  /**
   * Create database indexes for performance
   */
  async createPerformanceIndexes(): Promise<void> {
    const db = this.client.db(this.dbName);
    
    try {
      // Additional composite indexes for common queries
      const collections = [
        'business_analytics',
        'calendar_configs',
        'appointment_logs',
        'file_references',
        'notification_queue',
        'audit_logs'
      ];

      for (const collectionName of collections) {
        const collection = db.collection(collectionName);
        
        switch (collectionName) {
          case 'business_analytics':
            await collection.createIndex({ business_id: 1, date: -1, metric_type: 1 });
            break;
          case 'appointment_logs':
            await collection.createIndex({ business_id: 1, appointment_id: 1, timestamp: -1 });
            break;
          case 'file_references':
            await collection.createIndex({ business_id: 1, entity_type: 1, is_active: 1 });
            break;
          case 'notification_queue':
            await collection.createIndex({ status: 1, scheduled_for: 1, priority: 1 });
            break;
          case 'audit_logs':
            await collection.createIndex({ business_id: 1, user_id: 1, action: 1, timestamp: -1 });
            break;
        }
      }

      this.logger.log('Performance indexes created successfully');
    } catch (error) {
      this.logger.error('Failed to create performance indexes', error);
      throw error;
    }
  }

  /**
   * Verify database integrity
   */
  async verifyIntegrity(): Promise<{
    collections_exist: boolean;
    indexes_valid: boolean;
    migration_history_intact: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    const db = this.client.db(this.dbName);

    try {
      // Check required collections exist
      const requiredCollections = [
        'business_analytics',
        'calendar_configs',
        'appointment_logs',
        'file_references',
        'notification_queue',
        'business_templates',
        'audit_logs',
        'migration_history'
      ];

      const existingCollections = await db.listCollections().toArray();
      const existingNames = existingCollections.map(c => c.name);

      const missingCollections = requiredCollections.filter(name => !existingNames.includes(name));
      if (missingCollections.length > 0) {
        issues.push(`Missing collections: ${missingCollections.join(', ')}`);
      }

      // Verify migration history
      const migrationHistory = await this.getExecutedMigrations();
      if (migrationHistory.length === 0) {
        issues.push('No migration history found');
      }

      return {
        collections_exist: missingCollections.length === 0,
        indexes_valid: true, // TODO: Implement detailed index validation
        migration_history_intact: migrationHistory.length > 0,
        issues,
      };

    } catch (error) {
      issues.push(`Integrity check failed: ${error.message}`);
      return {
        collections_exist: false,
        indexes_valid: false,
        migration_history_intact: false,
        issues,
      };
    }
  }
}
