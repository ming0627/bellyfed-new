#!/bin/bash

# Deployment script for Bellyfed applications
# Supports development, staging, and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${DEPLOY_ENV:-"development"}
COMPOSE_FILE=""
ENV_FILE=""

echo -e "${BLUE}🚀 Deploying Bellyfed Application${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Set compose file based on environment
case $ENVIRONMENT in
    "development"|"dev")
        COMPOSE_FILE="docker-compose.dev.yml"
        ENV_FILE=".env.development"
        echo -e "${YELLOW}Using development configuration${NC}"
        ;;
    "staging"|"stage")
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env.staging"
        echo -e "${YELLOW}Using staging configuration${NC}"
        ;;
    "production"|"prod")
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_FILE=".env.production"
        echo -e "${YELLOW}Using production configuration${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
        echo "Valid environments: development, staging, production"
        exit 1
        ;;
esac

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Compose file not found: $COMPOSE_FILE${NC}"
    exit 1
fi

# Check if environment file exists
if [ ! -f "$ENV_FILE" ] && [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Environment file $ENV_FILE not found, using .env${NC}"
    ENV_FILE=".env"
elif [ ! -f "$ENV_FILE" ] && [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No environment file found, using defaults${NC}"
    ENV_FILE=""
fi

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

# Function to check if required environment variables are set
check_env_vars() {
    local required_vars=("DATABASE_URL" "JWT_SECRET")
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ] && [ "$ENVIRONMENT" = "production" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo -e "${RED}❌ Missing required environment variables for production:${NC}"
        printf '%s\n' "${missing_vars[@]}"
        exit 1
    fi
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}📊 Running database migrations...${NC}"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        # In development, we can run migrations directly
        docker-compose -f "$COMPOSE_FILE" ${ENV_FILE:+--env-file "$ENV_FILE"} exec backend pnpm prisma migrate deploy || true
    else
        # In production, migrations should be run separately
        echo -e "${YELLOW}⚠️  Please ensure database migrations are run separately in $ENVIRONMENT${NC}"
    fi
}

# Function to perform health checks
health_check() {
    echo -e "${BLUE}🏥 Performing health checks...${NC}"
    
    local services=("web" "backend" "docs")
    local max_attempts=30
    local attempt=1
    
    for service in "${services[@]}"; do
        echo -e "${YELLOW}Checking $service health...${NC}"
        
        while [ $attempt -le $max_attempts ]; do
            if docker-compose -f "$COMPOSE_FILE" ${ENV_FILE:+--env-file "$ENV_FILE"} exec -T "$service" sh -c "exit 0" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $service is healthy${NC}"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                echo -e "${RED}❌ $service health check failed after $max_attempts attempts${NC}"
                return 1
            fi
            
            echo -e "${YELLOW}Attempt $attempt/$max_attempts failed, retrying in 5 seconds...${NC}"
            sleep 5
            ((attempt++))
        done
        
        attempt=1
    done
    
    echo -e "${GREEN}✅ All services are healthy${NC}"
}

# Main deployment process
main() {
    echo -e "${BLUE}Starting deployment process...${NC}"
    
    # Pre-deployment checks
    check_docker
    check_env_vars
    
    # Stop existing containers
    echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
    docker-compose -f "$COMPOSE_FILE" ${ENV_FILE:+--env-file "$ENV_FILE"} down || true
    
    # Pull latest images (if not building locally)
    if [ "$BUILD_LOCALLY" != "true" ]; then
        echo -e "${BLUE}📥 Pulling latest images...${NC}"
        docker-compose -f "$COMPOSE_FILE" ${ENV_FILE:+--env-file "$ENV_FILE"} pull
    fi
    
    # Start services
    echo -e "${BLUE}🚀 Starting services...${NC}"
    docker-compose -f "$COMPOSE_FILE" ${ENV_FILE:+--env-file "$ENV_FILE"} up -d
    
    # Wait for services to be ready
    echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
    sleep 10
    
    # Run migrations
    if [ "$SKIP_MIGRATIONS" != "true" ]; then
        run_migrations
    fi
    
    # Health checks
    if [ "$SKIP_HEALTH_CHECK" != "true" ]; then
        health_check
    fi
    
    # Show running services
    echo -e "${BLUE}📋 Running services:${NC}"
    docker-compose -f "$COMPOSE_FILE" ${ENV_FILE:+--env-file "$ENV_FILE"} ps
    
    echo ""
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo ""
    echo "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:4000"
    echo "  Documentation: http://localhost:3001"
    
    if [ "$ENVIRONMENT" = "development" ]; then
        echo "  Database Admin: http://localhost:5050"
        echo "  Email Testing: http://localhost:8025"
    fi
    
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "  Monitoring: http://localhost:3002"
        echo "  Metrics: http://localhost:9090"
    fi
}

# Run main function
main "$@"
