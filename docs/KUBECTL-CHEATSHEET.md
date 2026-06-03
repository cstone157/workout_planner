# Kubernetes Quick Reference

Common kubectl and Helm commands for managing the Workout Planner deployment.

## Deployment Management

### Deploy
```bash
# Deploy to development
helm install workout-planner ./chart -f chart/values-dev.yaml

# Deploy to production
helm install workout-planner ./chart -f chart/values.yaml

# Upgrade deployment
helm upgrade workout-planner ./chart -f chart/values.yaml
```

### Uninstall
```bash
helm uninstall workout-planner
```

### Check Status
```bash
# Get Helm release status
helm status workout-planner

# Get release history
helm history workout-planner

# Rollback to previous version
helm rollback workout-planner 1
```

## Pod Management

### Get Information
```bash
# List all pods
kubectl get pods -n workout-planner

# List with more details
kubectl get pods -n workout-planner -o wide

# Show pod labels
kubectl get pods -n workout-planner --show-labels

# Describe a specific pod
kubectl describe pod <pod-name> -n workout-planner
```

### View Logs
```bash
# View logs from a pod
kubectl logs <pod-name> -n workout-planner

# Follow logs (like tail -f)
kubectl logs <pod-name> -n workout-planner -f

# View logs from all pods with label
kubectl logs -n workout-planner -l component=backend -f

# View previous pod logs (if pod crashed)
kubectl logs <pod-name> -n workout-planner --previous
```

### Port Forwarding
```bash
# Forward backend API
kubectl port-forward -n workout-planner svc/workout-planner-backend 8080:8080

# Forward frontend
kubectl port-forward -n workout-planner svc/workout-planner-frontend 3000:80

# Forward MongoDB
kubectl port-forward -n workout-planner svc/workout-planner-mongodb 27017:27017
```

### Execute Commands in Pod
```bash
# Open interactive shell
kubectl exec -it <pod-name> -n workout-planner -- /bin/bash

# Run single command
kubectl exec <pod-name> -n workout-planner -- curl http://localhost:8080/api/health
```

## Service Management

### List Services
```bash
# List all services
kubectl get svc -n workout-planner

# Show service details
kubectl get svc -n workout-planner -o wide

# Describe a service
kubectl describe svc <service-name> -n workout-planner
```

### Get Service IP/URL
```bash
# Get LoadBalancer external IP
kubectl get svc -n workout-planner workout-planner-frontend -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

# Get NodePort port
kubectl get svc -n workout-planner workout-planner-frontend -o jsonpath='{.spec.ports[0].nodePort}'

# Watch for external IP (LoadBalancer)
kubectl get svc -n workout-planner -w
```

## Scaling

### Manual Scaling
```bash
# Scale deployment
kubectl scale deployment <deployment-name> -n workout-planner --replicas=5

# Scale MongoDB
kubectl scale statefulset <statefulset-name> -n workout-planner --replicas=3
```

### Autoscaling Status
```bash
# Check HPA status
kubectl get hpa -n workout-planner

# Describe HPA
kubectl describe hpa <hpa-name> -n workout-planner

# Watch HPA
kubectl get hpa -n workout-planner -w
```

## Resource Monitoring

### View Resource Usage
```bash
# Pod resource usage
kubectl top pods -n workout-planner

# Node resource usage
kubectl top nodes

# Continuous monitoring
kubectl top pods -n workout-planner --watch
```

### Get Resource Requests/Limits
```bash
# Show container resources
kubectl get pods -n workout-planner -o json | jq '.items[] | {name: .metadata.name, resources: .spec.containers[].resources}'
```

## Events & Troubleshooting

### View Events
```bash
# Get all events
kubectl get events -n workout-planner

# Sort by timestamp
kubectl get events -n workout-planner --sort-by='.lastTimestamp'

# Watch events
kubectl get events -n workout-planner -w
```

### Pod Status Troubleshooting
```bash
# Check pod status details
kubectl describe pod <pod-name> -n workout-planner

# Check for image pull errors
kubectl get pod <pod-name> -n workout-planner -o jsonpath='{.status.containerStatuses[*].state}'

# Check resource constraints
kubectl describe nodes

# Check persistent volume status
kubectl get pvc -n workout-planner
```

## Configuration Management

### View Configuration
```bash
# Get Helm values
helm get values workout-planner

# Get Helm manifest
helm get manifest workout-planner

# Show template output
helm template workout-planner ./chart
```

### Secrets & ConfigMaps
```bash
# List secrets
kubectl get secrets -n workout-planner

# Get secret value (base64 encoded)
kubectl get secret <secret-name> -n workout-planner -o jsonpath='{.data}'

# List ConfigMaps
kubectl get configmap -n workout-planner

# Describe ConfigMap
kubectl describe configmap <configmap-name> -n workout-planner
```

## Updates & Rollbacks

### Update Image
```bash
# Update backend image
kubectl set image deployment/workout-planner-backend \
  backend=myregistry/backend:v1.0.1 \
  -n workout-planner

# Verify rollout
kubectl rollout status deployment/workout-planner-backend -n workout-planner

# View rollout history
kubectl rollout history deployment/workout-planner-backend -n workout-planner

# Rollback to previous version
kubectl rollout undo deployment/workout-planner-backend -n workout-planner

# Rollback to specific revision
kubectl rollout undo deployment/workout-planner-backend -n workout-planner --to-revision=2
```

## Namespace & Cleanup

### Namespace Operations
```bash
# Create namespace
kubectl create namespace workout-planner

# List namespaces
kubectl get namespaces

# Delete namespace (deletes all resources)
kubectl delete namespace workout-planner
```

### Resource Cleanup
```bash
# Delete a pod
kubectl delete pod <pod-name> -n workout-planner

# Delete deployment
kubectl delete deployment <deployment-name> -n workout-planner

# Delete all resources with label
kubectl delete all -l app.kubernetes.io/name=workout-planner -n workout-planner

# Delete persistent volumes
kubectl delete pvc --all -n workout-planner
```

## Useful Aliases

Add these to your `.bashrc` or `.zshrc` for convenience:

```bash
# Kubernetes shortcuts
alias k=kubectl
alias kgp='kubectl get pods'
alias kgn='kubectl get nodes'
alias kgs='kubectl get svc'
alias kdesc='kubectl describe'
alias klogs='kubectl logs'
alias kex='kubectl exec -it'
alias kpf='kubectl port-forward'

# Workout Planner specific
alias wk-logs-backend='kubectl logs -n workout-planner -l component=backend -f'
alias wk-logs-frontend='kubectl logs -n workout-planner -l component=frontend -f'
alias wk-logs-db='kubectl logs -n workout-planner -l component=mongodb -f'
```

## Helm Useful Commands

```bash
# Validate chart
helm lint ./chart

# Dry run (preview without installing)
helm install workout-planner ./chart --dry-run --debug

# Get Helm values with defaults
helm get values workout-planner -a

# Search for chart updates
helm search repo <chart-name>

# Package chart for distribution
helm package ./chart
```

## Common Workflows

### Deploy New Version
```bash
# 1. Build and push images
./scripts/build-images.sh docker.io username v1.0.1

# 2. Update Helm values or use command-line overrides
helm upgrade workout-planner ./chart \
  --set backend.image.tag=v1.0.1 \
  --set frontend.image.tag=v1.0.1

# 3. Verify rollout
kubectl rollout status deployment/workout-planner-backend -n workout-planner
kubectl rollout status deployment/workout-planner-frontend -n workout-planner
```

### Backup Database
```bash
# Port forward MongoDB
kubectl port-forward -n workout-planner svc/workout-planner-mongodb 27017:27017 &

# Dump database
mongodump --uri "mongodb://admin:password@localhost:27017/workout_planner" --out ./backup

# Kill port forward
kill %1
```

### Restore Database
```bash
# Port forward MongoDB
kubectl port-forward -n workout-planner svc/workout-planner-mongodb 27017:27017 &

# Restore database
mongorestore --uri "mongodb://admin:password@localhost:27017" ./backup

# Kill port forward
kill %1
```

## Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm Documentation](https://helm.sh/docs/)
- [Workout Planner Kubernetes Guide](KUBERNETES.md)
