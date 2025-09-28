# 🎯 Project Overview & Context

## 📋 Project Description

You are working on an **enterprise-grade NestJS application** implementing **Robert C. Martin's Clean Architecture** with rigorous **TDD approach**, **SOLID principles**, and strict **TypeScript best practices**. The application is **production-ready** with security, i18n, and enterprise patterns.

## 🏗️ Technical Stack

- **Runtime**: Node.js 24+ (LTS)
- **Framework**: NestJS with Fastify
- **Language**: TypeScript 5.5+ (strict mode)
- **Database**: PostgreSQL 15 with TypeORM
- **Cache**: Redis
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (unit, integration, e2e)
- **Architecture**: Clean Architecture + DDD patterns
- **Development**: Docker Compose environment

## 🎯 Application Domain

### Core Functionality

- **Multi-tenant business management** platform
- **Service scheduling and appointment booking** system
- **Staff and resource management**
- **Role-based access control (RBAC)** with granular permissions
- **Audit trail and compliance** features

### Key Entities

- **Users** - Authentication, roles, permissions
- **Businesses** - Multi-tenant business profiles
- **Staff** - Personnel management and assignments
- **Services** - Flexible pricing, packages, requirements
- **Appointments** - Booking system with business rules
- **Calendars** - Scheduling and availability management
- **Permissions** - Granular access control system

## 🏛️ Architecture Principles

### Clean Architecture Layers

1. **Domain** - Pure business logic, entities, value objects
2. **Application** - Use cases, application services, ports
3. **Infrastructure** - Database, external services, adapters
4. **Presentation** - Controllers, DTOs, API documentation

### Key Design Patterns

- **Repository Pattern** with interfaces and implementations
- **Ports & Adapters** for external dependencies
- **Value Objects** for type safety and validation
- **Factory Methods** for entity creation
- **Mappers** for data transformation between layers

## 🛡️ Quality Standards

### Code Quality Requirements

- **100% TypeScript strict mode** - No `any` types allowed
- **Clean Architecture compliance** - No framework dependencies in domain/application
- **TDD approach** - Tests written before implementation
- **SOLID principles** - Applied rigorously across all code
- **Enterprise logging** - Structured logging with correlation IDs
- **I18n support** - All user-facing messages internationalized

### Security Requirements

- **Permission validation** on every operation
- **Audit trail** for all critical actions
- **Input sanitization** and validation
- **JWT authentication** with refresh tokens
- **Rate limiting** and abuse protection

## 🚀 Development Philosophy

### Mandatory Practices

- **Security-first approach** - Never compromise on permissions
- **Data integrity focus** - Preserve existing data in migrations
- **Production-ready code** - Every line must be enterprise-grade
- **Docker-exclusive development** - No host-based commands
- **TDD methodology** - RED-GREEN-REFACTOR cycle

### Forbidden Practices

- Using `any` type in TypeScript
- Framework dependencies in domain/application layers
- Operations without permission validation
- Direct host commands (must use Docker)
- Hardcoded strings (use i18n)
- Destructive migrations without data preservation

## 📊 Current Status

### Completed Features

- ✅ User authentication and management
- ✅ Business management with sectors
- ✅ Staff management and assignments
- ✅ Service management with flexible pricing
- ✅ Appointment booking with business rules
- ✅ RBAC system with granular permissions
- ✅ Calendar and scheduling system
- ✅ Swagger documentation
- ✅ Docker development environment

### Quality Metrics

- **Tests**: 1093+ passing unit tests
- **Coverage**: 90%+ on critical paths
- **Architecture**: Clean Architecture compliance
- **Security**: RBAC with audit trail
- **Documentation**: Complete Swagger API docs
