#!/bin/bash

# ECS Deployment Script for Bellyfed
# Deploys applications to AWS ECS using CDK and Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${ENVIRONMENT:-"production"}
AWS_REGION=${AWS_REGION:-"us-east-1"}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID:-$(aws sts get-caller-identity --query Account --output text)}

echo -e "${BLUE}🚀 Deploying Bellyfed to AWS ECS${NC}"
echo "Environment: $ENVIRONMENT"
echo "AWS Region: $AWS_REGION"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo ""

# Function to check AWS CLI and credentials
check_aws_setup() {
    echo -e "${BLUE}🔍 Checking AWS setup...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI is not installed${NC}"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ AWS setup verified${NC}"
}

# Function to check Docker
check_docker() {
    echo -e "${BLUE}🐳 Checking Docker...${NC}"
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed${NC}"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        echo -e "${RED}❌ Docker daemon is not running${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Docker verified${NC}"
}

# Function to check CDK
check_cdk() {
    echo -e "${BLUE}☁️ Checking AWS CDK...${NC}"
    
    if ! command -v cdk &> /dev/null; then
        echo -e "${YELLOW}⚠️ CDK not found, installing...${NC}"
        npm install -g aws-cdk
    fi
    
    echo -e "${GREEN}✅ CDK verified${NC}"
}

# Function to build and push Docker images
build_and_push_images() {
    echo -e "${BLUE}🏗️ Building and pushing Docker images...${NC}"
    
    # Login to ECR
    echo -e "${YELLOW}Logging in to ECR...${NC}"
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
    
    # Build and push frontend
    echo -e "${YELLOW}Building frontend image...${NC}"
    docker build -t bellyfed-frontend:latest ./apps/web
    docker tag bellyfed-frontend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bellyfed-frontend:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bellyfed-frontend:latest
    
    # Build and push backend
    echo -e "${YELLOW}Building backend image...${NC}"
    docker build -t bellyfed-backend:latest ./apps/backend
    docker tag bellyfed-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bellyfed-backend:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bellyfed-backend:latest
    
    # Build and push docs
    echo -e "${YELLOW}Building docs image...${NC}"
    docker build -t bellyfed-docs:latest ./apps/docs
    docker tag bellyfed-docs:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bellyfed-docs:latest
    docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/bellyfed-docs:latest
    
    echo -e "${GREEN}✅ Images built and pushed successfully${NC}"
}

# Function to deploy infrastructure
deploy_infrastructure() {
    echo -e "${BLUE}🏗️ Deploying infrastructure with CDK...${NC}"
    
    cd packages/infra
    
    # Install dependencies
    echo -e "${YELLOW}Installing CDK dependencies...${NC}"
    npm install
    
    # Bootstrap CDK (if needed)
    echo -e "${YELLOW}Bootstrapping CDK...${NC}"
    cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION --context environment=$ENVIRONMENT
    
    # Deploy the stack
    echo -e "${YELLOW}Deploying ECS stack...${NC}"
    cdk deploy BellyfedECS-$ENVIRONMENT \
        --context environment=$ENVIRONMENT \
        --context account=$AWS_ACCOUNT_ID \
        --context region=$AWS_REGION \
        --require-approval never
    
    cd ../..
    
    echo -e "${GREEN}✅ Infrastructure deployed successfully${NC}"
}

# Function to run database migrations
run_migrations() {
    echo -e "${BLUE}📊 Running database migrations...${NC}"
    
    if [ "$SKIP_MIGRATIONS" != "true" ]; then
        pnpm run db:migrate:deploy
        echo -e "${GREEN}✅ Migrations completed${NC}"
    else
        echo -e "${YELLOW}⏭️ Migrations skipped${NC}"
    fi
}

# Function to verify deployment
verify_deployment() {
    echo -e "${BLUE}🔍 Verifying deployment...${NC}"
    
    # Check ECS services
    local cluster_name="bellyfed-cluster-$ENVIRONMENT"
    local services=("bellyfed-frontend-$ENVIRONMENT" "bellyfed-backend-$ENVIRONMENT" "bellyfed-docs-$ENVIRONMENT")
    
    for service in "${services[@]}"; do
        echo -e "${YELLOW}Checking service: $service${NC}"
        
        local running_count=$(aws ecs describe-services \
            --cluster $cluster_name \
            --services $service \
            --query 'services[0].runningCount' \
            --output text)
        
        local desired_count=$(aws ecs describe-services \
            --cluster $cluster_name \
            --services $service \
            --query 'services[0].desiredCount' \
            --output text)
        
        if [ "$running_count" = "$desired_count" ] && [ "$running_count" != "0" ]; then
            echo -e "${GREEN}✅ $service is healthy ($running_count/$desired_count tasks)${NC}"
        else
            echo -e "${RED}❌ $service is unhealthy ($running_count/$desired_count tasks)${NC}"
            return 1
        fi
    done
    
    echo -e "${GREEN}✅ All services are healthy${NC}"
}

# Function to get deployment URLs
get_deployment_urls() {
    echo -e "${BLUE}🌐 Getting deployment URLs...${NC}"
    
    local alb_dns=$(aws elbv2 describe-load-balancers \
        --names "bellyfed-alb-$ENVIRONMENT" \
        --query 'LoadBalancers[0].DNSName' \
        --output text 2>/dev/null || echo "Not found")
    
    if [ "$alb_dns" != "Not found" ]; then
        echo -e "${GREEN}Application URLs:${NC}"
        echo "  Frontend: http://$alb_dns"
        echo "  Backend API: http://$alb_dns/api"
        echo "  Documentation: http://$alb_dns/docs"
    else
        echo -e "${YELLOW}⚠️ Load balancer DNS not found${NC}"
    fi
}

# Main deployment function
main() {
    echo -e "${BLUE}Starting ECS deployment process...${NC}"
    
    # Pre-deployment checks
    check_aws_setup
    check_docker
    check_cdk
    
    # Build and push images
    if [ "$SKIP_BUILD" != "true" ]; then
        build_and_push_images
    else
        echo -e "${YELLOW}⏭️ Skipping image build${NC}"
    fi
    
    # Deploy infrastructure
    deploy_infrastructure
    
    # Run migrations
    run_migrations
    
    # Wait for deployment to stabilize
    echo -e "${YELLOW}⏳ Waiting for deployment to stabilize...${NC}"
    sleep 30
    
    # Verify deployment
    verify_deployment
    
    # Get URLs
    get_deployment_urls
    
    echo ""
    echo -e "${GREEN}🎉 ECS deployment completed successfully!${NC}"
    echo ""
    echo "Environment: $ENVIRONMENT"
    echo "Region: $AWS_REGION"
    echo "Account: $AWS_ACCOUNT_ID"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h          Show this help message"
        echo "  --skip-build        Skip Docker image building"
        echo "  --skip-migrations   Skip database migrations"
        echo ""
        echo "Environment variables:"
        echo "  ENVIRONMENT         Deployment environment (default: production)"
        echo "  AWS_REGION          AWS region (default: us-east-1)"
        echo "  AWS_ACCOUNT_ID      AWS account ID (auto-detected)"
        echo "  SKIP_BUILD          Skip image building (true/false)"
        echo "  SKIP_MIGRATIONS     Skip migrations (true/false)"
        exit 0
        ;;
    --skip-build)
        export SKIP_BUILD=true
        ;;
    --skip-migrations)
        export SKIP_MIGRATIONS=true
        ;;
esac

# Run main function
main "$@"
