# 🚀 Fastify Framework Integration

## 🎯 MIGRATION FROM EXPRESS TO FASTIFY

**⚠️ CRITICAL UPDATE**: This project has migrated from Express to **Fastify** for superior performance, better TypeScript integration, and modern HTTP/2 support.

### 🚀 **Why Fastify?**

1. **⚡ Performance**: ~65% faster than Express
2. **🔧 TypeScript First**: Native TypeScript support
3. **📦 Plugin Ecosystem**: Rich, well-maintained plugins
4. **🛡️ Security**: Built-in security features
5. **📊 JSON Schema**: Native validation with JSON Schema
6. **🔄 HTTP/2**: Full HTTP/2 support out of the box

## 🔧 Fastify-Specific Patterns

### 🎯 **Request/Response Objects**

```typescript
// ✅ FASTIFY - Correct request/response types
import { FastifyRequest, FastifyReply } from 'fastify';

@Controller('users')
export class UserController {
  @Post('login')
  async login(
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
    @Body() loginDto: LoginDto,
  ): Promise<LoginResponseDto> {
    // Fastify-specific request handling
    const userAgent = request.headers['user-agent'];
    const clientIp = request.ip;

    const result = await this.authService.login(loginDto);

    // Fastify-specific cookie setting
    reply.setCookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return result;
  }
}
```

### 🍪 **Cookie Management with Fastify**

```typescript
// ✅ FASTIFY - Cookie operations
import { FastifyReply } from 'fastify';

export class AuthController {
  async setCookies(
    @Res() reply: FastifyReply,
    tokens: TokenPair,
  ): Promise<void> {
    // Set access token cookie
    reply.setCookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Set refresh token cookie
    reply.setCookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh', // Restrict path for security
    });
  }

  async clearCookies(@Res() reply: FastifyReply): Promise<void> {
    reply.clearCookie('accessToken');
    reply.clearCookie('refreshToken', { path: '/auth/refresh' });
  }
}
```

### 🔐 **Request Authentication with Fastify**

```typescript
// ✅ FASTIFY - Authentication decorator
import { FastifyRequest } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

export const GetUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!data) return user;
    return user[data] as any;
  },
);
```

### 📊 **JSON Schema Validation**

```typescript
// ✅ FASTIFY - Native JSON Schema validation
@Post('create')
@ApiOperation({
  summary: 'Create new user with Fastify validation',
  description: 'Uses Fastify native JSON Schema validation for optimal performance'
})
async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
  // Fastify automatically validates based on DTO decorators
  return this.createUserUseCase.execute(createUserDto);
}
```

## ⚡ **Performance Optimizations**

### 🎯 **Fastify-Specific Optimizations**

```typescript
// ✅ FASTIFY - Performance configuration
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { fastify } from 'fastify';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      // ⚡ Performance optimizations
      logger: false, // Use custom logger
      ignoreTrailingSlash: true,
      bodyLimit: 10485760, // 10MB
      keepAliveTimeout: 72000,

      // 🛡️ Security enhancements
      trustProxy: true,
      maxParamLength: 500,
    }),
  );

  // Enable CORS with Fastify
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  await app.listen(3000, '0.0.0.0');
}
```

### 🔄 **Middleware with Fastify**

```typescript
// ✅ FASTIFY - Custom middleware
import { Injectable, NestMiddleware } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const { method, url } = req;
    const start = Date.now();

    res.addHook('onSend', (request, reply, payload, done) => {
      const duration = Date.now() - start;
      console.log(`${method} ${url} - ${reply.statusCode} - ${duration}ms`);
      done();
    });

    next();
  }
}
```

## 🔍 **Error Handling with Fastify**

```typescript
// ✅ FASTIFY - Error handling
import { FastifyReply } from 'fastify';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class FastifyExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: {
        code: this.getErrorCode(exception),
        message: this.getI18nMessage(exception),
        timestamp: new Date().toISOString(),
        path: request.url,
        correlationId: this.getCorrelationId(request),
      },
    };

    const statusCode = this.getHttpStatus(exception);

    // Fastify-specific response
    reply.status(statusCode).send(errorResponse);
  }
}
```

## 📋 **Fastify Migration Checklist**

### ✅ **MANDATORY UPDATES FOR FASTIFY**

- [ ] **Request/Response Types**: Use `FastifyRequest` and `FastifyReply`
- [ ] **Cookie Operations**: Use `reply.setCookie()` and `reply.clearCookie()`
- [ ] **Error Handling**: Update exception filters for Fastify
- [ ] **Middleware**: Adapt middleware for Fastify hooks
- [ ] **File Uploads**: Use `@fastify/multipart` instead of multer
- [ ] **Static Files**: Use `@fastify/static` for static file serving
- [ ] **CORS**: Configure CORS with Fastify's built-in support
- [ ] **Testing**: Update E2E tests for Fastify test utils

### 🚫 **FASTIFY MIGRATION PROHIBITIONS**

- ❌ **NEVER** use Express-specific imports (`express.Request`, `express.Response`)
- ❌ **NEVER** use Express middleware without Fastify adaptation
- ❌ **NEVER** use `res.cookie()` - use `reply.setCookie()`
- ❌ **NEVER** use `res.json()` - use `reply.send()`
- ❌ **NEVER** ignore Fastify's async nature in middleware

## 🧪 **Testing with Fastify**

```typescript
// ✅ FASTIFY - E2E testing
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

describe('UserController (e2e)', () => {
  let app: NestFastifyApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  it('/users (POST)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: validUserDto,
    });

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.payload)).toMatchObject({
      success: true,
      data: expect.objectContaining({
        id: expect.any(String),
      }),
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

## 🎯 **Fastify Best Practices**

### ✅ **PERFORMANCE OPTIMIZATIONS**

1. **JSON Serialization**: Use Fastify's fast-json-stringify
2. **Schema Validation**: Leverage native JSON Schema validation
3. **Keep-Alive**: Configure proper keep-alive timeouts
4. **Body Limits**: Set appropriate body size limits
5. **Request ID**: Use Fastify's built-in request ID generation

### ✅ **SECURITY ENHANCEMENTS**

1. **Helmet**: Use `@fastify/helmet` for security headers
2. **Rate Limiting**: Use `@fastify/rate-limit` for DoS protection
3. **CSRF**: Implement CSRF protection with `@fastify/csrf-protection`
4. **Input Validation**: Strict JSON Schema validation
5. **Cookie Security**: Proper cookie flags and SameSite policies

**This migration to Fastify provides significant performance improvements while maintaining clean architecture principles!**
