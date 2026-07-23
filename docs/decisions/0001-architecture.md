# ADR 0001: Monorepo with a modular monolith

- Status: Accepted
- Date: 2026-07-22

## Context

Vita AI combines tightly related health domains that share identity, consent, goals, and recommendation data. The initial team needs transactional consistency and rapid iteration more than independent service scaling. Image and model workloads have a distinct Python toolchain.

## Decision

Use a pnpm/Turborepo monorepo. The NestJS API is a modular monolith with domain modules and explicit service boundaries. The FastAPI AI service is separate because its runtime, dependencies, scaling, and safety controls differ. Shared transport contracts live in Zod-backed TypeScript packages. PostgreSQL is the system of record, Redis supports ephemeral coordination, and S3-compatible storage holds private objects.

## Consequences

- Domain changes can be atomic and refactored without distributed transactions.
- Shared tooling and contracts reduce drift across the mobile and API apps.
- Module boundaries must be enforced in code reviews to prevent a coupled “big ball of mud.”
- A domain may be extracted later only when measured scaling or ownership needs justify it.
- The Python boundary uses HTTP/OpenAPI contracts rather than shared runtime types.

## Phase 0 assumptions

- Local credentials are development-only and are never suitable for deployed environments.
- Phase 0 has infrastructure connectivity checks but no production data models or user features.
- MinIO is the local S3-compatible emulator.
- Node 22 and Python 3.12 are the supported CI baselines; Expo development uses a local Node process.
- OpenAPI client generation is represented by a typed client boundary now and will be wired to generated operation types when feature endpoints arrive.
