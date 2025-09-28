# 🐳 Docker Environment & Database

## 🚨 CRITICAL RULE: HYBRID DOCKER-HOST DEVELOPMENT WITH FASTIFY

**⚠️ UPDATED RULE**: This application uses a **HYBRID APPROACH** with Docker Compose for services and host for development tasks. The framework has migrated from **Express to Fastify** for superior performance and TypeScript integration.

### 🎯 Hybrid Architecture Benefits with Fastify

- **🚀 Fastify Performance**: Superior HTTP performance and lower overhead
- **🏗️ Environment Consistency**: Database services in Docker for consistency
- **🗄️ Service Isolation**: PostgreSQL + Redis + MongoDB containerized
- **⚡ Development Speed**: Host-based tests, builds, and file creation for performance
- **🛡️ Service Security**: Database isolation in containers
- **📦 Flexible Development**: Best of both worlds with modern Fastify stack

## 🔗 Database Connection Configuration

**⚠️ MANDATORY DOCKER CONFIGURATION**: Use ONLY parameters from .env and docker-compose.yml:

```bash
# ✅ CORRECT POSTGRESQL CONNECTION (based on .env and docker-compose.yml)
# Service: postgres (service name in docker-compose.yml)
# User: rvproject_user (POSTGRES_USER in .env)
# Database: rvproject_app (POSTGRES_DB in .env)
# Schema: rvproject_schema (DB_SCHEMA in .env)

# ✅ MANDATORY CORRECT COMMANDS
docker compose exec postgres psql -U rvproject_user -d rvproject_app
docker compose exec postgres pg_dump -U rvproject_user rvproject_app
docker compose exec postgres psql -U rvproject_user -d rvproject_app -c "SELECT * FROM rvproject_schema.migrations_history;"
docker compose exec postgres psql -U rvproject_user -d rvproject_app -c "\\dt rvproject_schema.*;"

# ❌ COMMON ERRORS TO AVOID
docker compose exec postgres-dev ...  # Non-existent service
docker compose exec postgres psql -U postgres ...  # Incorrect user
docker compose exec postgres psql ... appointment_system  # Incorrect database
```

## ✅ Development Commands - HYBRID APPROACH

### Host-Based Development (NEW)

```bash
# 🚀 DEVELOPMENT (Host)
npm run start:dev      # Start in development mode
npm run build          # Build application
npm run tsc:check      # TypeScript verification

# 🧪 TESTING (Host)
npm test               # All tests
npm run test:unit      # Unit tests
npm run test:e2e       # Integration tests
npm run test:cov       # Test coverage

# 🔍 CODE QUALITY (Host)
npm run lint           # ESLint
npm run lint:fix       # Auto-fix ESLint
npm run format         # Prettier formatting

# � FILE OPERATIONS (Host)
# All file creation and editing done on host
# Use IDE, text editors, or file system directly
```

### Docker Services Only

```bash
# �🗄️ DATABASE OPERATIONS (Docker)
docker compose up -d postgres redis    # Start only database services
docker compose exec postgres psql -U rvproject_user -d rvproject_app
docker compose exec postgres psql -U rvproject_user -d rvproject_app -c "\\dt rvproject_schema.*;"

# 📦 SERVICE MANAGEMENT (Docker)
docker compose up -d              # Start all services (including databases)
docker compose down               # Stop all services
docker compose logs postgres     # View database logs
```

### Migration Commands (Docker for DB Connection)

```bash
# 🗄️ MIGRATIONS (Docker for DB access, but can run from host if DB accessible)
docker compose exec app npm run migration:run     # Execute migrations
docker compose exec app npm run migration:revert  # Rollback migration
docker compose exec app npm run migration:generate -- -n MigrationName

# OR from host if database ports are exposed:
npm run migration:run     # If DB ports accessible from host
npm run migration:revert  # If DB ports accessible from host
```

## 🚨 Simplified Dependency Installation Workflow

**✅ NEW APPROACH**: Install dependencies directly on host:

```bash
# 🔧 SIMPLE DEPENDENCY MANAGEMENT (Host)
npm install new-dependency    # Install dependency on host
npm ci                       # Clean install
npm audit                    # Security audit
npm outdated                # Check outdated packages

# 🔄 IF using containerized app (optional):
docker compose restart app  # Restart if app runs in container
```

## ✅ Updated Prohibitions - Hybrid Approach

**Commands that should use Docker:**

- ❌ **Database connections** should use Docker containers
- ❌ **Service management** should use Docker Compose
- ❌ **Production deployment** should use Docker

**Commands that can use Host:**

- ✅ **Tests** can run on host: `npm test`
- ✅ **Build** can run on host: `npm run build`
- ✅ **Linting** can run on host: `npm run lint`
- ✅ **File creation/editing** done on host
- ✅ **Development server** can run on host: `npm run start:dev`
- ✅ **Dependency management** can use host: `npm install`

## 🔄 Updated Development Workflow

```bash
# 🏃 Daily startup
docker compose up -d postgres redis           # Start database services
npm run start:dev                             # Development mode with hot reload (host)

# 🧪 Before commit
npm run lint:fix                              # Auto-fix errors (host)
npm test                                      # Validate tests (host)
npm run build                                 # Validate build (host)

# 🗄️ Database work
npm run migration:run                         # Apply migrations (host or docker)
docker compose exec postgres psql -U rvproject_user -d rvproject_app # Explore DB

# 🛑 End of day
docker compose down                           # Stop all services
```

## 📦 Configured Docker Services

#### **📊 Services Docker Configured**

- **🚀 NestJS + Fastify App**: Port 3000, hot reload, debugging, high-performance HTTP
- **🐘 PostgreSQL 15**: Port 5432, persistent volume, health checks
- **🍃 MongoDB 7**: Port 27017, replication configured
- **🔴 Redis**: Port 6379, user cache and sessions
- **🔧 pgAdmin 4**: Port 5050, DB management web interface

## 🚨 Consequences for Non-Compliance

Non-compliance with this rule results in:

- **Environment errors** and hard-to-reproduce bugs
- **Dependency corruption** and inconsistent versions
- **Deployment failures** in staging/production
- **Mandatory review** of all modified code
- **Additional training** on Docker and containerized development

**This rule is FUNDAMENTAL for system stability and reproducibility!**

## 🔧 Quick Reference Commands

```bash
# Service management
docker compose up -d postgres redis    # Start database services only
docker compose up -d                    # Start all services
docker compose down                     # Stop all services
docker compose restart postgres        # Restart database
docker compose logs postgres --tail=50 # View database logs

# Development workflow (Host)
npm run start:dev           # Development server
npm run test:watch          # Test watcher
npm test                    # Run all tests
npm run build              # Build application
npm run lint               # Lint code

# Database operations
docker compose exec postgres psql -U rvproject_user -d rvproject_app
docker compose exec postgres pg_dump -U rvproject_user rvproject_app > backup.sql
npm run migration:run       # Apply migrations (host or docker)
```
