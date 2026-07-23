# Phase 0 — Repository foundation

## Scope and affected packages

- `apps/mobile`: Expo Router shell and API connectivity state
- `apps/api`: NestJS service, health/readiness endpoints, PostgreSQL and Redis probes
- `apps/ai-service`: FastAPI health/readiness service
- `packages/types`: transport types
- `packages/validation`: shared Zod response schemas
- `packages/config`: validated API environment
- `packages/api-client`: typed health client
- Root infrastructure, CI, linting, formatting, and documentation

## Checklist

- [x] Record architecture and assumptions
- [x] Create pnpm/Turborepo workspace
- [x] Add strict TypeScript and formatting conventions
- [x] Add Expo Router mobile shell
- [x] Add NestJS API shell and typed health endpoints
- [x] Add FastAPI service health endpoints
- [x] Add PostgreSQL, Redis, and MinIO Compose services
- [x] Add environment templates and validation
- [x] Add unit tests and CI workflow
- [ ] Validate Docker startup locally (Docker unavailable on authoring machine)
- [ ] Validate Python tests locally (Python unavailable on authoring machine)

## Security and privacy review

No user or health data is handled in Phase 0. Environment files are ignored, example secrets are explicitly local-only, service containers run unprivileged where supported, and health failures return component state without credentials or stack traces.

## Manual verification

1. Copy `.env.example` to `.env`.
2. Run `pnpm start:local`.
3. Open `http://localhost:3000/v1/health` and `http://localhost:8000/health`.
4. Run `pnpm --filter @vita/mobile start` and confirm the API status card reports connected.

## Rollback

Phase 0 creates no database migrations or persistent application schema. Stop containers with `pnpm infra:down`; add `--volumes` only when intentionally discarding local infrastructure data.
