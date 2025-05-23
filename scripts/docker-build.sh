#!/bin/bash

# Docker build script for Bellyfed applications
# Builds all Docker images with proper tagging and optimization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REGISTRY=${DOCKER_REGISTRY:-"bellyfed"}
TAG=${DOCKER_TAG:-"latest"}
BUILD_ARGS=${DOCKER_BUILD_ARGS:-""}

echo -e "${BLUE}🐳 Building Bellyfed Docker Images${NC}"
echo "Registry: $REGISTRY"
echo "Tag: $TAG"
echo "Build Args: $BUILD_ARGS"
echo ""

# Function to build and tag image
build_image() {
    local app_name=$1
    local context_path=$2
    local image_name="${REGISTRY}/${app_name}:${TAG}"
    
    echo -e "${YELLOW}Building ${app_name}...${NC}"
    
    if docker build $BUILD_ARGS -t "$image_name" "$context_path"; then
        echo -e "${GREEN}✅ Successfully built ${image_name}${NC}"
        
        # Also tag as latest if not already latest
        if [ "$TAG" != "latest" ]; then
            docker tag "$image_name" "${REGISTRY}/${app_name}:latest"
            echo -e "${GREEN}✅ Tagged as ${REGISTRY}/${app_name}:latest${NC}"
        fi
    else
        echo -e "${RED}❌ Failed to build ${app_name}${NC}"
        exit 1
    fi
    echo ""
}

# Build all applications
echo -e "${BLUE}Building frontend application...${NC}"
build_image "bellyfed-web" "./apps/web"

echo -e "${BLUE}Building backend application...${NC}"
build_image "bellyfed-backend" "./apps/backend"

echo -e "${BLUE}Building documentation site...${NC}"
build_image "bellyfed-docs" "./apps/docs"

# Build summary
echo -e "${GREEN}🎉 All images built successfully!${NC}"
echo ""
echo "Built images:"
docker images | grep "$REGISTRY" | head -10

# Optional: Push to registry
if [ "$PUSH_TO_REGISTRY" = "true" ]; then
    echo -e "${BLUE}📤 Pushing images to registry...${NC}"
    
    docker push "${REGISTRY}/bellyfed-web:${TAG}"
    docker push "${REGISTRY}/bellyfed-backend:${TAG}"
    docker push "${REGISTRY}/bellyfed-docs:${TAG}"
    
    if [ "$TAG" != "latest" ]; then
        docker push "${REGISTRY}/bellyfed-web:latest"
        docker push "${REGISTRY}/bellyfed-backend:latest"
        docker push "${REGISTRY}/bellyfed-docs:latest"
    fi
    
    echo -e "${GREEN}✅ Images pushed to registry${NC}"
fi

# Optional: Clean up dangling images
if [ "$CLEANUP_DANGLING" = "true" ]; then
    echo -e "${YELLOW}🧹 Cleaning up dangling images...${NC}"
    docker image prune -f
    echo -e "${GREEN}✅ Cleanup completed${NC}"
fi

echo -e "${GREEN}🚀 Docker build process completed successfully!${NC}"
