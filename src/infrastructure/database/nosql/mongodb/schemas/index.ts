/**
 * 🗄️ MongoDB Schema Configuration
 * ✅ Clean Architecture - Infrastructure Layer
 * ✅ Node.js 24 compatible
 * ✅ Database initialization schemas
 */

export const MONGODB_SCHEMAS = {
  // Authentication schemas
  USER_SCHEMA: "UserMongoEntity",
  REFRESH_TOKEN_SCHEMA: "RefreshTokenMongoEntity",

  // Future schemas (when needed)
  // BUSINESS_SCHEMA: 'BusinessMongoEntity',
  // CALENDAR_SCHEMA: 'CalendarMongoEntity',
} as const;

export const MONGODB_COLLECTIONS = {
  USERS: "users",
  REFRESH_TOKENS: "refresh_tokens",

  // Future collections
  // BUSINESSES: 'businesses',
  // CALENDARS: 'calendars',
} as const;

// 📊 Database indexes configuration
export const MONGODB_INDEXES = {
  users: [
    { key: { email: 1 }, options: { unique: true } },
    { key: { username: 1 }, options: { unique: true, sparse: true } },
    { key: { role: 1, isActive: 1 } },
    { key: { created_at: -1 } },
    { key: { firstName: "text", lastName: "text", email: "text" } },
  ],
  refresh_tokens: [
    { key: { userId: 1, isRevoked: 1 } },
    { key: { token: 1 }, options: { unique: true } },
    { key: { expiresAt: 1 }, options: { expireAfterSeconds: 0 } },
    { key: { created_at: -1 } },
  ],
} as const;
