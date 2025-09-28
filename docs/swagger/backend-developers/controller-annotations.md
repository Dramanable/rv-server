# 🏗️ Controller Annotations - Backend Developer Guide

## 🎯 MANDATORY SWAGGER ANNOTATIONS FOR CONTROLLERS

**For Backend Developers**: Complete guide for implementing Swagger documentation in NestJS controllers with Fastify.

### 📋 **Controller Structure Template**

```typescript
// ✅ MANDATORY - Complete controller with all annotations
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FastifyRequest, FastifyReply } from 'fastify';

@ApiTags('💼 Services Management') // ⚠️ MANDATORY with emoji
@Controller('api/v1/services') // ⚠️ NO double prefixing
@ApiBearerAuth() // ⚠️ MANDATORY for protected routes
export class ServiceController {
  @Post('list')
  @ApiOperation({
    summary: '🔍 Search Services with Advanced Filters',
    description: `
    **Advanced paginated search** for services with comprehensive filtering.

    ## 🎯 Features
    - **Text search**: Name, description, tags
    - **Business filters**: Status, category, pricing
    - **Multi-criteria sorting**: All fields with asc/desc
    - **Pagination**: Complete metadata with navigation info

    ## 💰 Pricing Configuration Example
    \`\`\`json
    {
      "pricingConfig": {
        "type": "VARIABLE",
        "basePrice": { "amount": 80.00, "currency": "EUR" },
        "variablePricing": {
          "factors": [
            {
              "name": "Duration",
              "options": [
                { "label": "30 min", "priceModifier": 0 },
                { "label": "60 min", "priceModifier": 40 }
              ]
            }
          ]
        }
      }
    }
    \`\`\`

    ## 🔐 Security & Permissions
    - **JWT Bearer**: Token required in Authorization header
    - **RBAC**: Results scoped by user role and business context
    - **Rate Limiting**: 100 requests/minute per user

    ## 🎯 Frontend Integration
    \`\`\`typescript
    const searchServices = async (filters: ServiceFilters) => {
      const response = await api.post('/api/v1/services/list', {
        ...filters,
        page: 1,
        limit: 20
      });
      return response.data;
    };
    \`\`\`
    `,
  })
  @ApiResponse({
    status: 200,
    description: '✅ Services found successfully',
    type: ListServicesResponseDto,
    schema: {
      example: {
        success: true,
        data: [
          {
            id: 'uuid-123',
            name: 'Professional Haircut',
            pricingConfig: {
              type: 'FIXED',
              basePrice: { amount: 50.0, currency: 'EUR' },
            },
            isActive: true,
            createdAt: '2024-01-15T10:30:00Z',
          },
        ],
        meta: {
          currentPage: 1,
          totalPages: 3,
          totalItems: 47,
          itemsPerPage: 20,
          hasNextPage: true,
          hasPrevPage: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '❌ Invalid search parameters',
    schema: {
      example: {
        success: false,
        error: {
          code: 'INVALID_SEARCH_PARAMS',
          message: 'Search parameters are invalid',
          field: 'limit',
          timestamp: '2024-01-15T10:30:00Z',
          path: '/api/v1/services/list',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: '🔐 Authentication required',
    schema: {
      example: {
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Valid JWT token required',
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: '🚫 Insufficient permissions',
    schema: {
      example: {
        success: false,
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'You do not have permission to access services',
        },
      },
    },
  })
  async list(
    @Body() dto: ListServicesDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<ListServicesResponseDto> {
    return this.listServicesUseCase.execute({
      ...dto,
      requestingUserId: user.id,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: '📄 Get Service by ID',
    description: 'Retrieve detailed information about a specific service',
  })
  @ApiResponse({
    status: 200,
    description: '✅ Service found',
    type: ServiceDto,
  })
  @ApiResponse({
    status: 404,
    description: '❌ Service not found',
  })
  async findById(@Param('id') id: string): Promise<ServiceDto> {
    return this.getServiceByIdUseCase.execute({ serviceId: id });
  }
}
```

### 🎯 **API Tags with Icons - MANDATORY**

```typescript
// ✅ MANDATORY - Tags with meaningful icons
@ApiTags('💼 Services Management')      // Business services
@ApiTags('👨‍💼 Staff Management')         // Personnel management
@ApiTags('📅 Appointments')            // Booking system
@ApiTags('🏢 Business Management')     // Company profiles
@ApiTags('👥 User Management')         // User accounts
@ApiTags('🔐 Authentication')          // Auth endpoints
@ApiTags('❤️ Health Checks')           // System monitoring
@ApiTags('📊 Analytics')               // Reports and metrics
```

### 📝 **Complete @ApiOperation Template**

```typescript
@ApiOperation({
  summary: '🎯 Brief Action Description with Icon',
  description: `
    **Detailed explanation** of what this endpoint does.

    ## 🎯 **Main Features**
    - Feature 1 with specific details
    - Feature 2 with business context
    - Feature 3 with technical implications

    ## 📊 **Input/Output Examples**
    Include realistic business examples, not generic placeholders.

    ## 🔐 **Security & Permissions**
    - Authentication requirements
    - Required permissions
    - Data scoping rules

    ## 🎯 **Frontend Integration Guide**
    \`\`\`typescript
    // Copy-paste ready integration code
    const result = await api.method('/endpoint', data);
    \`\`\`

    ## ⚠️ **Important Notes**
    - Business rules or constraints
    - Performance considerations
    - Error handling specifics
  `,
})
```

### 🚨 **Error Response Documentation - MANDATORY**

```typescript
// ✅ MANDATORY - Document ALL possible HTTP status codes
@ApiResponse({ status: 200, description: '✅ Success', type: ResponseDto })
@ApiResponse({ status: 400, description: '❌ Validation error' })
@ApiResponse({ status: 401, description: '🔐 Authentication required' })
@ApiResponse({ status: 403, description: '🚫 Insufficient permissions' })
@ApiResponse({ status: 404, description: '❓ Resource not found' })
@ApiResponse({ status: 409, description: '⚠️ Conflict (duplicate)' })
@ApiResponse({ status: 422, description: '🚫 Business rule violation' })
@ApiResponse({ status: 500, description: '💥 Internal server error' })
```

### 📋 **Backend Developer Checklist**

#### ✅ **Before Committing Controller Code**

- [ ] **@ApiTags**: Added with meaningful icon
- [ ] **@ApiOperation**: Complete summary and description
- [ ] **@ApiResponse**: ALL status codes documented (200, 400, 401, 403, 404, 409, 422, 500)
- [ ] **@ApiBearerAuth**: Added for protected endpoints
- [ ] **Examples**: Realistic business examples in responses
- [ ] **Frontend Guide**: Integration code provided
- [ ] **Error Schemas**: Complete error response examples
- [ ] **Business Context**: Domain-specific descriptions, not generic
- [ ] **Swagger UI Test**: Verified documentation renders correctly
- [ ] **"Try it out"**: Tested in Swagger UI interface

#### 🚫 **Forbidden Practices**

- ❌ **Generic descriptions**: "Get data", "Update item"
- ❌ **Missing error codes**: Only documenting 200 responses
- ❌ **Placeholder examples**: "string", "number" instead of real data
- ❌ **No integration guide**: Making frontend developers guess
- ❌ **Missing security info**: No authentication or permission details

### 🧪 **Testing Your Swagger Documentation**

```typescript
// ✅ Test that Swagger UI loads correctly
describe('Swagger Documentation', () => {
  it('should load Swagger UI', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs')
      .expect(200);

    expect(response.text).toContain('Swagger UI');
  });

  it('should provide OpenAPI JSON', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);

    expect(response.body).toHaveProperty('openapi');
    expect(response.body).toHaveProperty('paths');
  });
});
```

**Perfect Swagger documentation makes frontend integration seamless and QA testing comprehensive!**
