#!/usr/bin/env ts-node

/**
 * 📖 Swagger JSON Generator Script (Lightweight Version)
 *
 * Génère la documentation Swagger/OpenAPI en format JSON
 * en utilisant seulement la configuration Swagger sans démarrer l'app complète.
 *
 * Usage: npm run swagger:generate
 * Output: docs/swagger.json
 */

import { Logger } from '@nestjs/common';
import { DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

function generateSwaggerJson(): void {
  const logger = new Logger('SwaggerGenerator');

  try {
    logger.log('📖 Configuring Swagger documentation...');

    // Configuration Swagger identique à celle utilisée dans l'application
    const config = new DocumentBuilder()
      .setTitle('User Management API')
      .setDescription(
        'Clean Architecture User Management System with comprehensive features\n\n' +
          'This API provides comprehensive user management capabilities built with Clean Architecture principles:\n' +
          '- 🔐 Authentication & Authorization (JWT + Refresh Tokens via HttpOnly Cookies)\n' +
          '- 👥 User Management (CRUD, Roles, Permissions)\n' +
          '- 🔑 Password Management (Reset, Change, Security)\n' +
          '- 🏛️ Clean Architecture (Domain, Application, Infrastructure, Presentation)\n' +
          '- 🧪 Full Test Coverage (TDD)\n' +
          '- 🌍 Internationalization (i18n)\n' +
          '- 📊 Audit Trail & Logging\n' +
          '- 🔒 Enterprise Security Features\n\n' +
          '🍪 **Authentication Method:**\n' +
          'This API uses HttpOnly cookies for authentication instead of Authorization headers. ' +
          'When you login successfully, authentication tokens are automatically set as secure cookies. ' +
          'No manual token management is required from the client side.',
      )
      .setVersion('1.0.0')
      .addTag('auth', 'Authentication and authorization endpoints')
      .addTag('users', 'User management operations')
      .addTag('password-reset', 'Password reset and security operations')
      .addTag('health', 'Application health check endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token (format: Bearer <token>)',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-API-Key',
          in: 'header',
          description: 'API Key for service-to-service authentication',
        },
        'api-key',
      )
      .addServer('http://localhost:3000', 'Development server')
      .addServer('https://api.example.com', 'Production server')
      .addServer('https://staging-api.example.com', 'Staging server')
      .setContact(
        'API Support Team',
        'https://example.com/support',
        'support@example.com',
      )
      .setLicense('MIT', 'https://opensource.org/licenses/MIT')
      .setExternalDoc('Full API Documentation', 'https://docs.example.com/api')
      .build();

    logger.log('🔨 Building Swagger document structure...');

    // Document de base avec la configuration
    const baseDocument = {
      ...config,
      paths: {
        '/api/v1/auth/login': {
          post: {
            tags: ['auth'],
            summary: 'User login with credentials',
            description:
              'Authenticate user with email and password. Returns user information and sets secure HttpOnly cookies for authentication.\n\n' +
              '🔒 **Security Features:**\n' +
              '- JWT Access Token (HttpOnly cookie, 15min expiration)\n' +
              '- Refresh Token (HttpOnly cookie, 7 days expiration)\n' +
              '- CSRF Protection\n' +
              '- Secure flag in production\n' +
              '- SameSite cookie policy\n\n' +
              '⚠️ **Important:** This endpoint does NOT return tokens in the response body. Authentication is handled via secure cookies.',
            operationId: 'login',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      email: {
                        type: 'string',
                        format: 'email',
                        example: 'admin@example.com',
                        description: 'User email address',
                      },
                      password: {
                        type: 'string',
                        minLength: 8,
                        example: 'SecurePassword123!',
                        description: 'User password (minimum 8 characters)',
                      },
                    },
                    required: ['email', 'password'],
                  },
                },
              },
            },
            responses: {
              '200': {
                description:
                  'Login successful - Authentication cookies set automatically',
                headers: {
                  'Set-Cookie': {
                    description:
                      'HttpOnly cookies for authentication (accessToken and refreshToken)',
                    schema: {
                      type: 'string',
                      example:
                        'accessToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict; Max-Age=900',
                    },
                  },
                },
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Login successful',
                        },
                        user: {
                          $ref: '#/components/schemas/UserResponse',
                        },
                      },
                      description:
                        'Login response - tokens are set as HttpOnly cookies, not returned in body',
                    },
                  },
                },
              },
              '401': {
                description: 'Authentication failed - Invalid credentials',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        statusCode: { type: 'number', example: 401 },
                        message: {
                          type: 'string',
                          example: 'Invalid credentials',
                        },
                        error: { type: 'string', example: 'Unauthorized' },
                      },
                    },
                  },
                },
              },
              '429': {
                description: 'Too many login attempts - Rate limit exceeded',
              },
            },
          },
        },
        '/api/v1/auth/refresh': {
          post: {
            tags: ['auth'],
            summary: 'Refresh access token',
            description:
              'Refresh the access token using the refresh token stored in HttpOnly cookies.\n\n' +
              '🔒 **Security Features:**\n' +
              '- Automatic refresh token rotation\n' +
              '- HttpOnly cookie validation\n' +
              '- New tokens set as secure cookies\n\n' +
              '⚠️ **Important:** Requires valid refresh token cookie. New tokens are set as HttpOnly cookies.',
            operationId: 'refreshToken',
            responses: {
              '200': {
                description:
                  'Token refreshed successfully - New authentication cookies set',
                headers: {
                  'Set-Cookie': {
                    description: 'New HttpOnly cookies with refreshed tokens',
                    schema: {
                      type: 'string',
                      example:
                        'accessToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=Strict',
                    },
                  },
                },
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Token refreshed successfully',
                        },
                      },
                      description:
                        'Refresh response - new tokens are set as HttpOnly cookies',
                    },
                  },
                },
              },
              '401': {
                description: 'Invalid or expired refresh token',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        statusCode: { type: 'number', example: 401 },
                        message: {
                          type: 'string',
                          example: 'Invalid refresh token',
                        },
                        error: { type: 'string', example: 'Unauthorized' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/v1/auth/logout': {
          post: {
            tags: ['auth'],
            summary: 'User logout',
            description:
              'Logout user and invalidate authentication tokens.\n\n' +
              '🔒 **Security Features:**\n' +
              '- Invalidates refresh token in database\n' +
              '- Clears HttpOnly authentication cookies\n' +
              '- Optional logout from all devices\n\n' +
              '⚠️ **Important:** Clears authentication cookies and invalidates refresh tokens.',
            operationId: 'logout',
            parameters: [
              {
                name: 'logoutAll',
                in: 'query',
                required: false,
                description:
                  'Logout from all devices (invalidate all refresh tokens)',
                schema: {
                  type: 'boolean',
                  default: false,
                },
              },
            ],
            responses: {
              '200': {
                description:
                  'Logout successful - Authentication cookies cleared',
                headers: {
                  'Set-Cookie': {
                    description: 'Cleared authentication cookies',
                    schema: {
                      type: 'string',
                      example:
                        'accessToken=; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
                    },
                  },
                },
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Logout successful',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/v1/auth/me': {
          get: {
            tags: ['auth'],
            summary: 'Get current user profile',
            description:
              'Retrieve the current authenticated user profile information.\n\n' +
              '🚀 **Performance Features:**\n' +
              '- Redis cache for fast user retrieval\n' +
              '- Automatic cache invalidation on user updates\n' +
              '- Cache TTL: 15 minutes\n' +
              '- Fallback to database if cache miss\n\n' +
              '🔒 **Authentication:** Requires valid authentication cookies.',
            operationId: 'getCurrentUser',
            security: [{ 'Cookie-auth': [] }, { 'JWT-auth': [] }],
            responses: {
              '200': {
                description:
                  'User profile retrieved successfully (cached or from database)',
                headers: {
                  'X-Cache-Status': {
                    description: 'Cache hit status for debugging',
                    schema: {
                      type: 'string',
                      enum: ['HIT', 'MISS'],
                      example: 'HIT',
                    },
                  },
                },
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/UserResponse' },
                        cacheInfo: {
                          type: 'object',
                          properties: {
                            cached: { type: 'boolean', example: true },
                            ttl: { type: 'number', example: 847 },
                            retrievedAt: {
                              type: 'string',
                              format: 'date-time',
                            },
                          },
                          description:
                            'Cache metadata (only in development mode)',
                        },
                      },
                    },
                  },
                },
              },
              '401': {
                description:
                  'Authentication required - Invalid or missing authentication cookies',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        statusCode: { type: 'number', example: 401 },
                        message: {
                          type: 'string',
                          example: 'Authentication required',
                        },
                        error: { type: 'string', example: 'Unauthorized' },
                      },
                    },
                  },
                },
              },
              '404': {
                description: 'User not found - User may have been deleted',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        statusCode: { type: 'number', example: 404 },
                        message: {
                          type: 'string',
                          example: 'User not found',
                        },
                        error: { type: 'string', example: 'Not Found' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '/api/v1/users': {
          get: {
            tags: ['users'],
            summary: 'Search users',
            description: 'Search and filter users with pagination',
            operationId: 'searchUsers',
            security: [{ 'Cookie-auth': [] }, { 'JWT-auth': [] }],
            parameters: [
              {
                name: 'page',
                in: 'query',
                schema: { type: 'integer', minimum: 1, default: 1 },
              },
              {
                name: 'limit',
                in: 'query',
                schema: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                },
              },
              {
                name: 'role',
                in: 'query',
                schema: {
                  type: 'string',
                  enum: ['USER', 'MANAGER', 'SUPER_ADMIN'],
                },
              },
            ],
            responses: {
              '200': {
                description: 'Users retrieved successfully',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        users: {
                          type: 'array',
                          items: { $ref: '#/components/schemas/UserResponse' },
                        },
                        total: { type: 'integer' },
                        page: { type: 'integer' },
                        limit: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            tags: ['users'],
            summary: 'Create new user',
            description: 'Create a new user account',
            operationId: 'createUser',
            security: [{ 'Cookie-auth': [] }, { 'JWT-auth': [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CreateUserRequest' },
                },
              },
            },
            responses: {
              '201': {
                description: 'User created successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserResponse' },
                  },
                },
              },
            },
          },
        },
        '/api/v1/users/{id}': {
          get: {
            tags: ['users'],
            summary: 'Get user by ID',
            description: 'Retrieve user information by ID',
            operationId: 'getUserById',
            security: [{ 'Cookie-auth': [] }, { 'JWT-auth': [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            responses: {
              '200': {
                description: 'User retrieved successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserResponse' },
                  },
                },
              },
              '404': {
                description: 'User not found',
              },
            },
          },
          put: {
            tags: ['users'],
            summary: 'Update user',
            description: 'Update user information',
            operationId: 'updateUser',
            security: [{ 'Cookie-auth': [] }, { 'JWT-auth': [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/UpdateUserRequest' },
                },
              },
            },
            responses: {
              '200': {
                description: 'User updated successfully',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/UserResponse' },
                  },
                },
              },
            },
          },
          delete: {
            tags: ['users'],
            summary: 'Delete user',
            description: 'Delete user account',
            operationId: 'deleteUser',
            security: [{ 'Cookie-auth': [] }, { 'JWT-auth': [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
              },
            ],
            responses: {
              '204': {
                description: 'User deleted successfully',
              },
            },
          },
        },
        '/health': {
          get: {
            tags: ['health'],
            summary: 'Health check',
            description: 'Check application health status',
            operationId: 'healthCheck',
            responses: {
              '200': {
                description: 'Application is healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        info: { type: 'object' },
                        error: { type: 'object' },
                        details: { type: 'object' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          UserResponse: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              role: {
                type: 'string',
                enum: ['USER', 'MANAGER', 'SUPER_ADMIN'],
              },
              isActive: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          CreateUserRequest: {
            type: 'object',
            properties: {
              email: { type: 'string', format: 'email' },
              name: { type: 'string', minLength: 2 },
              role: {
                type: 'string',
                enum: ['USER', 'MANAGER', 'SUPER_ADMIN'],
                default: 'USER',
              },
            },
            required: ['email', 'name'],
          },
          UpdateUserRequest: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2 },
              email: { type: 'string', format: 'email' },
              role: {
                type: 'string',
                enum: ['USER', 'MANAGER', 'SUPER_ADMIN'],
              },
              isActive: { type: 'boolean' },
            },
          },
        },
        securitySchemes: {
          'Cookie-auth': {
            type: 'apiKey',
            in: 'cookie',
            name: 'accessToken',
            description:
              'HttpOnly cookie containing JWT access token (automatically managed)',
          },
          'JWT-auth': {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description:
              'JWT Bearer token (legacy support - cookies are preferred)',
          },
          'api-key': {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
            description: 'API Key for service-to-service authentication',
          },
        },
      },
    };

    // Ajouter des extensions personnalisées
    const finalDocument = {
      ...baseDocument,
      'x-api-version': '1.0.0',
      'x-build-time': new Date().toISOString(),
      'x-architecture': 'Clean Architecture + NestJS',
      'x-features': [
        'JWT Authentication',
        'Role-Based Access Control',
        'Password Security',
        'Audit Trail',
        'Internationalization',
        'Type Safety',
        'TDD Coverage',
      ],
    };

    logger.log('📁 Creating output directory...');

    // Créer le dossier docs s'il n'existe pas
    const docsDir = join(process.cwd(), 'docs');
    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    // Écrire le fichier JSON
    const outputPath = join(docsDir, 'swagger.json');
    const jsonContent = JSON.stringify(finalDocument, null, 2);

    writeFileSync(outputPath, jsonContent, 'utf8');

    logger.log('📊 Generating statistics...');

    // Statistiques de génération
    const stats = {
      totalPaths: Object.keys(finalDocument.paths).length,
      totalOperations: Object.values(finalDocument.paths).reduce(
        (count, pathItem) =>
          count +
          Object.keys(pathItem as Record<string, unknown>).filter((key) =>
            ['get', 'post', 'put', 'delete', 'patch'].includes(key),
          ).length,
        0,
      ),
      totalSchemas: Object.keys(finalDocument.components?.schemas || {}).length,
      totalTags: (finalDocument.tags || []).length,
      generatedAt: new Date().toISOString(),
      fileSize: `${(jsonContent.length / 1024).toFixed(2)} KB`,
    };

    // Écrire également un fichier de statistiques
    const statsPath = join(docsDir, 'swagger-stats.json');
    writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');

    logger.log('✅ Swagger JSON generated successfully!');
    logger.log(`📄 Main file: ${outputPath}`);
    logger.log(`📊 Stats file: ${statsPath}`);
    logger.log(`🔢 Total endpoints: ${stats.totalOperations}`);
    logger.log(`📝 Total schemas: ${stats.totalSchemas}`);
    logger.log(`💾 File size: ${stats.fileSize}`);
  } catch (error) {
    logger.error('❌ Failed to generate Swagger JSON:', error);
    process.exit(1);
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  try {
    generateSwaggerJson();
    console.log('🎉 Swagger documentation generated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error generating Swagger documentation:', error);
    process.exit(1);
  }
}

export { generateSwaggerJson };
