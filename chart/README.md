# Workout Planner - Helm Chart

This directory contains the Helm chart for deploying the Workout Planner application to a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Docker images for frontend and backend built and pushed to a container registry

## Quick Start

### 1. Build and Push Docker Images

```bash
# Build backend image
docker build -f docker/Dockerfile.backend -t your-registry/workout-planner-backend:latest .
docker push your-registry/workout-planner-backend:latest

# Build frontend image
docker build -f docker/Dockerfile.frontend -t your-registry/workout-planner-frontend:latest .
docker push your-registry/workout-planner-frontend:latest
```

### 2. Update values.yaml

Edit `chart/values.yaml` to set your image repository and configure your deployment:

```yaml
backend:
  image:
    repository: your-registry/workout-planner-backend
    tag: latest

frontend:
  image:
    repository: your-registry/workout-planner-frontend
    tag: latest
```

Also update critical secrets:
```yaml
secrets:
  jwtSecret: "your-secure-random-secret"
  mongodbRoot:
    username: admin
    password: "your-secure-password"
```

### 3. Install the Chart

```bash
# Development environment
helm install workout-planner ./chart -f chart/values-dev.yaml

# Production environment
helm install workout-planner ./chart -f chart/values.yaml
```

### 4. Verify Installation

```bash
# Check deployment status
kubectl get deployments -n workout-planner
kubectl get pods -n workout-planner
kubectl get svc -n workout-planner

# View logs
kubectl logs -n workout-planner -l app.kubernetes.io/name=workout-planner
```

## Configuration

### values.yaml Structure

The chart is highly configurable through `values.yaml`:

- **mongodb**: MongoDB StatefulSet configuration
  - `auth`: Credentials and database settings
  - `persistence`: Storage configuration
  - `replicas`: Number of MongoDB instances
  - `resources`: CPU and memory requests/limits

- **backend**: Rust backend deployment
  - `replicaCount`: Number of pod replicas
  - `image`: Docker image settings
  - `service`: Service type and ports
  - `autoscaling`: HPA configuration
  - `resources`: CPU and memory limits
  - `env`: Environment variables

- **frontend**: Svelte frontend deployment
  - `replicaCount`: Number of pod replicas
  - `image`: Docker image settings
  - `service`: Service type and ports
  - `autoscaling`: HPA configuration
  - `resources`: CPU and memory limits

- **ingress**: Optional Ingress configuration for both frontend and backend

### Common Configuration Tasks

#### Enable Ingress

```bash
helm install workout-planner ./chart \
  --set frontend.ingress.enabled=true \
  --set frontend.ingress.hosts[0].host="example.com" \
  --set backend.ingress.enabled=true \
  --set backend.ingress.hosts[0].host="api.example.com"
```

#### Configure Resource Limits

```bash
helm install workout-planner ./chart \
  --set backend.resources.limits.memory="512Mi" \
  --set backend.resources.limits.cpu="500m" \
  --set frontend.resources.limits.memory="256Mi" \
  --set frontend.resources.limits.cpu="200m"
```

#### Enable Autoscaling

```bash
helm install workout-planner ./chart \
  --set backend.autoscaling.enabled=true \
  --set backend.autoscaling.minReplicas=3 \
  --set backend.autoscaling.maxReplicas=10 \
  --set frontend.autoscaling.enabled=true \
  --set frontend.autoscaling.minReplicas=3 \
  --set frontend.autoscaling.maxReplicas=10
```

#### Set MongoDB Replicas

```bash
helm install workout-planner ./chart \
  --set mongodb.replicas=3 \
  --set mongodb.persistence.size="20Gi"
```

## Upgrading the Release

```bash
# Upgrade with new values
helm upgrade workout-planner ./chart -f chart/values.yaml

# Upgrade with specific options
helm upgrade workout-planner ./chart \
  --set backend.image.tag="v1.0.0" \
  --set frontend.image.tag="v1.0.0"
```

## Uninstalling the Chart

```bash
helm uninstall workout-planner

# Note: PVCs and Secrets are not deleted automatically
# To clean up all resources including data:
kubectl delete pvc -n workout-planner --all
kubectl delete secret -n workout-planner --all
kubectl delete namespace workout-planner
```

## Environment-Specific Deployments

### Development

```bash
helm install workout-planner ./chart -f chart/values-dev.yaml
```

The development profile includes:
- Single replica for each component
- Debug logging enabled
- NodePort service for frontend
- Minimal resource requests
- No autoscaling

### Staging/Production

```bash
helm install workout-planner ./chart -f chart/values.yaml
```

The production profile includes:
- Multiple replicas for high availability
- LoadBalancer service for frontend
- Production logging level
- Appropriate resource limits
- Autoscaling enabled
- Pod Disruption Budgets

## Monitoring and Debugging

### View Chart Values

```bash
helm get values workout-planner
```

### View Generated Manifests

```bash
helm template workout-planner ./chart
helm template workout-planner ./chart -f chart/values-dev.yaml
```

### Check Pod Status

```bash
kubectl get pods -n workout-planner -o wide
kubectl describe pod <pod-name> -n workout-planner
```

### View Logs

```bash
# Backend logs
kubectl logs -n workout-planner -l component=backend --tail=100 -f

# Frontend logs
kubectl logs -n workout-planner -l component=frontend --tail=100 -f

# MongoDB logs
kubectl logs -n workout-planner -l component=mongodb --tail=100 -f
```

### Access Services

```bash
# Port forward to backend
kubectl port-forward -n workout-planner svc/workout-planner-backend 8080:8080

# Port forward to frontend
kubectl port-forward -n workout-planner svc/workout-planner-frontend 3000:3000

# Port forward to MongoDB
kubectl port-forward -n workout-planner svc/workout-planner-mongodb 27017:27017
```

## Security Considerations

1. **Change Default Secrets**: Always update `jwtSecret` and MongoDB passwords before production deployment
2. **Use Private Registry**: Push images to a private container registry
3. **ImagePullSecrets**: If using private registry, create and reference pull secrets
4. **Network Policy**: Uncomment and configure Network Policies for network segmentation
5. **RBAC**: Consider implementing additional RBAC rules
6. **TLS/HTTPS**: Enable Ingress TLS for secure communication

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n workout-planner

# Check image availability
kubectl get pod <pod-name> -n workout-planner -o jsonpath='{.status.containerStatuses[*].imageID}'
```

### Database Connection Issues

```bash
# Verify MongoDB is running
kubectl get pods -n workout-planner -l component=mongodb

# Test MongoDB connection
kubectl exec -it <mongodb-pod> -n workout-planner -- mongosh -u admin -p <password>
```

### Service Connection Issues

```bash
# Test backend from frontend pod
kubectl exec -it <frontend-pod> -n workout-planner -- wget -O - http://workout-planner-backend:8080/api/health

# Test DNS resolution
kubectl exec -it <pod> -n workout-planner -- nslookup workout-planner-mongodb
```

## Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [MongoDB Kubernetes](https://www.mongodb.com/docs/kubernetes-operator/stable/)

## Support

For issues or questions about the chart, please visit the [GitHub repository](https://github.com/yourusername/workout-planner).
