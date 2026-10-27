#!/bin/bash

# VelvetLog Deployment Script
# Handles deployment to staging and production environments

set -e

# Configuration
STAGING_DOMAIN="velvetlog-staging.replit.app"
PRODUCTION_DOMAIN="velvetlog.replit.app"
BACKUP_RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Environment validation
validate_environment() {
    log "Validating environment..."
    
    # Check required environment variables
    local required_vars=("DATABASE_URL" "SESSION_SECRET" "MASTER_ENCRYPTION_KEY")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        exit 1
    fi
    
    # Check Node.js version
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        exit 1
    fi
    
    local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$node_version" -lt 18 ]; then
        error "Node.js version $node_version is too old. Minimum required: 18"
        exit 1
    fi
    
    success "Environment validation passed"
}

# Security checks
security_checks() {
    log "Running security checks..."
    
    # Check for secrets in code
    if grep -r "SECRET\|PASSWORD\|TOKEN" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" client/ server/ 2>/dev/null | grep -v "process.env" | grep -v "// TODO\|// FIXME"; then
        error "Potential hardcoded secrets found in code"
        exit 1
    fi
    
    # Run security audit
    log "Running npm audit..."
    if ! npm audit --audit-level moderate; then
        error "Security vulnerabilities found. Please fix them before deploying."
        exit 1
    fi
    
    # Check dependencies
    log "Checking for outdated dependencies..."
    npm outdated || true
    
    success "Security checks passed"
}

# Run tests
run_tests() {
    log "Running test suite..."
    
    # Type checking
    log "Running TypeScript type check..."
    npm run type-check
    
    # Unit tests
    log "Running unit tests..."
    npm test
    
    # Integration tests (if available)
    if npm run | grep -q "test:integration"; then
        log "Running integration tests..."
        npm run test:integration
    fi
    
    success "All tests passed"
}

# Database backup
backup_database() {
    local environment=$1
    log "Creating database backup for $environment..."
    
    local backup_file="backup_${environment}_$(date +%Y%m%d_%H%M%S).sql"
    
    if [ -n "$DATABASE_URL" ]; then
        # Create backup using pg_dump
        if command -v pg_dump &> /dev/null; then
            pg_dump "$DATABASE_URL" > "$backup_file"
            log "Database backup created: $backup_file"
            
            # Encrypt backup
            if command -v gpg &> /dev/null && [ -n "$BACKUP_ENCRYPTION_KEY" ]; then
                gpg --symmetric --cipher-algo AES256 --output "$backup_file.gpg" "$backup_file"
                rm "$backup_file"
                log "Backup encrypted: $backup_file.gpg"
            fi
        else
            warning "pg_dump not available, skipping database backup"
        fi
    else
        warning "DATABASE_URL not set, skipping database backup"
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    # Clean previous build
    rm -rf dist/
    
    # Install production dependencies
    npm ci --only=production
    
    # Build client
    log "Building client application..."
    npm run build:client
    
    # Build server
    log "Building server application..."
    npm run build:server
    
    # Verify build outputs
    if [ ! -d "dist/public" ] || [ ! -f "dist/index.js" ]; then
        error "Build verification failed - missing expected output files"
        exit 1
    fi
    
    success "Application built successfully"
}

# Deploy to staging
deploy_staging() {
    log "Deploying to staging environment..."
    
    # Backup current staging database
    backup_database "staging"
    
    # Update database schema
    log "Updating database schema..."
    npm run db:push
    
    # Deploy application
    log "Deploying application code..."
    # Add staging deployment commands here
    
    # Health check
    sleep 10
    if ! curl -f "https://$STAGING_DOMAIN/health" > /dev/null 2>&1; then
        error "Staging deployment health check failed"
        exit 1
    fi
    
    success "Staging deployment completed successfully"
    log "Staging URL: https://$STAGING_DOMAIN"
}

# Deploy to production
deploy_production() {
    log "Deploying to production environment..."
    
    # Additional production checks
    warning "Deploying to PRODUCTION environment"
    read -p "Are you sure you want to deploy to production? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        log "Production deployment cancelled"
        exit 0
    fi
    
    # Backup current production database
    backup_database "production"
    
    # Update database schema with caution
    log "Updating production database schema..."
    npm run db:push --force
    
    # Deploy application
    log "Deploying to production..."
    # Add production deployment commands here
    
    # Health check
    sleep 15
    if ! curl -f "https://$PRODUCTION_DOMAIN/health" > /dev/null 2>&1; then
        error "Production deployment health check failed"
        # Consider rollback here
        exit 1
    fi
    
    # Warm up application
    log "Warming up application..."
    curl -s "https://$PRODUCTION_DOMAIN" > /dev/null
    
    success "Production deployment completed successfully"
    log "Production URL: https://$PRODUCTION_DOMAIN"
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups..."
    
    # Remove backups older than retention period
    find . -name "backup_*.sql*" -type f -mtime +$BACKUP_RETENTION_DAYS -delete 2>/dev/null || true
    
    success "Backup cleanup completed"
}

# Rollback function
rollback() {
    local environment=$1
    local backup_file=$2
    
    log "Rolling back $environment environment..."
    
    if [ -f "$backup_file" ]; then
        # Restore database from backup
        if [[ "$backup_file" == *.gpg ]]; then
            gpg --decrypt "$backup_file" | psql "$DATABASE_URL"
        else
            psql "$DATABASE_URL" < "$backup_file"
        fi
        
        success "Rollback completed"
    else
        error "Backup file not found: $backup_file"
        exit 1
    fi
}

# Usage information
usage() {
    echo "Usage: $0 [staging|production|rollback]"
    echo ""
    echo "Commands:"
    echo "  staging     Deploy to staging environment"
    echo "  production  Deploy to production environment"
    echo "  rollback    Rollback to previous version"
    echo ""
    echo "Environment variables:"
    echo "  DATABASE_URL           Database connection string"
    echo "  SESSION_SECRET         Session encryption secret"
    echo "  MASTER_ENCRYPTION_KEY  Master encryption key"
    echo "  BACKUP_ENCRYPTION_KEY  GPG key for backup encryption"
    echo ""
}

# Main deployment logic
main() {
    case $1 in
        staging)
            validate_environment
            security_checks
            run_tests
            build_application
            deploy_staging
            cleanup_backups
            ;;
        production)
            validate_environment
            security_checks
            run_tests
            build_application
            deploy_production
            cleanup_backups
            ;;
        rollback)
            if [ -z "$2" ]; then
                error "Please specify backup file for rollback"
                exit 1
            fi
            rollback "$2" "$3"
            ;;
        *)
            usage
            exit 1
            ;;
    esac
}

# Trap errors
trap 'error "Deployment failed at line $LINENO"' ERR

# Run main function
main "$@"