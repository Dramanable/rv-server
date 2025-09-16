/**
 * 🚀 MongoDB Initialization Service - Version Simplifiée
 *
 * Service pour initialiser automatiquement les index MongoDB
 */

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import type { Logger } from '../../../application/ports/logger.port';
import { TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class MongoInitializationService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @Inject(TOKENS.LOGGER) private readonly logger: Logger,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.logger.info('🚀 Initializing MongoDB optimizations...');

      await this.createUserIndexes();
      await this.createRefreshTokenIndexes();

      this.logger.info('✅ MongoDB initialization completed successfully');
    } catch (error) {
      this.logger.error('❌ MongoDB initialization failed', error as Error);
    }
  }

  /**
   * 🏗️ Création des index pour la collection users
   */
  private async createUserIndexes(): Promise<void> {
    try {
      const usersCollection = this.connection.collection('users');

      // Index unique pour email
      await usersCollection.createIndex(
        { email: 1 },
        { unique: true, background: true, name: 'email_unique_idx' },
      );

      // Index composé pour recherche + rôle + activité
      await usersCollection.createIndex(
        { role: 1, isActive: 1, createdAt: -1 },
        { background: true, name: 'role_active_created_idx' },
      );

      // Index textuel pour recherche full-text
      await usersCollection.createIndex(
        { name: 'text', email: 'text' },
        {
          background: true,
          name: 'search_text_idx',
          weights: { name: 10, email: 5 },
          default_language: 'french',
        },
      );

      // Index pour requêtes par rôle
      await usersCollection.createIndex(
        { role: 1 },
        { background: true, name: 'role_idx' },
      );

      // Index pour requêtes temporelles
      await usersCollection.createIndex(
        { createdAt: -1 },
        { background: true, name: 'created_date_idx' },
      );

      this.logger.info('✅ User collection indexes created');
    } catch (error) {
      this.logger.error('Failed to create user indexes', error as Error);
    }
  }

  /**
   * 🔧 Création des index pour les RefreshTokens
   */
  private async createRefreshTokenIndexes(): Promise<void> {
    try {
      const refreshTokensCollection =
        this.connection.collection('refreshtokens');

      // Index pour recherche par token haché
      await refreshTokensCollection.createIndex(
        { hashedToken: 1 },
        { background: true, name: 'hashed_token_idx' },
      );

      // Index pour recherche par utilisateur
      await refreshTokensCollection.createIndex(
        { userId: 1, isRevoked: 1, expiresAt: 1 },
        { background: true, name: 'user_token_status_idx' },
      );

      // Index TTL pour nettoyage automatique
      await refreshTokensCollection.createIndex(
        { expiresAt: 1 },
        {
          background: true,
          name: 'expiry_cleanup_idx',
          expireAfterSeconds: 0,
        },
      );

      this.logger.info('✅ RefreshToken collection indexes created');
    } catch (error) {
      this.logger.error(
        'Failed to create refresh token indexes',
        error as Error,
      );
    }
  }

  /**
   * 🧹 Nettoyage des tokens expirés
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await this.connection
        .collection('refreshtokens')
        .deleteMany({
          $or: [{ expiresAt: { $lt: new Date() } }, { isRevoked: true }],
        });

      this.logger.info('🗑️ Expired tokens cleaned up', {
        deletedCount: result.deletedCount,
      });

      return result.deletedCount || 0;
    } catch (error) {
      this.logger.error('Token cleanup failed', error as Error);
      return 0;
    }
  }

  /**
   * 📊 Statistiques simples de la base
   */
  async getSimpleStats(): Promise<{
    userCount: number;
    tokenCount: number;
    dbName: string;
    connectionState: string;
  }> {
    try {
      const [userCount, tokenCount] = await Promise.all([
        this.connection.collection('users').countDocuments(),
        this.connection.collection('refreshtokens').countDocuments(),
      ]);

      return {
        userCount,
        tokenCount,
        dbName: this.connection.name || 'unknown',
        connectionState: this.getConnectionState(),
      };
    } catch (error) {
      this.logger.error('Failed to get stats', error as Error);
      return {
        userCount: 0,
        tokenCount: 0,
        dbName: 'unknown',
        connectionState: 'error',
      };
    }
  }

  /**
   * 🔍 État de la connexion
   */
  private getConnectionState(): string {
    const state = Number(this.connection.readyState);
    switch (state) {
      case 0:
        return 'disconnected';
      case 1:
        return 'connected';
      case 2:
        return 'connecting';
      case 3:
        return 'disconnecting';
      default:
        return 'unknown';
    }
  }
}
