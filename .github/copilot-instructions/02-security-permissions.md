# 🛡️ Security & Permissions

## 🚨 CRITICAL RULE: STRICT SECURITY VALIDATION

**⚠️ NON-NEGOTIABLE SECURITY RULE**: This application handles sensitive and critical data. **NO operation** must be executed without appropriate permission verification.

### 🔐 Mandatory Permission Patterns

**EVERY endpoint, use case, and operation MUST:**

```typescript
// ✅ MANDATORY - Permission verification in EVERY Use Case
export class AssignRoleUseCase {
  async execute(request: AssignRoleRequest): Promise<AssignRoleResponse> {
    // 🚨 CRITICAL: ALWAYS verify permissions FIRST
    await this.permissionService.requirePermission(
      request.requestingUserId,
      'MANAGE_ROLES',
      { businessId: request.context.businessId },
    );

    // 🚨 CRITICAL: Verify user can act on target role
    await this.permissionService.canActOnRole(
      request.requestingUserId,
      request.role,
      request.context,
    );

    // 🚨 CRITICAL: Verify user can manage target user
    await this.permissionService.canManageUser(
      request.requestingUserId,
      request.targetUserId,
      request.context,
    );

    // Only AFTER complete permission validation
    const roleAssignment = RoleAssignment.create({
      /* ... */
    });
  }
}
```

## 🎯 Required Permission Matrix

**NEVER perform operations without these verifications:**

### Business Operations

- `MANAGE_BUSINESS` - Create, update, delete businesses
- `READ_BUSINESS` - View business information
- `UPDATE_BUSINESS` - Modify business settings

### User Management

- `MANAGE_USERS` - Create, update, delete users
- `VIEW_USERS` - List and view user information
- `ASSIGN_ROLES` - Assign roles to users

### Role Management

- `MANAGE_ROLES` - Create, modify roles
- `ASSIGN_ROLES` - Assign roles to users
- `REVOKE_ROLES` - Remove roles from users

### Service Management

- `MANAGE_SERVICES` - Create, update, delete services
- `VIEW_SERVICES` - View service information
- `BOOK_SERVICES` - Book appointments for services

### Appointment Management

- `MANAGE_APPOINTMENTS` - Full appointment management
- `VIEW_APPOINTMENTS` - View appointment information
- `CANCEL_APPOINTMENTS` - Cancel appointments

## 🚫 Absolute Security Prohibitions

- ❌ **NEVER** perform CRUD operations without permission verification
- ❌ **NEVER** bypass permissions "for testing" in production
- ❌ **NEVER** hardcode permissions (`return true`)
- ❌ **NEVER** access data without business/role scoping
- ❌ **NEVER** use tokens or sessions without expiration validation
- ❌ **NEVER** perform sensitive operations without audit trail
- ❌ **NEVER** expose internal details in exceptions
- ❌ **NEVER** use SQL queries without bound parameters

## 🛡️ Defense in Depth Principles

### 1. Authentication Layer

- Valid and non-expired JWT tokens
- Refresh token rotation
- Session management with secure cookies

### 2. Authorization Layer

- Granular permissions per resource
- Business context scoping
- Role hierarchy enforcement

### 3. Business Scoping

- Resource access limited by business context
- Multi-tenant data isolation
- Cross-business operation prevention

### 4. Audit Layer

- Complete action traceability
- User action logging
- Security event monitoring

### 5. Input Validation

- Strict input sanitization
- Type validation at boundaries
- Business rule enforcement

### 6. Rate Limiting

- API endpoint protection
- User-based rate limits
- Abuse prevention mechanisms

### 7. Error Handling

- Secure error messages
- No internal detail exposure
- Consistent error responses

## 🎖️ Implementation Examples

### Correct Permission Service Usage

```typescript
export class UpdateBusinessUseCase {
  async execute(
    request: UpdateBusinessRequest,
  ): Promise<UpdateBusinessResponse> {
    // 🔐 Step 1: Verify base permission
    await this.permissionService.requirePermission(
      request.requestingUserId,
      'UPDATE_BUSINESS',
      { businessId: request.businessId },
    );

    // 🔐 Step 2: Verify business context access
    await this.permissionService.verifyBusinessAccess(
      request.requestingUserId,
      request.businessId,
    );

    // 🔐 Step 3: Log security validation
    this.logger.info('Business update authorized', {
      userId: request.requestingUserId,
      businessId: request.businessId,
      operation: 'UPDATE_BUSINESS',
      correlationId: request.correlationId,
    });

    // Only proceed after complete validation
    const business = await this.businessRepository.findById(request.businessId);
    // ... business logic
  }
}
```

### Audit Trail Pattern

```typescript
// 🔍 MANDATORY - Audit all critical operations
await this.auditService.logOperation({
  operation: 'CREATE_SERVICE',
  entityType: 'SERVICE',
  entityId: savedService.getId(),
  businessId: request.businessId,
  userId: request.requestingUserId,
  correlationId: request.correlationId,
  changes: {
    created: savedService.toJSON(),
  },
  timestamp: new Date(),
  ipAddress: request.clientIp,
  userAgent: request.userAgent,
});
```

## 📋 Security Checklist

Every file must include:

- [ ] ✅ **Permission verification** before any business logic
- [ ] ✅ **Business context validation** for multi-tenant isolation
- [ ] ✅ **Audit logging** for sensitive operations
- [ ] ✅ **Input validation** with security focus
- [ ] ✅ **Error masking** to prevent information leakage
- [ ] ✅ **Correlation ID** tracking for security events
- [ ] ✅ **Rate limiting** consideration for public endpoints
- [ ] ✅ **SQL injection** prevention with bound parameters
