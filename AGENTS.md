# HACKVERSE ’26 — PROJECT AGENT FOUNDATION

## Project

**EduShield**

AI-Based College Dropout Prediction & Counseling System.

## Purpose

The system identifies college students showing elevated risk of:

1. Permanent withdrawal
2. Non-enrollment in the next academic period

It then:

1. Explains the risk factors
2. Helps counselors choose interventions
3. Provides student support
4. Tracks intervention outcomes

Core product loop:

**Detect → Explain → Intervene → Support → Follow Up**

## MVP Scope

### Required

* College student data
* Dropout/non-enrollment risk prediction
* Low/Medium/High risk classification
* Risk trajectory
* Explainable risk factors
* Counselor dashboard
* Student risk profile
* Intervention recommendations
* Counselor intervention creation
* Student support page
* Counseling request
* Intervention follow-up/outcome

### Explicitly out of scope for MVP

* Pan-India government platform
* State-level government analytics
* Public college rankings
* Mobile application
* ERP integration
* LMS integration
* University portal integration
* Production-scale notification infrastructure
* Advanced autonomous counseling
* Advanced intervention prediction
* Large-scale real-world deployment

## Development Priorities

Always prioritize:

1. Correctness
2. Working end-to-end functionality
3. Explainability
4. User experience
5. Responsible AI
6. Maintainability
7. Performance

Do NOT optimize for architectural complexity.

Prefer a simple working implementation over an elaborate architecture.

Do not introduce unnecessary frameworks, services, dependencies, microservices, or infrastructure.

## Data Principles

The MVP may use synthetic/demo data.

Synthetic data must always be clearly identified as synthetic/demo data.

Do not present synthetic model performance as real-world validated performance.

Do not invent claims about actual dropout rates.

Use the minimum data necessary.

Avoid unnecessary sensitive personal information.

Do not automatically use sensitive/protected characteristics as predictive features.

## AI Principles

The model predicts **risk**, not certainty.

Never describe:
> "This student will drop out."

Prefer:
> "This student is showing an elevated dropout-risk pattern."

The system is decision support.
It does not replace counselors.
The counselor remains responsible for intervention decisions.

Risk predictions should be explainable where possible.
The system should consider trends and changes over time rather than relying only on static values.

## Student Safety / UX

Never unnecessarily expose a student to a stigmatizing dropout prediction.

The student-facing interface should focus on:
* support
* resources
* progress
* intervention
* counseling

The exact numerical dropout probability should primarily remain on the counselor/institution side.

Do not present the AI as a licensed therapist or mental-health professional.
Sensitive or serious issues should be routed toward appropriate human support.

## Coding Rules

Before changing code:
1. Inspect existing implementation.
2. Reuse existing components/utilities where appropriate.
3. Do not rewrite functioning code without a reason.
4. Keep changes focused.
5. Avoid duplicated logic.
6. Use clear names.
7. Keep types/interfaces explicit where applicable.
8. Keep configuration separate from source code.
9. Never hardcode credentials or secrets.
10. Never commit secrets.

Follow the existing repository's formatting, linting, testing, and naming conventions where they exist.

## Dependency Rule

Before installing a new dependency:
* Check whether an existing dependency already solves the problem.
* Prefer established project dependencies.
* Add a new dependency only when it provides meaningful value.
* Avoid unnecessary packages because this is a hackathon project with a strict deadline.

## Architecture

Preferred architecture if the repository does not already dictate another:

Frontend:
* React
* Vite
* TypeScript
* Tailwind CSS

Backend:
* Python
* FastAPI

ML:
* Python
* scikit-learn
* XGBoost where justified
* SHAP where practical

Database:
* PostgreSQL / Supabase-compatible

However:
**Existing repository architecture takes precedence over these preferences unless there is a strong technical reason to change it.**
Do not create parallel architectures.

## Development Workflow

For every major task:
1. Inspect existing implementation.
2. Plan the smallest reasonable change.
3. Implement.
4. Run relevant tests/checks.
5. Verify the feature actually works.
6. Report what changed.
7. Identify assumptions or unresolved issues.

Do not silently work around errors.
Do not hide failing tests.
Do not claim something works unless it has actually been verified.

## Hackathon Time Management

The submission deadline is **31 August 2026 at 3 PM**.

This project is a prototype.
Feature priorities:

### P0 — Must work
* Prediction
* Risk explanation
* Counselor dashboard
* Student profile
* Intervention recommendation
* Intervention creation

### P1 — Should work
* Student support
* Counseling request
* Follow-up/outcome

### P2 — Only if time remains
* Basic AI support assistant
* Institution-level aggregate analytics

Future features like State dashboard, Government dashboard, etc., are out of scope for MVP. Do not sacrifice P0 functionality for P2 features.

## Future Features

The following are product vision only unless explicitly moved into MVP scope:
* State-level education intelligence
* Pan-India education intelligence
* Government dashboards
* Aggregated college analytics
* College benchmarking
* ERP/LMS integrations
* Automated data ingestion
* Multilingual support
* Mobile applications
* Advanced intervention recommendation models
* Fairness/bias monitoring infrastructure
* Large-scale deployment

Future features should not be implemented accidentally while working on the MVP.

## Documentation

Keep the project documentation accurate.

Document:
* Architecture
* Data assumptions
* Model assumptions
* Synthetic-data limitations
* API contracts
* Setup instructions
* Known limitations

Do not add marketing claims to technical documentation.

## Final Rule

Every future agent/developer working on this repository must:

**Read `AGENTS.md` before making significant changes.**

The instructions in `AGENTS.md` should be treated as project-level development rules.
