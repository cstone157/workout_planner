# Production Deployment Checklist

Use this checklist when preparing to deploy Workout Planner to production.

## Pre-Deployment

### Infrastructure
- [ ] Kubernetes cluster created and accessible
- [ ] kubectl configured and connected to cluster
- [ ] Helm 3.0+ installed
- [ ] Storage classes configured for persistent volumes
- [ ] Load balancer configured (if using LoadBalancer service type)
- [ ] Network policies defined (optional but recommended)

### Container Registry
- [ ] Docker images built and tested locally
- [ ] Container registry account created (Docker Hub, ECR, GCR, etc.)
- [ ] Images pushed to private registry
- [ ] Image tags follow semantic versioning (v1.0.0)
- [ ] ImagePullSecrets created (if using private registry)

### Configuration
- [ ] Sensitive values removed from version control
- [ ] values.yaml reviewed and customized
- [ ] Environment-specific values files prepared
- [ ] DNS names configured for frontend and backend
- [ ] TLS certificates prepared (if using HTTPS)

## Security Checklist

### Secrets Management
- [ ] JWT_SECRET changed from default
- [ ] MongoDB root password changed from default
- [ ] All secrets stored in Kubernetes Secrets
- [ ] Secrets encrypted at rest (if available)
- [ ] No secrets in ConfigMaps
- [ ] No secrets in logs

### Access Control
- [ ] RBAC policies configured
- [ ] ServiceAccount created with minimal permissions
- [ ] NetworkPolicy configured (if needed)
- [ ] Firewall rules configured
- [ ] Private registry credentials stored securely

### Image Security
- [ ] Container images scanned for vulnerabilities
- [ ] Base images from trusted sources
- [ ] Image pull policy set to IfNotPresent or Never
- [ ] Image digests used instead of tags (optional)

### Network Security
- [ ] TLS/HTTPS enabled for all endpoints
- [ ] CORS properly configured
- [ ] API rate limiting configured
- [ ] DDoS protection considered

## Helm Deployment

### Chart Validation
- [ ] Chart linting passes: `helm lint ./chart`
- [ ] Dry run successful: `helm install --dry-run`
- [ ] Template variables correct
- [ ] All required values set
- [ ] Resource limits appropriate for your cluster

### Configuration
- [ ] Namespace created
- [ ] Storage classes specified
- [ ] Resource requests and limits set
- [ ] Replica counts appropriate
- [ ] Autoscaling configured
- [ ] Pod Disruption Budgets enabled

### Application Configuration
- [ ] Backend environment variables set
- [ ] Frontend API URL configured correctly
- [ ] MongoDB connection string correct
- [ ] Database name specified
- [ ] CORS origins configured

## High Availability

### Replicas and Scaling
- [ ] Backend: minimum 2 replicas
- [ ] Frontend: minimum 2 replicas
- [ ] MongoDB: minimum 3 replicas (for production)
- [ ] HPA (Horizontal Pod Autoscaler) enabled
- [ ] HPA thresholds appropriate
- [ ] Pod Disruption Budgets configured

### Health Checks
- [ ] Liveness probes configured
- [ ] Readiness probes configured
- [ ] Probe thresholds appropriate
- [ ] Health check endpoints working

### Database
- [ ] MongoDB replicas configured (minimum 3)
- [ ] MongoDB storage persistent and backed up
- [ ] Database indexes created
- [ ] Backup strategy implemented
- [ ] Database recovery tested

## Monitoring and Logging

### Observability
- [ ] Logging configured
- [ ] Log aggregation setup (optional)
- [ ] Application metrics exposed
- [ ] Prometheus configured (optional)
- [ ] Grafana dashboards created (optional)
- [ ] Alerting rules configured (optional)

### Backup and Disaster Recovery
- [ ] Database backups automated
- [ ] Backup retention policy defined
- [ ] Backup restore tested
- [ ] Disaster recovery plan documented
- [ ] Recovery time objective (RTO) defined
- [ ] Recovery point objective (RPO) defined

## Ingress and Networking

### Service Exposure
- [ ] Frontend service type configured
- [ ] Backend service type configured
- [ ] LoadBalancer external IP obtained (if applicable)
- [ ] DNS records created
- [ ] Service ports correct

### Ingress (if enabled)
- [ ] Ingress controller installed
- [ ] Ingress resource created
- [ ] TLS certificates configured
- [ ] DNS pointing to ingress
- [ ] SSL/TLS working
- [ ] CORS headers configured

## Pre-Production Testing

### Functionality Testing
- [ ] Frontend loads correctly
- [ ] Backend API responds to requests
- [ ] Authentication works
- [ ] Database operations functional
- [ ] All endpoints tested
- [ ] Error handling works
- [ ] File uploads work (if applicable)

### Performance Testing
- [ ] Load testing performed
- [ ] Response times acceptable
- [ ] Memory usage within limits
- [ ] CPU usage within limits
- [ ] Database query performance acceptable
- [ ] Autoscaling triggers at expected load

### Security Testing
- [ ] HTTPS/TLS verification
- [ ] Authentication testing
- [ ] Authorization testing
- [ ] Input validation testing
- [ ] CORS testing
- [ ] Security headers present

## Deployment Process

### Pre-Deployment
- [ ] Backup existing data (if upgrading)
- [ ] Have rollback plan ready
- [ ] Team notified of deployment
- [ ] Maintenance window scheduled (if needed)

### Deployment
- [ ] Run deployment script: `./scripts/deploy.sh`
- [ ] Monitor rollout progress
- [ ] Verify all pods running
- [ ] Check logs for errors
- [ ] Verify services accessible
- [ ] Test all endpoints

### Post-Deployment
- [ ] Run smoke tests
- [ ] Verify all features working
- [ ] Check monitoring/logging
- [ ] Monitor resource usage
- [ ] Review application logs
- [ ] Notify stakeholders

## Production Hardening

### Performance Optimization
- [ ] Resource limits tuned
- [ ] Memory limits set appropriately
- [ ] CPU limits set appropriately
- [ ] Image pull policy optimized
- [ ] Container startup time acceptable
- [ ] Database query optimization done

### Security Hardening
- [ ] Security context configured
- [ ] Read-only root filesystem (where possible)
- [ ] Non-root user configured
- [ ] Secrets rotation schedule
- [ ] Regular security updates planned
- [ ] Vulnerability scanning scheduled

### Reliability
- [ ] Health checks configured
- [ ] Pod disruption budgets set
- [ ] Anti-affinity rules (optional)
- [ ] Node affinity configured (optional)
- [ ] Resource quotas set
- [ ] Network policies enforced

## Post-Deployment Monitoring

### First Week
- [ ] Daily log reviews
- [ ] Resource usage monitoring
- [ ] Performance metrics tracking
- [ ] Error rate monitoring
- [ ] User feedback collection

### Ongoing
- [ ] Weekly metric reviews
- [ ] Monthly performance analysis
- [ ] Quarterly security audits
- [ ] Backup verification
- [ ] Disaster recovery drills

## Documentation

- [ ] Deployment procedure documented
- [ ] Configuration documented
- [ ] Runbooks created
- [ ] Troubleshooting guide prepared
- [ ] Rollback procedure documented
- [ ] Incident response plan created
- [ ] Team trained on procedures

## Sign-off

- [ ] Tech Lead approval
- [ ] Security team approval
- [ ] DevOps team approval
- [ ] Product owner approval
- [ ] Deployment date confirmed

---

## After Deployment - First 24 Hours Monitoring

1. Check pod status every hour
2. Review error logs periodically
3. Monitor resource usage trends
4. Test critical user flows
5. Monitor external monitoring systems
6. Be ready to rollback if needed

## Rollback Plan

If issues arise:

```bash
# Quick rollback using Helm
helm rollback workout-planner

# Or revert to specific previous version
helm rollback workout-planner 2

# Verify rollback
helm status workout-planner
kubectl get pods -n workout-planner
```

## Support Contacts

- Kubernetes Cluster Admin: _______________
- Database Admin: _______________
- Security Team: _______________
- On-call Engineer: _______________
- Product Manager: _______________

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Environment:** _______________
**Version:** _______________
