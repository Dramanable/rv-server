/**
 * 🔄 Refresh Token Entity MongoDB - Mongoose + Clean Architecture
 * ✅ Node.js 24 compatible
 * ✅ NoSQL optimized with TTL
 */

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type RefreshTokenDocument = RefreshTokenMongoEntity & Document;

@Schema({
  collection: "refresh_tokens",
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  versionKey: false,
})
export class RefreshTokenMongoEntity {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: "UserMongoEntity",
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    index: true,
  })
  token!: string;

  @Prop({
    required: true,
    index: true,
    // 🚀 NoSQL advantage - TTL index for automatic cleanup
    expires: 0, // TTL sera géré par MongoDB automatiquement
  })
  expiresAt!: Date;

  @Prop({
    default: false,
    index: true,
  })
  isRevoked!: boolean;

  // 🚀 NoSQL advantages - Metadata embedded
  @Prop({
    type: {
      userAgent: String,
      ipAddress: String,
      deviceType: String,
      location: {
        country: String,
        city: String,
        coordinates: [Number], // [longitude, latitude]
      },
    },
    default: {},
  })
  sessionMetadata?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: [number, number];
    };
  };

  // Timestamps automatiques
  created_at!: Date;
  updated_at!: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(
  RefreshTokenMongoEntity,
);

// 📊 Indexes composés pour optimiser les requêtes NoSQL
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 });
RefreshTokenSchema.index({ token: 1, expiresAt: 1 });
RefreshTokenSchema.index({ created_at: -1 });

// 🚀 TTL Index pour cleanup automatique des tokens expirés
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// 🌍 Geospatial index pour la localisation (si utilisé)
RefreshTokenSchema.index({
  "sessionMetadata.location.coordinates": "2dsphere",
});

// 🔍 Query helpers avec typage simplifié pour éviter les erreurs TypeScript
RefreshTokenSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId });
};

RefreshTokenSchema.statics.findActive = function () {
  return this.find({
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  });
};

RefreshTokenSchema.statics.findExpired = function () {
  return this.find({
    $or: [{ isRevoked: true }, { expiresAt: { $lte: new Date() } }],
  });
};

// Suppression du pre-hook pour éviter les problèmes de typage
// Validation sera gérée côté service application

export { RefreshTokenSchema as RefreshTokenMongoSchema };
