# Scripts Directory

This directory contains utility scripts for deploying and managing the Workout Planner application.

## Available Scripts

### deploy.sh
Deploys the Workout Planner application to a Kubernetes cluster using Helm.

**Usage:**
```bash
./scripts/deploy.sh [release-name] [namespace] [environment]
```

**Parameters:**
- `release-name`: Helm release name (default: `workout-planner`)
- `namespace`: Kubernetes namespace (default: `workout-planner`)
- `environment`: Environment type: `dev` or `prod` (default: `dev`)

**Examples:**
```bash
# Deploy to development
./scripts/deploy.sh

# Deploy to production
./scripts/deploy.sh workout-planner workout-planner prod

# Deploy with custom release name
./scripts/deploy.sh my-release my-namespace dev
```

### undeploy.sh
Uninstalls the Workout Planner application from a Kubernetes cluster.

**Usage:**
```bash
./scripts/undeploy.sh [release-name] [namespace] [delete-namespace]
```

**Parameters:**
- `release-name`: Helm release name to uninstall (default: `workout-planner`)
- `namespace`: Kubernetes namespace (default: `workout-planner`)
- `delete-namespace`: Whether to delete the namespace (default: `false`)

**Examples:**
```bash
# Uninstall keeping namespace
./scripts/undeploy.sh

# Uninstall and delete namespace
./scripts/undeploy.sh workout-planner workout-planner true
```

### build-images.sh
Builds Docker images and pushes them to a container registry.

**Usage:**
```bash
./scripts/build-images.sh <registry> <username> [tag] [build-backend] [build-frontend]
```

**Parameters:**
- `registry`: Container registry (e.g., `docker.io`, `gcr.io`)
- `username`: Registry username or organization
- `tag`: Image tag (default: `latest`)
- `build-backend`: Build backend image (default: `true`)
- `build-frontend`: Build frontend image (default: `true`)

**Examples:**
```bash
# Build and push both images to Docker Hub
./scripts/build-images.sh docker.io yourusername v1.0.0

# Build and push to Google Container Registry
./scripts/build-images.sh gcr.io my-project-id yourusername v1.0.0

# Build backend only
./scripts/build-images.sh docker.io yourusername v1.0.0 true false
```

## Making Scripts Executable

Before running the scripts, make them executable:

```bash
chmod +x scripts/*.sh
```

## Prerequisites

- **kubectl**: Kubernetes CLI
- **helm**: Helm 3.0+
- **docker**: Docker CLI (for build-images.sh)

## Quick Start

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Build and push images
./scripts/build-images.sh docker.io yourusername v1.0.0

# 3. Update chart values with your image references
# Edit chart/values.yaml

# 4. Deploy to Kubernetes
./scripts/deploy.sh workout-planner workout-planner dev

# 5. Check deployment status
kubectl get pods -n workout-planner
```

## Troubleshooting

### Docker authentication issues
```bash
# Login to registry first
docker login docker.io
# or for Google Container Registry
gcloud auth configure-docker gcr.io
```

### Kubernetes connection issues
```bash
# Check cluster connection
kubectl cluster-info

# Set context if multiple clusters exist
kubectl config use-context <context-name>
```

### Helm issues
```bash
# Lint chart before deploying
helm lint ./chart

# Preview manifest
helm template workout-planner ./chart
```

## Environment Variables

The scripts support the following environment variables for non-interactive usage:

```bash
# For deploy.sh
export RELEASE_NAME=workout-planner
export NAMESPACE=workout-planner
export ENVIRONMENT=dev

# For undeploy.sh
export RELEASE_NAME=workout-planner
export NAMESPACE=workout-planner
export DELETE_NAMESPACE=false

# For build-images.sh
export REGISTRY=docker.io
export USERNAME=yourusername
export IMAGE_TAG=v1.0.0
```

## Advanced Usage

### Deploying to multiple environments

```bash
# Production
./scripts/deploy.sh workout-planner-prod workout-planner-prod prod

# Staging
./scripts/deploy.sh workout-planner-staging workout-planner-staging dev

# Development
./scripts/deploy.sh workout-planner-dev workout-planner-dev dev
```

### Rolling updates

```bash
# Rebuild and push new images
./scripts/build-images.sh docker.io yourusername v1.0.1

# Update values.yaml with new tag
# Then deploy
./scripts/deploy.sh workout-planner workout-planner prod
```

### Clean uninstall

```bash
# Remove application and namespace
./scripts/undeploy.sh workout-planner workout-planner true

# Verify cleanup
kubectl get namespaces | grep workout-planner
```

## Support

For issues or questions about the scripts, refer to:
- [Kubernetes Deployment Guide](../docs/KUBERNETES.md)
- [Helm Chart README](../chart/README.md)
- [Main README](../README.md)
