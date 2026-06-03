#!/bin/bash

# Kubernetes Deployment Script for Workout Planner
# This script automates the deployment process to Kubernetes

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RELEASE_NAME="${1:-workout-planner}"
NAMESPACE="${2:-workout-planner}"
ENVIRONMENT="${3:-dev}"
CHART_PATH="./chart"

# Functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    print_info "Checking prerequisites..."
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command -v helm &> /dev/null; then
        print_error "helm is not installed"
        exit 1
    fi
    
    print_info "Prerequisites check passed"
}

verify_cluster_connection() {
    print_info "Verifying Kubernetes cluster connection..."
    
    if ! kubectl cluster-info &> /dev/null; then
        print_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    CLUSTER_NAME=$(kubectl config current-context)
    print_info "Connected to cluster: $CLUSTER_NAME"
}

create_namespace() {
    print_info "Creating namespace: $NAMESPACE"
    
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -
    print_info "Namespace created"
}

validate_chart() {
    print_info "Validating Helm chart..."
    
    if ! helm lint "$CHART_PATH"; then
        print_error "Helm chart validation failed"
        exit 1
    fi
    
    print_info "Helm chart validation passed"
}

select_values_file() {
    case "$ENVIRONMENT" in
        dev)
            echo "$CHART_PATH/values-dev.yaml"
            ;;
        prod)
            echo "$CHART_PATH/values.yaml"
            ;;
        *)
            print_error "Unknown environment: $ENVIRONMENT"
            exit 1
            ;;
    esac
}

deploy() {
    local values_file=$(select_values_file)
    
    print_info "Deploying to $ENVIRONMENT environment using values file: $values_file"
    
    if helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
        print_warn "Release $RELEASE_NAME already exists, upgrading..."
        helm upgrade "$RELEASE_NAME" "$CHART_PATH" \
            -n "$NAMESPACE" \
            -f "$values_file"
    else
        print_info "Installing release $RELEASE_NAME..."
        helm install "$RELEASE_NAME" "$CHART_PATH" \
            -n "$NAMESPACE" \
            -f "$values_file"
    fi
    
    print_info "Deployment completed"
}

wait_for_rollout() {
    print_info "Waiting for rollout to complete..."
    
    local max_attempts=60
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if kubectl rollout status deployment/workout-planner-backend -n "$NAMESPACE" 2>/dev/null && \
           kubectl rollout status deployment/workout-planner-frontend -n "$NAMESPACE" 2>/dev/null; then
            print_info "Rollout completed successfully"
            return 0
        fi
        
        print_info "Waiting for rollout... ($attempt/$max_attempts)"
        sleep 5
        attempt=$((attempt + 1))
    done
    
    print_warn "Rollout did not complete within expected time"
    return 1
}

show_status() {
    print_info "Deployment Status:"
    echo ""
    print_info "Pods:"
    kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=workout-planner
    echo ""
    print_info "Services:"
    kubectl get svc -n "$NAMESPACE" -l app.kubernetes.io/name=workout-planner
    echo ""
    print_info "Deployments:"
    kubectl get deployments -n "$NAMESPACE" -l app.kubernetes.io/name=workout-planner
}

print_next_steps() {
    echo ""
    print_info "Deployment successful!"
    echo ""
    echo "Next steps:"
    echo ""
    
    local frontend_service=$(kubectl get svc -n "$NAMESPACE" workout-planner-frontend -o jsonpath='{.spec.type}' 2>/dev/null)
    
    if [ "$frontend_service" == "LoadBalancer" ]; then
        echo "  Frontend is exposed via LoadBalancer. Get the external IP:"
        echo "    kubectl get svc -n $NAMESPACE workout-planner-frontend"
    else
        echo "  Access frontend via port forwarding:"
        echo "    kubectl port-forward -n $NAMESPACE svc/workout-planner-frontend 3000:80"
        echo "    Open http://localhost:3000"
    fi
    
    echo ""
    echo "  Access backend API via port forwarding:"
    echo "    kubectl port-forward -n $NAMESPACE svc/workout-planner-backend 8080:8080"
    echo "    Open http://localhost:8080/api/health"
    echo ""
    echo "  View logs:"
    echo "    kubectl logs -n $NAMESPACE -l component=backend -f"
    echo "    kubectl logs -n $NAMESPACE -l component=frontend -f"
    echo ""
    echo "  Helm release info:"
    echo "    helm status $RELEASE_NAME -n $NAMESPACE"
    echo "    helm get values $RELEASE_NAME -n $NAMESPACE"
    echo ""
}

# Main execution
main() {
    echo "=================================="
    echo "Workout Planner Kubernetes Deploy"
    echo "=================================="
    echo "Release: $RELEASE_NAME"
    echo "Namespace: $NAMESPACE"
    echo "Environment: $ENVIRONMENT"
    echo ""
    
    check_prerequisites
    verify_cluster_connection
    create_namespace
    validate_chart
    deploy
    wait_for_rollout
    show_status
    print_next_steps
}

# Run main function
main
