# Kubernetes & Helm Deployment Guide

This guide covers deploying Workout Planner to Kubernetes using Helm.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Building Container Images](#building-container-images)
3. [Setting Up Kubernetes Cluster](#setting-up-kubernetes-cluster)
4. [Deploying with Helm](#deploying-with-helm)
5. [Accessing the Application](#accessing-the-application)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Production Considerations](#production-considerations)

## Prerequisites

### Required Software

- **kubectl**: Kubernetes command-line tool (v1.19+)
  ```bash
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x kubectl
  sudo mv kubectl /usr/local/bin/
  ```

- **Helm**: Package manager for Kubernetes (v3.0+)
  ```bash
  curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
  ```

- **Docker**: For building container images (optional if using pre-built images)
  ```bash
  # Ubuntu/Debian
  sudo apt-get install docker.io
  
  # macOS
  brew install docker
  ```

### Kubernetes Cluster Options

Choose one of the following:

1. **Local Development**: Minikube, Docker Desktop, Kind
2. **Managed Services**: 
   - AWS EKS (Elastic Kubernetes Service)
   - Google GKE (Google Kubernetes Engine)
   - Azure AKS (Azure Kubernetes Service)
   - DigitalOcean Kubernetes
3. **Self-Hosted**: kubeadm, Rancher, OpenShift

## Building Container Images

### Option 1: Build Locally

```bash
# Build backend image
docker build -f docker/Dockerfile.backend -t workout-planner-backend:v1.0.0 .

# Build frontend image
docker build -f docker/Dockerfile.frontend -t workout-planner-frontend:v1.0.0 .
```

### Option 2: Push to Container Registry

#### Docker Hub

```bash
# Tag images
docker tag workout-planner-backend:v1.0.0 yourusername/workout-planner-backend:v1.0.0
docker tag workout-planner-frontend:v1.0.0 yourusername/workout-planner-frontend:v1.0.0

# Push images
docker push yourusername/workout-planner-backend:v1.0.0
docker push yourusername/workout-planner-frontend:v1.0.0
```

#### AWS ECR

```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

# Tag images
docker tag workout-planner-backend:v1.0.0 123456789.dkr.ecr.us-east-1.amazonaws.com/workout-planner-backend:v1.0.0
docker tag workout-planner-frontend:v1.0.0 123456789.dkr.ecr.us-east-1.amazonaws.com/workout-planner-frontend:v1.0.0

# Push images
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/workout-planner-backend:v1.0.0
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/workout-planner-frontend:v1.0.0
```

#### Google Artifact Registry

```bash
# Authenticate
gcloud auth configure-docker us-central1-docker.pkg.dev

# Tag images
docker tag workout-planner-backend:v1.0.0 us-central1-docker.pkg.dev/your-project/workout-planner/backend:v1.0.0
docker tag workout-planner-frontend:v1.0.0 us-central1-docker.pkg.dev/your-project/workout-planner/frontend:v1.0.0

# Push images
docker push us-central1-docker.pkg.dev/your-project/workout-planner/backend:v1.0.0
docker push us-central1-docker.pkg.dev/your-project/workout-planner/frontend:v1.0.0
```

## Setting Up Kubernetes Cluster

### Local Development with Minikube

```bash
# Install Minikube
curl -LO https://github.com/kubernetes/minikube/releases/latest/download/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Start cluster
minikube start --cpus 4 --memory 8192

# Enable ingress addon (optional)
minikube addons enable ingress

# Set docker environment to use Minikube's Docker daemon
eval $(minikube docker-env)

# Build images inside Minikube
docker build -f docker/Dockerfile.backend -t workout-planner-backend:v1.0.0 .
docker build -f docker/Dockerfile.frontend -t workout-planner-frontend:v1.0.0 .
```

### AWS EKS Cluster

```bash
# Create cluster using eksctl
eksctl create cluster --name workout-planner --region us-east-1 --nodegroup-name standard --node-type t3.medium --nodes 3

# Update kubeconfig
aws eks update-kubeconfig --region us-east-1 --name workout-planner

# Verify connection
kubectl get nodes
```

### Google GKE Cluster

```bash
# Create cluster
gcloud container clusters create workout-planner --zone us-central1-a --num-nodes 3 --machine-type n1-standard-2

# Get credentials
gcloud container clusters get-credentials workout-planner --zone us-central1-a

# Verify connection
kubectl get nodes
```

### Azure AKS Cluster

```bash
# Create resource group
az group create --name workout-planner-rg --location eastus

# Create AKS cluster
az aks create --resource-group workout-planner-rg --name workout-planner --node-count 3 --vm-set-type VirtualMachineScaleSets --load-balancer-sku standard

# Get credentials
az aks get-credentials --resource-group workout-planner-rg --name workout-planner

# Verify connection
kubectl get nodes
```

## Deploying with Helm

### 1. Verify Kubernetes Connection

```bash
kubectl cluster-info
kubectl get nodes
kubectl get namespaces
```

### 2. Update Helm Chart Values

Edit `chart/values.yaml` with your configuration:

```yaml
backend:
  image:
    repository: yourusername/workout-planner-backend
    tag: v1.0.0
    pullPolicy: IfNotPresent

frontend:
  image:
    repository: yourusername/workout-planner-frontend
    tag: v1.0.0
    pullPolicy: IfNotPresent

secrets:
  jwtSecret: "your-very-secure-random-secret-key-here"
  mongodbRoot:
    username: admin
    password: "your-secure-mongodb-password"
```

### 3. Create Private Registry Secret (if needed)

```bash
kubectl create secret docker-registry regcred \
  --docker-server=docker.io \
  --docker-username=yourusername \
  --docker-password=yourtoken \
  --docker-email=your.email@example.com \
  -n workout-planner
```

### 4. Deploy to Development Environment

```bash
# Install chart
helm install workout-planner ./chart -f chart/values-dev.yaml

# Verify installation
helm status workout-planner
kubectl get pods -n workout-planner
kubectl get svc -n workout-planner
```

### 5. Deploy to Production Environment

```bash
# Install chart
helm install workout-planner ./chart -f chart/values.yaml \
  --set backend.image.tag=v1.0.0 \
  --set frontend.image.tag=v1.0.0 \
  --set secrets.jwtSecret="your-production-secret" \
  --set secrets.mongodbRoot.password="your-production-password"

# Wait for rollout
kubectl rollout status deployment/workout-planner-backend -n workout-planner
kubectl rollout status deployment/workout-planner-frontend -n workout-planner

# Verify all resources
kubectl get all -n workout-planner
```

## Accessing the Application

### Via Port Forwarding

```bash
# Frontend
kubectl port-forward -n workout-planner svc/workout-planner-frontend 3000:80
# Access at http://localhost:3000

# Backend API
kubectl port-forward -n workout-planner svc/workout-planner-backend 8080:8080
# Access at http://localhost:8080/api/health
```

### Via LoadBalancer Service

```bash
# Get external IP
kubectl get svc -n workout-planner workout-planner-frontend

# Wait for EXTERNAL-IP to be assigned (may take a few minutes)
kubectl get svc -n workout-planner workout-planner-frontend -w
```

### Via Ingress

Enable and configure ingress in values.yaml:

```yaml
frontend:
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: app.example.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: workout-planner-tls
        hosts:
          - app.example.com

backend:
  ingress:
    enabled: true
    className: nginx
    hosts:
      - host: api.example.com
        paths:
          - path: /
            pathType: Prefix
    tls:
      - secretName: workout-planner-api-tls
        hosts:
          - api.example.com
```

Then install with ingress enabled:

```bash
helm install workout-planner ./chart -f chart/values.yaml --set frontend.ingress.enabled=true --set backend.ingress.enabled=true
```

## Monitoring & Maintenance

### View Application Logs

```bash
# All logs
kubectl logs -n workout-planner -l app.kubernetes.io/name=workout-planner --tail=100 -f

# Backend logs
kubectl logs -n workout-planner -l component=backend --tail=100 -f

# Frontend logs
kubectl logs -n workout-planner -l component=frontend --tail=100 -f

# MongoDB logs
kubectl logs -n workout-planner -l component=mongodb --tail=100 -f
```

### Check Pod Status

```bash
# Detailed pod info
kubectl describe pod <pod-name> -n workout-planner

# Pod events
kubectl get events -n workout-planner --sort-by='.lastTimestamp'

# Pod usage stats
kubectl top nodes
kubectl top pods -n workout-planner
```

### Scaling Deployments

```bash
# Scale backend manually
kubectl scale deployment workout-planner-backend -n workout-planner --replicas=5

# Scale frontend manually
kubectl scale deployment workout-planner-frontend -n workout-planner --replicas=5
```

### Updating Application

```bash
# Update image version
helm upgrade workout-planner ./chart \
  --set backend.image.tag=v1.0.1 \
  --set frontend.image.tag=v1.0.1 \
  -f chart/values.yaml

# Rollback to previous release
helm rollback workout-planner
```

### Backup and Restore

#### Backup MongoDB Data

```bash
# Port forward MongoDB
kubectl port-forward -n workout-planner svc/workout-planner-mongodb 27017:27017 &

# Backup database
mongodump --uri "mongodb://admin:password@localhost:27017/workout_planner" --out ./backup
```

#### Restore MongoDB Data

```bash
# Port forward MongoDB
kubectl port-forward -n workout-planner svc/workout-planner-mongodb 27017:27017 &

# Restore database
mongorestore --uri "mongodb://admin:password@localhost:27017" ./backup
```

## Production Considerations

### Security Best Practices

1. **Use Private Container Registry**
   ```bash
   # Configure image pull secrets
   kubectl create secret docker-registry regcred \
     --docker-server=<registry> \
     --docker-username=<username> \
     --docker-password=<password> \
     -n workout-planner
   ```

2. **Enable RBAC and Network Policies**
   - Implement role-based access control
   - Restrict pod-to-pod communication

3. **Secure Secrets**
   - Use Kubernetes Secrets Management (e.g., HashiCorp Vault, AWS Secrets Manager)
   - Rotate credentials regularly
   - Never commit secrets to Git

4. **Enable TLS/HTTPS**
   - Use cert-manager for automatic certificate management
   - Configure ingress with TLS

### Performance Optimization

1. **Resource Limits**
   - Set appropriate CPU and memory limits
   - Monitor and adjust based on usage

2. **Horizontal Pod Autoscaling**
   - Enable HPA for automatic scaling
   - Set appropriate thresholds

3. **Database Optimization**
   - Use MongoDB replica sets for high availability
   - Configure appropriate storage class
   - Implement proper indexing

4. **Caching and CDN**
   - Use CDN for static assets
   - Implement Redis caching for API responses

### High Availability Setup

```yaml
# Recommended production configuration
mongodb:
  replicas: 3  # MongoDB replica set

backend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10

frontend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10

podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

### Monitoring Stack

Consider adding monitoring tools:

```bash
# Install Prometheus and Grafana
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring

# Install ELK Stack or similar for logging
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch -n logging
```

### Disaster Recovery

1. **Regular Backups**
   - Automate MongoDB backups
   - Store backups in external storage (S3, GCS, Azure Blob)

2. **Multi-Region Deployment**
   - Deploy to multiple regions for redundancy
   - Set up cross-region replication

3. **Disaster Recovery Testing**
   - Regularly test backup restoration
   - Document and practice RTO/RPO targets

## Troubleshooting

### Common Issues

**Pods not starting**
```bash
kubectl describe pod <pod-name> -n workout-planner
kubectl logs <pod-name> -n workout-planner
```

**Database connection fails**
```bash
# Test MongoDB connectivity
kubectl exec -it <backend-pod> -n workout-planner -- curl http://workout-planner-mongodb:27017
```

**Image pull errors**
```bash
# Verify image exists and pull secret is correct
kubectl describe pod <pod-name> -n workout-planner
```

## Next Steps

- Review the [chart README.md](../chart/README.md) for detailed chart documentation
- Set up monitoring with Prometheus and Grafana
- Implement backup and disaster recovery procedures
- Configure CI/CD pipeline for automated deployments
