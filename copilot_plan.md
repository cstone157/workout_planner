# Project Architecture Plan

## 1. Components

- `rustdb-backend`
  - Rust-based API/service
  - Exposes HTTP/GRPC for frontend and MCP
  - Handles business logic, auth, routing, orchestration

- `mcp-service`
  - MCP-written control plane/service
  - Interfaces with the Rust backend and model/data layers
  - Manages prompts, session state, model invocation, and query flow

- `chroma-db`
  - Chroma vector database container
  - Stores embeddings, retrieval data, semantic search indices

- `ollama`
  - Ollama model server container
  - Hosts LLMs for inference
  - Receives requests from MCP/service and returns model completions

- `svelte-frontend`
  - Svelte app container
  - UI for users to interact with the system
  - Talks to `rustdb-backend` via HTTP or websocket

---

## Project Directory Layout

The repository can be organized as follows:

```
/workout_planner
├── backend/
│   ├── Dockerfile
│   └── src/
├── mcp-service/
│   ├── Dockerfile
│   └── src/
├── frontend/
│   ├── Dockerfile
│   └── src/
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── networkpolicy.yaml
│   ├── pvc-chroma.yaml
│   ├── rustdb-backend-deployment.yaml
│   ├── mcp-service-deployment.yaml
│   ├── chroma-db-statefulset.yaml
│   ├── ollama-deployment.yaml
│   ├── svelte-frontend-deployment.yaml
│   └── ingress.yaml
├── copilot_plan.md
└── Readme.md
```

---

## 2. Containerization

- Each component runs in its own container image
- Example image names:
  - `project/rustdb-backend`
  - `project/mcp-service`
  - `project/chroma-db`
  - `project/ollama`
  - `project/svelte-frontend`

- Recommended base images:
  - `rustdb-backend`: `FROM rust:latest`
  - `mcp-service`: base image for MCP runtime
  - `chroma-db`: official Chroma image or custom wrapper
  - `ollama`: official Ollama image
  - `svelte-frontend`: `FROM node:current-alpine`

---

## 3. Kubernetes Deployment

- Use a dedicated namespace, for example `workout-planner`
- Deploy each component as its own `Deployment` or `StatefulSet`
- Expose internal services with `ClusterIP`
- Expose UI/API externally via `Ingress`

Suggested service structure:
- `rustdb-backend-svc` → `ClusterIP`
- `mcp-service-svc` → `ClusterIP`
- `chroma-db-svc` → `ClusterIP`
- `ollama-svc` → `ClusterIP`
- `svelte-frontend-svc` → `ClusterIP` plus `Ingress`

Resource mapping:
- `rustdb-backend` → `Deployment`, `Service`
- `mcp-service` → `Deployment`, `Service`
- `chroma-db` → `StatefulSet` or `Deployment` + `PersistentVolumeClaim`
- `ollama` → `Deployment`, `Service`
- `svelte-frontend` → `Deployment`, `Service`, `Ingress`

---

## 4. Data Flow

1. User interacts with `svelte-frontend`
2. Frontend sends requests to `rustdb-backend`
3. Backend performs business logic and forwards model-related tasks to `mcp-service`
4. `mcp-service` decides whether to query:
   - `chroma-db` for retrieval/embeddings
   - `ollama` for generation/inference
5. Results propagate back through `rustdb-backend` to frontend

---

## 5. Storage & Persistence

- `chroma-db`
  - Use a `PersistentVolumeClaim` for Chroma data
  - Ensure data persists across pod restarts

- `ollama`
  - If local models are stored, use PVC for model weights
  - Otherwise use an external model registry or mounted storage

- `rustdb-backend` / `mcp-service`
  - Use `ConfigMap` / `Secret` for config and credentials
  - Keep pods stateless when possible

---

## 6. Configuration & Secrets

- Use `ConfigMap` for:
  - service endpoints
  - feature flags
  - application settings

- Use `Secret` for:
  - API keys
  - database credentials
  - Ollama or Chroma tokens

- Prefer environment variables in Kubernetes manifests

---

## 7. Networking & Security

- Use `NetworkPolicy` to limit traffic:
  - Allow frontend → backend
  - Allow backend → MCP
  - Allow MCP → Chroma, Ollama
  - Deny unnecessary cross-component access

- Use TLS for external traffic via `Ingress`
- Use RBAC when cluster security is required

---

## 8. Observability

- Add readiness/liveness probes for:
  - `rustdb-backend`
  - `mcp-service`
  - `chroma-db`
  - `ollama`
  - `svelte-frontend`

- Export logs and metrics:
  - stdout/stderr logging from containers
  - optional Prometheus metrics endpoints in backend/MCP
  - tracing for request flow if needed

---

## 9. CI/CD and Deployment Strategy

- Build each container image independently
- Push to a container registry
- Deploy with:
  - plain Kubernetes manifests
  - or Helm chart
  - or Kustomize overlays (dev/prod)

Suggested pipeline stages:
1. build
2. test
3. scan
4. push images
5. deploy to Kubernetes

---

## 10. Recommended Next Steps

1. Define interfaces and API contracts between:
   - frontend ↔ backend
   - backend ↔ MCP
   - MCP ↔ Chroma/Ollama
2. Create Dockerfiles for each component
3. Author Kubernetes manifests / Helm charts
4. Set up a development namespace and local cluster
5. Validate end-to-end flow with sample data
