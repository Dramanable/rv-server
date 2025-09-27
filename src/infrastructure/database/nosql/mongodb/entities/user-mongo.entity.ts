/**
 * 👤 User Entity MongoDB - Mongoose + Clean Architecture
 * ✅ Node.js 24 compatible
 * ✅ NoSQL optimized structure
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = UserMongoEntity & Document;

@Schema({
  collection: 'users',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  versionKey: false,
})
export class UserMongoEntity {
  _id!: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email!: string;

  @Prop({
    unique: true,
    sparse: true,
    trim: true,
    index: true,
  })
  username?: string;

  @Prop({
    required: true,
    select: false, // Ne pas inclure par défaut dans les requêtes
  })
  hashedPassword!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 50,
  })
  firstName!: string;

  @Prop({
    required: true,
    trim: true,
    maxlength: 50,
  })
  lastName!: string;

  @Prop({
    required: true,
    enum: [
      'PLATFORM_ADMIN',
      'BUSINESS_OWNER',
      'BUSINESS_ADMIN',
      'LOCATION_MANAGER',
      'DEPARTMENT_HEAD',
      'SENIOR_PRACTITIONER',
      'PRACTITIONER',
      'JUNIOR_PRACTITIONER',
      'RECEPTIONIST',
      'ASSISTANT',
      'SCHEDULER',
      'CORPORATE_CLIENT',
      'VIP_CLIENT',
      'REGULAR_CLIENT',
      'GUEST_CLIENT',
    ],
    index: true,
  })
  role!: string;

  @Prop({
    default: true,
    index: true,
  })
  isActive!: boolean;

  @Prop({
    default: false,
    index: true,
  })
  isVerified!: boolean;

  // Timestamps automatiques grâce à l'option timestamps du Schema
  created_at!: Date;
  updated_at!: Date;

  // 🚀 NoSQL advantages - Embedded documents et fields flexibles
  @Prop({
    type: {
      lastLogin: Date,
      loginCount: { type: Number, default: 0 },
      failedLoginAttempts: { type: Number, default: 0 },
      lastFailedLogin: Date,
      ipHistory: [String],
    },
    default: {},
  })
  authMetadata?: {
    lastLogin?: Date;
    loginCount: number;
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    ipHistory: string[];
  };

  @Prop({
    type: {
      theme: { type: String, default: 'light' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
    },
    default: {},
  })
  preferences?: {
    theme: string;
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
}

export const UserSchema = SchemaFactory.createForClass(UserMongoEntity);

// 📊 Indexes composés pour optimiser les requêtes NoSQL
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ created_at: -1 });
UserSchema.index({ 'authMetadata.lastLogin': -1 });

// 🔍 Index de recherche textuelle
UserSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
});

// ⚡ Virtual pour le nom complet
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// 🔒 Pré-hook pour hasher le mot de passe (si nécessaire)
UserSchema.pre('save', function (next) {
  // Logique de pre-save si nécessaire
  next();
});

// 🧹 Post-hook pour cleanup
UserSchema.post('deleteOne', function () {
  // Cleanup related data when user is removed
  // Ex: remove refresh tokens, sessions, etc.
});

export { UserSchema as UserMongoSchema };
