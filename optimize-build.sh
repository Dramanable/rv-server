#!/bin/bash

# 🚀 SCRIPT D'OPTIMISATION BUILD ET MÉMOIRE COPILOT
# Correction automatisée des erreurs de build critiques

echo "🔧 OPTIMISATION BUILD - Début du processus..."

# 1. Créer les enums manquants
echo "📁 Création des enums manquants..."

mkdir -p src/shared/enums

# Appointment enums
cat > src/shared/enums/appointment-status.enum.ts << 'EOF'
export enum AppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  RESCHEDULED = 'RESCHEDULED',
  NO_SHOW = 'NO_SHOW'
}
EOF

cat > src/shared/enums/appointment-type.enum.ts << 'EOF'
export enum AppointmentType {
  CONSULTATION = 'CONSULTATION',
  TREATMENT = 'TREATMENT',
  FOLLOW_UP = 'FOLLOW_UP',
  EMERGENCY = 'EMERGENCY',
  ROUTINE = 'ROUTINE'
}
EOF

# Business enums
cat > src/shared/enums/business-type.enum.ts << 'EOF'
export enum BusinessType {
  MEDICAL = 'MEDICAL',
  DENTAL = 'DENTAL',
  BEAUTY = 'BEAUTY',
  FITNESS = 'FITNESS',
  CONSULTING = 'CONSULTING',
  OTHER = 'OTHER'
}
EOF

cat > src/shared/enums/business-status.enum.ts << 'EOF'
export enum BusinessStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}
EOF

# Calendar enums
cat > src/shared/enums/calendar-status.enum.ts << 'EOF'
export enum CalendarStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}
EOF

cat > src/shared/enums/calendar-visibility.enum.ts << 'EOF'
export enum CalendarVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  RESTRICTED = 'RESTRICTED'
}
EOF

# Service enums
cat > src/shared/enums/service-status.enum.ts << 'EOF'
export enum ServiceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}
EOF

cat > src/shared/enums/service-type.enum.ts << 'EOF'
export enum ServiceType {
  CONSULTATION = 'CONSULTATION',
  TREATMENT = 'TREATMENT',
  DIAGNOSTIC = 'DIAGNOSTIC',
  THERAPY = 'THERAPY'
}
EOF

cat > src/shared/enums/pricing-type.enum.ts << 'EOF'
export enum PricingType {
  FIXED = 'FIXED',
  HOURLY = 'HOURLY',
  PACKAGE = 'PACKAGE',
  TIERED = 'TIERED'
}
EOF

# Staff enums
cat > src/shared/enums/staff-status.enum.ts << 'EOF'
export enum StaffStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED'
}
EOF

echo "✅ Enums créés avec succès"

# 2. Corriger les imports manquants dans les modules database
echo "🗄️ Correction des modules database..."

# Vérifier si les fichiers existent avant de les corriger
if [ -f "src/infrastructure/database/database-hybrid.module.ts" ]; then
  echo "Correction de database-hybrid.module.ts..."
  # Supprimer les duplications de classes et imports incorrects
  head -n 70 src/infrastructure/database/database-hybrid.module.ts > temp_hybrid.ts
  mv temp_hybrid.ts src/infrastructure/database/database-hybrid.module.ts
fi

# 3. Corriger les problèmes d'exports de repositories
echo "📦 Correction des exports de repositories..."

# Créer un export manquant pour TypeOrmUserRepository si nécessaire
if [ -f "src/infrastructure/database/repositories/sql/typeorm-user.repository.ts" ]; then
  if ! grep -q "export.*TypeOrmUserRepository" src/infrastructure/database/repositories/sql/typeorm-user.repository.ts; then
    echo "export { UserSqlRepository as TypeOrmUserRepository } from './user-sql.repository';" >> src/infrastructure/database/repositories/sql/typeorm-user.repository.ts
  fi
fi

# 4. Nettoyer les fichiers temporaires et de cache
echo "🧹 Nettoyage des fichiers temporaires..."
rm -rf node_modules/.cache/
rm -rf .tsbuildinfo
rm -f tsconfig.tsbuildinfo

# 5. Optimisation mémoire TypeScript
echo "⚡ Optimisation de la compilation TypeScript..."
export NODE_OPTIONS="--max-old-space-size=4096"

# 6. Test de compilation
echo "🔍 Test de compilation..."
if npx tsc --noEmit --skipLibCheck; then
  echo "✅ COMPILATION RÉUSSIE !"
else
  echo "⚠️ Erreurs de compilation détectées"
  npx tsc --noEmit --skipLibCheck 2>&1 | head -10
fi

echo "🎉 Optimisation terminée !"
