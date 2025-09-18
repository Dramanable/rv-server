#!/bin/bash

# 🧪 Script de Test des Connexions pour Tests d'Intégration
# ✅ Vérifie que tous les services sont accessibles avant de lancer les tests
# 🎯 Utilisé en local et dans GitHub Actions

echo "🔍 Vérification des services pour tests d'intégration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables d'environnement par défaut
REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}
DATABASE_URL=${DATABASE_URL:-"postgresql://test_user:test_password@localhost:5432/test_db"}
MONGODB_URL=${MONGODB_URL:-"mongodb://test_user:test_password@localhost:27017/test_db"}

# Fonction pour tester une connexion
test_connection() {
    local service_name="$1"
    local test_command="$2"
    local max_attempts=10
    local attempt=1

    echo -n "🔗 Test ${service_name}... "
    
    while [ $attempt -le $max_attempts ]; do
        if eval $test_command >/dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ ÉCHEC${NC}"
    echo "   Commande: $test_command"
    return 1
}

# Variables de succès
redis_ok=false
postgres_ok=false
mongodb_ok=false

# 🔴 Test Redis
echo -e "${YELLOW}📊 Test Redis${NC}"
if test_connection "Redis" "redis-cli -u $REDIS_URL ping"; then
    redis_ok=true
    
    # Test supplémentaire - écriture/lecture
    echo -n "📝 Test écriture Redis... "
    if redis-cli -u $REDIS_URL set test_key "test_value" >/dev/null 2>&1 && \
       redis-cli -u $REDIS_URL get test_key | grep -q "test_value"; then
        echo -e "${GREEN}✅ OK${NC}"
        redis-cli -u $REDIS_URL del test_key >/dev/null 2>&1
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        redis_ok=false
    fi
fi

echo ""

# 🔵 Test PostgreSQL
echo -e "${YELLOW}🗄️ Test PostgreSQL${NC}"
if test_connection "PostgreSQL" "pg_isready -d '$DATABASE_URL'"; then
    postgres_ok=true
    
    # Test supplémentaire - connexion SQL
    echo -n "📝 Test requête PostgreSQL... "
    if psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
    else
        echo -e "${RED}❌ ÉCHEC${NC}"
        postgres_ok=false
    fi
fi

echo ""

# 🟢 Test MongoDB
echo -e "${YELLOW}🍃 Test MongoDB${NC}"
# Extraction des paramètres de l'URL MongoDB
mongo_host=$(echo $MONGODB_URL | sed -n 's|mongodb://.*@\([^:]*\):.*|\1|p')
mongo_port=$(echo $MONGODB_URL | sed -n 's|mongodb://.*:\([0-9]*\)/.*|\1|p')

if [ -z "$mongo_host" ]; then
    mongo_host="localhost"
fi
if [ -z "$mongo_port" ]; then
    mongo_port="27017"
fi

if test_connection "MongoDB" "nc -z $mongo_host $mongo_port"; then
    mongodb_ok=true
    
    # Test avec mongosh si disponible
    if command -v mongosh >/dev/null 2>&1; then
        echo -n "📝 Test requête MongoDB... "
        if mongosh "$MONGODB_URL" --eval "db.adminCommand('ping')" --quiet >/dev/null 2>&1; then
            echo -e "${GREEN}✅ OK${NC}"
        else
            echo -e "${RED}❌ ÉCHEC (connexion OK mais auth échoue)${NC}"
        fi
    else
        echo "ℹ️  mongosh non disponible, test de port uniquement"
    fi
fi

echo ""

# 📊 Résumé final
echo "📊 RÉSUMÉ DES TESTS DE CONNECTIVITÉ"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if $redis_ok; then
    echo -e "🔴 Redis:      ${GREEN}✅ PRÊT${NC}     ($REDIS_URL)"
else
    echo -e "🔴 Redis:      ${RED}❌ ÉCHEC${NC}    ($REDIS_URL)"
fi

if $postgres_ok; then
    echo -e "🔵 PostgreSQL: ${GREEN}✅ PRÊT${NC}     ($DATABASE_URL)"
else
    echo -e "🔵 PostgreSQL: ${RED}❌ ÉCHEC${NC}    ($DATABASE_URL)"
fi

if $mongodb_ok; then
    echo -e "🟢 MongoDB:    ${GREEN}✅ PRÊT${NC}     ($MONGODB_URL)"
else
    echo -e "🟢 MongoDB:    ${RED}❌ ÉCHEC${NC}    ($MONGODB_URL)"
fi

echo ""

# 🎯 Décision finale
if $redis_ok && $postgres_ok; then
    echo -e "${GREEN}🎉 TOUS LES SERVICES ESSENTIELS SONT PRÊTS !${NC}"
    echo "🚀 Vous pouvez lancer les tests d'intégration :"
    echo "   npm run test:integration"
    echo ""
    exit 0
else
    echo -e "${RED}🚨 CERTAINS SERVICES NE SONT PAS DISPONIBLES${NC}"
    echo ""
    echo "💡 SOLUTIONS POSSIBLES :"
    
    if ! $redis_ok; then
        echo "🔴 Redis:"
        echo "   • Démarrer Redis : docker run -d -p 6379:6379 redis:7-alpine"
        echo "   • Ou avec Docker Compose : make start-db"
    fi
    
    if ! $postgres_ok; then
        echo "🔵 PostgreSQL:"
        echo "   • Démarrer PostgreSQL : docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=test_password postgres:15-alpine"
        echo "   • Ou avec Docker Compose : make start-db"
    fi
    
    if ! $mongodb_ok; then
        echo "🟢 MongoDB (optionnel):"
        echo "   • Démarrer MongoDB : docker run -d -p 27017:27017 mongo:7"
        echo "   • Ou avec Docker Compose : make start-db"
    fi
    
    echo ""
    echo "🐳 COMMANDE RAPIDE (recommandé) :"
    echo "   make start-db   # Démarre tous les services nécessaires"
    echo ""
    exit 1
fi
