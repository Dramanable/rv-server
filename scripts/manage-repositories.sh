#!/bin/bash

# 🗄️ Repository Management Script
# Utilitaire pour gérer les repositories et leur configuration

set -e

# Configuration
REPOSITORY_DIR="src/infrastructure/database/repositories"
BACKUP_DIR="backups/repositories"
CONFIG_FILE=".env"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Fonction d'aide
show_help() {
    echo "🗄️ Repository Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status          Afficher l'état actuel des repositories"
    echo "  switch <type>   Basculer vers un type de base de données"
    echo "  test           Tester la connectivité des repositories"
    echo "  backup         Sauvegarder la configuration actuelle"
    echo "  restore        Restaurer une configuration sauvegardée"
    echo "  init           Initialiser la configuration des repositories"
    echo "  validate       Valider la structure des repositories"
    echo "  help           Afficher cette aide"
    echo ""
    echo "Types disponibles pour switch:"
    echo "  memory         Repositories in-memory (développement/test)"
    echo "  sql            Repositories SQL PostgreSQL (production)"
    echo "  nosql          Repositories NoSQL MongoDB (production)"
    echo "  hybrid         Configuration hybride (recommandé production)"
    echo ""
    echo "Options:"
    echo "  --dry-run      Simuler l'action sans l'exécuter"
    echo "  --verbose      Affichage détaillé"
    echo "  --force        Forcer l'action même en cas d'avertissement"
    echo ""
    echo "Exemples:"
    echo "  $0 status"
    echo "  $0 switch memory"
    echo "  $0 switch hybrid --dry-run"
    echo "  $0 test --verbose"
    echo "  $0 backup"
}

# Afficher le statut actuel
show_status() {
    log_info "📊 Statut actuel des repositories"
    echo ""
    
    echo "📁 Structure des repositories :"
    if [ -d "$REPOSITORY_DIR" ]; then
        ls -la "$REPOSITORY_DIR" | head -10
        echo ""
        
        echo "🐘 SQL Repositories :"
        if [ -d "$REPOSITORY_DIR/sql" ]; then
            ls -1 "$REPOSITORY_DIR/sql" | wc -l | xargs echo "   Fichiers :"
        else
            echo "   ❌ Dossier sql/ non trouvé"
        fi
        
        echo "🍃 NoSQL Repositories :"
        if [ -d "$REPOSITORY_DIR/nosql" ]; then
            ls -1 "$REPOSITORY_DIR/nosql" | wc -l | xargs echo "   Fichiers :"
        else
            echo "   ❌ Dossier nosql/ non trouvé"
        fi
        
        echo "🧠 In-Memory Repositories :"
        ls -1 "$REPOSITORY_DIR"/in-memory-*.ts 2>/dev/null | wc -l | xargs echo "   Fichiers :"
    else
        log_error "Dossier repositories non trouvé : $REPOSITORY_DIR"
        return 1
    fi
    
    echo ""
    echo "⚙️ Configuration actuelle :"
    if [ -f "$CONFIG_FILE" ]; then
        grep -E "DATABASE_TYPE|_REPOSITORY_TYPE" "$CONFIG_FILE" 2>/dev/null || echo "   Aucune configuration repository trouvée"
    else
        log_warning "Fichier .env non trouvé"
    fi
}

# Basculer vers un type de base de données
switch_database_type() {
    local target_type="$1"
    local dry_run="$2"
    
    log_info "🔄 Basculement vers le type : $target_type"
    
    case "$target_type" in
        "memory")
            update_env_config "memory" "$dry_run"
            ;;
        "sql")
            update_env_config "sql" "$dry_run"
            ;;
        "nosql")
            update_env_config "nosql" "$dry_run"
            ;;
        "hybrid")
            update_env_hybrid "$dry_run"
            ;;
        *)
            log_error "Type inconnu : $target_type"
            echo "Types supportés : memory, sql, nosql, hybrid"
            return 1
            ;;
    esac
}

# Mettre à jour la configuration .env
update_env_config() {
    local db_type="$1"
    local dry_run="$2"
    
    if [ "$dry_run" = "--dry-run" ]; then
        log_info "🧪 Mode simulation (dry-run)"
        echo "DATABASE_TYPE=$db_type"
        echo "USER_REPOSITORY_TYPE=$db_type"
        echo "BUSINESS_REPOSITORY_TYPE=$db_type"
        echo "CALENDAR_REPOSITORY_TYPE=$db_type"
        echo "APPOINTMENT_REPOSITORY_TYPE=$db_type"
        return 0
    fi
    
    # Créer une sauvegarde
    if [ -f "$CONFIG_FILE" ]; then
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Mettre à jour ou ajouter les variables
    update_or_add_env_var "DATABASE_TYPE" "$db_type"
    update_or_add_env_var "USER_REPOSITORY_TYPE" "$db_type"
    update_or_add_env_var "BUSINESS_REPOSITORY_TYPE" "$db_type"
    update_or_add_env_var "CALENDAR_REPOSITORY_TYPE" "$db_type"
    update_or_add_env_var "APPOINTMENT_REPOSITORY_TYPE" "$db_type"
    
    log_success "Configuration mise à jour vers $db_type"
}

# Configuration hybride recommandée pour production
update_env_hybrid() {
    local dry_run="$1"
    
    if [ "$dry_run" = "--dry-run" ]; then
        log_info "🧪 Mode simulation (dry-run) - Configuration hybride"
        echo "DATABASE_TYPE=sql"
        echo "USER_REPOSITORY_TYPE=sql"
        echo "BUSINESS_REPOSITORY_TYPE=sql"
        echo "CALENDAR_REPOSITORY_TYPE=nosql"
        echo "APPOINTMENT_REPOSITORY_TYPE=nosql"
        return 0
    fi
    
    # Sauvegarde
    if [ -f "$CONFIG_FILE" ]; then
        cp "$CONFIG_FILE" "${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Configuration hybride optimisée
    update_or_add_env_var "DATABASE_TYPE" "sql"
    update_or_add_env_var "USER_REPOSITORY_TYPE" "sql"        # Relations critiques
    update_or_add_env_var "BUSINESS_REPOSITORY_TYPE" "sql"    # Données structurées
    update_or_add_env_var "CALENDAR_REPOSITORY_TYPE" "nosql"  # Flexibilité horaires
    update_or_add_env_var "APPOINTMENT_REPOSITORY_TYPE" "nosql" # Volume élevé
    
    log_success "Configuration hybride appliquée (SQL + NoSQL optimisé)"
}

# Mettre à jour ou ajouter une variable d'environnement
update_or_add_env_var() {
    local var_name="$1"
    local var_value="$2"
    
    if grep -q "^${var_name}=" "$CONFIG_FILE" 2>/dev/null; then
        # Mettre à jour la variable existante
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${var_name}=.*/${var_name}=${var_value}/" "$CONFIG_FILE"
        else
            # Linux
            sed -i "s/^${var_name}=.*/${var_name}=${var_value}/" "$CONFIG_FILE"
        fi
    else
        # Ajouter la nouvelle variable
        echo "${var_name}=${var_value}" >> "$CONFIG_FILE"
    fi
}

# Tester la connectivité
test_connectivity() {
    local verbose="$1"
    
    log_info "🔍 Test de connectivité des repositories"
    
    # Test in-memory (toujours disponible)
    log_success "🧠 In-Memory : Disponible"
    
    # Test SQL (PostgreSQL)
    if command -v psql >/dev/null 2>&1; then
        if [ "$verbose" = "--verbose" ]; then
            log_info "Testing PostgreSQL connection..."
        fi
        # TODO: Implémenter test de connexion réel
        log_warning "🐘 SQL (PostgreSQL) : Test non implémenté"
    else
        log_warning "🐘 SQL : PostgreSQL CLI non disponible"
    fi
    
    # Test NoSQL (MongoDB)
    if command -v mongosh >/dev/null 2>&1 || command -v mongo >/dev/null 2>&1; then
        if [ "$verbose" = "--verbose" ]; then
            log_info "Testing MongoDB connection..."
        fi
        # TODO: Implémenter test de connexion réel
        log_warning "🍃 NoSQL (MongoDB) : Test non implémenté"
    else
        log_warning "🍃 NoSQL : MongoDB CLI non disponible"
    fi
}

# Sauvegarder la configuration
backup_config() {
    log_info "💾 Sauvegarde de la configuration"
    
    mkdir -p "$BACKUP_DIR"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="${BACKUP_DIR}/repository_config_${timestamp}.env"
    
    if [ -f "$CONFIG_FILE" ]; then
        cp "$CONFIG_FILE" "$backup_file"
        log_success "Configuration sauvegardée : $backup_file"
    else
        log_error "Fichier .env non trouvé"
        return 1
    fi
}

# Restaurer une configuration
restore_config() {
    log_info "🔄 Restauration de configuration"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        log_error "Dossier de sauvegarde non trouvé : $BACKUP_DIR"
        return 1
    fi
    
    echo "Sauvegardes disponibles :"
    ls -1 "$BACKUP_DIR"/*.env 2>/dev/null || {
        log_error "Aucune sauvegarde trouvée"
        return 1
    }
    
    echo -n "Entrez le nom du fichier à restaurer : "
    read -r backup_file
    
    if [ -f "${BACKUP_DIR}/${backup_file}" ]; then
        cp "${BACKUP_DIR}/${backup_file}" "$CONFIG_FILE"
        log_success "Configuration restaurée depuis $backup_file"
    else
        log_error "Fichier de sauvegarde non trouvé : $backup_file"
        return 1
    fi
}

# Initialiser la configuration des repositories
init_config() {
    log_info "🚀 Initialisation de la configuration des repositories"
    
    if [ -f "$CONFIG_FILE" ] && ! grep -q "DATABASE_TYPE" "$CONFIG_FILE"; then
        log_info "Ajout de la configuration des repositories à .env existant"
    else
        log_info "Création de la configuration des repositories"
    fi
    
    # Configuration par défaut pour développement
    cat >> "$CONFIG_FILE" << EOL

# 🗄️ Repository Configuration
# Choix: memory, sql, nosql

# Configuration globale par défaut  
DATABASE_TYPE=memory

# Configuration spécifique par repository (optionnel)
USER_REPOSITORY_TYPE=memory
BUSINESS_REPOSITORY_TYPE=memory
CALENDAR_REPOSITORY_TYPE=memory
APPOINTMENT_REPOSITORY_TYPE=memory

# 🐘 Configuration PostgreSQL (si DATABASE_TYPE=sql)
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=rvproject
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password

# 🍃 Configuration MongoDB (si DATABASE_TYPE=nosql)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=rvproject
EOL
    
    log_success "Configuration initialisée avec les valeurs par défaut (memory)"
    log_info "Modifiez le fichier .env selon vos besoins"
}

# Valider la structure des repositories
validate_structure() {
    log_info "✅ Validation de la structure des repositories"
    
    local errors=0
    
    # Vérifier la structure des dossiers
    for dir in "sql" "nosql"; do
        if [ ! -d "${REPOSITORY_DIR}/${dir}" ]; then
            log_error "Dossier manquant : ${REPOSITORY_DIR}/${dir}"
            errors=$((errors + 1))
        fi
    done
    
    # Vérifier les fichiers essentiels
    local essential_files=(
        "README.md"
        "repository.factory.ts"
        "index.ts"
        "sql/typeorm-user.repository.ts"
        "nosql/mongo-user.repository.ts"
    )
    
    for file in "${essential_files[@]}"; do
        if [ ! -f "${REPOSITORY_DIR}/${file}" ]; then
            log_error "Fichier manquant : ${REPOSITORY_DIR}/${file}"
            errors=$((errors + 1))
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "Structure des repositories valide ✅"
    else
        log_error "Erreurs trouvées : $errors"
        return 1
    fi
}

# Main
main() {
    case "${1:-help}" in
        "status")
            show_status
            ;;
        "switch")
            if [ -z "$2" ]; then
                log_error "Type de base de données requis"
                echo "Usage: $0 switch <memory|sql|nosql|hybrid>"
                return 1
            fi
            switch_database_type "$2" "$3"
            ;;
        "test")
            test_connectivity "$2"
            ;;
        "backup")
            backup_config
            ;;
        "restore")
            restore_config
            ;;
        "init")
            init_config
            ;;
        "validate")
            validate_structure
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Exécution
main "$@"
