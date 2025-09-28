# 📚 API Documentation & Swagger Standards

## 🎯 CRITICAL RULE: COMPLETE SWAGGER DOCUMENTATION

**After creating Controllers and DTOs, ALWAYS create complete Swagger documentation to ensure usable, consistent, and professional APIs.**

## 📋 Mandatory Documentation Workflow After Presentation

### 1️⃣ ROUTE PREFIXING RULE - AVOID DOUBLE /v1/v1/

```typescript
// ✅ CORRECT - main.ts with globalPrefix
app.setGlobalPrefix('api/v1');

// ✅ CORRECT - Controllers WITHOUT redundant prefix
@Controller('services')  // → /api/v1/services
@Controller('staff')     // → /api/v1/staff
@Controller('appointments') // → /api/v1/appointments

// ❌ FORBIDDEN - Double prefixing
@Controller('api/v1/services') // → /api/v1/api/v1/services (ERROR!)
```

### 2️⃣ MANDATORY SWAGGER TAGS BY RESOURCE

```typescript
// ✅ MANDATORY - Tags with icons for clarity
@ApiTags('💼 Services')           // Business services
@ApiTags('👨‍💼 Staff Management')    // Staff management
@ApiTags('📅 Appointments')       // Appointments
@ApiTags('🏢 Business Management') // Business management
@ApiTags('👥 User Management')    // User management
@ApiTags('❤️ Health Checks')      // System health
```

### 3️⃣ ENRICHED SWAGGER DOCUMENTATION - MANDATORY

```typescript
// ✅ MANDATORY TEMPLATE - Complete documentation with examples
@ApiOperation({
  summary: '🔍 Search {Resource}s with Advanced Filters',
  description: `
    **Advanced paginated search** for {resource}s with comprehensive filtering system.

    ## 🎯 Features

    ### 📊 **Available Filters**
    - **Text search**: Name, description, tags
    - **Business filters**: Status, category, price
    - **Multi-criteria sorting**: All fields with asc/desc
    - **Pagination**: Page/limit with complete metadata

    ### 💰 **Complex pricing example**
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

    ### 📋 **Business Rules**
    - ✅ **Permissions**: Scoped by user role
    - ✅ **Validation**: All parameters server-side validated
    - ✅ **Performance**: Mandatory pagination, Redis cache

    ### 🔐 **Security**
    - **JWT**: Bearer token required
    - **RBAC**: Granular permissions per resource
    - **Rate limiting**: 100 req/min per user

    ## 🎯 **Frontend Integration Guide**

    ### React/Vue.js Example
    \`\`\`typescript
    const searchServices = async (filters: ServiceFilters) => {
      const response = await api.post('/api/v1/services/list', {
        ...filters,
        page: 1,
        limit: 20
      });

      return {
        services: response.data.data,
        pagination: response.data.meta
      };
    };
    \`\`\`
  `,
})
```

#### **📋 MANDATORY CHECKLIST AFTER EACH PRESENTATION**

- [ ] **Routes**: No double prefixing /v1/v1/
- [ ] **Tags**: @ApiTags with icons on all controllers
- [ ] **Operations**: @ApiOperation with complete description and examples
- [ ] **Responses**: All HTTP codes documented with JSON examples
- [ ] **DTOs**: Complete validation and Swagger schemas
- [ ] **Config**: Central Swagger config with integration guide
- [ ] **Documentation**: Complete markdown file per functionality
- [ ] **Frontend**: TypeScript/React/Vue.js examples
- [ ] **Tests**: Swagger UI accessible and complete validation (host: `npm test`)
- [ ] **Push**: Code tested and documentation updated

## 🔧 ENRICHED CENTRAL SWAGGER CONFIGURATION

```typescript
// ✅ MANDATORY - Swagger configuration with complete integration guide
const config = new DocumentBuilder()
  .setTitle('🎯 Appointment System API')
  .setDescription(
    `
    ## 🚀 **Complete API for Appointment System**

    ### 📋 **Main Features**

    - **🏢 Business Management**: Sectors, profiles, configuration
    - **👨‍💼 Staff**: Staff, availability, skills
    - **💼 Services**: Flexible pricing, packages, prerequisites
    - **📅 Appointments**: Booking, notifications, history
    - **👥 Users**: Authentication, roles, permissions

    ### 🔐 **Authentication**

    All APIs require a **JWT Bearer Token**:

    \`\`\`bash
    curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
         -X POST http://localhost:3000/api/v1/services/list
    \`\`\`

    ### 📊 **Response Standards**

    #### ✅ **Success**
    \`\`\`json
    {
      "success": true,
      "data": { /* Business data */ },
      "meta": { /* Pagination metadata */ }
    }
    \`\`\`

    #### ❌ **Error**
    \`\`\`json
    {
      "success": false,
      "error": {
        "code": "BUSINESS_ERROR_CODE",
        "message": "Localized user message",
        "field": "fieldInError"
      }
    }
    \`\`\`

    ### 🎯 **Integration Guides**

    - **React/Vue.js**: TypeScript examples provided
    - **Pagination**: Uniform system with metadata
    - **Filtering**: POST /list for complex queries
    - **Pricing**: Flexible system for all use cases

    ### 📞 **Support**

    - **Documentation**: Complete examples in each endpoint
    - **TypeScript Types**: Auto-generated interfaces
    - **Postman Collection**: Direct import from Swagger JSON
  `,
  )
  .setVersion('2.0')
  .addBearerAuth()
  .addTag('💼 Services', 'Service management and flexible pricing')
  .addTag('👨‍💼 Staff Management', 'Staff and availability')
  .addTag('📅 Appointments', 'Complete appointment system')
  .addTag('🏢 Business Management', 'Businesses and activity sectors')
  .addTag('👥 User Management', 'Users and authentication')
  .addTag('❤️ Health Checks', 'Monitoring and system health');
```

## 🚨 SWAGGER CONFIGURATION FIXES

### ✅ Correct Configuration for Complex Objects

```typescript
// ✅ MANDATORY - Schema objects with additionalProperties
@ApiPropertyOptional({
  description: 'Configuration object',
  type: 'object',
  additionalProperties: true, // ⚠️ REQUIRED to avoid TypeScript errors
})
readonly configObject?: any;

// ✅ MANDATORY - Response DTOs with definite assignment
export class ResponseDto {
  @ApiProperty()
  readonly success!: boolean; // ⚠️ ! REQUIRED to avoid TypeScript errors

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  readonly data!: any[]; // ⚠️ ! REQUIRED
}

// ✅ MANDATORY - Complete enum documentation
@ApiPropertyOptional({
  description: 'Status filter',
  enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED'],
  example: 'ACTIVE'
})
@IsOptional()
@IsString()
readonly status?: string;
```

## 📁 MANDATORY DOCUMENTATION STRUCTURE

```
docs/
├── SWAGGER_{FEATURE}_API.md     # Complete documentation per feature
├── SWAGGER_ENHANCEMENT_REPORT.md # Swagger improvement report
└── API_STANDARDS.md             # General API standards
```

## ✅ Complete Swagger Template

```typescript
// ✅ MANDATORY - Complete controller with Swagger documentation
@ApiTags('👥 {FeatureName} Management')
@Controller('api/v1/{resources}')
@ApiBearerAuth()
export class {Feature}Controller {

  // ✅ MANDATORY - Complete documentation with examples
  @Post('list')
  @ApiOperation({
    summary: '🔍 Search {resources} with advanced filters',
    description: `
    Advanced paginated search for {resources}.

    ✅ Features:
    - Pagination (page, limit)
    - Multi-criteria sorting (sortBy, sortOrder)
    - Text search (search)
    - Specialized filters ({specific filters})

    🔐 Required permissions:
    - MANAGE_{RESOURCES} or READ_{RESOURCES}
    - Automatic scoping by user role
    `,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: '✅ {Resources} found successfully',
    type: List{Resource}ResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: '❌ Invalid search parameters',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '🔐 Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: '🚫 Insufficient permissions',
  })
  async list(@Body() dto: List{Resource}sDto, @GetUser() user: User) {
    // Implementation
  }
}
```

## 🚫 SWAGGER PROHIBITIONS

- ❌ **NEVER** controller without @ApiTags
- ❌ **NEVER** endpoint without detailed @ApiOperation
- ❌ **NEVER** route double prefixing
- ❌ **NEVER** incomplete or false JSON examples
- ❌ **NEVER** forget frontend integration guides

## 🔧 Common Swagger Errors to Fix

### 1. Schema objects without additionalProperties

```typescript
// FORBIDDEN - Causes TypeScript errors
@ApiPropertyOptional({
  type: 'object', // Missing additionalProperties: true
})
```

### 2. Response DTOs without definite assignment

```typescript
// FORBIDDEN - Causes strict TypeScript errors
export class ResponseDto {
  readonly success: boolean; // Missing !
}
```

### 3. Incomplete API documentation

```typescript
// FORBIDDEN - Too vague documentation
@ApiOperation({ summary: 'Get data' }) // Too vague
```

### 4. Undocumented enums

```typescript
// FORBIDDEN - Enum values not exposed
@IsEnum(StaffRole) // Missing Swagger documentation
```

This approach guarantees **professional APIs**, **complete documentation**, and **easy integration**!
