/**
 * 🍃 MongoDB Configuration Service - NestJS Mongoose
 *
 * Configuration pour MongoDB avec @nestjs/mongoose
 * Alternative NoSQL à TypeORM
 */

import { Injectable } from '@nestjs/common';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import type { IConfigService } from '../../../application/ports/config.port';

@Injectable()
export class MongoConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: IConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    const config = this.configService;
    const isProduction = config.getEnvironment() === 'production';

    // Construction de l'URI MongoDB
    const uri = this.buildMongoUri();

    return {
      uri,

      // 🔐 Authentification
      authSource: 'admin',

      // 🚀 Pool de connexions
      maxPoolSize: config.getDatabasePoolSize(),
      minPoolSize: 2,

      // ⏱️ Timeouts
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,

      // 🔄 Options de résilience
      retryWrites: true,
      retryReads: true,
      maxStalenessSeconds: 90,

      // 📊 Monitoring et debugging
      bufferCommands: false, // Désactive le buffering pour une meilleure gestion d'erreur

      // 🧪 Configuration par environnement
      ...(isProduction
        ? this.getProductionOptions()
        : this.getDevelopmentOptions()),
    };
  }

  private buildMongoUri(): string {
    const config = this.configService;
    const host = config.getDatabaseHost();
    const port = config.getDatabasePort();
    const username = config.getDatabaseUsername();
    const password = config.getDatabasePassword();
    const database = config.getDatabaseName();

    // Support pour cluster MongoDB (production)
    if (host.includes(',')) {
      return `mongodb://${username}:${password}@${host}/${database}`;
    }

    // Single instance (development/test)
    return `mongodb://${username}:${password}@${host}:${port}/${database}`;
  }

  private getProductionOptions(): MongooseModuleOptions {
    return {
      // 🔐 SSL en production
      ssl: true,

      // 🎯 Read/Write preferences pour cluster
      readPreference: 'primaryPreferred',
      writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 5000,
      },

      // 📊 Compression
      compressors: ['zstd', 'zlib'],

      // 🔍 Monitoring
      monitorCommands: true,
    };
  }

  private getDevelopmentOptions(): MongooseModuleOptions {
    return {
      // 🧪 Options de développement
      ssl: false,

      // 📝 Logging détaillé
      monitorCommands: true,

      // 🎯 Performance pour dev
      readPreference: 'primary',
      writeConcern: {
        w: 1,
        j: false,
      },
    };
  }

  /**
   * 🔧 Configuration pour les tests
   */
  static getTestOptions(): MongooseModuleOptions {
    return {
      uri: 'mongodb://localhost:27017/cleanarchi_test',
      bufferCommands: false,
    };
  }
}
