#!/bin/bash

# Build and Push Docker Images Script for Workout Planner
# This script builds Docker images and pushes them to a registry

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="${1:-docker.io}"
USERNAME="${2:-}"
TAG="${3:-latest}"
BUILD_BACKEND="${4:-true}"
BUILD_FRONTEND="${5:-true}"

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker ps &> /dev/null; then
        print_error "Cannot connect to Docker daemon"
        exit 1
    fi
    
    print_info "Docker is available"
}

build_backend() {
    if [ "$BUILD_BACKEND" != "true" ]; then
        return
    fi
    
    print_info "Building backend image..."
    
    local image_name="$REGISTRY/$USERNAME/workout-planner-backend:$TAG"
    docker build -f docker/Dockerfile.backend -t "$image_name" .
    
    print_info "Backend image built: $image_name"
    echo "$image_name"
}

build_frontend() {
    if [ "$BUILD_FRONTEND" != "true" ]; then
        return
    fi
    
    print_info "Building frontend image..."
    
    local image_name="$REGISTRY/$USERNAME/workout-planner-frontend:$TAG"
    docker build -f docker/Dockerfile.frontend -t "$image_name" .
    
    print_info "Frontend image built: $image_name"
    echo "$image_name"
}

push_image() {
    local image="$1"
    
    print_info "Pushing image: $image"
    docker push "$image"
    print_info "Image pushed successfully"
}

main() {
    if [ -z "$USERNAME" ]; then
        print_error "Username is required"
        print_error "Usage: $0 <registry> <username> [tag] [build_backend] [build_frontend]"
        exit 1
    fi
    
    echo "=================================="
    echo "Workout Planner Docker Build"
    echo "=================================="
    echo "Registry: $REGISTRY"
    echo "Username: $USERNAME"
    echo "Tag: $TAG"
    echo ""
    
    check_docker
    echo ""
    
    if [ "$BUILD_BACKEND" == "true" ]; then
        backend_image=$(build_backend)
        echo ""
        push_image "$backend_image"
        echo ""
    fi
    
    if [ "$BUILD_FRONTEND" == "true" ]; then
        frontend_image=$(build_frontend)
        echo ""
        push_image "$frontend_image"
        echo ""
    fi
    
    print_info "Build and push completed!"
    print_info "Update your values.yaml with the new image tags"
}

# Run main function
main
