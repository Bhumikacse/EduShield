# 001 - Modular Monolith Architecture

## Context
EduShield is a hackathon project with a tight deadline. We need a robust, maintainable architecture that allows rapid development of frontend, backend, and machine learning components.

## Decision
We will use a modular monolith instead of microservices. The FastAPI backend will handle all APIs and incorporate ML predictions directly or via a tightly-coupled module, rather than standing up independent ML prediction services. 

## Consequences
- **Pros**: Reduced infrastructure overhead, simpler local development, no complex orchestration (e.g., Kubernetes or Docker Compose requirements), easier debugging.
- **Cons**: Less scalable for massive user bases (acceptable given this is an MVP hackathon project).
