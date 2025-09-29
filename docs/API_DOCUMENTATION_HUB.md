# 📚 Complete API Documentation Hub

Welcome to the comprehensive documentation for the **Appointment Management System API** - a modern, enterprise-grade backend built with Clean Architecture principles.

## 🚀 Quick Start Guides

### For Developers

- **[🎯 Complete API Documentation](API_COMPLETE_DOCUMENTATION.md)** - Full API reference with examples
- **[🎨 Frontend Integration Guide](FRONTEND_INTEGRATION_GUIDE.md)** - React, Vue, Angular examples
- **[🧪 API Testing Guide](API_TESTING_GUIDE.md)** - cURL, Postman, automated testing
- **[📝 TypeScript Types](TYPESCRIPT_TYPES.md)** - Complete type definitions

### For System Administrators

- **[🏗️ Installation Guide](INSTALLATION.md)** - Production deployment
- **[🔧 Development Setup](DEVELOPMENT.md)** - Local development environment
- **[🐳 Docker Guide](../docker-compose.yml)** - Container orchestration

## 📖 Architecture Documentation

### 🏛️ System Design

- **[🎯 Clean Architecture](CLEAN_ARCHITECTURE_DEPENDENCIES.md)** - Domain-driven design principles
- **[🗄️ Database Architecture](DATABASE_ARCHITECTURE.md)** - PostgreSQL schema and relationships
- **[🔄 Migration Guide](MIGRATIONS.md)** - Database version control

### 🎭 Features & Capabilities

#### 🔐 **Authentication & Security**

- **JWT Cookie-based Authentication** - Secure HttpOnly cookies
- **Role-based Access Control (RBAC)** - Granular permissions
- **Rate Limiting & Throttling** - API protection
- **Input Validation & Sanitization** - Security-first approach

#### 🏢 **Business Management**

- **Multi-business Support** - Enterprise-ready architecture
- **Flexible Business Hours** - Complex scheduling rules
- **Location Management** - Multi-location businesses
- **Business Settings** - Customizable configurations

#### 💼 **Service & Pricing System**

- **Flexible Pricing Models**: FREE, FIXED, VARIABLE, HIDDEN, ON_DEMAND
- **Package Deals** - Session-based and unlimited packages
- **Variable Pricing Factors** - Duration, type, add-ons
- **Pricing Visibility Control** - Public, private, authenticated-only

#### 👨‍💼 **Staff Management**

- **Professional Profiles** - Qualifications, experience, specializations
- **Working Hours Management** - Complex schedules and availability
- **Service Assignment** - Staff-service relationships
- **Permission Systems** - Role-based access control

#### 📅 **Appointment System**

- **Real-time Booking** - Conflict detection and prevention
- **Available Slots API** - Dynamic scheduling
- **Appointment Lifecycle** - Pending → Confirmed → Completed
- **Cancellation & Rescheduling** - Flexible policies
- **Multi-source Booking** - Online, phone, walk-in

#### 📊 **Analytics & Reporting**

- **Business Metrics** - Revenue, utilization, retention
- **Performance Analytics** - Staff efficiency, service popularity
- **Client Analytics** - Booking patterns, preferences
- **Financial Reporting** - Revenue tracking, package analytics

## 🎯 API Overview

### Base Configuration

```
🌐 Development: http://localhost:3000
📋 API Docs: http://localhost:3000/api/docs
🔗 Base Path: /api/v1
📊 Current Version: 3.0.0
```

### Key Endpoints

#### 🔐 Authentication

- `POST /auth/login` - User authentication
- `GET /auth/me` - Current user info
- `POST /auth/logout` - Secure logout
- `POST /auth/refresh` - Token renewal

#### 🏢 Business Management

- `POST /api/v1/businesses` - Create business
- `POST /api/v1/businesses/list` - Search businesses
- `PATCH /api/v1/businesses/{id}` - Update business

#### 💼 Services

- `POST /api/v1/services` - Create service
- `POST /api/v1/services/list` - Search services
- `PATCH /api/v1/services/{id}` - Update service

#### 📅 Appointments

- `POST /api/v1/appointments` - Book appointment
- `POST /api/v1/appointments/list` - List appointments
- `POST /api/v1/appointments/available-slots` - Get available times

#### 👨‍💼 Staff

- `POST /api/v1/staff` - Create staff member
- `POST /api/v1/staff/list` - List staff
- `POST /api/v1/staff/{id}/availability` - Set availability

## 🎨 Frontend Integration

### React Example

```typescript
const { appointments, loading } = useAppointments({
  filters: { businessId: 'uuid', status: ['CONFIRMED'] },
});
```

### Vue 3 Example

```typescript
const appointments = await $fetch('/api/v1/appointments/list', {
  method: 'POST',
  body: { filters: { businessId: 'uuid' } },
  credentials: 'include',
});
```

### JavaScript/Fetch

```javascript
const response = await fetch('/api/v1/services/list', {
  method: 'POST',
  credentials: 'include', // Required for cookie auth
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ filters: { allowOnlineBooking: true } }),
});
```

## 🧪 Testing & Development

### cURL Examples

```bash
# Login and get cookies
curl -c cookies.txt -X POST "/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'

# Use authenticated endpoints
curl -b cookies.txt "/api/v1/businesses/list" \
  -H "Content-Type: application/json" \
  -d '{"page": 1, "limit": 10}'
```

### Postman Collection

Import the auto-generated collection:

```bash
curl "http://localhost:3000/api/docs-json" > postman-collection.json
```

## 🔧 Development Workflow

### Local Development

1. **Clone & Setup**: `git clone repo && npm install`
2. **Environment**: Copy `.env.example` to `.env`
3. **Database**: `docker compose up postgres`
4. **Migrate**: `npm run migration:run`
5. **Start**: `npm run start:dev`
6. **Test**: `npm run test`

### Production Deployment

1. **Build**: `npm run build`
2. **Docker**: `docker compose -f docker-compose.prod.yml up`
3. **Health Check**: `curl /health`
4. **Monitor**: Check logs and metrics

## 🛡️ Security Features

### Authentication

- **HttpOnly Cookies** - XSS protection
- **CSRF Protection** - SameSite cookies
- **JWT Tokens** - Secure, stateless auth
- **Token Rotation** - Automatic refresh

### API Security

- **Rate Limiting** - Prevents abuse
- **Input Validation** - Prevents injection
- **CORS Configuration** - Origin restrictions
- **HTTPS Enforcement** - TLS encryption

### Data Protection

- **Password Hashing** - bcrypt with salt
- **Sensitive Data Encryption** - AES-256
- **Audit Logging** - Complete activity trail
- **GDPR Compliance** - Data privacy ready

## 📊 Performance & Scaling

### Caching Strategy

- **Redis Caching** - Session and data cache
- **Query Optimization** - Efficient database queries
- **Connection Pooling** - Database performance
- **CDN Integration** - Static asset delivery

### Monitoring & Metrics

- **Health Checks** - System status monitoring
- **Performance Metrics** - Response time tracking
- **Error Logging** - Comprehensive error capture
- **Business Analytics** - KPI dashboard ready

## 🤝 Contributing

### Code Standards

- **TypeScript Strict** - Full type safety
- **ESLint + Prettier** - Code formatting
- **Jest Testing** - 1088+ passing tests
- **Clean Architecture** - Domain-driven design

### Development Guidelines

- **TDD Approach** - Test-driven development
- **Git Flow** - Feature branch workflow
- **Code Reviews** - Pull request process
- **Documentation** - Keep docs updated

---

## 📞 Support & Resources

- **🌐 Interactive API Docs**: [localhost:3000/api/docs](http://localhost:3000/api/docs)
- **📧 Developer Support**: dev-support@yourdomain.com
- **🐛 Bug Reports**: GitHub Issues
- **💬 Community**: Discord/Slack channels

**🎯 Ready to integrate? Start with the [Complete API Documentation](API_COMPLETE_DOCUMENTATION.md) or jump into [Frontend Integration Examples](FRONTEND_INTEGRATION_GUIDE.md)!**
