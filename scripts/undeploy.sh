#!/bin/bash

# Kubernetes Uninstall Script for Workout Planner
# This script removes the deployment from Kubernetes

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RELEASE_NAME="${1:-workout-planner}"
NAMESPACE="${2:-workout-planner}"
DELETE_NAMESPACE="${3:-false}"

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

confirm_deletion() {
    print_warn "This will delete the release '$RELEASE_NAME' from namespace '$NAMESPACE'"
    if [ "$DELETE_NAMESPACE" == "true" ]; then
        print_warn "The namespace '$NAMESPACE' will also be deleted"
    fi
    print_warn "This action cannot be undone!"
    
    read -p "Are you sure? (yes/no): " response
    if [ "$response" != "yes" ]; then
        print_info "Uninstall cancelled"
        exit 0
    fi
}

uninstall() {
    print_info "Uninstalling Helm release: $RELEASE_NAME"
    
    if helm list -n "$NAMESPACE" | grep -q "$RELEASE_NAME"; then
        helm uninstall "$RELEASE_NAME" -n "$NAMESPACE"
        print_info "Helm release uninstalled"
    else
        print_warn "Release $RELEASE_NAME not found in namespace $NAMESPACE"
    fi
}

cleanup_pvcs() {
    print_info "Cleaning up PersistentVolumeClaims..."
    
    kubectl delete pvc -n "$NAMESPACE" --all --ignore-not-found=true
    print_info "PersistentVolumeClaims deleted"
}

delete_namespace() {
    if [ "$DELETE_NAMESPACE" == "true" ]; then
        print_info "Deleting namespace: $NAMESPACE"
        kubectl delete namespace "$NAMESPACE" --ignore-not-found=true
        print_info "Namespace deleted"
    else
        print_info "Namespace '$NAMESPACE' preserved (use '--delete-namespace' to remove it)"
    fi
}

show_remaining_resources() {
    print_info "Remaining resources in namespace '$NAMESPACE':"
    
    if kubectl get namespace "$NAMESPACE" &> /dev/null 2>&1; then
        kubectl get all -n "$NAMESPACE" 2>/dev/null || print_info "No resources found"
    else
        print_info "Namespace no longer exists"
    fi
}

# Main execution
main() {
    echo "========================================"
    echo "Workout Planner Kubernetes Uninstall"
    echo "========================================"
    echo "Release: $RELEASE_NAME"
    echo "Namespace: $NAMESPACE"
    echo ""
    
    confirm_deletion
    echo ""
    
    uninstall
    cleanup_pvcs
    delete_namespace
    
    echo ""
    show_remaining_resources
    print_info "Uninstall completed"
}

# Run main function
main
